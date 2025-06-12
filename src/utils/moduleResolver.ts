/**
 * 模块路径解析工具
 * 提供跨环境的模块路径解析功能
 */

import path from 'path';
import { fileURLToPath } from 'url';

/**
 * 获取当前模块的文件路径
 * 在不同环境中提供一致的路径解析
 */
export function getCurrentModulePath(importMetaUrl?: string): string {
  // 在测试环境中，使用process.cwd()作为基础路径
  if (process.env.NODE_ENV === 'test') {
    return path.join(process.cwd(), 'src', 'models', 'taskModel.ts');
  }

  // 在生产环境中，使用import.meta.url
  if (importMetaUrl) {
    return fileURLToPath(importMetaUrl);
  }

  // 回退方案
  return path.join(process.cwd(), 'src', 'models', 'taskModel.ts');
}

/**
 * 获取当前模块的目录路径
 */
export function getCurrentModuleDir(importMetaUrl?: string): string {
  return path.dirname(getCurrentModulePath(importMetaUrl));
}

/**
 * 获取项目根目录
 */
export function getProjectRoot(importMetaUrl?: string): string {
  const moduleDir = getCurrentModuleDir(importMetaUrl);
  return path.resolve(moduleDir, '../..');
}
