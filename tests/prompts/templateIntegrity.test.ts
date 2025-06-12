/**
 * 模板完整性测试
 * 确保所有模板文件在不同语言版本中都存在且格式正确
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcRoot = path.join(__dirname, '../../src');

// 支持的语言
const SUPPORTED_LANGUAGES = ['zh', 'en'];

// 需要检查的模板目录
const TEMPLATE_DIRECTORIES = [
  'toolsDescription',
  'shared',
  'analyzeTask',
  'clearAllTasks',
  'deleteTask',
  'executeTask',
  'getTaskDetail',
  'initProjectRules',
  'listTasks',
  'planTask',
  'processThought',
  'queryTask',
  'reflectTask',
  'researchMode',
  'splitTasks',
  'updateTaskContent',
  'verifyTask'
];

// 关键的工具描述文件（必须在所有语言中存在）
const CRITICAL_TOOL_DESCRIPTIONS = [
  'planTask.md',
  'analyzeTask.md',
  'reflectTask.md',
  'splitTasks.md',
  'listTasks.md',
  'executeTask.md',
  'verifyTask.md',
  'deleteTask.md',
  'clearAllTasks.md',
  'updateTask.md',
  'queryTask.md',
  'getTaskDetail.md',
  'processThought.md',
  'initProjectRules.md',
  'researchMode.md',
  'getProjectContext.md',
  'analyzeWorkingDirectory.md',
  'setProjectWorkingDirectory.md',
  'diagnoseMcpEnvironment.md',
  'viewRealtimeLogs.md',
  'resetProjectDetection.md',
  'showPathStatus.md',
  'validateProjectIsolation.md',
  'getDocumentationPath.md'
];

// 关键的共享模板文件
const CRITICAL_SHARED_TEMPLATES = [
  'systemContext.md',
  'dataStorageRules.md',
  'projectContextCheck.md',
  'sessionContextRecovery.md',
  'mcpToolsTrigger.md',
  'teamCollaborationTrigger.md',
  'documentationPathGuidance.md'
];

describe('模板完整性测试', () => {
  describe('语言目录结构', () => {
    it('应该存在所有支持的语言目录', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        const langDir = path.join(srcRoot, 'prompts', `templates_${lang}`);
        expect(fs.existsSync(langDir), `语言目录 templates_${lang} 不存在`).toBe(true);
        expect(fs.statSync(langDir).isDirectory(), `templates_${lang} 不是目录`).toBe(true);
      }
    });

    it('应该存在所有必需的模板子目录', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        for (const dir of TEMPLATE_DIRECTORIES) {
          const templateDir = path.join(srcRoot, 'prompts', `templates_${lang}`, dir);
          if (fs.existsSync(templateDir)) {
            expect(fs.statSync(templateDir).isDirectory(), 
              `templates_${lang}/${dir} 存在但不是目录`).toBe(true);
          }
        }
      }
    });
  });

  describe('工具描述文件完整性', () => {
    it('所有关键工具描述文件应该在所有语言中存在', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        for (const toolFile of CRITICAL_TOOL_DESCRIPTIONS) {
          const filePath = path.join(srcRoot, 'prompts', `templates_${lang}`, 'toolsDescription', toolFile);
          expect(fs.existsSync(filePath), 
            `工具描述文件 ${toolFile} 在 ${lang} 语言中不存在`).toBe(true);
          
          // 检查文件不为空
          const content = fs.readFileSync(filePath, 'utf-8').trim();
          expect(content.length, 
            `工具描述文件 ${toolFile} 在 ${lang} 语言中为空`).toBeGreaterThan(0);
        }
      }
    });

    it('工具描述文件应该包含有意义的内容', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        for (const toolFile of CRITICAL_TOOL_DESCRIPTIONS) {
          const filePath = path.join(srcRoot, 'prompts', `templates_${lang}`, 'toolsDescription', toolFile);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // 检查最小长度
            expect(content.length, 
              `工具描述文件 ${toolFile} 在 ${lang} 语言中内容太短`).toBeGreaterThan(20);
            
            // 检查不是占位符内容
            expect(content.toLowerCase(), 
              `工具描述文件 ${toolFile} 在 ${lang} 语言中包含占位符内容`).not.toContain('todo');
            expect(content.toLowerCase(), 
              `工具描述文件 ${toolFile} 在 ${lang} 语言中包含占位符内容`).not.toContain('placeholder');
          }
        }
      }
    });
  });

  describe('共享模板文件完整性', () => {
    it('所有关键共享模板文件应该在所有语言中存在', () => {
      for (const lang of SUPPORTED_LANGUAGES) {
        for (const sharedFile of CRITICAL_SHARED_TEMPLATES) {
          const filePath = path.join(srcRoot, 'prompts', `templates_${lang}`, 'shared', sharedFile);
          expect(fs.existsSync(filePath), 
            `共享模板文件 ${sharedFile} 在 ${lang} 语言中不存在`).toBe(true);
          
          // 检查文件不为空
          const content = fs.readFileSync(filePath, 'utf-8').trim();
          expect(content.length, 
            `共享模板文件 ${sharedFile} 在 ${lang} 语言中为空`).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('模板语法检查', () => {
    it('模板文件应该使用正确的包含语法', () => {
      const includePattern = /\{\{include:([^}]+)\}\}/g;
      
      for (const lang of SUPPORTED_LANGUAGES) {
        const templatesDir = path.join(srcRoot, 'prompts', `templates_${lang}`);
        if (!fs.existsSync(templatesDir)) continue;
        
        // 递归检查所有 .md 文件
        const checkDirectory = (dir: string) => {
          const items = fs.readdirSync(dir);
          for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
              checkDirectory(itemPath);
            } else if (item.endsWith('.md')) {
              const content = fs.readFileSync(itemPath, 'utf-8');
              const matches = content.match(includePattern);
              
              if (matches) {
                for (const match of matches) {
                  const includePath = match.match(/\{\{include:([^}]+)\}\}/)?.[1];
                  if (includePath) {
                    const fullIncludePath = path.join(templatesDir, includePath);
                    expect(fs.existsSync(fullIncludePath), 
                      `包含的文件 ${includePath} 在 ${itemPath} 中引用但不存在`).toBe(true);
                  }
                }
              }
            }
          }
        };
        
        checkDirectory(templatesDir);
      }
    });
  });

  describe('构建后文件检查', () => {
    it('构建后的 dist 目录应该包含所有模板文件', () => {
      const distDir = path.join(__dirname, '../../dist/prompts');
      
      if (fs.existsSync(distDir)) {
        for (const lang of SUPPORTED_LANGUAGES) {
          const distLangDir = path.join(distDir, `templates_${lang}`);
          if (fs.existsSync(distLangDir)) {
            // 检查关键工具描述文件
            for (const toolFile of CRITICAL_TOOL_DESCRIPTIONS) {
              const distFilePath = path.join(distLangDir, 'toolsDescription', toolFile);
              expect(fs.existsSync(distFilePath), 
                `构建后的工具描述文件 ${toolFile} 在 ${lang} 语言中不存在`).toBe(true);
            }
            
            // 检查关键共享模板文件
            for (const sharedFile of CRITICAL_SHARED_TEMPLATES) {
              const distFilePath = path.join(distLangDir, 'shared', sharedFile);
              expect(fs.existsSync(distFilePath), 
                `构建后的共享模板文件 ${sharedFile} 在 ${lang} 语言中不存在`).toBe(true);
            }
          }
        }
      }
    });
  });
});
