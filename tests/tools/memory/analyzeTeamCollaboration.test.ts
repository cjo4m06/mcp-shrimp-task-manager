/**
 * analyzeTeamCollaboration 工具单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analyzeTeamCollaboration } from '../../../src/tools/memory/analyzeTeamCollaboration.js';
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

describe('analyzeTeamCollaboration', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `analyze-team-collaboration-test-${Date.now()}`);
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

  describe('团队表现分析', () => {
    it('应该能够分析团队整体表现', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'team-performance',
        detailLevel: 'detailed',
        includeRecommendations: true
      });

      expect(result.success).toBe(true);
      expect(result.analysisType).toBe('team-performance');
      expect(result.result).toBeDefined();
      expect(result.result.overview).toBeDefined();
      expect(result.result.topContributors).toBeDefined();
      expect(result.result.trends).toBeDefined();
      expect(result.result.recommendations).toBeDefined();
    });

    it('应该包含正确的性能指标', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'team-performance',
        targetRoles: ['frontend-developer', 'backend-developer']
      });

      expect(result.success).toBe(true);
      expect(result.result.overview).toHaveProperty('totalLearningRecords');
      expect(result.result.overview).toHaveProperty('successfulLearnings');
      expect(result.result.overview).toHaveProperty('successRate');
      expect(result.result.overview).toHaveProperty('collaborationPatterns');
      expect(result.result.overview).toHaveProperty('avgCollaborationSuccess');
    });

    it('应该识别顶级贡献者', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'team-performance'
      });

      expect(result.success).toBe(true);
      expect(result.result.topContributors).toBeDefined();
      expect(Array.isArray(result.result.topContributors)).toBe(true);
    });
  });

  describe('知识缺口分析', () => {
    it('应该能够识别知识缺口', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'knowledge-gaps',
        technologies: ['React', 'Node.js', 'Docker'],
        targetRoles: ['frontend-developer', 'backend-developer']
      });

      expect(result.success).toBe(true);
      expect(result.result.technologyGaps).toBeDefined();
      expect(result.result.roleGaps).toBeDefined();
      expect(result.result.commonIssues).toBeDefined();
      expect(result.result.gapAnalysis).toBeDefined();
    });

    it('应该提供缺口分析详情', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'knowledge-gaps',
        detailLevel: 'comprehensive'
      });

      expect(result.success).toBe(true);
      expect(result.result.gapAnalysis).toHaveProperty('criticalGaps');
      expect(result.result.gapAnalysis).toHaveProperty('emergingChallenges');
      expect(result.result.gapAnalysis).toHaveProperty('knowledgeDistribution');
    });
  });

  describe('协作效果分析', () => {
    it('应该能够评估协作效果', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'collaboration-effectiveness',
        targetRoles: ['frontend-developer', 'backend-developer', 'qa-engineer']
      });

      expect(result.success).toBe(true);
      expect(result.result.overview).toBeDefined();
      expect(result.result.roleCollaboration).toBeDefined();
      expect(result.result.mostEffectivePatterns).toBeDefined();
      expect(result.result.collaborationFrequency).toBeDefined();
    });

    it('应该分析角色组合效果', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'collaboration-effectiveness'
      });

      expect(result.success).toBe(true);
      expect(result.result.roleCollaboration).toBeDefined();
      expect(Array.isArray(result.result.roleCollaboration)).toBe(true);
    });
  });

  describe('学习趋势分析', () => {
    it('应该能够分析学习趋势', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'learning-trends',
        timeRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-12-31T23:59:59Z'
        }
      });

      expect(result.success).toBe(true);
      expect(result.result.monthlyTrends).toBeDefined();
      expect(result.result.typeDistribution).toBeDefined();
      expect(result.result.techLearningTrends).toBeDefined();
      expect(result.result.insights).toBeDefined();
    });

    it('应该包含学习效果指标', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'learning-trends'
      });

      expect(result.success).toBe(true);
      expect(result.result.insights).toHaveProperty('learningVelocity');
      expect(result.result.insights).toHaveProperty('knowledgeRetention');
      expect(result.result.insights).toHaveProperty('learningEffectiveness');
    });
  });

  describe('角色贡献分析', () => {
    it('应该能够分析角色贡献', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'role-contribution',
        targetRoles: ['frontend-developer', 'backend-developer', 'tech-lead']
      });

      expect(result.success).toBe(true);
      expect(result.result.roleAnalysis).toBeDefined();
      expect(result.result.topPerformers).toBeDefined();
      expect(result.result.roleSpecialization).toBeDefined();
    });

    it('应该识别角色专业化程度', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'role-contribution'
      });

      expect(result.success).toBe(true);
      expect(result.result.roleSpecialization).toBeDefined();
      expect(Array.isArray(result.result.roleSpecialization)).toBe(true);
      
      if (result.result.roleSpecialization.length > 0) {
        const specialization = result.result.roleSpecialization[0];
        expect(specialization).toHaveProperty('role');
        expect(specialization).toHaveProperty('specializedTechnologies');
        expect(specialization).toHaveProperty('specializationLevel');
      }
    });
  });

  describe('改进机会分析', () => {
    it('应该能够识别改进机会', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'improvement-opportunities',
        includeRecommendations: true
      });

      expect(result.success).toBe(true);
      expect(result.result.opportunities).toBeDefined();
      expect(result.result.prioritizedOpportunities).toBeDefined();
      expect(result.result.quickWins).toBeDefined();
      expect(result.result.longTermGoals).toBeDefined();
      expect(result.result.actionPlan).toBeDefined();
    });

    it('应该提供行动计划', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'improvement-opportunities'
      });

      expect(result.success).toBe(true);
      expect(result.result.actionPlan).toBeDefined();
      expect(Array.isArray(result.result.actionPlan)).toBe(true);
      
      if (result.result.actionPlan.length > 0) {
        const action = result.result.actionPlan[0];
        expect(action).toHaveProperty('step');
        expect(action).toHaveProperty('action');
        expect(action).toHaveProperty('timeline');
        expect(action).toHaveProperty('owner');
        expect(action).toHaveProperty('success_criteria');
      }
    });
  });

  describe('时间范围过滤', () => {
    it('应该支持时间范围过滤', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'team-performance',
        timeRange: {
          start: '2024-01-01T00:00:00Z',
          end: '2024-06-30T23:59:59Z'
        }
      });

      expect(result.success).toBe(true);
      expect(result.timeRange).toBeDefined();
      expect(result.timeRange.start).toBe('2024-01-01T00:00:00Z');
      expect(result.timeRange.end).toBe('2024-06-30T23:59:59Z');
    });
  });

  describe('详细程度控制', () => {
    it('应该支持不同的详细程度', async () => {
      const summaryResult = await analyzeTeamCollaboration({
        analysisType: 'team-performance',
        detailLevel: 'summary'
      });

      const detailedResult = await analyzeTeamCollaboration({
        analysisType: 'team-performance',
        detailLevel: 'detailed'
      });

      const comprehensiveResult = await analyzeTeamCollaboration({
        analysisType: 'team-performance',
        detailLevel: 'comprehensive'
      });

      expect(summaryResult.success).toBe(true);
      expect(detailedResult.success).toBe(true);
      expect(comprehensiveResult.success).toBe(true);

      expect(summaryResult.detailLevel).toBe('summary');
      expect(detailedResult.detailLevel).toBe('detailed');
      expect(comprehensiveResult.detailLevel).toBe('comprehensive');
    });
  });

  describe('建议生成', () => {
    it('应该能够生成改进建议', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'team-performance',
        includeRecommendations: true
      });

      expect(result.success).toBe(true);
      expect(result.result.recommendations).toBeDefined();
      expect(Array.isArray(result.result.recommendations)).toBe(true);
    });

    it('应该能够禁用建议生成', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'team-performance',
        includeRecommendations: false
      });

      expect(result.success).toBe(true);
      expect(result.result.recommendations).toEqual([]);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的分析类型', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'invalid-analysis-type' as any
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid enum value');
    });

    it('应该处理参数验证错误', async () => {
      const result = await analyzeTeamCollaboration({
        // 完全无效的参数
        invalidParam: 'invalid'
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('响应格式', () => {
    it('应该返回正确的响应格式', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'team-performance'
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('analysisType');
      expect(result).toHaveProperty('projectName');
      expect(result).toHaveProperty('analysisDate');
      expect(result).toHaveProperty('detailLevel');
      expect(result).toHaveProperty('result');

      if (result.success) {
        expect(typeof result.analysisDate).toBe('string');
        expect(typeof result.projectName).toBe('string');
        expect(typeof result.detailLevel).toBe('string');
      }
    });

    it('应该包含分析元数据', async () => {
      const result = await analyzeTeamCollaboration({
        analysisType: 'knowledge-gaps',
        targetRoles: ['frontend-developer'],
        technologies: ['React']
      });

      expect(result.success).toBe(true);
      expect(result.targetRoles).toEqual(['frontend-developer']);
      expect(result.technologies).toEqual(['React']);
    });
  });
});
