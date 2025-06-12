/**
 * 获取链式执行状态工具
 */

import { z } from 'zod';
import { getChainStatus } from '../../execution/index.js';
import { log } from '../../utils/logger.js';

// 输入参数 Schema
export const getChainStatusSchema = z.object({
  chainId: z.string().describe('链式执行的唯一标识符'),
});

/**
 * 获取链式执行状态
 */
export async function getChainStatusTool(args: z.infer<typeof getChainStatusSchema>) {
  try {
    log.info('GetChainStatus', `查询链式执行状态: ${args.chainId}`);

    const status = await getChainStatus(args.chainId);

    if (!status.context && status.tasks.length === 0) {
      return {
        success: false,
        message: `未找到链式执行: ${args.chainId}`,
        chainId: args.chainId,
        found: false,
      };
    }

    const result = {
      success: true,
      message: '链式执行状态查询成功',
      chainId: args.chainId,
      found: true,
      status: {
        // 执行上下文信息
        context: status.context
          ? {
              chainId: status.context.chainId,
              currentStepIndex: status.context.currentStepIndex,
              totalSteps: status.context.totalSteps,
              startTime: status.context.startTime,
              executionTime: Date.now() - status.context.startTime.getTime(),
              config: {
                maxRetries: status.context.config.maxRetries,
                stepTimeout: status.context.config.stepTimeout,
                totalTimeout: status.context.config.totalTimeout,
                enableParallelExecution: status.context.config.enableParallelExecution,
                errorHandlingStrategy: status.context.config.errorHandlingStrategy,
                logLevel: status.context.config.logLevel,
              },
            }
          : null,

        // 进度信息
        progress: {
          totalSteps: status.progress.totalSteps,
          completedSteps: status.progress.completedSteps,
          currentStep: status.progress.currentStep,
          progress: status.progress.progress,
          status: status.progress.status,
        },

        // 任务列表
        tasks: status.tasks.map((task) => ({
          id: task.id,
          name: task.name,
          status: task.status,
          stepIndex: task.stepIndex,
          chainStatus: task.chainStatus,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          completedAt: task.completedAt,
          summary: task.summary,
        })),
      },
    };

    log.info('GetChainStatus', `链式执行状态查询完成: ${args.chainId}`, {
      found: result.found,
      totalSteps: status.progress.totalSteps,
      completedSteps: status.progress.completedSteps,
      status: status.progress.status,
    });

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error('GetChainStatus', '查询链式执行状态失败', error as Error);

    return {
      success: false,
      message: `查询链式执行状态失败: ${errorMessage}`,
      chainId: args.chainId,
      error: errorMessage,
    };
  }
}

// 工具定义
export const getChainStatusToolDefinition = {
  name: 'get_chain_status',
  description: `获取链式执行状态

这个工具允许你查询正在执行或已完成的链式任务的详细状态信息。

主要功能：
- 查询链式执行的实时状态
- 获取执行进度和完成情况
- 查看各步骤的执行状态
- 获取执行配置和上下文信息
- 查看执行时间和性能数据

返回信息包括：
- 执行上下文（当前步骤、总步骤数、开始时间等）
- 进度信息（完成步骤数、进度百分比、执行状态）
- 任务列表（各步骤任务的详细状态）
- 配置信息（重试次数、超时设置、错误处理策略等）

使用场景：
- 监控长时间运行的链式任务
- 调试链式执行问题
- 获取任务执行报告
- 实时跟踪执行进度`,
  inputSchema: getChainStatusSchema,
  handler: getChainStatusTool,
};
