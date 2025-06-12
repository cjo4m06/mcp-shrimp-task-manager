/**
 * 团队协作任务生成工具
 * 基于 PRD 文档生成针对不同岗位的专业化任务
 * 这是我们的核心差异化功能：团队协作导向的任务生成
 */

import { z } from 'zod';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  createPRDProcessor,
  generateTeamTasks,
  formatTaskSummary,
  exportTasksToMarkdown,
  exportTasksToJSON,
  validateTaskDependencies,
  TeamRole,
} from '../../prd/index.js';
import { getProjectContext } from '../../utils/projectDetector.js';

// 输入参数验证
const GenerateTeamTasksSchema = z.object({
  prdContent: z.string().min(100).describe('PRD 文档内容，至少100个字符'),
  targetRoles: z.array(z.string()).optional().describe('目标角色列表，如果不指定则使用核心角色'),
  outputFormat: z.enum(['summary', 'markdown', 'json']).default('summary').describe('输出格式'),
  includeWorkflow: z.boolean().default(true).describe('是否包含工作流信息'),
  validateDependencies: z.boolean().default(true).describe('是否验证任务依赖关系'),
});

type GenerateTeamTasksInput = z.infer<typeof GenerateTeamTasksSchema>;

/**
 * 生成团队协作任务
 */
export async function generateTeamCollaborationTasks(args: GenerateTeamTasksInput) {
  try {
    // 验证输入参数
    const validatedArgs = GenerateTeamTasksSchema.parse(args);
    const { prdContent, targetRoles, outputFormat, includeWorkflow, validateDependencies } = validatedArgs;

    // 获取项目上下文
    const projectContext = await getProjectContext();

    console.log(`🚀 开始为项目 "${projectContext.projectName}" 生成团队协作任务...`);

    // 转换角色字符串为 TeamRole 类型
    const roles = targetRoles?.map((role) => role as TeamRole);

    // 生成团队任务
    const taskSet = await generateTeamTasks(prdContent, roles);

    console.log(`✅ 任务生成完成！共生成 ${taskSet.metadata.totalTasks} 个任务`);

    // 验证任务依赖关系
    let validationResult;
    if (validateDependencies) {
      validationResult = validateTaskDependencies(taskSet);
      if (!validationResult.valid) {
        console.warn(`⚠️ 发现 ${validationResult.errors.length} 个依赖错误`);
      }
      if (validationResult.warnings.length > 0) {
        console.warn(`⚠️ 发现 ${validationResult.warnings.length} 个依赖警告`);
      }
    }

    // 生成统计信息
    const stats = {
      totalTasks: taskSet.metadata.totalTasks,
      totalHours: Object.values(taskSet.roleBasedTasks)
        .flat()
        .reduce((sum, task) => sum + task.estimatedHours, 0),
      roleCount: Object.keys(taskSet.roleBasedTasks).length,
      crossRoleTaskCount: taskSet.crossRoleTasks.length,
      milestoneCount: taskSet.milestones.length,
    };

    // 根据输出格式返回结果
    switch (outputFormat) {
      case 'summary':
        const summary = formatTaskSummary(taskSet);
        return {
          success: true,
          data: {
            summary,
            stats,
            validation: validationResult,
            workflow: includeWorkflow ? taskSet.workflow : undefined,
          },
        };

      case 'markdown':
        const markdown = exportTasksToMarkdown(taskSet);
        return {
          success: true,
          data: {
            markdown,
            stats,
            validation: validationResult,
            workflow: includeWorkflow ? taskSet.workflow : undefined,
          },
        };

      case 'json':
        return {
          success: true,
          data: {
            taskSet: JSON.parse(exportTasksToJSON(taskSet)),
            stats,
            validation: validationResult,
            workflow: includeWorkflow ? taskSet.workflow : undefined,
          },
        };

      default:
        throw new Error(`不支持的输出格式: ${outputFormat}`);
    }
  } catch (error) {
    console.error('❌ 生成团队协作任务失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 工具定义
export const generateTeamCollaborationTasksTool = {
  name: 'generate_team_collaboration_tasks',
  description: `基于 PRD 文档生成团队协作任务的专业化工具。

这是我们的核心差异化功能，专注于团队协作导向的任务生成：

🎯 **核心特色**：
- 针对不同岗位生成专业化任务
- 自动识别跨角色协作需求
- 生成完整的工作流和交接点
- 智能依赖关系管理

👥 **支持角色**：
- product-manager (产品经理)
- ui-designer (UI设计师)
- ux-designer (UX设计师)
- frontend-developer (前端开发)
- backend-developer (后端开发)
- fullstack-developer (全栈开发)
- mobile-developer (移动开发)
- qa-engineer (测试工程师)
- devops-engineer (DevOps工程师)
- tech-lead (技术负责人)
- project-manager (项目经理)

📋 **输出内容**：
- 角色专业化任务清单
- 跨角色协作任务
- 项目里程碑
- 工作流阶段和关键路径
- 任务依赖关系图
- 团队交接点

💡 **使用场景**：
- 新项目启动时的任务规划
- 团队协作流程优化
- 项目管理和进度跟踪
- 角色职责明确化

与传统任务管理工具不同，我们专注于团队协作的专业化和系统化。`,
  inputSchema: GenerateTeamTasksSchema,
};
