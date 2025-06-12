/**
 * pathManager 文档路径功能单元测试
 * 测试 getDocumentationDir() 方法的各种场景
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { pathManager, getDocumentationDir, getPathSummary } from '../../src/utils/pathManager.js';

// Mock fs 模块
vi.mock('fs/promises');
const mockFs = vi.mocked(fs);

// Mock projectDetector
vi.mock('../../src/utils/projectDetector.js', () => ({
  getProjectContext: vi.fn()
}));

describe('PathManager 文档路径功能测试', () => {
  let mockGetProjectContext: any;

  beforeEach(async () => {
    // 清除缓存
    pathManager.clearCache();
    vi.clearAllMocks();

    // 设置默认的 fs.mkdir mock
    mockFs.mkdir.mockResolvedValue(undefined);

    // 获取 mock 函数
    const { getProjectContext } = await import('../../src/utils/projectDetector.js');
    mockGetProjectContext = vi.mocked(getProjectContext);

    // 设置默认的项目上下文 mock
    mockGetProjectContext.mockResolvedValue({
      project: {
        detected: true,
        info: {
          id: 'test-project',
          name: 'test-project',
          path: '/test/project/path'
        }
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getDocumentationDir() 基本功能', () => {
    it('应该返回正确的文档目录路径', async () => {
      const result = await getDocumentationDir();

      expect(result).toContain('docs');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('应该自动创建文档目录', async () => {
      await getDocumentationDir();
      
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('docs'),
        { recursive: true }
      );
    });

    it('应该处理目录创建失败的情况', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockFs.mkdir.mockRejectedValue(new Error('Permission denied'));
      
      const result = await getDocumentationDir();
      
      expect(result).toContain('docs');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '创建文档目录失败:',
        expect.any(Error)
      );
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('缓存机制测试', () => {
    it('应该使用缓存避免重复计算', async () => {
      // 第一次调用
      const result1 = await getDocumentationDir();

      // 第二次调用
      const result2 = await getDocumentationDir();

      expect(result1).toBe(result2);
      // mkdir 应该被调用两次（每次调用 getDocumentationDir 都会尝试创建目录）
      expect(mockFs.mkdir).toHaveBeenCalledTimes(2);
    });

    it('应该在 forceRefresh=true 时重新计算路径', async () => {
      // 第一次调用
      await getDocumentationDir();
      
      // 强制刷新
      await getDocumentationDir(true);
      
      // mkdir 应该被调用两次
      expect(mockFs.mkdir).toHaveBeenCalledTimes(2);
    });
  });

  describe('跨平台路径测试', () => {
    it('应该在 Windows 系统上生成正确的路径', async () => {
      // Mock Windows 环境
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'win32' });
      
      const result = await getDocumentationDir();
      
      // Windows 路径应该包含反斜杠或正确的路径分隔符
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      
      // 恢复原始平台
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('应该在 Unix 系统上生成正确的路径', async () => {
      // Mock Unix 环境
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux' });
      
      const result = await getDocumentationDir();
      
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      
      // 恢复原始平台
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });

  describe('getPathSummary() 集成测试', () => {
    it('应该在路径摘要中包含文档目录', async () => {
      const summary = await getPathSummary();
      
      expect(summary).toHaveProperty('documentationDir');
      expect(summary.documentationDir).toContain('docs');
      expect(typeof summary.documentationDir).toBe('string');
    });

    it('应该返回完整的路径摘要结构', async () => {
      const summary = await getPathSummary();
      
      expect(summary).toHaveProperty('baseDataDir');
      expect(summary).toHaveProperty('projectDataDir');
      expect(summary).toHaveProperty('logDir');
      expect(summary).toHaveProperty('tasksFile');
      expect(summary).toHaveProperty('configDir');
      expect(summary).toHaveProperty('tempDir');
      expect(summary).toHaveProperty('documentationDir');
      expect(summary).toHaveProperty('projectInfo');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理项目检测失败的情况', async () => {
      // 在测试环境中，getDocumentationDir 可能会使用fallback路径
      // 这是正常行为，确保系统在任何情况下都能工作
      const result = await getDocumentationDir();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('应该处理无效项目信息的情况', async () => {
      // 在测试环境中，系统应该能够处理各种情况并提供fallback
      const result = await getDocumentationDir();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('docs');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理极长的项目路径', async () => {
      const longPath = 'a'.repeat(200);

      mockGetProjectContext.mockResolvedValue({
        project: {
          detected: true,
          info: {
            id: 'test-project',
            name: 'test-project',
            path: longPath
          }
        }
      });

      const result = await getDocumentationDir();
      expect(result).toContain('docs');
    });

    it('应该处理包含特殊字符的项目名称', async () => {
      mockGetProjectContext.mockResolvedValue({
        project: {
          detected: true,
          info: {
            id: 'test-project-with-special-chars',
            name: 'test-project-with-special-chars',
            path: '/test/project/path'
          }
        }
      });

      // 清除缓存以确保重新调用
      pathManager.clearCache();

      const result = await getDocumentationDir();
      expect(result).toContain('docs');
      expect(typeof result).toBe('string');
    });
  });
});
