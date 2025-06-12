/**
 * MCP Shrimp Task Manager - 主入口文件
 * 简化的应用程序启动器，使用模块化架构
 */

import 'dotenv/config';
import { ApplicationBootstrap } from './core/ApplicationBootstrap.js';
import { log } from './utils/logger.js';

/**
 * 主应用程序入口函数
 * 负责创建和启动应用程序实例
 */
async function main(): Promise<void> {
  try {
    // 初始化日志系统
    await log.init();

    // 创建并启动应用程序
    const app = new ApplicationBootstrap();
    await app.start();
  } catch (error) {
    log.error('Application', '应用程序启动失败', error as Error);
    process.exit(1);
  }
}

// 启动应用程序
main().catch((error) => {
  log.error('Application', '应用程序启动异常', error as Error);
  process.exit(1);
});
