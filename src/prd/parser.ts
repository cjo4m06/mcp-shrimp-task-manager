/**
 * PRD 文档解析器
 * 解析 PRD 文档并提取结构化信息，支持团队协作分析
 */

import {
  PRDDocument,
  PRDContent,
  PRDMetadata,
  PRDAnalysis,
  UserStory,
  FunctionalRequirement,
  NonFunctionalRequirement,
  ProjectType,
  TechStack,
  TeamRole,
  ProjectComplexity,
  TeamComposition,
  Component,
  WorkflowPhase,
  PRDParsingOptions,
} from './types.js';
import { RoleDefinitions } from './roles/RoleDefinitions.js';

export class PRDParser {
  private options: PRDParsingOptions;

  constructor(options: Partial<PRDParsingOptions> = {}) {
    this.options = {
      language: 'zh',
      includeAnalysis: true,
      generateTasks: true,
      ...options,
    };
  }

  /**
   * 解析 PRD 文档
   * @param content PRD 文档内容
   * @param metadata 可选的元数据
   * @returns 解析后的 PRD 文档
   */
  async parseDocument(content: string, metadata?: Partial<PRDMetadata>): Promise<PRDDocument> {
    const parsedContent = this.parseContent(content);
    const documentMetadata = this.extractMetadata(content, metadata);

    let analysis: PRDAnalysis | undefined;
    if (this.options.includeAnalysis) {
      analysis = await this.analyzeDocument(parsedContent, documentMetadata);
    }

    return {
      metadata: documentMetadata,
      content: parsedContent,
      analysis,
    };
  }

  /**
   * 解析 PRD 内容
   * @param content 原始内容
   * @returns 结构化的 PRD 内容
   */
  private parseContent(content: string): PRDContent {
    const sections = this.extractSections(content);

    return {
      overview: sections.overview || '',
      objectives: this.extractObjectives(sections.objectives || ''),
      targetAudience: sections.targetAudience || '',
      userStories: this.extractUserStories(sections.userStories || ''),
      functionalRequirements: this.extractFunctionalRequirements(sections.functionalRequirements || ''),
      nonFunctionalRequirements: this.extractNonFunctionalRequirements(sections.nonFunctionalRequirements || ''),
      constraints: this.extractList(sections.constraints || ''),
      assumptions: this.extractList(sections.assumptions || ''),
      dependencies: this.extractList(sections.dependencies || ''),
      successMetrics: this.extractList(sections.successMetrics || ''),
    };
  }

  /**
   * 提取文档各个部分
   * @param content 文档内容
   * @returns 各部分内容映射
   */
  private extractSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];

    // 定义常见的章节标题模式
    const sectionPatterns = {
      overview: /^#+\s*(概述|概览|项目概述|产品概述|overview|introduction)/i,
      objectives: /^#+\s*(目标|项目目标|产品目标|objectives|goals)/i,
      targetAudience: /^#+\s*(目标用户|用户群体|target\s*audience|users)/i,
      userStories: /^#+\s*(用户故事|用户需求|user\s*stories|requirements)/i,
      functionalRequirements: /^#+\s*(功能需求|功能要求|functional\s*requirements)/i,
      nonFunctionalRequirements: /^#+\s*(非功能需求|性能要求|non[\-\s]*functional\s*requirements)/i,
      constraints: /^#+\s*(约束|限制|constraints|limitations)/i,
      assumptions: /^#+\s*(假设|前提|assumptions)/i,
      dependencies: /^#+\s*(依赖|依赖关系|dependencies)/i,
      successMetrics: /^#+\s*(成功指标|验收标准|success\s*metrics|acceptance\s*criteria)/i,
    };

    for (const line of lines) {
      let matchedSection = '';

      // 检查是否匹配任何章节标题
      for (const [section, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(line)) {
          matchedSection = section;
          break;
        }
      }

      if (matchedSection) {
        // 保存前一个章节
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }

        // 开始新章节
        currentSection = matchedSection;
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    // 保存最后一个章节
    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }

  /**
   * 提取目标列表
   * @param content 目标内容
   * @returns 目标数组
   */
  private extractObjectives(content: string): string[] {
    return this.extractList(content);
  }

  /**
   * 提取用户故事
   * @param content 用户故事内容
   * @returns 用户故事数组
   */
  private extractUserStories(content: string): UserStory[] {
    const stories: UserStory[] = [];
    const storyBlocks = this.extractStoryBlocks(content);

    for (let i = 0; i < storyBlocks.length; i++) {
      const block = storyBlocks[i];
      const story = this.parseUserStory(block, i + 1);
      if (story) {
        stories.push(story);
      }
    }

    return stories;
  }

  /**
   * 解析单个用户故事
   * @param block 故事块内容
   * @param index 索引
   * @returns 用户故事对象
   */
  private parseUserStory(block: string, index: number): UserStory | null {
    const lines = block.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return null;

    const title = lines[0].replace(/^#+\s*/, '').trim();
    const description = lines.slice(1).join('\n').trim();

    // 提取验收标准
    const acceptanceCriteria = this.extractAcceptanceCriteria(description);

    // 分析涉及的角色
    const involvedRoles = this.analyzeInvolvedRoles(description);

    return {
      id: `story-${index}`,
      title,
      description,
      persona: this.extractPersona(description),
      acceptanceCriteria,
      priority: this.estimatePriority(description),
      estimatedEffort: this.estimateEffort(description),
      involvedRoles,
    };
  }

  /**
   * 提取功能需求
   * @param content 功能需求内容
   * @returns 功能需求数组
   */
  private extractFunctionalRequirements(content: string): FunctionalRequirement[] {
    const requirements: FunctionalRequirement[] = [];
    const reqBlocks = this.extractRequirementBlocks(content);

    for (let i = 0; i < reqBlocks.length; i++) {
      const block = reqBlocks[i];
      const requirement = this.parseFunctionalRequirement(block, i + 1);
      if (requirement) {
        requirements.push(requirement);
      }
    }

    return requirements;
  }

  /**
   * 解析功能需求
   * @param block 需求块内容
   * @param index 索引
   * @returns 功能需求对象
   */
  private parseFunctionalRequirement(block: string, index: number): FunctionalRequirement | null {
    const lines = block.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return null;

    const title = lines[0].replace(/^#+\s*/, '').trim();
    const description = lines.slice(1).join('\n').trim();

    return {
      id: `req-${index}`,
      title,
      description,
      category: this.categorizeRequirement(description),
      priority: this.estimatePriority(description),
      complexity: this.estimateComplexity(description),
      involvedRoles: this.analyzeInvolvedRoles(description),
      dependencies: this.extractDependencies(description),
    };
  }

  /**
   * 提取非功能需求
   * @param content 非功能需求内容
   * @returns 非功能需求数组
   */
  private extractNonFunctionalRequirements(content: string): NonFunctionalRequirement[] {
    const requirements: NonFunctionalRequirement[] = [];
    const reqBlocks = this.extractRequirementBlocks(content);

    for (let i = 0; i < reqBlocks.length; i++) {
      const block = reqBlocks[i];
      const requirement = this.parseNonFunctionalRequirement(block, i + 1);
      if (requirement) {
        requirements.push(requirement);
      }
    }

    return requirements;
  }

  /**
   * 解析非功能需求
   * @param block 需求块内容
   * @param index 索引
   * @returns 非功能需求对象
   */
  private parseNonFunctionalRequirement(block: string, index: number): NonFunctionalRequirement | null {
    const lines = block.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return null;

    const description = lines.join('\n').trim();
    const type = this.classifyNonFunctionalRequirement(description);

    return {
      id: `nfr-${index}`,
      type,
      description,
      metrics: this.extractMetrics(description),
      involvedRoles: this.analyzeInvolvedRoles(description),
    };
  }

  /**
   * 提取元数据
   * @param content 文档内容
   * @param provided 提供的元数据
   * @returns 完整的元数据
   */
  private extractMetadata(content: string, provided?: Partial<PRDMetadata>): PRDMetadata {
    const now = new Date();

    return {
      title: provided?.title || this.extractTitle(content),
      version: provided?.version || '1.0.0',
      author: provided?.author || 'Unknown',
      createdAt: provided?.createdAt || now,
      updatedAt: provided?.updatedAt || now,
      projectType: provided?.projectType || this.inferProjectType(content),
      techStack: provided?.techStack || this.inferTechStack(content),
      teamSize: provided?.teamSize || this.estimateTeamSize(content),
      timeline: provided?.timeline || this.estimateTimeline(content),
      priority: provided?.priority || this.estimateProjectPriority(content),
    };
  }

  /**
   * 分析文档并生成分析结果
   * @param content PRD 内容
   * @param metadata 元数据
   * @returns 分析结果
   */
  private async analyzeDocument(content: PRDContent, metadata: PRDMetadata): Promise<PRDAnalysis> {
    const complexity = this.analyzeComplexity(content, metadata);
    const recommendedTeam = this.recommendTeamComposition(content, metadata);
    const components = this.identifyComponents(content, metadata);
    const workflowPhases = this.generateWorkflowPhases(content, recommendedTeam);
    const riskAssessment = this.assessRisks(content, metadata);
    const dependencies = this.buildDependencyGraph(components);

    return {
      complexity,
      estimatedDuration: this.estimateProjectDuration(complexity, recommendedTeam),
      recommendedTeam,
      identifiedComponents: components,
      workflowPhases,
      riskAssessment,
      dependencies,
    };
  }

  // ===== 辅助方法 =====

  private extractList(content: string): string[] {
    const items: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*+]\s+/) || trimmed.match(/^\d+\.\s+/)) {
        items.push(trimmed.replace(/^[-*+\d.]\s+/, ''));
      } else if (trimmed && !trimmed.startsWith('#')) {
        items.push(trimmed);
      }
    }

    return items.filter((item) => item.length > 0);
  }

  private extractStoryBlocks(content: string): string[] {
    // 简化实现：按段落分割
    return content.split('\n\n').filter((block) => block.trim().length > 0);
  }

  private extractRequirementBlocks(content: string): string[] {
    // 简化实现：按段落分割
    return content.split('\n\n').filter((block) => block.trim().length > 0);
  }

  private extractTitle(content: string): string {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : 'Untitled PRD';
  }

  private extractPersona(description: string): string {
    const personaMatch = description.match(/作为\s*([^，,]+)/);
    return personaMatch ? personaMatch[1] : '用户';
  }

  private extractAcceptanceCriteria(description: string): string[] {
    const criteria: string[] = [];
    const lines = description.split('\n');

    for (const line of lines) {
      if (line.includes('验收标准') || line.includes('acceptance criteria')) {
        // 提取后续的列表项
        const index = lines.indexOf(line);
        for (let i = index + 1; i < lines.length; i++) {
          const nextLine = lines[i].trim();
          if (nextLine.match(/^[-*+]\s+/) || nextLine.match(/^\d+\.\s+/)) {
            criteria.push(nextLine.replace(/^[-*+\d.]\s+/, ''));
          } else if (nextLine.length === 0) {
            break;
          }
        }
        break;
      }
    }

    return criteria;
  }

  private analyzeInvolvedRoles(description: string): TeamRole[] {
    const roles: TeamRole[] = [];
    const roleKeywords = {
      'product-manager': ['产品', '需求', '用户', 'product', 'requirement'],
      'ui-designer': ['界面', '设计', '视觉', 'UI', 'design', 'visual'],
      'ux-designer': ['体验', '交互', 'UX', 'interaction', 'experience'],
      'frontend-developer': ['前端', '页面', '界面', 'frontend', 'web', 'page'],
      'backend-developer': ['后端', 'API', '数据库', 'backend', 'server', 'database'],
      'mobile-developer': ['移动', '手机', 'APP', 'mobile', 'iOS', 'Android'],
      'qa-engineer': ['测试', '质量', 'test', 'quality', 'QA'],
      'devops-engineer': ['部署', '运维', 'deploy', 'devops', 'infrastructure'],
    };

    for (const [role, keywords] of Object.entries(roleKeywords)) {
      if (keywords.some((keyword) => description.toLowerCase().includes(keyword.toLowerCase()))) {
        roles.push(role as TeamRole);
      }
    }

    return roles.length > 0 ? roles : ['product-manager']; // 默认至少包含产品经理
  }

  private estimatePriority(description: string): number {
    const highPriorityKeywords = ['重要', '关键', '核心', '必须', 'critical', 'important', 'must'];
    const lowPriorityKeywords = ['可选', '建议', '优化', 'optional', 'nice to have'];

    const text = description.toLowerCase();

    if (highPriorityKeywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      return 1;
    } else if (lowPriorityKeywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      return 3;
    }

    return 2; // 默认中等优先级
  }

  private estimateEffort(description: string): string {
    const length = description.length;
    if (length < 200) return '1-2天';
    if (length < 500) return '3-5天';
    if (length < 1000) return '1-2周';
    return '2-4周';
  }

  private estimateComplexity(description: string): 'low' | 'medium' | 'high' {
    const complexityKeywords = {
      high: ['复杂', '集成', '算法', '性能', 'complex', 'integration', 'algorithm'],
      medium: ['中等', '标准', 'standard', 'normal'],
      low: ['简单', '基础', 'simple', 'basic'],
    };

    const text = description.toLowerCase();

    if (complexityKeywords.high.some((keyword) => text.includes(keyword.toLowerCase()))) {
      return 'high';
    } else if (complexityKeywords.low.some((keyword) => text.includes(keyword.toLowerCase()))) {
      return 'low';
    }

    return 'medium';
  }

  private categorizeRequirement(description: string): string {
    const categories = {
      用户界面: ['界面', '页面', '显示', 'UI', 'interface'],
      数据处理: ['数据', '存储', '处理', 'data', 'storage'],
      业务逻辑: ['业务', '逻辑', '流程', 'business', 'logic'],
      集成: ['集成', '接口', 'API', 'integration'],
      安全: ['安全', '权限', 'security', 'permission'],
    };

    const text = description.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
        return category;
      }
    }

    return '其他';
  }

  private extractDependencies(description: string): string[] {
    // 简化实现：查找依赖关键词
    const dependencies: string[] = [];
    const dependencyPatterns = [/依赖于\s*([^，,。.]+)/g, /需要\s*([^，,。.]+)/g, /基于\s*([^，,。.]+)/g];

    for (const pattern of dependencyPatterns) {
      let match;
      while ((match = pattern.exec(description)) !== null) {
        dependencies.push(match[1].trim());
      }
    }

    return dependencies;
  }

  private classifyNonFunctionalRequirement(description: string): NonFunctionalRequirement['type'] {
    const text = description.toLowerCase();

    if (text.includes('性能') || text.includes('performance')) return 'performance';
    if (text.includes('安全') || text.includes('security')) return 'security';
    if (text.includes('可用性') || text.includes('usability')) return 'usability';
    if (text.includes('扩展') || text.includes('scalability')) return 'scalability';
    if (text.includes('可靠') || text.includes('reliability')) return 'reliability';
    if (text.includes('维护') || text.includes('maintainability')) return 'maintainability';

    return 'performance'; // 默认
  }

  private extractMetrics(description: string): string[] {
    const metrics: string[] = [];
    const metricPatterns = [
      /(\d+(?:\.\d+)?)\s*(秒|ms|毫秒|分钟|小时)/g,
      /(\d+(?:\.\d+)?)\s*%/g,
      /(\d+(?:\.\d+)?)\s*(MB|GB|KB)/g,
    ];

    for (const pattern of metricPatterns) {
      let match;
      while ((match = pattern.exec(description)) !== null) {
        metrics.push(match[0]);
      }
    }

    return metrics;
  }

  private inferProjectType(content: string): ProjectType {
    const text = content.toLowerCase();

    if (text.includes('移动') || text.includes('app') || text.includes('mobile')) return 'mobile-application';
    if (text.includes('网站') || text.includes('web') || text.includes('网页')) return 'web-application';
    if (text.includes('api') || text.includes('接口') || text.includes('服务')) return 'api-service';
    if (text.includes('数据') || text.includes('data') || text.includes('分析')) return 'data-platform';
    if (text.includes('电商') || text.includes('商城') || text.includes('购物')) return 'e-commerce';

    return 'web-application'; // 默认
  }

  private inferTechStack(content: string): TechStack {
    const text = content.toLowerCase();
    const techStack: TechStack = {};

    // 前端技术
    const frontendTechs = ['react', 'vue', 'angular', 'html', 'css', 'javascript'];
    techStack.frontend = frontendTechs.filter((tech) => text.includes(tech));

    // 后端技术
    const backendTechs = ['node.js', 'java', 'python', 'go', 'php', '.net'];
    techStack.backend = backendTechs.filter((tech) => text.includes(tech));

    // 数据库
    const databases = ['mysql', 'postgresql', 'mongodb', 'redis'];
    techStack.database = databases.filter((db) => text.includes(db));

    return techStack;
  }

  private estimateTeamSize(content: string): number {
    const complexity = content.length;
    if (complexity < 1000) return 3;
    if (complexity < 3000) return 5;
    if (complexity < 5000) return 8;
    return 12;
  }

  private estimateTimeline(content: string): string {
    const complexity = content.length;
    if (complexity < 1000) return '2-4周';
    if (complexity < 3000) return '1-3个月';
    if (complexity < 5000) return '3-6个月';
    return '6个月以上';
  }

  private estimateProjectPriority(content: string): 'low' | 'medium' | 'high' | 'critical' {
    const text = content.toLowerCase();

    if (text.includes('紧急') || text.includes('critical') || text.includes('urgent')) return 'critical';
    if (text.includes('重要') || text.includes('important') || text.includes('high')) return 'high';
    if (text.includes('一般') || text.includes('normal') || text.includes('medium')) return 'medium';

    return 'medium'; // 默认
  }

  // 这些方法的具体实现将在后续步骤中完成
  private analyzeComplexity(content: PRDContent, metadata: PRDMetadata): ProjectComplexity {
    // 简化实现
    return {
      overall: 'medium',
      technical: 5,
      business: 5,
      integration: 5,
      factors: ['标准复杂度项目'],
    };
  }

  private recommendTeamComposition(content: PRDContent, metadata: PRDMetadata): TeamComposition {
    // 简化实现
    return {
      requiredRoles: ['product-manager', 'frontend-developer', 'backend-developer'],
      optionalRoles: ['ui-designer', 'qa-engineer'],
      teamSize: metadata.teamSize,
      workload: {
        'product-manager': 20,
        'frontend-developer': 40,
        'backend-developer': 40,
      } as Record<TeamRole, number>,
    };
  }

  private identifyComponents(content: PRDContent, metadata: PRDMetadata): Component[] {
    const components: Component[] = [];

    // 基于功能需求识别组件
    content.functionalRequirements.forEach((req, index) => {
      const component: Component = {
        id: `component-${index + 1}`,
        name: req.title,
        type: this.inferComponentType(req.description),
        description: req.description,
        complexity: req.complexity,
        primaryRole: this.determinePrimaryRole(req.involvedRoles),
        supportingRoles: req.involvedRoles.filter((role) => role !== this.determinePrimaryRole(req.involvedRoles)),
        dependencies: req.dependencies,
        estimatedEffort: this.estimateComponentEffort(req.complexity),
      };
      components.push(component);
    });

    return components;
  }

  private inferComponentType(description: string): Component['type'] {
    const text = description.toLowerCase();

    if (text.includes('界面') || text.includes('页面') || text.includes('ui')) return 'frontend';
    if (text.includes('api') || text.includes('服务') || text.includes('逻辑')) return 'backend';
    if (text.includes('数据库') || text.includes('存储') || text.includes('数据')) return 'database';
    if (text.includes('集成') || text.includes('接口') || text.includes('第三方')) return 'integration';
    if (text.includes('部署') || text.includes('环境') || text.includes('基础设施')) return 'infrastructure';

    return 'backend'; // 默认
  }

  private determinePrimaryRole(roles: TeamRole[]): TeamRole {
    const priorityOrder: TeamRole[] = [
      'product-manager',
      'tech-lead',
      'frontend-developer',
      'backend-developer',
      'ui-designer',
    ];

    for (const role of priorityOrder) {
      if (roles.includes(role)) {
        return role;
      }
    }

    return roles[0] || 'product-manager';
  }

  private estimateComponentEffort(complexity: 'low' | 'medium' | 'high'): number {
    const effortMap = {
      low: 3,
      medium: 8,
      high: 20,
    };
    return effortMap[complexity];
  }

  private generateWorkflowPhases(content: PRDContent, team: TeamComposition): WorkflowPhase[] {
    // 简化实现
    return [];
  }

  private assessRisks(content: PRDContent, metadata: PRDMetadata): any {
    // 简化实现
    return {
      technicalRisks: [],
      businessRisks: [],
      resourceRisks: [],
      timelineRisks: [],
    };
  }

  private buildDependencyGraph(components: Component[]): any {
    // 简化实现
    return {
      nodes: [],
      edges: [],
    };
  }

  private estimateProjectDuration(complexity: ProjectComplexity, team: TeamComposition): string {
    // 简化实现
    return '2-3个月';
  }
}
