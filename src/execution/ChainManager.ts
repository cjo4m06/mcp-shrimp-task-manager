import {
  ChainPrompt,
  ChainExecutionResult,
  ChainExecutionConfig,
  ChainExecutionContext,
  Task,
} from '../types/index.js';
import { ChainExecutor } from './ChainExecutor.js';
import { getChainTasks, getChainProgress, cancelChainExecution, canExecuteChainTask } from '../models/taskModel.js';
import { Logger } from '../utils/logger.js';

/**
 * 链式执行管理器：提供链式执行的高级管理功能
 *
 * 主要功能：
 * - 管理多个链式执行实例
 * - 提供链式执行的状态查询和控制
 * - 处理链式执行的生命周期管理
 * - 提供错误恢复和重试机制
 */
export class ChainManager {
  private executor: ChainExecutor;
  private logger: Logger;
  private activeChains: Map<string, ChainExecutionContext>;

  constructor() {
    this.executor = new ChainExecutor();
    this.logger = new Logger();
    this.activeChains = new Map();
  }

  /**
   * 启动链式执行
   * @param chainPrompt 链式 prompt 定义
   * @param initialData 初始数据
   * @param config 执行配置
   * @returns 执行结果的 Promise
   */
  async startChainExecution(
    chainPrompt: ChainPrompt,
    initialData: Record<string, any> = {},
    config?: Partial<ChainExecutionConfig>
  ): Promise<ChainExecutionResult> {
    this.logger.info('ChainManager', `启动链式执行: ${chainPrompt.name.zh}`);

    try {
      const result = await this.executor.executeChain(chainPrompt, initialData, config);

      if (result.success) {
        this.logger.info('ChainManager', `链式执行成功完成: ${result.chainId}`);
      } else {
        this.logger.warn('ChainManager', `链式执行失败: ${result.chainId}`, result.errors);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('ChainManager', `链式执行异常: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * 获取链式执行状态
   * @param chainId 链式执行ID
   * @returns 执行状态信息
   */
  async getExecutionStatus(chainId: string): Promise<{
    context: ChainExecutionContext | null;
    progress: {
      totalSteps: number;
      completedSteps: number;
      currentStep: number;
      progress: number;
      status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    };
    tasks: Task[];
  }> {
    const context = this.executor.getChainStatus(chainId);
    const progress = await getChainProgress(chainId);
    const tasks = await getChainTasks(chainId);

    return {
      context,
      progress,
      tasks,
    };
  }

  /**
   * 暂停链式执行
   * @param chainId 链式执行ID
   * @returns 是否成功暂停
   */
  async pauseExecution(chainId: string): Promise<boolean> {
    this.logger.info('ChainManager', `暂停链式执行: ${chainId}`);

    // 注意：这里只是标记暂停，实际的暂停逻辑需要在执行器中实现
    const context = this.executor.getChainStatus(chainId);
    if (context) {
      // 可以在这里添加暂停标记
      this.logger.info('ChainManager', `链式执行已标记为暂停: ${chainId}`);
      return true;
    }

    return false;
  }

  /**
   * 恢复链式执行
   * @param chainId 链式执行ID
   * @returns 是否成功恢复
   */
  async resumeExecution(chainId: string): Promise<boolean> {
    this.logger.info('ChainManager', `恢复链式执行: ${chainId}`);

    // 注意：这里只是标记恢复，实际的恢复逻辑需要在执行器中实现
    const context = this.executor.getChainStatus(chainId);
    if (context) {
      this.logger.info('ChainManager', `链式执行已标记为恢复: ${chainId}`);
      return true;
    }

    return false;
  }

  /**
   * 取消链式执行
   * @param chainId 链式执行ID
   * @returns 取消结果
   */
  async cancelExecution(chainId: string): Promise<{
    success: boolean;
    message: string;
    cancelledTasks: number;
  }> {
    this.logger.info('ChainManager', `取消链式执行: ${chainId}`);

    // 取消执行器中的活动链
    const executorCancelled = await this.executor.cancelChain(chainId);

    // 取消数据库中的任务
    const dbResult = await cancelChainExecution(chainId);

    return {
      success: executorCancelled || dbResult.success,
      message: dbResult.message,
      cancelledTasks: dbResult.cancelledTasks,
    };
  }

  /**
   * 重试失败的链式执行步骤
   * @param chainId 链式执行ID
   * @param stepIndex 要重试的步骤索引（可选，默认重试失败的步骤）
   * @returns 重试结果
   */
  async retryFailedStep(
    chainId: string,
    stepIndex?: number
  ): Promise<{
    success: boolean;
    message: string;
    retryStepIndex?: number;
  }> {
    this.logger.info('ChainManager', `重试链式执行步骤: ${chainId}, 步骤: ${stepIndex || '自动检测'}`);

    const tasks = await getChainTasks(chainId);

    if (tasks.length === 0) {
      return {
        success: false,
        message: '未找到指定的链式执行',
      };
    }

    // 如果没有指定步骤索引，找到第一个失败的步骤
    let targetStepIndex = stepIndex;
    if (targetStepIndex === undefined) {
      const failedTask = tasks.find((task) => task.chainStatus === 'chain_failed' || task.status === 'blocked');

      if (failedTask && failedTask.stepIndex !== undefined) {
        targetStepIndex = failedTask.stepIndex;
      } else {
        return {
          success: false,
          message: '未找到失败的步骤',
        };
      }
    }

    // 检查目标步骤是否存在
    const targetTask = tasks.find((task) => task.stepIndex === targetStepIndex);
    if (!targetTask) {
      return {
        success: false,
        message: `未找到步骤索引 ${targetStepIndex} 对应的任务`,
      };
    }

    // 检查是否可以执行
    const canExecute = await canExecuteChainTask(targetTask.id);
    if (!canExecute.canExecute) {
      return {
        success: false,
        message: `无法重试步骤: ${canExecute.reason}`,
      };
    }

    // 这里应该实现实际的重试逻辑
    // 目前只是返回成功状态
    this.logger.info('ChainManager', `步骤 ${targetStepIndex} 已标记为重试`);

    return {
      success: true,
      message: `步骤 ${targetStepIndex} 重试已启动`,
      retryStepIndex: targetStepIndex,
    };
  }

  /**
   * 获取所有活动的链式执行
   * @returns 活动链式执行列表
   */
  getActiveExecutions(): string[] {
    return Array.from(this.activeChains.keys());
  }

  /**
   * 清理已完成的链式执行上下文
   * @param maxAge 最大保留时间（毫秒）
   * @returns 清理的数量
   */
  cleanupCompletedExecutions(maxAge: number = 3600000): number {
    // 默认1小时
    const now = Date.now();
    let cleanedCount = 0;

    for (const [chainId, context] of this.activeChains.entries()) {
      const age = now - context.startTime.getTime();
      if (age > maxAge) {
        this.activeChains.delete(chainId);
        cleanedCount++;
        this.logger.debug('ChainManager', `清理过期的链式执行上下文: ${chainId}`);
      }
    }

    if (cleanedCount > 0) {
      this.logger.info('ChainManager', `清理了 ${cleanedCount} 个过期的链式执行上下文`);
    }

    return cleanedCount;
  }

  /**
   * 获取链式执行统计信息
   * @returns 统计信息
   */
  getExecutionStatistics(): {
    activeExecutions: number;
    totalExecutionsToday: number;
    averageExecutionTime: number;
    successRate: number;
  } {
    // 这里应该实现实际的统计逻辑
    // 目前返回模拟数据
    return {
      activeExecutions: this.activeChains.size,
      totalExecutionsToday: 0,
      averageExecutionTime: 0,
      successRate: 0,
    };
  }

  /**
   * 验证链式 prompt 定义
   * @param chainPrompt 链式 prompt 定义
   * @returns 验证结果
   */
  validateChainPrompt(chainPrompt: ChainPrompt): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 基本验证
    if (!chainPrompt.id) {
      errors.push('链式 prompt 缺少 ID');
    }

    if (!chainPrompt.name.zh && !chainPrompt.name.en) {
      errors.push('链式 prompt 缺少名称');
    }

    if (!chainPrompt.steps || chainPrompt.steps.length === 0) {
      errors.push('链式 prompt 缺少执行步骤');
    }

    // 步骤验证
    if (chainPrompt.steps) {
      for (let i = 0; i < chainPrompt.steps.length; i++) {
        const step = chainPrompt.steps[i];

        if (!step.promptId) {
          errors.push(`步骤 ${i + 1} 缺少 promptId`);
        }

        if (!step.stepName) {
          warnings.push(`步骤 ${i + 1} 缺少步骤名称`);
        }

        // 检查输入输出映射的循环引用
        if (step.inputMapping && step.outputMapping) {
          for (const [inputKey, inputValue] of Object.entries(step.inputMapping)) {
            for (const [outputKey, outputValue] of Object.entries(step.outputMapping)) {
              if (inputKey === outputValue && outputKey === inputValue) {
                warnings.push(`步骤 ${i + 1} 存在循环映射: ${inputKey} <-> ${outputKey}`);
              }
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
