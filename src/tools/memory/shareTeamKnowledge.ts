/**
 * 团队知识分享工具
 * 支持团队成员之间的知识分享、经验传递和协作模式学习
 */

import { z } from 'zod';
import { TeamMemoryManager, TeamMember } from '../../memory/TeamMemoryManager.js';
import { getProjectContext } from '../../utils/projectDetector.js';
import { getProjectDataDir } from '../../utils/pathManager.js';
import { TaskKnowledge } from '../../types/taskMemory.js';
import { TeamRole } from '../../prd/types.js';

// 输入参数验证
const ShareTeamKnowledgeSchema = z.object({
  action: z
    .enum([
      'share-knowledge',
      'get-team-knowledge',
      'rate-knowledge',
      'record-collaboration',
      'get-collaboration-patterns',
      'record-learning',
      'get-team-learning',
    ])
    .describe('操作类型'),

  // 知识分享相关
  knowledgeType: z
    .enum(['pattern', 'solution', 'pitfall', 'best-practice', 'lesson-learned'])
    .optional()
    .describe('知识类型'),
  title: z.string().optional().describe('知识标题'),
  content: z.string().optional().describe('知识内容'),
  domain: z.string().optional().describe('知识领域'),
  technologies: z.array(z.string()).optional().describe('相关技术'),
  visibility: z.enum(['public', 'team', 'role-specific']).optional().describe('可见性'),
  applicableRoles: z.array(z.string()).optional().describe('适用角色'),

  // 团队成员信息
  contributorName: z.string().optional().describe('贡献者姓名'),
  contributorRole: z.string().optional().describe('贡献者角色'),
  contributorEmail: z.string().optional().describe('贡献者邮箱'),
  contributorExpertise: z.array(z.string()).optional().describe('贡献者专长'),

  // 查询相关
  requesterRole: z.string().optional().describe('请求者角色'),
  queryContext: z
    .object({
      technologies: z.array(z.string()).optional(),
      projectType: z.string().optional(),
      taskType: z.string().optional(),
    })
    .optional()
    .describe('查询上下文'),

  // 评分相关
  knowledgeId: z.string().optional().describe('知识ID'),
  rating: z.number().min(1).max(5).optional().describe('评分 (1-5)'),
  ratingComment: z.string().optional().describe('评分评论'),

  // 协作模式相关
  collaborationName: z.string().optional().describe('协作模式名称'),
  collaborationDescription: z.string().optional().describe('协作模式描述'),
  involvedRoles: z.array(z.string()).optional().describe('涉及角色'),
  collaborationSuccess: z.boolean().optional().describe('协作是否成功'),

  // 学习记录相关
  learningType: z.enum(['success', 'failure', 'improvement', 'pattern']).optional().describe('学习类型'),
  learningTitle: z.string().optional().describe('学习标题'),
  learningDescription: z.string().optional().describe('学习描述'),
  lessons: z.array(z.string()).optional().describe('经验教训'),
  recommendations: z.array(z.string()).optional().describe('建议'),

  // 过滤器
  filters: z
    .object({
      learningType: z.string().optional(),
      roles: z.array(z.string()).optional(),
      technologies: z.array(z.string()).optional(),
      verified: z.boolean().optional(),
    })
    .optional()
    .describe('过滤条件'),
});

type ShareTeamKnowledgeInput = z.infer<typeof ShareTeamKnowledgeSchema>;

/**
 * 团队知识分享
 */
export async function shareTeamKnowledge(args: ShareTeamKnowledgeInput) {
  try {
    // 验证输入参数
    const validatedArgs = ShareTeamKnowledgeSchema.parse(args);
    const { action } = validatedArgs;

    // 获取项目上下文
    const projectContext = await getProjectContext();
    console.log(`🤝 团队协作 - 项目 "${projectContext.projectName}"`);

    // 初始化团队记忆管理器
    const dataDir = await getProjectDataDir();
    const teamMemoryManager = new TeamMemoryManager(dataDir, projectContext.projectName);

    console.log(`📋 执行操作: ${action}`);

    let result;

    switch (action) {
      case 'share-knowledge':
        result = await handleShareKnowledge(teamMemoryManager, validatedArgs);
        break;

      case 'get-team-knowledge':
        result = await handleGetTeamKnowledge(teamMemoryManager, validatedArgs);
        break;

      case 'rate-knowledge':
        result = await handleRateKnowledge(teamMemoryManager, validatedArgs);
        break;

      case 'record-collaboration':
        result = await handleRecordCollaboration(teamMemoryManager, validatedArgs);
        break;

      case 'get-collaboration-patterns':
        result = await handleGetCollaborationPatterns(teamMemoryManager, validatedArgs);
        break;

      case 'record-learning':
        result = await handleRecordLearning(teamMemoryManager, validatedArgs, projectContext);
        break;

      case 'get-team-learning':
        result = await handleGetTeamLearning(teamMemoryManager, validatedArgs);
        break;

      default:
        throw new Error(`不支持的操作类型: ${action}`);
    }

    console.log(`✅ 操作完成: ${action}`);

    return {
      success: true,
      action,
      data: result,
      timestamp: new Date().toISOString(),
      projectName: projectContext.projectName,
    };
  } catch (error) {
    console.error('❌ 团队知识分享失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 处理知识分享
async function handleShareKnowledge(teamMemoryManager: TeamMemoryManager, args: ShareTeamKnowledgeInput) {
  const {
    knowledgeType,
    title,
    content,
    domain,
    technologies,
    visibility,
    applicableRoles,
    contributorName,
    contributorRole,
    contributorEmail,
    contributorExpertise,
  } = args;

  if (!knowledgeType || !title || !content || !contributorName || !contributorRole) {
    throw new Error('分享知识需要提供：知识类型、标题、内容、贡献者姓名和角色');
  }

  // 创建团队成员信息
  const contributor: TeamMember = {
    id: `${contributorName}-${contributorRole}`,
    name: contributorName,
    role: contributorRole as TeamRole,
    email: contributorEmail,
    expertise: contributorExpertise || [],
    joinedAt: new Date(),
    contributionScore: 0,
  };

  // 创建知识对象
  const knowledge: TaskKnowledge = {
    knowledgeId: `knowledge-${Date.now()}`,
    type: knowledgeType,
    title,
    content,
    context: {
      domain: domain || 'general',
      technology: technologies || [],
      scenario: 'team-sharing',
      constraints: [],
      assumptions: [],
    },
    applicability: {
      taskTypes: [],
      projectTypes: [],
      conditions: [],
      exclusions: [],
    },
    confidence: 0.8, // 团队分享的知识默认置信度
    source: {
      type: 'user-input',
      timestamp: new Date(),
      reliability: 'high',
      verificationStatus: 'unverified',
    },
    tags: technologies || [],
    relatedKnowledge: [],
  };

  const knowledgeId = await teamMemoryManager.shareKnowledge(
    knowledge,
    contributor,
    visibility || 'team',
    applicableRoles?.map((role) => role as TeamRole)
  );

  console.log(`📚 知识已分享: "${title}" (ID: ${knowledgeId})`);

  return {
    knowledgeId,
    title,
    contributor: contributorName,
    visibility,
    message: '知识已成功分享到团队',
  };
}

// 处理获取团队知识
async function handleGetTeamKnowledge(teamMemoryManager: TeamMemoryManager, args: ShareTeamKnowledgeInput) {
  const { requesterRole, queryContext } = args;

  if (!requesterRole) {
    throw new Error('获取团队知识需要提供请求者角色');
  }

  const knowledgeEntries = await teamMemoryManager.getTeamKnowledge(requesterRole as TeamRole, queryContext);

  console.log(`🔍 找到 ${knowledgeEntries.length} 个相关知识条目`);

  return {
    knowledgeCount: knowledgeEntries.length,
    knowledge: knowledgeEntries.slice(0, 10).map((entry) => ({
      id: entry.id,
      title: entry.knowledge.title,
      type: entry.knowledge.type,
      contributor: entry.contributor.name,
      contributorRole: entry.contributor.role,
      sharedAt: entry.sharedAt,
      usageCount: entry.usageCount,
      averageRating:
        entry.ratings.length > 0 ? entry.ratings.reduce((sum, r) => sum + r.rating, 0) / entry.ratings.length : null,
      tags: entry.tags,
      visibility: entry.visibility,
    })),
    summary: `为角色 "${requesterRole}" 找到 ${knowledgeEntries.length} 个相关知识条目`,
  };
}

// 处理知识评分
async function handleRateKnowledge(teamMemoryManager: TeamMemoryManager, args: ShareTeamKnowledgeInput) {
  const { knowledgeId, rating, ratingComment, contributorName } = args;

  if (!knowledgeId || !rating || !contributorName) {
    throw new Error('评分知识需要提供：知识ID、评分和评分者姓名');
  }

  await teamMemoryManager.rateKnowledge(knowledgeId, contributorName, rating, ratingComment);

  console.log(`⭐ 知识评分完成: ${rating}/5`);

  return {
    knowledgeId,
    rating,
    rater: contributorName,
    comment: ratingComment,
    message: '知识评分已记录',
  };
}

// 处理协作模式记录
async function handleRecordCollaboration(teamMemoryManager: TeamMemoryManager, args: ShareTeamKnowledgeInput) {
  const { collaborationName, collaborationDescription, involvedRoles, collaborationSuccess } = args;

  if (!collaborationName || !collaborationDescription || !involvedRoles || collaborationSuccess === undefined) {
    throw new Error('记录协作模式需要提供：名称、描述、涉及角色和成功状态');
  }

  // 简化的协作模式对象
  const pattern = {
    type: 'team-collaboration' as const,
    description: collaborationDescription,
    participants: involvedRoles.map((role) => ({ role: role as TeamRole, responsibility: '' })),
    workflow: [],
    communicationChannels: [],
    deliverables: [],
    successMetrics: [],
  };

  const patternId = await teamMemoryManager.recordCollaborationPattern(
    collaborationName,
    collaborationDescription,
    involvedRoles as TeamRole[],
    pattern,
    collaborationSuccess
  );

  console.log(`🤝 协作模式已记录: "${collaborationName}" (${collaborationSuccess ? '成功' : '失败'})`);

  return {
    patternId,
    name: collaborationName,
    involvedRoles,
    success: collaborationSuccess,
    message: '协作模式已记录',
  };
}

// 处理获取协作模式
async function handleGetCollaborationPatterns(teamMemoryManager: TeamMemoryManager, args: ShareTeamKnowledgeInput) {
  const { involvedRoles } = args;

  if (!involvedRoles) {
    throw new Error('获取协作模式需要提供涉及的角色');
  }

  const patterns = await teamMemoryManager.getRecommendedCollaborationPatterns(involvedRoles as TeamRole[]);

  console.log(`🔍 找到 ${patterns.length} 个推荐的协作模式`);

  return {
    patternCount: patterns.length,
    patterns: patterns.map((pattern) => ({
      id: pattern.id,
      name: pattern.name,
      description: pattern.description,
      involvedRoles: pattern.involvedRoles,
      successRate: Math.round(pattern.successRate * 100),
      usageCount: pattern.usageCount,
      lastUsed: pattern.lastUsed,
    })),
    summary: `为角色组合找到 ${patterns.length} 个推荐的协作模式`,
  };
}

// 处理学习记录
async function handleRecordLearning(
  teamMemoryManager: TeamMemoryManager,
  args: ShareTeamKnowledgeInput,
  projectContext: any
) {
  const {
    learningType,
    learningTitle,
    learningDescription,
    lessons,
    recommendations,
    contributorName,
    contributorRole,
    technologies,
  } = args;

  if (!learningType || !learningTitle || !learningDescription || !contributorName) {
    throw new Error('记录学习需要提供：学习类型、标题、描述和记录者姓名');
  }

  const context = {
    roles: contributorRole ? [contributorRole as TeamRole] : [],
    technologies: technologies || [],
    projectPhase: 'development',
    complexity: 'medium' as const,
  };

  const learningId = await teamMemoryManager.recordTeamLearning(
    projectContext.projectName,
    'default-team',
    learningType,
    learningTitle,
    learningDescription,
    context,
    lessons || [],
    recommendations || [],
    contributorName
  );

  console.log(`📖 团队学习已记录: "${learningTitle}"`);

  return {
    learningId,
    title: learningTitle,
    type: learningType,
    contributor: contributorName,
    message: '团队学习记录已保存',
  };
}

// 处理获取团队学习
async function handleGetTeamLearning(teamMemoryManager: TeamMemoryManager, args: ShareTeamKnowledgeInput) {
  const { filters } = args;

  const learningRecords = await teamMemoryManager.getTeamLearning(
    filters
      ? {
          ...filters,
          roles: filters.roles?.map((role) => role as TeamRole),
        }
      : undefined
  );

  console.log(`📚 找到 ${learningRecords.length} 个团队学习记录`);

  return {
    recordCount: learningRecords.length,
    records: learningRecords.slice(0, 10).map((record) => ({
      id: record.id,
      title: record.title,
      type: record.learningType,
      description: record.description,
      lessons: record.lessons,
      recommendations: record.recommendations,
      createdBy: record.createdBy,
      createdAt: record.createdAt,
      verified: record.verified,
      context: record.context,
    })),
    summary: `找到 ${learningRecords.length} 个团队学习记录`,
  };
}

// 工具定义
export const shareTeamKnowledgeTool = {
  name: 'share_team_knowledge',
  description: `团队知识分享和协作学习工具 - 专为团队协作设计的记忆系统

🤝 **团队协作特色**：
- 知识共享：团队成员之间分享经验、解决方案和最佳实践
- 协作模式学习：记录和学习成功的团队协作模式
- 集体智慧积累：构建团队共同的知识库和经验库
- 跨角色知识传递：不同角色间的知识和经验传递

📚 **支持的操作**：
- share-knowledge: 分享知识到团队
- get-team-knowledge: 获取团队相关知识
- rate-knowledge: 评价团队知识的有用性
- record-collaboration: 记录协作模式和效果
- get-collaboration-patterns: 获取推荐的协作模式
- record-learning: 记录团队学习和经验
- get-team-learning: 获取团队学习记录

🎯 **团队价值**：
- 避免重复犯错：团队成员可以学习他人的经验教训
- 知识传承：新成员可以快速获取团队积累的知识
- 协作优化：基于历史数据优化团队协作模式
- 持续改进：通过记录和分析不断改进团队效率

💡 **使用场景**：
- 新成员入职时获取团队知识
- 遇到问题时查询团队解决方案
- 项目结束后记录经验教训
- 优化团队协作流程

这个工具让团队的集体智慧得以保存、传递和持续改进，
真正实现团队协作的知识共享和经验传承。`,
  inputSchema: ShareTeamKnowledgeSchema,
};
