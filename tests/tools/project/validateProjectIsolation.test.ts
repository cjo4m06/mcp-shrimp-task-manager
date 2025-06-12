/**
 * 项目隔离验证工具测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateProjectIsolation } from '../../../src/tools/project/validateProjectIsolation.js';
import { pathManager } from '../../../src/utils/pathManager.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('validateProjectIsolation', () => {
  let tempDir: string;
  let originalEnv: Record<string, string | undefined>;

  beforeEach(async () => {
    // 保存原始环境变量
    originalEnv = {
      PROJECT_AUTO_DETECT: process.env.PROJECT_AUTO_DETECT,
      DATA_DIR: process.env.DATA_DIR,
      SHRIMP_PROJECT_PATH: process.env.SHRIMP_PROJECT_PATH
    };

    // 创建临时目录
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-project-isolation-'));
    
    // 清除路径缓存
    pathManager.clearCache();
  });

  afterEach(async () => {
    // 恢复环境变量
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    // 清理临时目录
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // 忽略清理错误
    }

    // 清除路径缓存
    pathManager.clearCache();
  });

  describe('基本功能测试', () => {
    it('应该返回项目隔离验证报告', async () => {
      // 设置环境变量
      process.env.PROJECT_AUTO_DETECT = 'true';
      
      const result = await validateProjectIsolation({
        includeRecommendations: true,
        checkTaskFiles: false // 避免文件系统依赖
      });

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.content[0]).toHaveProperty('type', 'text');
      expect(result.content[0]).toHaveProperty('text');
      
      const reportText = result.content[0].text;
      expect(reportText).toContain('项目隔离验证报告');
      expect(reportText).toContain('当前状态');
      expect(reportText).toContain('隔离状态');
    });

    it('应该检测项目自动检测状态', async () => {
      process.env.PROJECT_AUTO_DETECT = 'true';
      
      const result = await validateProjectIsolation({
        includeRecommendations: false,
        checkTaskFiles: false
      });

      const reportText = result.content[0].text;
      expect(reportText).toContain('自动检测**: ✅ 启用');
    });

    it('应该检测项目自动检测禁用状态', async () => {
      process.env.PROJECT_AUTO_DETECT = 'false';
      
      const result = await validateProjectIsolation({
        includeRecommendations: false,
        checkTaskFiles: false
      });

      const reportText = result.content[0].text;
      expect(reportText).toContain('自动检测**: ❌ 禁用');
    });
  });

  describe('任务文件检查', () => {
    it('应该检查任务文件存在性', async () => {
      process.env.PROJECT_AUTO_DETECT = 'true';
      
      const result = await validateProjectIsolation({
        includeRecommendations: false,
        checkTaskFiles: true
      });

      const reportText = result.content[0].text;
      expect(reportText).toContain('任务文件状态');
    });

    it('应该处理任务文件不存在的情况', async () => {
      process.env.PROJECT_AUTO_DETECT = 'true';
      
      const result = await validateProjectIsolation({
        includeRecommendations: false,
        checkTaskFiles: true
      });

      const reportText = result.content[0].text;
      // 任务文件可能不存在，这是正常的
      expect(reportText).toMatch(/任务文件状态.*:(.*不存在|.*存在)/);
    });
  });

  describe('建议生成', () => {
    it('应该包含建议当 includeRecommendations 为 true', async () => {
      process.env.PROJECT_AUTO_DETECT = 'true';
      
      const result = await validateProjectIsolation({
        includeRecommendations: true,
        checkTaskFiles: false
      });

      const reportText = result.content[0].text;
      expect(reportText).toContain('建议');
    });

    it('应该不包含建议当 includeRecommendations 为 false', async () => {
      process.env.PROJECT_AUTO_DETECT = 'true';
      
      const result = await validateProjectIsolation({
        includeRecommendations: false,
        checkTaskFiles: false
      });

      const reportText = result.content[0].text;
      expect(reportText).not.toContain('## 💡 建议');
    });
  });

  describe('技术详情', () => {
    it('应该包含技术详情 JSON', async () => {
      process.env.PROJECT_AUTO_DETECT = 'true';
      
      const result = await validateProjectIsolation({
        includeRecommendations: false,
        checkTaskFiles: false
      });

      const reportText = result.content[0].text;
      expect(reportText).toContain('技术详情');
      expect(reportText).toContain('```json');
      expect(reportText).toContain('environment');
      expect(reportText).toContain('paths');
      expect(reportText).toContain('project');
      expect(reportText).toContain('isolation');
    });

    it('技术详情应该包含正确的环境变量信息', async () => {
      process.env.PROJECT_AUTO_DETECT = 'true';
      process.env.DATA_DIR = tempDir;
      
      const result = await validateProjectIsolation({
        includeRecommendations: false,
        checkTaskFiles: false
      });

      const reportText = result.content[0].text;
      expect(reportText).toContain('"PROJECT_AUTO_DETECT": "true"');
    });
  });

  describe('错误处理', () => {
    it('应该处理项目检测失败的情况', async () => {
      // 模拟项目检测失败
      process.env.PROJECT_AUTO_DETECT = 'true';
      process.env.SHRIMP_PROJECT_PATH = '/nonexistent/path';
      
      const result = await validateProjectIsolation({
        includeRecommendations: true,
        checkTaskFiles: false
      });

      expect(result).toHaveProperty('content');
      expect(result.content[0]).toHaveProperty('type', 'text');
      
      // 应该仍然返回报告，即使有错误
      const reportText = result.content[0].text;
      expect(reportText).toContain('项目隔离验证报告');
    });
  });

  describe('参数验证', () => {
    it('应该使用默认参数值', async () => {
      process.env.PROJECT_AUTO_DETECT = 'true';

      const result = await validateProjectIsolation({});

      expect(result).toHaveProperty('content');
      const reportText = result.content[0].text;

      // 默认应该包含建议部分（即使没有问题也会有验证隔离效果的建议）
      expect(reportText).toContain('💡 建议');
    });

    it('应该处理空参数对象', async () => {
      process.env.PROJECT_AUTO_DETECT = 'true';
      
      const result = await validateProjectIsolation({});

      expect(result).toHaveProperty('content');
      expect(result.content.length).toBeGreaterThan(0);
    });
  });

  describe('报告格式验证', () => {
    it('应该生成有效的 Markdown 格式', async () => {
      process.env.PROJECT_AUTO_DETECT = 'true';
      
      const result = await validateProjectIsolation({
        includeRecommendations: true,
        checkTaskFiles: true
      });

      const reportText = result.content[0].text;
      
      // 检查 Markdown 标题
      expect(reportText).toMatch(/^# /m);
      expect(reportText).toMatch(/^## /m);
      
      // 检查代码块
      expect(reportText).toContain('```json');
      expect(reportText).toContain('```');
      
      // 检查列表项
      expect(reportText).toMatch(/^\*\*/m);
    });

    it('应该包含所有必需的章节', async () => {
      process.env.PROJECT_AUTO_DETECT = 'true';
      
      const result = await validateProjectIsolation({
        includeRecommendations: true,
        checkTaskFiles: true
      });

      const reportText = result.content[0].text;
      
      const requiredSections = [
        '📊 当前状态',
        '🛡️ 隔离状态', 
        '📁 存储路径',
        '🩺 问题诊断',
        '🔧 技术详情'
      ];

      for (const section of requiredSections) {
        expect(reportText).toContain(section);
      }
    });
  });
});
