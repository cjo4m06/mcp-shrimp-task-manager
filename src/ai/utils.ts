/**
 * AI 系统工具函数
 * 提供便捷的 AI 管理功能和辅助函数
 */

import { AIManager } from './manager.js';
import { AIConfigManager } from './config.js';
import { AIResponse, AIExecutionResult, CurrentAIProvider } from './types.js';

/**
 * 创建默认的 AI 管理器实例
 * @param configPath 可选的配置路径
 * @returns AI 管理器实例
 */
export function createDefaultAIManager(configPath?: string): AIManager {
  const configManager = new AIConfigManager(configPath);
  return new AIManager(configManager);
}

/**
 * 检查响应是否来自当前 AI
 * @param response AI 响应或执行结果
 * @returns 是否为当前 AI 响应
 */
export function isCurrentAIResponse(response: AIResponse | AIExecutionResult): boolean {
  if ('response' in response) {
    // AIExecutionResult
    return response.providerId === 'current-ai' || response.response?.metadata?.isCurrentAI === true;
  } else {
    // AIResponse
    return response.providerId === 'current-ai' || (response as AIResponse).metadata?.isCurrentAI === true;
  }
}

/**
 * 检查响应是否需要委托给当前 AI 处理
 * @param response AI 响应
 * @returns 是否需要委托
 */
export function shouldDelegateToCurrentAI(response: AIResponse): boolean {
  return response.metadata?.shouldDelegate === true || response.content.startsWith('[CURRENT_AI_EXECUTION]');
}

/**
 * 提取当前 AI 执行的原始 prompt
 * @param response AI 响应
 * @returns 原始 prompt，如果不是当前 AI 响应则返回 null
 */
export function extractCurrentAIPrompt(response: AIResponse): string | null {
  if (!isCurrentAIResponse(response)) {
    return null;
  }

  // 从元数据中提取
  if (response.metadata?.originalPrompt) {
    return response.metadata.originalPrompt;
  }

  // 从内容中提取
  if (response.content.startsWith('[CURRENT_AI_EXECUTION]')) {
    return response.content.replace('[CURRENT_AI_EXECUTION] ', '');
  }

  return null;
}

/**
 * 创建当前 AI 配置
 * @param useCurrentAI 是否使用当前 AI
 * @param aiName 可选的 AI 名称
 * @param capabilities 可选的能力列表
 * @returns 当前 AI 配置
 */
export function createCurrentAIConfig(
  useCurrentAI: boolean = true,
  aiName?: string,
  capabilities?: string[]
): CurrentAIProvider {
  return {
    useCurrentAI,
    currentAIId: useCurrentAI ? 'current-execution-ai' : undefined,
    currentAIName: aiName || 'Current Execution AI',
    capabilities: capabilities || ['general', 'analysis', 'generation', 'coding'],
  };
}

/**
 * 格式化使用统计信息
 * @param stats 使用统计数组
 * @returns 格式化的统计信息
 */
export function formatUsageStats(stats: any[]): string {
  if (stats.length === 0) {
    return 'No usage statistics available';
  }

  let output = 'AI Provider Usage Statistics:\n';
  output += '================================\n\n';

  for (const stat of stats) {
    output += `Provider: ${stat.providerId}\n`;
    output += `Date: ${stat.date}\n`;
    output += `Requests: ${stat.requestCount}\n`;
    output += `Total Tokens: ${stat.totalTokens.toLocaleString()}\n`;
    output += `Total Cost: $${stat.totalCost.toFixed(4)}\n`;
    output += `Avg Response Time: ${stat.averageResponseTime.toFixed(0)}ms\n`;
    output += `Success Rate: ${stat.successRate.toFixed(1)}%\n`;

    if (Object.keys(stat.errors).length > 0) {
      output += `Errors: ${JSON.stringify(stat.errors)}\n`;
    }

    output += '\n';
  }

  return output;
}

/**
 * 格式化健康状态信息
 * @param healthStatuses 健康状态数组
 * @returns 格式化的健康状态信息
 */
export function formatHealthStatus(healthStatuses: any[]): string {
  if (healthStatuses.length === 0) {
    return 'No health status information available';
  }

  let output = 'AI Provider Health Status:\n';
  output += '==========================\n\n';

  for (const status of healthStatuses) {
    const healthIcon = status.healthy ? '✅' : '❌';
    const availabilityColor = status.availability >= 90 ? '🟢' : status.availability >= 70 ? '🟡' : '🔴';

    output += `${healthIcon} Provider: ${status.providerId}\n`;
    output += `${availabilityColor} Availability: ${status.availability.toFixed(1)}%\n`;
    output += `Last Checked: ${status.lastChecked.toLocaleString()}\n`;

    if (status.responseTime) {
      output += `Response Time: ${status.responseTime}ms\n`;
    }

    if (status.error) {
      output += `Error: ${status.error}\n`;
    }

    output += '\n';
  }

  return output;
}

/**
 * 验证 AI 执行选项
 * @param options 执行选项
 * @returns 验证结果
 */
export function validateAIExecutionOptions(options: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (options.maxTokens !== undefined) {
    if (typeof options.maxTokens !== 'number' || options.maxTokens <= 0) {
      errors.push('maxTokens must be a positive number');
    }
  }

  if (options.temperature !== undefined) {
    if (typeof options.temperature !== 'number' || options.temperature < 0 || options.temperature > 2) {
      errors.push('temperature must be a number between 0 and 2');
    }
  }

  if (options.timeout !== undefined) {
    if (typeof options.timeout !== 'number' || options.timeout <= 0) {
      errors.push('timeout must be a positive number');
    }
  }

  if (options.retryCount !== undefined) {
    if (typeof options.retryCount !== 'number' || options.retryCount < 0) {
      errors.push('retryCount must be a non-negative number');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 计算成本估算
 * @param inputTokens 输入 token 数
 * @param outputTokens 输出 token 数
 * @param inputCostPer1k 每 1000 输入 token 成本
 * @param outputCostPer1k 每 1000 输出 token 成本
 * @returns 总成本
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  inputCostPer1k: number,
  outputCostPer1k: number
): number {
  const inputCost = (inputTokens / 1000) * inputCostPer1k;
  const outputCost = (outputTokens / 1000) * outputCostPer1k;
  return inputCost + outputCost;
}

/**
 * 创建 AI 执行结果的摘要
 * @param result AI 执行结果
 * @returns 结果摘要
 */
export function createExecutionSummary(result: AIExecutionResult): string {
  const status = result.success ? '✅ Success' : '❌ Failed';
  const provider = result.providerId;
  const time = result.executionTime;
  const retries = result.retryCount;

  let summary = `${status} | Provider: ${provider} | Time: ${time}ms`;

  if (retries > 0) {
    summary += ` | Retries: ${retries}`;
  }

  if (result.attemptedProviders.length > 1) {
    summary += ` | Attempted: ${result.attemptedProviders.join(', ')}`;
  }

  if (result.response) {
    summary += ` | Tokens: ${result.response.tokensUsed}`;
    summary += ` | Cost: $${result.response.cost.toFixed(4)}`;
  }

  if (result.error) {
    summary += ` | Error: ${result.error.message}`;
  }

  return summary;
}

/**
 * 检查是否需要成本警告
 * @param currentCost 当前成本
 * @param limit 成本限制
 * @param warningThreshold 警告阈值（0-1）
 * @returns 是否需要警告
 */
export function shouldWarnAboutCost(currentCost: number, limit: number, warningThreshold: number = 0.8): boolean {
  return currentCost >= limit * warningThreshold;
}

/**
 * 生成成本警告消息
 * @param currentCost 当前成本
 * @param limit 成本限制
 * @param period 时间周期
 * @returns 警告消息
 */
export function generateCostWarning(currentCost: number, limit: number, period: string = 'daily'): string {
  const percentage = ((currentCost / limit) * 100).toFixed(1);
  return `⚠️ AI usage cost warning: ${percentage}% of ${period} limit ($${currentCost.toFixed(2)} / $${limit.toFixed(2)})`;
}
