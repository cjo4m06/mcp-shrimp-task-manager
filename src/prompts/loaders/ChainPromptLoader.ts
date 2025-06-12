/**
 * 链式 Prompt 加载器
 * 负责加载、管理和验证链式 prompt
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ChainPrompt, ChainStep } from '../../types/index.js';
import { MarkdownPromptParser } from '../parsers/MarkdownPromptParser.js';
import { loadPromptConfig } from '../loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ChainExecutionContext {
  chainId: string;
  currentStep: number;
  data: Record<string, any>;
  metadata: Record<string, any>;
}

export interface ChainValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ChainPromptLoader {
  private parser: MarkdownPromptParser;
  private chainCache: Map<string, ChainPrompt>;
  private cacheEnabled: boolean;

  constructor(enableCache: boolean = true) {
    this.parser = new MarkdownPromptParser();
    this.chainCache = new Map();
    this.cacheEnabled = enableCache;
  }

  /**
   * 加载链式 prompt
   * @param chainId 链式 prompt ID
   * @returns ChainPrompt 对象
   */
  async loadChain(chainId: string): Promise<ChainPrompt> {
    // 检查缓存
    if (this.cacheEnabled && this.chainCache.has(chainId)) {
      return this.chainCache.get(chainId)!;
    }

    // 从配置文件加载
    const config = loadPromptConfig();
    const chainConfig = config.chains[chainId];

    if (chainConfig && chainConfig.enabled) {
      // 如果配置中有完整定义，直接返回
      if (this.cacheEnabled) {
        this.chainCache.set(chainId, chainConfig);
      }
      return chainConfig;
    }

    // 从 Markdown 文件加载
    const chainPath = this.getChainFilePath(chainId);

    if (!fs.existsSync(chainPath)) {
      throw new Error(`Chain prompt file not found: ${chainPath}`);
    }

    try {
      const content = fs.readFileSync(chainPath, 'utf-8');
      const chainPrompt = this.parser.parseChainPrompt(content);

      // 验证链式 prompt
      const validation = this.validateChain(chainPrompt);
      if (!validation.valid) {
        throw new Error(`Invalid chain prompt: ${validation.errors.join(', ')}`);
      }

      // 缓存结果
      if (this.cacheEnabled) {
        this.chainCache.set(chainId, chainPrompt);
      }

      return chainPrompt;
    } catch (error) {
      throw new Error(`Failed to load chain prompt '${chainId}': ${error}`);
    }
  }

  /**
   * 获取所有可用的链式 prompt
   * @returns 链式 prompt ID 数组
   */
  getAvailableChains(): string[] {
    const chains: string[] = [];

    // 从配置文件获取
    const config = loadPromptConfig();
    const configChains = Object.keys(config.chains).filter((id) => config.chains[id].enabled);
    chains.push(...configChains);

    // 从文件系统获取
    const chainsDir = this.getChainsDirectory();
    if (fs.existsSync(chainsDir)) {
      const files = fs.readdirSync(chainsDir);
      const fileChains = files
        .filter((file) => file.endsWith('.md'))
        .map((file) => path.basename(file, '.md'))
        .filter((id) => !chains.includes(id)); // 避免重复

      chains.push(...fileChains);
    }

    return chains;
  }

  /**
   * 验证链式 prompt
   * @param chainPrompt 链式 prompt 对象
   * @returns 验证结果
   */
  validateChain(chainPrompt: ChainPrompt): ChainValidationResult {
    const result = this.parser.validateChainPrompt(chainPrompt);
    const warnings: string[] = [];

    // 额外的验证逻辑
    if (chainPrompt.steps.length > 10) {
      warnings.push('Chain has more than 10 steps, consider breaking it down');
    }

    // 检查参数映射的一致性
    const mappingWarnings = this.validateParameterMappings(chainPrompt.steps);
    warnings.push(...mappingWarnings);

    return {
      valid: result.valid,
      errors: result.errors,
      warnings,
    };
  }

  /**
   * 预处理链式执行上下文
   * @param chainId 链式 prompt ID
   * @param initialData 初始数据
   * @returns 执行上下文
   */
  async prepareExecutionContext(
    chainId: string,
    initialData: Record<string, any> = {}
  ): Promise<ChainExecutionContext> {
    const chain = await this.loadChain(chainId);

    return {
      chainId,
      currentStep: 0,
      data: { ...initialData },
      metadata: {
        chainName: chain.name,
        totalSteps: chain.steps.length,
        startTime: new Date().toISOString(),
      },
    };
  }

  /**
   * 获取下一个执行步骤
   * @param context 执行上下文
   * @returns 下一个步骤或 null（如果已完成）
   */
  async getNextStep(context: ChainExecutionContext): Promise<ChainStep | null> {
    const chain = await this.loadChain(context.chainId);

    if (context.currentStep >= chain.steps.length) {
      return null; // 链式执行已完成
    }

    return chain.steps[context.currentStep];
  }

  /**
   * 处理步骤间的数据传递
   * @param step 当前步骤
   * @param context 执行上下文
   * @returns 处理后的输入数据
   */
  processStepInput(step: ChainStep, context: ChainExecutionContext): Record<string, any> {
    const inputData: Record<string, any> = {};

    if (step.inputMapping) {
      for (const [stepParam, contextKey] of Object.entries(step.inputMapping)) {
        if (context.data.hasOwnProperty(contextKey)) {
          inputData[stepParam] = context.data[contextKey];
        }
      }
    }

    return inputData;
  }

  /**
   * 处理步骤输出并更新上下文
   * @param step 当前步骤
   * @param stepOutput 步骤输出
   * @param context 执行上下文
   */
  processStepOutput(step: ChainStep, stepOutput: Record<string, any>, context: ChainExecutionContext): void {
    if (step.outputMapping) {
      for (const [outputKey, contextKey] of Object.entries(step.outputMapping)) {
        if (stepOutput.hasOwnProperty(outputKey)) {
          context.data[contextKey] = stepOutput[outputKey];
        }
      }
    }

    // 更新步骤计数
    context.currentStep++;

    // 更新元数据
    context.metadata.lastStepCompleted = step.stepName;
    context.metadata.lastUpdateTime = new Date().toISOString();
  }

  /**
   * 清除缓存
   * @param chainId 可选的特定链式 prompt ID
   */
  clearCache(chainId?: string): void {
    if (chainId) {
      this.chainCache.delete(chainId);
    } else {
      this.chainCache.clear();
    }
  }

  /**
   * 重新加载链式 prompt（强制刷新）
   * @param chainId 链式 prompt ID
   * @returns ChainPrompt 对象
   */
  async reloadChain(chainId: string): Promise<ChainPrompt> {
    this.clearCache(chainId);
    return this.loadChain(chainId);
  }

  /**
   * 获取链式 prompt 文件路径
   * @param chainId 链式 prompt ID
   * @returns 文件路径
   */
  private getChainFilePath(chainId: string): string {
    const chainsDir = this.getChainsDirectory();
    return path.join(chainsDir, `${chainId}.md`);
  }

  /**
   * 获取 chains 目录路径
   * @returns 目录路径
   */
  private getChainsDirectory(): string {
    // 从当前文件位置向上查找 prompts 目录
    let currentDir = __dirname;
    while (currentDir && currentDir !== path.dirname(currentDir)) {
      const promptsDir = path.join(currentDir, 'prompts');
      if (fs.existsSync(promptsDir)) {
        return path.join(promptsDir, 'chains');
      }
      currentDir = path.dirname(currentDir);
    }

    // 如果找不到，使用相对路径
    return path.join(__dirname, '..', 'chains');
  }

  /**
   * 验证参数映射的一致性
   * @param steps 步骤数组
   * @returns 警告信息数组
   */
  private validateParameterMappings(steps: ChainStep[]): string[] {
    const warnings: string[] = [];
    const availableOutputs = new Set<string>();

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // 检查输入映射是否有对应的输出
      if (step.inputMapping) {
        for (const [stepParam, contextKey] of Object.entries(step.inputMapping)) {
          if (i > 0 && !availableOutputs.has(contextKey)) {
            warnings.push(`Step ${i + 1} (${step.stepName}) references unavailable parameter: ${contextKey}`);
          }
        }
      }

      // 添加当前步骤的输出到可用输出集合
      if (step.outputMapping) {
        for (const contextKey of Object.values(step.outputMapping)) {
          availableOutputs.add(contextKey);
        }
      }
    }

    return warnings;
  }

  /**
   * 获取链式 prompt 的统计信息
   * @param chainId 链式 prompt ID
   * @returns 统计信息
   */
  async getChainStats(chainId: string): Promise<{
    stepCount: number;
    totalInputs: number;
    totalOutputs: number;
    categories: string[];
  }> {
    const chain = await this.loadChain(chainId);
    const categories = new Set<string>();
    let totalInputs = 0;
    let totalOutputs = 0;

    for (const step of chain.steps) {
      if (step.category) {
        categories.add(step.category);
      }
      if (step.inputMapping) {
        totalInputs += Object.keys(step.inputMapping).length;
      }
      if (step.outputMapping) {
        totalOutputs += Object.keys(step.outputMapping).length;
      }
    }

    return {
      stepCount: chain.steps.length,
      totalInputs,
      totalOutputs,
      categories: Array.from(categories),
    };
  }
}
