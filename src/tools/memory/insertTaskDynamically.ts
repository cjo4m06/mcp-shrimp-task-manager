/**
 * 动态任务插入工具
 * 支持在任务执行过程中智能插入新任务，并自动调整后续任务
 */

import { z } from 'zod';
import { TaskMemoryManager } from '../../memory/TaskMemoryManager.js';
import { DynamicTaskAdjuster, TaskInsertionRequest } from '../../memory/DynamicTaskAdjuster.js';
import { getProjectContext } from '../../utils/projectDetector.js';
import { getProjectDataDir } from '../../utils/pathManager.js';
import { handleError, createSuccessResponse, validateAndHandle, type ApiResponse } from '../../utils/errorHandler.js';
import { adaptToMcpResponse, type McpToolResponse } from '../../utils/mcpAdapter.js';
import { join } from 'path';

// 输入参数验证
const InsertTaskDynamicallySchema = z.object({
  title: z.string().min(5).describe('新任务的标题，应该简洁明确'),
  description: z.string().min(20).describe('新任务的详细描述，包含具体要求和目标'),
  priority: z.number().min(1).max(10).optional().describe('任务优先级，1-10，数字越大优先级越高'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional().describe('任务紧急程度'),
  insertAfter: z.string().optional().describe('在指定任务ID之后插入'),
  insertBefore: z.string().optional().describe('在指定任务ID之前插入'),
  relatedTasks: z.array(z.string()).optional().describe('相关任务ID列表'),
  context: z.string().optional().describe('插入任务的背景和原因说明'),
  autoAdjust: z.boolean().default(true).describe('是否自动调整后续任务'),
  generateSuggestions: z.boolean().default(true).describe('是否生成优化建议'),
});

type InsertTaskDynamicallyInput = z.infer<typeof InsertTaskDynamicallySchema>;

/**
 * 动态插入任务
 */
export async function insertTaskDynamically(args: InsertTaskDynamicallyInput): Promise<McpToolResponse> {
  try {
    // 验证输入参数
    const validationResult = validateAndHandle(InsertTaskDynamicallySchema, args, '参数验证');
    if (
      typeof validationResult === 'object' &&
      validationResult !== null &&
      'success' in validationResult &&
      !validationResult.success
    ) {
      return adaptToMcpResponse(validationResult as ApiResponse);
    }
    const validatedArgs = validationResult as InsertTaskDynamicallyInput;
    const {
      title,
      description,
      priority,
      urgency,
      insertAfter,
      insertBefore,
      relatedTasks,
      context,
      autoAdjust,
      generateSuggestions,
    } = validatedArgs;

    // 获取项目上下文
    const projectContext = await getProjectContext();
    console.log(`🔄 开始为项目 "${projectContext.projectName}" 动态插入任务...`);

    // 初始化记忆管理器和调整器
    const dataDir = await getProjectDataDir();
    const memoryManager = new TaskMemoryManager(dataDir);
    const taskAdjuster = new DynamicTaskAdjuster(memoryManager);

    // 构建插入请求
    const insertionRequest: TaskInsertionRequest = {
      title,
      description,
      priority,
      urgency,
      insertAfter,
      insertBefore,
      relatedTasks,
      context,
    };

    console.log(`📝 准备插入任务: "${title}"`);
    if (insertAfter) {
      console.log(`📍 插入位置: 在任务 "${insertAfter}" 之后`);
    } else if (insertBefore) {
      console.log(`📍 插入位置: 在任务 "${insertBefore}" 之前`);
    } else {
      console.log(`📍 插入位置: 智能选择最佳位置`);
    }

    // 执行动态插入
    const result = await taskAdjuster.insertTaskIntelligently(insertionRequest);

    if (result.success) {
      console.log(`✅ 任务插入成功！`);

      // 记录插入决策到执行上下文
      if (result.insertedTask) {
        const executionId = await memoryManager.startTaskExecution('dynamic-insertion');
        await memoryManager.recordDecision(
          executionId,
          `动态插入任务: ${title}`,
          [
            { id: 'insert', description: '插入新任务' },
            { id: 'skip', description: '跳过插入' },
          ],
          'insert',
          context || '用户请求插入新任务'
        );
        await memoryManager.completeTaskExecution(executionId, 'success', '任务插入完成');
      }

      // 生成返回结果
      const responseData = {
        insertedTask: result.insertedTask
          ? {
              id: result.insertedTask.id,
              title: result.insertedTask.name,
              description: result.insertedTask.description,
              status: result.insertedTask.status,
              createdAt: result.insertedTask.createdAt,
            }
          : null,

        adjustmentSummary: {
          adjustedTasksCount: result.adjustedTasks.length,
          suggestionsCount: result.suggestions.length,
          warningsCount: result.warnings.length,
          summary: result.summary,
        },

        adjustedTasks: autoAdjust
          ? result.adjustedTasks.map((task) => ({
              id: task.id,
              title: task.name,
              status: task.status,
              lastModified: task.updatedAt,
            }))
          : [],

        suggestions: generateSuggestions
          ? result.suggestions.map((suggestion) => ({
              taskId: suggestion.taskId,
              type: suggestion.adjustmentType,
              reasoning: suggestion.reasoning,
              confidence: suggestion.confidence,
              impact: suggestion.impact,
            }))
          : [],

        warnings: result.warnings,

        nextSteps: [
          '检查调整后的任务列表',
          '评估生成的优化建议',
          '根据需要手动调整任务优先级',
          '开始执行调整后的任务计划',
        ],
      };

      // 输出详细信息
      console.log('');
      console.log('📊 插入结果统计:');
      console.log(`- 插入任务: ${result.insertedTask?.name || '无'}`);
      console.log(`- 调整任务数: ${result.adjustedTasks.length}`);
      console.log(`- 优化建议数: ${result.suggestions.length}`);
      console.log(`- 警告数: ${result.warnings.length}`);

      if (result.suggestions.length > 0) {
        console.log('');
        console.log('💡 优化建议:');
        result.suggestions.slice(0, 3).forEach((suggestion, index) => {
          console.log(`${index + 1}. ${suggestion.reasoning} (置信度: ${Math.round(suggestion.confidence * 100)}%)`);
        });
      }

      if (result.warnings.length > 0) {
        console.log('');
        console.log('⚠️ 注意事项:');
        result.warnings.forEach((warning, index) => {
          console.log(`${index + 1}. ${warning}`);
        });
      }

      return adaptToMcpResponse(createSuccessResponse(responseData, result.warnings));
    } else {
      console.error('❌ 任务插入失败');
      return adaptToMcpResponse({
        success: false,
        error: result.summary,
        warnings: result.warnings,
      });
    }
  } catch (error) {
    return adaptToMcpResponse(handleError(error, '动态任务插入'));
  }
}

// 工具定义
export const insertTaskDynamicallyTool = {
  name: 'insert_task_dynamically',
  description: `智能动态任务插入工具 - 任务记忆和上下文保持的核心功能

🧠 **核心特色**：
- 智能任务插入：基于当前任务状态和优先级智能选择插入位置
- 自动任务调整：插入新任务后自动调整后续任务的优先级和依赖关系
- 上下文感知：保持任务间的逻辑连贯性和知识传递
- 风险评估：评估插入对现有任务计划的影响

🎯 **适用场景**：
- 在任务执行过程中发现新的紧急需求
- 需要插入临时任务而不破坏现有计划
- 基于执行过程中的发现调整任务计划
- 响应突发需求或变更请求

⚡ **智能功能**：
- 自动分析最佳插入位置
- 重新计算任务依赖关系
- 生成任务调整建议
- 检测和解决循环依赖
- 保持任务执行的连贯性

📋 **输出内容**：
- 插入的新任务信息
- 调整后的任务列表
- 智能优化建议
- 风险警告和注意事项
- 后续执行建议

这个功能解决了传统任务管理中"天马行空插入任务"导致计划混乱的问题，
通过智能分析和自动调整，确保新任务的插入不会破坏现有的任务流程。`,
  inputSchema: InsertTaskDynamicallySchema,
};
