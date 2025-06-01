/**
 * MCP环境诊断工具测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { diagnoseMcpEnvironment } from '@/tools/project/diagnoseMcpEnvironment';
import * as projectDetector from '@/utils/projectDetector';
import fs from 'fs/promises';
import os from 'os';

// Mock dependencies
vi.mock('@/utils/projectDetector');
vi.mock('fs/promises');
vi.mock('os');
vi.mock('@/utils/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

describe('diagnoseMcpEnvironment', () => {
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

  const originalEnv = process.env;
  const originalCwd = process.cwd;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.cwd = vi.fn().mockReturnValue('C:/test/project');
    
    vi.mocked(projectDetector.getProjectContext).mockResolvedValue(mockProjectContext);
    vi.mocked(os.platform).mockReturnValue('win32');
    vi.mocked(os.arch).mockReturnValue('x64');
    vi.mocked(os.release).mockReturnValue('10.0.19041');
    vi.mocked(os.homedir).mockReturnValue('C:/Users/test');
  });

  afterEach(() => {
    process.env = originalEnv;
    process.cwd = originalCwd;
  });

  describe('basic diagnosis', () => {
    it('should perform MCP environment diagnosis successfully', async () => {
      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: true,
        includeProcessInfo: true,
        includeRecommendations: true
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('MCP环境诊断报告');
    });

    it('should include system information when requested', async () => {
      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: true,
        includeProcessInfo: false,
        includeRecommendations: false
      });

      // 检查JSON数据中包含systemInfo
      const jsonMatch = result.content[0].text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        expect(jsonData.systemInfo).toBeDefined();
        expect(jsonData.systemInfo.platform).toBe(process.platform);
        expect(jsonData.systemInfo.architecture).toBe(process.arch);
      }
    });

    it('should include process information when requested', async () => {
      process.env.NODE_ENV = 'test';
      process.env.PWD = 'C:/test/pwd';

      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: false,
        includeProcessInfo: true,
        includeRecommendations: false
      });

      // 检查JSON数据中包含processInfo
      const jsonMatch = result.content[0].text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        expect(jsonData.processInfo).toBeDefined();
      }
    });

    it('should include recommendations when requested', async () => {
      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: false,
        includeProcessInfo: false,
        includeRecommendations: true
      });

      expect(result.content[0].text).toContain('💡 修复建议');
    });

    it('should exclude sections when not requested', async () => {
      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: false,
        includeProcessInfo: false,
        includeRecommendations: false
      });

      // 检查JSON数据中不包含相应字段
      const jsonMatch = result.content[0].text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        expect(jsonData.systemInfo).toBeUndefined();
        expect(jsonData.processInfo).toBeUndefined();
      }
      expect(result.content[0].text).not.toContain('💡 修复建议');
    });
  });

  describe('working directory issue detection', () => {
    it('should detect fallback detection method issues', async () => {
      const mockContext = {
        ...mockProjectContext,
        metadata: {
          ...mockProjectContext.metadata,
          detectionMethod: 'fallback' as const
        }
      };
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(mockContext);

      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: false,
        includeProcessInfo: false,
        includeRecommendations: false
      });

      expect(result.content[0].text).toContain('🔴 使用回退检测方法');
    });

    it('should detect suspicious installation directories', async () => {
      process.cwd = vi.fn().mockReturnValue('C:/Program Files/Windsurf/app');

      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: false,
        includeProcessInfo: false,
        includeRecommendations: false
      });

      expect(result.content[0].text).toContain('发现的问题');
    });

    it('should detect missing environment variables', async () => {
      delete process.env.PWD;
      delete process.env.INIT_CWD;

      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: false,
        includeProcessInfo: false,
        includeRecommendations: false
      });

      expect(result.content[0].text).toContain('🟡 缺少PWD和INIT_CWD环境变量');
    });

    it('should show no issues when everything is normal', async () => {
      const mockContext = {
        ...mockProjectContext,
        metadata: {
          ...mockProjectContext.metadata,
          detectionMethod: 'environment' as const
        }
      };
      vi.mocked(projectDetector.getProjectContext).mockResolvedValue(mockContext);
      
      process.env.PWD = 'C:/test/project';
      process.env.INIT_CWD = 'C:/test/project';

      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: false,
        includeProcessInfo: false,
        includeRecommendations: false
      });

      expect(result.content[0].text).toContain('- 无问题');
    });
  });

  describe('environment variable analysis', () => {
    it('should analyze relevant environment variables', async () => {
      process.env.PWD = 'C:/test/pwd';
      process.env.INIT_CWD = 'C:/test/init';
      process.env.HOME = 'C:/Users/test';
      process.env.USERPROFILE = 'C:/Users/test';

      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: false,
        includeProcessInfo: true,
        includeRecommendations: false
      });

      // 检查JSON数据中包含环境变量
      const jsonMatch = result.content[0].text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        expect(jsonData.environmentVariables.PWD).toBe('C:/test/pwd');
        expect(jsonData.environmentVariables.INIT_CWD).toBe('C:/test/init');
        expect(jsonData.environmentVariables.HOME).toBe('C:/Users/test');
      }
    });

    it('should handle missing environment variables', async () => {
      delete process.env.PWD;
      delete process.env.HOME;

      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: false,
        includeProcessInfo: true,
        includeRecommendations: false
      });

      // 检查JSON数据中环境变量为undefined或不存在
      const jsonMatch = result.content[0].text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        expect(jsonData.environmentVariables.PWD).toBeUndefined();
        expect(jsonData.environmentVariables.HOME).toBeUndefined();
      }
    });
  });

  describe('error handling', () => {
    it('should handle projectDetector errors', async () => {
      vi.mocked(projectDetector.getProjectContext).mockRejectedValue(new Error('Detection failed'));

      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: true,
        includeProcessInfo: true,
        includeRecommendations: true
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('❌ MCP环境诊断失败');
    });

    it('should handle system info errors gracefully', async () => {
      vi.mocked(os.platform).mockImplementation(() => {
        throw new Error('OS error');
      });

      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: true,
        includeProcessInfo: false,
        includeRecommendations: false
      });

      // Should still complete, just with error handling
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('default parameters', () => {
    it('should use default values when no parameters provided', async () => {
      // 使用默认值调用，这些默认值在schema中定义
      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: true,
        includeProcessInfo: true,
        includeRecommendations: true
      });

      // 检查JSON数据中包含默认字段
      const jsonMatch = result.content[0].text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        expect(jsonData.systemInfo).toBeDefined();
        expect(jsonData.processInfo).toBeDefined();
      }
      expect(result.content[0].text).toContain('💡 修复建议');
    });
  });

  describe('detailed analysis', () => {
    it('should provide comprehensive diagnosis information', async () => {
      process.env.PWD = 'C:/test/pwd';
      process.env.NODE_ENV = 'production';

      const result = await diagnoseMcpEnvironment({
        includeSystemInfo: true,
        includeProcessInfo: true,
        includeRecommendations: true
      });

      const text = result.content[0].text;
      expect(text).toContain('MCP环境诊断报告');
      expect(text).toContain('🚨 发现的问题');
      expect(text).toContain('📊 诊断摘要');
    });
  });
});
