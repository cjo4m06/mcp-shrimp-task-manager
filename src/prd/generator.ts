/**
 * 团队协作任务生成器
 * 基于 PRD 分析结果生成针对不同岗位的专业化任务
 * 这是我们的核心差异化功能：团队协作导向的任务生成
 */

import {
  PRDDocument,
  GeneratedTaskSet,
  RoleTask,
  CrossRoleTask,
  Milestone,
  TaskWorkflow,
  TeamRole,
  TaskGenerationOptions,
  ParallelTrack,
  HandoffPoint,
  CollaborationPattern,
  WorkflowPhase,
} from './types.js';
import { RoleDefinitions } from './roles/RoleDefinitions.js';

export class TeamCollaborativeTaskGenerator {
  private options: TaskGenerationOptions;

  constructor(options: Partial<TaskGenerationOptions> = {}) {
    this.options = {
      targetRoles: RoleDefinitions.getCoreRoles(),
      includeOptionalRoles: true,
      granularity: 'medium',
      includeEstimates: true,
      includeDependencies: true,
      workflowStyle: 'agile',
      sprintDuration: 2,
      ...options,
    };
  }

  /**
   * 生成团队协作任务集
   * @param prdDocument PRD 文档
   * @returns 生成的任务集
   */
  async generateTaskSet(prdDocument: PRDDocument): Promise<GeneratedTaskSet> {
    if (!prdDocument.analysis) {
      throw new Error('PRD document must include analysis for task generation');
    }

    const analysis = prdDocument.analysis;

    // 1. 生成基于角色的专业化任务
    const roleBasedTasks = await this.generateRoleBasedTasks(prdDocument);

    // 2. 生成跨角色协作任务
    const crossRoleTasks = await this.generateCrossRoleTasks(prdDocument);

    // 3. 生成里程碑
    const milestones = await this.generateMilestones(prdDocument);

    // 4. 生成工作流
    const workflow = await this.generateTaskWorkflow(roleBasedTasks, crossRoleTasks, milestones);

    const totalTasks =
      Object.values(roleBasedTasks).reduce((sum, tasks) => sum + tasks.length, 0) + crossRoleTasks.length;

    return {
      metadata: {
        prdId: prdDocument.metadata.title,
        generatedAt: new Date(),
        totalTasks,
        estimatedDuration: analysis.estimatedDuration,
        involvedRoles: this.options.targetRoles,
      },
      roleBasedTasks,
      crossRoleTasks,
      milestones,
      workflow,
    };
  }

  /**
   * 生成基于角色的专业化任务
   * 这是我们的核心差异化功能
   */
  private async generateRoleBasedTasks(prdDocument: PRDDocument): Promise<Record<TeamRole, RoleTask[]>> {
    const roleBasedTasks: Record<TeamRole, RoleTask[]> = {} as Record<TeamRole, RoleTask[]>;
    const analysis = prdDocument.analysis!;

    // 为每个目标角色生成专业化任务
    for (const role of this.options.targetRoles) {
      const roleTasks = await this.generateTasksForRole(role, prdDocument);
      if (roleTasks.length > 0) {
        roleBasedTasks[role] = roleTasks;
      }
    }

    // 如果包含可选角色，也为它们生成任务
    if (this.options.includeOptionalRoles) {
      for (const role of analysis.recommendedTeam.optionalRoles) {
        if (!roleBasedTasks[role]) {
          const roleTasks = await this.generateTasksForRole(role, prdDocument);
          if (roleTasks.length > 0) {
            roleBasedTasks[role] = roleTasks;
          }
        }
      }
    }

    return roleBasedTasks;
  }

  /**
   * 为特定角色生成专业化任务
   */
  private async generateTasksForRole(role: TeamRole, prdDocument: PRDDocument): Promise<RoleTask[]> {
    const tasks: RoleTask[] = [];
    const roleDefinition = RoleDefinitions.getRoleDefinition(role);
    const analysis = prdDocument.analysis!;

    // 基于角色类型生成不同的任务
    switch (role) {
      case 'product-manager':
        tasks.push(...this.generateProductManagerTasks(prdDocument));
        break;
      case 'ui-designer':
        tasks.push(...this.generateUIDesignerTasks(prdDocument));
        break;
      case 'ux-designer':
        tasks.push(...this.generateUXDesignerTasks(prdDocument));
        break;
      case 'frontend-developer':
        tasks.push(...this.generateFrontendDeveloperTasks(prdDocument));
        break;
      case 'backend-developer':
        tasks.push(...this.generateBackendDeveloperTasks(prdDocument));
        break;
      case 'fullstack-developer':
        tasks.push(...this.generateFullstackDeveloperTasks(prdDocument));
        break;
      case 'mobile-developer':
        tasks.push(...this.generateMobileDeveloperTasks(prdDocument));
        break;
      case 'qa-engineer':
        tasks.push(...this.generateQAEngineerTasks(prdDocument));
        break;
      case 'devops-engineer':
        tasks.push(...this.generateDevOpsEngineerTasks(prdDocument));
        break;
      case 'tech-lead':
        tasks.push(...this.generateTechLeadTasks(prdDocument));
        break;
      case 'project-manager':
        tasks.push(...this.generateProjectManagerTasks(prdDocument));
        break;
      default:
        // 为其他角色生成通用任务
        tasks.push(...this.generateGenericTasks(role, prdDocument));
    }

    return tasks;
  }

  /**
   * 生成产品经理任务
   */
  private generateProductManagerTasks(prdDocument: PRDDocument): RoleTask[] {
    const tasks: RoleTask[] = [];
    const content = prdDocument.content;

    // 需求分析和细化任务
    tasks.push({
      id: 'pm-001',
      title: '需求分析和优先级排序',
      description: '深入分析PRD中的需求，确定开发优先级，细化用户故事',
      role: 'product-manager',
      category: '需求分析',
      priority: 1,
      estimatedHours: 16,
      complexity: 'medium',
      skills: ['需求分析', '用户研究', '优先级排序'],
      deliverables: ['需求分析报告', '优先级矩阵', '细化用户故事'],
      acceptanceCriteria: ['所有需求都有明确的优先级', '用户故事符合INVEST原则', '需求可追溯到业务目标'],
      dependencies: [],
      blockedBy: [],
      blocks: ['ui-001', 'ux-001', 'fe-001'],
      collaboratesWith: ['ui-designer', 'ux-designer', 'tech-lead'],
      phase: '需求分析阶段',
      tags: ['需求', '分析', '优先级'],
    });

    // 用户验收测试任务
    tasks.push({
      id: 'pm-002',
      title: '用户验收测试计划',
      description: '制定用户验收测试计划，定义验收标准和测试场景',
      role: 'product-manager',
      category: '验收测试',
      priority: 2,
      estimatedHours: 12,
      complexity: 'medium',
      skills: ['测试计划', '验收标准', '用户场景'],
      deliverables: ['UAT测试计划', '验收标准文档', '测试场景清单'],
      acceptanceCriteria: ['覆盖所有核心功能', '测试场景真实可执行', '验收标准明确可衡量'],
      dependencies: ['pm-001'],
      blockedBy: ['pm-001'],
      blocks: ['qa-003'],
      collaboratesWith: ['qa-engineer'],
      phase: '测试准备阶段',
      tags: ['测试', '验收', 'UAT'],
    });

    return tasks;
  }

  /**
   * 生成UI设计师任务
   */
  private generateUIDesignerTasks(prdDocument: PRDDocument): RoleTask[] {
    const tasks: RoleTask[] = [];

    tasks.push({
      id: 'ui-001',
      title: '设计系统建立',
      description: '建立项目的设计系统，包括色彩、字体、组件库等',
      role: 'ui-designer',
      category: '设计系统',
      priority: 1,
      estimatedHours: 24,
      complexity: 'high',
      skills: ['设计系统', 'Figma', '组件设计'],
      deliverables: ['设计系统文档', 'UI组件库', '设计规范'],
      acceptanceCriteria: ['设计系统完整且一致', '组件可复用性强', '符合品牌视觉规范'],
      dependencies: ['pm-001'],
      blockedBy: ['pm-001'],
      blocks: ['ui-002', 'fe-002'],
      collaboratesWith: ['ux-designer', 'frontend-developer'],
      phase: '设计阶段',
      tags: ['设计系统', 'UI', '组件'],
    });

    tasks.push({
      id: 'ui-002',
      title: '界面设计实现',
      description: '基于设计系统实现所有界面的视觉设计',
      role: 'ui-designer',
      category: '界面设计',
      priority: 2,
      estimatedHours: 40,
      complexity: 'high',
      skills: ['界面设计', '视觉设计', '交互设计'],
      deliverables: ['高保真设计稿', '设计标注', '切图资源'],
      acceptanceCriteria: ['所有界面设计完成', '设计稿标注清晰', '符合设计系统规范'],
      dependencies: ['ui-001', 'ux-002'],
      blockedBy: ['ui-001', 'ux-002'],
      blocks: ['fe-002'],
      collaboratesWith: ['ux-designer', 'frontend-developer'],
      phase: '设计阶段',
      tags: ['界面设计', '视觉', '高保真'],
    });

    return tasks;
  }

  /**
   * 生成UX设计师任务
   */
  private generateUXDesignerTasks(prdDocument: PRDDocument): RoleTask[] {
    const tasks: RoleTask[] = [];

    tasks.push({
      id: 'ux-001',
      title: '用户研究和分析',
      description: '进行用户研究，分析用户需求和行为模式',
      role: 'ux-designer',
      category: '用户研究',
      priority: 1,
      estimatedHours: 20,
      complexity: 'medium',
      skills: ['用户研究', '数据分析', '用户访谈'],
      deliverables: ['用户研究报告', '用户画像', '用户旅程图'],
      acceptanceCriteria: ['用户研究方法科学', '数据分析结论可信', '用户画像准确完整'],
      dependencies: ['pm-001'],
      blockedBy: ['pm-001'],
      blocks: ['ux-002'],
      collaboratesWith: ['product-manager'],
      phase: '研究阶段',
      tags: ['用户研究', '分析', '画像'],
    });

    tasks.push({
      id: 'ux-002',
      title: '交互流程设计',
      description: '设计用户交互流程和信息架构',
      role: 'ux-designer',
      category: '交互设计',
      priority: 2,
      estimatedHours: 32,
      complexity: 'high',
      skills: ['交互设计', '信息架构', '原型设计'],
      deliverables: ['交互流程图', '信息架构图', '低保真原型'],
      acceptanceCriteria: ['交互流程逻辑清晰', '信息架构合理', '原型可用性良好'],
      dependencies: ['ux-001'],
      blockedBy: ['ux-001'],
      blocks: ['ui-002'],
      collaboratesWith: ['ui-designer', 'frontend-developer'],
      phase: '设计阶段',
      tags: ['交互', '流程', '原型'],
    });

    return tasks;
  }

  /**
   * 生成前端开发任务
   */
  private generateFrontendDeveloperTasks(prdDocument: PRDDocument): RoleTask[] {
    const tasks: RoleTask[] = [];

    tasks.push({
      id: 'fe-001',
      title: '前端架构设计',
      description: '设计前端技术架构，选择技术栈和工具链',
      role: 'frontend-developer',
      category: '架构设计',
      priority: 1,
      estimatedHours: 16,
      complexity: 'high',
      skills: ['前端架构', '技术选型', '工程化'],
      deliverables: ['前端架构文档', '技术选型报告', '项目脚手架'],
      acceptanceCriteria: ['架构设计合理可扩展', '技术选型符合项目需求', '开发环境配置完整'],
      dependencies: ['pm-001'],
      blockedBy: ['pm-001'],
      blocks: ['fe-002'],
      collaboratesWith: ['tech-lead', 'backend-developer'],
      phase: '架构设计阶段',
      tags: ['架构', '技术选型', '前端'],
    });

    tasks.push({
      id: 'fe-002',
      title: '组件开发实现',
      description: '基于设计稿开发前端组件和页面',
      role: 'frontend-developer',
      category: '组件开发',
      priority: 2,
      estimatedHours: 60,
      complexity: 'high',
      skills: ['React/Vue', '组件开发', 'CSS'],
      deliverables: ['前端组件库', '页面实现', '单元测试'],
      acceptanceCriteria: ['组件功能完整正确', '页面还原度高', '代码质量良好'],
      dependencies: ['fe-001', 'ui-002'],
      blockedBy: ['fe-001', 'ui-002'],
      blocks: ['qa-001'],
      collaboratesWith: ['ui-designer', 'backend-developer'],
      phase: '开发阶段',
      tags: ['组件', '开发', '前端'],
    });

    return tasks;
  }

  /**
   * 生成后端开发任务
   */
  private generateBackendDeveloperTasks(prdDocument: PRDDocument): RoleTask[] {
    const tasks: RoleTask[] = [];

    tasks.push({
      id: 'be-001',
      title: '数据库设计',
      description: '设计数据库结构，定义数据模型和关系',
      role: 'backend-developer',
      category: '数据库设计',
      priority: 1,
      estimatedHours: 20,
      complexity: 'high',
      skills: ['数据库设计', 'SQL', '数据建模'],
      deliverables: ['数据库设计文档', 'ER图', '建表脚本'],
      acceptanceCriteria: ['数据模型设计合理', '数据库性能优化', '支持业务扩展'],
      dependencies: ['pm-001'],
      blockedBy: ['pm-001'],
      blocks: ['be-002'],
      collaboratesWith: ['tech-lead', 'data-engineer'],
      phase: '设计阶段',
      tags: ['数据库', '设计', '建模'],
    });

    tasks.push({
      id: 'be-002',
      title: 'API接口开发',
      description: '开发后端API接口，实现业务逻辑',
      role: 'backend-developer',
      category: 'API开发',
      priority: 2,
      estimatedHours: 80,
      complexity: 'high',
      skills: ['API开发', '业务逻辑', '后端框架'],
      deliverables: ['API接口', '接口文档', '单元测试'],
      acceptanceCriteria: ['API功能完整正确', '接口文档清晰', '性能满足要求'],
      dependencies: ['be-001'],
      blockedBy: ['be-001'],
      blocks: ['fe-003', 'qa-002'],
      collaboratesWith: ['frontend-developer', 'qa-engineer'],
      phase: '开发阶段',
      tags: ['API', '开发', '后端'],
    });

    return tasks;
  }

  /**
   * 生成QA工程师任务
   */
  private generateQAEngineerTasks(prdDocument: PRDDocument): RoleTask[] {
    const tasks: RoleTask[] = [];

    tasks.push({
      id: 'qa-001',
      title: '测试计划制定',
      description: '制定全面的测试计划，包括功能测试、性能测试和安全测试',
      role: 'qa-engineer',
      category: '测试计划',
      priority: 1,
      estimatedHours: 16,
      complexity: 'medium',
      skills: ['测试计划', '测试策略', '风险评估'],
      deliverables: ['测试计划文档', '测试用例设计', '测试环境规划'],
      acceptanceCriteria: ['测试计划覆盖所有功能模块', '测试用例设计完整', '测试环境需求明确'],
      dependencies: ['pm-001'],
      blockedBy: ['pm-001'],
      blocks: ['qa-002'],
      collaboratesWith: ['product-manager', 'frontend-developer', 'backend-developer'],
      phase: '测试准备阶段',
      tags: ['测试', '计划', 'QA'],
    });

    tasks.push({
      id: 'qa-002',
      title: '自动化测试框架搭建',
      description: '搭建自动化测试框架，实现持续集成测试',
      role: 'qa-engineer',
      category: '自动化测试',
      priority: 2,
      estimatedHours: 24,
      complexity: 'high',
      skills: ['自动化测试', '测试框架', 'CI/CD'],
      deliverables: ['自动化测试框架', '测试脚本', 'CI集成配置'],
      acceptanceCriteria: ['自动化测试框架可用', '测试脚本覆盖核心功能', 'CI集成正常运行'],
      dependencies: ['qa-001', 'fe-002', 'be-002'],
      blockedBy: ['qa-001', 'fe-002', 'be-002'],
      blocks: [],
      collaboratesWith: ['devops-engineer', 'frontend-developer', 'backend-developer'],
      phase: '测试实施阶段',
      tags: ['自动化', '测试', '框架'],
    });

    return tasks;
  }

  /**
   * 生成DevOps工程师任务
   */
  private generateDevOpsEngineerTasks(prdDocument: PRDDocument): RoleTask[] {
    const tasks: RoleTask[] = [];

    tasks.push({
      id: 'devops-001',
      title: 'CI/CD流水线搭建',
      description: '搭建完整的CI/CD流水线，实现自动化构建、测试和部署',
      role: 'devops-engineer',
      category: 'CI/CD',
      priority: 1,
      estimatedHours: 20,
      complexity: 'high',
      skills: ['CI/CD', 'Docker', 'Kubernetes', '自动化部署'],
      deliverables: ['CI/CD配置', '部署脚本', '监控配置'],
      acceptanceCriteria: ['CI/CD流水线正常运行', '自动化部署成功', '监控告警配置完成'],
      dependencies: ['be-001', 'fe-001'],
      blockedBy: ['be-001', 'fe-001'],
      blocks: ['devops-002'],
      collaboratesWith: ['backend-developer', 'frontend-developer', 'qa-engineer'],
      phase: '基础设施阶段',
      tags: ['CI/CD', '部署', '自动化'],
    });

    tasks.push({
      id: 'devops-002',
      title: '生产环境部署',
      description: '配置和部署生产环境，确保高可用性和安全性',
      role: 'devops-engineer',
      category: '环境部署',
      priority: 2,
      estimatedHours: 16,
      complexity: 'high',
      skills: ['云平台', '安全配置', '负载均衡', '监控'],
      deliverables: ['生产环境', '安全配置', '监控系统'],
      acceptanceCriteria: ['生产环境稳定运行', '安全配置符合标准', '监控系统正常工作'],
      dependencies: ['devops-001'],
      blockedBy: ['devops-001'],
      blocks: [],
      collaboratesWith: ['security-engineer', 'backend-developer'],
      phase: '部署阶段',
      tags: ['生产', '部署', '监控'],
    });

    return tasks;
  }

  /**
   * 生成技术负责人任务
   */
  private generateTechLeadTasks(prdDocument: PRDDocument): RoleTask[] {
    const tasks: RoleTask[] = [];

    tasks.push({
      id: 'tl-001',
      title: '技术架构设计',
      description: '设计整体技术架构，制定技术选型和开发规范',
      role: 'tech-lead',
      category: '架构设计',
      priority: 1,
      estimatedHours: 24,
      complexity: 'high',
      skills: ['系统架构', '技术选型', '设计模式', '性能优化'],
      deliverables: ['技术架构文档', '技术选型报告', '开发规范'],
      acceptanceCriteria: ['技术架构设计合理', '技术选型符合需求', '开发规范完整'],
      dependencies: ['pm-001'],
      blockedBy: ['pm-001'],
      blocks: ['fe-001', 'be-001'],
      collaboratesWith: ['product-manager', 'frontend-developer', 'backend-developer'],
      phase: '架构设计阶段',
      tags: ['架构', '技术选型', '规范'],
    });

    tasks.push({
      id: 'tl-002',
      title: '代码评审和质量控制',
      description: '建立代码评审流程，确保代码质量和技术标准',
      role: 'tech-lead',
      category: '质量控制',
      priority: 2,
      estimatedHours: 12,
      complexity: 'medium',
      skills: ['代码评审', '质量标准', '团队管理', '技术指导'],
      deliverables: ['代码评审流程', '质量标准文档', '评审报告'],
      acceptanceCriteria: ['代码评审流程建立', '质量标准明确', '团队遵循规范'],
      dependencies: ['tl-001'],
      blockedBy: ['tl-001'],
      blocks: [],
      collaboratesWith: ['frontend-developer', 'backend-developer', 'qa-engineer'],
      phase: '开发阶段',
      tags: ['代码评审', '质量', '管理'],
    });

    return tasks;
  }

  /**
   * 生成项目经理任务
   */
  private generateProjectManagerTasks(prdDocument: PRDDocument): RoleTask[] {
    const tasks: RoleTask[] = [];

    tasks.push({
      id: 'pjm-001',
      title: '项目计划制定',
      description: '制定详细的项目计划，包括时间线、资源分配和风险管理',
      role: 'project-manager',
      category: '项目管理',
      priority: 1,
      estimatedHours: 16,
      complexity: 'medium',
      skills: ['项目管理', '资源规划', '风险管理', '进度控制'],
      deliverables: ['项目计划', '资源分配表', '风险管理计划'],
      acceptanceCriteria: ['项目计划详细可执行', '资源分配合理', '风险识别充分'],
      dependencies: ['pm-001', 'tl-001'],
      blockedBy: ['pm-001', 'tl-001'],
      blocks: ['pjm-002'],
      collaboratesWith: ['product-manager', 'tech-lead'],
      phase: '项目启动阶段',
      tags: ['项目计划', '资源', '风险'],
    });

    tasks.push({
      id: 'pjm-002',
      title: '项目进度跟踪',
      description: '跟踪项目进度，协调团队资源，确保项目按时交付',
      role: 'project-manager',
      category: '进度管理',
      priority: 2,
      estimatedHours: 40,
      complexity: 'medium',
      skills: ['进度跟踪', '团队协调', '沟通管理', '问题解决'],
      deliverables: ['进度报告', '团队协调记录', '问题解决方案'],
      acceptanceCriteria: ['进度跟踪及时准确', '团队协调有效', '问题及时解决'],
      dependencies: ['pjm-001'],
      blockedBy: ['pjm-001'],
      blocks: [],
      collaboratesWith: ['product-manager', 'tech-lead', 'qa-engineer'],
      phase: '项目执行阶段',
      tags: ['进度', '协调', '管理'],
    });

    return tasks;
  }

  // 其他角色的任务生成方法
  private generateFullstackDeveloperTasks(prdDocument: PRDDocument): RoleTask[] {
    // 全栈开发者任务结合前后端任务
    const frontendTasks = this.generateFrontendDeveloperTasks(prdDocument);
    const backendTasks = this.generateBackendDeveloperTasks(prdDocument);

    // 修改任务ID和角色
    const fullstackTasks = [...frontendTasks, ...backendTasks].map((task, index) => ({
      ...task,
      id: `fs-${String(index + 1).padStart(3, '0')}`,
      role: 'fullstack-developer' as TeamRole,
      collaboratesWith: ['ui-designer', 'ux-designer', 'qa-engineer', 'devops-engineer'] as TeamRole[],
    }));

    return fullstackTasks;
  }

  private generateMobileDeveloperTasks(prdDocument: PRDDocument): RoleTask[] {
    const tasks: RoleTask[] = [];

    tasks.push({
      id: 'mob-001',
      title: '移动端架构设计',
      description: '设计移动应用架构，选择合适的技术栈和开发框架',
      role: 'mobile-developer',
      category: '架构设计',
      priority: 1,
      estimatedHours: 16,
      complexity: 'high',
      skills: ['移动架构', 'React Native/Flutter', '性能优化'],
      deliverables: ['移动架构文档', '技术选型报告', '开发环境'],
      acceptanceCriteria: ['架构设计合理', '技术选型适合', '开发环境配置完成'],
      dependencies: ['pm-001', 'tl-001'],
      blockedBy: ['pm-001', 'tl-001'],
      blocks: ['mob-002'],
      collaboratesWith: ['ui-designer', 'ux-designer', 'backend-developer'],
      phase: '架构设计阶段',
      tags: ['移动', '架构', '技术选型'],
    });

    return tasks;
  }

  private generateGenericTasks(role: TeamRole, prdDocument: PRDDocument): RoleTask[] {
    const roleDefinition = RoleDefinitions.getRoleDefinition(role);
    const tasks: RoleTask[] = [];

    // 为未特别定义的角色生成通用任务
    tasks.push({
      id: `${role.substring(0, 3)}-001`,
      title: `${roleDefinition.name.zh}需求分析`,
      description: `从${roleDefinition.name.zh}角度分析项目需求，制定工作计划`,
      role,
      category: '需求分析',
      priority: 1,
      estimatedHours: 8,
      complexity: 'medium',
      skills: roleDefinition.skills.slice(0, 3),
      deliverables: ['需求分析报告', '工作计划'],
      acceptanceCriteria: ['需求理解准确', '工作计划可执行'],
      dependencies: ['pm-001'],
      blockedBy: ['pm-001'],
      blocks: [],
      collaboratesWith: roleDefinition.collaboratesWith,
      phase: '需求分析阶段',
      tags: [roleDefinition.name.zh, '需求', '分析'],
    });

    return tasks;
  }

  /**
   * 生成跨角色协作任务
   */
  private async generateCrossRoleTasks(prdDocument: PRDDocument): Promise<CrossRoleTask[]> {
    const crossRoleTasks: CrossRoleTask[] = [];

    // 设计评审会议
    crossRoleTasks.push({
      id: 'cross-001',
      title: '设计评审会议',
      description: '产品、设计、开发团队共同评审设计方案',
      involvedRoles: ['product-manager', 'ui-designer', 'ux-designer', 'frontend-developer'],
      coordinator: 'product-manager',
      type: 'review',
      estimatedHours: 4,
      deliverables: ['设计评审报告', '修改建议清单'],
      dependencies: ['ui-002', 'ux-002'],
    });

    // 技术方案评审
    crossRoleTasks.push({
      id: 'cross-002',
      title: '技术方案评审',
      description: '技术团队评审前后端架构和集成方案',
      involvedRoles: ['tech-lead', 'frontend-developer', 'backend-developer', 'devops-engineer'],
      coordinator: 'tech-lead',
      type: 'review',
      estimatedHours: 6,
      deliverables: ['技术方案评审报告', '架构优化建议'],
      dependencies: ['fe-001', 'be-001'],
    });

    return crossRoleTasks;
  }

  /**
   * 生成里程碑
   */
  private async generateMilestones(prdDocument: PRDDocument): Promise<Milestone[]> {
    const milestones: Milestone[] = [];

    milestones.push({
      id: 'milestone-001',
      name: '需求分析完成',
      description: '所有需求分析和设计工作完成',
      criteria: ['需求分析报告完成', '设计方案确定', '技术方案评审通过'],
      involvedRoles: ['product-manager', 'ui-designer', 'ux-designer', 'tech-lead'],
      dependencies: ['pm-001', 'ui-001', 'ux-001'],
      deliverables: ['需求分析报告', '设计方案', '技术方案'],
    });

    milestones.push({
      id: 'milestone-002',
      name: '开发阶段完成',
      description: '所有开发工作完成，准备测试',
      criteria: ['前端开发完成', '后端开发完成', '集成测试通过'],
      involvedRoles: ['frontend-developer', 'backend-developer', 'qa-engineer'],
      dependencies: ['fe-002', 'be-002'],
      deliverables: ['前端应用', '后端服务', '集成测试报告'],
    });

    return milestones;
  }

  /**
   * 生成任务工作流
   */
  private async generateTaskWorkflow(
    roleBasedTasks: Record<TeamRole, RoleTask[]>,
    crossRoleTasks: CrossRoleTask[],
    milestones: Milestone[]
  ): Promise<TaskWorkflow> {
    // 生成工作流阶段
    const phases = this.generateWorkflowPhases(roleBasedTasks, crossRoleTasks);

    // 计算关键路径
    const criticalPath = this.calculateCriticalPath(roleBasedTasks);

    // 识别并行执行轨道
    const parallelTracks = this.identifyParallelTracks(roleBasedTasks);

    // 生成交接点
    const handoffPoints = this.generateHandoffPoints(roleBasedTasks);

    return {
      phases,
      criticalPath,
      parallelTracks,
      handoffPoints,
    };
  }

  /**
   * 生成工作流阶段
   */
  private generateWorkflowPhases(
    roleBasedTasks: Record<TeamRole, RoleTask[]>,
    crossRoleTasks: CrossRoleTask[]
  ): WorkflowPhase[] {
    const phases: WorkflowPhase[] = [];

    // 需求分析阶段
    phases.push({
      id: 'phase-001',
      name: '需求分析阶段',
      description: '产品需求分析、用户研究和技术可行性评估',
      duration: '1-2周',
      involvedRoles: ['product-manager', 'ux-designer', 'tech-lead'],
      deliverables: ['需求分析报告', '用户研究报告', '技术可行性报告'],
      dependencies: [],
      parallelizable: false,
    });

    // 设计阶段
    phases.push({
      id: 'phase-002',
      name: '设计阶段',
      description: 'UI/UX设计、技术架构设计和数据库设计',
      duration: '2-3周',
      involvedRoles: ['ui-designer', 'ux-designer', 'tech-lead', 'backend-developer'],
      deliverables: ['设计系统', '交互原型', '技术架构文档', '数据库设计'],
      dependencies: ['phase-001'],
      parallelizable: true,
    });

    // 开发阶段
    phases.push({
      id: 'phase-003',
      name: '开发阶段',
      description: '前后端开发、移动端开发和系统集成',
      duration: '4-8周',
      involvedRoles: ['frontend-developer', 'backend-developer', 'mobile-developer', 'fullstack-developer'],
      deliverables: ['前端应用', '后端服务', '移动应用', 'API接口'],
      dependencies: ['phase-002'],
      parallelizable: true,
    });

    // 测试阶段
    phases.push({
      id: 'phase-004',
      name: '测试阶段',
      description: '功能测试、性能测试、安全测试和用户验收测试',
      duration: '2-3周',
      involvedRoles: ['qa-engineer', 'product-manager', 'security-engineer'],
      deliverables: ['测试报告', '缺陷修复', '性能优化', '安全评估'],
      dependencies: ['phase-003'],
      parallelizable: false,
    });

    // 部署阶段
    phases.push({
      id: 'phase-005',
      name: '部署阶段',
      description: '生产环境部署、监控配置和上线准备',
      duration: '1周',
      involvedRoles: ['devops-engineer', 'backend-developer', 'project-manager'],
      deliverables: ['生产环境', '监控系统', '部署文档'],
      dependencies: ['phase-004'],
      parallelizable: false,
    });

    return phases;
  }

  /**
   * 计算关键路径
   */
  private calculateCriticalPath(roleBasedTasks: Record<TeamRole, RoleTask[]>): string[] {
    const criticalPath: string[] = [];
    const allTasks = Object.values(roleBasedTasks).flat();

    // 简化的关键路径计算：找出依赖链最长的路径
    const taskMap = new Map(allTasks.map((task) => [task.id, task]));
    const visited = new Set<string>();

    // 从没有依赖的任务开始
    const startTasks = allTasks.filter((task) => task.dependencies.length === 0);

    for (const startTask of startTasks) {
      const path = this.findLongestPath(startTask, taskMap, visited);
      if (path.length > criticalPath.length) {
        criticalPath.splice(0, criticalPath.length, ...path);
      }
    }

    return criticalPath;
  }

  /**
   * 找到最长路径（递归）
   */
  private findLongestPath(task: RoleTask, taskMap: Map<string, RoleTask>, visited: Set<string>): string[] {
    if (visited.has(task.id)) {
      return [];
    }

    visited.add(task.id);
    let longestPath = [task.id];

    // 找到所有被当前任务阻塞的任务
    const blockedTasks = Array.from(taskMap.values()).filter((t) => t.dependencies.includes(task.id));

    for (const blockedTask of blockedTasks) {
      const path = this.findLongestPath(blockedTask, taskMap, visited);
      if (path.length + 1 > longestPath.length) {
        longestPath = [task.id, ...path];
      }
    }

    visited.delete(task.id);
    return longestPath;
  }

  /**
   * 识别并行执行轨道
   */
  private identifyParallelTracks(roleBasedTasks: Record<TeamRole, RoleTask[]>): ParallelTrack[] {
    const parallelTracks: ParallelTrack[] = [];

    // 设计阶段并行轨道
    parallelTracks.push({
      id: 'track-design',
      name: '设计并行轨道',
      tasks: ['ui-001', 'ui-002', 'ux-001', 'ux-002'],
      roles: ['ui-designer', 'ux-designer'],
      canRunInParallel: true,
    });

    // 开发阶段并行轨道
    parallelTracks.push({
      id: 'track-development',
      name: '开发并行轨道',
      tasks: ['fe-002', 'be-002', 'mob-001'],
      roles: ['frontend-developer', 'backend-developer', 'mobile-developer'],
      canRunInParallel: true,
    });

    // 基础设施并行轨道
    parallelTracks.push({
      id: 'track-infrastructure',
      name: '基础设施并行轨道',
      tasks: ['devops-001', 'devops-002'],
      roles: ['devops-engineer'],
      canRunInParallel: false,
    });

    return parallelTracks;
  }

  /**
   * 生成交接点
   */
  private generateHandoffPoints(roleBasedTasks: Record<TeamRole, RoleTask[]>): HandoffPoint[] {
    const handoffPoints: HandoffPoint[] = [];

    // 产品到设计的交接
    handoffPoints.push({
      id: 'handoff-001',
      from: 'product-manager',
      to: 'ui-designer',
      deliverable: '需求分析报告和用户故事',
      criteria: ['需求明确完整', '用户故事符合INVEST原则', '验收标准清晰'],
      estimatedTime: '1天',
    });

    handoffPoints.push({
      id: 'handoff-002',
      from: 'product-manager',
      to: 'ux-designer',
      deliverable: '用户研究报告和交互需求',
      criteria: ['用户画像准确', '交互需求明确', '用户旅程完整'],
      estimatedTime: '1天',
    });

    // 设计到开发的交接
    handoffPoints.push({
      id: 'handoff-003',
      from: 'ui-designer',
      to: 'frontend-developer',
      deliverable: '设计稿和设计系统',
      criteria: ['设计稿完整', '设计系统规范', '切图资源齐全'],
      estimatedTime: '2天',
    });

    handoffPoints.push({
      id: 'handoff-004',
      from: 'ux-designer',
      to: 'frontend-developer',
      deliverable: '交互原型和流程图',
      criteria: ['交互逻辑清晰', '原型可用', '流程图准确'],
      estimatedTime: '1天',
    });

    // 后端到前端的交接
    handoffPoints.push({
      id: 'handoff-005',
      from: 'backend-developer',
      to: 'frontend-developer',
      deliverable: 'API接口和文档',
      criteria: ['API功能完整', '接口文档清晰', '测试环境可用'],
      estimatedTime: '1天',
    });

    // 开发到测试的交接
    handoffPoints.push({
      id: 'handoff-006',
      from: 'frontend-developer',
      to: 'qa-engineer',
      deliverable: '前端应用和部署包',
      criteria: ['功能开发完成', '自测通过', '部署包可用'],
      estimatedTime: '1天',
    });

    handoffPoints.push({
      id: 'handoff-007',
      from: 'backend-developer',
      to: 'qa-engineer',
      deliverable: '后端服务和API',
      criteria: ['API开发完成', '单元测试通过', '服务稳定运行'],
      estimatedTime: '1天',
    });

    return handoffPoints;
  }
}
