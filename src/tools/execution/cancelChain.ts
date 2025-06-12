/**
 * 取消链式执行工具
 */

import { z } from 'zod';
import { cancelChain } from '../../execution/index.js';
import { log } from '../../utils/logger.js';

// 输入参数 Schema
export const cancelChainSchema = z.object({
  chainId: z.string().describe('要取消的链式执行的唯一标识符'),
  reason: z.string().optional().describe('取消原因（可选）'),
});

/**
 * 取消链式执行
 */
export async function cancelChainTool(args: z.infer<typeof cancelChainSchema>) {
  try {
    log.info('CancelChain', `取消链式执行: ${args.chainId}`, {
      reason: args.reason || '用户请求',
    });

    const result = await cancelChain(args.chainId);

    if (result.success) {
      log.info('CancelChain', `链式执行取消成功: ${args.chainId}`, {
        cancelledTasks: result.cancelledTasks,
        reason: args.reason,
      });

      return {
        success: true,
        message: `链式执行已成功取消: ${args.chainId}`,
        chainId: args.chainId,
        result: {
          cancelledTasks: result.cancelledTasks,
          reason: args.reason || '用户请求',
          cancelledAt: new Date().toISOString(),
        },
      };
    } else {
      log.warn('CancelChain', `链式执行取消失败: ${args.chainId}`, {
        message: result.message,
      });

      return {
        success: false,
        message: result.message,
        chainId: args.chainId,
        error: '取消操作失败',
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error('CancelChain', '取消链式执行失败', error as Error);

    return {
      success: false,
      message: `取消链式执行失败: ${errorMessage}`,
      chainId: args.chainId,
      error: errorMessage,
    };
  }
}

// 工具定义
export const cancelChainToolDefinition = {
  name: 'cancel_chain',
  description: `取消链式执行

这个工具允许你取消正在执行的链式任务流程。

主要功能：
- 立即停止正在执行的链式任务
- 取消所有未完成的步骤任务
- 保留已完成步骤的结果
- 记录取消原因和时间
- 清理执行上下文和资源

使用场景：
- 发现执行错误需要紧急停止
- 任务执行时间过长需要中断
- 需求变更导致任务不再需要
- 系统资源紧张需要释放
- 调试和测试过程中的手动控制

注意事项：
- 取消操作不可逆，已取消的链式执行无法恢复
- 已完成的步骤结果会被保留
- 正在执行的步骤可能需要一些时间才能完全停止
- 取消后相关的任务状态会被标记为已取消

返回信息包括取消结果、影响的任务数量、取消时间等。`,
  inputSchema: cancelChainSchema,
  handler: cancelChainTool,
};
