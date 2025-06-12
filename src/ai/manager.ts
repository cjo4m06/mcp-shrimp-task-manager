/**
 * AI 管理器
 * 统一管理多个 AI 提供商，提供智能选择和失败回退功能
 */

import {
  AIProvider,
  AIManagerConfig,
  AIExecutionOptions,
  AIResponse,
  AIExecutionResult,
  ProviderSelectionRequirements,
  UsageStats,
  ProviderHealthStatus,
  CurrentAIProvider as CurrentAIConfig,
} from './types.js';
import { AIConfigManager } from './config.js';
import { CurrentAIProvider } from './providers/CurrentAIProvider.js';

export class AIManager {
  private providers: Map<string, AIProvider> = new Map();
  private configManager: AIConfigManager;
  private config: AIManagerConfig;
  private usageStats: Map<string, UsageStats> = new Map();
  private healthStatus: Map<string, ProviderHealthStatus> = new Map();

  constructor(configManager?: AIConfigManager) {
    this.configManager = configManager || new AIConfigManager();
    this.config = this.configManager.loadManagerConfig();
    this.initializeProviders();
  }

  /**
   * 执行 prompt，支持智能提供商选择和失败回退
   * @param prompt 提示词
   * @param options 执行选项
   * @param requirements 提供商选择要求
   * @returns 执行结果
   */
  async executePrompt(
    prompt: string,
    options?: AIExecutionOptions,
    requirements?: ProviderSelectionRequirements
  ): Promise<AIExecutionResult> {
    const startTime = Date.now();
    const attemptedProviders: string[] = [];
    let lastError: Error | undefined;

    try {
      // 选择提供商
      const selectedProviders = await this.selectProviders(requirements);

      if (selectedProviders.length === 0) {
        throw new Error('No available AI providers found');
      }

      // 尝试执行
      for (const provider of selectedProviders) {
        attemptedProviders.push(provider.id);

        try {
          // 检查是否为当前 AI 提供商
          if (provider instanceof CurrentAIProvider) {
            return this.handleCurrentAIExecution(prompt, options, provider, startTime, attemptedProviders);
          }

          // 检查提供商是否可用
          if (!(await provider.isAvailable())) {
            this.updateHealthStatus(provider.id, false, 'Provider not available');
            continue;
          }

          // 执行 prompt
          const response = await provider.executePrompt(prompt, options);

          // 更新统计信息
          this.updateUsageStats(provider.id, response);
          this.updateHealthStatus(provider.id, true);

          return {
            success: true,
            response,
            providerId: provider.id,
            attemptedProviders,
            executionTime: Date.now() - startTime,
            retryCount: attemptedProviders.length - 1,
          };
        } catch (error) {
          lastError = error as Error;
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.updateHealthStatus(provider.id, false, errorMessage);
          console.warn(`Provider ${provider.id} failed:`, errorMessage);

          // 如果不是最后一个提供商，继续尝试下一个
          if (provider !== selectedProviders[selectedProviders.length - 1]) {
            continue;
          }
        }
      }

      // 所有提供商都失败了
      return {
        success: false,
        error: lastError || new Error('All providers failed'),
        providerId: attemptedProviders[attemptedProviders.length - 1] || 'unknown',
        attemptedProviders,
        executionTime: Date.now() - startTime,
        retryCount: attemptedProviders.length - 1,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        providerId: 'unknown',
        attemptedProviders,
        executionTime: Date.now() - startTime,
        retryCount: 0,
      };
    }
  }

  /**
   * 处理当前 AI 的执行
   * 这是一个特殊的处理逻辑，用于标识需要使用当前执行的 AI
   */
  private handleCurrentAIExecution(
    prompt: string,
    options: AIExecutionOptions | undefined,
    provider: CurrentAIProvider,
    startTime: number,
    attemptedProviders: string[]
  ): AIExecutionResult {
    // 创建一个特殊的响应，标识这应该由当前 AI 处理
    const response: AIResponse = {
      content: `[CURRENT_AI_EXECUTION] ${prompt}`,
      model: options?.model || 'current-ai-model',
      tokensUsed: provider['estimateTokens'](prompt),
      cost: 0,
      responseTime: Date.now() - startTime,
      providerId: provider.id,
      metadata: {
        isCurrentAI: true,
        shouldDelegate: true,
        originalPrompt: prompt,
        options: options,
        marker: provider.createCurrentAIMarker(),
      },
    };

    return {
      success: true,
      response,
      providerId: provider.id,
      attemptedProviders,
      executionTime: Date.now() - startTime,
      retryCount: 0,
    };
  }

  /**
   * 选择合适的提供商
   * @param requirements 选择要求
   * @returns 按优先级排序的提供商列表
   */
  async selectProviders(requirements?: ProviderSelectionRequirements): Promise<AIProvider[]> {
    const availableProviders = Array.from(this.providers.values()).filter((provider) => provider.enabled);

    if (availableProviders.length === 0) {
      return [];
    }

    // 如果没有特殊要求，检查是否应该使用当前 AI
    if (!requirements || !requirements.preferredProvider) {
      const currentAIConfig = this.configManager.getCurrentAIConfig();

      if (currentAIConfig.useCurrentAI) {
        const currentAIProvider = this.providers.get('current-ai');
        if (currentAIProvider) {
          return [currentAIProvider];
        }
      }
    }

    // 应用过滤条件
    let filteredProviders = availableProviders;

    if (requirements) {
      // 排除指定的提供商
      if (requirements.excludeProviders) {
        filteredProviders = filteredProviders.filter(
          (provider) => !requirements.excludeProviders!.includes(provider.id)
        );
      }

      // 如果指定了首选提供商，优先使用
      if (requirements.preferredProvider) {
        const preferred = filteredProviders.find((p) => p.id === requirements.preferredProvider);
        if (preferred) {
          return [preferred, ...filteredProviders.filter((p) => p.id !== requirements.preferredProvider)];
        }
      }

      // 根据任务类型过滤（如果提供商支持能力标识）
      if (requirements.requiredCapabilities) {
        filteredProviders = filteredProviders.filter((provider) => {
          const config = provider.getConfig();
          const capabilities = config.models.configs?.[config.models.default]?.capabilities || [];
          return requirements.requiredCapabilities!.every((cap) => capabilities.includes(cap));
        });
      }
    }

    // 根据回退策略排序
    return this.sortProvidersByStrategy(filteredProviders);
  }

  /**
   * 根据策略排序提供商
   * @param providers 提供商列表
   * @returns 排序后的提供商列表
   */
  private sortProvidersByStrategy(providers: AIProvider[]): AIProvider[] {
    switch (this.config.fallbackStrategy) {
      case 'priority':
        return providers.sort((a, b) => a.priority - b.priority);

      case 'cost-optimized':
        return providers.sort((a, b) => {
          const costA = a.getCost(1000); // 比较 1000 token 的成本
          const costB = b.getCost(1000);
          return costA - costB;
        });

      case 'round-robin':
        // 简单的轮询实现
        const now = Date.now();
        const index = Math.floor(now / 60000) % providers.length; // 每分钟轮换
        return [...providers.slice(index), ...providers.slice(0, index)];

      default:
        return providers.sort((a, b) => a.priority - b.priority);
    }
  }

  /**
   * 添加提供商
   * @param provider 提供商实例
   */
  addProvider(provider: AIProvider): void {
    this.providers.set(provider.id, provider);
    this.initializeProviderHealth(provider.id);
  }

  /**
   * 移除提供商
   * @param providerId 提供商 ID
   */
  removeProvider(providerId: string): void {
    this.providers.delete(providerId);
    this.healthStatus.delete(providerId);
    this.usageStats.delete(providerId);
  }

  /**
   * 获取提供商
   * @param providerId 提供商 ID
   * @returns 提供商实例
   */
  getProvider(providerId: string): AIProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * 获取所有提供商
   * @returns 提供商列表
   */
  getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * 获取使用统计
   * @param providerId 可选的提供商 ID
   * @returns 使用统计
   */
  getUsageStats(providerId?: string): UsageStats[] {
    if (providerId) {
      const stats = this.usageStats.get(providerId);
      return stats ? [stats] : [];
    }
    return Array.from(this.usageStats.values());
  }

  /**
   * 获取健康状态
   * @param providerId 可选的提供商 ID
   * @returns 健康状态
   */
  getHealthStatus(providerId?: string): ProviderHealthStatus[] {
    if (providerId) {
      const status = this.healthStatus.get(providerId);
      return status ? [status] : [];
    }
    return Array.from(this.healthStatus.values());
  }

  /**
   * 初始化提供商
   */
  private initializeProviders(): void {
    // 始终添加当前 AI 提供商
    const currentAIProvider = new CurrentAIProvider();
    this.addProvider(currentAIProvider);

    // 加载其他配置的提供商
    const providerConfigs = this.configManager.getAllProviderConfigs();

    for (const config of providerConfigs) {
      if (config.id !== 'current-ai' && this.config.enabledProviders.includes(config.id)) {
        // 这里可以根据配置创建具体的提供商实例
        // 由于我们现在只有基础架构，暂时跳过外部提供商的实例化
        console.log(`Provider ${config.id} configuration loaded but not instantiated yet`);
      }
    }
  }

  /**
   * 初始化提供商健康状态
   * @param providerId 提供商 ID
   */
  private initializeProviderHealth(providerId: string): void {
    this.healthStatus.set(providerId, {
      providerId,
      healthy: true,
      lastChecked: new Date(),
      availability: 100,
    });
  }

  /**
   * 更新使用统计
   * @param providerId 提供商 ID
   * @param response AI 响应
   */
  private updateUsageStats(providerId: string, response: AIResponse): void {
    const today = new Date().toISOString().split('T')[0];
    const key = `${providerId}-${today}`;

    let stats = this.usageStats.get(key);
    if (!stats) {
      stats = {
        providerId,
        date: today,
        requestCount: 0,
        totalTokens: 0,
        totalCost: 0,
        averageResponseTime: 0,
        successRate: 100,
        errors: {},
      };
    }

    stats.requestCount++;
    stats.totalTokens += response.tokensUsed;
    stats.totalCost += response.cost;
    stats.averageResponseTime =
      (stats.averageResponseTime * (stats.requestCount - 1) + response.responseTime) / stats.requestCount;

    this.usageStats.set(key, stats);
  }

  /**
   * 更新健康状态
   * @param providerId 提供商 ID
   * @param healthy 是否健康
   * @param error 错误信息
   */
  private updateHealthStatus(providerId: string, healthy: boolean, error?: string): void {
    const status = this.healthStatus.get(providerId);
    if (status) {
      status.healthy = healthy;
      status.lastChecked = new Date();
      if (error) {
        status.error = error;
      }

      // 更新可用性百分比（简单的滑动窗口）
      if (healthy) {
        status.availability = Math.min(100, status.availability + 1);
      } else {
        status.availability = Math.max(0, status.availability - 5);
      }
    }
  }
}
