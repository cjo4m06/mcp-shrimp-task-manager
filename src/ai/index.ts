/**
 * AI 提供商管理系统导出
 * 统一导出所有 AI 相关的类型、类和函数
 */

// 导出类型定义
export type {
  AIProvider,
  AIExecutionOptions,
  AIResponse,
  AIProviderConfig,
  ModelConfig,
  AIManagerConfig,
  ProviderSelectionRequirements,
  UsageStats,
  AIExecutionResult,
  ProviderHealthStatus,
  CurrentAIProvider as CurrentAIConfig,
  AIProviderFactory,
} from './types.js';

// 导出核心类
export { AIManager } from './manager.js';
export { AIConfigManager } from './config.js';

// 导出提供商类
export { CurrentAIProvider } from './providers/CurrentAIProvider.js';
export { BaseExternalProvider } from './providers/BaseExternalProvider.js';

// 导出工具函数
export {
  createDefaultAIManager,
  isCurrentAIResponse,
  shouldDelegateToCurrentAI,
  extractCurrentAIPrompt,
  createCurrentAIConfig,
  formatUsageStats,
  formatHealthStatus,
  validateAIExecutionOptions,
  calculateCost,
  createExecutionSummary,
  shouldWarnAboutCost,
  generateCostWarning,
} from './utils.js';
