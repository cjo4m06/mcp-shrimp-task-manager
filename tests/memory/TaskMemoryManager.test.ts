/**
 * TaskMemoryManager 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TaskMemoryManager } from '../../src/memory/TaskMemoryManager.js';
import { TaskKnowledge, TaskDecision, TaskDiscovery } from '../../src/types/taskMemory.js';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

// Mock getProjectContext
vi.mock('../../src/utils/projectDetector.js', () => ({
  getProjectContext: vi.fn().mockResolvedValue({
    projectName: 'test-project',
    projectId: 'test-project',
    projectRoot: '/test/project',
    projectType: {
      hasGit: true,
      hasPackageJson: true,
      hasNodeModules: false,
      hasPyprojectToml: false,
      hasCargoToml: false,
      hasGoMod: false
    },
    metadata: {
      detectionMethod: 'explicit',
      configuredPaths: [],
      timestamp: new Date()
    }
  })
}));

describe('TaskMemoryManager', () => {
  let memoryManager: TaskMemoryManager;
  let testDir: string;

  beforeEach(() => {
    // 创建临时测试目录
    testDir = path.join(tmpdir(), `task-memory-test-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });
    
    memoryManager = new TaskMemoryManager(testDir);
  });

  afterEach(() => {
    // 清理测试目录
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('初始化', () => {
    it('应该创建必要的目录结构', () => {
      const expectedDirs = [
        'contexts',
        'knowledge',
        'checkpoints',
        'decisions',
        'discoveries'
      ];

      expectedDirs.forEach(dir => {
        const dirPath = path.join(testDir, 'memory', dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });
  });

  describe('任务执行上下文管理', () => {
    it('应该能够开始任务执行', async () => {
      const executionId = await memoryManager.startTaskExecution('task-001');
      
      expect(executionId).toBeDefined();
      expect(typeof executionId).toBe('string');
      expect(executionId.length).toBeGreaterThan(0);
    });

    it('应该能够记录任务步骤', async () => {
      const executionId = await memoryManager.startTaskExecution('task-001');
      
      await memoryManager.recordStep(executionId, {
        stepId: 'step-001',
        action: 'analyze-requirements',
        description: '分析需求',
        timestamp: new Date(),
        status: 'completed',
        output: '需求分析完成',
        duration: 300,
        resources: ['requirements.md'],
        metadata: {}
      });

      // 验证步骤已记录
      const context = await memoryManager.getExecutionContext(executionId);
      expect(context).toBeDefined();
      expect(context!.steps).toHaveLength(1);
      expect(context!.steps[0].stepId).toBe('step-001');
    });

    it('应该能够记录决策', async () => {
      const executionId = await memoryManager.startTaskExecution('task-001');

      const decision: TaskDecision = {
        decisionId: 'decision-001',
        timestamp: new Date(),
        context: '技术选型',
        options: [
          { id: 'react', description: 'React框架' },
          { id: 'vue', description: 'Vue框架' }
        ],
        chosen: 'react',
        reasoning: '团队更熟悉React',
        impact: {
          affectedTasks: [],
          timeImpact: 0,
          resourceImpact: [],
          qualityImpact: 'neutral',
          futureConsiderations: []
        }
      };

      await memoryManager.recordDecision(
        executionId,
        'React vs Vue选择',
        decision.options,
        decision.chosen,
        decision.reasoning
      );

      // 验证决策已记录
      const context = await memoryManager.getExecutionContext(executionId);
      expect(context).toBeDefined();
      expect(context!.decisions).toHaveLength(1);
    });

    it('应该能够记录发现', async () => {
      const executionId = await memoryManager.startTaskExecution('task-001');

      await memoryManager.recordDiscovery(
        executionId,
        'insight',
        '性能瓶颈发现',
        '发现数据库查询是主要性能瓶颈'
      );

      // 验证发现已记录
      const context = await memoryManager.getExecutionContext(executionId);
      expect(context).toBeDefined();
      expect(context!.discoveries).toHaveLength(1);
      expect(context!.discoveries[0].title).toBe('性能瓶颈发现');
    });

    it('应该能够完成任务执行', async () => {
      const executionId = await memoryManager.startTaskExecution('task-001');
      
      await memoryManager.completeTaskExecution(executionId, 'success', '任务完成');

      const context = await memoryManager.getExecutionContext(executionId);
      expect(context).toBeDefined();
      expect(context!.status).toBe('completed');
    });
  });

  describe('知识管理', () => {
    it('应该能够记录知识', async () => {
      const knowledge: TaskKnowledge = {
        knowledgeId: 'knowledge-001',
        type: 'solution',
        title: 'React性能优化',
        content: '使用React.memo优化组件渲染',
        context: {
          domain: 'frontend',
          technology: ['React', 'JavaScript'],
          scenario: 'performance-optimization',
          constraints: [],
          assumptions: []
        },
        applicability: {
          taskTypes: ['frontend-development'],
          projectTypes: ['web-application'],
          conditions: ['React项目'],
          exclusions: []
        },
        confidence: 0.9,
        source: {
          type: 'experience',
          timestamp: new Date(),
          reliability: 'high',
          verificationStatus: 'verified'
        },
        tags: ['React', 'performance'],
        relatedKnowledge: []
      };

      await memoryManager.recordKnowledge(knowledge);

      // 验证知识已记录
      const retrievedKnowledge = await memoryManager.getRelevantKnowledge(
        'frontend-development',
        'web-application',
        ['React']
      );

      expect(retrievedKnowledge).toHaveLength(1);
      expect(retrievedKnowledge[0].knowledgeId).toBe('knowledge-001');
    });

    it('应该能够根据条件检索相关知识', async () => {
      // 记录多个知识条目
      const knowledge1: TaskKnowledge = {
        knowledgeId: 'knowledge-001',
        type: 'solution',
        title: 'React性能优化',
        content: '使用React.memo',
        context: {
          domain: 'frontend',
          technology: ['React'],
          scenario: 'performance',
          constraints: [],
          assumptions: []
        },
        applicability: {
          taskTypes: ['frontend-development'],
          projectTypes: ['web-application'],
          conditions: [],
          exclusions: []
        },
        confidence: 0.9,
        source: {
          type: 'experience',
          timestamp: new Date(),
          reliability: 'high',
          verificationStatus: 'verified'
        },
        tags: ['React'],
        relatedKnowledge: []
      };

      const knowledge2: TaskKnowledge = {
        knowledgeId: 'knowledge-002',
        type: 'solution',
        title: 'Node.js性能优化',
        content: '使用集群模式',
        context: {
          domain: 'backend',
          technology: ['Node.js'],
          scenario: 'performance',
          constraints: [],
          assumptions: []
        },
        applicability: {
          taskTypes: ['backend-development'],
          projectTypes: ['api-service'],
          conditions: [],
          exclusions: []
        },
        confidence: 0.8,
        source: {
          type: 'experience',
          timestamp: new Date(),
          reliability: 'high',
          verificationStatus: 'verified'
        },
        tags: ['Node.js'],
        relatedKnowledge: []
      };

      await memoryManager.recordKnowledge(knowledge1);
      await memoryManager.recordKnowledge(knowledge2);

      // 检索React相关知识
      const reactKnowledge = await memoryManager.getRelevantKnowledge(
        'frontend-development',
        'web-application',
        ['React']
      );

      expect(reactKnowledge).toHaveLength(1);
      expect(reactKnowledge[0].knowledgeId).toBe('knowledge-001');

      // 检索Node.js相关知识
      const nodeKnowledge = await memoryManager.getRelevantKnowledge(
        'backend-development',
        'api-service',
        ['Node.js']
      );

      expect(nodeKnowledge).toHaveLength(1);
      expect(nodeKnowledge[0].knowledgeId).toBe('knowledge-002');
    });
  });

  describe('任务模式分析', () => {
    it('应该能够分析任务模式', async () => {
      // 模拟一些执行历史
      const executionId1 = await memoryManager.startTaskExecution('task-001');
      await memoryManager.completeTaskExecution(executionId1, 'success', '任务完成');

      const executionId2 = await memoryManager.startTaskExecution('task-002');
      await memoryManager.completeTaskExecution(executionId2, 'success', '任务完成');

      const patterns = await memoryManager.analyzeTaskPatterns('frontend-development');

      expect(patterns).toBeDefined();
      expect(patterns.commonPatterns).toBeDefined();
      expect(patterns.frequentIssues).toBeDefined();
      expect(patterns.bestPractices).toBeDefined();
      expect(patterns.recommendations).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的执行ID', async () => {
      const context = await memoryManager.getExecutionContext('invalid-id');
      expect(context).toBeNull();
    });

    it('应该处理文件系统错误', () => {
      // 测试在只读目录中创建TaskMemoryManager
      const readonlyDir = '/readonly-test-dir';
      
      // 这应该不会抛出错误，而是优雅地处理
      expect(() => {
        new TaskMemoryManager(readonlyDir);
      }).not.toThrow();
    });
  });

  describe('数据持久化', () => {
    it('应该能够保存和加载知识库', async () => {
      const knowledge: TaskKnowledge = {
        knowledgeId: 'knowledge-persist-001',
        type: 'solution',
        title: '持久化测试',
        content: '测试知识持久化',
        context: {
          domain: 'test',
          technology: ['test'],
          scenario: 'testing',
          constraints: [],
          assumptions: []
        },
        applicability: {
          taskTypes: ['testing'],
          projectTypes: ['test-project'],
          conditions: [],
          exclusions: []
        },
        confidence: 1.0,
        source: {
          type: 'test',
          timestamp: new Date(),
          reliability: 'high',
          verificationStatus: 'verified'
        },
        tags: ['test'],
        relatedKnowledge: []
      };

      await memoryManager.recordKnowledge(knowledge);

      // 创建新的管理器实例来测试加载
      const newMemoryManager = new TaskMemoryManager(testDir);
      const loadedKnowledge = await newMemoryManager.getRelevantKnowledge(
        'testing',
        'test-project',
        ['test']
      );

      expect(loadedKnowledge).toHaveLength(1);
      expect(loadedKnowledge[0].knowledgeId).toBe('knowledge-persist-001');
    });
  });
});
