/**
 * 重试链式执行步骤工具
 */

import { z } from 'zod';
import { retryChainStep } from '../../execution/index.js';
import { log } from '../../utils/logger.js';

// 输入参数 Schema
export const retryChainStepSchema = z.object({
  chainId: z.string().describe('链式执行的唯一标识符'),
  stepIndex: z.number().optional().describe('要重试的步骤索引（可选，默认重试失败的步骤）'),
  reason: z.string().optional().describe('重试原因（可选）'),
});

/**
 * 重试链式执行步骤
 */
export async function retryChainStepTool(args: z.infer<typeof retryChainStepSchema>) {
  try {
    log.info('RetryChainStep', `重试链式执行步骤: ${args.chainId}`, {
      stepIndex: args.stepIndex,
      reason: args.reason || '用户请求',
    });

    const result = await retryChainStep(args.chainId, args.stepIndex);

    if (result.success) {
      log.info('RetryChainStep', `链式执行步骤重试成功: ${args.chainId}`, {
        retryStepIndex: result.retryStepIndex,
        reason: args.reason,
      });

      return {
        success: true,
        message: result.message,
        chainId: args.chainId,
        result: {
          retryStepIndex: result.retryStepIndex,
          reason: args.reason || '用户请求',
          retriedAt: new Date().toISOString(),
        },
      };
    } else {
      log.warn('RetryChainStep', `链式执行步骤重试失败: ${args.chainId}`, {
        message: result.message,
        stepIndex: args.stepIndex,
      });

      return {
        success: false,
        message: result.message,
        chainId: args.chainId,
        stepIndex: args.stepIndex,
        error: '重试操作失败',
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error('RetryChainStep', '重试链式执行步骤失败', error as Error);

    return {
      success: false,
      message: `重试链式执行步骤失败: ${errorMessage}`,
      chainId: args.chainId,
      stepIndex: args.stepIndex,
      error: errorMessage,
    };
  }
}

// 工具定义
export const retryChainStepToolDefinition = {
  name: 'retry_chain_step',
  description: `重试链式执行步骤

这个工具允许你重试链式任务中失败的步骤。

主要功能：
- 重试指定的失败步骤
- 自动检测并重试第一个失败的步骤
- 保持数据传递的连续性
- 记录重试原因和时间
- 支持多次重试操作

使用场景：
- 临时网络问题导致的步骤失败
- 外部服务暂时不可用
- 资源竞争导致的执行失败
- 配置错误修复后的重试
- 调试过程中的手动重试

重试机制：
- 如果不指定步骤索引，会自动找到第一个失败的步骤
- 重试会使用原始的输入数据和配置
- 重试不会影响已完成的步骤
- 支持链式执行配置中的重试策略

注意事项：
- 只能重试失败或阻塞的步骤
- 重试前会检查步骤的执行条件
- 某些类型的错误可能不适合重试
- 重试次数可能受到配置限制

返回信息包括重试结果、步骤索引、重试时间等。`,
  inputSchema: retryChainStepSchema,
  handler: retryChainStepTool,
};
