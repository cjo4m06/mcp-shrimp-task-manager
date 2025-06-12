/**
 * MCP服务器实例管理器
 * 提供全局访问MCP服务器实例的功能
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

/**
 * 全局MCP服务器实例
 */
let globalServerInstance: Server | null = null;

/**
 * 设置全局MCP服务器实例
 * @param server MCP服务器实例
 */
export function setServerInstance(server: Server): void {
  globalServerInstance = server;
}

/**
 * 获取全局MCP服务器实例
 * @returns MCP服务器实例，如果未设置则返回null
 */
export function getServerInstance(): Server | null {
  return globalServerInstance;
}

/**
 * 检查是否有可用的MCP服务器实例
 * @returns 是否有可用的服务器实例
 */
export function hasServerInstance(): boolean {
  return globalServerInstance !== null;
}
