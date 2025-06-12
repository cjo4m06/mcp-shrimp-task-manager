/**
 * 外部 AI 提供商基类
 * 为外部 AI 提供商提供通用的实现基础
 */

import { AIProvider, AIProviderConfig, AIExecutionOptions, AIResponse } from '../types.js';

export abstract class BaseExternalProvider implements AIProvider {
  protected config: AIProviderConfig;
  protected lastHealthCheck: Date | null = null;
  protected healthStatus: boolean = false;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  // 抽象属性，子类必须实现
  abstract get id(): string;
  abstract get name(): string;
  abstract get description(): string;
  abstract get enabled(): boolean;
  abstract get priority(): number;

  /**
   * 检查提供商是否可用
   * @returns 可用性状态
   */
  async isAvailable(): Promise<boolean> {
    // 如果最近检查过且结果为健康，直接返回
    if (
      this.lastHealthCheck &&
      Date.now() - this.lastHealthCheck.getTime() < 60000 && // 1分钟内
      this.healthStatus
    ) {
      return true;
    }

    try {
      // 执行健康检查
      const isHealthy = await this.performHealthCheck();
      this.healthStatus = isHealthy;
      this.lastHealthCheck = new Date();
      return isHealthy;
    } catch (error) {
      console.warn(`Health check failed for provider ${this.id}:`, error);
      this.healthStatus = false;
      this.lastHealthCheck = new Date();
      return false;
    }
  }

  /**
   * 执行 prompt（抽象方法，子类必须实现）
   * @param prompt 提示词
   * @param options 执行选项
   * @returns AI 响应
   */
  abstract executePrompt(prompt: string, options?: AIExecutionOptions): Promise<AIResponse>;

  /**
   * 获取成本估算
   * @param tokens token 数量
   * @returns 成本
   */
  getCost(tokens: number): number {
    const inputCost = (tokens * this.config.pricing.inputCostPer1kTokens) / 1000;
    const outputCost = (tokens * this.config.pricing.outputCostPer1kTokens) / 1000;
    return inputCost + outputCost;
  }

  /**
   * 获取提供商配置
   * @returns 提供商配置
   */
  getConfig(): AIProviderConfig {
    return { ...this.config };
  }

  /**
   * 验证配置
   * @returns 验证结果
   */
  async validateConfig(): Promise<boolean> {
    try {
      // 检查必需的配置项
      if (!this.config.apiKey) {
        console.warn(`API key missing for provider ${this.id}`);
        return false;
      }

      if (!this.config.models?.default) {
        console.warn(`Default model missing for provider ${this.id}`);
        return false;
      }

      // 执行连接测试
      return await this.testConnection();
    } catch (error) {
      console.warn(`Config validation failed for provider ${this.id}:`, error);
      return false;
    }
  }

  /**
   * 执行健康检查（子类可以重写）
   * @returns 健康状态
   */
  protected async performHealthCheck(): Promise<boolean> {
    try {
      // 默认实现：尝试执行一个简单的测试请求
      const testPrompt = 'Hello';
      const response = await this.executePrompt(testPrompt, {
        maxTokens: 10,
        timeout: 5000,
      });

      return response.content.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 测试连接（子类可以重写）
   * @returns 连接状态
   */
  protected async testConnection(): Promise<boolean> {
    // 默认实现与健康检查相同
    return this.performHealthCheck();
  }

  /**
   * 处理 API 错误
   * @param error 错误对象
   * @returns 标准化的错误
   */
  protected handleAPIError(error: any): Error {
    if (error.response) {
      // HTTP 错误响应
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 401:
          return new Error(`Authentication failed for ${this.name}: ${message}`);
        case 403:
          return new Error(`Access forbidden for ${this.name}: ${message}`);
        case 429:
          return new Error(`Rate limit exceeded for ${this.name}: ${message}`);
        case 500:
        case 502:
        case 503:
          return new Error(`Server error for ${this.name}: ${message}`);
        default:
          return new Error(`API error for ${this.name} (${status}): ${message}`);
      }
    } else if (error.code === 'ECONNREFUSED') {
      return new Error(`Connection refused for ${this.name}`);
    } else if (error.code === 'ETIMEDOUT') {
      return new Error(`Request timeout for ${this.name}`);
    } else {
      return new Error(`Unknown error for ${this.name}: ${error.message}`);
    }
  }

  /**
   * 估算 token 数量
   * @param text 文本
   * @returns 估算的 token 数量
   */
  protected estimateTokens(text: string): number {
    // 简单的 token 估算：大约 4 个字符 = 1 个 token
    // 不同的提供商可能有不同的 token 计算方式
    return Math.ceil(text.length / 4);
  }

  /**
   * 应用执行选项的默认值
   * @param options 用户提供的选项
   * @returns 完整的选项
   */
  protected applyDefaultOptions(options?: AIExecutionOptions): AIExecutionOptions {
    return {
      model: this.config.models.default,
      maxTokens: 1000,
      temperature: 0.7,
      timeout: 30000,
      retryCount: 2,
      stream: false,
      ...options,
    };
  }

  /**
   * 验证执行选项
   * @param options 执行选项
   * @returns 验证结果
   */
  protected validateExecutionOptions(options: AIExecutionOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (options.model && !this.config.models.available.includes(options.model)) {
      errors.push(`Model '${options.model}' is not available for provider ${this.name}`);
    }

    if (options.maxTokens && options.maxTokens > this.config.limits.maxTokens) {
      errors.push(
        `Max tokens (${options.maxTokens}) exceeds limit (${this.config.limits.maxTokens}) for provider ${this.name}`
      );
    }

    if (options.temperature && (options.temperature < 0 || options.temperature > 2)) {
      errors.push(`Temperature must be between 0 and 2 for provider ${this.name}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 创建标准化的 AI 响应
   * @param content 响应内容
   * @param model 使用的模型
   * @param tokensUsed 使用的 token 数
   * @param responseTime 响应时间
   * @param metadata 额外的元数据
   * @returns 标准化的 AI 响应
   */
  protected createResponse(
    content: string,
    model: string,
    tokensUsed: number,
    responseTime: number,
    metadata?: Record<string, any>
  ): AIResponse {
    return {
      content,
      model,
      tokensUsed,
      cost: this.getCost(tokensUsed),
      responseTime,
      providerId: this.id,
      metadata: {
        provider: this.name,
        timestamp: new Date().toISOString(),
        ...metadata,
      },
    };
  }

  /**
   * 获取提供商统计信息
   * @returns 统计信息
   */
  getStats(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      enabled: this.enabled,
      priority: this.priority,
      lastHealthCheck: this.lastHealthCheck,
      healthStatus: this.healthStatus,
      config: {
        models: this.config.models.available,
        limits: this.config.limits,
        pricing: this.config.pricing,
      },
    };
  }
}
