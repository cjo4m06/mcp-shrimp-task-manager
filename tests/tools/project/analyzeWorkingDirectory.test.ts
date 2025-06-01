/**
 * 工作目录分析工具测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeWorkingDirectory } from '@/tools/project/analyzeWorkingDirectory';
import * as projectDetector from '@/utils/projectDetector';
import fs from 'fs/promises';

// Mock dependencies
vi.mock('@/utils/projectDetector');
vi.mock('fs/promises');
vi.mock('@/utils/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('analyzeWorkingDirectory', () => {
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
    vi.mocked(projectDetector.getProjectContext).mockResolvedValue(mockProjectContext);
  });

  describe('basic analysis', () => {
    it('should analyze working directory successfully', async () => {
      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('🔍 工作目录分析报告');
      expect(result.content[0].text).toContain('检测到的工作目录');
      expect(result.content[0].text).toContain('C:/test/project');
    });

    it('should include detection method in analysis', async () => {
      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content[0].text).toContain('**检测方法**: environment');
    });

    it('should show MCP environment status', async () => {
      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content[0].text).toContain('**是否MCP环境**: ❌ 否');
    });

    it('should show project indicators', async () => {
      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content[0].text).toContain('**Git仓库**: ✅ 检测到');
      expect(result.content[0].text).toContain('**Package.json**: ✅ 检测到');
    });
  });

  describe('file system analysis', () => {
    it('should include file analysis when requested', async () => {
      // Mock fs.readdir
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'package.json', isFile: () => true, isDirectory: () => false },
        { name: '.git', isFile: () => false, isDirectory: () => true },
        { name: 'src', isFile: () => false, isDirectory: () => true },
        { name: 'README.md', isFile: () => true, isDirectory: () => false }
      ] as any);

      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: true
      });

      expect(fs.readdir).toHaveBeenCalledWith('C:/test/project', { withFileTypes: true });
      expect(result.content[0].text).toContain('详细分析数据');
      expect(result.content[0].text).toContain('fileAnalysis');
    });

    it('should handle file system errors gracefully', async () => {
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Permission denied'));

      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: true
      });

      expect(result.content[0].text).toContain('详细分析数据');
      expect(result.content[0].text).toContain('error');
    });
  });

  describe('diagnosis generation', () => {
    it('should identify MCP environment issues', async () => {
      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content[0].text).toContain('🩺 问题诊断');
      expect(result.content[0].text).toContain('目录不一致');
    });

    it('should detect directory inconsistencies', async () => {
      const mockContext = {
        ...mockProjectContext,
        projectRoot: 'C:/different/path'
      };
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(mockContext);

      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content[0].text).toContain('目录不一致');
    });

    it('should detect missing project indicators', async () => {
      const mockContext = {
        ...mockProjectContext,
        projectType: {
          hasGit: false,
          hasPackageJson: false,
          hasNodeModules: false,
          hasPyprojectToml: false,
          hasCargoToml: false,
          hasGoMod: false
        }
      };
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(mockContext);

      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content[0].text).toContain('项目标识缺失');
    });

    it('should show no issues when everything is normal', async () => {
      const mockContext = {
        ...mockProjectContext,
        projectRoot: process.cwd(),
        metadata: {
          ...mockProjectContext.metadata,
          isMcpEnvironment: false
        }
      };
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(mockContext);

      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content[0].text).toContain('✅ **无明显问题**');
    });
  });

  describe('recommendations', () => {
    it('should provide MCP environment recommendations', async () => {
      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content[0].text).toContain('💡 解决建议');
      expect(result.content[0].text).toContain('手动指定项目目录');
    });

    it('should recommend project directory confirmation', async () => {
      const mockContext = {
        ...mockProjectContext,
        projectType: {
          hasGit: false,
          hasPackageJson: false,
          hasNodeModules: false,
          hasPyprojectToml: false,
          hasCargoToml: false,
          hasGoMod: false
        }
      };
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(mockContext);

      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content[0].text).toContain('确认项目目录');
    });

    it('should always include manual directory specification recommendation', async () => {
      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content[0].text).toContain('手动指定项目目录');
    });
  });

  describe('AI usage guide', () => {
    it('should include AI usage instructions', async () => {
      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content[0].text).toContain('🎯 AI使用指南');
      expect(result.content[0].text).toContain('对于AI助手');
      expect(result.content[0].text).toContain('推荐的调用方式');
    });
  });

  describe('error handling', () => {
    it('should handle projectDetector errors', async () => {
      vi.mocked(projectDetector.getProjectContext).mockRejectedValue(new Error('Detection failed'));

      const result = await analyzeWorkingDirectory({
        includeFileAnalysis: false
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('❌ 工作目录分析失败');
    });
  });

  describe('suggested directory', () => {
    it('should handle suggested directory parameter', async () => {
      const result = await analyzeWorkingDirectory({
        suggestedDir: 'C:/suggested/path',
        includeFileAnalysis: false
      });

      expect(projectDetector.getProjectContext).toHaveBeenCalled();
      expect(result.content[0].text).toContain('工作目录分析报告');
    });
  });
});
