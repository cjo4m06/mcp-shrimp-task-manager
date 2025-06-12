/**
 * Express 服务器工厂
 * 负责创建和管理 Express 服务器实例
 */

import express, { Request, Response, NextFunction } from 'express';
import { Server as HttpServer } from 'http';
import getPort from 'get-port';
import path from 'path';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { fileURLToPath } from 'url';
import { log } from '../utils/logger.js';
import { getProjectDataDir } from '../utils/pathManager.js';

export class ExpressServerFactory {
  private app?: express.Application;
  private httpServer?: HttpServer;
  private sseClients: Response[] = [];
  private port?: number;
  private dataDir?: string;
  private tasksFilePath?: string;

  /**
   * 启动 Express 服务器
   */
  async start(): Promise<void> {
    try {
      log.info('GUI', '启用Web GUI模式');

      // 初始化配置
      await this.initializeConfiguration();

      // 创建 Express 应用
      this.createExpressApp();

      // 设置中间件
      this.setupMiddleware();

      // 设置路由
      this.setupRoutes();

      // 启动服务器
      await this.startHttpServer();

      // 设置文件监听
      this.setupFileWatcher();

      // 创建 WebGUI 文件
      await this.createWebGuiFile();
    } catch (error) {
      log.error('GUI', 'Express服务器启动失败', error as Error);
      throw error;
    }
  }

  /**
   * 停止 Express 服务器
   */
  async stop(): Promise<void> {
    try {
      // 关闭所有 SSE 连接
      this.sseClients.forEach((client) => client.end());
      this.sseClients = [];

      // 关闭 HTTP 服务器
      if (this.httpServer) {
        await new Promise<void>((resolve) => {
          this.httpServer!.close(() => resolve());
        });
      }

      log.info('GUI', 'Express服务器已关闭');
    } catch (error) {
      log.error('GUI', 'Express服务器关闭失败', error as Error);
    }
  }

  /**
   * 初始化配置
   */
  private async initializeConfiguration(): Promise<void> {
    this.dataDir = await getProjectDataDir();
    this.tasksFilePath = path.join(this.dataDir, 'tasks.json');

    // 设置项目特定的日志目录
    await log.setProjectDir(this.dataDir);

    log.info('GUI', '数据目录配置', {
      projectDataDir: this.dataDir,
      tasksFile: this.tasksFilePath,
    });
  }

  /**
   * 创建 Express 应用
   */
  private createExpressApp(): void {
    this.app = express();
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    if (!this.app) return;

    // 设置静态文件目录
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const publicPath = path.join(__dirname, '..', 'public');

    this.app.use(express.static(publicPath));

    // 添加 JSON 解析中间件
    this.app.use(express.json());

    // 添加错误处理中间件
    this.app.use(this.errorHandler.bind(this));
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    if (!this.app || !this.tasksFilePath) return;

    // 任务 API 路由
    this.app.get('/api/tasks', this.handleGetTasks.bind(this));

    // SSE 路由
    this.app.get('/api/tasks/stream', this.handleSseConnection.bind(this));

    // 健康检查路由
    this.app.get('/api/health', this.handleHealthCheck.bind(this));

    // 状态路由
    this.app.get('/api/status', this.handleStatus.bind(this));
  }

  /**
   * 处理获取任务请求
   */
  private async handleGetTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasksData = await fsPromises.readFile(this.tasksFilePath!, 'utf-8');
      res.json(JSON.parse(tasksData));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        res.json({ tasks: [] });
      } else {
        log.error('GUI', '读取任务文件失败', error as Error);
        res.status(500).json({ error: 'Failed to read tasks data' });
      }
    }
  }

  /**
   * 处理 SSE 连接
   */
  private handleSseConnection(req: Request, res: Response): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // 发送初始连接事件
    res.write('data: connected\n\n');

    // 添加客户端到列表
    this.sseClients.push(res);

    // 当客户端断开连接时，从列表中移除
    req.on('close', () => {
      this.sseClients = this.sseClients.filter((client) => client !== res);
    });
  }

  /**
   * 处理健康检查
   */
  private handleHealthCheck(req: Request, res: Response): void {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    });
  }

  /**
   * 处理状态查询
   */
  private handleStatus(req: Request, res: Response): void {
    res.json({
      server: {
        port: this.port,
        sseClients: this.sseClients.length,
        dataDir: this.dataDir,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
    });
  }

  /**
   * 错误处理中间件
   */
  private errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
    log.error('GUI', 'Express错误', error, {
      url: req.url,
      method: req.method,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    });
  }

  /**
   * 启动 HTTP 服务器
   */
  private async startHttpServer(): Promise<void> {
    if (!this.app) return;

    this.port = await getPort();
    log.info('GUI', `获取到可用端口: ${this.port}`);

    this.httpServer = this.app.listen(this.port, () => {
      log.info('GUI', 'HTTP服务器启动成功', {
        port: this.port,
        url: `http://localhost:${this.port}`,
      });
    });
  }

  /**
   * 设置文件监听
   */
  private setupFileWatcher(): void {
    if (!this.tasksFilePath) return;

    try {
      if (fs.existsSync(this.tasksFilePath)) {
        fs.watch(this.tasksFilePath, (eventType, filename) => {
          if (filename && (eventType === 'change' || eventType === 'rename')) {
            this.sendSseUpdate();
          }
        });
      }
    } catch (watchError) {
      log.warn('GUI', '文件监听设置失败', watchError as Error);
    }
  }

  /**
   * 发送 SSE 更新
   */
  private sendSseUpdate(): void {
    this.sseClients.forEach((client) => {
      if (!client.writableEnded) {
        client.write(
          `event: update\ndata: ${JSON.stringify({
            timestamp: Date.now(),
          })}\n\n`
        );
      }
    });

    // 清理已断开的客户端
    this.sseClients = this.sseClients.filter((client) => !client.writableEnded);
  }

  /**
   * 创建 WebGUI 文件
   */
  private async createWebGuiFile(): Promise<void> {
    if (!this.dataDir || !this.port) return;

    try {
      const templatesUse = process.env.TEMPLATES_USE || 'en';
      const getLanguageFromTemplate = (template: string): string => {
        if (template === 'zh') return 'zh-TW';
        if (template === 'en') return 'en';
        return 'en';
      };
      const language = getLanguageFromTemplate(templatesUse);

      const websiteUrl = `[Task Manager UI](http://localhost:${this.port}?lang=${language})`;
      const websiteFilePath = path.join(this.dataDir, 'WebGUI.md');
      await fsPromises.writeFile(websiteFilePath, websiteUrl, 'utf-8');
    } catch (error) {
      log.warn('GUI', '创建WebGUI文件失败', error as Error);
    }
  }

  /**
   * 获取服务器状态
   */
  getStatus() {
    return {
      isRunning: !!this.httpServer,
      port: this.port,
      sseClients: this.sseClients.length,
      dataDir: this.dataDir,
    };
  }
}
