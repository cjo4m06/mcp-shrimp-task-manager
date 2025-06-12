/**
 * 任务记忆管理器
 * 负责任务执行上下文的保存、检索和管理
 * 支持任务间的知识传递和上下文保持
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  TaskExecutionContext,
  TaskKnowledge,
  TaskCheckpoint,
  TaskDecision,
  TaskDiscovery,
  TaskAdjustment,
  TaskExecutionStep,
  TaskOutput,
  TaskError,
} from '../types/taskMemory.js';
import { getProjectContext } from '../utils/projectDetector.js';

// 辅助函数：将项目类型对象转换为字符串
function getProjectTypeString(projectType: any): string {
  if (projectType.hasPackageJson) return 'nodejs';
  if (projectType.hasPyprojectToml) return 'python';
  if (projectType.hasCargoToml) return 'rust';
  if (projectType.hasGoMod) return 'go';
  if (projectType.hasGit) return 'git-project';
  return 'unknown';
}

export class TaskMemoryManager {
  private memoryDir: string;
  private contextCache: Map<string, TaskExecutionContext> = new Map();
  private knowledgeBase: Map<string, TaskKnowledge> = new Map();

  constructor(dataDir?: string) {
    this.memoryDir = dataDir ? join(dataDir, 'memory') : join(process.cwd(), 'data', 'memory');
    this.ensureMemoryDirectory();
    this.loadExistingMemory();
  }

  /**
   * 确保内存目录存在
   */
  private ensureMemoryDirectory(): void {
    try {
      if (!existsSync(this.memoryDir)) {
        mkdirSync(this.memoryDir, { recursive: true });
      }

      // 创建子目录
      const subDirs = ['contexts', 'knowledge', 'checkpoints', 'decisions', 'discoveries'];
      subDirs.forEach((dir) => {
        const dirPath = join(this.memoryDir, dir);
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true });
        }
      });
    } catch (error) {
      console.warn('Failed to create memory directories:', error);
      // 优雅地处理文件系统错误，不抛出异常
      // 这允许 TaskMemoryManager 在只读环境中仍能实例化
    }
  }

  /**
   * 加载现有的记忆数据
   */
  private loadExistingMemory(): void {
    try {
      // 加载知识库
      const knowledgeFile = join(this.memoryDir, 'knowledge', 'knowledge-base.json');
      if (existsSync(knowledgeFile)) {
        const knowledgeData = JSON.parse(readFileSync(knowledgeFile, 'utf-8'));
        Object.entries(knowledgeData).forEach(([id, knowledge]) => {
          this.knowledgeBase.set(id, knowledge as TaskKnowledge);
        });
      }
    } catch (error) {
      console.warn('Failed to load existing memory:', error);
    }
  }

  /**
   * 开始任务执行上下文记录
   */
  async startTaskExecution(taskId: string): Promise<string> {
    const executionId = uuidv4();
    const projectContext = await getProjectContext();

    const context: TaskExecutionContext = {
      taskId,
      executionId,
      startTime: new Date(),
      status: 'running',
      steps: [],
      decisions: [],
      discoveries: [],
      environment: {
        projectContext: {
          projectName: projectContext.projectName,
          projectType: getProjectTypeString(projectContext.projectType),
          techStack: [], // 可以从项目检测中获取
          currentPhase: 'development',
          teamMembers: [],
        },
        systemInfo: {
          platform: process.platform,
          nodeVersion: process.version,
          availableMemory: process.memoryUsage().heapTotal,
          diskSpace: 0, // 可以通过系统调用获取
          networkStatus: 'online',
        },
        toolsAvailable: [],
        constraints: [],
      },
      resources: [],
      artifacts: [],
      knowledgeGenerated: [],
      knowledgeConsumed: [],
      checkpoints: [],
    };

    this.contextCache.set(executionId, context);
    await this.saveContext(context);

    return executionId;
  }

  /**
   * 结束任务执行
   */
  async endTaskExecution(executionId: string, status: 'completed' | 'failed', summary?: string): Promise<void> {
    const context = this.contextCache.get(executionId);
    if (!context) {
      throw new Error(`Execution context not found: ${executionId}`);
    }

    context.endTime = new Date();
    context.status = status;

    // 提取并保存知识
    await this.extractAndSaveKnowledge(context);

    // 保存最终上下文
    await this.saveContext(context);

    // 从缓存中移除
    this.contextCache.delete(executionId);
  }

  /**
   * 记录任务决策
   */
  async recordDecision(
    executionId: string,
    context: string,
    options: any[],
    chosen: string,
    reasoning: string
  ): Promise<string> {
    const executionContext = this.contextCache.get(executionId);
    if (!executionContext) {
      throw new Error(`Execution context not found: ${executionId}`);
    }

    const decision: TaskDecision = {
      decisionId: uuidv4(),
      timestamp: new Date(),
      context,
      options,
      chosen,
      reasoning,
      impact: {
        affectedTasks: [],
        timeImpact: 0,
        resourceImpact: [],
        qualityImpact: 'neutral',
        futureConsiderations: [],
      },
    };

    executionContext.decisions.push(decision);
    await this.saveDecision(decision);
    await this.saveContext(executionContext);

    return decision.decisionId;
  }

  /**
   * 记录任务发现
   */
  async recordDiscovery(
    executionId: string,
    type: 'insight' | 'problem' | 'opportunity' | 'risk' | 'solution',
    title: string,
    description: string
  ): Promise<string> {
    const executionContext = this.contextCache.get(executionId);
    if (!executionContext) {
      throw new Error(`Execution context not found: ${executionId}`);
    }

    const discovery: TaskDiscovery = {
      discoveryId: uuidv4(),
      timestamp: new Date(),
      type,
      title,
      description,
      relevance: {
        currentTask: 'medium',
        futureTask: [],
        projectLevel: 'minor',
        knowledgeValue: 'medium',
      },
      actionable: true,
      suggestedActions: [],
    };

    executionContext.discoveries.push(discovery);
    await this.saveDiscovery(discovery);
    await this.saveContext(executionContext);

    return discovery.discoveryId;
  }

  /**
   * 创建检查点
   */
  async createCheckpoint(executionId: string, description: string, resumeInstructions: string): Promise<string> {
    const executionContext = this.contextCache.get(executionId);
    if (!executionContext) {
      throw new Error(`Execution context not found: ${executionId}`);
    }

    const checkpoint: TaskCheckpoint = {
      checkpointId: uuidv4(),
      timestamp: new Date(),
      description,
      state: {
        currentStep: '',
        completedSteps: [],
        pendingSteps: [],
        variables: {},
        resources: executionContext.resources,
        artifacts: executionContext.artifacts,
      },
      resumeInstructions,
      metadata: {},
    };

    executionContext.checkpoints.push(checkpoint);
    await this.saveCheckpoint(checkpoint);
    await this.saveContext(executionContext);

    return checkpoint.checkpointId;
  }

  /**
   * 获取任务相关知识
   */
  async getRelevantKnowledge(taskType: string, projectType: string, technologies: string[]): Promise<TaskKnowledge[]> {
    const relevantKnowledge: TaskKnowledge[] = [];

    for (const knowledge of this.knowledgeBase.values()) {
      // 检查适用性
      const isApplicable =
        knowledge.applicability.taskTypes.includes(taskType) ||
        knowledge.applicability.projectTypes.includes(projectType) ||
        technologies.some((tech) => knowledge.context.technology.includes(tech));

      if (isApplicable && knowledge.confidence > 0.5) {
        relevantKnowledge.push(knowledge);
      }
    }

    // 按置信度和相关性排序
    return relevantKnowledge.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 获取任务执行历史
   */
  async getTaskExecutionHistory(taskId: string): Promise<TaskExecutionContext[]> {
    const historyFile = join(this.memoryDir, 'contexts', `task-${taskId}-history.json`);

    if (!existsSync(historyFile)) {
      return [];
    }

    try {
      const historyData = JSON.parse(readFileSync(historyFile, 'utf-8'));
      return historyData.executions || [];
    } catch (error) {
      console.warn(`Failed to load task history for ${taskId}:`, error);
      return [];
    }
  }

  /**
   * 分析任务模式
   */
  async analyzeTaskPatterns(taskType: string): Promise<{
    commonPatterns: string[];
    frequentIssues: string[];
    bestPractices: string[];
    recommendations: string[];
  }> {
    const relevantKnowledge = await this.getRelevantKnowledge(taskType, '', []);

    const patterns = new Map<string, number>();
    const issues = new Map<string, number>();
    const practices = new Map<string, number>();

    relevantKnowledge.forEach((knowledge) => {
      switch (knowledge.type) {
        case 'pattern':
          patterns.set(knowledge.title, (patterns.get(knowledge.title) || 0) + 1);
          break;
        case 'pitfall':
          issues.set(knowledge.title, (issues.get(knowledge.title) || 0) + 1);
          break;
        case 'best-practice':
          practices.set(knowledge.title, (practices.get(knowledge.title) || 0) + 1);
          break;
      }
    });

    return {
      commonPatterns: Array.from(patterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pattern]) => pattern),
      frequentIssues: Array.from(issues.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([issue]) => issue),
      bestPractices: Array.from(practices.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([practice]) => practice),
      recommendations: this.generateRecommendations(patterns, issues, practices),
    };
  }

  /**
   * 保存执行上下文
   */
  private async saveContext(context: TaskExecutionContext): Promise<void> {
    const contextFile = join(this.memoryDir, 'contexts', `${context.executionId}.json`);
    writeFileSync(contextFile, JSON.stringify(context, null, 2));
  }

  /**
   * 保存决策记录
   */
  private async saveDecision(decision: TaskDecision): Promise<void> {
    const decisionFile = join(this.memoryDir, 'decisions', `${decision.decisionId}.json`);
    writeFileSync(decisionFile, JSON.stringify(decision, null, 2));
  }

  /**
   * 保存发现记录
   */
  private async saveDiscovery(discovery: TaskDiscovery): Promise<void> {
    const discoveryFile = join(this.memoryDir, 'discoveries', `${discovery.discoveryId}.json`);
    writeFileSync(discoveryFile, JSON.stringify(discovery, null, 2));
  }

  /**
   * 保存检查点
   */
  private async saveCheckpoint(checkpoint: TaskCheckpoint): Promise<void> {
    const checkpointFile = join(this.memoryDir, 'checkpoints', `${checkpoint.checkpointId}.json`);
    writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));
  }

  /**
   * 提取并保存知识
   */
  private async extractAndSaveKnowledge(context: TaskExecutionContext): Promise<void> {
    // 从执行上下文中提取知识
    context.knowledgeGenerated.forEach((knowledge) => {
      this.knowledgeBase.set(knowledge.knowledgeId, knowledge);
    });

    // 保存知识库
    const knowledgeFile = join(this.memoryDir, 'knowledge', 'knowledge-base.json');
    const knowledgeData = Object.fromEntries(this.knowledgeBase.entries());
    writeFileSync(knowledgeFile, JSON.stringify(knowledgeData, null, 2));
  }

  /**
   * 生成建议
   */
  private generateRecommendations(
    patterns: Map<string, number>,
    issues: Map<string, number>,
    practices: Map<string, number>
  ): string[] {
    const recommendations: string[] = [];

    // 基于常见问题生成建议
    if (issues.size > 0) {
      recommendations.push(`注意避免常见问题：${Array.from(issues.keys()).slice(0, 3).join('、')}`);
    }

    // 基于最佳实践生成建议
    if (practices.size > 0) {
      recommendations.push(`建议采用最佳实践：${Array.from(practices.keys()).slice(0, 3).join('、')}`);
    }

    // 基于模式生成建议
    if (patterns.size > 0) {
      recommendations.push(`可以参考常见模式：${Array.from(patterns.keys()).slice(0, 3).join('、')}`);
    }

    return recommendations;
  }

  /**
   * 获取执行上下文
   */
  async getExecutionContext(executionId: string): Promise<TaskExecutionContext | null> {
    return this.contextCache.get(executionId) || null;
  }

  /**
   * 记录执行步骤
   */
  async recordStep(
    executionId: string,
    step: {
      stepId: string;
      action: string;
      description: string;
      timestamp: Date;
      status: 'completed' | 'failed' | 'skipped';
      output?: string;
      duration?: number;
      resources?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const executionContext = this.contextCache.get(executionId);
    if (!executionContext) {
      throw new Error(`Execution context not found: ${executionId}`);
    }

    // 转换为完整的 TaskExecutionStep
    const fullStep: TaskExecutionStep = {
      stepId: step.stepId,
      name: step.action,
      description: step.description,
      startTime: step.timestamp,
      endTime: step.status === 'completed' ? step.timestamp : undefined,
      status: step.status === 'completed' ? 'completed' : step.status === 'failed' ? 'failed' : 'skipped',
      actions: [],
      outputs: step.output
        ? [
            {
              outputId: `output-${step.stepId}`,
              type: 'data',
              name: step.action,
              content: step.output,
              format: 'text',
              size: step.output.length,
              timestamp: step.timestamp,
              metadata: step.metadata || {},
            },
          ]
        : [],
      errors:
        step.status === 'failed'
          ? [
              {
                errorId: `error-${step.stepId}`,
                type: 'logic',
                severity: 'major',
                message: 'Step execution failed',
                context: step.description,
                timestamp: step.timestamp,
              },
            ]
          : [],
      metadata: step.metadata || {},
      notes: step.description,
    };

    executionContext.steps.push(fullStep);
    await this.saveContext(executionContext);
  }

  /**
   * 完成任务执行
   */
  async completeTaskExecution(
    executionId: string,
    status: 'success' | 'failure' | 'cancelled',
    summary?: string
  ): Promise<void> {
    const executionContext = this.contextCache.get(executionId);
    if (!executionContext) {
      throw new Error(`Execution context not found: ${executionId}`);
    }

    executionContext.status = 'completed';
    executionContext.endTime = new Date();

    if (summary) {
      executionContext.summary = summary;
    }

    await this.saveContext(executionContext);
  }

  /**
   * 记录知识
   */
  async recordKnowledge(knowledge: TaskKnowledge): Promise<void> {
    this.knowledgeBase.set(knowledge.knowledgeId, knowledge);
    await this.saveKnowledgeBase();
  }

  /**
   * 保存知识库
   */
  private async saveKnowledgeBase(): Promise<void> {
    const knowledgeFile = join(this.memoryDir, 'knowledge', 'knowledge-base.json');
    const knowledgeData = Object.fromEntries(this.knowledgeBase.entries());
    writeFileSync(knowledgeFile, JSON.stringify(knowledgeData, null, 2));
  }

  /**
   * 保存执行上下文（公共方法）
   */
  async saveExecutionContext(context: TaskExecutionContext): Promise<void> {
    await this.saveContext(context);
  }
}
