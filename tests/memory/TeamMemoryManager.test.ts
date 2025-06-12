/**
 * TeamMemoryManager 单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TeamMemoryManager, TeamMember } from '../../src/memory/TeamMemoryManager.js';
import { TaskKnowledge } from '../../src/types/taskMemory.js';
import { TeamRole } from '../../src/prd/types.js';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

describe('TeamMemoryManager', () => {
  let teamMemoryManager: TeamMemoryManager;
  let testDir: string;

  beforeEach(() => {
    // 创建临时测试目录
    testDir = path.join(tmpdir(), `team-memory-test-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });
    
    teamMemoryManager = new TeamMemoryManager(testDir, 'test-team');
  });

  afterEach(() => {
    // 清理测试目录
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('初始化', () => {
    it('应该创建团队记忆目录结构', () => {
      const teamDir = path.join(testDir, 'team-memory', 'test-team');
      const expectedDirs = [
        'knowledge',
        'patterns',
        'learning',
        'members',
        'shared'
      ];

      expectedDirs.forEach(dir => {
        const dirPath = path.join(teamDir, dir);
        expect(fs.existsSync(dirPath)).toBe(true);
      });
    });
  });

  describe('团队知识分享', () => {
    it('应该能够分享知识到团队', async () => {
      const contributor: TeamMember = {
        id: 'member-001',
        name: '张三',
        role: 'frontend-developer' as TeamRole,
        email: 'zhangsan@example.com',
        expertise: ['React', 'TypeScript'],
        joinedAt: new Date(),
        contributionScore: 0
      };

      const knowledge: TaskKnowledge = {
        knowledgeId: 'team-knowledge-001',
        type: 'solution',
        title: 'React Hooks最佳实践',
        content: '使用useCallback和useMemo优化性能',
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
        tags: ['React', 'Hooks', 'Performance'],
        relatedKnowledge: []
      };

      const knowledgeId = await teamMemoryManager.shareKnowledge(
        knowledge,
        contributor,
        'team',
        ['frontend-developer' as TeamRole]
      );

      expect(knowledgeId).toBeDefined();
      expect(typeof knowledgeId).toBe('string');
    });

    it('应该能够获取团队相关知识', async () => {
      // 先分享一些知识
      const contributor: TeamMember = {
        id: 'member-001',
        name: '张三',
        role: 'frontend-developer' as TeamRole,
        expertise: ['React'],
        joinedAt: new Date(),
        contributionScore: 0
      };

      const knowledge: TaskKnowledge = {
        knowledgeId: 'team-knowledge-002',
        type: 'best-practice',
        title: 'React组件设计原则',
        content: '单一职责原则在React组件中的应用',
        context: {
          domain: 'frontend',
          technology: ['React'],
          scenario: 'component-design',
          constraints: [],
          assumptions: []
        },
        applicability: {
          taskTypes: ['frontend-development'],
          projectTypes: ['web-application'],
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
        tags: ['React', 'Design'],
        relatedKnowledge: []
      };

      await teamMemoryManager.shareKnowledge(knowledge, contributor, 'team');

      // 获取知识
      const teamKnowledge = await teamMemoryManager.getTeamKnowledge(
        'frontend-developer' as TeamRole,
        {
          technologies: ['React'],
          taskType: 'frontend-development'
        }
      );

      expect(teamKnowledge).toHaveLength(1);
      expect(teamKnowledge[0].knowledge.title).toBe('React组件设计原则');
    });

    it('应该能够评价知识', async () => {
      // 先分享知识
      const contributor: TeamMember = {
        id: 'member-001',
        name: '张三',
        role: 'frontend-developer' as TeamRole,
        expertise: ['React'],
        joinedAt: new Date(),
        contributionScore: 0
      };

      const knowledge: TaskKnowledge = {
        knowledgeId: 'team-knowledge-003',
        type: 'solution',
        title: '测试知识评价',
        content: '这是一个测试知识条目',
        context: {
          domain: 'test',
          technology: ['test'],
          scenario: 'testing',
          constraints: [],
          assumptions: []
        },
        applicability: {
          taskTypes: ['testing'],
          projectTypes: ['test'],
          conditions: [],
          exclusions: []
        },
        confidence: 0.7,
        source: {
          type: 'test',
          timestamp: new Date(),
          reliability: 'medium',
          verificationStatus: 'unverified'
        },
        tags: ['test'],
        relatedKnowledge: []
      };

      const knowledgeId = await teamMemoryManager.shareKnowledge(knowledge, contributor);

      // 评价知识
      await teamMemoryManager.rateKnowledge(knowledgeId, 'rater-001', 5, '非常有用');

      // 验证评价已记录
      const teamKnowledge = await teamMemoryManager.getTeamKnowledge(
        'frontend-developer' as TeamRole
      );

      const ratedKnowledge = teamKnowledge.find(k => k.id === knowledgeId);
      expect(ratedKnowledge).toBeDefined();
      expect(ratedKnowledge!.ratings).toHaveLength(1);
      expect(ratedKnowledge!.ratings[0].rating).toBe(5);
      expect(ratedKnowledge!.ratings[0].comment).toBe('非常有用');
    });
  });

  describe('协作模式管理', () => {
    it('应该能够记录协作模式', async () => {
      const pattern = {
        type: 'team-collaboration' as const,
        description: '前后端协作流程',
        participants: [
          { role: 'frontend-developer' as TeamRole, responsibility: '前端开发' },
          { role: 'backend-developer' as TeamRole, responsibility: '后端开发' }
        ],
        workflow: [
          { step: 1, action: '需求分析', owner: 'product-manager', dependencies: [] },
          { step: 2, action: 'API设计', owner: 'backend-developer', dependencies: ['需求分析'] }
        ],
        communicationChannels: ['Slack', 'Email'],
        deliverables: ['API文档', '前端界面'],
        successMetrics: ['按时交付', '质量达标']
      };

      const patternId = await teamMemoryManager.recordCollaborationPattern(
        '前后端协作',
        '标准的前后端协作流程',
        ['frontend-developer' as TeamRole, 'backend-developer' as TeamRole],
        pattern,
        true
      );

      expect(patternId).toBeDefined();
      expect(typeof patternId).toBe('string');
    });

    it('应该能够获取推荐的协作模式', async () => {
      // 先记录一个协作模式
      const pattern = {
        type: 'team-collaboration' as const,
        description: '测试协作模式',
        participants: [
          { role: 'frontend-developer' as TeamRole, responsibility: '前端' }
        ],
        workflow: [],
        communicationChannels: [],
        deliverables: [],
        successMetrics: []
      };

      await teamMemoryManager.recordCollaborationPattern(
        '测试模式',
        '测试用的协作模式',
        ['frontend-developer' as TeamRole],
        pattern,
        true
      );

      // 获取推荐模式
      const recommendedPatterns = await teamMemoryManager.getRecommendedCollaborationPatterns(
        ['frontend-developer' as TeamRole]
      );

      expect(recommendedPatterns).toHaveLength(1);
      expect(recommendedPatterns[0].name).toBe('测试模式');
    });

    it('应该更新现有协作模式的统计信息', async () => {
      const pattern = {
        type: 'team-collaboration' as const,
        description: '重复协作模式测试',
        participants: [
          { role: 'frontend-developer' as TeamRole, responsibility: '前端' }
        ],
        workflow: [],
        communicationChannels: [],
        deliverables: [],
        successMetrics: []
      };

      // 第一次记录
      const patternId1 = await teamMemoryManager.recordCollaborationPattern(
        '重复模式',
        '测试重复记录',
        ['frontend-developer' as TeamRole],
        pattern,
        true
      );

      // 第二次记录相同模式（也是成功的，这样成功率会保持在1.0）
      const patternId2 = await teamMemoryManager.recordCollaborationPattern(
        '重复模式',
        '测试重复记录',
        ['frontend-developer' as TeamRole],
        pattern,
        true
      );

      // 应该返回相同的ID
      expect(patternId1).toBe(patternId2);

      // 获取模式并检查统计信息
      const patterns = await teamMemoryManager.getRecommendedCollaborationPatterns(
        ['frontend-developer' as TeamRole]
      );

      const updatedPattern = patterns.find(p => p.id === patternId1);
      expect(updatedPattern).toBeDefined();
      expect(updatedPattern!.usageCount).toBe(2);
      expect(updatedPattern!.successRate).toBe(1.0); // 两次都成功
    });
  });

  describe('团队学习记录', () => {
    it('应该能够记录团队学习', async () => {
      const learningId = await teamMemoryManager.recordTeamLearning(
        'test-project',
        'test-team',
        'success',
        '成功实施微服务架构',
        '团队成功将单体应用拆分为微服务架构',
        {
          roles: ['tech-lead' as TeamRole, 'backend-developer' as TeamRole],
          technologies: ['Docker', 'Kubernetes', 'Node.js'],
          projectPhase: 'implementation',
          complexity: 'high' as const
        },
        [
          '合理的服务拆分策略很重要',
          '监控和日志系统必不可少',
          '团队培训需要提前进行'
        ],
        [
          '建立服务治理规范',
          '完善CI/CD流程',
          '加强团队技能培训'
        ],
        'tech-lead-001'
      );

      expect(learningId).toBeDefined();
      expect(typeof learningId).toBe('string');
    });

    it('应该能够获取团队学习记录', async () => {
      // 先记录一些学习
      await teamMemoryManager.recordTeamLearning(
        'test-project',
        'test-team',
        'success',
        '前端性能优化成功',
        '通过代码分割和懒加载提升了页面性能',
        {
          roles: ['frontend-developer' as TeamRole],
          technologies: ['React', 'Webpack'],
          projectPhase: 'optimization',
          complexity: 'medium' as const
        },
        ['代码分割很有效'],
        ['继续优化其他页面'],
        'frontend-dev-001'
      );

      await teamMemoryManager.recordTeamLearning(
        'test-project',
        'test-team',
        'failure',
        '部署失败教训',
        '由于配置错误导致生产环境部署失败',
        {
          roles: ['devops-engineer' as TeamRole],
          technologies: ['Docker', 'AWS'],
          projectPhase: 'deployment',
          complexity: 'high' as const
        },
        ['配置管理很重要'],
        ['建立配置检查流程'],
        'devops-001'
      );

      // 获取所有学习记录
      const allLearning = await teamMemoryManager.getTeamLearning();
      expect(allLearning).toHaveLength(2);

      // 按类型过滤
      const successLearning = await teamMemoryManager.getTeamLearning({
        learningType: 'success'
      });
      expect(successLearning).toHaveLength(1);
      expect(successLearning[0].title).toBe('前端性能优化成功');

      // 按角色过滤
      const frontendLearning = await teamMemoryManager.getTeamLearning({
        roles: ['frontend-developer' as TeamRole]
      });
      expect(frontendLearning).toHaveLength(1);

      // 按技术过滤
      const reactLearning = await teamMemoryManager.getTeamLearning({
        technologies: ['React']
      });
      expect(reactLearning).toHaveLength(1);
    });
  });

  describe('数据持久化', () => {
    it('应该能够保存和加载团队数据', async () => {
      const contributor: TeamMember = {
        id: 'persist-member',
        name: '持久化测试',
        role: 'frontend-developer' as TeamRole,
        expertise: ['React'],
        joinedAt: new Date(),
        contributionScore: 10
      };

      const knowledge: TaskKnowledge = {
        knowledgeId: 'persist-knowledge',
        type: 'solution',
        title: '持久化测试知识',
        content: '测试数据持久化',
        context: {
          domain: 'test',
          technology: ['test'],
          scenario: 'persistence',
          constraints: [],
          assumptions: []
        },
        applicability: {
          taskTypes: ['testing'],
          projectTypes: ['test'],
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
        tags: ['persistence'],
        relatedKnowledge: []
      };

      await teamMemoryManager.shareKnowledge(knowledge, contributor);

      // 创建新的管理器实例来测试加载
      const newTeamMemoryManager = new TeamMemoryManager(testDir, 'test-team');
      const loadedKnowledge = await newTeamMemoryManager.getTeamKnowledge(
        'frontend-developer' as TeamRole
      );

      expect(loadedKnowledge).toHaveLength(1);
      expect(loadedKnowledge[0].knowledge.title).toBe('持久化测试知识');
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的知识ID评价', async () => {
      await expect(
        teamMemoryManager.rateKnowledge('invalid-id', 'rater', 5)
      ).rejects.toThrow('Knowledge entry not found');
    });

    it('应该处理文件系统错误', () => {
      // 测试在只读目录中创建TeamMemoryManager
      const readonlyDir = '/readonly-test-dir';
      
      // 这应该不会抛出错误，而是优雅地处理
      expect(() => {
        new TeamMemoryManager(readonlyDir, 'test-team');
      }).not.toThrow();
    });
  });
});
