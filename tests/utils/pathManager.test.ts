/**
 * 路径管理器单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { pathManager, getProjectDataDir, getLogDir, getTasksFilePath, clearPathCache, updateProjectPath } from '@/utils/pathManager';
import * as projectDetector from '@/utils/projectDetector';
import path from 'path';

// Mock projectDetector
vi.mock('@/utils/projectDetector', () => ({
  getProjectContext: vi.fn()
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    setProjectLogDir: vi.fn()
  }
}));

describe('PathManager', () => {
  const originalEnv = process.env;

  // Helper function to create mock project context
  const createMockProjectContext = (projectId: string = 'test-project') => ({
    projectId,
    projectName: 'Test Project',
    projectRoot: '/test/path',
    projectType: {
      hasGit: false,
      hasPackageJson: false,
      hasNodeModules: false,
      hasPyprojectToml: false,
      hasCargoToml: false,
      hasGoMod: false
    },
    metadata: {
      detectionMethod: 'cwd' as const,
      configuredPaths: [],
      timestamp: new Date()
    }
  });

  beforeEach(() => {
    // 重置环境变量
    process.env = { ...originalEnv };
    process.env.DATA_DIR = 'C:/test-data';
    process.env.PROJECT_AUTO_DETECT = 'true';
    
    // 清除缓存
    clearPathCache();
    
    // 重置mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    clearPathCache();
  });

  describe('getProjectDataDir', () => {
    it('should return base data dir when PROJECT_AUTO_DETECT is false', async () => {
      process.env.PROJECT_AUTO_DETECT = 'false';
      
      const result = await getProjectDataDir();
      
      expect(result).toBe('C:/test-data');
    });

    it('should return base data dir when project detection fails', async () => {
      vi.mocked(projectDetector.getProjectContext).mockRejectedValue(new Error('Detection failed'));

      const result = await getProjectDataDir();

      expect(result).toBe('C:/test-data');
    });

    it('should return project-specific dir when project is detected', async () => {
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(createMockProjectContext());

      const result = await getProjectDataDir();

      expect(result).toBe(path.join('C:/test-data', 'projects', 'test-project'));
    });

    it('should use cached result on subsequent calls', async () => {
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(createMockProjectContext());

      // 第一次调用
      const result1 = await getProjectDataDir();
      // 第二次调用
      const result2 = await getProjectDataDir();

      expect(result1).toBe(result2);
      expect(projectDetector.getProjectContext).toHaveBeenCalledTimes(1);
    });

    it('should refresh cache when forceRefresh is true', async () => {
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(createMockProjectContext());

      // 第一次调用
      await getProjectDataDir();
      // 强制刷新
      await getProjectDataDir(true);

      expect(projectDetector.getProjectContext).toHaveBeenCalledTimes(2);
    });

    it('should use default data dir when DATA_DIR is not set', async () => {
      delete process.env.DATA_DIR;
      process.env.PROJECT_AUTO_DETECT = 'false';
      
      const result = await getProjectDataDir();
      
      expect(result).toBe(path.join(process.cwd(), 'data'));
    });
  });

  describe('getLogDir', () => {
    it('should return logs subdirectory of project data dir', async () => {
      process.env.PROJECT_AUTO_DETECT = 'false';
      
      const result = await getLogDir();
      
      expect(result).toBe(path.join('C:/test-data', 'logs'));
    });

    it('should return project-specific logs dir when project is detected', async () => {
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(createMockProjectContext());

      const result = await getLogDir();

      expect(result).toBe(path.join('C:/test-data', 'projects', 'test-project', 'logs'));
    });
  });

  describe('getTasksFilePath', () => {
    it('should return tasks.json path in project data dir', async () => {
      process.env.PROJECT_AUTO_DETECT = 'false';
      
      const result = await getTasksFilePath();
      
      expect(result).toBe(path.join('C:/test-data', 'tasks.json'));
    });
  });

  describe('updateProjectPath', () => {
    it('should update SHRIMP_PROJECT_PATH environment variable', async () => {
      const testPath = 'C:/test/project';
      
      await updateProjectPath(testPath);
      
      expect(process.env.SHRIMP_PROJECT_PATH).toBe(testPath);
    });

    it('should clear cache when updating project path', async () => {
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(createMockProjectContext());

      // 第一次调用建立缓存
      await getProjectDataDir();

      // 更新项目路径
      await updateProjectPath('C:/new/project');

      // 再次调用应该重新检测
      await getProjectDataDir();

      expect(projectDetector.getProjectContext).toHaveBeenCalledTimes(3);
    });
  });

  describe('clearPathCache', () => {
    it('should clear cached data', async () => {
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(createMockProjectContext());

      // 建立缓存
      await getProjectDataDir();

      // 清除缓存
      clearPathCache();

      // 再次调用应该重新检测
      await getProjectDataDir();

      expect(projectDetector.getProjectContext).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('should handle project detection errors gracefully', async () => {
      vi.mocked(projectDetector.getProjectContext).mockRejectedValue(new Error('Network error'));

      const result = await getProjectDataDir();

      expect(result).toBe('C:/test-data');
    });

    it('should handle missing environment variables', async () => {
      delete process.env.DATA_DIR;
      delete process.env.PROJECT_AUTO_DETECT;
      
      const result = await getProjectDataDir();
      
      expect(result).toBe(path.join(process.cwd(), 'data'));
    });
  });
});
