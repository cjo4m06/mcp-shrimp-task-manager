/**
 * PRD 驱动的团队协作任务生成系统导出
 * 统一导出所有 PRD 相关的类型、类和函数
 */

// 导出类型定义
export type {
  TeamRole,
  RoleDefinition,
  PRDDocument,
  PRDMetadata,
  PRDContent,
  PRDAnalysis,
  UserStory,
  FunctionalRequirement,
  NonFunctionalRequirement,
  ProjectType,
  TechStack,
  ProjectComplexity,
  TeamComposition,
  Component,
  WorkflowPhase,
  RiskAssessment,
  DependencyGraph,
  DependencyNode,
  DependencyEdge,
  GeneratedTaskSet,
  TaskSetMetadata,
  RoleTask,
  CrossRoleTask,
  Milestone,
  TaskWorkflow,
  ParallelTrack,
  HandoffPoint,
  PRDParsingOptions,
  TaskGenerationOptions,
  RoleTaskTemplate,
  TaskTemplate,
  TemplateVariation,
  CollaborationPattern,
  MeetingType,
} from './types.js';

// 导出核心类
export { PRDParser } from './parser.js';
export { TeamCollaborativeTaskGenerator } from './generator.js';
export { RoleDefinitions } from './roles/RoleDefinitions.js';

// 导出工具函数
export {
  createPRDProcessor,
  generateTeamTasks,
  analyzePRDComplexity,
  recommendTeamComposition,
  formatTaskSummary,
  exportTasksToJSON,
  exportTasksToMarkdown,
  validateTaskDependencies,
} from './utils.js';
