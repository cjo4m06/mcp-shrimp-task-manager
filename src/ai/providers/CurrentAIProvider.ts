/**
 * 当前 AI 提供商
 * 代表当前正在执行的 AI，作为默认的提供商
 * 这是一个特殊的提供商，不需要额外配置，直接使用当前的 AI 能力
 */

import { AIProvider, AIProviderConfig, AIExecutionOptions, AIResponse } from '../types.js';

export class CurrentAIProvider implements AIProvider {
  public readonly id = 'current-ai';
  public readonly name = 'Current Execution AI';
  public readonly description = 'The AI currently executing this system';
  public readonly enabled = true;
  public readonly priority = 0; // 最高优先级

  private config: AIProviderConfig;

  constructor() {
    this.config = this.createDefaultConfig();
  }

  /**
   * 检查当前 AI 是否可用
   * @returns 始终返回 true，因为当前 AI 总是可用的
   */
  async isAvailable(): Promise<boolean> {
    return true;
  }

  /**
   * 执行 prompt
   * 注意：这个方法实际上不会执行 AI 调用，而是返回一个占位符响应
   * 在实际使用中，这个方法应该被 AI 管理器特殊处理
   * @param prompt 提示词
   * @param options 执行选项
   * @returns AI 响应
   */
  async executePrompt(prompt: string, options?: AIExecutionOptions): Promise<AIResponse> {
    const startTime = Date.now();

    // 这是一个占位符实现
    // 在实际使用中，AI 管理器会检测到这是当前 AI 提供商
    // 并使用特殊的处理逻辑（比如直接返回给调用者处理）

    const response: AIResponse = {
      content: `[CURRENT_AI_PLACEHOLDER] This response should be handled by the AI Manager. Prompt: ${prompt.substring(0, 100)}...`,
      model: options?.model || this.config.models.default,
      tokensUsed: this.estimateTokens(prompt),
      cost: 0, // 当前 AI 不计算成本
      responseTime: Date.now() - startTime,
      providerId: this.id,
      metadata: {
        isCurrentAI: true,
        originalPrompt: prompt,
        options: options,
      },
    };

    return response;
  }

  /**
   * 获取成本估算
   * @param tokens token 数量
   * @returns 成本（当前 AI 始终返回 0）
   */
  getCost(tokens: number): number {
    return 0; // 当前 AI 不计算成本
  }

  /**
   * 获取提供商配置
   * @returns 提供商配置
   */
  getConfig(): AIProviderConfig {
    return this.config;
  }

  /**
   * 验证配置
   * @returns 始终返回 true
   */
  async validateConfig(): Promise<boolean> {
    return true;
  }

  /**
   * 检查是否为当前 AI 提供商
   * @returns 始终返回 true
   */
  isCurrentAI(): boolean {
    return true;
  }

  /**
   * 获取当前 AI 的能力描述
   * @returns 能力列表
   */
  getCapabilities(): string[] {
    return ['general', 'analysis', 'generation', 'coding', 'research', 'task-management', 'chain-execution'];
  }

  /**
   * 创建默认配置
   * @returns 默认配置
   */
  private createDefaultConfig(): AIProviderConfig {
    return {
      id: this.id,
      name: this.name,
      models: {
        default: 'current-ai-model',
        available: ['current-ai-model'],
        configs: {
          'current-ai-model': {
            name: 'Current AI Model',
            maxTokens: 8000,
            capabilities: this.getCapabilities(),
            costMultiplier: 0,
          },
        },
      },
      limits: {
        requestsPerMinute: 1000, // 很高的限制，因为是当前 AI
        requestsPerDay: 10000,
        maxTokens: 8000,
      },
      pricing: {
        inputCostPer1kTokens: 0,
        outputCostPer1kTokens: 0,
      },
      settings: {
        isCurrentAI: true,
        description: 'This provider represents the AI currently executing the system',
        usage: 'Used as the default provider when no specific AI is configured',
      },
    };
  }

  /**
   * 估算 token 数量
   * @param text 文本
   * @returns 估算的 token 数量
   */
  private estimateTokens(text: string): number {
    // 简单的 token 估算：大约 4 个字符 = 1 个 token
    return Math.ceil(text.length / 4);
  }

  /**
   * 创建用于 AI 管理器的特殊标识
   * @returns 特殊标识对象
   */
  createCurrentAIMarker(): {
    isCurrentAI: true;
    providerId: string;
    shouldDelegate: true;
  } {
    return {
      isCurrentAI: true,
      providerId: this.id,
      shouldDelegate: true,
    };
  }

  /**
   * 获取调试信息
   * @returns 调试信息
   */
  getDebugInfo(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      enabled: this.enabled,
      priority: this.priority,
      isCurrentAI: true,
      capabilities: this.getCapabilities(),
      config: this.config,
      usage: 'This provider is used when no specific AI provider is configured or when explicitly using the current AI',
    };
  }
}
