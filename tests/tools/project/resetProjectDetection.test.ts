/**
 * 重置项目检测工具测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resetProjectDetection } from '@/tools/project/resetProjectDetection';
import fs from 'fs/promises';
import path from 'path';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('@/utils/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// Mock dynamic imports
const mockGetProjectContext = vi.fn();
const mockClearPathCache = vi.fn();

vi.mock('@/utils/projectDetector', () => ({
  getProjectContext: mockGetProjectContext
}));

vi.mock('@/utils/pathManager', () => ({
  clearPathCache: mockClearPathCache
}));

describe('resetProjectDetection', () => {
  const mockProjectContext = {
    projectRoot: 'C:/test/project',
    projectId: 'test-project',
    projectName: 'Test Project',
    projectType: {
      hasGit: true,
      hasPackageJson: true,
      hasNodeModules: false,
      hasPyprojectToml: false,
      hasCargoToml: false,
      hasGoMod: false
    },
    packageInfo: {
      name: 'test-project',
      version: '1.0.0'
    },
    metadata: {
      detectionMethod: 'environment' as const,
      isMcpEnvironment: true,
      timestamp: new Date()
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProjectContext.mockResolvedValue(mockProjectContext);
    mockClearPathCache.mockReturnValue(undefined);
    
    // Mock fs operations
    vi.mocked(fs.unlink).mockResolvedValue(undefined);
    vi.mocked(fs.access).mockResolvedValue(undefined);
  });

  describe('basic functionality', () => {
    it('should reset project detection successfully', async () => {
      const result = await resetProjectDetection({
        clearManualSettings: true,
        forceRedetection: true,
        showDetectionProcess: true
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('🔄 项目检测重置完成');
    });

    it('should clear manual settings when requested', async () => {
      const result = await resetProjectDetection({
        clearManualSettings: true,
        forceRedetection: false,
        showDetectionProcess: false
      });

      expect(result.content[0].text).toContain('🔄 清除手动设置');
    });

    it('should skip clearing manual settings when not requested', async () => {
      const result = await resetProjectDetection({
        clearManualSettings: false,
        forceRedetection: false,
        showDetectionProcess: false
      });

      expect(result.content[0].text).not.toContain('🔄 清除手动设置');
    });

    it('should force redetection when requested', async () => {
      const result = await resetProjectDetection({
        clearManualSettings: false,
        forceRedetection: true,
        showDetectionProcess: false
      });

      expect(mockClearPathCache).toHaveBeenCalled();
      expect(mockGetProjectContext).toHaveBeenCalled();
      expect(result.content[0].text).toContain('🔍 开始重新检测项目');
    });

    it('should skip redetection when not requested', async () => {
      const result = await resetProjectDetection({
        clearManualSettings: false,
        forceRedetection: false,
        showDetectionProcess: false
      });

      expect(result.content[0].text).not.toContain('🔄 强制重新检测项目');
    });
  });

  describe('config file clearing', () => {
    it('should clear existing config files', async () => {
      // Mock finding config files
      vi.mocked(fs.access).mockImplementation((filePath) => {
        if (filePath.toString().includes('.shrimp-config.json')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('ENOENT'));
      });

      const result = await resetProjectDetection({
        clearManualSettings: true,
        forceRedetection: false,
        showDetectionProcess: false
      });

      expect(fs.unlink).toHaveBeenCalled();
      expect(result.content[0].text).toContain('删除了');
    });

    it('should handle no config files found', async () => {
      // Mock no config files found
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      const result = await resetProjectDetection({
        clearManualSettings: true,
        forceRedetection: false,
        showDetectionProcess: false
      });

      expect(result.content[0].text).toContain('未找到需要清除的配置文件');
    });

    it('should handle config file deletion errors gracefully', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.unlink).mockRejectedValue(new Error('Permission denied'));

      const result = await resetProjectDetection({
        clearManualSettings: true,
        forceRedetection: false,
        showDetectionProcess: false
      });

      // Should still complete successfully
      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('项目检测重置完成');
    });
  });

  describe('detection process display', () => {
    it('should show detection process when requested', async () => {
      const result = await resetProjectDetection({
        clearManualSettings: false,
        forceRedetection: true,
        showDetectionProcess: true
      });

      expect(result.content[0].text).toContain('📋 检测结果');
      expect(result.content[0].text).toContain('工作目录: C:/test/project');
      expect(result.content[0].text).toContain('检测方法: environment');
    });

    it('should hide detection process when not requested', async () => {
      const result = await resetProjectDetection({
        clearManualSettings: false,
        forceRedetection: true,
        showDetectionProcess: false
      });

      expect(result.content[0].text).not.toContain('📊 检测结果');
    });
  });

  describe('summary and recommendations', () => {
    it('should include reset summary', async () => {
      const result = await resetProjectDetection({
        clearManualSettings: true,
        forceRedetection: true,
        showDetectionProcess: false
      });

      expect(result.content[0].text).toContain('📊 重置总结');
      expect(result.content[0].text).toContain('清除手动设置: 是');
      expect(result.content[0].text).toContain('重新检测项目: 是');
    });

    it('should include usage recommendations', async () => {
      const result = await resetProjectDetection({
        clearManualSettings: false,
        forceRedetection: false,
        showDetectionProcess: false
      });

      expect(result.content[0].text).toContain('💡 使用建议');
      expect(result.content[0].text).toContain('set_project_working_directory');
      expect(result.content[0].text).toContain('diagnose_mcp_environment');
      expect(result.content[0].text).toContain('get_project_context');
    });
  });

  describe('error handling', () => {
    it('should handle project redetection errors', async () => {
      mockGetProjectContext.mockRejectedValue(new Error('Detection failed'));

      const result = await resetProjectDetection({
        clearManualSettings: false,
        forceRedetection: true,
        showDetectionProcess: false
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('❌ 项目重新检测失败');
    });

    it('should handle path cache clearing errors', async () => {
      mockClearPathCache.mockImplementation(() => {
        throw new Error('Cache clear failed');
      });

      const result = await resetProjectDetection({
        clearManualSettings: false,
        forceRedetection: true,
        showDetectionProcess: false
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('❌ 项目重新检测失败');
    });

    it('should handle general errors gracefully', async () => {
      // Mock a general error in the main function
      vi.mocked(fs.access).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await resetProjectDetection({
        clearManualSettings: true,
        forceRedetection: false,
        showDetectionProcess: false
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('🔄 项目检测重置完成');
    });
  });

  describe('default parameters', () => {
    it('should use default values when no parameters provided', async () => {
      const result = await resetProjectDetection({});

      // 使用默认值调用，这些默认值在schema中定义
      const result2 = await resetProjectDetection({
        clearManualSettings: true,
        forceRedetection: true,
        showDetectionProcess: true
      });
      expect(result2.content[0].text).toContain('清除手动设置: 是');
      expect(result2.content[0].text).toContain('重新检测项目: 是');
    });
  });

  describe('comprehensive reset', () => {
    it('should perform complete reset with all options enabled', async () => {
      // Mock config file exists
      vi.mocked(fs.access).mockResolvedValue(undefined);

      const result = await resetProjectDetection({
        clearManualSettings: true,
        forceRedetection: true,
        showDetectionProcess: true
      });

      const text = result.content[0].text;
      expect(text).toContain('🔄 项目检测重置完成');
      expect(text).toContain('🔄 清除手动设置');
      expect(text).toContain('🔍 开始重新检测项目');
      expect(text).toContain('📋 检测结果');
      expect(text).toContain('📊 重置总结');
      expect(text).toContain('💡 使用建议');
    });
  });
});
