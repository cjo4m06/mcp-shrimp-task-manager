/**
 * AI 配置管理
 * 处理 AI 提供商的配置加载、验证和管理
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AIManagerConfig, AIProviderConfig, CurrentAIProvider } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AIConfigManager {
  private configCache: Map<string, any> = new Map();
  private configPath: string;

  constructor(configPath?: string) {
    this.configPath = configPath || this.getDefaultConfigPath();
  }

  /**
   * 加载 AI 管理器配置
   * @returns AI 管理器配置
   */
  loadManagerConfig(): AIManagerConfig {
    const cacheKey = 'manager-config';

    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey);
    }

    try {
      const configFile = path.join(this.configPath, 'ai-config.json');

      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf-8');
        const config = JSON.parse(content) as AIManagerConfig;
        this.configCache.set(cacheKey, config);
        return config;
      }
    } catch (error) {
      console.warn(`Failed to load AI manager config: ${error}`);
    }

    // 返回默认配置
    const defaultConfig = this.getDefaultManagerConfig();
    this.configCache.set(cacheKey, defaultConfig);
    return defaultConfig;
  }

  /**
   * 加载提供商配置
   * @param providerId 提供商 ID
   * @returns 提供商配置
   */
  loadProviderConfig(providerId: string): AIProviderConfig | null {
    const cacheKey = `provider-${providerId}`;

    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey);
    }

    try {
      const configFile = path.join(this.configPath, 'providers', `${providerId}.json`);

      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf-8');
        const config = JSON.parse(content) as AIProviderConfig;

        // 从环境变量加载敏感信息
        this.loadEnvironmentVariables(config);

        this.configCache.set(cacheKey, config);
        return config;
      }
    } catch (error) {
      console.warn(`Failed to load provider config for ${providerId}: ${error}`);
    }

    return null;
  }

  /**
   * 获取所有可用的提供商配置
   * @returns 提供商配置数组
   */
  getAllProviderConfigs(): AIProviderConfig[] {
    const configs: AIProviderConfig[] = [];
    const providersDir = path.join(this.configPath, 'providers');

    if (!fs.existsSync(providersDir)) {
      return configs;
    }

    try {
      const files = fs.readdirSync(providersDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const providerId = path.basename(file, '.json');
          const config = this.loadProviderConfig(providerId);

          if (config) {
            configs.push(config);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to load provider configs: ${error}`);
    }

    return configs;
  }

  /**
   * 保存 AI 管理器配置
   * @param config 配置对象
   */
  saveManagerConfig(config: AIManagerConfig): void {
    try {
      this.ensureConfigDirectory();
      const configFile = path.join(this.configPath, 'ai-config.json');
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      this.configCache.set('manager-config', config);
    } catch (error) {
      throw new Error(`Failed to save AI manager config: ${error}`);
    }
  }

  /**
   * 保存提供商配置
   * @param config 提供商配置
   */
  saveProviderConfig(config: AIProviderConfig): void {
    try {
      this.ensureProvidersDirectory();
      const configFile = path.join(this.configPath, 'providers', `${config.id}.json`);

      // 移除敏感信息（API 密钥等）
      const sanitizedConfig = this.sanitizeConfig(config);

      fs.writeFileSync(configFile, JSON.stringify(sanitizedConfig, null, 2));
      this.configCache.set(`provider-${config.id}`, config);
    } catch (error) {
      throw new Error(`Failed to save provider config for ${config.id}: ${error}`);
    }
  }

  /**
   * 获取当前 AI 提供商配置
   * @returns 当前 AI 配置
   */
  getCurrentAIConfig(): CurrentAIProvider {
    try {
      const configFile = path.join(this.configPath, 'current-ai.json');

      if (fs.existsSync(configFile)) {
        const content = fs.readFileSync(configFile, 'utf-8');
        return JSON.parse(content) as CurrentAIProvider;
      }
    } catch (error) {
      console.warn(`Failed to load current AI config: ${error}`);
    }

    // 默认使用当前执行的 AI
    return {
      useCurrentAI: true,
      currentAIId: 'current-execution-ai',
      currentAIName: 'Current Execution AI',
      capabilities: ['general', 'analysis', 'generation', 'coding'],
    };
  }

  /**
   * 设置当前 AI 提供商配置
   * @param config 当前 AI 配置
   */
  setCurrentAIConfig(config: CurrentAIProvider): void {
    try {
      this.ensureConfigDirectory();
      const configFile = path.join(this.configPath, 'current-ai.json');
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save current AI config: ${error}`);
    }
  }

  /**
   * 验证提供商配置
   * @param config 提供商配置
   * @returns 验证结果
   */
  validateProviderConfig(config: AIProviderConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.id) {
      errors.push('Provider ID is required');
    }

    if (!config.name) {
      errors.push('Provider name is required');
    }

    if (!config.models?.default) {
      errors.push('Default model is required');
    }

    if (!config.models?.available || config.models.available.length === 0) {
      errors.push('At least one available model is required');
    }

    if (!config.limits) {
      errors.push('Limits configuration is required');
    }

    if (!config.pricing) {
      errors.push('Pricing configuration is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 清除配置缓存
   * @param key 可选的特定缓存键
   */
  clearCache(key?: string): void {
    if (key) {
      this.configCache.delete(key);
    } else {
      this.configCache.clear();
    }
  }

  /**
   * 从环境变量加载敏感信息
   * @param config 提供商配置
   */
  private loadEnvironmentVariables(config: AIProviderConfig): void {
    // 从环境变量加载 API 密钥
    const envKeyName = `AI_${config.id.toUpperCase()}_API_KEY`;
    const apiKey = process.env[envKeyName];

    if (apiKey) {
      config.apiKey = apiKey;
    }

    // 从环境变量加载 API 端点
    const envEndpointName = `AI_${config.id.toUpperCase()}_ENDPOINT`;
    const apiEndpoint = process.env[envEndpointName];

    if (apiEndpoint) {
      config.apiEndpoint = apiEndpoint;
    }
  }

  /**
   * 清理配置中的敏感信息
   * @param config 原始配置
   * @returns 清理后的配置
   */
  private sanitizeConfig(config: AIProviderConfig): AIProviderConfig {
    const sanitized = { ...config };

    // 移除 API 密钥
    if (sanitized.apiKey) {
      delete sanitized.apiKey;
    }

    return sanitized;
  }

  /**
   * 获取默认配置路径
   * @returns 配置路径
   */
  private getDefaultConfigPath(): string {
    // 尝试从项目根目录查找配置
    let currentDir = __dirname;

    while (currentDir && currentDir !== path.dirname(currentDir)) {
      const configDir = path.join(currentDir, 'config', 'ai');
      if (fs.existsSync(configDir)) {
        return configDir;
      }
      currentDir = path.dirname(currentDir);
    }

    // 如果找不到，使用默认路径
    return path.join(__dirname, '..', '..', 'config', 'ai');
  }

  /**
   * 确保配置目录存在
   */
  private ensureConfigDirectory(): void {
    if (!fs.existsSync(this.configPath)) {
      fs.mkdirSync(this.configPath, { recursive: true });
    }
  }

  /**
   * 确保提供商配置目录存在
   */
  private ensureProvidersDirectory(): void {
    const providersDir = path.join(this.configPath, 'providers');
    if (!fs.existsSync(providersDir)) {
      fs.mkdirSync(providersDir, { recursive: true });
    }
  }

  /**
   * 获取默认 AI 管理器配置
   * @returns 默认配置
   */
  private getDefaultManagerConfig(): AIManagerConfig {
    return {
      enabledProviders: ['current-ai'], // 默认只启用当前 AI
      fallbackStrategy: 'priority',
      globalOptions: {
        maxTokens: 4000,
        temperature: 0.7,
        timeout: 30000,
        retryCount: 2,
      },
      costControl: {
        dailyCostLimit: 10.0,
        monthlyCostLimit: 100.0,
        warningThreshold: 0.8,
      },
      monitoring: {
        enableUsageStats: true,
        enablePerformanceMonitoring: true,
        logLevel: 'info',
      },
    };
  }
}
