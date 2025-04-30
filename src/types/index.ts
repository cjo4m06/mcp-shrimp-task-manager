// 任务状态枚举：定义任务在工作流程中的当前阶段
export enum TaskStatus {
  PENDING = "待处理", // 已创建但尚未开始执行的任务
  IN_PROGRESS = "进行中", // 当前正在执行的任务
  COMPLETED = "已完成", // 已成功完成并通过验证的任务
  BLOCKED = "被阻挡", // 由于依赖关系而暂时无法执行的任务
}

// 任务依赖关系：定义任务之间的前置条件关系
export interface TaskDependency {
  taskId: string; // 前置任务的唯一标识符，当前任务执行前必须完成此依赖任务
}

// 相关文件类型：定义文件与任务的关系类型
export enum RelatedFileType {
  TO_MODIFY = "TO_MODIFY", // 需要在任务中修改的文件
  REFERENCE = "REFERENCE", // 任务的参考资料或相关文档
  CREATE = "CREATE", // 需要在任务中建立的文件
  DEPENDENCY = "DEPENDENCY", // 任务依赖的组件或库文件
  OTHER = "OTHER", // 其他类型的相关文件
}

// 相关文件：定义任务相关的文件信息
export interface RelatedFile {
  path: string; // 文件路径，可以是相对于项目根目录的路径或绝对路径
  type: RelatedFileType; // 文件与任务的关系类型
  description?: string; // 文件的补充描述，说明其与任务的具体关系或用途
  lineStart?: number; // 相关代码区块的起始行（选填）
  lineEnd?: number; // 相关代码区块的结束行（选填）
}

// 任务介面：定义任务的完整数据结构
export interface Task {
  id: string; // 任务的唯一标识符
  name: string; // 简洁明确的任务名称
  description: string; // 详细的任务描述，包含实施要点和验收标准
  notes?: string; // 补充说明、特殊处理要求或实施建议（选填）
  status: TaskStatus; // 任务当前的执行状态
  dependencies: TaskDependency[]; // 任务的前置依赖关系列表
  createdAt: Date; // 任务创建的时间戳
  updatedAt: Date; // 任务最后更新的时间戳
  completedAt?: Date; // 任务完成的时间戳（仅适用于已完成的任务）
  summary?: string; // 任务完成摘要，简洁描述实施结果和重要决策（仅适用于已完成的任务）
  relatedFiles?: RelatedFile[]; // 与任务相关的文件列表（选填）

  // 新增栏位：保存完整的技术分析结果
  analysisResult?: string; // 来自 analyze_task 和 reflect_task 阶段的完整分析结果

  // 新增栏位：保存具体的实现指南
  implementationGuide?: string; // 具体的实现方法、步骤和建议

  // 新增栏位：保存验证标准和检验方法
  verificationCriteria?: string; // 明确的验证标准、测试要点和验收条件
}

// 规划任务的参数：用于初始化任务规划阶段
export interface PlanTaskArgs {
  description: string; // 完整详细的任务问题描述，应包含任务目标、背景及预期成果
  requirements?: string; // 任务的特定技术要求、业务约束条件或品质标准（选填）
}

// 分析问题的参数：用于深入分析任务并提出技术方案
export interface AnalyzeTaskArgs {
  summary: string; // 结构化的任务摘要，包含任务目标、范围与关键技术挑战
  initialConcept: string; // 初步解答构想，包含技术方案、架构设计和实施策略
  previousAnalysis?: string; // 前次迭代的分析结果，用于持续改进方案（仅在重新分析时需提供）
}

// 反思构想的参数：用于对分析结果进行批判性评估
export interface ReflectTaskArgs {
  summary: string; // 结构化的任务摘要，保持与分析阶段一致以确保连续性
  analysis: string; // 完整详尽的技术分析结果，包括所有技术细节、依赖组件和实施方案
}

// 拆分任务的参数：用于将大型任务分解为可管理的小型任务
export interface SplitTasksArgs {
  /**
   * 任务更新模式（必填）：
   * - "append"：保留所有现有任务，新增提供的任务
   * - "overwrite"：保留已完成的任务，但删除所有未完成的任务，然后新增提供的任务
   * - "selective"：保留所有未提供名称的现有任务，更新名称匹配的任务
   * - "clearAllTasks"：清除所有任务并创建备份
   */
  updateMode: "append" | "overwrite" | "selective" | "clearAllTasks";

  // 全局分析结果：用于所有任务的共享分析数据
  globalAnalysisResult?: string; // 来自 reflect_task 的完整分析结果，适用于所有任务的通用部分

  tasks: Array<{
    name: string; // 简洁明确的任务名称，应能清晰表达任务目的
    description: string; // 详细的任务描述，包含实施要点、技术细节和验收标准
    notes?: string; // 补充说明、特殊处理要求或实施建议（选填）
    dependencies?: string[]; // 此任务依赖的前置任务ID列表，形成任务的有向无环依赖图
    relatedFiles?: RelatedFile[]; // 与任务相关的文件列表（选填）

    // 新增栏位：任务专属的实现指南
    implementationGuide?: string; // 此特定任务的具体实现方法和步骤

    // 新增栏位：任务专属的验证标准
    verificationCriteria?: string; // 此特定任务的验证标准和检验方法
  }>;
}

// 列出任务的参数（无）

// 执行任务的参数：用于开始执行特定任务
export interface ExecuteTaskArgs {
  taskId: string; // 待执行任务的唯一标识符，必须是系统中存在的有效任务ID
}

// 检验任务的参数：用于评估任务的完成质量
export interface VerifyTaskArgs {
  taskId: string; // 待验证任务的唯一标识符，必须是状态为「进行中」的有效任务ID
}

// 完成任务的参数：用于标记任务为已完成状态
export interface CompleteTaskArgs {
  taskId: string; // 待标记为完成的任务唯一标识符，必须是状态为「进行中」的有效任务ID
  summary?: string; // 任务完成摘要，简洁描述实施结果和重要决策（选填，如未提供将自动生成）
}

// 任务复杂度级别：定义任务的复杂程度分类
export enum TaskComplexityLevel {
  LOW = "低复杂度", // 简单且直接的任务，通常不需要特殊处理
  MEDIUM = "中等复杂度", // 具有一定复杂性但仍可管理的任务
  HIGH = "高复杂度", // 复杂且耗时的任务，需要特别关注
  VERY_HIGH = "极高复杂度", // 极其复杂的任务，建议拆分处理
}

// 任务复杂度阈值：定义任务复杂度评估的参考标准
export const TaskComplexityThresholds = {
  DESCRIPTION_LENGTH: {
    MEDIUM: 500, // 超过此字数判定为中等复杂度
    HIGH: 1000, // 超过此字数判定为高复杂度
    VERY_HIGH: 2000, // 超过此字数判定为极高复杂度
  },
  DEPENDENCIES_COUNT: {
    MEDIUM: 2, // 超过此依赖数量判定为中等复杂度
    HIGH: 5, // 超过此依赖数量判定为高复杂度
    VERY_HIGH: 10, // 超过此依赖数量判定为极高复杂度
  },
  NOTES_LENGTH: {
    MEDIUM: 200, // 超过此字数判定为中等复杂度
    HIGH: 500, // 超过此字数判定为高复杂度
    VERY_HIGH: 1000, // 超过此字数判定为极高复杂度
  },
};

// 任务复杂度评估结果：记录任务复杂度分析的详细结果
export interface TaskComplexityAssessment {
  level: TaskComplexityLevel; // 整体复杂度级别
  metrics: {
    // 各项评估指标的详细数据
    descriptionLength: number; // 描述长度
    dependenciesCount: number; // 依赖数量
    notesLength: number; // 注记长度
    hasNotes: boolean; // 是否有注记
  };
  recommendations: string[]; // 处理建议列表
}

// Git分析相关的类型
export interface GitAnalysisArgs {
  diffOutput: string;    // git diff输出的完整内容
  changedFiles: string[]; // 变更的文件列表
  commitInfo: string;    // 提交信息
  tasksToAnalyze: Task[]; // 要分析的任务列表
}

// 思维链资料结构
export * from "./thoughtChain.js";
