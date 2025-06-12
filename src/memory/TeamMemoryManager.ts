/**
 * 团队记忆管理器
 * 专为团队协作设计的记忆系统，支持知识共享、经验传递和协作模式学习
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TaskKnowledge, TaskDecision, TaskDiscovery, CollaborationPattern } from '../types/taskMemory.js';
import { TeamRole } from '../prd/types.js';

// 团队知识条目
export interface TeamKnowledgeEntry {
  id: string;
  knowledge: TaskKnowledge;
  contributor: TeamMember;
  sharedAt: Date;
  usageCount: number;
  ratings: KnowledgeRating[];
  tags: string[];
  visibility: 'public' | 'team' | 'role-specific';
  applicableRoles: TeamRole[];
}

// 团队成员信息
export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  email?: string;
  expertise: string[];
  joinedAt: Date;
  contributionScore: number;
}

// 知识评分
export interface KnowledgeRating {
  raterId: string;
  rating: number; // 1-5
  comment?: string;
  ratedAt: Date;
}

// 协作模式
export interface TeamCollaborationPattern {
  id: string;
  name: string;
  description: string;
  involvedRoles: TeamRole[];
  pattern: CollaborationPattern;
  successRate: number;
  usageCount: number;
  lastUsed: Date;
  improvements: string[];
}

// 团队学习记录
export interface TeamLearningRecord {
  id: string;
  projectId: string;
  teamId: string;
  learningType: 'success' | 'failure' | 'improvement' | 'pattern';
  title: string;
  description: string;
  context: {
    roles: TeamRole[];
    technologies: string[];
    projectPhase: string;
    complexity: 'low' | 'medium' | 'high';
  };
  lessons: string[];
  recommendations: string[];
  createdBy: string;
  createdAt: Date;
  verified: boolean;
  verifiedBy?: string[];
}

export class TeamMemoryManager {
  private teamMemoryDir: string;
  private teamKnowledge: Map<string, TeamKnowledgeEntry> = new Map();
  private teamMembers: Map<string, TeamMember> = new Map();
  private collaborationPatterns: Map<string, TeamCollaborationPattern> = new Map();
  private learningRecords: Map<string, TeamLearningRecord> = new Map();

  constructor(dataDir: string, teamId?: string) {
    this.teamMemoryDir = join(dataDir, 'team-memory', teamId || 'default');
    this.ensureTeamMemoryDirectory();
    this.loadTeamMemory();
  }

  /**
   * 确保团队记忆目录存在
   */
  private ensureTeamMemoryDirectory(): void {
    try {
      if (!existsSync(this.teamMemoryDir)) {
        mkdirSync(this.teamMemoryDir, { recursive: true });
      }

      const subDirs = ['knowledge', 'patterns', 'learning', 'members', 'shared'];
      subDirs.forEach((dir) => {
        const dirPath = join(this.teamMemoryDir, dir);
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true });
        }
      });
    } catch (error) {
      console.warn('Failed to create team memory directories:', error);
      // 优雅地处理文件系统错误，不抛出异常
      // 这允许 TeamMemoryManager 在只读环境中仍能实例化
    }
  }

  /**
   * 加载团队记忆数据
   */
  private loadTeamMemory(): void {
    try {
      // 加载团队知识
      const knowledgeFile = join(this.teamMemoryDir, 'knowledge', 'team-knowledge.json');
      if (existsSync(knowledgeFile)) {
        const knowledgeData = JSON.parse(readFileSync(knowledgeFile, 'utf-8'));
        Object.entries(knowledgeData).forEach(([id, entry]) => {
          this.teamKnowledge.set(id, entry as TeamKnowledgeEntry);
        });
      }

      // 加载团队成员
      const membersFile = join(this.teamMemoryDir, 'members', 'team-members.json');
      if (existsSync(membersFile)) {
        const membersData = JSON.parse(readFileSync(membersFile, 'utf-8'));
        Object.entries(membersData).forEach(([id, member]) => {
          this.teamMembers.set(id, member as TeamMember);
        });
      }

      // 加载协作模式
      const patternsFile = join(this.teamMemoryDir, 'patterns', 'collaboration-patterns.json');
      if (existsSync(patternsFile)) {
        const patternsData = JSON.parse(readFileSync(patternsFile, 'utf-8'));
        Object.entries(patternsData).forEach(([id, pattern]) => {
          this.collaborationPatterns.set(id, pattern as TeamCollaborationPattern);
        });
      }

      // 加载学习记录
      const learningFile = join(this.teamMemoryDir, 'learning', 'team-learning.json');
      if (existsSync(learningFile)) {
        const learningData = JSON.parse(readFileSync(learningFile, 'utf-8'));
        Object.entries(learningData).forEach(([id, record]) => {
          this.learningRecords.set(id, record as TeamLearningRecord);
        });
      }
    } catch (error) {
      console.warn('Failed to load team memory:', error);
    }
  }

  /**
   * 分享知识到团队
   */
  async shareKnowledge(
    knowledge: TaskKnowledge,
    contributor: TeamMember,
    visibility: 'public' | 'team' | 'role-specific' = 'team',
    applicableRoles?: TeamRole[]
  ): Promise<string> {
    const entry: TeamKnowledgeEntry = {
      id: uuidv4(),
      knowledge,
      contributor,
      sharedAt: new Date(),
      usageCount: 0,
      ratings: [],
      tags: knowledge.tags,
      visibility,
      applicableRoles: applicableRoles || [contributor.role],
    };

    this.teamKnowledge.set(entry.id, entry);
    await this.saveTeamKnowledge();

    // 更新贡献者的贡献分数
    contributor.contributionScore += 10;
    await this.saveTeamMembers();

    return entry.id;
  }

  /**
   * 获取团队相关知识
   */
  async getTeamKnowledge(
    requesterRole: TeamRole,
    context?: {
      technologies?: string[];
      projectType?: string;
      taskType?: string;
    }
  ): Promise<TeamKnowledgeEntry[]> {
    const relevantKnowledge: TeamKnowledgeEntry[] = [];

    for (const entry of this.teamKnowledge.values()) {
      // 检查可见性
      if (entry.visibility === 'role-specific' && !entry.applicableRoles.includes(requesterRole)) {
        continue;
      }

      // 检查相关性
      let relevanceScore = 0;

      // 角色相关性
      if (entry.applicableRoles.includes(requesterRole)) {
        relevanceScore += 3;
      }

      // 技术相关性
      if (context?.technologies) {
        const techMatches = context.technologies.filter((tech) =>
          entry.knowledge.context.technology.includes(tech)
        ).length;
        relevanceScore += techMatches * 2;
      }

      // 任务类型相关性
      if (context?.taskType && entry.knowledge.applicability.taskTypes.includes(context.taskType)) {
        relevanceScore += 2;
      }

      // 项目类型相关性
      if (context?.projectType && entry.knowledge.applicability.projectTypes.includes(context.projectType)) {
        relevanceScore += 1;
      }

      // 评分相关性
      const avgRating = this.calculateAverageRating(entry);
      relevanceScore += avgRating;

      if (relevanceScore > 2) {
        relevantKnowledge.push(entry);
      }
    }

    // 按相关性和评分排序
    return relevantKnowledge.sort((a, b) => {
      const scoreA = this.calculateAverageRating(a) + a.usageCount * 0.1;
      const scoreB = this.calculateAverageRating(b) + b.usageCount * 0.1;
      return scoreB - scoreA;
    });
  }

  /**
   * 记录协作模式
   */
  async recordCollaborationPattern(
    name: string,
    description: string,
    involvedRoles: TeamRole[],
    pattern: CollaborationPattern,
    success: boolean
  ): Promise<string> {
    const existingPattern = Array.from(this.collaborationPatterns.values()).find(
      (p) => p.name === name && JSON.stringify(p.involvedRoles.sort()) === JSON.stringify(involvedRoles.sort())
    );

    if (existingPattern) {
      // 更新现有模式
      existingPattern.usageCount++;
      existingPattern.lastUsed = new Date();

      if (success) {
        existingPattern.successRate =
          (existingPattern.successRate * (existingPattern.usageCount - 1) + 1) / existingPattern.usageCount;
      } else {
        existingPattern.successRate =
          (existingPattern.successRate * (existingPattern.usageCount - 1)) / existingPattern.usageCount;
      }

      await this.saveCollaborationPatterns();
      return existingPattern.id;
    } else {
      // 创建新模式
      const newPattern: TeamCollaborationPattern = {
        id: uuidv4(),
        name,
        description,
        involvedRoles,
        pattern,
        successRate: success ? 1 : 0,
        usageCount: 1,
        lastUsed: new Date(),
        improvements: [],
      };

      this.collaborationPatterns.set(newPattern.id, newPattern);
      await this.saveCollaborationPatterns();
      return newPattern.id;
    }
  }

  /**
   * 获取推荐的协作模式
   */
  async getRecommendedCollaborationPatterns(
    involvedRoles: TeamRole[],
    context?: string
  ): Promise<TeamCollaborationPattern[]> {
    const patterns: TeamCollaborationPattern[] = [];

    for (const pattern of this.collaborationPatterns.values()) {
      // 检查角色匹配
      const roleMatch = involvedRoles.every((role) => pattern.involvedRoles.includes(role));

      if (roleMatch && pattern.successRate > 0.6) {
        patterns.push(pattern);
      }
    }

    // 按成功率和使用频率排序
    return patterns.sort((a, b) => {
      const scoreA = a.successRate * 0.7 + (a.usageCount / 100) * 0.3;
      const scoreB = b.successRate * 0.7 + (b.usageCount / 100) * 0.3;
      return scoreB - scoreA;
    });
  }

  /**
   * 记录团队学习
   */
  async recordTeamLearning(
    projectId: string,
    teamId: string,
    learningType: 'success' | 'failure' | 'improvement' | 'pattern',
    title: string,
    description: string,
    context: any,
    lessons: string[],
    recommendations: string[],
    createdBy: string
  ): Promise<string> {
    const record: TeamLearningRecord = {
      id: uuidv4(),
      projectId,
      teamId,
      learningType,
      title,
      description,
      context,
      lessons,
      recommendations,
      createdBy,
      createdAt: new Date(),
      verified: false,
    };

    this.learningRecords.set(record.id, record);
    await this.saveLearningRecords();

    return record.id;
  }

  /**
   * 获取团队学习记录
   */
  async getTeamLearning(filters?: {
    learningType?: string;
    roles?: TeamRole[];
    technologies?: string[];
    verified?: boolean;
  }): Promise<TeamLearningRecord[]> {
    let records = Array.from(this.learningRecords.values());

    if (filters) {
      if (filters.learningType) {
        records = records.filter((r) => r.learningType === filters.learningType);
      }

      if (filters.roles) {
        records = records.filter((r) => filters.roles!.some((role) => r.context.roles.includes(role)));
      }

      if (filters.technologies) {
        records = records.filter((r) => filters.technologies!.some((tech) => r.context.technologies.includes(tech)));
      }

      if (filters.verified !== undefined) {
        records = records.filter((r) => r.verified === filters.verified);
      }
    }

    return records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * 评价知识
   */
  async rateKnowledge(knowledgeId: string, raterId: string, rating: number, comment?: string): Promise<void> {
    const entry = this.teamKnowledge.get(knowledgeId);
    if (!entry) {
      throw new Error(`Knowledge entry not found: ${knowledgeId}`);
    }

    // 移除之前的评分（如果存在）
    entry.ratings = entry.ratings.filter((r) => r.raterId !== raterId);

    // 添加新评分
    entry.ratings.push({
      raterId,
      rating,
      comment,
      ratedAt: new Date(),
    });

    await this.saveTeamKnowledge();
  }

  /**
   * 计算平均评分
   */
  private calculateAverageRating(entry: TeamKnowledgeEntry): number {
    if (entry.ratings.length === 0) {
      return entry.knowledge.confidence * 5; // 转换为1-5分制
    }

    const sum = entry.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / entry.ratings.length;
  }

  // 保存方法
  private async saveTeamKnowledge(): Promise<void> {
    const knowledgeFile = join(this.teamMemoryDir, 'knowledge', 'team-knowledge.json');
    const knowledgeData = Object.fromEntries(this.teamKnowledge.entries());
    writeFileSync(knowledgeFile, JSON.stringify(knowledgeData, null, 2));
  }

  private async saveTeamMembers(): Promise<void> {
    const membersFile = join(this.teamMemoryDir, 'members', 'team-members.json');
    const membersData = Object.fromEntries(this.teamMembers.entries());
    writeFileSync(membersFile, JSON.stringify(membersData, null, 2));
  }

  private async saveCollaborationPatterns(): Promise<void> {
    const patternsFile = join(this.teamMemoryDir, 'patterns', 'collaboration-patterns.json');
    const patternsData = Object.fromEntries(this.collaborationPatterns.entries());
    writeFileSync(patternsFile, JSON.stringify(patternsData, null, 2));
  }

  private async saveLearningRecords(): Promise<void> {
    const learningFile = join(this.teamMemoryDir, 'learning', 'team-learning.json');
    const learningData = Object.fromEntries(this.learningRecords.entries());
    writeFileSync(learningFile, JSON.stringify(learningData, null, 2));
  }
}
