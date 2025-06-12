/**
 * AI 管理工具模块
 * 导出所有 AI 提供商管理相关的工具
 */

// 导出管理 AI 提供商工具
export {
  manageAiProvidersTool,
  manageAiProvidersSchema,
  manageAiProvidersToolDefinition,
} from './manageAiProviders.js';

// 导出切换 AI 模型工具
export { switchAiModelTool, switchAiModelSchema, switchAiModelToolDefinition } from './switchAiModel.js';

// 导出获取当前 AI 状态工具
export {
  getCurrentAiStatusTool,
  getCurrentAiStatusSchema,
  getCurrentAiStatusToolDefinition,
} from './getCurrentAiStatus.js';

// 导出智能指令处理工具
export {
  processIntelligentCommandTool,
  processIntelligentCommandSchema,
  processIntelligentCommandToolDefinition,
} from './processIntelligentCommand.js';
