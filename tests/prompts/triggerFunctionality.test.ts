/**
 * 触发器功能测试
 * 测试新创建的MCP工具触发器和团队协作触发器的功能性和兼容性
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadPromptFromTemplate, loadPrompt } from '../../src/prompts/loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcRoot = path.join(__dirname, '../../src');

// 新创建的触发器文件
const NEW_TRIGGER_FILES = [
  'mcpToolsTrigger.md',
  'teamCollaborationTrigger.md'
];

// 更新的模板文件
const UPDATED_TEMPLATE_FILES = [
  'planTask/index.md',
  'analyzeTask/index.md', 
  'executeTask/index.md'
];

// 关键词测试用例
const KEYWORD_TEST_CASES = [
  // MCP工具触发器关键词
  { keyword: '任务', expectedTools: ['list_tasks', 'plan_task', 'get_task_detail'] },
  { keyword: '分析', expectedTools: ['analyze_task', 'analyze_team_collaboration'] },
  { keyword: 'debug', expectedTools: ['query_task_memory'] },
  { keyword: '项目管理', expectedTools: ['generate_team_collaboration_tasks'] },
  
  // 团队协作触发器关键词
  { keyword: '团队', expectedWorkflow: ['analyze_team_collaboration', 'query_task_memory'] },
  { keyword: '协作', expectedWorkflow: ['generate_team_collaboration_tasks', 'share_team_knowledge'] },
  { keyword: 'PM', expectedWorkflow: ['insert_task_dynamically', 'adjust_tasks_from_context'] }
];

describe('触发器功能测试', () => {
  describe('新触发器文件存在性检查', () => {
    it('应该存在所有新创建的触发器文件', () => {
      for (const triggerFile of NEW_TRIGGER_FILES) {
        const filePath = path.join(srcRoot, 'prompts', 'templates_zh', 'shared', triggerFile);
        expect(fs.existsSync(filePath), 
          `触发器文件 ${triggerFile} 不存在`).toBe(true);
        
        // 检查文件不为空
        const content = fs.readFileSync(filePath, 'utf-8').trim();
        expect(content.length, 
          `触发器文件 ${triggerFile} 为空`).toBeGreaterThan(100);
      }
    });

    it('触发器文件应该包含必要的关键词和工具映射', () => {
      // 检查MCP工具触发器
      const mcpTriggerPath = path.join(srcRoot, 'prompts', 'templates_zh', 'shared', 'mcpToolsTrigger.md');
      const mcpContent = fs.readFileSync(mcpTriggerPath, 'utf-8');
      
      // 检查关键词存在
      expect(mcpContent).toContain('任务');
      expect(mcpContent).toContain('分析');
      expect(mcpContent).toContain('debug');
      expect(mcpContent).toContain('项目管理');
      
      // 检查工具映射存在
      expect(mcpContent).toContain('list_tasks');
      expect(mcpContent).toContain('analyze_task');
      expect(mcpContent).toContain('query_task_memory');
      expect(mcpContent).toContain('generate_team_collaboration_tasks');

      // 检查团队协作触发器
      const teamTriggerPath = path.join(srcRoot, 'prompts', 'templates_zh', 'shared', 'teamCollaborationTrigger.md');
      const teamContent = fs.readFileSync(teamTriggerPath, 'utf-8');
      
      // 检查PM工作流阶段
      expect(teamContent).toContain('任务分析阶段');
      expect(teamContent).toContain('角色分配阶段');
      expect(teamContent).toContain('协作启动阶段');
      
      // 检查角色识别规则
      expect(teamContent).toContain('frontend-developer');
      expect(teamContent).toContain('backend-developer');
      expect(teamContent).toContain('qa-engineer');
    });
  });

  describe('模板include语句集成检查', () => {
    it('更新的模板文件应该包含正确的include语句', () => {
      // 检查planTask模板
      const planTaskPath = path.join(srcRoot, 'prompts', 'templates_zh', 'planTask', 'index.md');
      const planTaskContent = fs.readFileSync(planTaskPath, 'utf-8');
      
      expect(planTaskContent).toContain('{{include:shared/projectContextCheck.md}}');
      expect(planTaskContent).toContain('{{include:shared/mcpToolsTrigger.md}}');
      expect(planTaskContent).toContain('{{include:shared/teamCollaborationTrigger.md}}');

      // 检查analyzeTask模板
      const analyzeTaskPath = path.join(srcRoot, 'prompts', 'templates_zh', 'analyzeTask', 'index.md');
      const analyzeTaskContent = fs.readFileSync(analyzeTaskPath, 'utf-8');
      
      expect(analyzeTaskContent).toContain('{{include:shared/projectContextCheck.md}}');
      expect(analyzeTaskContent).toContain('{{include:shared/mcpToolsTrigger.md}}');

      // 检查executeTask模板
      const executeTaskPath = path.join(srcRoot, 'prompts', 'templates_zh', 'executeTask', 'index.md');
      const executeTaskContent = fs.readFileSync(executeTaskPath, 'utf-8');
      
      expect(executeTaskContent).toContain('{{include:shared/projectContextCheck.md}}');
      expect(executeTaskContent).toContain('{{include:shared/teamCollaborationTrigger.md}}');
    });

    it('include语句的顺序应该正确', () => {
      // 检查planTask模板的include顺序
      const planTaskPath = path.join(srcRoot, 'prompts', 'templates_zh', 'planTask', 'index.md');
      const planTaskContent = fs.readFileSync(planTaskPath, 'utf-8');
      
      const projectContextIndex = planTaskContent.indexOf('{{include:shared/projectContextCheck.md}}');
      const mcpTriggerIndex = planTaskContent.indexOf('{{include:shared/mcpToolsTrigger.md}}');
      const teamTriggerIndex = planTaskContent.indexOf('{{include:shared/teamCollaborationTrigger.md}}');
      
      expect(projectContextIndex).toBeGreaterThan(-1);
      expect(mcpTriggerIndex).toBeGreaterThan(projectContextIndex);
      expect(teamTriggerIndex).toBeGreaterThan(mcpTriggerIndex);
    });
  });

  describe('模板加载功能测试', () => {
    it('应该能够成功加载包含新触发器的模板', () => {
      // 测试加载planTask模板
      expect(() => {
        const content = loadPromptFromTemplate('planTask/index.md');
        expect(content.length).toBeGreaterThan(0);
        
        // 验证触发器内容已被包含
        expect(content).toContain('MCP Tools Mandatory Trigger');
        expect(content).toContain('Team Collaboration Automation Trigger');
      }).not.toThrow();

      // 测试加载analyzeTask模板
      expect(() => {
        const content = loadPromptFromTemplate('analyzeTask/index.md');
        expect(content.length).toBeGreaterThan(0);
        expect(content).toContain('MCP Tools Mandatory Trigger');
      }).not.toThrow();

      // 测试加载executeTask模板
      expect(() => {
        const content = loadPromptFromTemplate('executeTask/index.md');
        expect(content.length).toBeGreaterThan(0);
        expect(content).toContain('Team Collaboration Automation Trigger');
      }).not.toThrow();
    });

    it('模板加载应该正确处理嵌套include', () => {
      const content = loadPromptFromTemplate('planTask/index.md');
      
      // 验证所有include的内容都被正确加载
      expect(content).toContain('MANDATORY FIRST STEP');  // 来自projectContextCheck.md
      expect(content).toContain('Keyword Trigger Rules');  // 来自mcpToolsTrigger.md
      expect(content).toContain('PM Workflow Auto-Start'); // 来自teamCollaborationTrigger.md
      
      // 验证原有内容仍然存在
      expect(content).toContain('Task Analysis');
      expect(content).toContain('analyze_task');
    });
  });

  describe('环境变量覆盖机制测试', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('应该支持通过环境变量覆盖触发器内容', () => {
      // 设置环境变量覆盖
      process.env.MCP_PROMPT_PLANTASK = '自定义的planTask内容';
      
      const customContent = loadPrompt('自定义的planTask内容', 'PLANTASK');
      expect(customContent).toBe('自定义的planTask内容');
    });

    it('应该支持通过环境变量追加触发器内容', () => {
      const baseContent = '基础内容';
      process.env.MCP_PROMPT_TEST_APPEND = '追加的触发器内容';
      
      const appendedContent = loadPrompt(baseContent, 'TEST');
      expect(appendedContent).toContain('基础内容');
      expect(appendedContent).toContain('追加的触发器内容');
    });
  });

  describe('差异化设计验证', () => {
    it('触发器应该体现与claude-task-master的差异化优势', () => {
      const mcpTriggerPath = path.join(srcRoot, 'prompts', 'templates_zh', 'shared', 'mcpToolsTrigger.md');
      const mcpContent = fs.readFileSync(mcpTriggerPath, 'utf-8');
      
      // 检查差异化设计内容
      expect(mcpContent).toContain('差异化设计优势');
      expect(mcpContent).toContain('$DATA_DIR/projects/$PROJECT_NAME/');
      expect(mcpContent).toContain('统一路径');
      expect(mcpContent).toContain('项目隔离');

      const teamTriggerPath = path.join(srcRoot, 'prompts', 'templates_zh', 'shared', 'teamCollaborationTrigger.md');
      const teamContent = fs.readFileSync(teamTriggerPath, 'utf-8');
      
      expect(teamContent).toContain('与claude-task-master的核心区别');
      expect(teamContent).toContain('统一数据路径');
      expect(teamContent).toContain('PM级别自动化');
    });
  });
});
