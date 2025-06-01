import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getProjectContext, detectProjectRoot } from '../../src/utils/projectDetector.js';

describe('ProjectDetector (MCP Style)', () => {
  const testDir = path.join(os.tmpdir(), 'shrimp-test-project-detector');
  const originalCwd = process.cwd();

  beforeEach(() => {
    // 清理测试目录
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // 恢复原始工作目录
    process.chdir(originalCwd);
    
    // 清理测试目录
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('getProjectContext', () => {
    it('should detect project with package.json', async () => {
      // 创建package.json文件
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
        description: 'Test project'
      };
      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // 切换到测试目录
      process.chdir(testDir);

      const context = await getProjectContext();

      expect(context.projectId).toBe('test-project');
      expect(context.projectName).toBe('test-project');
      expect(context.projectRoot).toBe(testDir);
      expect(context.projectType.hasPackageJson).toBe(true);
      expect(context.packageInfo?.name).toBe('test-project');
      expect(context.metadata.detectionMethod).toBe('cwd');
    });

    it('should detect project with git repository', async () => {
      // 创建.git目录
      fs.mkdirSync(path.join(testDir, '.git'));

      // 切换到测试目录
      process.chdir(testDir);

      const context = await getProjectContext();

      expect(context.projectType.hasGit).toBe(true);
      expect(context.metadata.detectionMethod).toBe('cwd');
    });

    it('should use explicit path configuration', async () => {
      const context = await getProjectContext({
        allowedPaths: [testDir],
        autoDetect: false
      });

      expect(context.projectRoot).toBe(testDir);
      expect(context.metadata.detectionMethod).toBe('explicit');
    });

    it('should use environment variable', async () => {
      const originalEnv = process.env.SHRIMP_PROJECT_PATH;
      process.env.SHRIMP_PROJECT_PATH = testDir;

      try {
        const context = await getProjectContext({
          allowedPaths: [],
          autoDetect: false
        });

        expect(context.projectRoot).toBe(testDir);
        expect(context.metadata.detectionMethod).toBe('environment');
      } finally {
        if (originalEnv) {
          process.env.SHRIMP_PROJECT_PATH = originalEnv;
        } else {
          delete process.env.SHRIMP_PROJECT_PATH;
        }
      }
    });

    it('should fallback to specified directory', async () => {
      const context = await getProjectContext({
        allowedPaths: [],
        autoDetect: false,
        fallbackDir: testDir
      });

      expect(context.projectRoot).toBe(testDir);
      expect(context.metadata.detectionMethod).toBe('fallback');
    });
  });

  describe('detectProjectRoot', () => {
    it('should detect project root from current directory', async () => {
      // 创建package.json
      fs.writeFileSync(path.join(testDir, 'package.json'), '{"name": "test"}');
      process.chdir(testDir);

      const projectRoot = await detectProjectRoot();
      expect(projectRoot).toBe(testDir);
    });

    it('should use provided working directory', async () => {
      // 创建一个项目指标文件以确保检测到正确的目录
      fs.writeFileSync(path.join(testDir, 'package.json'), '{"name": "test"}');

      const projectRoot = await detectProjectRoot(testDir);
      expect(projectRoot).toBe(testDir);
    });
  });
});
