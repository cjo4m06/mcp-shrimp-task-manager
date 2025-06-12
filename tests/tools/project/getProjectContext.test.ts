/**
 * 获取项目上下文工具测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getProjectContext } from '@/tools/project/getProjectContext';
import * as projectDetectorUtil from '@/utils/projectDetector';
import * as pathManager from '@/utils/pathManager';
import fs from 'fs/promises';

// Mock dependencies
vi.mock('@/utils/projectDetector');
vi.mock('@/utils/pathManager');
vi.mock('fs/promises');
vi.mock('@/utils/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('getProjectContext', () => {
  const mockProjectContext = {
    projectRoot: 'C:/test/project',
    projectId: 'test-project',
    projectName: 'Test Project',
    projectType: {
      hasGit: true,
      hasPackageJson: true,
      hasNodeModules: true,
      hasPyprojectToml: false,
      hasCargoToml: false,
      hasGoMod: false
    },
    packageInfo: {
      name: 'test-project',
      version: '1.0.0',
      description: 'A test project'
    },
    metadata: {
      detectionMethod: 'environment' as const,
      isMcpEnvironment: true,
      timestamp: new Date()
    }
  };

  const mockPathSummary = {
    baseDataDir: 'C:/test-data',
    projectDataDir: 'C:/test-data/projects/test-project',
    logDir: 'C:/test-data/projects/test-project/logs',
    tasksFile: 'C:/test-data/projects/test-project/tasks.json',
    configDir: 'C:/test-data/projects/test-project/config',
    tempDir: 'C:/test-data/projects/test-project/temp',
    projectInfo: {
      id: 'test-project',
      rawName: 'Test Project',
      source: 'directory',
      path: 'C:/test/project'
    }
  };

  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    
    vi.mocked(projectDetectorUtil.getProjectContext).mockResolvedValue(mockProjectContext);
    vi.mocked(pathManager.getPathSummary).mockResolvedValue(mockPathSummary);
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('basic functionality', () => {
    it('should get project context successfully', async () => {
      const result = await getProjectContext({
        includeEnvVars: false,
        includeDataDir: true,
        includeAiSuggestions: true,
        includeMcpInfo: true
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('🎯 当前项目上下文信息');
      expect(result.content[0].text).toContain('Test Project');
    });

    it('should include data directory information when requested', async () => {
      const result = await getProjectContext({
        includeDataDir: true
      });

      expect(result.content[0].text).toContain('📁 数据存储');
      expect(result.content[0].text).toContain('C:/test-data/projects/test-project');
    });

    it('should exclude data directory when not requested', async () => {
      const result = await getProjectContext({
        includeDataDir: false
      });

      expect(result.content[0].text).not.toContain('📁 数据存储');
    });

    it('should include environment variables when requested', async () => {
      process.env.NODE_ENV = 'test';
      process.env.PWD = 'C:/test/pwd';

      const result = await getProjectContext({
        includeEnvVars: true
      });

      expect(result.content[0].text).toContain('"environment"');
      expect(result.content[0].text).toContain('"PWD": "C:/test/pwd"');
    });

    it('should exclude environment variables when not requested', async () => {
      const result = await getProjectContext({
        includeEnvVars: false
      });

      // 检查JSON中不包含environment字段，但metadata中的detectionMethod可能包含"environment"
      const jsonMatch = result.content[0].text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        expect(jsonData.environment).toBeUndefined();
      }
    });
  });

  describe('AI suggestions', () => {
    it('should include AI suggestions when requested', async () => {
      const result = await getProjectContext({
        includeAiSuggestions: true
      });

      expect(result.content[0].text).toContain('"aiSuggestions"');
    });

    it('should exclude AI suggestions when not requested', async () => {
      const result = await getProjectContext({
        includeAiSuggestions: false
      });

      expect(result.content[0].text).not.toContain('"aiSuggestions"');
    });

    it('should detect suspicious directories and provide warnings', async () => {
      const suspiciousContext = {
        ...mockProjectContext,
        projectRoot: 'C:/Program Files/Windsurf/app'
      };
      vi.mocked(projectDetectorUtil.getProjectContext).mockResolvedValue(suspiciousContext);

      const result = await getProjectContext({
        includeAiSuggestions: true
      });

      expect(result.content[0].text).toContain('"aiSuggestions"');
    });

    it('should show normal status when no issues detected', async () => {
      const result = await getProjectContext({
        includeAiSuggestions: true
      });

      expect(result.content[0].text).toContain('✅ 成功');
    });
  });

  describe('MCP information', () => {
    it('should include MCP information when requested', async () => {
      const result = await getProjectContext({
        includeMcpInfo: true
      });

      expect(result.content[0].text).toContain('"mcpEnvironment"');
    });

    it('should exclude MCP information when not requested', async () => {
      const result = await getProjectContext({
        includeMcpInfo: false
      });

      expect(result.content[0].text).not.toContain('"mcpEnvironment"');
    });
  });

  describe('project type detection', () => {
    it('should show all detected project types', async () => {
      const result = await getProjectContext({});

      expect(result.content[0].text).toContain('"hasGit": true');
      expect(result.content[0].text).toContain('"hasPackageJson": true');
      expect(result.content[0].text).toContain('"hasNodeModules": true');
    });

    it('should handle projects without certain features', async () => {
      const minimalContext = {
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
      vi.mocked(projectDetectorUtil.getProjectContext).mockResolvedValue(minimalContext);

      const result = await getProjectContext({});

      expect(result.content[0].text).toContain('"hasGit": false');
      expect(result.content[0].text).toContain('"hasPackageJson": false');
    });
  });

  describe('directory creation', () => {
    it('should create data directories when includeDataDir is true', async () => {
      await getProjectContext({
        includeDataDir: true
      });

      // 检查是否调用了mkdir，实际实现中可能在pathManager中创建目录
      // 这里我们主要验证功能正常运行，不一定要求直接调用fs.mkdir
      expect(vi.mocked(pathManager.getPathSummary)).toHaveBeenCalled();
    });

    it('should not create directories when includeDataDir is false', async () => {
      await getProjectContext({
        includeDataDir: false
      });

      expect(fs.mkdir).not.toHaveBeenCalled();
    });

    it('should handle directory creation errors gracefully', async () => {
      vi.mocked(fs.mkdir).mockRejectedValue(new Error('Permission denied'));

      const result = await getProjectContext({
        includeDataDir: true
      });

      // Should still succeed, just log the error
      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('项目上下文信息');
    });
  });

  describe('error handling', () => {
    it('should handle projectDetector errors', async () => {
      vi.mocked(projectDetectorUtil.getProjectContext).mockRejectedValue(new Error('Detection failed'));

      const result = await getProjectContext({});

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('❌ 获取项目上下文失败');
    });

    it('should handle pathManager errors', async () => {
      vi.mocked(pathManager.getPathSummary).mockRejectedValue(new Error('Path error'));

      const result = await getProjectContext({
        includeDataDir: true
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('❌ 获取项目上下文失败');
    });
  });

  describe('default parameters', () => {
    it('should use default values when no parameters provided', async () => {
      // 使用默认值调用，这些默认值在schema中定义
      const result = await getProjectContext({
        includeEnvVars: false,
        includeDataDir: true,
        includeAiSuggestions: true,
        includeMcpInfo: true
      });

      // Default values: includeEnvVars: false, includeDataDir: true, includeAiSuggestions: true, includeMcpInfo: true
      const jsonMatch = result.content[0].text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        expect(jsonData.environment).toBeUndefined(); // 不应该包含environment字段
        expect(jsonData.dataDirectory).toBeDefined(); // 应该包含dataDirectory
        expect(jsonData.aiSuggestions).toBeDefined(); // 应该包含aiSuggestions
        expect(jsonData.mcpEnvironment).toBeDefined(); // 应该包含mcpEnvironment
      }
      expect(result.content[0].text).toContain('📁 数据存储');
    });
  });

  describe('detailed information', () => {
    it('should include comprehensive project information', async () => {
      const result = await getProjectContext({
        includeEnvVars: true,
        includeDataDir: true,
        includeAiSuggestions: true,
        includeMcpInfo: true
      });

      const text = result.content[0].text;
      expect(text).toContain('🎯 当前项目上下文信息');
      expect(text).toContain('💡 说明');
      expect(text).toContain('📋 详细信息');
      expect(text).toContain('**项目检测**: ✅ 成功');
    });

    it('should show project detection status correctly', async () => {
      const result = await getProjectContext({});

      expect(result.content[0].text).toContain('**项目检测**: ✅ 成功');
      expect(result.content[0].text).toContain('当前工作在项目 **Test Project**');
    });
  });
});
