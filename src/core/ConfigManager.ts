/**
 * 配置管理器
 * 统一管理所有应用程序配置
 */

import 'dotenv/config';
import { ApplicationConfig } from './ApplicationBootstrap.js';

export class ConfigManager {
  private applicationConfig: ApplicationConfig;

  constructor() {
    this.applicationConfig = this.loadApplicationConfig();
  }

  /**
   * 初始化配置管理器
   */
  async initialize(): Promise<void> {
    // 确保关键环境变量有默认值
    this.setDefaultEnvironmentVariables();

    // 重新加载配置
    this.applicationConfig = this.loadApplicationConfig();
  }

  /**
   * 获取应用程序配置
   */
  getApplicationConfig(): ApplicationConfig {
    return this.applicationConfig;
  }

  /**
   * 获取数据库配置
   */
  getDatabaseConfig() {
    return {
      // 未来可能的数据库配置
    };
  }

  /**
   * 获取日志配置
   */
  getLoggingConfig() {
    return {
      level: process.env.LOG_LEVEL || 'info',
      toConsole: process.env.LOG_TO_CONSOLE === 'true',
      dataDir: process.env.DATA_DIR,
    };
  }

  /**
   * 获取服务器配置
   */
  getServerConfig() {
    return {
      mcp: {
        name: 'Shrimp Task Manager',
        version: this.applicationConfig.version,
      },
      express: {
        enableGui: this.applicationConfig.enableGui,
        staticPath: 'public',
      },
    };
  }

  /**
   * 获取安全配置
   */
  getSecurityConfig() {
    return {
      enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
      maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || '100'),
      enableCors: process.env.ENABLE_CORS === 'true',
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
    };
  }

  /**
   * 获取性能配置
   */
  getPerformanceConfig() {
    return {
      enableCache: process.env.ENABLE_CACHE !== 'false',
      cacheSize: parseInt(process.env.CACHE_SIZE || '1000'),
      cacheTtl: parseInt(process.env.CACHE_TTL || '300000'), // 5分钟
      enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
    };
  }

  /**
   * 加载应用程序配置
   */
  private loadApplicationConfig(): ApplicationConfig {
    return {
      enableGui: process.env.ENABLE_GUI === 'true',
      version: this.getVersion(),
      projectAutoDetect: process.env.PROJECT_AUTO_DETECT === 'true',
      templatesUse: process.env.TEMPLATES_USE || 'zh',
    };
  }

  /**
   * 设置默认环境变量
   */
  private setDefaultEnvironmentVariables(): void {
    if (!process.env.PROJECT_AUTO_DETECT) {
      process.env.PROJECT_AUTO_DETECT = 'true';
    }
    if (!process.env.TEMPLATES_USE) {
      process.env.TEMPLATES_USE = 'zh';
    }
    if (!process.env.LOG_LEVEL) {
      process.env.LOG_LEVEL = 'info';
    }
    if (!process.env.ENABLE_CACHE) {
      process.env.ENABLE_CACHE = 'true';
    }
  }

  /**
   * 获取版本号
   */
  private getVersion(): string {
    // 从 package.json 读取版本号
    try {
      // 在实际实现中，这里应该从 package.json 读取
      return '1.1.0';
    } catch (error) {
      return '1.0.0';
    }
  }

  /**
   * 验证配置
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证必需的环境变量
    const requiredEnvVars = ['DATA_DIR'];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        errors.push(`Missing required environment variable: ${envVar}`);
      }
    }

    // 验证数值配置
    const numericConfigs = [
      { key: 'MAX_REQUESTS_PER_MINUTE', min: 1, max: 10000 },
      { key: 'CACHE_SIZE', min: 100, max: 100000 },
      { key: 'CACHE_TTL', min: 1000, max: 3600000 },
    ];

    for (const config of numericConfigs) {
      const value = process.env[config.key];
      if (value) {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < config.min || numValue > config.max) {
          errors.push(`Invalid value for ${config.key}: must be between ${config.min} and ${config.max}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 获取环境信息
   */
  getEnvironmentInfo() {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV || 'development',
      pid: process.pid,
      uptime: process.uptime(),
    };
  }
}
