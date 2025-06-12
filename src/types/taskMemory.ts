/**
 * 任务记忆和动态调整系统类型定义
 * 支持任务执行上下文保持、动态插入和智能调整
 */

// 任务执行上下文：记录任务执行过程中的完整状态
export interface TaskExecutionContext {
  taskId: string; // 任务ID
  executionId: string; // 执行实例ID（支持同一任务多次执行）
  startTime: Date; // 开始执行时间
  endTime?: Date; // 结束执行时间
  status: 'running' | 'paused' | 'completed' | 'failed'; // 执行状态
  summary?: string; // 执行摘要

  // 执行过程记录
  steps: TaskExecutionStep[]; // 执行步骤记录
  decisions: TaskDecision[]; // 执行过程中的决策记录
  discoveries: TaskDiscovery[]; // 执行过程中的发现和洞察

  // 上下文信息
  environment: ExecutionEnvironment; // 执行环境信息
  resources: TaskResource[]; // 使用的资源
  artifacts: TaskArtifact[]; // 产生的工件

  // 知识传递
  knowledgeGenerated: TaskKnowledge[]; // 产生的知识
  knowledgeConsumed: string[]; // 消费的知识ID列表

  // 中断和恢复
  checkpoints: TaskCheckpoint[]; // 检查点（支持中断恢复）
  resumeInfo?: TaskResumeInfo; // 恢复信息
}

// 任务执行步骤
export interface TaskExecutionStep {
  stepId: string; // 步骤ID
  name: string; // 步骤名称
  description: string; // 步骤描述
  startTime: Date; // 开始时间
  endTime?: Date; // 结束时间
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped'; // 步骤状态

  // 步骤详情
  actions: TaskAction[]; // 执行的动作
  outputs: TaskOutput[]; // 产生的输出
  errors?: TaskError[]; // 遇到的错误

  // 元数据
  metadata: Record<string, any>; // 步骤元数据
  notes?: string; // 步骤备注
}

// 任务决策记录
export interface TaskDecision {
  decisionId: string; // 决策ID
  timestamp: Date; // 决策时间
  context: string; // 决策上下文
  options: DecisionOption[]; // 可选方案
  chosen: string; // 选择的方案ID
  reasoning: string; // 决策理由
  impact: DecisionImpact; // 决策影响
}

// 决策选项
export interface DecisionOption {
  optionId: string; // 选项ID
  description: string; // 选项描述
  pros: string[]; // 优点
  cons: string[]; // 缺点
  estimatedEffort: number; // 预估工作量
  riskLevel: 'low' | 'medium' | 'high'; // 风险级别
}

// 决策影响
export interface DecisionImpact {
  affectedTasks: string[]; // 影响的任务ID列表
  timeImpact: number; // 时间影响（小时）
  resourceImpact: string[]; // 资源影响
  qualityImpact: 'positive' | 'neutral' | 'negative'; // 质量影响
  futureConsiderations: string[]; // 未来考虑事项
}

// 任务发现
export interface TaskDiscovery {
  discoveryId: string; // 发现ID
  timestamp: Date; // 发现时间
  type: 'insight' | 'problem' | 'opportunity' | 'risk' | 'solution'; // 发现类型
  title: string; // 发现标题
  description: string; // 详细描述
  relevance: DiscoveryRelevance; // 相关性
  actionable: boolean; // 是否可执行
  suggestedActions?: string[]; // 建议的行动
}

// 发现相关性
export interface DiscoveryRelevance {
  currentTask: 'high' | 'medium' | 'low'; // 对当前任务的相关性
  futureTask: string[]; // 对未来任务的影响
  projectLevel: 'critical' | 'important' | 'minor'; // 项目级别影响
  knowledgeValue: 'high' | 'medium' | 'low'; // 知识价值
}

// 执行环境
export interface ExecutionEnvironment {
  projectContext: ProjectContext; // 项目上下文
  systemInfo: SystemInfo; // 系统信息
  toolsAvailable: string[]; // 可用工具
  constraints: ExecutionConstraint[]; // 执行约束
}

// 项目上下文
export interface ProjectContext {
  projectName: string; // 项目名称
  projectType: string; // 项目类型
  techStack: string[]; // 技术栈
  currentPhase: string; // 当前阶段
  teamMembers: string[]; // 团队成员
}

// 系统信息
export interface SystemInfo {
  platform: string; // 平台
  nodeVersion: string; // Node.js版本
  availableMemory: number; // 可用内存
  diskSpace: number; // 磁盘空间
  networkStatus: 'online' | 'offline' | 'limited'; // 网络状态
}

// 执行约束
export interface ExecutionConstraint {
  type: 'time' | 'resource' | 'dependency' | 'quality' | 'security'; // 约束类型
  description: string; // 约束描述
  severity: 'blocking' | 'warning' | 'info'; // 严重程度
  workaround?: string; // 变通方案
}

// 任务资源
export interface TaskResource {
  resourceId: string; // 资源ID
  type: 'file' | 'api' | 'service' | 'tool' | 'knowledge'; // 资源类型
  name: string; // 资源名称
  location: string; // 资源位置
  usage: ResourceUsage; // 使用情况
  availability: 'available' | 'busy' | 'unavailable'; // 可用性
}

// 资源使用情况
export interface ResourceUsage {
  accessCount: number; // 访问次数
  totalTime: number; // 总使用时间
  lastAccessed: Date; // 最后访问时间
  operations: string[]; // 执行的操作
}

// 任务工件
export interface TaskArtifact {
  artifactId: string; // 工件ID
  type: 'code' | 'document' | 'config' | 'test' | 'data'; // 工件类型
  name: string; // 工件名称
  path: string; // 工件路径
  size: number; // 工件大小
  checksum: string; // 校验和
  createdAt: Date; // 创建时间
  modifiedAt: Date; // 修改时间
  metadata: Record<string, any>; // 工件元数据
}

// 任务知识
export interface TaskKnowledge {
  knowledgeId: string; // 知识ID
  type: 'pattern' | 'solution' | 'pitfall' | 'best-practice' | 'lesson-learned'; // 知识类型
  title: string; // 知识标题
  content: string; // 知识内容
  context: KnowledgeContext; // 知识上下文
  applicability: KnowledgeApplicability; // 适用性
  confidence: number; // 置信度 (0-1)
  source: KnowledgeSource; // 知识来源
  tags: string[]; // 标签
  relatedKnowledge: string[]; // 相关知识ID
}

// 知识上下文
export interface KnowledgeContext {
  domain: string; // 领域
  technology: string[]; // 技术
  scenario: string; // 场景
  constraints: string[]; // 约束条件
  assumptions: string[]; // 假设条件
}

// 知识适用性
export interface KnowledgeApplicability {
  taskTypes: string[]; // 适用的任务类型
  projectTypes: string[]; // 适用的项目类型
  conditions: string[]; // 适用条件
  exclusions: string[]; // 排除条件
}

// 知识来源
export interface KnowledgeSource {
  type: 'execution' | 'analysis' | 'research' | 'external' | 'user-input'; // 来源类型
  taskId?: string; // 来源任务ID
  timestamp: Date; // 产生时间
  reliability: 'high' | 'medium' | 'low'; // 可靠性
  verificationStatus: 'verified' | 'unverified' | 'disputed'; // 验证状态
}

// 任务检查点
export interface TaskCheckpoint {
  checkpointId: string; // 检查点ID
  timestamp: Date; // 检查点时间
  description: string; // 检查点描述
  state: TaskCheckpointState; // 检查点状态
  resumeInstructions: string; // 恢复指令
  metadata: Record<string, any>; // 检查点元数据
}

// 检查点状态
export interface TaskCheckpointState {
  currentStep: string; // 当前步骤
  completedSteps: string[]; // 已完成步骤
  pendingSteps: string[]; // 待执行步骤
  variables: Record<string, any>; // 状态变量
  resources: TaskResource[]; // 资源状态
  artifacts: TaskArtifact[]; // 工件状态
}

// 任务恢复信息
export interface TaskResumeInfo {
  resumeFromCheckpoint: string; // 从哪个检查点恢复
  resumeReason: string; // 恢复原因
  resumeInstructions: string; // 恢复指令
  contextChanges: ContextChange[]; // 上下文变化
  adjustments: TaskAdjustment[]; // 需要的调整
}

// 上下文变化
export interface ContextChange {
  type: 'environment' | 'requirement' | 'constraint' | 'resource'; // 变化类型
  description: string; // 变化描述
  impact: 'high' | 'medium' | 'low'; // 影响程度
  requiredActions: string[]; // 需要的行动
}

// 任务调整
export interface TaskAdjustment {
  adjustmentId: string; // 调整ID
  type: 'scope' | 'approach' | 'timeline' | 'resources' | 'dependencies'; // 调整类型
  description: string; // 调整描述
  reasoning: string; // 调整理由
  impact: AdjustmentImpact; // 调整影响
  approval: 'required' | 'automatic' | 'completed'; // 审批状态
}

// 调整影响
export interface AdjustmentImpact {
  affectedTasks: string[]; // 影响的任务
  timeChange: number; // 时间变化（小时）
  resourceChange: string[]; // 资源变化
  riskChange: 'increased' | 'decreased' | 'unchanged'; // 风险变化
  qualityChange: 'improved' | 'degraded' | 'unchanged'; // 质量变化
}

// 任务动作
export interface TaskAction {
  actionId: string; // 动作ID
  type: 'create' | 'modify' | 'delete' | 'execute' | 'analyze' | 'test'; // 动作类型
  target: string; // 动作目标
  description: string; // 动作描述
  timestamp: Date; // 执行时间
  result: ActionResult; // 动作结果
  metadata: Record<string, any>; // 动作元数据
}

// 动作结果
export interface ActionResult {
  success: boolean; // 是否成功
  output?: string; // 输出内容
  error?: string; // 错误信息
  changes: string[]; // 产生的变化
  sideEffects: string[]; // 副作用
}

// 任务输出
export interface TaskOutput {
  outputId: string; // 输出ID
  type: 'file' | 'data' | 'report' | 'artifact' | 'knowledge'; // 输出类型
  name: string; // 输出名称
  content: string; // 输出内容
  format: string; // 输出格式
  size: number; // 输出大小
  timestamp: Date; // 产生时间
  metadata: Record<string, any>; // 输出元数据
}

// 任务错误
export interface TaskError {
  errorId: string; // 错误ID
  type: 'system' | 'logic' | 'data' | 'network' | 'user'; // 错误类型
  severity: 'critical' | 'major' | 'minor' | 'warning'; // 严重程度
  message: string; // 错误消息
  stack?: string; // 错误堆栈
  context: string; // 错误上下文
  timestamp: Date; // 发生时间
  resolution?: ErrorResolution; // 解决方案
}

// 错误解决方案
export interface ErrorResolution {
  strategy: 'retry' | 'skip' | 'fallback' | 'manual' | 'abort'; // 解决策略
  description: string; // 解决描述
  implemented: boolean; // 是否已实施
  success: boolean; // 是否成功
  notes?: string; // 解决备注
}

// 上下文变化记录
export interface ContextChange {
  changeId: string;
  timestamp: Date;
  changeType: 'environment' | 'requirement' | 'constraint' | 'assumption';
  description: string;
  impact: 'low' | 'medium' | 'high';
  adaptationRequired: boolean;
}

// 协作模式
export interface CollaborationPattern {
  type: 'team-collaboration' | 'cross-functional' | 'peer-review' | 'mentoring';
  description: string;
  participants: Array<{
    role: any; // 使用 any 避免循环依赖
    responsibility: string;
  }>;
  workflow: Array<{
    step: number;
    action: string;
    owner: string;
    dependencies: string[];
  }>;
  communicationChannels: string[];
  deliverables: string[];
  successMetrics: string[];
}
