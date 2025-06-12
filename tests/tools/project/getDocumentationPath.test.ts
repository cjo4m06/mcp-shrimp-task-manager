/**
 * getDocumentationPath MCP 工具单元测试
 * 测试参数验证、返回值格式和错误处理
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDocumentationPath, getDocumentationPathSchema } from '../../../src/tools/project/getDocumentationPath.js';

// Mock pathManager
vi.mock('../../../src/utils/pathManager.js', () => ({
  getDocumentationDir: vi.fn()
}));

// Mock logger
vi.mock('../../../src/utils/logger.js', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

describe('getDocumentationPath MCP 工具测试', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // 设置默认的 mock 返回值
    const { getDocumentationDir } = await import('../../../src/utils/pathManager.js');
    vi.mocked(getDocumentationDir).mockResolvedValue('/test/data/projects/test-project/docs');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('参数验证测试', () => {
    it('应该接受空参数', () => {
      const result = getDocumentationPathSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('应该接受有效的文件名参数', () => {
      const result = getDocumentationPathSchema.safeParse({
        filename: 'test.md'
      });
      expect(result.success).toBe(true);
      expect(result.data?.filename).toBe('test.md');
    });

    it('应该接受有效的子目录参数', () => {
      const result = getDocumentationPathSchema.safeParse({
        subDir: 'analysis'
      });
      expect(result.success).toBe(true);
      expect(result.data?.subDir).toBe('analysis');
    });

    it('应该接受 createDir 参数', () => {
      const result = getDocumentationPathSchema.safeParse({
        createDir: false
      });
      expect(result.success).toBe(true);
      expect(result.data?.createDir).toBe(false);
    });

    it('应该设置 createDir 的默认值为 true', () => {
      const result = getDocumentationPathSchema.safeParse({});
      expect(result.success).toBe(true);
      expect(result.data?.createDir).toBe(true);
    });
  });

  describe('基本功能测试', () => {
    it('应该返回基础文档目录路径', async () => {
      const result = await getDocumentationPath({});
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('文档路径信息');
      expect(result.content[0].text).toContain('/test/data/projects/test-project/docs');
    });

    it('应该处理带文件名的请求', async () => {
      const result = await getDocumentationPath({
        filename: 'test-report.md'
      });
      
      expect(result.content[0].text).toContain('test-report.md');
      expect(result.content[0].text).toContain('📄 文件路径');
    });

    it('应该处理带子目录的请求', async () => {
      const result = await getDocumentationPath({
        subDir: 'analysis'
      });
      
      expect(result.content[0].text).toContain('analysis');
      expect(result.content[0].text).toContain('📁 目录路径');
    });

    it('应该处理子目录和文件名组合', async () => {
      const result = await getDocumentationPath({
        subDir: 'analysis',
        filename: 'complexity-report.md'
      });
      
      expect(result.content[0].text).toContain('analysis');
      expect(result.content[0].text).toContain('complexity-report.md');
      expect(result.content[0].text).toContain('📄 文件路径');
    });
  });

  describe('文件名验证测试', () => {
    it('应该拒绝包含非法字符的文件名', async () => {
      const result = await getDocumentationPath({
        filename: 'test<file>.md'
      });
      
      expect(result.content[0].text).toContain('❌ 获取文档路径失败');
      expect(result.content[0].text).toContain('文件名包含非法字符');
    });

    it('应该拒绝系统保留名称', async () => {
      const result = await getDocumentationPath({
        filename: 'CON.md'
      });
      
      expect(result.content[0].text).toContain('❌ 获取文档路径失败');
      expect(result.content[0].text).toContain('文件名为系统保留名称');
    });

    it('应该拒绝过长的文件名', async () => {
      const longFilename = 'a'.repeat(300) + '.md';
      const result = await getDocumentationPath({
        filename: longFilename
      });
      
      expect(result.content[0].text).toContain('❌ 获取文档路径失败');
      expect(result.content[0].text).toContain('文件名过长');
    });

    it('应该接受有效的文件名', async () => {
      const validFilenames = [
        'test.md',
        'analysis-2025-01-07.md',
        'project_summary.txt',
        'report-v1.0.pdf'
      ];

      for (const filename of validFilenames) {
        const result = await getDocumentationPath({ filename });
        expect(result.content[0].text).not.toContain('❌ 获取文档路径失败');
        expect(result.content[0].text).toContain(filename);
      }
    });
  });

  describe('子目录验证测试', () => {
    it('应该拒绝包含路径遍历的子目录', async () => {
      const maliciousSubDirs = [
        '../../../etc',
        'analysis/../../../secret',
        'test\\..\\..\\windows'
      ];

      for (const subDir of maliciousSubDirs) {
        const result = await getDocumentationPath({ subDir });
        expect(result.content[0].text).toContain('❌ 获取文档路径失败');
        expect(result.content[0].text).toContain('子目录名不能包含路径遍历字符');
      }
    });

    it('应该接受有效的子目录名', async () => {
      const validSubDirs = [
        'analysis',
        'tasks/completed',
        'team/knowledge-base',
        'research/technology'
      ];

      for (const subDir of validSubDirs) {
        const result = await getDocumentationPath({ subDir });
        expect(result.content[0].text).not.toContain('❌ 获取文档路径失败');
        expect(result.content[0].text).toContain(subDir);
      }
    });
  });

  describe('返回值格式测试', () => {
    it('应该返回正确的响应结构', async () => {
      const result = await getDocumentationPath({
        subDir: 'analysis',
        filename: 'test.md'
      });
      
      expect(result).toHaveProperty('content');
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      expect(typeof result.content[0].text).toBe('string');
    });

    it('应该包含所有必要的路径信息', async () => {
      const result = await getDocumentationPath({
        subDir: 'analysis',
        filename: 'test.md'
      });
      
      const text = result.content[0].text;
      expect(text).toContain('基础文档目录');
      expect(text).toContain('目标目录');
      expect(text).toContain('完整路径');
      expect(text).toContain('相对路径');
    });

    it('应该包含正确的技术信息 JSON', async () => {
      const result = await getDocumentationPath({
        filename: 'test.md',
        createDir: false
      });
      
      const text = result.content[0].text;
      expect(text).toContain('```json');
      expect(text).toContain('"success": true');
      expect(text).toContain('"isFile": true');
      expect(text).toContain('"autoCreateEnabled": false');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理 pathManager 错误', async () => {
      const { getDocumentationDir } = await import('../../../src/utils/pathManager.js');
      vi.mocked(getDocumentationDir).mockRejectedValue(new Error('Path manager error'));
      
      const result = await getDocumentationPath({});
      
      expect(result.content[0].text).toContain('❌ 获取文档路径失败');
      expect(result.content[0].text).toContain('Path manager error');
    });

    it('应该记录错误日志', async () => {
      const { log } = await import('../../../src/utils/logger.js');
      const { getDocumentationDir } = await import('../../../src/utils/pathManager.js');
      
      vi.mocked(getDocumentationDir).mockRejectedValue(new Error('Test error'));
      
      await getDocumentationPath({});
      
      expect(log.error).toHaveBeenCalledWith(
        'GetDocumentationPath',
        '获取文档路径失败',
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('跨平台兼容性测试', () => {
    it('应该在不同平台上生成正确的路径', async () => {
      const platforms = ['win32', 'linux', 'darwin'];
      
      for (const platform of platforms) {
        const originalPlatform = process.platform;
        Object.defineProperty(process, 'platform', { value: platform });
        
        const result = await getDocumentationPath({
          subDir: 'analysis',
          filename: 'test.md'
        });
        
        expect(result.content[0].text).toContain('文档路径信息');
        expect(result.content[0].text).not.toContain('❌ 获取文档路径失败');
        
        // 恢复原始平台
        Object.defineProperty(process, 'platform', { value: originalPlatform });
      }
    });
  });
});
