import {
  Task,
  TaskStatus,
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
  ChainStep,
  ChainPrompt,
} from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';
import { getTaskById, updateTask, updateTaskStatus, createTask } from '../models/taskModel.js';
import { Logger } from '../utils/logger.js';

/**
 * 链式执行器：负责管理和执行链式任务流程
 *
 * 主要功能：
 * - 解析链式 prompt 并创建任务链
 * - 管理任务间的数据传递
 * - 处理执行状态和错误恢复
 * - 提供并行和串行执行支持
 */
export class ChainExecutor {
  private logger: Logger;
  private defaultConfig: ChainExecutionConfig;
  private activeChains: Map<string, ChainExecutionContext>;

  constructor() {
    this.logger = new Logger();
    this.defaultConfig = {
      maxRetries: 3,
      stepTimeout: 300000, // 5分钟
      totalTimeout: 1800000, // 30分钟
      enableParallelExecution: false,
      errorHandlingStrategy: ChainErrorHandlingStrategy.RETRY_ON_ERROR,
      dataValidation: true,
      logLevel: ChainLogLevel.INFO,
    };
    this.activeChains = new Map();
  }

  /**
   * 执行链式任务流程
   * @param chainPrompt 链式 prompt 定义
   * @param initialData 初始数据
   * @param config 执行配置（可选）
   * @returns 执行结果
   */
  async executeChain(
    chainPrompt: ChainPrompt,
    initialData: Record<string, any> = {},
    config?: Partial<ChainExecutionConfig>
  ): Promise<ChainExecutionResult> {
    const chainId = uuidv4();
    const executionConfig = { ...this.defaultConfig, ...config };
    const startTime = new Date();

    this.logger.info('ChainExecutor', `开始执行链式任务: ${chainPrompt.name.zh} (ID: ${chainId})`);

    // 创建执行上下文
    const context: ChainExecutionContext = {
      chainId,
      currentStepIndex: 0,
      totalSteps: chainPrompt.steps.length,
      startTime,
      config: executionConfig,
      sharedData: { ...initialData },
      stepResults: {},
      executionHistory: [],
    };

    this.activeChains.set(chainId, context);

    try {
      // 创建链式任务
      const chainTasks = await this.createChainTasks(chainPrompt, chainId, initialData);

      // 记录链开始事件
      this.recordEvent(context, ChainEventType.CHAIN_STARTED, 0, chainTasks[0]?.id || '', {
        chainPrompt: chainPrompt.name,
        totalSteps: chainPrompt.steps.length,
        initialData,
      });

      // 执行链式任务
      const result = await this.executeChainSteps(context, chainTasks, chainPrompt.steps);

      // 记录链完成事件
      this.recordEvent(context, ChainEventType.CHAIN_COMPLETED, context.totalSteps - 1, '', {
        executionTime: Date.now() - startTime.getTime(),
        finalData: result.finalData,
      });

      this.logger.info('ChainExecutor', `链式任务执行完成: ${chainId}, 耗时: ${result.executionTime}ms`);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('ChainExecutor', `链式任务执行失败: ${chainId}, 错误: ${errorMessage}`);

      // 记录链失败事件
      this.recordEvent(context, ChainEventType.CHAIN_FAILED, context.currentStepIndex, '', {
        error: errorMessage,
        executionTime: Date.now() - startTime.getTime(),
      });

      return {
        chainId,
        success: false,
        completedSteps: context.currentStepIndex,
        totalSteps: context.totalSteps,
        executionTime: Date.now() - startTime.getTime(),
        results: context.stepResults,
        errors: [
          {
            stepIndex: context.currentStepIndex,
            taskId: '',
            errorType: ChainErrorType.SYSTEM_ERROR,
            message: errorMessage,
            timestamp: new Date(),
            recoverable: false,
          },
        ],
      };
    } finally {
      this.activeChains.delete(chainId);
    }
  }

  /**
   * 创建链式任务
   * @param chainPrompt 链式 prompt 定义
   * @param chainId 链式执行ID
   * @param initialData 初始数据
   * @returns 创建的任务列表
   */
  private async createChainTasks(
    chainPrompt: ChainPrompt,
    chainId: string,
    initialData: Record<string, any>
  ): Promise<Task[]> {
    const tasks: Task[] = [];
    let previousTaskId: string | undefined;

    for (let i = 0; i < chainPrompt.steps.length; i++) {
      const step = chainPrompt.steps[i];

      // 创建任务
      const task = await createTask(
        `${chainPrompt.name.zh} - 步骤 ${i + 1}: ${step.stepName}`,
        `执行链式任务的第 ${i + 1} 步: ${step.stepName}`,
        `链式执行步骤，使用 prompt: ${step.promptId}`,
        previousTaskId ? [previousTaskId] : [],
        []
      );

      // 更新任务的链式执行字段
      await updateTask(task.id, {
        chainId,
        stepIndex: i,
        chainData: i === 0 ? initialData : {},
        parentStepId: previousTaskId,
        chainStatus: ChainExecutionStatus.WAITING_FOR_PARENT,
      });

      // 更新前一个任务的子步骤ID
      if (previousTaskId) {
        const previousTask = await getTaskById(previousTaskId);
        if (previousTask) {
          const childStepIds = previousTask.childStepIds || [];
          childStepIds.push(task.id);
          await updateTask(previousTaskId, { childStepIds });
        }
      }

      tasks.push(task);
      previousTaskId = task.id;
    }

    return tasks;
  }

  /**
   * 执行链式任务步骤
   * @param context 执行上下文
   * @param tasks 任务列表
   * @param steps 步骤定义
   * @returns 执行结果
   */
  private async executeChainSteps(
    context: ChainExecutionContext,
    tasks: Task[],
    steps: ChainStep[]
  ): Promise<ChainExecutionResult> {
    const errors: ChainExecutionError[] = [];
    let currentData = context.sharedData;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const step = steps[i];
      context.currentStepIndex = i;

      try {
        this.logger.info('ChainExecutor', `执行步骤 ${i + 1}/${tasks.length}: ${step.stepName} (任务ID: ${task.id})`);

        // 记录步骤开始事件
        this.recordEvent(context, ChainEventType.STEP_STARTED, i, task.id, {
          stepName: step.stepName,
          promptId: step.promptId,
          inputData: currentData,
        });

        // 更新任务状态
        await updateTask(task.id, {
          chainStatus: ChainExecutionStatus.EXECUTING,
          chainData: currentData,
        });
        await updateTaskStatus(task.id, TaskStatus.IN_PROGRESS);

        // 执行步骤
        const stepResult = await this.executeStep(step, currentData, context);

        // 更新任务状态为完成
        await updateTaskStatus(task.id, TaskStatus.COMPLETED);
        await updateTask(task.id, {
          chainStatus: ChainExecutionStatus.STEP_COMPLETED,
          summary: `链式执行步骤完成: ${step.stepName}`,
        });

        // 保存步骤结果
        context.stepResults[i] = stepResult;
        currentData = { ...currentData, ...stepResult };

        // 记录步骤完成事件
        this.recordEvent(context, ChainEventType.STEP_COMPLETED, i, task.id, {
          stepResult,
          outputData: currentData,
        });

        this.logger.info('ChainExecutor', `步骤 ${i + 1} 执行完成`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error('ChainExecutor', `步骤 ${i + 1} 执行失败: ${errorMessage}`);

        const chainError: ChainExecutionError = {
          stepIndex: i,
          taskId: task.id,
          errorType: ChainErrorType.STEP_EXECUTION_FAILED,
          message: errorMessage,
          timestamp: new Date(),
          recoverable: true,
        };

        errors.push(chainError);

        // 记录步骤失败事件
        this.recordEvent(context, ChainEventType.STEP_FAILED, i, task.id, {
          error: errorMessage,
        });

        // 更新任务状态
        await updateTask(task.id, {
          chainStatus: ChainExecutionStatus.CHAIN_FAILED,
        });

        // 根据错误处理策略决定是否继续
        if (context.config.errorHandlingStrategy === ChainErrorHandlingStrategy.FAIL_FAST) {
          throw error;
        }
      }
    }

    return {
      chainId: context.chainId,
      success: errors.length === 0,
      completedSteps: context.currentStepIndex + 1,
      totalSteps: context.totalSteps,
      executionTime: Date.now() - context.startTime.getTime(),
      results: context.stepResults,
      errors: errors.length > 0 ? errors : undefined,
      finalData: currentData,
    };
  }

  /**
   * 执行单个步骤
   * @param step 步骤定义
   * @param inputData 输入数据
   * @param context 执行上下文
   * @returns 步骤执行结果
   */
  private async executeStep(
    step: ChainStep,
    inputData: Record<string, any>,
    context: ChainExecutionContext
  ): Promise<Record<string, any>> {
    // 应用输入映射
    const mappedInput = this.applyInputMapping(inputData, step.inputMapping);

    // 这里应该调用实际的 prompt 执行逻辑
    // 目前返回模拟结果
    const result = {
      stepName: step.stepName,
      promptId: step.promptId,
      executedAt: new Date().toISOString(),
      inputData: mappedInput,
      outputData: {
        ...mappedInput,
        stepResult: `执行结果: ${step.stepName}`,
        stepIndex: context.currentStepIndex,
      },
    };

    // 应用输出映射
    return this.applyOutputMapping(result.outputData, step.outputMapping);
  }

  /**
   * 应用输入映射
   * @param data 原始数据
   * @param mapping 映射规则
   * @returns 映射后的数据
   */
  private applyInputMapping(data: Record<string, any>, mapping?: Record<string, string>): Record<string, any> {
    if (!mapping) return data;

    const mappedData: Record<string, any> = {};
    for (const [targetKey, sourceKey] of Object.entries(mapping)) {
      if (sourceKey in data) {
        mappedData[targetKey] = data[sourceKey];
      }
    }

    return { ...data, ...mappedData };
  }

  /**
   * 应用输出映射
   * @param data 原始数据
   * @param mapping 映射规则
   * @returns 映射后的数据
   */
  private applyOutputMapping(data: Record<string, any>, mapping?: Record<string, string>): Record<string, any> {
    if (!mapping) return data;

    const mappedData: Record<string, any> = {};
    for (const [sourceKey, targetKey] of Object.entries(mapping)) {
      if (sourceKey in data) {
        mappedData[targetKey] = data[sourceKey];
      }
    }

    return { ...data, ...mappedData };
  }

  /**
   * 记录执行事件
   * @param context 执行上下文
   * @param eventType 事件类型
   * @param stepIndex 步骤索引
   * @param taskId 任务ID
   * @param data 事件数据
   */
  private recordEvent(
    context: ChainExecutionContext,
    eventType: ChainEventType,
    stepIndex: number,
    taskId: string,
    data?: Record<string, any>
  ): void {
    const event: ChainExecutionEvent = {
      eventType,
      stepIndex,
      taskId,
      timestamp: new Date(),
      data,
    };

    context.executionHistory.push(event);

    if (context.config.logLevel === ChainLogLevel.DEBUG) {
      this.logger.debug('ChainExecutor', `链式执行事件: ${eventType}`, event);
    }
  }

  /**
   * 获取活动链的状态
   * @param chainId 链式执行ID
   * @returns 执行上下文或null
   */
  getChainStatus(chainId: string): ChainExecutionContext | null {
    return this.activeChains.get(chainId) || null;
  }

  /**
   * 取消链式执行
   * @param chainId 链式执行ID
   * @returns 是否成功取消
   */
  async cancelChain(chainId: string): Promise<boolean> {
    const context = this.activeChains.get(chainId);
    if (!context) {
      return false;
    }

    this.logger.info('ChainExecutor', `取消链式执行: ${chainId}`);

    // 记录取消事件
    this.recordEvent(context, ChainEventType.CHAIN_CANCELLED, context.currentStepIndex, '', {
      cancelledAt: new Date().toISOString(),
    });

    this.activeChains.delete(chainId);
    return true;
  }
}
