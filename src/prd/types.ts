/**
 * PRD 驱动的团队协作任务生成系统类型定义
 * 专注于不同岗位角色的专业化任务生成和团队协作
 */

// ===== 团队角色定义 =====

export type TeamRole =
  | 'product-manager' // 产品经理
  | 'ui-designer' // UI 设计师
  | 'ux-designer' // UX 设计师
  | 'frontend-developer' // 前端开发
  | 'backend-developer' // 后端开发
  | 'fullstack-developer' // 全栈开发
  | 'mobile-developer' // 移动端开发
  | 'devops-engineer' // DevOps 工程师
  | 'qa-engineer' // 测试工程师
  | 'data-engineer' // 数据工程师
  | 'security-engineer' // 安全工程师
  | 'tech-lead' // 技术负责人
  | 'project-manager'; // 项目经理

// 角色能力和职责定义
export interface RoleDefinition {
  id: TeamRole;
  name: {
    en: string;
    zh: string;
  };
  description: {
    en: string;
    zh: string;
  };
  responsibilities: string[];
  skills: string[];
  taskTypes: string[];
  collaboratesWith: TeamRole[];
  priority: number; // 在项目中的优先级
}

// ===== PRD 文档结构 =====

export interface PRDDocument {
  metadata: PRDMetadata;
  content: PRDContent;
  analysis?: PRDAnalysis;
}

export interface PRDMetadata {
  title: string;
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  projectType: ProjectType;
  techStack: TechStack;
  teamSize: number;
  timeline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PRDContent {
  overview: string;
  objectives: string[];
  targetAudience: string;
  userStories: UserStory[];
  functionalRequirements: FunctionalRequirement[];
  nonFunctionalRequirements: NonFunctionalRequirement[];
  constraints: string[];
  assumptions: string[];
  dependencies: string[];
  successMetrics: string[];
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  persona: string;
  acceptanceCriteria: string[];
  priority: number;
  estimatedEffort: string;
  involvedRoles: TeamRole[];
}

export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  complexity: 'low' | 'medium' | 'high';
  involvedRoles: TeamRole[];
  dependencies: string[];
}

export interface NonFunctionalRequirement {
  id: string;
  type: 'performance' | 'security' | 'usability' | 'scalability' | 'reliability' | 'maintainability';
  description: string;
  metrics: string[];
  involvedRoles: TeamRole[];
}

// ===== 项目和技术栈定义 =====

export type ProjectType =
  | 'web-application'
  | 'mobile-application'
  | 'desktop-application'
  | 'api-service'
  | 'microservice'
  | 'data-platform'
  | 'ml-system'
  | 'iot-system'
  | 'blockchain-app'
  | 'game'
  | 'cms'
  | 'e-commerce';

export interface TechStack {
  frontend?: string[];
  backend?: string[];
  database?: string[];
  infrastructure?: string[];
  tools?: string[];
  frameworks?: string[];
}

// ===== PRD 分析结果 =====

export interface PRDAnalysis {
  complexity: ProjectComplexity;
  estimatedDuration: string;
  recommendedTeam: TeamComposition;
  identifiedComponents: Component[];
  workflowPhases: WorkflowPhase[];
  riskAssessment: RiskAssessment;
  dependencies: DependencyGraph;
}

export interface ProjectComplexity {
  overall: 'low' | 'medium' | 'high' | 'very-high';
  technical: number; // 1-10
  business: number; // 1-10
  integration: number; // 1-10
  factors: string[];
}

export interface TeamComposition {
  requiredRoles: TeamRole[];
  optionalRoles: TeamRole[];
  teamSize: number;
  workload: Record<TeamRole, number>; // 工作量百分比
}

export interface Component {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'integration' | 'infrastructure';
  description: string;
  complexity: 'low' | 'medium' | 'high';
  primaryRole: TeamRole;
  supportingRoles: TeamRole[];
  dependencies: string[];
  estimatedEffort: number; // 人天
}

export interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  duration: string;
  involvedRoles: TeamRole[];
  deliverables: string[];
  dependencies: string[];
  parallelizable: boolean;
}

export interface RiskAssessment {
  technicalRisks: Risk[];
  businessRisks: Risk[];
  resourceRisks: Risk[];
  timelineRisks: Risk[];
}

export interface Risk {
  id: string;
  description: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  owner: TeamRole;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface DependencyNode {
  id: string;
  type: 'component' | 'task' | 'milestone';
  name: string;
  role: TeamRole;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'blocks' | 'enables' | 'requires';
  description?: string;
}

// ===== 任务生成结果 =====

export interface GeneratedTaskSet {
  metadata: TaskSetMetadata;
  roleBasedTasks: Record<TeamRole, RoleTask[]>;
  crossRoleTasks: CrossRoleTask[];
  milestones: Milestone[];
  workflow: TaskWorkflow;
}

export interface TaskSetMetadata {
  prdId: string;
  generatedAt: Date;
  totalTasks: number;
  estimatedDuration: string;
  involvedRoles: TeamRole[];
}

export interface RoleTask {
  id: string;
  title: string;
  description: string;
  role: TeamRole;
  category: string;
  priority: number;
  estimatedHours: number;
  complexity: 'low' | 'medium' | 'high';
  skills: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
  dependencies: string[];
  blockedBy: string[];
  blocks: string[];
  collaboratesWith: TeamRole[];
  phase: string;
  tags: string[];
}

export interface CrossRoleTask {
  id: string;
  title: string;
  description: string;
  involvedRoles: TeamRole[];
  coordinator: TeamRole;
  type: 'meeting' | 'review' | 'handoff' | 'integration' | 'planning';
  estimatedHours: number;
  deliverables: string[];
  dependencies: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate?: string;
  criteria: string[];
  involvedRoles: TeamRole[];
  dependencies: string[];
  deliverables: string[];
}

export interface TaskWorkflow {
  phases: WorkflowPhase[];
  criticalPath: string[];
  parallelTracks: ParallelTrack[];
  handoffPoints: HandoffPoint[];
}

export interface ParallelTrack {
  id: string;
  name: string;
  tasks: string[];
  roles: TeamRole[];
  canRunInParallel: boolean;
}

export interface HandoffPoint {
  id: string;
  from: TeamRole;
  to: TeamRole;
  deliverable: string;
  criteria: string[];
  estimatedTime: string;
}

// ===== 配置和选项 =====

export interface PRDParsingOptions {
  language: 'en' | 'zh';
  includeAnalysis: boolean;
  generateTasks: boolean;
  teamComposition?: TeamRole[];
  projectType?: ProjectType;
  techStack?: TechStack;
}

export interface TaskGenerationOptions {
  targetRoles: TeamRole[];
  includeOptionalRoles: boolean;
  granularity: 'high' | 'medium' | 'low';
  includeEstimates: boolean;
  includeDependencies: boolean;
  workflowStyle: 'agile' | 'waterfall' | 'hybrid';
  sprintDuration?: number; // 周
}

// ===== 模板和规则 =====

export interface RoleTaskTemplate {
  role: TeamRole;
  category: string;
  templates: TaskTemplate[];
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  complexity: 'low' | 'medium' | 'high';
  skills: string[];
  deliverables: string[];
  acceptanceCriteria: string[];
  commonDependencies: string[];
  variations: TemplateVariation[];
}

export interface TemplateVariation {
  condition: string;
  modifications: {
    estimatedHours?: number;
    complexity?: 'low' | 'medium' | 'high';
    additionalSkills?: string[];
    additionalDeliverables?: string[];
  };
}

// ===== 协作和通信 =====

export interface CollaborationPattern {
  roles: TeamRole[];
  type: 'sequential' | 'parallel' | 'iterative';
  communicationFrequency: 'daily' | 'weekly' | 'milestone';
  artifacts: string[];
  meetings: MeetingType[];
}

export interface MeetingType {
  name: string;
  participants: TeamRole[];
  frequency: string;
  duration: string;
  purpose: string;
  deliverables: string[];
}
