/**
 * PRD 系统工具函数
 * 提供便捷的 PRD 处理和任务生成功能
 */

import { PRDParser } from './parser.js';
import { TeamCollaborativeTaskGenerator } from './generator.js';
import { RoleDefinitions } from './roles/RoleDefinitions.js';
import {
  PRDDocument,
  GeneratedTaskSet,
  TeamRole,
  PRDParsingOptions,
  TaskGenerationOptions,
  ProjectComplexity,
  TeamComposition,
  RoleTask,
} from './types.js';

/**
 * 创建 PRD 处理器
 * @param parsingOptions 解析选项
 * @param generationOptions 生成选项
 * @returns PRD 处理器实例
 */
export function createPRDProcessor(
  parsingOptions?: Partial<PRDParsingOptions>,
  generationOptions?: Partial<TaskGenerationOptions>
) {
  const parser = new PRDParser(parsingOptions);
  const generator = new TeamCollaborativeTaskGenerator(generationOptions);

  return {
    parser,
    generator,

    /**
     * 处理 PRD 并生成团队任务
     * @param prdContent PRD 内容
     * @param metadata 可选的元数据
     * @returns 生成的任务集
     */
    async processPRD(
      prdContent: string,
      metadata?: any
    ): Promise<{
      document: PRDDocument;
      taskSet: GeneratedTaskSet;
    }> {
      const document = await parser.parseDocument(prdContent, metadata);
      const taskSet = await generator.generateTaskSet(document);

      return { document, taskSet };
    },
  };
}

/**
 * 快速生成团队任务
 * @param prdContent PRD 内容
 * @param targetRoles 目标角色
 * @returns 生成的任务集
 */
export async function generateTeamTasks(prdContent: string, targetRoles?: TeamRole[]): Promise<GeneratedTaskSet> {
  const processor = createPRDProcessor(
    { includeAnalysis: true },
    { targetRoles: targetRoles || RoleDefinitions.getCoreRoles() }
  );

  const result = await processor.processPRD(prdContent);
  return result.taskSet;
}

/**
 * 分析 PRD 复杂度
 * @param prdContent PRD 内容
 * @returns 复杂度分析结果
 */
export async function analyzePRDComplexity(prdContent: string): Promise<ProjectComplexity> {
  const parser = new PRDParser({ includeAnalysis: true });
  const document = await parser.parseDocument(prdContent);

  if (!document.analysis) {
    throw new Error('Analysis not available');
  }

  return document.analysis.complexity;
}

/**
 * 推荐团队组成
 * @param prdContent PRD 内容
 * @returns 团队组成建议
 */
export async function recommendTeamComposition(prdContent: string): Promise<TeamComposition> {
  const parser = new PRDParser({ includeAnalysis: true });
  const document = await parser.parseDocument(prdContent);

  if (!document.analysis) {
    throw new Error('Analysis not available');
  }

  return document.analysis.recommendedTeam;
}

/**
 * 格式化任务摘要
 * @param taskSet 任务集
 * @returns 格式化的摘要
 */
export function formatTaskSummary(taskSet: GeneratedTaskSet): string {
  let summary = `# 团队协作任务摘要\n\n`;
  summary += `**项目**: ${taskSet.metadata.prdId}\n`;
  summary += `**生成时间**: ${taskSet.metadata.generatedAt.toLocaleString()}\n`;
  summary += `**总任务数**: ${taskSet.metadata.totalTasks}\n`;
  summary += `**预估工期**: ${taskSet.metadata.estimatedDuration}\n`;
  summary += `**涉及角色**: ${taskSet.metadata.involvedRoles.length}个\n\n`;

  // 按角色统计任务
  summary += `## 角色任务分布\n\n`;
  for (const [role, tasks] of Object.entries(taskSet.roleBasedTasks)) {
    const roleDefinition = RoleDefinitions.getRoleDefinition(role as TeamRole);
    const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);

    summary += `### ${roleDefinition.name.zh} (${role})\n`;
    summary += `- 任务数量: ${tasks.length}\n`;
    summary += `- 预估工时: ${totalHours}小时\n`;
    summary += `- 主要职责: ${roleDefinition.responsibilities.slice(0, 3).join('、')}\n\n`;
  }

  // 跨角色协作任务
  if (taskSet.crossRoleTasks.length > 0) {
    summary += `## 跨角色协作任务\n\n`;
    taskSet.crossRoleTasks.forEach((task) => {
      summary += `- **${task.title}**: ${task.description}\n`;
      summary += `  - 涉及角色: ${task.involvedRoles.join('、')}\n`;
      summary += `  - 协调者: ${task.coordinator}\n\n`;
    });
  }

  // 里程碑
  if (taskSet.milestones.length > 0) {
    summary += `## 项目里程碑\n\n`;
    taskSet.milestones.forEach((milestone) => {
      summary += `- **${milestone.name}**: ${milestone.description}\n`;
      summary += `  - 验收标准: ${milestone.criteria.join('、')}\n\n`;
    });
  }

  return summary;
}

/**
 * 导出任务为 JSON 格式
 * @param taskSet 任务集
 * @returns JSON 字符串
 */
export function exportTasksToJSON(taskSet: GeneratedTaskSet): string {
  return JSON.stringify(taskSet, null, 2);
}

/**
 * 导出任务为 Markdown 格式
 * @param taskSet 任务集
 * @returns Markdown 字符串
 */
export function exportTasksToMarkdown(taskSet: GeneratedTaskSet): string {
  let markdown = `# ${taskSet.metadata.prdId} - 团队协作任务清单\n\n`;

  // 元数据
  markdown += `## 项目信息\n\n`;
  markdown += `- **生成时间**: ${taskSet.metadata.generatedAt.toLocaleString()}\n`;
  markdown += `- **总任务数**: ${taskSet.metadata.totalTasks}\n`;
  markdown += `- **预估工期**: ${taskSet.metadata.estimatedDuration}\n`;
  markdown += `- **涉及角色**: ${taskSet.metadata.involvedRoles.join('、')}\n\n`;

  // 角色任务
  for (const [role, tasks] of Object.entries(taskSet.roleBasedTasks)) {
    const roleDefinition = RoleDefinitions.getRoleDefinition(role as TeamRole);

    markdown += `## ${roleDefinition.name.zh} 任务清单\n\n`;

    tasks.forEach((task) => {
      markdown += `### ${task.title}\n\n`;
      markdown += `- **任务ID**: ${task.id}\n`;
      markdown += `- **描述**: ${task.description}\n`;
      markdown += `- **优先级**: ${task.priority}\n`;
      markdown += `- **预估工时**: ${task.estimatedHours}小时\n`;
      markdown += `- **复杂度**: ${task.complexity}\n`;
      markdown += `- **技能要求**: ${task.skills.join('、')}\n`;
      markdown += `- **交付物**: ${task.deliverables.join('、')}\n`;

      if (task.dependencies.length > 0) {
        markdown += `- **依赖任务**: ${task.dependencies.join('、')}\n`;
      }

      if (task.collaboratesWith.length > 0) {
        markdown += `- **协作角色**: ${task.collaboratesWith.join('、')}\n`;
      }

      markdown += `\n**验收标准**:\n`;
      task.acceptanceCriteria.forEach((criteria) => {
        markdown += `- ${criteria}\n`;
      });

      markdown += `\n---\n\n`;
    });
  }

  // 跨角色任务
  if (taskSet.crossRoleTasks.length > 0) {
    markdown += `## 跨角色协作任务\n\n`;

    taskSet.crossRoleTasks.forEach((task) => {
      markdown += `### ${task.title}\n\n`;
      markdown += `- **任务ID**: ${task.id}\n`;
      markdown += `- **描述**: ${task.description}\n`;
      markdown += `- **涉及角色**: ${task.involvedRoles.join('、')}\n`;
      markdown += `- **协调者**: ${task.coordinator}\n`;
      markdown += `- **类型**: ${task.type}\n`;
      markdown += `- **预估工时**: ${task.estimatedHours}小时\n`;
      markdown += `- **交付物**: ${task.deliverables.join('、')}\n\n`;
      markdown += `---\n\n`;
    });
  }

  // 里程碑
  if (taskSet.milestones.length > 0) {
    markdown += `## 项目里程碑\n\n`;

    taskSet.milestones.forEach((milestone) => {
      markdown += `### ${milestone.name}\n\n`;
      markdown += `- **描述**: ${milestone.description}\n`;
      markdown += `- **涉及角色**: ${milestone.involvedRoles.join('、')}\n`;
      markdown += `- **交付物**: ${milestone.deliverables.join('、')}\n`;

      markdown += `\n**完成标准**:\n`;
      milestone.criteria.forEach((criteria) => {
        markdown += `- ${criteria}\n`;
      });

      markdown += `\n---\n\n`;
    });
  }

  return markdown;
}

/**
 * 验证任务依赖关系
 * @param taskSet 任务集
 * @returns 验证结果
 */
export function validateTaskDependencies(taskSet: GeneratedTaskSet): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 收集所有任务ID
  const allTaskIds = new Set<string>();
  Object.values(taskSet.roleBasedTasks)
    .flat()
    .forEach((task) => {
      allTaskIds.add(task.id);
    });
  taskSet.crossRoleTasks.forEach((task) => {
    allTaskIds.add(task.id);
  });

  // 验证角色任务的依赖
  Object.values(taskSet.roleBasedTasks)
    .flat()
    .forEach((task) => {
      task.dependencies.forEach((depId) => {
        if (!allTaskIds.has(depId)) {
          errors.push(`任务 ${task.id} 依赖的任务 ${depId} 不存在`);
        }
      });

      task.blockedBy.forEach((blockerId) => {
        if (!allTaskIds.has(blockerId)) {
          errors.push(`任务 ${task.id} 被不存在的任务 ${blockerId} 阻塞`);
        }
      });

      task.blocks.forEach((blockedId) => {
        if (!allTaskIds.has(blockedId)) {
          warnings.push(`任务 ${task.id} 阻塞的任务 ${blockedId} 不存在`);
        }
      });
    });

  // 验证跨角色任务的依赖
  taskSet.crossRoleTasks.forEach((task) => {
    task.dependencies.forEach((depId) => {
      if (!allTaskIds.has(depId)) {
        errors.push(`跨角色任务 ${task.id} 依赖的任务 ${depId} 不存在`);
      }
    });
  });

  // 检查循环依赖
  const circularDeps = detectCircularDependencies(taskSet);
  if (circularDeps.length > 0) {
    errors.push(`检测到循环依赖: ${circularDeps.join(' -> ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 检测循环依赖
 * @param taskSet 任务集
 * @returns 循环依赖路径
 */
function detectCircularDependencies(taskSet: GeneratedTaskSet): string[] {
  const allTasks = Object.values(taskSet.roleBasedTasks).flat();
  const taskMap = new Map(allTasks.map((task) => [task.id, task]));
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(taskId: string, path: string[]): string[] {
    if (recursionStack.has(taskId)) {
      return [...path, taskId];
    }

    if (visited.has(taskId)) {
      return [];
    }

    visited.add(taskId);
    recursionStack.add(taskId);

    const task = taskMap.get(taskId);
    if (task) {
      for (const depId of task.dependencies) {
        const cyclePath = hasCycle(depId, [...path, taskId]);
        if (cyclePath.length > 0) {
          return cyclePath;
        }
      }
    }

    recursionStack.delete(taskId);
    return [];
  }

  for (const task of allTasks) {
    if (!visited.has(task.id)) {
      const cyclePath = hasCycle(task.id, []);
      if (cyclePath.length > 0) {
        return cyclePath;
      }
    }
  }

  return [];
}
