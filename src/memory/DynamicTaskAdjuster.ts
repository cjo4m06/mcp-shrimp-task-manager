/**
 * 动态任务调整器
 * 负责基于任务执行上下文和新需求动态调整任务计划
 * 支持智能任务插入、优先级调整和依赖关系重新计算
 */

import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStatus, TaskDependency } from '../types/index.js';
import { TaskExecutionContext, TaskAdjustment, TaskKnowledge, ContextChange } from '../types/taskMemory.js';
import { TaskMemoryManager } from './TaskMemoryManager.js';
import { getAllTasks as loadTasks, batchCreateOrUpdateTasks } from '../models/taskModel.js';

export interface TaskInsertionRequest {
  title: string; // 新任务标题
  description: string; // 新任务描述
  priority?: number; // 优先级 (1-10)
  insertAfter?: string; // 在哪个任务之后插入
  insertBefore?: string; // 在哪个任务之前插入
  relatedTasks?: string[]; // 相关任务ID
  urgency?: 'low' | 'medium' | 'high' | 'critical'; // 紧急程度
  context?: string; // 插入上下文说明
}

export interface TaskAdjustmentSuggestion {
  taskId: string; // 需要调整的任务ID
  adjustmentType: 'scope' | 'approach' | 'timeline' | 'dependencies' | 'priority'; // 调整类型
  currentValue: any; // 当前值
  suggestedValue: any; // 建议值
  reasoning: string; // 调整理由
  confidence: number; // 置信度 (0-1)
  impact: {
    timeChange: number; // 时间变化（小时）
    riskChange: 'increased' | 'decreased' | 'unchanged'; // 风险变化
    affectedTasks: string[]; // 影响的其他任务
  };
}

export interface DynamicAdjustmentResult {
  success: boolean;
  insertedTask?: Task;
  adjustedTasks: Task[];
  suggestions: TaskAdjustmentSuggestion[];
  warnings: string[];
  summary: string;
}

export class DynamicTaskAdjuster {
  private memoryManager: TaskMemoryManager;

  constructor(memoryManager: TaskMemoryManager) {
    this.memoryManager = memoryManager;
  }

  /**
   * 智能插入新任务
   */
  async insertTaskIntelligently(request: TaskInsertionRequest): Promise<DynamicAdjustmentResult> {
    try {
      const tasks = await loadTasks();
      const activeTasks = tasks.filter((t) => t.status !== TaskStatus.COMPLETED);

      // 分析插入位置
      const insertionAnalysis = await this.analyzeInsertionPosition(request, activeTasks);

      // 创建新任务
      const newTask = await this.createNewTask(request, insertionAnalysis);

      // 调整现有任务
      const adjustmentResult = await this.adjustExistingTasks(newTask, activeTasks, insertionAnalysis);

      // 重新计算依赖关系
      const dependencyResult = await this.recalculateDependencies(
        [newTask, ...adjustmentResult.adjustedTasks],
        activeTasks
      );

      // 保存调整后的任务
      const allTasks = [...tasks.filter((t) => t.status === TaskStatus.COMPLETED), ...dependencyResult.tasks];

      await batchCreateOrUpdateTasks(this.convertTasksForStorage(allTasks), 'overwrite');

      // 生成调整建议
      const suggestions = await this.generateAdjustmentSuggestions(newTask, dependencyResult.tasks, insertionAnalysis);

      return {
        success: true,
        insertedTask: newTask,
        adjustedTasks: adjustmentResult.adjustedTasks,
        suggestions,
        warnings: [...adjustmentResult.warnings, ...dependencyResult.warnings],
        summary: this.generateAdjustmentSummary(newTask, adjustmentResult, suggestions),
      };
    } catch (error) {
      return {
        success: false,
        adjustedTasks: [],
        suggestions: [],
        warnings: [`Failed to insert task: ${error instanceof Error ? error.message : String(error)}`],
        summary: 'Task insertion failed due to an error.',
      };
    }
  }

  /**
   * 基于执行上下文调整后续任务
   */
  async adjustTasksBasedOnContext(executionContext: TaskExecutionContext): Promise<DynamicAdjustmentResult> {
    try {
      const tasks = await loadTasks();
      const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING);

      // 分析执行上下文中的发现和决策
      const contextAnalysis = this.analyzeExecutionContext(executionContext);

      // 生成调整建议
      const suggestions = await this.generateContextBasedSuggestions(pendingTasks, contextAnalysis);

      // 应用自动调整
      const adjustedTasks = await this.applyAutomaticAdjustments(pendingTasks, suggestions);

      // 保存调整后的任务
      const allTasks = [...tasks.filter((t) => t.status !== TaskStatus.PENDING), ...adjustedTasks];

      await batchCreateOrUpdateTasks(this.convertTasksForStorage(allTasks), 'overwrite');

      return {
        success: true,
        adjustedTasks,
        suggestions,
        warnings: [],
        summary: this.generateContextAdjustmentSummary(contextAnalysis, suggestions),
      };
    } catch (error) {
      return {
        success: false,
        adjustedTasks: [],
        suggestions: [],
        warnings: [`Failed to adjust tasks: ${error instanceof Error ? error.message : String(error)}`],
        summary: 'Task adjustment failed due to an error.',
      };
    }
  }

  /**
   * 分析插入位置
   */
  private async analyzeInsertionPosition(
    request: TaskInsertionRequest,
    activeTasks: Task[]
  ): Promise<{
    optimalPosition: number;
    reasoning: string;
    affectedTasks: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    let optimalPosition = activeTasks.length; // 默认插入到末尾
    let reasoning = '默认插入到任务列表末尾';
    const affectedTasks: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    // 如果指定了插入位置
    if (request.insertAfter) {
      const afterIndex = activeTasks.findIndex((t) => t.id === request.insertAfter);
      if (afterIndex !== -1) {
        optimalPosition = afterIndex + 1;
        reasoning = `插入到任务 "${activeTasks[afterIndex].name}" 之后`;
        affectedTasks.push(...activeTasks.slice(afterIndex + 1).map((t) => t.id));
      }
    } else if (request.insertBefore) {
      const beforeIndex = activeTasks.findIndex((t) => t.id === request.insertBefore);
      if (beforeIndex !== -1) {
        optimalPosition = beforeIndex;
        reasoning = `插入到任务 "${activeTasks[beforeIndex].name}" 之前`;
        affectedTasks.push(...activeTasks.slice(beforeIndex).map((t) => t.id));
        riskLevel = 'medium'; // 插入到中间风险较高
      }
    } else {
      // 基于优先级和紧急程度智能选择位置
      const urgencyWeight = this.getUrgencyWeight(request.urgency || 'medium');
      const priorityWeight = request.priority || 5;

      // 找到合适的插入位置
      for (let i = 0; i < activeTasks.length; i++) {
        const taskUrgency = this.estimateTaskUrgency(activeTasks[i]);
        const taskPriority = this.estimateTaskPriority(activeTasks[i]);

        if (urgencyWeight > taskUrgency || (urgencyWeight === taskUrgency && priorityWeight > taskPriority)) {
          optimalPosition = i;
          reasoning = `基于优先级和紧急程度，插入到任务 "${activeTasks[i].name}" 之前`;
          affectedTasks.push(...activeTasks.slice(i).map((t) => t.id));
          riskLevel = i < activeTasks.length / 2 ? 'high' : 'medium';
          break;
        }
      }
    }

    return {
      optimalPosition,
      reasoning,
      affectedTasks,
      riskLevel,
    };
  }

  /**
   * 创建新任务
   */
  private async createNewTask(request: TaskInsertionRequest, insertionAnalysis: any): Promise<Task> {
    const now = new Date();

    return {
      id: uuidv4(),
      name: request.title,
      description: request.description,
      notes: request.context,
      status: TaskStatus.PENDING,
      dependencies: [], // 稍后计算
      createdAt: now,
      updatedAt: now,
      relatedFiles: [],
    };
  }

  /**
   * 调整现有任务
   */
  private async adjustExistingTasks(
    newTask: Task,
    activeTasks: Task[],
    insertionAnalysis: any
  ): Promise<{
    adjustedTasks: Task[];
    warnings: string[];
  }> {
    const adjustedTasks: Task[] = [];
    const warnings: string[] = [];

    // 调整受影响任务的优先级和时间线
    for (const taskId of insertionAnalysis.affectedTasks) {
      const task = activeTasks.find((t) => t.id === taskId);
      if (task) {
        const adjustedTask = { ...task };

        // 根据新任务的插入调整现有任务
        if (this.shouldAdjustTaskPriority(newTask, task)) {
          adjustedTask.notes =
            (adjustedTask.notes || '') + `\n[自动调整] 由于新任务 "${newTask.name}" 的插入，优先级可能需要重新评估。`;
          adjustedTask.updatedAt = new Date();
        }

        adjustedTasks.push(adjustedTask);
      }
    }

    // 添加未受影响的任务
    activeTasks.forEach((task) => {
      if (!insertionAnalysis.affectedTasks.includes(task.id)) {
        adjustedTasks.push(task);
      }
    });

    return { adjustedTasks, warnings };
  }

  /**
   * 重新计算依赖关系
   */
  private async recalculateDependencies(
    newTasks: Task[],
    allTasks: Task[]
  ): Promise<{
    tasks: Task[];
    warnings: string[];
  }> {
    const warnings: string[] = [];
    const tasks = [...newTasks];

    // 检测并解决循环依赖
    const circularDeps = this.detectCircularDependencies(tasks);
    if (circularDeps.length > 0) {
      warnings.push(`检测到循环依赖: ${circularDeps.join(' -> ')}`);
      // 自动解决循环依赖
      this.resolveCircularDependencies(tasks, circularDeps);
    }

    return { tasks, warnings };
  }

  /**
   * 生成调整建议
   */
  private async generateAdjustmentSuggestions(
    newTask: Task,
    adjustedTasks: Task[],
    insertionAnalysis: any
  ): Promise<TaskAdjustmentSuggestion[]> {
    const suggestions: TaskAdjustmentSuggestion[] = [];

    // 基于相关知识生成建议
    const relevantKnowledge = await this.memoryManager.getRelevantKnowledge('task-insertion', 'general', []);

    // 为受影响的任务生成调整建议
    for (const taskId of insertionAnalysis.affectedTasks) {
      const task = adjustedTasks.find((t) => t.id === taskId);
      if (task) {
        suggestions.push({
          taskId: task.id,
          adjustmentType: 'timeline',
          currentValue: '原计划时间',
          suggestedValue: '建议延后执行',
          reasoning: `由于新任务 "${newTask.name}" 的插入，建议重新评估执行时间`,
          confidence: 0.7,
          impact: {
            timeChange: 2, // 预估延后2小时
            riskChange: 'increased',
            affectedTasks: [],
          },
        });
      }
    }

    return suggestions;
  }

  /**
   * 分析执行上下文
   */
  private analyzeExecutionContext(context: TaskExecutionContext): {
    keyFindings: string[];
    impactfulDecisions: string[];
    riskFactors: string[];
    opportunities: string[];
  } {
    const keyFindings = context.discoveries.filter((d) => d.relevance.currentTask === 'high').map((d) => d.title);

    const impactfulDecisions = context.decisions.filter((d) => d.impact.affectedTasks.length > 0).map((d) => d.context);

    const riskFactors = context.discoveries.filter((d) => d.type === 'risk').map((d) => d.description);

    const opportunities = context.discoveries.filter((d) => d.type === 'opportunity').map((d) => d.description);

    return {
      keyFindings,
      impactfulDecisions,
      riskFactors,
      opportunities,
    };
  }

  /**
   * 生成基于上下文的建议
   */
  private async generateContextBasedSuggestions(
    pendingTasks: Task[],
    contextAnalysis: any
  ): Promise<TaskAdjustmentSuggestion[]> {
    const suggestions: TaskAdjustmentSuggestion[] = [];

    // 基于发现的风险因素生成建议
    if (contextAnalysis.riskFactors.length > 0) {
      pendingTasks.forEach((task) => {
        suggestions.push({
          taskId: task.id,
          adjustmentType: 'priority',
          currentValue: task.priority?.toString() || '2',
          suggestedValue: '3',
          reasoning: `基于发现的风险因素: ${contextAnalysis.riskFactors.join(', ')}`,
          confidence: 0.9,
          impact: {
            timeChange: 0,
            riskChange: 'decreased',
            affectedTasks: [],
          },
        });
      });
    }

    // 基于关键发现生成优先级调整建议
    if (contextAnalysis.keyFindings.length > 0) {
      pendingTasks.forEach((task) => {
        suggestions.push({
          taskId: task.id,
          adjustmentType: 'priority',
          currentValue: task.priority?.toString() || '2',
          suggestedValue: '3',
          reasoning: `基于关键发现: ${contextAnalysis.keyFindings.join(', ')}`,
          confidence: 0.85,
          impact: {
            timeChange: 0,
            riskChange: 'decreased',
            affectedTasks: [],
          },
        });
      });
    }

    return suggestions;
  }

  /**
   * 应用自动调整
   */
  private async applyAutomaticAdjustments(tasks: Task[], suggestions: TaskAdjustmentSuggestion[]): Promise<Task[]> {
    const adjustedTasks = [...tasks];

    // 只应用高置信度的自动调整
    const autoAdjustments = suggestions.filter((s) => s.confidence > 0.8);

    autoAdjustments.forEach((suggestion) => {
      const taskIndex = adjustedTasks.findIndex((t) => t.id === suggestion.taskId);
      if (taskIndex !== -1) {
        const task = adjustedTasks[taskIndex];

        // 添加调整说明到任务备注
        task.notes = (task.notes || '') + `\n[自动调整] ${suggestion.reasoning}`;
        task.updatedAt = new Date();
      }
    });

    return adjustedTasks;
  }

  // 辅助方法
  private getUrgencyWeight(urgency: string): number {
    const weights = { low: 1, medium: 2, high: 3, critical: 4 };
    return weights[urgency as keyof typeof weights] || 2;
  }

  private estimateTaskUrgency(task: Task): number {
    // 基于任务描述和备注估算紧急程度
    const urgentKeywords = ['urgent', 'critical', 'asap', '紧急', '关键'];
    const text = (task.description + ' ' + (task.notes || '')).toLowerCase();

    for (const keyword of urgentKeywords) {
      if (text.includes(keyword)) {
        return 3; // 高紧急程度
      }
    }

    return 2; // 默认中等紧急程度
  }

  private estimateTaskPriority(task: Task): number {
    // 基于任务依赖数量和描述长度估算优先级
    const dependencyWeight = task.dependencies.length * 2;
    const complexityWeight = task.description.length > 500 ? 2 : 1;

    return Math.min(dependencyWeight + complexityWeight, 10);
  }

  private shouldAdjustTaskPriority(newTask: Task, existingTask: Task): boolean {
    // 判断是否需要调整现有任务的优先级
    return (
      newTask.description.length > existingTask.description.length ||
      this.estimateTaskUrgency(newTask) > this.estimateTaskUrgency(existingTask)
    );
  }

  private detectCircularDependencies(tasks: Task[]): string[] {
    // 简化的循环依赖检测
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const task of tasks) {
      if (this.hasCycleDFS(task.id, tasks, visited, recursionStack, [])) {
        return Array.from(recursionStack);
      }
    }

    return [];
  }

  private hasCycleDFS(
    taskId: string,
    tasks: Task[],
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[]
  ): boolean {
    if (recursionStack.has(taskId)) {
      return true;
    }

    if (visited.has(taskId)) {
      return false;
    }

    visited.add(taskId);
    recursionStack.add(taskId);

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      for (const dep of task.dependencies) {
        if (this.hasCycleDFS(dep.taskId, tasks, visited, recursionStack, [...path, taskId])) {
          return true;
        }
      }
    }

    recursionStack.delete(taskId);
    return false;
  }

  private resolveCircularDependencies(tasks: Task[], circularDeps: string[]): void {
    // 简单的循环依赖解决：移除最后一个依赖
    if (circularDeps.length > 1) {
      const lastTaskId = circularDeps[circularDeps.length - 1];
      const firstTaskId = circularDeps[0];

      const lastTask = tasks.find((t) => t.id === lastTaskId);
      if (lastTask) {
        lastTask.dependencies = lastTask.dependencies.filter((dep) => dep.taskId !== firstTaskId);
      }
    }
  }

  private generateAdjustmentSummary(
    newTask: Task,
    adjustmentResult: any,
    suggestions: TaskAdjustmentSuggestion[]
  ): string {
    return (
      `成功插入新任务 "${newTask.name}"。` +
      `调整了 ${adjustmentResult.adjustedTasks.length} 个现有任务，` +
      `生成了 ${suggestions.length} 个优化建议。`
    );
  }

  private generateContextAdjustmentSummary(contextAnalysis: any, suggestions: TaskAdjustmentSuggestion[]): string {
    return (
      `基于执行上下文分析，发现 ${contextAnalysis.keyFindings.length} 个关键发现，` +
      `${contextAnalysis.riskFactors.length} 个风险因素，` +
      `生成了 ${suggestions.length} 个调整建议。`
    );
  }

  /**
   * 转换任务格式以适配存储接口
   */
  private convertTasksForStorage(tasks: Task[]): any[] {
    return tasks.map((task) => ({
      name: task.name,
      description: task.description,
      notes: task.notes,
      dependencies: task.dependencies.map((dep) => dep.taskId),
      relatedFiles: task.relatedFiles || [],
      implementationGuide: task.implementationGuide || '',
      verificationCriteria: task.verificationCriteria || '',
    }));
  }

  /**
   * 解决依赖冲突
   */
  resolveDependencyConflicts(tasks: Task[]): {
    hasConflicts: boolean;
    circularDependencies: string[][];
    tasks: Task[];
  } {
    const graph = new Map<string, string[]>();
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const circularDependencies: string[][] = [];

    // 构建依赖图
    tasks.forEach((task) => {
      graph.set(
        task.id,
        task.dependencies.map((dep) => dep.taskId)
      );
    });

    // 检测循环依赖
    const detectCycle = (taskId: string, path: string[]): boolean => {
      if (recursionStack.has(taskId)) {
        const cycleStart = path.indexOf(taskId);
        circularDependencies.push(path.slice(cycleStart));
        return true;
      }

      if (visited.has(taskId)) {
        return false;
      }

      visited.add(taskId);
      recursionStack.add(taskId);
      path.push(taskId);

      const dependencies = graph.get(taskId) || [];
      for (const dep of dependencies) {
        if (detectCycle(dep, [...path])) {
          return true;
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    // 检测所有任务的循环依赖
    tasks.forEach((task) => {
      if (!visited.has(task.id)) {
        detectCycle(task.id, []);
      }
    });

    // 移除循环依赖
    const resolvedTasks = tasks.map((task) => {
      const filteredDependencies = task.dependencies.filter((dep) => {
        return !circularDependencies.some((cycle) => cycle.includes(task.id) && cycle.includes(dep.taskId));
      });

      return {
        ...task,
        dependencies: filteredDependencies,
      };
    });

    return {
      hasConflicts: circularDependencies.length > 0,
      circularDependencies,
      tasks: resolvedTasks,
    };
  }

  /**
   * 找到最佳插入位置
   */
  findOptimalInsertionPosition(tasks: Task[], newTask: Task): number {
    // 如果没有任务，插入到开头
    if (tasks.length === 0) {
      return 0;
    }

    // 如果新任务没有优先级，插入到末尾
    if (!newTask.priority) {
      return tasks.length;
    }

    // 根据优先级找到合适的位置
    for (let i = 0; i < tasks.length; i++) {
      const currentTask = tasks[i];
      if (!currentTask.priority || newTask.priority > currentTask.priority) {
        return i;
      }
    }

    return tasks.length;
  }
}
