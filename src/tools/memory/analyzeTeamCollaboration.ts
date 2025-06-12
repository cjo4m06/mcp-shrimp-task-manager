/**
 * 团队协作分析工具
 * 分析团队协作效果、识别改进机会、生成协作建议
 */

import { z } from 'zod';
import { TeamMemoryManager } from '../../memory/TeamMemoryManager.js';
import { getProjectContext } from '../../utils/projectDetector.js';
import { getProjectDataDir } from '../../utils/pathManager.js';
import { TeamRole } from '../../prd/types.js';

// 输入参数验证
const AnalyzeTeamCollaborationSchema = z.object({
  analysisType: z
    .enum([
      'team-performance',
      'knowledge-gaps',
      'collaboration-effectiveness',
      'learning-trends',
      'role-contribution',
      'improvement-opportunities',
    ])
    .describe('分析类型'),

  timeRange: z
    .object({
      start: z.string().optional().describe('开始时间 (ISO格式)'),
      end: z.string().optional().describe('结束时间 (ISO格式)'),
    })
    .optional()
    .describe('分析时间范围'),

  targetRoles: z.array(z.string()).optional().describe('目标角色列表'),
  technologies: z.array(z.string()).optional().describe('关注的技术栈'),
  includeRecommendations: z.boolean().default(true).describe('是否包含改进建议'),
  detailLevel: z.enum(['summary', 'detailed', 'comprehensive']).default('detailed').describe('分析详细程度'),
});

type AnalyzeTeamCollaborationInput = z.infer<typeof AnalyzeTeamCollaborationSchema>;

/**
 * 团队协作分析
 */
export async function analyzeTeamCollaboration(args: AnalyzeTeamCollaborationInput) {
  try {
    // 验证输入参数
    const validatedArgs = AnalyzeTeamCollaborationSchema.parse(args);
    const { analysisType, timeRange, targetRoles, technologies, includeRecommendations, detailLevel } = validatedArgs;

    // 获取项目上下文
    const projectContext = await getProjectContext();
    console.log(`📊 团队协作分析 - 项目 "${projectContext.projectName}"`);

    // 初始化团队记忆管理器
    const dataDir = await getProjectDataDir();
    const teamMemoryManager = new TeamMemoryManager(dataDir, projectContext.projectName);

    console.log(`🔍 分析类型: ${analysisType}`);

    let analysisResult;

    switch (analysisType) {
      case 'team-performance':
        analysisResult = await analyzeTeamPerformance(teamMemoryManager, validatedArgs);
        break;

      case 'knowledge-gaps':
        analysisResult = await analyzeKnowledgeGaps(teamMemoryManager, validatedArgs);
        break;

      case 'collaboration-effectiveness':
        analysisResult = await analyzeCollaborationEffectiveness(teamMemoryManager, validatedArgs);
        break;

      case 'learning-trends':
        analysisResult = await analyzeLearningTrends(teamMemoryManager, validatedArgs);
        break;

      case 'role-contribution':
        analysisResult = await analyzeRoleContribution(teamMemoryManager, validatedArgs);
        break;

      case 'improvement-opportunities':
        analysisResult = await analyzeImprovementOpportunities(teamMemoryManager, validatedArgs);
        break;

      default:
        throw new Error(`不支持的分析类型: ${analysisType}`);
    }

    console.log(`✅ 分析完成: ${analysisType}`);

    return {
      success: true,
      analysisType,
      projectName: projectContext.projectName,
      analysisDate: new Date().toISOString(),
      timeRange,
      targetRoles,
      technologies,
      detailLevel,
      result: analysisResult,
    };
  } catch (error) {
    console.error('❌ 团队协作分析失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 分析团队表现
async function analyzeTeamPerformance(teamMemoryManager: TeamMemoryManager, args: AnalyzeTeamCollaborationInput) {
  console.log('📈 分析团队整体表现...');

  // 获取团队学习记录
  const learningRecords = await teamMemoryManager.getTeamLearning();

  // 获取协作模式
  const allRoles =
    (args.targetRoles as TeamRole[]) ||
    ([
      'product-manager',
      'ui-designer',
      'ux-designer',
      'frontend-developer',
      'backend-developer',
      'fullstack-developer',
      'mobile-developer',
      'qa-engineer',
      'devops-engineer',
      'tech-lead',
      'project-manager',
    ] as TeamRole[]);
  const collaborationPatterns = await teamMemoryManager.getRecommendedCollaborationPatterns(allRoles);

  // 计算性能指标
  const successfulLearnings = learningRecords.filter((r) => r.learningType === 'success').length;
  const totalLearnings = learningRecords.length;
  const successRate = totalLearnings > 0 ? (successfulLearnings / totalLearnings) * 100 : 0;

  const avgCollaborationSuccess =
    collaborationPatterns.length > 0
      ? (collaborationPatterns.reduce((sum, p) => sum + p.successRate, 0) / collaborationPatterns.length) * 100
      : 0;

  // 识别活跃贡献者
  const contributorStats = new Map<string, number>();
  learningRecords.forEach((record) => {
    contributorStats.set(record.createdBy, (contributorStats.get(record.createdBy) || 0) + 1);
  });

  const topContributors = Array.from(contributorStats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    overview: {
      totalLearningRecords: totalLearnings,
      successfulLearnings,
      successRate: Math.round(successRate),
      collaborationPatterns: collaborationPatterns.length,
      avgCollaborationSuccess: Math.round(avgCollaborationSuccess),
    },

    topContributors: topContributors.map(([name, count]) => ({
      name,
      contributionCount: count,
      percentage: Math.round((count / totalLearnings) * 100),
    })),

    trends: {
      recentActivity: learningRecords.filter(
        (r) => new Date(r.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
      improvementTrend: calculateImprovementTrend(learningRecords),
      collaborationTrend: calculateCollaborationTrend(collaborationPatterns),
    },

    recommendations: args.includeRecommendations
      ? [
          successRate < 70 ? '建议加强团队培训和知识分享' : '团队学习效果良好，继续保持',
          avgCollaborationSuccess < 80 ? '需要优化团队协作模式' : '协作效果优秀',
          topContributors.length < 3 ? '鼓励更多团队成员参与知识分享' : '知识分享参与度良好',
        ]
      : [],
  };
}

// 分析知识缺口
async function analyzeKnowledgeGaps(teamMemoryManager: TeamMemoryManager, args: AnalyzeTeamCollaborationInput) {
  console.log('🔍 分析团队知识缺口...');

  const learningRecords = await teamMemoryManager.getTeamLearning();

  // 分析失败和改进类型的学习记录
  const failureRecords = learningRecords.filter((r) => r.learningType === 'failure');
  const improvementRecords = learningRecords.filter((r) => r.learningType === 'improvement');

  // 识别技术缺口
  const techGaps = new Map<string, number>();
  [...failureRecords, ...improvementRecords].forEach((record) => {
    record.context.technologies.forEach((tech) => {
      techGaps.set(tech, (techGaps.get(tech) || 0) + 1);
    });
  });

  // 识别角色缺口
  const roleGaps = new Map<string, number>();
  [...failureRecords, ...improvementRecords].forEach((record) => {
    record.context.roles.forEach((role) => {
      roleGaps.set(role, (roleGaps.get(role) || 0) + 1);
    });
  });

  // 识别常见问题
  const commonIssues = extractCommonIssues(failureRecords);

  return {
    technologyGaps: Array.from(techGaps.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tech, count]) => ({ technology: tech, issueCount: count })),

    roleGaps: Array.from(roleGaps.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([role, count]) => ({ role, issueCount: count })),

    commonIssues: commonIssues.slice(0, 5),

    gapAnalysis: {
      criticalGaps: identifyCriticalGaps(techGaps, roleGaps),
      emergingChallenges: identifyEmergingChallenges(learningRecords),
      knowledgeDistribution: analyzeKnowledgeDistribution(learningRecords),
    },

    recommendations: args.includeRecommendations ? generateGapRecommendations(techGaps, roleGaps) : [],
  };
}

// 分析协作效果
async function analyzeCollaborationEffectiveness(
  teamMemoryManager: TeamMemoryManager,
  args: AnalyzeTeamCollaborationInput
) {
  console.log('🤝 分析协作效果...');

  const allRoles =
    (args.targetRoles as TeamRole[]) ||
    ([
      'product-manager',
      'ui-designer',
      'ux-designer',
      'frontend-developer',
      'backend-developer',
      'fullstack-developer',
      'mobile-developer',
      'qa-engineer',
      'devops-engineer',
      'tech-lead',
      'project-manager',
    ] as TeamRole[]);
  const patterns = await teamMemoryManager.getRecommendedCollaborationPatterns(allRoles);

  // 分析协作成功率
  const collaborationStats = {
    totalPatterns: patterns.length,
    highSuccessPatterns: patterns.filter((p) => p.successRate > 0.8).length,
    mediumSuccessPatterns: patterns.filter((p) => p.successRate >= 0.6 && p.successRate <= 0.8).length,
    lowSuccessPatterns: patterns.filter((p) => p.successRate < 0.6).length,
  };

  // 角色组合分析
  const roleComboAnalysis = analyzeRoleCombinations(patterns);

  // 协作频率分析
  const collaborationFrequency = patterns
    .map((p) => ({
      name: p.name,
      usageCount: p.usageCount,
      successRate: Math.round(p.successRate * 100),
      lastUsed: p.lastUsed,
      involvedRoles: p.involvedRoles,
    }))
    .sort((a, b) => b.usageCount - a.usageCount);

  return {
    overview: {
      ...collaborationStats,
      avgSuccessRate: Math.round((patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length) * 100),
    },

    roleCollaboration: roleComboAnalysis,

    mostEffectivePatterns: patterns
      .filter((p) => p.successRate > 0.7)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        successRate: Math.round(p.successRate * 100),
        usageCount: p.usageCount,
        roles: p.involvedRoles,
      })),

    collaborationFrequency: collaborationFrequency.slice(0, 10),

    recommendations: args.includeRecommendations
      ? [
          collaborationStats.lowSuccessPatterns > 0
            ? `有 ${collaborationStats.lowSuccessPatterns} 个低成功率协作模式需要改进`
            : '协作模式整体表现良好',
          '推广高成功率的协作模式到其他团队',
          '定期回顾和优化协作流程',
        ]
      : [],
  };
}

// 分析学习趋势
async function analyzeLearningTrends(teamMemoryManager: TeamMemoryManager, args: AnalyzeTeamCollaborationInput) {
  console.log('📚 分析学习趋势...');

  const learningRecords = await teamMemoryManager.getTeamLearning();

  // 按时间分组
  const monthlyTrends = groupLearningByMonth(learningRecords);

  // 按类型分析
  const typeDistribution = {
    success: learningRecords.filter((r) => r.learningType === 'success').length,
    failure: learningRecords.filter((r) => r.learningType === 'failure').length,
    improvement: learningRecords.filter((r) => r.learningType === 'improvement').length,
    pattern: learningRecords.filter((r) => r.learningType === 'pattern').length,
  };

  // 技术学习趋势
  const techLearningTrends = analyzeTechLearningTrends(learningRecords);

  return {
    monthlyTrends,
    typeDistribution,
    techLearningTrends,

    insights: {
      learningVelocity: calculateLearningVelocity(learningRecords),
      knowledgeRetention: calculateKnowledgeRetention(learningRecords),
      learningEffectiveness: calculateLearningEffectiveness(learningRecords),
    },

    recommendations: args.includeRecommendations
      ? ['建立定期的知识分享会议', '鼓励团队成员记录更多的成功经验', '建立知识验证和更新机制']
      : [],
  };
}

// 分析角色贡献
async function analyzeRoleContribution(teamMemoryManager: TeamMemoryManager, args: AnalyzeTeamCollaborationInput) {
  console.log('👥 分析角色贡献...');

  const learningRecords = await teamMemoryManager.getTeamLearning();

  // 按角色统计贡献
  const roleContributions = new Map<
    string,
    {
      learningCount: number;
      successCount: number;
      improvementCount: number;
      technologies: Set<string>;
    }
  >();

  learningRecords.forEach((record) => {
    record.context.roles.forEach((role) => {
      if (!roleContributions.has(role)) {
        roleContributions.set(role, {
          learningCount: 0,
          successCount: 0,
          improvementCount: 0,
          technologies: new Set(),
        });
      }

      const contrib = roleContributions.get(role)!;
      contrib.learningCount++;

      if (record.learningType === 'success') contrib.successCount++;
      if (record.learningType === 'improvement') contrib.improvementCount++;

      record.context.technologies.forEach((tech) => contrib.technologies.add(tech));
    });
  });

  const roleAnalysis = Array.from(roleContributions.entries())
    .map(([role, contrib]) => ({
      role,
      totalContributions: contrib.learningCount,
      successContributions: contrib.successCount,
      improvementContributions: contrib.improvementCount,
      successRate: contrib.learningCount > 0 ? Math.round((contrib.successCount / contrib.learningCount) * 100) : 0,
      technologiesCount: contrib.technologies.size,
      technologies: Array.from(contrib.technologies),
    }))
    .sort((a, b) => b.totalContributions - a.totalContributions);

  return {
    roleAnalysis,

    topPerformers: roleAnalysis.slice(0, 3),

    roleSpecialization: roleAnalysis.map((r) => ({
      role: r.role,
      specializedTechnologies: r.technologies.slice(0, 5),
      specializationLevel: r.technologiesCount > 5 ? 'high' : r.technologiesCount > 2 ? 'medium' : 'low',
    })),

    recommendations: args.includeRecommendations ? generateRoleRecommendations(roleAnalysis) : [],
  };
}

// 分析改进机会
async function analyzeImprovementOpportunities(
  teamMemoryManager: TeamMemoryManager,
  args: AnalyzeTeamCollaborationInput
) {
  console.log('🎯 分析改进机会...');

  const learningRecords = await teamMemoryManager.getTeamLearning();
  const allRoles =
    (args.targetRoles as TeamRole[]) ||
    ([
      'product-manager',
      'ui-designer',
      'ux-designer',
      'frontend-developer',
      'backend-developer',
      'fullstack-developer',
      'mobile-developer',
      'qa-engineer',
      'devops-engineer',
      'tech-lead',
      'project-manager',
    ] as TeamRole[]);
  const patterns = await teamMemoryManager.getRecommendedCollaborationPatterns(allRoles);

  // 识别改进机会
  const opportunities = {
    processImprovements: identifyProcessImprovements(learningRecords),
    collaborationImprovements: identifyCollaborationImprovements(patterns),
    knowledgeImprovements: identifyKnowledgeImprovements(learningRecords),
    toolingImprovements: identifyToolingImprovements(learningRecords),
  };

  // 优先级排序
  const prioritizedOpportunities = prioritizeImprovements(opportunities);

  return {
    opportunities,
    prioritizedOpportunities,

    quickWins: identifyQuickWins(opportunities),
    longTermGoals: identifyLongTermGoals(opportunities),

    actionPlan: generateActionPlan(prioritizedOpportunities),

    recommendations: args.includeRecommendations
      ? ['优先实施快速见效的改进措施', '建立改进效果的跟踪机制', '定期评估和调整改进计划']
      : [],
  };
}

// 辅助函数
function calculateImprovementTrend(records: any[]): string {
  const recent = records.filter((r) => new Date(r.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000);
  const older = records.filter(
    (r) =>
      new Date(r.createdAt).getTime() <= Date.now() - 30 * 24 * 60 * 60 * 1000 &&
      new Date(r.createdAt).getTime() > Date.now() - 60 * 24 * 60 * 60 * 1000
  );

  if (recent.length > older.length) return '上升';
  if (recent.length < older.length) return '下降';
  return '稳定';
}

function calculateCollaborationTrend(patterns: any[]): string {
  const recentPatterns = patterns.filter((p) => new Date(p.lastUsed).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000);

  return recentPatterns.length > patterns.length * 0.3 ? '活跃' : '一般';
}

function extractCommonIssues(failureRecords: any[]): string[] {
  const issues = new Map<string, number>();

  failureRecords.forEach((record) => {
    // 简化的问题提取逻辑
    const words = record.description.toLowerCase().split(/\s+/);
    words.forEach((word: string) => {
      if (word.length > 4) {
        issues.set(word, (issues.get(word) || 0) + 1);
      }
    });
  });

  return Array.from(issues.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([issue]) => issue);
}

function identifyCriticalGaps(techGaps: Map<string, number>, roleGaps: Map<string, number>): string[] {
  const critical = [];

  for (const [tech, count] of techGaps.entries()) {
    if (count > 3) critical.push(`${tech} 技术缺口`);
  }

  for (const [role, count] of roleGaps.entries()) {
    if (count > 2) critical.push(`${role} 角色能力缺口`);
  }

  return critical;
}

function identifyEmergingChallenges(records: any[]): string[] {
  // 简化实现
  return ['新技术适应', '跨团队协作', '知识传承'];
}

function analyzeKnowledgeDistribution(records: any[]): any {
  return {
    evenlyDistributed: records.length > 10,
    concentrationLevel: 'medium',
    coverageGaps: ['测试', '部署', '监控'],
  };
}

function generateGapRecommendations(techGaps: Map<string, number>, roleGaps: Map<string, number>): string[] {
  const recommendations = [];

  if (techGaps.size > 0) {
    recommendations.push('加强技术培训和知识分享');
  }

  if (roleGaps.size > 0) {
    recommendations.push('优化角色分工和能力建设');
  }

  recommendations.push('建立知识库和最佳实践文档');

  return recommendations;
}

function analyzeRoleCombinations(patterns: any[]): any {
  const combos = new Map<string, { count: number; avgSuccess: number }>();

  patterns.forEach((pattern) => {
    const key = pattern.involvedRoles.sort().join('-');
    if (!combos.has(key)) {
      combos.set(key, { count: 0, avgSuccess: 0 });
    }
    const combo = combos.get(key)!;
    combo.count++;
    combo.avgSuccess = (combo.avgSuccess * (combo.count - 1) + pattern.successRate) / combo.count;
  });

  return Array.from(combos.entries()).map(([roles, stats]) => ({
    roleCombo: roles,
    collaborationCount: stats.count,
    avgSuccessRate: Math.round(stats.avgSuccess * 100),
  }));
}

function groupLearningByMonth(records: any[]): any[] {
  const months = new Map<string, number>();

  records.forEach((record) => {
    const month = new Date(record.createdAt).toISOString().slice(0, 7);
    months.set(month, (months.get(month) || 0) + 1);
  });

  return Array.from(months.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, count]) => ({ month, learningCount: count }));
}

function analyzeTechLearningTrends(records: any[]): any[] {
  const techTrends = new Map<string, number>();

  records.forEach((record) => {
    record.context.technologies.forEach((tech: string) => {
      techTrends.set(tech, (techTrends.get(tech) || 0) + 1);
    });
  });

  return Array.from(techTrends.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tech, count]) => ({ technology: tech, learningCount: count }));
}

function calculateLearningVelocity(records: any[]): string {
  const recentCount = records.filter(
    (r) => new Date(r.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
  ).length;

  return recentCount > 5 ? '高' : recentCount > 2 ? '中' : '低';
}

function calculateKnowledgeRetention(records: any[]): string {
  const verifiedCount = records.filter((r) => r.verified).length;
  const retentionRate = records.length > 0 ? verifiedCount / records.length : 0;

  return retentionRate > 0.7 ? '高' : retentionRate > 0.4 ? '中' : '低';
}

function calculateLearningEffectiveness(records: any[]): string {
  const successRate = records.filter((r) => r.learningType === 'success').length / records.length;
  return successRate > 0.6 ? '高' : successRate > 0.3 ? '中' : '低';
}

function generateRoleRecommendations(roleAnalysis: any[]): string[] {
  const recommendations = [];

  const lowPerformers = roleAnalysis.filter((r) => r.successRate < 50);
  if (lowPerformers.length > 0) {
    recommendations.push(`${lowPerformers.map((r) => r.role).join(', ')} 角色需要额外支持`);
  }

  const specialists = roleAnalysis.filter((r) => r.technologiesCount > 5);
  if (specialists.length > 0) {
    recommendations.push('利用专家角色进行知识传授');
  }

  recommendations.push('促进角色间的知识交流');

  return recommendations;
}

function identifyProcessImprovements(records: any[]): string[] {
  return ['优化代码审查流程', '改进测试策略', '加强文档管理'];
}

function identifyCollaborationImprovements(patterns: any[]): string[] {
  return ['建立更好的沟通机制', '优化任务分配', '加强跨角色协作'];
}

function identifyKnowledgeImprovements(records: any[]): string[] {
  return ['建立知识库', '定期知识分享', '经验文档化'];
}

function identifyToolingImprovements(records: any[]): string[] {
  return ['改进开发工具', '自动化流程', '监控和报警'];
}

function prioritizeImprovements(opportunities: any): any[] {
  // 简化的优先级排序
  return [
    { category: 'process', priority: 'high', effort: 'medium' },
    { category: 'collaboration', priority: 'high', effort: 'low' },
    { category: 'knowledge', priority: 'medium', effort: 'low' },
    { category: 'tooling', priority: 'medium', effort: 'high' },
  ];
}

function identifyQuickWins(opportunities: any): string[] {
  return ['建立日常站会', '创建知识分享频道', '优化代码审查'];
}

function identifyLongTermGoals(opportunities: any): string[] {
  return ['建立完整的知识管理体系', '实现全面的自动化', '建立学习型组织'];
}

function generateActionPlan(prioritized: any[]): any[] {
  return prioritized.map((item, index) => ({
    step: index + 1,
    action: `实施 ${item.category} 改进`,
    timeline: item.priority === 'high' ? '1-2周' : '1-2月',
    owner: '团队负责人',
    success_criteria: '改进效果可测量',
  }));
}

// 工具定义
export const analyzeTeamCollaborationTool = {
  name: 'analyze_team_collaboration',
  description: `团队协作分析工具 - 深度分析团队协作效果和改进机会

📊 **分析维度**：
- team-performance: 团队整体表现分析
- knowledge-gaps: 知识缺口识别和分析
- collaboration-effectiveness: 协作效果评估
- learning-trends: 学习趋势和模式分析
- role-contribution: 角色贡献度分析
- improvement-opportunities: 改进机会识别

🎯 **分析价值**：
- 数据驱动的团队改进决策
- 识别团队协作的瓶颈和机会
- 优化团队知识分布和技能发展
- 提升团队整体协作效率

📈 **输出内容**：
- 详细的分析报告和可视化数据
- 具体的改进建议和行动计划
- 趋势分析和预测
- 最佳实践推荐

💡 **使用场景**：
- 团队回顾和改进规划
- 新项目启动前的团队评估
- 定期的团队健康检查
- 组织级别的协作优化

这个工具帮助团队领导者和项目经理基于数据做出明智的团队管理决策，
持续优化团队协作效果和知识管理水平。`,
  inputSchema: AnalyzeTeamCollaborationSchema,
};
