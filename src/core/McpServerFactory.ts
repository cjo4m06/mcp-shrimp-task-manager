/**
 * MCP 服务器工厂
 * 负责创建和管理 MCP 服务器实例
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequest, CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { setServerInstance } from '../utils/serverInstance.js';
import { log } from '../utils/logger.js';
import { ToolRegistry } from './ToolRegistry.js';
import { handleError } from '../utils/errorHandler.js';
import { adaptToMcpResponse } from '../utils/mcpAdapter.js';

export class McpServerFactory {
  private server?: Server;
  private transport?: StdioServerTransport;
  private toolRegistry: ToolRegistry;

  constructor(toolRegistry: ToolRegistry) {
    this.toolRegistry = toolRegistry;
  }

  /**
   * 启动 MCP 服务器
   */
  async start(): Promise<void> {
    try {
      // 创建 MCP 服务器
      this.server = new Server(
        {
          name: 'Shrimp Task Manager',
          version: '1.1.0',
        },
        {
          capabilities: {
            tools: {},
            roots: {
              listChanged: true,
            },
          },
        }
      );

      // 设置全局服务器实例
      setServerInstance(this.server);
      log.info('MCP', '设置全局服务器实例完成');

      // 注册请求处理器
      this.registerRequestHandlers();

      // 建立连接
      log.info('MCP', '建立MCP连接');
      this.transport = new StdioServerTransport();
      await this.server.connect(this.transport);
      log.info('MCP', 'MCP服务器连接成功，开始监听请求');
    } catch (error) {
      log.error('MCP', 'MCP服务器启动失败', error as Error);
      throw error;
    }
  }

  /**
   * 停止 MCP 服务器
   */
  async stop(): Promise<void> {
    try {
      if (this.server && this.transport) {
        // 这里可以添加优雅关闭逻辑
        log.info('MCP', 'MCP服务器正在关闭');
      }
    } catch (error) {
      log.error('MCP', 'MCP服务器关闭失败', error as Error);
    }
  }

  /**
   * 注册请求处理器
   */
  private registerRequestHandlers(): void {
    if (!this.server) {
      throw new Error('Server not initialized');
    }

    // 注册工具列表处理器
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      log.debug('MCP', '收到工具列表请求');
      return this.handleListTools();
    });

    // 注册工具调用处理器
    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      return this.handleToolCall(request);
    });
  }

  /**
   * 处理工具列表请求
   */
  private handleListTools() {
    const tools = this.toolRegistry.getAllTools().map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));

    return { tools };
  }

  /**
   * 处理工具调用请求
   */
  private async handleToolCall(request: CallToolRequest) {
    const startTime = Date.now();
    log.info('MCP', `收到工具调用请求: ${request.params.name}`, {
      toolName: request.params.name,
    });

    try {
      // 验证参数
      if (!request.params.arguments) {
        throw new Error('No arguments provided');
      }

      // 获取工具定义
      const tool = this.toolRegistry.getTool(request.params.name);
      if (!tool) {
        throw new Error(`Tool ${request.params.name} does not exist`);
      }

      // 执行工具
      const result = await this.executeTool(tool, request.params.arguments);

      // 记录执行时间
      const duration = Date.now() - startTime;
      log.debug('MCP', `工具调用完成: ${request.params.name}`, {
        toolName: request.params.name,
        duration: `${duration}ms`,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : String(error);

      log.error('MCP', `工具调用失败: ${request.params.name}`, error as Error, {
        toolName: request.params.name,
        duration,
        arguments: request.params.arguments,
      });

      // 返回统一的错误响应
      return adaptToMcpResponse(handleError(error, `工具调用: ${request.params.name}`));
    }
  }

  /**
   * 执行工具
   */
  private async executeTool(tool: any, args: any): Promise<any> {
    try {
      // 调用工具处理函数
      const result = await tool.handler(args);

      // 如果结果已经是 MCP 格式，直接返回
      if (result && result.content && Array.isArray(result.content)) {
        return result;
      }

      // 否则转换为 MCP 格式
      return adaptToMcpResponse({
        success: true,
        data: result,
      });
    } catch (error) {
      // 统一错误处理
      return adaptToMcpResponse(handleError(error, `执行工具: ${tool.name}`));
    }
  }

  /**
   * 获取服务器实例
   */
  getServer(): Server | undefined {
    return this.server;
  }

  /**
   * 获取服务器状态
   */
  getStatus() {
    return {
      isRunning: !!this.server,
      toolCount: this.toolRegistry.getToolCount(),
      categories: this.toolRegistry.getCategories(),
    };
  }

  /**
   * 获取服务器统计信息
   */
  getStats() {
    return {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      toolRegistry: {
        totalTools: this.toolRegistry.getToolCount(),
        categories: this.toolRegistry.getCategories(),
        toolsByCategory: this.toolRegistry.getCategories().reduce(
          (acc, category) => {
            acc[category] = this.toolRegistry.getToolsByCategory(category).length;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    };
  }
}
