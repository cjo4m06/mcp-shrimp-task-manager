/**
 * 统一错误处理工具
 * 提供一致的错误消息格式和多语言支持
 */

import { ZodError } from 'zod';

export interface ErrorResponse {
  success: false;
  error: string;
  errorCode?: string;
  details?: any;
  warnings?: string[];
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  warnings?: string[];
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * 错误类型枚举
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  SYSTEM = 'SYSTEM_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION = 'PERMISSION_ERROR',
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
}

/**
 * 错误消息映射（中英文）
 */
const ERROR_MESSAGES = {
  [ErrorType.VALIDATION]: {
    zh: '参数验证失败',
    en: 'Parameter validation failed',
  },
  [ErrorType.SYSTEM]: {
    zh: '系统错误',
    en: 'System error',
  },
  [ErrorType.NOT_FOUND]: {
    zh: '资源未找到',
    en: 'Resource not found',
  },
  [ErrorType.PERMISSION]: {
    zh: '权限不足',
    en: 'Insufficient permissions',
  },
  [ErrorType.NETWORK]: {
    zh: '网络错误',
    en: 'Network error',
  },
  [ErrorType.TIMEOUT]: {
    zh: '操作超时',
    en: 'Operation timeout',
  },
};

/**
 * 统一错误处理函数
 */
export function handleError(error: unknown, context?: string, language: 'zh' | 'en' = 'zh'): ErrorResponse {
  console.error(`❌ ${context || '操作失败'}:`, error);

  // 处理 Zod 验证错误
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map((err) => {
      const field = err.path.join('.');
      const message = language === 'zh' ? translateZodError(err) : err.message;
      return `${field}: ${message}`;
    });

    return {
      success: false,
      error: `${ERROR_MESSAGES[ErrorType.VALIDATION][language]}: ${validationErrors.join(', ')}`,
      errorCode: ErrorType.VALIDATION,
      details: error.errors,
    };
  }

  // 处理标准错误
  if (error instanceof Error) {
    const errorType = classifyError(error);
    return {
      success: false,
      error: `${ERROR_MESSAGES[errorType][language]}: ${error.message}`,
      errorCode: errorType,
    };
  }

  // 处理未知错误
  return {
    success: false,
    error: `${ERROR_MESSAGES[ErrorType.SYSTEM][language]}: ${String(error)}`,
    errorCode: ErrorType.SYSTEM,
  };
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(data: T, warnings?: string[]): SuccessResponse<T> {
  return {
    success: true,
    data,
    warnings,
  };
}

/**
 * 翻译 Zod 错误消息为中文
 */
function translateZodError(error: any): string {
  switch (error.code) {
    case 'too_small':
      if (error.type === 'string') {
        return `字符串长度不能少于 ${error.minimum} 个字符`;
      }
      if (error.type === 'number') {
        return `数值不能小于 ${error.minimum}`;
      }
      return `值太小`;

    case 'too_big':
      if (error.type === 'string') {
        return `字符串长度不能超过 ${error.maximum} 个字符`;
      }
      if (error.type === 'number') {
        return `数值不能大于 ${error.maximum}`;
      }
      return `值太大`;

    case 'invalid_type':
      return `类型错误，期望 ${error.expected}，实际 ${error.received}`;

    case 'invalid_string':
      return `字符串格式无效`;

    case 'invalid_enum_value':
      return `无效的枚举值，允许的值: ${error.options.join(', ')}`;

    default:
      return error.message || '验证失败';
  }
}

/**
 * 根据错误类型分类
 */
function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase();

  if (message.includes('timeout') || message.includes('超时')) {
    return ErrorType.TIMEOUT;
  }

  if (
    message.includes('network') ||
    message.includes('网络') ||
    message.includes('connection') ||
    message.includes('连接')
  ) {
    return ErrorType.NETWORK;
  }

  if (
    message.includes('not found') ||
    message.includes('未找到') ||
    message.includes('does not exist') ||
    message.includes('不存在')
  ) {
    return ErrorType.NOT_FOUND;
  }

  if (
    message.includes('permission') ||
    message.includes('权限') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    return ErrorType.PERMISSION;
  }

  return ErrorType.SYSTEM;
}

/**
 * 验证并处理输入参数
 */
export function validateAndHandle<T>(schema: any, input: unknown, context?: string): T | ErrorResponse {
  try {
    return schema.parse(input);
  } catch (error) {
    return handleError(error, context);
  }
}
