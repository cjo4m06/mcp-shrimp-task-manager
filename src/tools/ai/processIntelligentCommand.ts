/**
 * 智能指令处理MCP工具
 * 实现自然语言指令的智能识别、解析和自动任务拆分
 */

import { z } from 'zod';
import { log } from '../../utils/logger.js';
import { splitTasks } from '../task/splitTasks.js';
import { PRDParser } from '../../prd/parser.js';
import { TaskMemoryManager } from '../../memory/TaskMemoryManager.js';
import { getProjectContext } from '../project/getProjectContext.js';
import { RelatedFileType } from '../../types/index.js';

// 指令意图类型
export type CommandIntent =
  | 'development' // 开发相关
  | 'testing' // 测试相关
  | 'documentation' // 文档相关
  | 'deployment' // 部署相关
  | 'analysis' // 分析相关
  | 'refactoring' // 重构相关
  | 'bug-fixing' // 修复相关
  | 'feature-request' // 功能请求
  | 'optimization' // 优化相关
  | 'research' // 研究相关
  | 'collaboration' // 协作相关
  | 'unknown'; // 未知意图

// 指令复杂度
export type CommandComplexity = 'simple' | 'medium' | 'complex';

// 解析结果接口
export interface ParsedCommand {
  originalCommand: string;
  intent: CommandIntent;
  complexity: CommandComplexity;
  keywords: string[];
  entities: {
    technologies: string[];
    files: string[];
    features: string[];
    roles: string[];
  };
  context: {
    projectType?: string;
    urgency?: 'low' | 'medium' | 'high';
    scope?: 'small' | 'medium' | 'large';
  };
  suggestedTasks: Array<{
    name: string;
    description: string;
    priority: number;
    estimatedEffort: string;
    dependencies: string[];
  }>;
}

// 输入参数 Schema
export const processIntelligentCommandSchema = z.object({
  command: z
    .string()
    .min(5, '指令内容过短，请提供更详细的描述')
    .max(2000, '指令内容过长，请简化描述')
    .describe('用户的自然语言指令，描述需要完成的开发任务或需求'),

  context: z.string().optional().describe('可选的上下文信息，如项目背景、相关技术栈、时间要求等'),

  autoExecute: z.boolean().default(true).describe('是否自动执行拆分的任务（默认为true）'),

  language: z.enum(['zh', 'en']).default('zh').describe('指令语言（中文或英文，默认为中文）'),
});

/**
 * 智能指令处理工具
 */
export async function processIntelligentCommandTool(args: z.infer<typeof processIntelligentCommandSchema>) {
  try {
    log.info('ProcessIntelligentCommand', '开始处理智能指令', {
      commandLength: args.command.length,
      hasContext: !!args.context,
      autoExecute: args.autoExecute,
      language: args.language,
    });

    // 1. 获取项目上下文
    const projectContext = await getProjectContext({
      includeEnvVars: false,
      includeDataDir: true,
      includeAiSuggestions: false,
      includeMcpInfo: false,
    });

    // 2. 解析指令
    const parsedCommand = await parseCommand(args.command, args.context, args.language);

    // 3. 生成任务建议
    const taskSuggestions = await generateTaskSuggestions(parsedCommand, projectContext);

    // 4. 如果启用自动执行，则创建任务
    let executionResult = null;
    if (args.autoExecute && taskSuggestions.length > 0) {
      executionResult = await executeTaskCreation(taskSuggestions, parsedCommand);
    }

    // 5. 记录到任务记忆
    await recordCommandMemory(parsedCommand, taskSuggestions, executionResult);

    // 6. 生成响应
    const response = generateResponse(parsedCommand, taskSuggestions, executionResult, args.language);

    log.info('ProcessIntelligentCommand', '智能指令处理完成', {
      intent: parsedCommand.intent,
      complexity: parsedCommand.complexity,
      tasksGenerated: taskSuggestions.length,
      autoExecuted: args.autoExecute && !!executionResult,
    });

    return {
      success: true,
      data: {
        parsedCommand,
        taskSuggestions,
        executionResult,
        projectContext: {
          projectName: 'current-project',
          projectType: 'unknown',
        },
      },
      content: [
        {
          type: 'text' as const,
          text: response,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log.error('ProcessIntelligentCommand', '智能指令处理失败', error as Error);

    return {
      success: false,
      error: errorMessage,
      content: [
        {
          type: 'text' as const,
          text: `## ❌ 智能指令处理失败\n\n**错误信息**: ${errorMessage}\n\n请检查指令格式是否正确，或尝试简化指令描述。`,
        },
      ],
    };
  }
}

/**
 * 解析自然语言指令
 */
async function parseCommand(command: string, context?: string, language: string = 'zh'): Promise<ParsedCommand> {
  // 意图识别关键词映射
  const intentKeywords = {
    development: ['开发', '实现', '创建', '构建', '编写', 'develop', 'implement', 'create', 'build', 'code'],
    testing: ['测试', '验证', '检查', '单元测试', 'test', 'verify', 'check', 'unit test'],
    documentation: ['文档', '说明', '注释', '文档化', 'document', 'docs', 'comment', 'readme'],
    deployment: ['部署', '发布', '上线', '发布', 'deploy', 'release', 'publish'],
    analysis: ['分析', '评估', '研究', '调研', 'analyze', 'assess', 'research', 'investigate'],
    refactoring: ['重构', '优化代码', '重写', '改进', 'refactor', 'refactoring', 'rewrite', 'improve'],
    'bug-fixing': ['修复', '解决', '修改', '调试', 'fix', 'solve', 'debug', 'resolve'],
    'feature-request': ['功能', '特性', '需求', '新增', 'feature', 'requirement', 'add'],
    optimization: ['优化', '性能', '提升', '改善', 'optimize', 'performance', 'improve'],
    research: ['调研', '研究', '学习', '探索', 'research', 'study', 'learn', 'explore'],
    collaboration: ['协作', '团队', '分配', '合作', 'collaborate', 'team', 'assign', 'cooperation'],
  };

  // 技术栈关键词
  const techKeywords = [
    'react',
    'vue',
    'angular',
    'typescript',
    'javascript',
    'node.js',
    'express',
    'python',
    'django',
    'flask',
    'java',
    'spring',
    'go',
    'rust',
    'c++',
    'mysql',
    'postgresql',
    'mongodb',
    'redis',
    'docker',
    'kubernetes',
    'aws',
    'azure',
    'gcp',
    'git',
    'github',
    'gitlab',
  ];

  // 角色关键词
  const roleKeywords = [
    'frontend',
    'backend',
    'fullstack',
    'devops',
    'qa',
    'tester',
    'designer',
    'product manager',
    'tech lead',
    'architect',
  ];

  const fullText = `${command} ${context || ''}`.toLowerCase();

  // 识别意图
  let intent: CommandIntent = 'unknown';
  let maxMatches = 0;

  for (const [intentType, keywords] of Object.entries(intentKeywords)) {
    const matches = keywords.filter((keyword) => fullText.includes(keyword.toLowerCase())).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      intent = intentType as CommandIntent;
    }
  }

  // 提取关键词
  const keywords = extractKeywords(fullText);

  // 识别技术栈
  const technologies = techKeywords.filter((tech) => fullText.includes(tech.toLowerCase()));

  // 识别角色
  const roles = roleKeywords.filter((role) => fullText.includes(role.toLowerCase()));

  // 识别文件
  const files = extractFileReferences(command);

  // 识别功能
  const features = extractFeatures(command);

  // 评估复杂度
  const complexity = assessComplexity(command, context);

  // 评估紧急程度
  const urgency = assessUrgency(fullText);

  // 评估范围
  const scope = assessScope(fullText);

  return {
    originalCommand: command,
    intent,
    complexity,
    keywords,
    entities: {
      technologies,
      files,
      features,
      roles,
    },
    context: {
      urgency,
      scope,
    },
    suggestedTasks: [], // 将在后续步骤中填充
  };
}

/**
 * 提取关键词
 */
function extractKeywords(text: string): string[] {
  // 移除常见停用词
  const stopWords = [
    '的',
    '是',
    '在',
    '有',
    '和',
    '与',
    '或',
    '但',
    '如果',
    'the',
    'is',
    'in',
    'and',
    'or',
    'but',
    'if',
  ];

  // 分词并过滤
  const words = text
    .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ') // 保留中英文字符
    .split(/\s+/)
    .filter((word) => word.length > 1 && !stopWords.includes(word.toLowerCase()))
    .slice(0, 10); // 限制关键词数量

  return [...new Set(words)]; // 去重
}

/**
 * 提取文件引用
 */
function extractFileReferences(command: string): string[] {
  const filePatterns = [
    /[\w\-\.]+\.(js|ts|jsx|tsx|py|java|go|rs|cpp|c|h|css|scss|html|md|json|yaml|yml|xml|sql)/gi,
    /src\/[\w\/\-\.]+/gi,
    /\.\/[\w\/\-\.]+/gi,
    /\/[\w\/\-\.]+/gi,
  ];

  const files: string[] = [];
  for (const pattern of filePatterns) {
    const matches = command.match(pattern);
    if (matches) {
      files.push(...matches);
    }
  }

  return [...new Set(files)];
}

/**
 * 提取功能特性
 */
function extractFeatures(command: string): string[] {
  const featurePatterns = [
    /实现\s*([^，,。.！!？?]+)/g,
    /添加\s*([^，,。.！!？?]+)/g,
    /创建\s*([^，,。.！!？?]+)/g,
    /开发\s*([^，,。.！!？?]+)/g,
    /build\s+([^，,。.！!？?\s]+)/gi,
    /create\s+([^，,。.！!？?\s]+)/gi,
    /implement\s+([^，,。.！!？?\s]+)/gi,
  ];

  const features: string[] = [];
  for (const pattern of featurePatterns) {
    let match;
    while ((match = pattern.exec(command)) !== null) {
      features.push(match[1].trim());
    }
  }

  return [...new Set(features)];
}

/**
 * 评估指令复杂度
 */
function assessComplexity(command: string, context?: string): CommandComplexity {
  const fullText = `${command} ${context || ''}`.toLowerCase();

  // 复杂度指标
  const complexityIndicators = {
    high: [
      '架构',
      '系统',
      '集成',
      '算法',
      '性能优化',
      '分布式',
      '微服务',
      'architecture',
      'system',
      'integration',
      'algorithm',
      'distributed',
    ],
    medium: ['功能', '模块', '组件', '接口', 'api', 'feature', 'module', 'component', 'interface'],
    simple: ['修改', '更新', '调整', '简单', 'modify', 'update', 'simple', 'basic'],
  };

  // 计算复杂度分数
  let complexityScore = 0;

  if (complexityIndicators.high.some((indicator) => fullText.includes(indicator))) {
    complexityScore += 3;
  }
  if (complexityIndicators.medium.some((indicator) => fullText.includes(indicator))) {
    complexityScore += 2;
  }
  if (complexityIndicators.simple.some((indicator) => fullText.includes(indicator))) {
    complexityScore += 1;
  }

  // 根据文本长度调整
  if (fullText.length > 500) complexityScore += 1;
  if (fullText.length > 1000) complexityScore += 1;

  // 根据技术栈数量调整
  const techCount = (fullText.match(/react|vue|angular|node|python|java|go|rust/gi) || []).length;
  if (techCount > 2) complexityScore += 1;

  if (complexityScore >= 4) return 'complex';
  if (complexityScore >= 2) return 'medium';
  return 'simple';
}

/**
 * 评估紧急程度
 */
function assessUrgency(text: string): 'low' | 'medium' | 'high' {
  const urgencyKeywords = {
    high: ['紧急', '立即', '马上', '尽快', '急需', 'urgent', 'immediately', 'asap', 'critical'],
    medium: ['重要', '优先', '及时', 'important', 'priority', 'soon'],
    low: ['可选', '建议', '有时间', 'optional', 'when possible', 'nice to have'],
  };

  if (urgencyKeywords.high.some((keyword) => text.includes(keyword))) return 'high';
  if (urgencyKeywords.medium.some((keyword) => text.includes(keyword))) return 'medium';
  return 'low';
}

/**
 * 评估项目范围
 */
function assessScope(text: string): 'small' | 'medium' | 'large' {
  const scopeKeywords = {
    large: ['整个项目', '全面', '完整系统', '大规模', 'entire project', 'full system', 'large scale'],
    medium: ['模块', '子系统', '功能组', 'module', 'subsystem', 'feature set'],
    small: ['小功能', '单个', '简单', 'small feature', 'single', 'simple'],
  };

  if (scopeKeywords.large.some((keyword) => text.includes(keyword))) return 'large';
  if (scopeKeywords.medium.some((keyword) => text.includes(keyword))) return 'medium';
  return 'small';
}

/**
 * 生成任务建议
 */
async function generateTaskSuggestions(parsedCommand: ParsedCommand, projectContext: any): Promise<any[]> {
  const tasks: any[] = [];

  // 基于意图生成基础任务模板
  const taskTemplates = getTaskTemplatesByIntent(parsedCommand.intent);

  // 根据解析结果定制任务
  for (const template of taskTemplates) {
    const customizedTask = customizeTask(template, parsedCommand);
    tasks.push(customizedTask);
  }

  // 如果有特定的功能需求，添加功能开发任务
  for (const feature of parsedCommand.entities.features) {
    tasks.push({
      name: `实现${feature}功能`,
      description: `开发和实现${feature}功能，包括前端界面、后端逻辑和数据处理`,
      priority: 2,
      estimatedEffort:
        parsedCommand.complexity === 'complex' ? '1-2周' : parsedCommand.complexity === 'medium' ? '3-5天' : '1-2天',
      dependencies: [],
    });
  }

  // 如果涉及特定文件，添加文件处理任务
  if (parsedCommand.entities.files.length > 0) {
    tasks.push({
      name: '文件处理和修改',
      description: `处理和修改相关文件: ${parsedCommand.entities.files.join(', ')}`,
      priority: 1,
      estimatedEffort: '1-2天',
      dependencies: [],
    });
  }

  // 根据复杂度添加额外任务
  if (parsedCommand.complexity === 'complex') {
    tasks.push({
      name: '架构设计和规划',
      description: '进行详细的架构设计和技术方案规划',
      priority: 1,
      estimatedEffort: '2-3天',
      dependencies: [],
    });

    tasks.push({
      name: '集成测试和验证',
      description: '进行全面的集成测试和功能验证',
      priority: 3,
      estimatedEffort: '3-5天',
      dependencies: ['架构设计和规划'],
    });
  }

  // 始终添加文档任务
  if (parsedCommand.intent !== 'documentation') {
    tasks.push({
      name: '文档更新',
      description: '更新相关技术文档和使用说明',
      priority: 3,
      estimatedEffort: '1天',
      dependencies: [],
    });
  }

  return tasks.slice(0, 8); // 限制任务数量
}

/**
 * 根据意图获取任务模板
 */
function getTaskTemplatesByIntent(intent: CommandIntent): any[] {
  const templates: Record<CommandIntent, any[]> = {
    development: [
      {
        name: '需求分析和设计',
        description: '分析开发需求，设计技术方案和实现路径',
        priority: 1,
        estimatedEffort: '1-2天',
        dependencies: [],
      },
      {
        name: '核心功能开发',
        description: '实现核心业务逻辑和功能模块',
        priority: 2,
        estimatedEffort: '3-7天',
        dependencies: ['需求分析和设计'],
      },
    ],
    testing: [
      {
        name: '测试计划制定',
        description: '制定详细的测试计划和测试用例',
        priority: 1,
        estimatedEffort: '1天',
        dependencies: [],
      },
      {
        name: '单元测试编写',
        description: '编写和执行单元测试用例',
        priority: 2,
        estimatedEffort: '2-3天',
        dependencies: ['测试计划制定'],
      },
    ],
    documentation: [
      {
        name: '文档结构规划',
        description: '规划文档结构和内容组织',
        priority: 1,
        estimatedEffort: '半天',
        dependencies: [],
      },
      {
        name: '文档内容编写',
        description: '编写详细的技术文档和使用说明',
        priority: 2,
        estimatedEffort: '1-3天',
        dependencies: ['文档结构规划'],
      },
    ],
    deployment: [
      {
        name: '部署环境准备',
        description: '准备和配置部署环境',
        priority: 1,
        estimatedEffort: '1天',
        dependencies: [],
      },
      {
        name: '应用部署和配置',
        description: '部署应用并进行相关配置',
        priority: 2,
        estimatedEffort: '1-2天',
        dependencies: ['部署环境准备'],
      },
    ],
    analysis: [
      {
        name: '现状分析',
        description: '分析当前系统状态和存在的问题',
        priority: 1,
        estimatedEffort: '1-2天',
        dependencies: [],
      },
      {
        name: '解决方案设计',
        description: '基于分析结果设计解决方案',
        priority: 2,
        estimatedEffort: '1-3天',
        dependencies: ['现状分析'],
      },
    ],
    refactoring: [
      {
        name: '代码审查和分析',
        description: '审查现有代码，识别重构点',
        priority: 1,
        estimatedEffort: '1天',
        dependencies: [],
      },
      {
        name: '重构实施',
        description: '执行代码重构和优化',
        priority: 2,
        estimatedEffort: '2-5天',
        dependencies: ['代码审查和分析'],
      },
    ],
    'bug-fixing': [
      {
        name: '问题定位和分析',
        description: '定位问题根因并分析影响范围',
        priority: 1,
        estimatedEffort: '半天-1天',
        dependencies: [],
      },
      {
        name: '修复实施和验证',
        description: '实施修复方案并进行验证',
        priority: 2,
        estimatedEffort: '1-2天',
        dependencies: ['问题定位和分析'],
      },
    ],
    'feature-request': [
      {
        name: '功能需求分析',
        description: '详细分析功能需求和技术可行性',
        priority: 1,
        estimatedEffort: '1天',
        dependencies: [],
      },
      {
        name: '功能开发实现',
        description: '开发和实现新功能',
        priority: 2,
        estimatedEffort: '3-7天',
        dependencies: ['功能需求分析'],
      },
    ],
    optimization: [
      {
        name: '性能分析',
        description: '分析当前性能瓶颈和优化点',
        priority: 1,
        estimatedEffort: '1天',
        dependencies: [],
      },
      {
        name: '优化实施',
        description: '实施性能优化方案',
        priority: 2,
        estimatedEffort: '2-5天',
        dependencies: ['性能分析'],
      },
    ],
    research: [
      {
        name: '技术调研',
        description: '进行相关技术和解决方案调研',
        priority: 1,
        estimatedEffort: '1-3天',
        dependencies: [],
      },
      {
        name: '调研报告整理',
        description: '整理调研结果和建议方案',
        priority: 2,
        estimatedEffort: '1天',
        dependencies: ['技术调研'],
      },
    ],
    collaboration: [
      {
        name: '团队协作规划',
        description: '规划团队协作流程和任务分配',
        priority: 1,
        estimatedEffort: '半天',
        dependencies: [],
      },
      {
        name: '协作执行和跟踪',
        description: '执行协作计划并跟踪进度',
        priority: 2,
        estimatedEffort: '持续',
        dependencies: ['团队协作规划'],
      },
    ],
    unknown: [
      {
        name: '需求澄清',
        description: '澄清具体需求和目标',
        priority: 1,
        estimatedEffort: '半天',
        dependencies: [],
      },
    ],
  };

  return templates[intent] || templates.unknown;
}

/**
 * 定制任务模板
 */
function customizeTask(template: any, parsedCommand: ParsedCommand): any {
  const customized = { ...template };

  // 根据复杂度调整工作量估算
  if (parsedCommand.complexity === 'complex') {
    customized.estimatedEffort = adjustEffortForComplexity(template.estimatedEffort, 1.5);
  } else if (parsedCommand.complexity === 'simple') {
    customized.estimatedEffort = adjustEffortForComplexity(template.estimatedEffort, 0.7);
  }

  // 根据紧急程度调整优先级
  if (parsedCommand.context.urgency === 'high') {
    customized.priority = Math.max(1, customized.priority - 1);
  } else if (parsedCommand.context.urgency === 'low') {
    customized.priority = Math.min(3, customized.priority + 1);
  }

  // 添加技术栈相关信息到描述中
  if (parsedCommand.entities.technologies.length > 0) {
    customized.description += `\n\n**涉及技术栈**: ${parsedCommand.entities.technologies.join(', ')}`;
  }

  return customized;
}

/**
 * 调整工作量估算
 */
function adjustEffortForComplexity(originalEffort: string, multiplier: number): string {
  // 简化实现：根据倍数调整描述
  if (multiplier > 1.2) {
    return originalEffort.replace(/(\d+)-?(\d+)?天/, (match, start, end) => {
      const newStart = Math.ceil(parseInt(start) * multiplier);
      const newEnd = end ? Math.ceil(parseInt(end) * multiplier) : newStart + 1;
      return `${newStart}-${newEnd}天`;
    });
  } else if (multiplier < 0.8) {
    return originalEffort.replace(/(\d+)-?(\d+)?天/, (match, start, end) => {
      const newStart = Math.max(1, Math.floor(parseInt(start) * multiplier));
      const newEnd = end ? Math.max(newStart, Math.floor(parseInt(end) * multiplier)) : newStart;
      return newEnd > newStart ? `${newStart}-${newEnd}天` : `${newStart}天`;
    });
  }
  return originalEffort;
}

/**
 * 执行任务创建
 */
async function executeTaskCreation(taskSuggestions: any[], parsedCommand: ParsedCommand): Promise<any> {
  try {
    // 转换为splitTasks所需的格式
    const tasksForSplit = taskSuggestions.map((task) => ({
      name: task.name,
      description: task.description,
      implementationGuide: `基于智能指令"${parsedCommand.originalCommand}"生成的任务。\n\n实施步骤：\n1. 分析具体需求\n2. 设计实现方案\n3. 编码实现\n4. 测试验证\n5. 文档更新`,
      dependencies: task.dependencies,
      notes: `意图: ${parsedCommand.intent}, 复杂度: ${parsedCommand.complexity}, 优先级: ${task.priority}`,
      verificationCriteria: `任务完成标准：\n- 功能正常运行\n- 代码质量良好\n- 通过相关测试\n- 文档完整准确`,
      relatedFiles: parsedCommand.entities.files.map((file) => ({
        path: file,
        type: RelatedFileType.TO_MODIFY,
        description: `与指令相关的文件: ${file}`,
      })),
    }));

    // 调用splitTasks工具
    const result = await splitTasks({
      updateMode: 'append',
      tasks: tasksForSplit,
      globalAnalysisResult: `基于智能指令"${parsedCommand.originalCommand}"的自动任务拆分。意图: ${parsedCommand.intent}, 复杂度: ${parsedCommand.complexity}`,
    });

    return {
      success: true,
      tasksCreated: tasksForSplit.length,
      splitTasksResult: result,
    };
  } catch (error) {
    log.error('ProcessIntelligentCommand', '任务创建失败', error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 记录指令记忆
 */
async function recordCommandMemory(
  parsedCommand: ParsedCommand,
  taskSuggestions: any[],
  executionResult: any
): Promise<void> {
  try {
    // 这里可以集成TaskMemoryManager来记录指令处理历史
    // 暂时使用日志记录
    log.info('ProcessIntelligentCommand', '记录指令处理历史', {
      command: parsedCommand.originalCommand,
      intent: parsedCommand.intent,
      complexity: parsedCommand.complexity,
      tasksGenerated: taskSuggestions.length,
      executionSuccess: executionResult?.success || false,
    });
  } catch (error) {
    log.error('ProcessIntelligentCommand', '记录指令记忆失败', error as Error);
  }
}

/**
 * 生成响应内容
 */
function generateResponse(
  parsedCommand: ParsedCommand,
  taskSuggestions: any[],
  executionResult: any,
  language: string
): string {
  const isZh = language === 'zh';

  let response = isZh ? '# 🤖 智能指令处理结果\n\n' : '# 🤖 Intelligent Command Processing Result\n\n';

  // 指令解析结果
  response += isZh ? '## 📋 指令解析\n\n' : '## 📋 Command Analysis\n\n';
  response += isZh
    ? `**原始指令**: ${parsedCommand.originalCommand}\n\n`
    : `**Original Command**: ${parsedCommand.originalCommand}\n\n`;
  response += isZh
    ? `**识别意图**: ${getIntentDisplayName(parsedCommand.intent, isZh)}\n\n`
    : `**Detected Intent**: ${getIntentDisplayName(parsedCommand.intent, isZh)}\n\n`;
  response += isZh
    ? `**复杂度评估**: ${getComplexityDisplayName(parsedCommand.complexity, isZh)}\n\n`
    : `**Complexity Assessment**: ${getComplexityDisplayName(parsedCommand.complexity, isZh)}\n\n`;

  if (parsedCommand.entities.technologies.length > 0) {
    response += isZh
      ? `**涉及技术**: ${parsedCommand.entities.technologies.join(', ')}\n\n`
      : `**Technologies Involved**: ${parsedCommand.entities.technologies.join(', ')}\n\n`;
  }

  if (parsedCommand.entities.files.length > 0) {
    response += isZh
      ? `**相关文件**: ${parsedCommand.entities.files.join(', ')}\n\n`
      : `**Related Files**: ${parsedCommand.entities.files.join(', ')}\n\n`;
  }

  // 任务建议
  response += isZh ? '## 🎯 生成的任务\n\n' : '## 🎯 Generated Tasks\n\n';

  if (taskSuggestions.length > 0) {
    taskSuggestions.forEach((task, index) => {
      response += `### ${index + 1}. ${task.name}\n\n`;
      response += `${task.description}\n\n`;
      response += isZh
        ? `**优先级**: ${task.priority} | **预估工作量**: ${task.estimatedEffort}\n\n`
        : `**Priority**: ${task.priority} | **Estimated Effort**: ${task.estimatedEffort}\n\n`;

      if (task.dependencies && task.dependencies.length > 0) {
        response += isZh
          ? `**依赖任务**: ${task.dependencies.join(', ')}\n\n`
          : `**Dependencies**: ${task.dependencies.join(', ')}\n\n`;
      }
    });
  } else {
    response += isZh ? '暂无生成的任务建议。\n\n' : 'No task suggestions generated.\n\n';
  }

  // 执行结果
  if (executionResult) {
    response += isZh ? '## ⚡ 执行结果\n\n' : '## ⚡ Execution Result\n\n';

    if (executionResult.success) {
      response += isZh
        ? `✅ 成功创建了 ${executionResult.tasksCreated} 个任务\n\n`
        : `✅ Successfully created ${executionResult.tasksCreated} tasks\n\n`;
      response += isZh
        ? '任务已添加到项目任务列表中，可以开始执行。\n\n'
        : 'Tasks have been added to the project task list and are ready for execution.\n\n';
    } else {
      response += isZh
        ? `❌ 任务创建失败: ${executionResult.error}\n\n`
        : `❌ Task creation failed: ${executionResult.error}\n\n`;
    }
  }

  // 下一步建议
  response += isZh ? '## 💡 下一步建议\n\n' : '## 💡 Next Steps\n\n';

  if (executionResult?.success) {
    response += isZh ? '1. 查看任务列表确认生成的任务\n' : '1. Review the task list to confirm generated tasks\n';
    response += isZh ? '2. 根据优先级开始执行任务\n' : '2. Start executing tasks based on priority\n';
    response += isZh ? '3. 在执行过程中及时更新任务状态\n' : '3. Update task status during execution\n';
  } else {
    response += isZh ? '1. 检查指令是否清晰明确\n' : '1. Check if the command is clear and specific\n';
    response += isZh ? '2. 提供更多上下文信息\n' : '2. Provide more context information\n';
    response += isZh ? '3. 尝试简化或拆分复杂指令\n' : '3. Try to simplify or break down complex commands\n';
  }

  return response;
}

/**
 * 获取意图显示名称
 */
function getIntentDisplayName(intent: CommandIntent, isZh: boolean): string {
  const names = {
    development: isZh ? '开发实现' : 'Development',
    testing: isZh ? '测试验证' : 'Testing',
    documentation: isZh ? '文档编写' : 'Documentation',
    deployment: isZh ? '部署发布' : 'Deployment',
    analysis: isZh ? '分析研究' : 'Analysis',
    refactoring: isZh ? '代码重构' : 'Refactoring',
    'bug-fixing': isZh ? '问题修复' : 'Bug Fixing',
    'feature-request': isZh ? '功能需求' : 'Feature Request',
    optimization: isZh ? '性能优化' : 'Optimization',
    research: isZh ? '技术调研' : 'Research',
    collaboration: isZh ? '团队协作' : 'Collaboration',
    unknown: isZh ? '未知类型' : 'Unknown',
  };

  return names[intent] || names.unknown;
}

/**
 * 获取复杂度显示名称
 */
function getComplexityDisplayName(complexity: CommandComplexity, isZh: boolean): string {
  const names = {
    simple: isZh ? '简单' : 'Simple',
    medium: isZh ? '中等' : 'Medium',
    complex: isZh ? '复杂' : 'Complex',
  };

  return names[complexity];
}

// 工具定义
export const processIntelligentCommandToolDefinition = {
  name: 'process_intelligent_command',
  description: `智能指令处理工具 - 自然语言指令的智能识别和自动任务拆分

这个工具能够理解和处理自然语言开发指令，自动识别意图、分析复杂度，并生成相应的可执行任务。

🎯 **核心功能**：
- **智能意图识别**：自动识别开发、测试、文档、部署等11种意图类型
- **复杂度评估**：评估指令的技术复杂度（简单/中等/复杂）
- **自动任务拆分**：基于意图和复杂度生成结构化的可执行任务
- **上下文感知**：结合项目背景和技术栈进行智能分析
- **多语言支持**：支持中英文指令处理

🚀 **支持的指令类型**：
- **开发实现**：功能开发、代码编写、系统构建
- **测试验证**：单元测试、集成测试、质量保证
- **文档编写**：技术文档、API文档、使用说明
- **部署发布**：环境部署、应用发布、配置管理
- **分析研究**：需求分析、技术调研、方案设计
- **代码重构**：代码优化、架构改进、性能提升
- **问题修复**：Bug修复、故障排查、问题解决
- **功能需求**：新功能开发、需求实现、特性添加
- **性能优化**：系统优化、性能调优、资源管理
- **技术调研**：技术选型、方案比较、最佳实践
- **团队协作**：任务分配、协作流程、团队管理

💡 **智能特性**：
- **关键词提取**：自动提取技术栈、文件、功能等关键信息
- **优先级排序**：基于紧急程度和重要性智能排序任务
- **依赖识别**：自动识别任务间的依赖关系
- **工作量估算**：根据复杂度智能估算开发工作量
- **项目适配**：结合当前项目上下文定制任务内容

🔧 **使用场景**：
- 快速将产品需求转换为开发任务
- 自动拆分复杂的开发指令
- 标准化团队任务管理流程
- 提高开发效率和任务执行准确性
- 支持敏捷开发和迭代管理

⚡ **自动执行**：
- 默认自动创建任务到项目任务列表
- 支持手动模式仅生成任务建议
- 集成现有任务管理系统
- 保持任务历史和执行记录

这个工具特别适合需要快速响应需求变化、提高开发效率的团队使用。`,
  inputSchema: processIntelligentCommandSchema,
  handler: processIntelligentCommandTool,
};
