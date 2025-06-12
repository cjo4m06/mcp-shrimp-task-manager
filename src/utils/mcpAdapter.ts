/**
 * MCP 响应适配器
 * 将我们的统一 API 响应格式转换为 MCP 期望的格式
 */

import { type ApiResponse } from './errorHandler.js';

/**
 * MCP 工具响应格式
 */
export interface McpToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

/**
 * 将 ApiResponse 转换为 MCP 工具响应格式
 */
export function adaptToMcpResponse(response: ApiResponse): McpToolResponse {
  if (response.success) {
    // 成功响应
    const result = {
      success: true,
      data: response.data,
      warnings: response.warnings,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } else {
    // 错误响应
    const result = {
      success: false,
      error: response.error,
      errorCode: response.errorCode,
      details: response.details,
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
}

/**
 * 创建错误响应
 */
export function createMcpErrorResponse(error: string): McpToolResponse {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: false,
            error,
          },
          null,
          2
        ),
      },
    ],
  };
}
