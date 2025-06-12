/**
 * 链式执行工具：执行链式任务流程
 */

import { z } from 'zod';
import { executeChain } from '../../execution/index.js';
import { log } from '../../utils/logger.js';

// 输入参数 Schema
export const executeChainSchema = z.object({
  chainPrompt: z
    .object({
      id: z.string().describe('链式 prompt 的唯一标识符'),
      name: z
        .object({
          en: z.string().describe('英文名称'),
          zh: z.string().describe('中文名称'),
        })
        .describe('链式 prompt 名称'),
      description: z
        .object({
          en: z.string().describe('英文描述'),
          zh: z.string().describe('中文描述'),
        })
        .describe('链式 prompt 描述'),
      steps: z
        .array(
          z.object({
            promptId: z.string().describe('步骤使用的 prompt ID'),
            stepName: z.string().describe('步骤名称'),
            category: z.string().optional().describe('所属分类（可选）'),
            inputMapping: z.record(z.string()).optional().describe('输入参数映射'),
            outputMapping: z.record(z.string()).optional().describe('输出参数映射'),
            retryCount: z.number().optional().describe('重试次数（可选）'),
            timeout: z.number().optional().describe('超时时间（可选）'),
          })
        )
        .describe('执行步骤列表'),
      enabled: z.boolean().describe('是否启用'),
    })
    .describe('链式 prompt 定义'),
  initialData: z.record(z.any()).optional().describe('初始数据'),
  config: z
    .object({
      maxRetries: z.number().optional().describe('最大重试次数'),
      stepTimeout: z.number().optional().describe('单步超时时间（毫秒）'),
      totalTimeout: z.number().optional().describe('总超时时间（毫秒）'),
      enableParallelExecution: z.boolean().optional().describe('是否启用并行执行'),
      errorHandlingStrategy: z
        .enum(['fail_fast', 'continue_on_error', 'retry_on_error', 'skip_on_error'])
        .optional()
        .describe('错误处理策略'),
      dataValidation: z.boolean().optional().describe('是否启用数据验证'),
      logLevel: z.enum(['debug', 'info', 'warn', 'error']).optional().describe('日志级别'),
    })
    .optional()
    .describe('执行配置'),
});

/**
 * 执行链式任务流程
 */
export async function executeChainTool(args: z.infer<typeof executeChainSchema>) {
  try {
    log.info('ExecuteChain', `开始执行链式任务: ${args.chainPrompt.name.zh}`);

    // 转换配置类型
    const config = args.config
      ? {
          ...args.config,
          errorHandlingStrategy: args.config.errorHandlingStrategy as any,
          logLevel: args.config.logLevel as any,
        }
      : undefined;

    const result = await executeChain(args.chainPrompt, args.initialData || {}, config);

    log.info('ExecuteChain', `链式任务执行完成: ${result.chainId}`, {
      success: result.success,
      completedSteps: result.completedSteps,
      totalSteps: result.totalSteps,
      executionTime: result.executionTime,
    });

    return {
      success: true,
      message: `链式任务执行${result.success ? '成功' : '失败'}`,
      result: {
        chainId: result.chainId,
        success: result.success,
        completedSteps: result.completedSteps,
        totalSteps: result.totalSteps,
        executionTime: result.executionTime,
        progress: result.totalSteps > 0 ? (result.completedSteps / result.totalSteps) * 100 : 0,
        finalData: result.finalData,
        errors: result.errors?.map((error) => ({
          stepIndex: error.stepIndex,
          taskId: error.taskId,
          errorType: error.errorType,
          message: error.message,
          recoverable: error.recoverable,
        })),
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error('ExecuteChain', '链式任务执行失败', error as Error);

    return {
      success: false,
      message: `链式任务执行失败: ${errorMessage}`,
      error: errorMessage,
    };
  }
}

// 工具定义
export const executeChainToolDefinition = {
  name: 'execute_chain',
  description: `执行链式任务流程

这个工具允许你执行预定义的链式任务流程，支持多步骤的自动化任务执行。

主要功能：
- 执行多步骤的链式任务流程
- 支持步骤间数据传递和映射
- 提供详细的执行状态和进度跟踪
- 支持错误处理和重试机制
- 可配置的执行策略和超时设置

使用场景：
- 复杂的多步骤开发任务
- 自动化的工作流程执行
- 需要数据传递的任务链
- 批量处理和自动化操作

返回信息包括执行结果、进度状态、错误信息等详细信息。`,
  inputSchema: executeChainSchema,
  handler: executeChainTool,
};
