/**
 * Prompt 管理系統索引文件
 * 匯出所有 prompt 生成器和載入工具
 */

// 匯出核心工具
export { loadPrompt, generatePrompt } from './loader.js';

// 匯出增强 Prompt 系统功能
export {
  loadPromptConfig,
  loadPromptByCategory,
  getAvailableCategories,
  getPromptsInCategory,
  loadChainPrompt,
} from './loader.js';

// 匯出链式 Prompt 相关类
export { MarkdownPromptParser } from './parsers/MarkdownPromptParser.js';
export { ChainPromptLoader } from './loaders/ChainPromptLoader.js';
export { ChainPromptGenerator } from './generators/chainPrompt.js';

// 匯出类型定义
export type { ParsedPromptContent } from './parsers/MarkdownPromptParser.js';
export type { ChainExecutionContext, ChainValidationResult } from './loaders/ChainPromptLoader.js';
export type { ChainExecutionOptions, ChainExecutionResult } from './generators/chainPrompt.js';

// 當完成各個模塊時，將在下方匯出各個 prompt 生成器
// 例如：
export { getPlanTaskPrompt } from './generators/planTask.js';
export { getAnalyzeTaskPrompt } from './generators/analyzeTask.js';
export { getReflectTaskPrompt } from './generators/reflectTask.js';
export { getSplitTasksPrompt } from './generators/splitTasks.js';
export { getExecuteTaskPrompt } from './generators/executeTask.js';
export { getVerifyTaskPrompt } from './generators/verifyTask.js';
export { getCompleteTaskPrompt } from './generators/completeTask.js';
export { getListTasksPrompt } from './generators/listTasks.js';
export { getQueryTaskPrompt } from './generators/queryTask.js';
export { getGetTaskDetailPrompt } from './generators/getTaskDetail.js';
export { getInitProjectRulesPrompt } from './generators/initProjectRules.js';
export { getDeleteTaskPrompt } from './generators/deleteTask.js';
export { getClearAllTasksPrompt } from './generators/clearAllTasks.js';
export { getUpdateTaskContentPrompt } from './generators/updateTaskContent.js';
export { getResearchModePrompt } from './generators/researchMode.js';
