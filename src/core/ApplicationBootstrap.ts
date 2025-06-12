/**
 * 应用程序引导器
 * 负责协调各个组件的初始化和启动
 */

import { log } from '../utils/logger.js';
import { getProjectDataDir } from '../utils/pathManager.js';
import { ConfigManager } from './ConfigManager.js';
import { McpServerFactory } from './McpServerFactory.js';
import { ExpressServerFactory } from './ExpressServerFactory.js';
import { ToolRegistry } from './ToolRegistry.js';

export interface ApplicationConfig {
  enableGui: boolean;
  version: string;
  projectAutoDetect: boolean;
  templatesUse: string;
}

export class ApplicationBootstrap {
  private configManager: ConfigManager;
  private toolRegistry: ToolRegistry;
  private mcpServerFactory: McpServerFactory;
  private expressServerFactory?: ExpressServerFactory;

  constructor() {
    this.configManager = new ConfigManager();
    this.toolRegistry = new ToolRegistry();
    this.mcpServerFactory = new McpServerFactory(this.toolRegistry);
  }

  /**
   * 启动应用程序
   */
  async start(): Promise<void> {
    try {
      // 1. 初始化配置
      await this.initializeConfiguration();

      // 2. 初始化日志系统
      await this.initializeLogging();

      // 3. 注册工具
      await this.registerTools();

      // 4. 启动服务器
      await this.startServers();

      // 5. 设置清理处理器
      this.setupCleanupHandlers();

      log.info('System', '应用程序启动完成');
    } catch (error) {
      log.error('System', '应用程序启动失败', error as Error);
      throw error;
    }
  }

  /**
   * 初始化配置
   */
  private async initializeConfiguration(): Promise<void> {
    await this.configManager.initialize();

    const config = this.configManager.getApplicationConfig();
    log.info('System', 'MCP Shrimp Task Manager 启动', {
      version: config.version,
      nodeVersion: process.version,
      platform: process.platform,
      env: {
        ENABLE_GUI: config.enableGui,
        PROJECT_AUTO_DETECT: config.projectAutoDetect,
        TEMPLATES_USE: config.templatesUse,
      },
    });
  }

  /**
   * 初始化日志系统
   */
  private async initializeLogging(): Promise<void> {
    await log.init();

    // 设置项目特定的日志目录
    const projectDataDir = await getProjectDataDir();
    await log.setProjectDir(projectDataDir);

    log.info('System', '日志系统初始化完成', { projectDataDir });
  }

  /**
   * 注册工具
   */
  private async registerTools(): Promise<void> {
    await this.toolRegistry.discoverAndRegisterTools();
    log.info('System', '工具注册完成', {
      toolCount: this.toolRegistry.getToolCount(),
    });
  }

  /**
   * 启动服务器
   */
  private async startServers(): Promise<void> {
    const config = this.configManager.getApplicationConfig();

    // 启动 Express 服务器（如果启用 GUI）
    if (config.enableGui) {
      this.expressServerFactory = new ExpressServerFactory();
      await this.expressServerFactory.start();
      log.info('System', 'Express 服务器启动完成');
    }

    // 启动 MCP 服务器
    await this.mcpServerFactory.start();
    log.info('System', 'MCP 服务器启动完成');
  }

  /**
   * 设置清理处理器
   */
  private setupCleanupHandlers(): void {
    const cleanup = async () => {
      log.info('System', '正在清理资源...');

      try {
        // 停止 Express 服务器
        if (this.expressServerFactory) {
          await this.expressServerFactory.stop();
        }

        // 停止 MCP 服务器
        await this.mcpServerFactory.stop();

        // 清理日志系统
        const { logger } = await import('../utils/logger.js');
        logger.cleanup();

        log.info('System', '资源清理完成');
      } catch (error) {
        console.error('清理资源时发生错误:', error);
      }

      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
  }

  /**
   * 获取配置管理器
   */
  getConfigManager(): ConfigManager {
    return this.configManager;
  }

  /**
   * 获取工具注册表
   */
  getToolRegistry(): ToolRegistry {
    return this.toolRegistry;
  }
}
