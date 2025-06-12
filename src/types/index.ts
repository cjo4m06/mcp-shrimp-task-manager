// 任務狀態枚舉：定義任務在工作流程中的當前階段
export enum TaskStatus {
  PENDING = 'pending', // 已創建但尚未開始執行的任務
  IN_PROGRESS = 'in_progress', // 當前正在執行的任務
  COMPLETED = 'completed', // 已成功完成並通過驗證的任務
  BLOCKED = 'blocked', // 由於依賴關係而暫時無法執行的任務
}

// 链式执行状态枚举：定义链式执行中的特殊状态
export enum ChainExecutionStatus {
  WAITING_FOR_PARENT = 'waiting_for_parent', // 等待父步骤完成
  READY_TO_EXECUTE = 'ready_to_execute', // 准备执行
  EXECUTING = 'executing', // 正在执行
  WAITING_FOR_DATA = 'waiting_for_data', // 等待数据传递
  DATA_PROCESSING = 'data_processing', // 数据处理中
  STEP_COMPLETED = 'step_completed', // 步骤完成
  CHAIN_FAILED = 'chain_failed', // 链式执行失败
  CHAIN_CANCELLED = 'chain_cancelled', // 链式执行取消
}

// 任務依賴關係：定義任務之間的前置條件關係
export interface TaskDependency {
  taskId: string; // 前置任務的唯一標識符，當前任務執行前必須完成此依賴任務
}

// 相關文件類型：定義文件與任務的關係類型
export enum RelatedFileType {
  TO_MODIFY = 'TO_MODIFY', // 需要在任務中修改的文件
  REFERENCE = 'REFERENCE', // 任務的參考資料或相關文檔
  CREATE = 'CREATE', // 需要在任務中建立的文件
  DEPENDENCY = 'DEPENDENCY', // 任務依賴的組件或庫文件
  OTHER = 'OTHER', // 其他類型的相關文件
}

// 相關文件：定義任務相關的文件信息
export interface RelatedFile {
  path: string; // 文件路徑，可以是相對於項目根目錄的路徑或絕對路徑
  type: RelatedFileType; // 文件與任務的關係類型
  description?: string; // 文件的補充描述，說明其與任務的具體關係或用途
  lineStart?: number; // 相關代碼區塊的起始行（選填）
  lineEnd?: number; // 相關代碼區塊的結束行（選填）
}

// 任務介面：定義任務的完整數據結構
export interface Task {
  id: string; // 任務的唯一標識符
  name: string; // 簡潔明確的任務名稱
  description: string; // 詳細的任務描述，包含實施要點和驗收標準
  notes?: string; // 補充說明、特殊處理要求或實施建議（選填）
  status: TaskStatus; // 任務當前的執行狀態
  dependencies: TaskDependency[]; // 任務的前置依賴關係列表
  priority?: number; // 任務優先級 (1-10，數字越大優先級越高)
  urgency?: 'low' | 'medium' | 'high' | 'critical'; // 任務緊急程度
  createdAt: Date; // 任務創建的時間戳
  updatedAt: Date; // 任務最後更新的時間戳
  completedAt?: Date; // 任務完成的時間戳（僅適用於已完成的任務）
  summary?: string; // 任務完成摘要，簡潔描述實施結果和重要決策（僅適用於已完成的任務）
  relatedFiles?: RelatedFile[]; // 與任務相關的文件列表（選填）

  // 新增欄位：保存完整的技術分析結果
  analysisResult?: string; // 來自 analyze_task 和 reflect_task 階段的完整分析結果

  // 新增欄位：保存具體的實現指南
  implementationGuide?: string; // 具體的實現方法、步驟和建議

  // 新增欄位：保存驗證標準和檢驗方法
  verificationCriteria?: string; // 明確的驗證標準、測試要點和驗收條件

  // ===== 链式执行相关字段 =====

  // 链式执行标识符：标识任务所属的链式执行流程
  chainId?: string; // 链式执行的唯一标识符，同一链中的所有任务共享此ID

  // 步骤索引：在链式执行中的位置
  stepIndex?: number; // 当前任务在链式执行中的步骤序号（从0开始）

  // 链式数据：步骤间传递的数据
  chainData?: Record<string, any>; // 存储从前一步骤传递过来的数据和要传递给下一步骤的数据

  // 父步骤ID：链式执行中的前置步骤
  parentStepId?: string; // 前一个步骤的任务ID，用于建立链式执行的顺序关系

  // 子步骤ID列表：链式执行中的后续步骤
  childStepIds?: string[]; // 后续步骤的任务ID列表，支持分支执行

  // 链式执行状态：记录在链式执行中的特殊状态
  chainStatus?: ChainExecutionStatus; // 链式执行的特殊状态信息
}

// 任務複雜度級別：定義任務的複雜程度分類
export enum TaskComplexityLevel {
  LOW = '低複雜度', // 簡單且直接的任務，通常不需要特殊處理
  MEDIUM = '中等複雜度', // 具有一定複雜性但仍可管理的任務
  HIGH = '高複雜度', // 複雜且耗時的任務，需要特別關注
  VERY_HIGH = '極高複雜度', // 極其複雜的任務，建議拆分處理
}

// 任務複雜度閾值：定義任務複雜度評估的參考標準
export const TaskComplexityThresholds = {
  DESCRIPTION_LENGTH: {
    MEDIUM: 500, // 超過此字數判定為中等複雜度
    HIGH: 1000, // 超過此字數判定為高複雜度
    VERY_HIGH: 2000, // 超過此字數判定為極高複雜度
  },
  DEPENDENCIES_COUNT: {
    MEDIUM: 2, // 超過此依賴數量判定為中等複雜度
    HIGH: 5, // 超過此依賴數量判定為高複雜度
    VERY_HIGH: 10, // 超過此依賴數量判定為極高複雜度
  },
  NOTES_LENGTH: {
    MEDIUM: 200, // 超過此字數判定為中等複雜度
    HIGH: 500, // 超過此字數判定為高複雜度
    VERY_HIGH: 1000, // 超過此字數判定為極高複雜度
  },
};

// 任務複雜度評估結果：記錄任務複雜度分析的詳細結果
export interface TaskComplexityAssessment {
  level: TaskComplexityLevel; // 整體複雜度級別
  metrics: {
    // 各項評估指標的詳細數據
    descriptionLength: number; // 描述長度
    dependenciesCount: number; // 依賴數量
    notesLength: number; // 注記長度
    hasNotes: boolean; // 是否有注記
  };
  recommendations: string[]; // 處理建議列表
}

// ===== 增强 Prompt 系统类型定义 =====

// Prompt 分类：定义 prompt 的分类信息
export interface PromptCategory {
  id: string; // 分类的唯一标识符
  name: {
    en: string; // 英文名称
    zh: string; // 中文名称
  };
  description: {
    en: string; // 英文描述
    zh: string; // 中文描述
  };
  prompts: string[]; // 该分类下的 prompt 列表
  enabled: boolean; // 是否启用该分类
}

// 链式执行步骤：定义链式 prompt 中的单个步骤
export interface ChainStep {
  promptId: string; // 步骤使用的 prompt ID
  stepName: string; // 步骤名称
  category?: string; // 所属分类（可选）
  inputMapping?: Record<string, string>; // 输入参数映射
  outputMapping?: Record<string, string>; // 输出参数映射
  retryCount?: number; // 重试次数（可选）
  timeout?: number; // 超时时间（可选）
}

// 链式 Prompt：定义完整的链式执行流程
export interface ChainPrompt {
  id: string; // 链式 prompt 的唯一标识符
  name: {
    en: string; // 英文名称
    zh: string; // 中文名称
  };
  description: {
    en: string; // 英文描述
    zh: string; // 中文描述
  };
  steps: ChainStep[]; // 执行步骤列表
  enabled: boolean; // 是否启用
}

// AI 提供商：定义 AI 服务提供商的基本信息
export interface AIProvider {
  id: string; // 提供商唯一标识符
  name: string; // 提供商名称
  apiEndpoint: string; // API 端点
  models: {
    main: string; // 主要模型
    research: string; // 研究模型
    fallback: string; // 备用模型
  };
  capabilities: string[]; // 支持的功能列表
  costPerToken: number; // 每 token 成本
  maxTokens: number; // 最大 token 数
  enabled: boolean; // 是否启用
}

// Prompt 配置：定义整个 prompt 系统的配置
export interface PromptConfig {
  version: string; // 配置版本
  description: string; // 配置描述
  categories: Record<string, PromptCategory>; // 分类配置
  chains: Record<string, ChainPrompt>; // 链式 prompt 配置
  settings: {
    defaultLanguage: string; // 默认语言
    enableHotReload: boolean; // 是否启用热重载
    cacheEnabled: boolean; // 是否启用缓存
    maxCacheSize: number; // 最大缓存大小
    loadingStrategy: 'eager' | 'lazy'; // 加载策略
  };
}

// ===== 链式执行系统类型定义 =====

// 链式执行结果：记录链式执行的结果信息
export interface ChainExecutionResult {
  chainId: string; // 链式执行的唯一标识符
  success: boolean; // 执行是否成功
  completedSteps: number; // 已完成的步骤数
  totalSteps: number; // 总步骤数
  executionTime: number; // 执行耗时（毫秒）
  results: Record<string, any>; // 各步骤的执行结果
  errors?: ChainExecutionError[]; // 执行过程中的错误信息
  finalData?: Record<string, any>; // 最终输出数据
}

// 链式执行错误：记录链式执行中的错误信息
export interface ChainExecutionError {
  stepIndex: number; // 出错的步骤索引
  taskId: string; // 出错的任务ID
  errorType: ChainErrorType; // 错误类型
  message: string; // 错误消息
  timestamp: Date; // 错误发生时间
  recoverable: boolean; // 是否可恢复
  retryCount?: number; // 重试次数
}

// 链式执行错误类型枚举
export enum ChainErrorType {
  STEP_EXECUTION_FAILED = 'step_execution_failed', // 步骤执行失败
  DATA_MAPPING_ERROR = 'data_mapping_error', // 数据映射错误
  TIMEOUT_ERROR = 'timeout_error', // 超时错误
  DEPENDENCY_ERROR = 'dependency_error', // 依赖错误
  VALIDATION_ERROR = 'validation_error', // 验证错误
  SYSTEM_ERROR = 'system_error', // 系统错误
}

// 链式执行配置：定义链式执行的配置参数
export interface ChainExecutionConfig {
  maxRetries: number; // 最大重试次数
  stepTimeout: number; // 单步超时时间（毫秒）
  totalTimeout: number; // 总超时时间（毫秒）
  enableParallelExecution: boolean; // 是否启用并行执行
  errorHandlingStrategy: ChainErrorHandlingStrategy; // 错误处理策略
  dataValidation: boolean; // 是否启用数据验证
  logLevel: ChainLogLevel; // 日志级别
}

// 链式执行错误处理策略枚举
export enum ChainErrorHandlingStrategy {
  FAIL_FAST = 'fail_fast', // 快速失败，遇到错误立即停止
  CONTINUE_ON_ERROR = 'continue_on_error', // 遇到错误继续执行
  RETRY_ON_ERROR = 'retry_on_error', // 遇到错误重试
  SKIP_ON_ERROR = 'skip_on_error', // 遇到错误跳过当前步骤
}

// 链式执行日志级别枚举
export enum ChainLogLevel {
  DEBUG = 'debug', // 调试级别
  INFO = 'info', // 信息级别
  WARN = 'warn', // 警告级别
  ERROR = 'error', // 错误级别
}

// 链式执行上下文：记录链式执行的上下文信息
export interface ChainExecutionContext {
  chainId: string; // 链式执行ID
  currentStepIndex: number; // 当前步骤索引
  totalSteps: number; // 总步骤数
  startTime: Date; // 开始时间
  config: ChainExecutionConfig; // 执行配置
  sharedData: Record<string, any>; // 共享数据
  stepResults: Record<number, any>; // 各步骤结果
  executionHistory: ChainExecutionEvent[]; // 执行历史
}

// 链式执行事件：记录链式执行过程中的事件
export interface ChainExecutionEvent {
  eventType: ChainEventType; // 事件类型
  stepIndex: number; // 步骤索引
  taskId: string; // 任务ID
  timestamp: Date; // 事件时间
  data?: Record<string, any>; // 事件数据
  message?: string; // 事件消息
}

// 链式执行事件类型枚举
export enum ChainEventType {
  CHAIN_STARTED = 'chain_started', // 链式执行开始
  STEP_STARTED = 'step_started', // 步骤开始
  STEP_COMPLETED = 'step_completed', // 步骤完成
  STEP_FAILED = 'step_failed', // 步骤失败
  STEP_RETRIED = 'step_retried', // 步骤重试
  DATA_PASSED = 'data_passed', // 数据传递
  CHAIN_COMPLETED = 'chain_completed', // 链式执行完成
  CHAIN_FAILED = 'chain_failed', // 链式执行失败
  CHAIN_CANCELLED = 'chain_cancelled', // 链式执行取消
}

// 导出任务记忆相关类型
export * from './taskMemory.js';
