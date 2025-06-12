/**
 * 工具注册表
 * 自动发现和注册所有工具
 */

import { zodToJsonSchema } from 'zod-to-json-schema';
import { loadPromptFromTemplate } from '../prompts/loader.js';
import { log } from '../utils/logger.js';

// 导入所有工具
import {
  planTask,
  planTaskSchema,
  analyzeTask,
  analyzeTaskSchema,
  reflectTask,
  reflectTaskSchema,
  splitTasks,
  splitTasksSchema,
  splitTasksRaw,
  splitTasksRawSchema,
  listTasksSchema,
  listTasks,
  executeTask,
  executeTaskSchema,
  verifyTask,
  verifyTaskSchema,
  deleteTask,
  deleteTaskSchema,
  clearAllTasks,
  clearAllTasksSchema,
  updateTaskContent,
  updateTaskContentSchema,
  queryTask,
  queryTaskSchema,
  getTaskDetail,
  getTaskDetailSchema,
  processThought,
  processThoughtSchema,
  initProjectRules,
  initProjectRulesSchema,
  researchMode,
  researchModeSchema,
  getProjectContext,
  getProjectContextSchema,
  analyzeWorkingDirectory,
  analyzeWorkingDirectorySchema,
  setProjectWorkingDirectory,
  setProjectWorkingDirectorySchema,
  diagnoseMcpEnvironment,
  diagnoseMcpEnvironmentSchema,
  viewRealtimeLogs,
  viewRealtimeLogsSchema,
  resetProjectDetection,
  resetProjectDetectionSchema,
  showPathStatus,
  showPathStatusSchema,
  validateProjectIsolation,
  validateProjectIsolationSchema,
  getDocumentationPath,
  getDocumentationPathSchema,
  generateTeamCollaborationTasks,
  generateTeamCollaborationTasksTool,
  insertTaskDynamically,
  insertTaskDynamicallyTool,
  adjustTasksFromContext,
  adjustTasksFromContextTool,
  queryTaskMemory,
  queryTaskMemoryTool,
  shareTeamKnowledge,
  shareTeamKnowledgeTool,
  analyzeTeamCollaboration,
  analyzeTeamCollaborationTool,
  // 链式执行工具
  executeChainTool,
  executeChainSchema,
  executeChainToolDefinition,
  getChainStatusTool,
  getChainStatusSchema,
  getChainStatusToolDefinition,
  cancelChainTool,
  cancelChainSchema,
  cancelChainToolDefinition,
  retryChainStepTool,
  retryChainStepSchema,
  retryChainStepToolDefinition,
  // AI 管理工具
  manageAiProvidersTool,
  manageAiProvidersSchema,
  manageAiProvidersToolDefinition,
  switchAiModelTool,
  switchAiModelSchema,
  switchAiModelToolDefinition,
  getCurrentAiStatusTool,
  getCurrentAiStatusSchema,
  getCurrentAiStatusToolDefinition,
  // 智能指令处理工具
  processIntelligentCommandTool,
  processIntelligentCommandSchema,
  processIntelligentCommandToolDefinition,
} from '../tools/index.js';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  handler: Function;
  category?: string;
  version?: string;
  deprecated?: boolean;
}

export interface ToolExecutionContext {
  toolName: string;
  arguments: any;
  startTime: number;
}

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();
  private categories = new Set<string>();

  constructor() {
    // 初始化工具分类
    this.categories.add('task');
    this.categories.add('project');
    this.categories.add('memory');
    this.categories.add('thought');
    this.categories.add('research');
    this.categories.add('execution');
    this.categories.add('ai');
  }

  /**
   * 发现并注册所有工具
   */
  async discoverAndRegisterTools(): Promise<void> {
    log.info('ToolRegistry', '开始注册工具');

    // 注册任务管理工具
    this.registerTaskTools();

    // 注册项目管理工具
    this.registerProjectTools();

    // 注册内存管理工具
    this.registerMemoryTools();

    // 注册思维工具
    this.registerThoughtTools();

    // 注册研究工具
    this.registerResearchTools();

    // 注册链式执行工具
    this.registerExecutionTools();

    // 注册 AI 管理工具
    this.registerAiTools();

    log.info('ToolRegistry', '工具注册完成', {
      totalTools: this.tools.size,
      categories: Array.from(this.categories),
    });
  }

  /**
   * 注册任务管理工具
   */
  private registerTaskTools(): void {
    const taskTools = [
      {
        name: 'plan_task',
        handler: planTask,
        schema: planTaskSchema,
        descriptionFile: 'toolsDescription/planTask.md',
      },
      {
        name: 'analyze_task',
        handler: analyzeTask,
        schema: analyzeTaskSchema,
        descriptionFile: 'toolsDescription/analyzeTask.md',
      },
      {
        name: 'reflect_task',
        handler: reflectTask,
        schema: reflectTaskSchema,
        descriptionFile: 'toolsDescription/reflectTask.md',
      },
      {
        name: 'split_tasks',
        handler: splitTasksRaw,
        schema: splitTasksRawSchema,
        descriptionFile: 'toolsDescription/splitTasks.md',
      },
      {
        name: 'list_tasks',
        handler: listTasks,
        schema: listTasksSchema,
        descriptionFile: 'toolsDescription/listTasks.md',
      },
      {
        name: 'execute_task',
        handler: executeTask,
        schema: executeTaskSchema,
        descriptionFile: 'toolsDescription/executeTask.md',
      },
      {
        name: 'verify_task',
        handler: verifyTask,
        schema: verifyTaskSchema,
        descriptionFile: 'toolsDescription/verifyTask.md',
      },
      {
        name: 'delete_task',
        handler: deleteTask,
        schema: deleteTaskSchema,
        descriptionFile: 'toolsDescription/deleteTask.md',
      },
      {
        name: 'clear_all_tasks',
        handler: clearAllTasks,
        schema: clearAllTasksSchema,
        descriptionFile: 'toolsDescription/clearAllTasks.md',
      },
      {
        name: 'update_task',
        handler: updateTaskContent,
        schema: updateTaskContentSchema,
        descriptionFile: 'toolsDescription/updateTask.md',
      },
      {
        name: 'query_task',
        handler: queryTask,
        schema: queryTaskSchema,
        descriptionFile: 'toolsDescription/queryTask.md',
      },
      {
        name: 'get_task_detail',
        handler: getTaskDetail,
        schema: getTaskDetailSchema,
        descriptionFile: 'toolsDescription/getTaskDetail.md',
      },
    ];

    for (const tool of taskTools) {
      this.registerTool({
        name: tool.name,
        description: loadPromptFromTemplate(tool.descriptionFile),
        inputSchema: zodToJsonSchema(tool.schema),
        handler: tool.handler,
        category: 'task',
      });
    }
  }

  /**
   * 注册项目管理工具
   */
  private registerProjectTools(): void {
    const projectTools = [
      {
        name: 'get_project_context',
        handler: getProjectContext,
        schema: getProjectContextSchema,
        descriptionFile: 'toolsDescription/getProjectContext.md',
      },
      {
        name: 'analyze_working_directory',
        handler: analyzeWorkingDirectory,
        schema: analyzeWorkingDirectorySchema,
        descriptionFile: 'toolsDescription/analyzeWorkingDirectory.md',
      },
      {
        name: 'set_project_working_directory',
        handler: setProjectWorkingDirectory,
        schema: setProjectWorkingDirectorySchema,
        descriptionFile: 'toolsDescription/setProjectWorkingDirectory.md',
      },
      {
        name: 'diagnose_mcp_environment',
        handler: diagnoseMcpEnvironment,
        schema: diagnoseMcpEnvironmentSchema,
        descriptionFile: 'toolsDescription/diagnoseMcpEnvironment.md',
      },
      {
        name: 'view_realtime_logs',
        handler: viewRealtimeLogs,
        schema: viewRealtimeLogsSchema,
        descriptionFile: 'toolsDescription/viewRealtimeLogs.md',
      },
      {
        name: 'reset_project_detection',
        handler: resetProjectDetection,
        schema: resetProjectDetectionSchema,
        descriptionFile: 'toolsDescription/resetProjectDetection.md',
      },
      {
        name: 'show_path_status',
        handler: showPathStatus,
        schema: showPathStatusSchema,
        descriptionFile: 'toolsDescription/showPathStatus.md',
      },
      {
        name: 'validate_project_isolation',
        handler: validateProjectIsolation,
        schema: validateProjectIsolationSchema,
        descriptionFile: 'toolsDescription/validateProjectIsolation.md',
      },
      {
        name: 'get_documentation_path',
        handler: getDocumentationPath,
        schema: getDocumentationPathSchema,
        descriptionFile: 'toolsDescription/getDocumentationPath.md',
      },
    ];

    for (const tool of projectTools) {
      this.registerTool({
        name: tool.name,
        description: loadPromptFromTemplate(tool.descriptionFile),
        inputSchema: zodToJsonSchema(tool.schema),
        handler: tool.handler,
        category: 'project',
      });
    }
  }

  /**
   * 注册内存管理工具
   */
  private registerMemoryTools(): void {
    const memoryTools = [
      {
        name: 'generate_team_collaboration_tasks',
        handler: generateTeamCollaborationTasks,
        tool: generateTeamCollaborationTasksTool,
      },
      {
        name: 'insert_task_dynamically',
        handler: insertTaskDynamically,
        tool: insertTaskDynamicallyTool,
      },
      {
        name: 'adjust_tasks_from_context',
        handler: adjustTasksFromContext,
        tool: adjustTasksFromContextTool,
      },
      {
        name: 'query_task_memory',
        handler: queryTaskMemory,
        tool: queryTaskMemoryTool,
      },
      {
        name: 'share_team_knowledge',
        handler: shareTeamKnowledge,
        tool: shareTeamKnowledgeTool,
      },
      {
        name: 'analyze_team_collaboration',
        handler: analyzeTeamCollaboration,
        tool: analyzeTeamCollaborationTool,
      },
    ];

    for (const tool of memoryTools) {
      this.registerTool({
        name: tool.name,
        description: tool.tool.description,
        inputSchema: zodToJsonSchema(tool.tool.inputSchema),
        handler: tool.handler,
        category: 'memory',
      });
    }
  }

  /**
   * 注册思维工具
   */
  private registerThoughtTools(): void {
    this.registerTool({
      name: 'process_thought',
      description: loadPromptFromTemplate('toolsDescription/processThought.md'),
      inputSchema: zodToJsonSchema(processThoughtSchema),
      handler: processThought,
      category: 'thought',
    });
  }

  /**
   * 注册研究工具
   */
  private registerResearchTools(): void {
    const researchTools = [
      {
        name: 'init_project_rules',
        handler: initProjectRules,
        schema: initProjectRulesSchema,
        descriptionFile: 'toolsDescription/initProjectRules.md',
      },
      {
        name: 'research_mode',
        handler: researchMode,
        schema: researchModeSchema,
        descriptionFile: 'toolsDescription/researchMode.md',
      },
    ];

    for (const tool of researchTools) {
      this.registerTool({
        name: tool.name,
        description: loadPromptFromTemplate(tool.descriptionFile),
        inputSchema: zodToJsonSchema(tool.schema),
        handler: tool.handler,
        category: 'research',
      });
    }
  }

  /**
   * 注册链式执行工具
   */
  private registerExecutionTools(): void {
    const executionTools = [
      {
        name: 'execute_chain',
        handler: executeChainTool,
        schema: executeChainSchema,
        descriptionFile: 'toolsDescription/executeChain.md',
      },
      {
        name: 'get_chain_status',
        handler: getChainStatusTool,
        schema: getChainStatusSchema,
        descriptionFile: 'toolsDescription/getChainStatus.md',
      },
      {
        name: 'cancel_chain',
        handler: cancelChainTool,
        schema: cancelChainSchema,
        descriptionFile: 'toolsDescription/cancelChain.md',
      },
      {
        name: 'retry_chain_step',
        handler: retryChainStepTool,
        schema: retryChainStepSchema,
        descriptionFile: 'toolsDescription/retryChainStep.md',
      },
    ];

    for (const tool of executionTools) {
      this.registerTool({
        name: tool.name,
        description: loadPromptFromTemplate(tool.descriptionFile),
        inputSchema: zodToJsonSchema(tool.schema),
        handler: tool.handler,
        category: 'execution',
      });
    }
  }

  /**
   * 注册 AI 管理工具
   */
  private registerAiTools(): void {
    const aiTools = [
      {
        name: 'manage_ai_providers',
        handler: manageAiProvidersTool,
        schema: manageAiProvidersSchema,
        descriptionFile: 'toolsDescription/manageAiProviders.md',
      },
      {
        name: 'switch_ai_model',
        handler: switchAiModelTool,
        schema: switchAiModelSchema,
        descriptionFile: 'toolsDescription/switchAiModel.md',
      },
      {
        name: 'get_current_ai_status',
        handler: getCurrentAiStatusTool,
        schema: getCurrentAiStatusSchema,
        descriptionFile: 'toolsDescription/getCurrentAiStatus.md',
      },
      {
        name: 'process_intelligent_command',
        handler: processIntelligentCommandTool,
        schema: processIntelligentCommandSchema,
        descriptionFile: 'toolsDescription/processIntelligentCommand.md',
      },
    ];

    for (const tool of aiTools) {
      this.registerTool({
        name: tool.name,
        description: loadPromptFromTemplate(tool.descriptionFile),
        inputSchema: zodToJsonSchema(tool.schema),
        handler: tool.handler,
        category: 'ai',
      });
    }
  }

  /**
   * 注册单个工具
   */
  private registerTool(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
    if (tool.category) {
      this.categories.add(tool.category);
    }
  }

  /**
   * 获取所有工具定义
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * 获取工具定义
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * 获取工具数量
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * 按分类获取工具
   */
  getToolsByCategory(category: string): ToolDefinition[] {
    return Array.from(this.tools.values()).filter((tool) => tool.category === category);
  }

  /**
   * 获取所有分类
   */
  getCategories(): string[] {
    return Array.from(this.categories);
  }

  /**
   * 检查工具是否存在
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }
}
