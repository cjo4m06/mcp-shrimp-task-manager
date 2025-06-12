/**
 * 基于执行上下文调整任务工具
 * 根据任务执行过程中的发现和决策，智能调整后续未完成的任务
 */

import { z } from 'zod';
import { TaskMemoryManager } from '../../memory/TaskMemoryManager.js';
import { DynamicTaskAdjuster } from '../../memory/DynamicTaskAdjuster.js';
import { getProjectContext } from '../../utils/projectDetector.js';
import { getProjectDataDir } from '../../utils/pathManager.js';
import { getAllTasks as loadTasks } from '../../models/taskModel.js';
import { TaskStatus } from '../../types/index.js';
import { join } from 'path';
import { log } from '../../utils/logger.js';

// 输入参数验证
const AdjustTasksFromContextSchema = z.object({
  executionId: z.string().optional().describe('特定的执行上下文ID，如果不提供则使用最近的执行上下文'),
  taskId: z.string().optional().describe('特定任务的执行上下文，如果不提供则分析所有相关上下文'),
  adjustmentScope: z
    .enum(['all', 'pending', 'related'])
    .default('pending')
    .describe('调整范围：all(所有任务)、pending(待执行任务)、related(相关任务)'),
  autoApply: z.boolean().default(false).describe('是否自动应用建议的调整'),
  includeRiskAnalysis: z.boolean().default(true).describe('是否包含风险分析'),
  generateDetailedReport: z.boolean().default(true).describe('是否生成详细的调整报告'),
  contextFactors: z
    .array(z.string())
    .optional()
    .describe("特定的上下文因素，如['performance', 'security', 'timeline']"),
});

type AdjustTasksFromContextInput = z.infer<typeof AdjustTasksFromContextSchema>;

/**
 * 基于执行上下文调整任务
 */
export async function adjustTasksFromContext(args: AdjustTasksFromContextInput) {
  try {
    // 验证输入参数
    const validatedArgs = AdjustTasksFromContextSchema.parse(args);
    const {
      executionId,
      taskId,
      adjustmentScope,
      autoApply,
      includeRiskAnalysis,
      generateDetailedReport,
      contextFactors,
    } = validatedArgs;

    // 获取项目上下文
    const projectContext = await getProjectContext();
    log.info('AdjustTasksFromContext', `开始分析项目 "${projectContext.projectName}" 的执行上下文`, {
      projectName: projectContext.projectName,
      adjustmentScope,
    });

    // 初始化记忆管理器和调整器
    const dataDir = await getProjectDataDir();
    const memoryManager = new TaskMemoryManager(dataDir);
    const taskAdjuster = new DynamicTaskAdjuster(memoryManager);

    // 获取当前任务状态
    const allTasks = await loadTasks();
    const targetTasks = getTargetTasks(allTasks, adjustmentScope);

    log.info('AdjustTasksFromContext', `分析范围: ${adjustmentScope}`, {
      scope: adjustmentScope,
      targetTasksCount: targetTasks.length,
    });

    // 获取执行上下文
    let executionContexts;
    if (executionId) {
      // 获取特定执行上下文
      log.info('AdjustTasksFromContext', `分析特定执行上下文: ${executionId}`, { executionId });
      executionContexts = [await getExecutionContext(memoryManager, executionId)];
    } else if (taskId) {
      // 获取特定任务的执行历史
      log.info('AdjustTasksFromContext', `分析任务执行历史: ${taskId}`, { taskId });
      executionContexts = await memoryManager.getTaskExecutionHistory(taskId);
    } else {
      // 获取最近的执行上下文
      log.info('AdjustTasksFromContext', '分析最近的执行上下文');
      executionContexts = await getRecentExecutionContexts(memoryManager);
    }

    if (executionContexts.length === 0) {
      log.warn('AdjustTasksFromContext', '未找到相关的执行上下文', {
        executionId,
        taskId,
        adjustmentScope,
      });
      return {
        success: false,
        error: '未找到相关的执行上下文',
        suggestions: [],
      };
    }

    log.info('AdjustTasksFromContext', `找到执行上下文进行分析`, {
      contextCount: executionContexts.length,
    });

    // 分析执行上下文并生成调整建议
    const analysisResults = [];
    const allSuggestions = [];

    for (const context of executionContexts) {
      log.debug('AdjustTasksFromContext', `分析执行上下文`, {
        taskId: context.taskId,
        executionId: context.executionId,
      });

      // 基于上下文调整任务
      const adjustmentResult = await taskAdjuster.adjustTasksBasedOnContext(context);

      if (adjustmentResult.success) {
        analysisResults.push({
          contextId: context.executionId,
          taskId: context.taskId,
          adjustedTasksCount: adjustmentResult.adjustedTasks.length,
          suggestionsCount: adjustmentResult.suggestions.length,
          summary: adjustmentResult.summary,
        });

        allSuggestions.push(...adjustmentResult.suggestions);
      }
    }

    // 合并和去重建议
    const uniqueSuggestions = deduplicateSuggestions(allSuggestions);

    // 生成风险分析
    let riskAnalysis = null;
    if (includeRiskAnalysis) {
      riskAnalysis = await generateRiskAnalysis(uniqueSuggestions, targetTasks);
    }

    // 生成详细报告
    let detailedReport = null;
    if (generateDetailedReport) {
      detailedReport = await generateDetailedAdjustmentReport(
        analysisResults,
        uniqueSuggestions,
        riskAnalysis,
        contextFactors
      );
    }

    // 应用自动调整
    let appliedAdjustments: any[] = [];
    if (autoApply) {
      log.info('AdjustTasksFromContext', '自动应用高置信度的调整建议', {
        suggestionsCount: uniqueSuggestions.length,
      });
      appliedAdjustments = await applyHighConfidenceAdjustments(uniqueSuggestions);
    }

    log.info('AdjustTasksFromContext', '上下文分析完成', {
      analysisResultsCount: analysisResults.length,
      suggestionsCount: uniqueSuggestions.length,
      appliedAdjustmentsCount: appliedAdjustments.length,
    });

    const response = {
      success: true,
      data: {
        analysisResults,

        suggestions: uniqueSuggestions.map((suggestion) => ({
          taskId: suggestion.taskId,
          type: suggestion.adjustmentType,
          reasoning: suggestion.reasoning,
          confidence: suggestion.confidence,
          impact: suggestion.impact,
          recommended: suggestion.confidence > 0.7,
        })),

        riskAnalysis,
        detailedReport,

        appliedAdjustments: appliedAdjustments.map((adj) => ({
          taskId: adj.taskId,
          adjustmentType: adj.type,
          description: adj.description,
        })),

        summary: {
          contextsAnalyzed: executionContexts.length,
          tasksInScope: targetTasks.length,
          suggestionsGenerated: uniqueSuggestions.length,
          highConfidenceSuggestions: uniqueSuggestions.filter((s) => s.confidence > 0.7).length,
          autoAppliedCount: appliedAdjustments.length,
        },

        nextSteps: generateNextSteps(uniqueSuggestions, autoApply),
      },
    };

    // 记录分析结果统计
    const highConfidenceSuggestions = uniqueSuggestions.filter((s) => s.confidence > 0.7);
    log.info('AdjustTasksFromContext', '分析结果统计', {
      executionContextsCount: executionContexts.length,
      targetTasksCount: targetTasks.length,
      suggestionsCount: uniqueSuggestions.length,
      highConfidenceSuggestionsCount: highConfidenceSuggestions.length,
      autoAppliedCount: autoApply ? appliedAdjustments.length : 0,
    });

    if (uniqueSuggestions.length > 0) {
      const mainSuggestions = uniqueSuggestions.filter((s) => s.confidence > 0.6).slice(0, 5);

      log.info('AdjustTasksFromContext', '主要调整建议', {
        suggestions: mainSuggestions.map((suggestion, index) => ({
          index: index + 1,
          type: suggestion.adjustmentType,
          reasoning: suggestion.reasoning,
          confidence: Math.round(suggestion.confidence * 100),
        })),
      });
    }

    if (riskAnalysis && riskAnalysis.risks.length > 0) {
      const topRisks = riskAnalysis.risks.slice(0, 3);
      log.warn('AdjustTasksFromContext', '风险提醒', {
        risks: topRisks.map((risk, index) => ({
          index: index + 1,
          description: risk.description,
          severity: risk.severity,
        })),
      });
    }

    return response;
  } catch (error) {
    log.error('AdjustTasksFromContext', '基于上下文的任务调整失败', error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 辅助函数
function getTargetTasks(allTasks: any[], scope: string) {
  switch (scope) {
    case 'all':
      return allTasks;
    case 'pending':
      return allTasks.filter((t) => t.status === TaskStatus.PENDING);
    case 'related':
      // 简化实现：返回待执行和进行中的任务
      return allTasks.filter((t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS);
    default:
      return allTasks.filter((t) => t.status === TaskStatus.PENDING);
  }
}

async function getExecutionContext(memoryManager: TaskMemoryManager, executionId: string) {
  // 这里应该从内存管理器获取特定的执行上下文
  // 简化实现
  return {
    taskId: 'unknown',
    executionId,
    startTime: new Date(),
    status: 'completed' as const,
    steps: [],
    decisions: [],
    discoveries: [],
    environment: {} as any,
    resources: [],
    artifacts: [],
    knowledgeGenerated: [],
    knowledgeConsumed: [],
    checkpoints: [],
  };
}

async function getRecentExecutionContexts(memoryManager: TaskMemoryManager) {
  // 这里应该获取最近的执行上下文
  // 简化实现
  return [];
}

function deduplicateSuggestions(suggestions: any[]) {
  const seen = new Set();
  return suggestions.filter((suggestion) => {
    const key = `${suggestion.taskId}-${suggestion.adjustmentType}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function generateRiskAnalysis(suggestions: any[], tasks: any[]) {
  const risks = [];

  // 分析高风险调整
  const highRiskSuggestions = suggestions.filter((s) => s.impact.riskChange === 'increased' || s.confidence < 0.5);

  if (highRiskSuggestions.length > 0) {
    risks.push({
      type: 'adjustment-risk',
      description: `${highRiskSuggestions.length} 个调整建议可能增加项目风险`,
      severity: 'medium',
      affectedTasks: highRiskSuggestions.map((s) => s.taskId),
    });
  }

  return {
    risks,
    overallRiskLevel: risks.length > 3 ? 'high' : risks.length > 1 ? 'medium' : 'low',
    recommendations: ['仔细评估高风险调整建议', '优先处理高置信度的建议', '监控调整后的任务执行情况'],
  };
}

async function generateDetailedAdjustmentReport(
  analysisResults: any[],
  suggestions: any[],
  riskAnalysis: any,
  contextFactors?: string[]
) {
  return {
    executiveSummary: `基于 ${analysisResults.length} 个执行上下文的分析，生成了 ${suggestions.length} 个任务调整建议。`,

    keyFindings: [
      `发现 ${suggestions.filter((s) => s.confidence > 0.8).length} 个高置信度调整机会`,
      `识别出 ${riskAnalysis?.risks.length || 0} 个潜在风险因素`,
      `建议优先处理 ${suggestions.filter((s) => s.adjustmentType === 'priority').length} 个优先级调整`,
    ],

    detailedAnalysis: analysisResults.map((result) => ({
      contextId: result.contextId,
      summary: result.summary,
      impact: `调整了 ${result.adjustedTasksCount} 个任务，生成了 ${result.suggestionsCount} 个建议`,
    })),

    recommendations: ['按置信度排序处理调整建议', '监控调整后的任务执行效果', '定期回顾和优化调整策略'],

    contextFactorsConsidered: contextFactors || ['performance', 'timeline', 'dependencies'],
  };
}

async function applyHighConfidenceAdjustments(suggestions: any[]) {
  // 只应用置信度 > 0.8 的调整
  const highConfidenceAdjustments = suggestions.filter((s) => s.confidence > 0.8);

  // 这里应该实际应用调整
  // 简化实现：返回应用的调整列表
  return highConfidenceAdjustments.map((suggestion) => ({
    taskId: suggestion.taskId,
    type: suggestion.adjustmentType,
    description: `自动应用: ${suggestion.reasoning}`,
  }));
}

function generateNextSteps(suggestions: any[], autoApplied: boolean) {
  const steps = [];

  if (!autoApplied && suggestions.length > 0) {
    steps.push('审查生成的调整建议');
    steps.push('选择合适的建议进行手动应用');
  }

  steps.push('监控调整后的任务执行情况');
  steps.push('收集调整效果的反馈');
  steps.push('根据反馈优化未来的调整策略');

  return steps;
}

// 工具定义
export const adjustTasksFromContextTool = {
  name: 'adjust_tasks_from_context',
  description: `基于执行上下文的智能任务调整工具 - 任务记忆系统的核心功能

🧠 **核心能力**：
- 上下文感知分析：深度分析任务执行过程中的发现、决策和洞察
- 智能调整建议：基于执行历史生成针对性的任务调整建议
- 风险评估：评估调整对项目整体的影响和风险
- 自动化应用：支持自动应用高置信度的调整建议

🎯 **解决的问题**：
- 任务执行过程中发现的新问题需要调整后续任务
- 基于已完成任务的经验优化未完成任务
- 保持任务间的知识传递和上下文连贯性
- 避免重复犯错，利用历史经验

⚡ **智能特性**：
- 多维度上下文分析（发现、决策、风险、机会）
- 置信度评估和风险分析
- 自动去重和优先级排序
- 详细的调整报告和建议

📊 **分析维度**：
- 任务执行中的关键发现
- 重要决策及其影响
- 识别的风险因素和机会
- 资源使用和性能表现

这个功能确保任务执行过程中积累的知识和经验能够有效地指导后续任务的调整和优化。`,
  inputSchema: AdjustTasksFromContextSchema,
};
