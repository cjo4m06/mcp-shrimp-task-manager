/**
 * 链式执行系统入口文件
 *
 * 导出所有链式执行相关的类、接口和工具函数
 * 为外部模块提供统一的访问接口
 */

// 导入核心类和类型
import { ChainManager } from './ChainManager.js';
import type { ChainPrompt, ChainExecutionConfig, ChainExecutionResult } from '../types/index.js';

// 导出核心执行器
export { ChainExecutor } from './ChainExecutor.js';

// 导出管理器
export { ChainManager } from './ChainManager.js';

// 导出类型定义（从 types/index.ts 重新导出）
export {
  // 链式执行状态相关
  ChainExecutionStatus,
  ChainExecutionResult,
  ChainExecutionError,
  ChainErrorType,
  ChainExecutionConfig,
  ChainErrorHandlingStrategy,
  ChainLogLevel,
  ChainExecutionContext,
  ChainExecutionEvent,
  ChainEventType,

  // 链式 prompt 相关
  ChainStep,
  ChainPrompt,
} from '../types/index.js';

// 导出任务模型中的链式执行函数
export {
  createChainTask,
  getChainTasks,
  getNextChainStep,
  updateChainTaskStatus,
  passDataToNextStep,
  canExecuteChainTask,
  getChainProgress,
  cancelChainExecution,
} from '../models/taskModel.js';

// 创建默认的链式执行管理器实例
export const defaultChainManager = new ChainManager();

/**
 * 便捷函数：启动链式执行
 * @param chainPrompt 链式 prompt 定义
 * @param initialData 初始数据
 * @param config 执行配置
 * @returns 执行结果
 */
export async function executeChain(
  chainPrompt: ChainPrompt,
  initialData: Record<string, any> = {},
  config?: Partial<ChainExecutionConfig>
): Promise<ChainExecutionResult> {
  return defaultChainManager.startChainExecution(chainPrompt, initialData, config);
}

/**
 * 便捷函数：获取链式执行状态
 * @param chainId 链式执行ID
 * @returns 执行状态信息
 */
export async function getChainStatus(chainId: string) {
  return defaultChainManager.getExecutionStatus(chainId);
}

/**
 * 便捷函数：取消链式执行
 * @param chainId 链式执行ID
 * @returns 取消结果
 */
export async function cancelChain(chainId: string) {
  return defaultChainManager.cancelExecution(chainId);
}

/**
 * 便捷函数：重试失败的步骤
 * @param chainId 链式执行ID
 * @param stepIndex 步骤索引（可选）
 * @returns 重试结果
 */
export async function retryChainStep(chainId: string, stepIndex?: number) {
  return defaultChainManager.retryFailedStep(chainId, stepIndex);
}

/**
 * 便捷函数：验证链式 prompt
 * @param chainPrompt 链式 prompt 定义
 * @returns 验证结果
 */
export function validateChainPrompt(chainPrompt: ChainPrompt) {
  return defaultChainManager.validateChainPrompt(chainPrompt);
}

/**
 * 便捷函数：获取执行统计信息
 * @returns 统计信息
 */
export function getExecutionStatistics() {
  return defaultChainManager.getExecutionStatistics();
}

/**
 * 便捷函数：清理已完成的执行上下文
 * @param maxAge 最大保留时间（毫秒）
 * @returns 清理的数量
 */
export function cleanupExecutions(maxAge?: number) {
  return defaultChainManager.cleanupCompletedExecutions(maxAge);
}
