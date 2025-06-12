/**
 * 团队角色定义和能力映射
 * 定义各个岗位的职责、技能和协作关系
 */

import { TeamRole, RoleDefinition } from '../types.js';

export class RoleDefinitions {
  private static definitions: Record<TeamRole, RoleDefinition> = {
    'product-manager': {
      id: 'product-manager',
      name: { en: 'Product Manager', zh: '产品经理' },
      description: {
        en: 'Responsible for product strategy, requirements, and roadmap',
        zh: '负责产品策略、需求分析和产品路线图',
      },
      responsibilities: [
        '需求分析和优先级排序',
        '用户故事编写',
        '产品路线图规划',
        '跨团队协调',
        '用户体验设计指导',
        '产品验收测试',
      ],
      skills: ['需求分析', '用户研究', '产品设计', '项目管理', '数据分析', '沟通协调'],
      taskTypes: ['需求分析', '用户故事', '产品规划', '验收测试', '用户调研', '竞品分析'],
      collaboratesWith: ['ui-designer', 'ux-designer', 'tech-lead', 'project-manager'],
      priority: 1,
    },

    'ui-designer': {
      id: 'ui-designer',
      name: { en: 'UI Designer', zh: 'UI设计师' },
      description: {
        en: 'Creates visual designs and user interfaces',
        zh: '负责视觉设计和用户界面设计',
      },
      responsibilities: ['界面视觉设计', '设计系统建立', '图标和插画设计', '品牌视觉规范', '设计资产管理', '设计评审'],
      skills: ['Figma/Sketch', '视觉设计', '色彩理论', '排版设计', '品牌设计', '设计系统'],
      taskTypes: ['界面设计', '视觉规范', '图标设计', '设计系统', '原型制作', '设计评审'],
      collaboratesWith: ['ux-designer', 'product-manager', 'frontend-developer'],
      priority: 2,
    },

    'ux-designer': {
      id: 'ux-designer',
      name: { en: 'UX Designer', zh: 'UX设计师' },
      description: {
        en: 'Designs user experiences and interaction flows',
        zh: '负责用户体验设计和交互流程设计',
      },
      responsibilities: ['用户体验研究', '交互流程设计', '信息架构设计', '可用性测试', '用户旅程映射', '原型设计'],
      skills: ['用户研究', '交互设计', '信息架构', '可用性测试', '原型设计', '用户心理学'],
      taskTypes: ['用户研究', '交互设计', '信息架构', '可用性测试', '用户旅程', '原型设计'],
      collaboratesWith: ['ui-designer', 'product-manager', 'frontend-developer'],
      priority: 2,
    },

    'frontend-developer': {
      id: 'frontend-developer',
      name: { en: 'Frontend Developer', zh: '前端开发工程师' },
      description: {
        en: 'Develops user-facing applications and interfaces',
        zh: '负责用户界面和前端应用开发',
      },
      responsibilities: ['前端页面开发', '用户交互实现', '前端架构设计', '性能优化', '跨浏览器兼容', '前端测试'],
      skills: ['HTML/CSS/JavaScript', 'React/Vue/Angular', '前端工程化', '性能优化', '响应式设计', '前端测试'],
      taskTypes: ['页面开发', '组件开发', '交互实现', '性能优化', '兼容性测试', '前端架构'],
      collaboratesWith: ['ui-designer', 'ux-designer', 'backend-developer', 'qa-engineer'],
      priority: 3,
    },

    'backend-developer': {
      id: 'backend-developer',
      name: { en: 'Backend Developer', zh: '后端开发工程师' },
      description: {
        en: 'Develops server-side applications and APIs',
        zh: '负责服务端应用和API开发',
      },
      responsibilities: ['API接口开发', '数据库设计', '业务逻辑实现', '系统架构设计', '性能优化', '安全实现'],
      skills: ['Java/Python/Node.js', '数据库设计', 'API设计', '微服务架构', '缓存策略', '安全开发'],
      taskTypes: ['API开发', '数据库设计', '业务逻辑', '系统架构', '性能优化', '安全实现'],
      collaboratesWith: ['frontend-developer', 'data-engineer', 'devops-engineer', 'qa-engineer'],
      priority: 3,
    },

    'fullstack-developer': {
      id: 'fullstack-developer',
      name: { en: 'Fullstack Developer', zh: '全栈开发工程师' },
      description: {
        en: 'Develops both frontend and backend applications',
        zh: '负责前后端全栈开发',
      },
      responsibilities: ['全栈应用开发', '前后端集成', '数据流设计', '端到端测试', '技术选型', '架构设计'],
      skills: ['前端技术栈', '后端技术栈', '数据库技术', '系统集成', 'DevOps基础', '全栈架构'],
      taskTypes: ['全栈开发', '系统集成', '端到端实现', '技术选型', '架构设计', '集成测试'],
      collaboratesWith: ['ui-designer', 'ux-designer', 'devops-engineer', 'qa-engineer'],
      priority: 3,
    },

    'mobile-developer': {
      id: 'mobile-developer',
      name: { en: 'Mobile Developer', zh: '移动端开发工程师' },
      description: {
        en: 'Develops mobile applications for iOS and Android',
        zh: '负责iOS和Android移动应用开发',
      },
      responsibilities: ['移动应用开发', '平台适配', '性能优化', '用户体验实现', '应用发布', '移动端测试'],
      skills: ['iOS/Android开发', 'React Native/Flutter', '移动端架构', '性能优化', '应用商店发布', '移动端测试'],
      taskTypes: ['移动应用开发', '平台适配', '性能优化', '用户体验', '应用发布', '移动测试'],
      collaboratesWith: ['ui-designer', 'ux-designer', 'backend-developer', 'qa-engineer'],
      priority: 3,
    },

    'devops-engineer': {
      id: 'devops-engineer',
      name: { en: 'DevOps Engineer', zh: 'DevOps工程师' },
      description: {
        en: 'Manages infrastructure, deployment, and operations',
        zh: '负责基础设施、部署和运维',
      },
      responsibilities: ['CI/CD流水线', '基础设施管理', '监控告警', '自动化部署', '容器化', '安全运维'],
      skills: ['Docker/Kubernetes', 'CI/CD工具', '云平台', '监控工具', '自动化脚本', '安全运维'],
      taskTypes: ['环境搭建', 'CI/CD配置', '监控部署', '自动化脚本', '容器化', '运维优化'],
      collaboratesWith: ['backend-developer', 'security-engineer', 'qa-engineer'],
      priority: 4,
    },

    'qa-engineer': {
      id: 'qa-engineer',
      name: { en: 'QA Engineer', zh: '测试工程师' },
      description: {
        en: 'Ensures software quality through testing',
        zh: '负责软件质量保证和测试',
      },
      responsibilities: ['测试计划制定', '功能测试', '自动化测试', '性能测试', '缺陷管理', '质量评估'],
      skills: ['测试理论', '自动化测试', '性能测试', '测试工具', '缺陷跟踪', '质量管理'],
      taskTypes: ['测试计划', '功能测试', '自动化测试', '性能测试', '缺陷验证', '质量报告'],
      collaboratesWith: ['frontend-developer', 'backend-developer', 'mobile-developer'],
      priority: 4,
    },

    'data-engineer': {
      id: 'data-engineer',
      name: { en: 'Data Engineer', zh: '数据工程师' },
      description: {
        en: 'Builds and maintains data infrastructure',
        zh: '负责数据基础设施建设和维护',
      },
      responsibilities: ['数据管道建设', '数据仓库设计', '数据质量保证', 'ETL流程开发', '数据监控', '数据安全'],
      skills: ['数据库技术', '大数据技术', 'ETL工具', '数据建模', '数据质量', '数据安全'],
      taskTypes: ['数据建模', 'ETL开发', '数据管道', '数据质量', '数据监控', '数据安全'],
      collaboratesWith: ['backend-developer', 'security-engineer'],
      priority: 5,
    },

    'security-engineer': {
      id: 'security-engineer',
      name: { en: 'Security Engineer', zh: '安全工程师' },
      description: {
        en: 'Ensures system security and compliance',
        zh: '负责系统安全和合规性',
      },
      responsibilities: ['安全架构设计', '安全评估', '漏洞扫描', '安全监控', '合规检查', '安全培训'],
      skills: ['安全架构', '渗透测试', '安全工具', '合规标准', '安全监控', '风险评估'],
      taskTypes: ['安全设计', '安全评估', '漏洞扫描', '安全监控', '合规检查', '安全加固'],
      collaboratesWith: ['backend-developer', 'devops-engineer', 'data-engineer'],
      priority: 5,
    },

    'tech-lead': {
      id: 'tech-lead',
      name: { en: 'Tech Lead', zh: '技术负责人' },
      description: {
        en: 'Provides technical leadership and architecture guidance',
        zh: '负责技术领导和架构指导',
      },
      responsibilities: ['技术架构设计', '技术选型', '代码评审', '团队指导', '技术规范', '技术风险评估'],
      skills: ['架构设计', '技术选型', '团队管理', '代码评审', '技术规范', '风险评估'],
      taskTypes: ['架构设计', '技术选型', '代码评审', '技术规范', '团队指导', '风险评估'],
      collaboratesWith: ['product-manager', 'project-manager', 'backend-developer', 'frontend-developer'],
      priority: 1,
    },

    'project-manager': {
      id: 'project-manager',
      name: { en: 'Project Manager', zh: '项目经理' },
      description: {
        en: 'Manages project timeline, resources, and coordination',
        zh: '负责项目进度、资源和协调管理',
      },
      responsibilities: ['项目计划制定', '进度跟踪', '资源协调', '风险管理', '沟通协调', '项目报告'],
      skills: ['项目管理', '进度控制', '资源管理', '风险管理', '沟通协调', '项目工具'],
      taskTypes: ['项目计划', '进度跟踪', '资源协调', '风险管理', '团队协调', '项目报告'],
      collaboratesWith: ['product-manager', 'tech-lead'],
      priority: 1,
    },
  };

  /**
   * 获取角色定义
   * @param role 角色类型
   * @returns 角色定义
   */
  static getRoleDefinition(role: TeamRole): RoleDefinition {
    return this.definitions[role];
  }

  /**
   * 获取所有角色定义
   * @returns 所有角色定义
   */
  static getAllRoleDefinitions(): Record<TeamRole, RoleDefinition> {
    return this.definitions;
  }

  /**
   * 获取角色的协作伙伴
   * @param role 角色类型
   * @returns 协作伙伴列表
   */
  static getCollaborators(role: TeamRole): TeamRole[] {
    return this.definitions[role].collaboratesWith;
  }

  /**
   * 获取按优先级排序的角色
   * @returns 按优先级排序的角色列表
   */
  static getRolesByPriority(): TeamRole[] {
    return Object.values(this.definitions)
      .sort((a, b) => a.priority - b.priority)
      .map((def) => def.id);
  }

  /**
   * 获取核心角色（优先级1-3）
   * @returns 核心角色列表
   */
  static getCoreRoles(): TeamRole[] {
    return Object.values(this.definitions)
      .filter((def) => def.priority <= 3)
      .map((def) => def.id);
  }

  /**
   * 获取支持角色（优先级4-5）
   * @returns 支持角色列表
   */
  static getSupportRoles(): TeamRole[] {
    return Object.values(this.definitions)
      .filter((def) => def.priority >= 4)
      .map((def) => def.id);
  }
}
