/**
 * AI 提供商管理系统类型定义
 * 支持多个 AI 提供商的统一接口和管理
 */

// AI 提供商基础接口
export interface AIProvider {
  /** 提供商唯一标识符 */
  id: string;
  /** 提供商名称 */
  name: string;
  /** 提供商描述 */
  description?: string;
  /** 是否启用 */
  enabled: boolean;
  /** 优先级（数字越小优先级越高） */
  priority: number;

  /** 检查提供商是否可用 */
  isAvailable(): Promise<boolean>;

  /** 执行 prompt */
  executePrompt(prompt: string, options?: AIExecutionOptions): Promise<AIResponse>;

  /** 获取成本估算 */
  getCost(tokens: number): number;

  /** 获取提供商配置 */
  getConfig(): AIProviderConfig;

  /** 验证配置 */
  validateConfig(): Promise<boolean>;
}

// AI 执行选项
export interface AIExecutionOptions {
  /** 模型名称 */
  model?: string;
  /** 最大 token 数 */
  maxTokens?: number;
  /** 温度参数 */
  temperature?: number;
  /** 超时时间（毫秒） */
  timeout?: number;
  /** 重试次数 */
  retryCount?: number;
  /** 流式响应 */
  stream?: boolean;
  /** 自定义参数 */
  customParams?: Record<string, any>;
}

// AI 响应
export interface AIResponse {
  /** 响应内容 */
  content: string;
  /** 使用的模型 */
  model: string;
  /** 使用的 token 数 */
  tokensUsed: number;
  /** 成本 */
  cost: number;
  /** 响应时间（毫秒） */
  responseTime: number;
  /** 提供商 ID */
  providerId: string;
  /** 元数据 */
  metadata?: Record<string, any>;
}

// AI 提供商配置
export interface AIProviderConfig {
  /** 提供商 ID */
  id: string;
  /** 提供商名称 */
  name: string;
  /** API 端点 */
  apiEndpoint?: string;
  /** API 密钥 */
  apiKey?: string;
  /** 支持的模型 */
  models: {
    /** 默认模型 */
    default: string;
    /** 可用模型列表 */
    available: string[];
    /** 模型配置 */
    configs?: Record<string, ModelConfig>;
  };
  /** 限制配置 */
  limits: {
    /** 每分钟请求数 */
    requestsPerMinute: number;
    /** 每天请求数 */
    requestsPerDay: number;
    /** 最大 token 数 */
    maxTokens: number;
  };
  /** 成本配置 */
  pricing: {
    /** 每 1000 token 的输入成本 */
    inputCostPer1kTokens: number;
    /** 每 1000 token 的输出成本 */
    outputCostPer1kTokens: number;
  };
  /** 其他配置 */
  settings?: Record<string, any>;
}

// 模型配置
export interface ModelConfig {
  /** 模型名称 */
  name: string;
  /** 最大 token 数 */
  maxTokens: number;
  /** 支持的功能 */
  capabilities: string[];
  /** 成本倍数 */
  costMultiplier: number;
}

// AI 管理器配置
export interface AIManagerConfig {
  /** 默认提供商 ID */
  defaultProvider?: string;
  /** 启用的提供商列表 */
  enabledProviders: string[];
  /** 失败回退策略 */
  fallbackStrategy: 'priority' | 'round-robin' | 'cost-optimized';
  /** 全局执行选项 */
  globalOptions: AIExecutionOptions;
  /** 成本控制 */
  costControl: {
    /** 每日成本限制 */
    dailyCostLimit: number;
    /** 每月成本限制 */
    monthlyCostLimit: number;
    /** 成本警告阈值 */
    warningThreshold: number;
  };
  /** 监控配置 */
  monitoring: {
    /** 启用使用统计 */
    enableUsageStats: boolean;
    /** 启用性能监控 */
    enablePerformanceMonitoring: boolean;
    /** 日志级别 */
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

// 提供商选择要求
export interface ProviderSelectionRequirements {
  /** 任务类型 */
  taskType?: 'analysis' | 'generation' | 'research' | 'coding' | 'general';
  /** 复杂度级别 */
  complexity?: 'low' | 'medium' | 'high';
  /** 成本预算 */
  budget?: number;
  /** 性能要求 */
  performance?: 'fast' | 'balanced' | 'quality';
  /** 必需的功能 */
  requiredCapabilities?: string[];
  /** 排除的提供商 */
  excludeProviders?: string[];
  /** 首选提供商 */
  preferredProvider?: string;
}

// 使用统计
export interface UsageStats {
  /** 提供商 ID */
  providerId: string;
  /** 日期 */
  date: string;
  /** 请求数 */
  requestCount: number;
  /** 总 token 数 */
  totalTokens: number;
  /** 总成本 */
  totalCost: number;
  /** 平均响应时间 */
  averageResponseTime: number;
  /** 成功率 */
  successRate: number;
  /** 错误统计 */
  errors: Record<string, number>;
}

// AI 执行结果
export interface AIExecutionResult {
  /** 是否成功 */
  success: boolean;
  /** 响应内容 */
  response?: AIResponse;
  /** 错误信息 */
  error?: Error;
  /** 使用的提供商 */
  providerId: string;
  /** 尝试的提供商列表 */
  attemptedProviders: string[];
  /** 执行时间 */
  executionTime: number;
  /** 重试次数 */
  retryCount: number;
}

// 提供商健康状态
export interface ProviderHealthStatus {
  /** 提供商 ID */
  providerId: string;
  /** 是否健康 */
  healthy: boolean;
  /** 最后检查时间 */
  lastChecked: Date;
  /** 响应时间 */
  responseTime?: number;
  /** 错误信息 */
  error?: string;
  /** 可用性百分比 */
  availability: number;
}

// 当前执行的 AI 提供商（默认提供商）
export interface CurrentAIProvider {
  /** 是否使用当前执行的 AI */
  useCurrentAI: boolean;
  /** 当前 AI 的标识 */
  currentAIId?: string;
  /** 当前 AI 的名称 */
  currentAIName?: string;
  /** 当前 AI 的能力描述 */
  capabilities?: string[];
}

// AI 提供商工厂接口
export interface AIProviderFactory {
  /** 创建提供商实例 */
  createProvider(config: AIProviderConfig): AIProvider;
  /** 获取支持的提供商类型 */
  getSupportedTypes(): string[];
  /** 验证配置 */
  validateConfig(config: AIProviderConfig): boolean;
}
