/**
 * 简化的日志系统
 * 将控制台日志同时输出到文件，保存在 DATA_DIR/logs 目录
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logDir: string = '';
  private initialized: boolean = false;
  private logBuffer: string[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly BUFFER_SIZE = 10; // 缓冲区大小
  private readonly FLUSH_INTERVAL = 1000; // 1秒强制刷新

  /**
   * 初始化日志系统
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 获取基础数据目录，避免循环依赖
      const baseDataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
      this.logDir = path.join(baseDataDir, 'logs');

      // 创建日志目录
      await fs.mkdir(this.logDir, { recursive: true });

      // 设置日志级别
      const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();
      if (envLogLevel && envLogLevel in LogLevel) {
        this.logLevel = LogLevel[envLogLevel as keyof typeof LogLevel];
      }

      this.initialized = true;

      // 记录初始化成功
      console.log(`[INFO] 日志系统初始化成功 - 目录: ${this.logDir}`);
      this.addToBuffer('INFO', 'Logger', '日志系统初始化成功', { logDir: this.logDir });
    } catch (error) {
      console.error('日志系统初始化失败:', error);
      // 即使初始化失败，也标记为已初始化，避免重复尝试
      this.initialized = true;
    }
  }

  /**
   * 获取当前日期的日志文件路径
   */
  private getLogFilePath(): string {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.logDir, `app-${today}.log`);
  }

  /**
   * 获取本地时间戳字符串
   * 格式: YYYY-MM-DDTHH:mm:ss.sss+08:00 (北京时间)
   */
  private getLocalTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    // 获取时区偏移量（分钟）
    const timezoneOffset = -now.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
    const offsetMinutes = Math.abs(timezoneOffset) % 60;
    const offsetSign = timezoneOffset >= 0 ? '+' : '-';
    const timezoneString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${timezoneString}`;
  }

  /**
   * 添加日志到缓冲区
   */
  private addToBuffer(level: string, category: string, message: string, data?: any): void {
    if (!this.initialized) {
      // 如果未初始化，先初始化
      this.initialize().catch(() => {});
    }

    const timestamp = this.getLocalTimestamp();
    let dataString = '';

    if (data) {
      try {
        dataString = ` ${JSON.stringify(data)}`;
      } catch (error) {
        // 处理循环引用等JSON序列化错误
        dataString = ` [Circular Reference or Non-serializable Data]`;
      }
    }

    const logEntry = `[${timestamp}] [${level}] [${category}] ${message}${dataString}\n`;

    this.logBuffer.push(logEntry);

    // 如果缓冲区满了，立即刷新
    if (this.logBuffer.length >= this.BUFFER_SIZE) {
      this.flushBuffer();
    } else {
      // 设置定时刷新
      this.scheduleFlush();
    }
  }

  /**
   * 调度刷新
   */
  private scheduleFlush(): void {
    if (this.flushTimer) {
      return; // 已经有定时器了
    }

    this.flushTimer = setTimeout(() => {
      this.flushBuffer();
    }, this.FLUSH_INTERVAL);
  }

  /**
   * 刷新缓冲区到文件
   */
  private flushBuffer(): void {
    if (this.logBuffer.length === 0) {
      return;
    }

    // 清除定时器
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    const entries = this.logBuffer.splice(0); // 清空缓冲区
    const logContent = entries.join('');

    try {
      const logFile = this.getLogFilePath();

      // 使用同步写入确保实时性
      fsSync.appendFileSync(logFile, logContent, 'utf-8');
    } catch (error) {
      // 如果写入失败，输出到控制台并重新加入缓冲区
      console.error('写入日志文件失败:', error);
      // 重新加入缓冲区，避免丢失日志
      this.logBuffer.unshift(...entries);
    }
  }

  /**
   * 强制刷新所有日志
   */
  public flush(): void {
    this.flushBuffer();
  }

  /**
   * 记录日志的通用方法
   */
  private log(level: LogLevel, category: string, message: string, data?: any, error?: Error): void {
    // 检查日志级别
    if (level < this.logLevel) {
      return;
    }

    const levelName = LogLevel[level];
    const consoleMessage = `[${levelName}] [${category}] ${message}`;

    // 输出到控制台
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(consoleMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(consoleMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(consoleMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(consoleMessage, data || '', error || '');
        break;
    }

    // 立即添加到缓冲区
    this.addToBuffer(levelName, category, message, data);
  }

  /**
   * DEBUG级别日志
   */
  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  /**
   * INFO级别日志
   */
  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  /**
   * WARN级别日志
   */
  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  /**
   * ERROR级别日志
   */
  error(category: string, message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  /**
   * 清理资源
   */
  public cleanup(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush(); // 最后刷新一次
  }

  /**
   * 设置项目特定的日志目录
   * 在项目检测完成后调用，避免循环依赖
   */
  async setProjectLogDir(projectDataDir: string): Promise<void> {
    try {
      const newLogDir = path.join(projectDataDir, 'logs');

      // 如果目录不同，则更新
      if (newLogDir !== this.logDir) {
        this.logDir = newLogDir;
        await fs.mkdir(this.logDir, { recursive: true });

        // 记录目录更新
        console.log(`[INFO] [Logger] 日志目录更新为: ${this.logDir}`);
        this.addToBuffer('INFO', 'Logger', '日志目录更新', { newLogDir: this.logDir });
      }
    } catch (error) {
      console.error('设置项目日志目录失败:', error);
    }
  }
}

// 导出Logger类和全局实例
export { Logger };
export const logger = new Logger();

// 导出便捷方法
export const log = {
  debug: (category: string, message: string, data?: any) => logger.debug(category, message, data),
  info: (category: string, message: string, data?: any) => logger.info(category, message, data),
  warn: (category: string, message: string, data?: any) => logger.warn(category, message, data),
  error: (category: string, message: string, error?: Error, data?: any) => logger.error(category, message, error, data),
  init: () => logger.initialize(),
  setProjectDir: (projectDataDir: string) => logger.setProjectLogDir(projectDataDir),
};
