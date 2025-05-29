/**
 * 测试环境下的模块工具函数
 * 用于替代 import.meta.url 在测试环境中的使用
 */

import path from 'path';
import { fileURLToPath } from 'url';

/**
 * 获取当前模块的文件名
 * 在测试环境中提供 import.meta.url 的替代方案
 */
export function getCurrentFilename(): string {
  // 在测试环境中，我们可以使用 __filename 或者构造一个路径
  // 这里返回一个通用的测试路径
  return path.join(process.cwd(), 'src', 'test-module.ts');
}

/**
 * 获取当前模块的目录名
 * 在测试环境中提供 __dirname 的替代方案
 */
export function getCurrentDirname(): string {
  return path.dirname(getCurrentFilename());
}

/**
 * 获取项目根目录
 */
export function getProjectRoot(): string {
  return process.cwd();
}
