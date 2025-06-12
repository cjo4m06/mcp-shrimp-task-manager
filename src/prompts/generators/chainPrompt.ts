/**
 * 链式 Prompt 生成器
 * 支持链式执行的参数映射和步骤管理
 */

import { ChainPromptLoader, ChainExecutionContext } from '../loaders/ChainPromptLoader.js';
import { ChainPrompt, ChainStep } from '../../types/index.js';
import { generatePrompt } from '../loader.js';

export interface ChainExecutionOptions {
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  onStepStart?: (step: ChainStep, context: ChainExecutionContext) => void;
  onStepComplete?: (step: ChainStep, result: any, context: ChainExecutionContext) => void;
  onStepError?: (step: ChainStep, error: Error, context: ChainExecutionContext) => void;
}

export interface ChainExecutionResult {
  success: boolean;
  result?: any;
  error?: Error;
  context: ChainExecutionContext;
  executionTime: number;
  stepsCompleted: number;
}

export class ChainPromptGenerator {
  private loader: ChainPromptLoader;

  constructor() {
    this.loader = new ChainPromptLoader();
  }

  /**
   * 生成链式 prompt 的执行计划
   * @param chainId 链式 prompt ID
   * @param initialData 初始数据
   * @returns 执行计划
   */
  async generateExecutionPlan(
    chainId: string,
    initialData: Record<string, any> = {}
  ): Promise<{
    chain: ChainPrompt;
    context: ChainExecutionContext;
    steps: Array<{
      step: ChainStep;
      inputData: Record<string, any>;
      dependencies: string[];
    }>;
  }> {
    const chain = await this.loader.loadChain(chainId);
    const context = await this.loader.prepareExecutionContext(chainId, initialData);

    const steps = [];
    const tempContext = { ...context };

    for (const step of chain.steps) {
      const inputData = this.loader.processStepInput(step, tempContext);
      const dependencies = this.extractStepDependencies(step, chain.steps);

      steps.push({
        step,
        inputData,
        dependencies,
      });

      // 模拟步骤输出以计算后续步骤的输入
      if (step.outputMapping) {
        for (const [outputKey, contextKey] of Object.entries(step.outputMapping)) {
          tempContext.data[contextKey] = `<${outputKey}>`;
        }
      }
    }

    return {
      chain,
      context,
      steps,
    };
  }

  /**
   * 生成单个步骤的 prompt
   * @param step 链式步骤
   * @param inputData 输入数据
   * @param templateOverride 可选的模板覆盖
   * @returns 生成的 prompt
   */
  async generateStepPrompt(
    step: ChainStep,
    inputData: Record<string, any>,
    templateOverride?: string
  ): Promise<string> {
    // 如果有模板覆盖，使用覆盖的模板
    if (templateOverride) {
      return generatePrompt(templateOverride, inputData);
    }

    // 尝试从分类加载 prompt 模板
    try {
      const { loadPromptByCategory } = await import('../loader.js');

      if (step.category) {
        const template = loadPromptByCategory(step.category, step.promptId);
        return generatePrompt(template, inputData);
      }
    } catch (error) {
      // 如果分类加载失败，回退到传统方式
    }

    // 回退到传统的模板加载方式
    try {
      const { loadPromptFromTemplate } = await import('../loader.js');
      const template = loadPromptFromTemplate(`${step.promptId}/index.md`);
      return generatePrompt(template, inputData);
    } catch (error) {
      throw new Error(`Failed to load template for step '${step.promptId}': ${error}`);
    }
  }

  /**
   * 验证链式执行的参数完整性
   * @param chainId 链式 prompt ID
   * @param initialData 初始数据
   * @returns 验证结果
   */
  async validateChainParameters(
    chainId: string,
    initialData: Record<string, any>
  ): Promise<{
    valid: boolean;
    missingParameters: string[];
    unusedParameters: string[];
    warnings: string[];
  }> {
    const chain = await this.loader.loadChain(chainId);
    const missingParameters: string[] = [];
    const unusedParameters = new Set(Object.keys(initialData));
    const warnings: string[] = [];

    // 跟踪可用的参数
    const availableParams = new Set(Object.keys(initialData));

    for (let i = 0; i < chain.steps.length; i++) {
      const step = chain.steps[i];

      // 检查输入参数
      if (step.inputMapping) {
        for (const [stepParam, contextKey] of Object.entries(step.inputMapping)) {
          if (!availableParams.has(contextKey)) {
            missingParameters.push(`Step ${i + 1} (${step.stepName}): missing parameter '${contextKey}'`);
          } else {
            unusedParameters.delete(contextKey);
          }
        }
      }

      // 添加输出参数到可用参数集合
      if (step.outputMapping) {
        for (const contextKey of Object.values(step.outputMapping)) {
          availableParams.add(contextKey);
        }
      }

      // 检查重试配置
      if (step.retryCount && step.retryCount > 5) {
        warnings.push(`Step ${i + 1} (${step.stepName}): high retry count (${step.retryCount})`);
      }

      // 检查超时配置
      if (step.timeout && step.timeout > 300000) {
        // 5 minutes
        warnings.push(`Step ${i + 1} (${step.stepName}): long timeout (${step.timeout}ms)`);
      }
    }

    return {
      valid: missingParameters.length === 0,
      missingParameters,
      unusedParameters: Array.from(unusedParameters),
      warnings,
    };
  }

  /**
   * 生成链式执行的调试信息
   * @param chainId 链式 prompt ID
   * @param context 执行上下文
   * @returns 调试信息
   */
  async generateDebugInfo(
    chainId: string,
    context: ChainExecutionContext
  ): Promise<{
    chainInfo: any;
    contextSnapshot: any;
    dataFlow: Array<{
      step: string;
      inputs: Record<string, any>;
      outputs: Record<string, any>;
    }>;
    performance: {
      totalSteps: number;
      completedSteps: number;
      progress: number;
      estimatedTimeRemaining?: number;
    };
  }> {
    const chain = await this.loader.loadChain(chainId);
    const stats = await this.loader.getChainStats(chainId);

    const dataFlow = [];
    const tempContext = { ...context };

    for (let i = 0; i < Math.min(context.currentStep, chain.steps.length); i++) {
      const step = chain.steps[i];
      const inputs = this.loader.processStepInput(step, tempContext);
      const outputs: Record<string, any> = {};

      if (step.outputMapping) {
        for (const [outputKey, contextKey] of Object.entries(step.outputMapping)) {
          if (tempContext.data.hasOwnProperty(contextKey)) {
            outputs[outputKey] = tempContext.data[contextKey];
          }
        }
      }

      dataFlow.push({
        step: step.stepName,
        inputs,
        outputs,
      });

      // 更新临时上下文
      this.loader.processStepOutput(step, outputs, tempContext);
    }

    return {
      chainInfo: {
        id: chain.id,
        name: chain.name,
        description: chain.description,
        stats,
      },
      contextSnapshot: {
        currentStep: context.currentStep,
        totalSteps: chain.steps.length,
        data: context.data,
        metadata: context.metadata,
      },
      dataFlow,
      performance: {
        totalSteps: chain.steps.length,
        completedSteps: context.currentStep,
        progress: (context.currentStep / chain.steps.length) * 100,
      },
    };
  }

  /**
   * 创建链式执行的恢复点
   * @param context 执行上下文
   * @returns 恢复点数据
   */
  createCheckpoint(context: ChainExecutionContext): string {
    const checkpoint = {
      chainId: context.chainId,
      currentStep: context.currentStep,
      data: context.data,
      metadata: {
        ...context.metadata,
        checkpointTime: new Date().toISOString(),
      },
    };

    return JSON.stringify(checkpoint);
  }

  /**
   * 从恢复点恢复执行上下文
   * @param checkpointData 恢复点数据
   * @returns 恢复的执行上下文
   */
  restoreFromCheckpoint(checkpointData: string): ChainExecutionContext {
    try {
      const checkpoint = JSON.parse(checkpointData);
      return {
        chainId: checkpoint.chainId,
        currentStep: checkpoint.currentStep,
        data: checkpoint.data,
        metadata: {
          ...checkpoint.metadata,
          restoredAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`Invalid checkpoint data: ${error}`);
    }
  }

  /**
   * 提取步骤依赖关系
   * @param step 当前步骤
   * @param allSteps 所有步骤
   * @returns 依赖的步骤名称数组
   */
  private extractStepDependencies(step: ChainStep, allSteps: ChainStep[]): string[] {
    const dependencies: string[] = [];

    if (!step.inputMapping) {
      return dependencies;
    }

    // 查找哪些步骤的输出被当前步骤使用
    for (const contextKey of Object.values(step.inputMapping)) {
      for (const otherStep of allSteps) {
        if (otherStep === step) continue;

        if (otherStep.outputMapping && Object.values(otherStep.outputMapping).includes(contextKey)) {
          dependencies.push(otherStep.stepName);
        }
      }
    }

    return dependencies;
  }

  /**
   * 获取链式 prompt 加载器实例
   * @returns ChainPromptLoader 实例
   */
  getLoader(): ChainPromptLoader {
    return this.loader;
  }
}
