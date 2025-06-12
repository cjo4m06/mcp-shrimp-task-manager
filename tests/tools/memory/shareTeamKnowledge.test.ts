/**
 * shareTeamKnowledge 工具单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { shareTeamKnowledge } from '../../../src/tools/memory/shareTeamKnowledge.js';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';

// Mock dependencies
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectContext: vi.fn().mockResolvedValue({
    projectName: 'test-project',
    projectId: 'test-project',
    projectRoot: '/test/project'
  })
}));

vi.mock('../../../src/utils/pathManager.js', () => ({
  getProjectDataDir: vi.fn().mockResolvedValue('/test/data/dir')
}));

vi.mock('../../../src/taskManager.js', () => ({
  loadTasks: vi.fn().mockResolvedValue([]),
  batchCreateOrUpdateTasks: vi.fn().mockResolvedValue(true)
}));

describe('shareTeamKnowledge', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `share-team-knowledge-test-${Date.now()}`);
    fs.mkdirSync(testDir, { recursive: true });

    // Mock getProjectDataDir to return our test directory
    const { getProjectDataDir } = await import('../../../src/utils/pathManager.js');
    vi.mocked(getProjectDataDir).mockResolvedValue(testDir);
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('分享知识', () => {
    it('应该能够分享知识到团队', async () => {
      const result = await shareTeamKnowledge({
        action: 'share-knowledge',
        knowledgeType: 'solution',
        title: 'React性能优化技巧',
        content: '使用React.memo和useMemo来优化组件性能',
        domain: 'frontend',
        technologies: ['React', 'JavaScript'],
        visibility: 'team',
        contributorName: '张三',
        contributorRole: 'frontend-developer',
        contributorEmail: 'zhangsan@example.com',
        contributorExpertise: ['React', 'TypeScript']
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('share-knowledge');
      expect(result.data.knowledgeId).toBeDefined();
      expect(result.data.title).toBe('React性能优化技巧');
      expect(result.data.contributor).toBe('张三');
    });

    it('应该验证必需的参数', async () => {
      const result = await shareTeamKnowledge({
        action: 'share-knowledge',
        // 缺少必需的参数
        knowledgeType: 'solution'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('分享知识需要提供');
    });

    it('应该支持不同的可见性级别', async () => {
      const result = await shareTeamKnowledge({
        action: 'share-knowledge',
        knowledgeType: 'best-practice',
        title: '代码审查最佳实践',
        content: '代码审查的标准流程和注意事项',
        visibility: 'role-specific',
        applicableRoles: ['tech-lead', 'senior-developer'],
        contributorName: '李四',
        contributorRole: 'tech-lead'
      });

      expect(result.success).toBe(true);
      expect(result.data.visibility).toBe('role-specific');
    });
  });

  describe('获取团队知识', () => {
    it('应该能够获取团队知识', async () => {
      // 先分享一些知识
      await shareTeamKnowledge({
        action: 'share-knowledge',
        knowledgeType: 'solution',
        title: '测试知识',
        content: '测试内容',
        contributorName: '测试者',
        contributorRole: 'frontend-developer'
      });

      const result = await shareTeamKnowledge({
        action: 'get-team-knowledge',
        requesterRole: 'frontend-developer',
        queryContext: {
          technologies: ['React'],
          taskType: 'frontend-development'
        }
      });

      expect(result.success).toBe(true);
      expect(result.data.knowledgeCount).toBeGreaterThanOrEqual(0);
      expect(result.data.knowledge).toBeDefined();
      expect(Array.isArray(result.data.knowledge)).toBe(true);
    });

    it('应该验证请求者角色', async () => {
      const result = await shareTeamKnowledge({
        action: 'get-team-knowledge'
        // 缺少 requesterRole
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('获取团队知识需要提供请求者角色');
    });
  });

  describe('评价知识', () => {
    it('应该能够评价知识', async () => {
      // 先分享知识
      const shareResult = await shareTeamKnowledge({
        action: 'share-knowledge',
        knowledgeType: 'solution',
        title: '待评价的知识',
        content: '这是一个测试知识',
        contributorName: '贡献者',
        contributorRole: 'frontend-developer'
      });

      expect(shareResult.success).toBe(true);

      const result = await shareTeamKnowledge({
        action: 'rate-knowledge',
        knowledgeId: shareResult.data.knowledgeId,
        rating: 5,
        ratingComment: '非常有用的知识',
        contributorName: '评价者'
      });

      expect(result.success).toBe(true);
      expect(result.data.rating).toBe(5);
      expect(result.data.comment).toBe('非常有用的知识');
    });

    it('应该验证评价参数', async () => {
      const result = await shareTeamKnowledge({
        action: 'rate-knowledge',
        rating: 5
        // 缺少 knowledgeId 和 contributorName
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('评分知识需要提供');
    });
  });

  describe('记录协作模式', () => {
    it('应该能够记录协作模式', async () => {
      const result = await shareTeamKnowledge({
        action: 'record-collaboration',
        collaborationName: '前后端协作流程',
        collaborationDescription: '标准的前后端开发协作流程',
        involvedRoles: ['frontend-developer', 'backend-developer'],
        collaborationSuccess: true
      });

      expect(result.success).toBe(true);
      expect(result.data.patternId).toBeDefined();
      expect(result.data.name).toBe('前后端协作流程');
      expect(result.data.success).toBe(true);
    });

    it('应该验证协作模式参数', async () => {
      const result = await shareTeamKnowledge({
        action: 'record-collaboration',
        collaborationName: '测试协作'
        // 缺少其他必需参数
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('记录协作模式需要提供');
    });
  });

  describe('获取协作模式', () => {
    it('应该能够获取协作模式', async () => {
      // 先记录一个协作模式
      await shareTeamKnowledge({
        action: 'record-collaboration',
        collaborationName: '测试协作模式',
        collaborationDescription: '测试用的协作模式',
        involvedRoles: ['frontend-developer'],
        collaborationSuccess: true
      });

      const result = await shareTeamKnowledge({
        action: 'get-collaboration-patterns',
        involvedRoles: ['frontend-developer']
      });

      expect(result.success).toBe(true);
      expect(result.data.patternCount).toBeGreaterThanOrEqual(0);
      expect(result.data.patterns).toBeDefined();
      expect(Array.isArray(result.data.patterns)).toBe(true);
    });

    it('应该验证涉及角色参数', async () => {
      const result = await shareTeamKnowledge({
        action: 'get-collaboration-patterns'
        // 缺少 involvedRoles
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('获取协作模式需要提供涉及的角色');
    });
  });

  describe('记录学习经验', () => {
    it('应该能够记录团队学习', async () => {
      const result = await shareTeamKnowledge({
        action: 'record-learning',
        learningType: 'success',
        learningTitle: '微服务架构实施成功',
        learningDescription: '团队成功实施了微服务架构改造',
        lessons: ['合理的服务拆分很重要', '监控系统必不可少'],
        recommendations: ['建立服务治理规范', '完善CI/CD流程'],
        contributorName: '架构师',
        contributorRole: 'tech-lead',
        technologies: ['Docker', 'Kubernetes']
      });

      expect(result.success).toBe(true);
      expect(result.data.learningId).toBeDefined();
      expect(result.data.title).toBe('微服务架构实施成功');
      expect(result.data.type).toBe('success');
    });

    it('应该验证学习记录参数', async () => {
      const result = await shareTeamKnowledge({
        action: 'record-learning',
        learningType: 'success'
        // 缺少其他必需参数
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('记录学习需要提供');
    });
  });

  describe('获取团队学习', () => {
    it('应该能够获取团队学习记录', async () => {
      // 先记录一些学习
      await shareTeamKnowledge({
        action: 'record-learning',
        learningType: 'success',
        learningTitle: '测试学习记录',
        learningDescription: '这是一个测试学习记录',
        contributorName: '测试者'
      });

      const result = await shareTeamKnowledge({
        action: 'get-team-learning',
        filters: {
          learningType: 'success'
        }
      });

      expect(result.success).toBe(true);
      expect(result.data.recordCount).toBeGreaterThanOrEqual(0);
      expect(result.data.records).toBeDefined();
      expect(Array.isArray(result.data.records)).toBe(true);
    });

    it('应该支持过滤条件', async () => {
      const result = await shareTeamKnowledge({
        action: 'get-team-learning',
        filters: {
          learningType: 'failure',
          roles: ['frontend-developer'],
          technologies: ['React'],
          verified: true
        }
      });

      expect(result.success).toBe(true);
      expect(result.data.records).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的操作类型', async () => {
      const result = await shareTeamKnowledge({
        action: 'invalid-action' as any
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid enum value');
    });

    it('应该处理参数验证错误', async () => {
      const result = await shareTeamKnowledge({
        // 完全无效的参数
        invalidParam: 'invalid'
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('数据格式', () => {
    it('应该返回正确的响应格式', async () => {
      const result = await shareTeamKnowledge({
        action: 'share-knowledge',
        knowledgeType: 'solution',
        title: '格式测试',
        content: '测试响应格式',
        contributorName: '测试者',
        contributorRole: 'frontend-developer'
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('projectName');

      if (result.success) {
        expect(typeof result.timestamp).toBe('string');
        expect(typeof result.projectName).toBe('string');
      }
    });
  });
});
