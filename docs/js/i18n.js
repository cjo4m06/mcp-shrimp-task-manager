// i18n.js - 多语系支援功能
// 翻译资料结构
const i18n = {
  "zh-CN": {
    // 导览列
    "nav.pain-points": "痛点",
    "nav.features": "功能",
    "nav.workflow": "工作流程",
    "nav.installation": "安装配置",
    "nav.github": "GitHub",
    "nav.menu-button": "菜单",
    "nav.logo.alt": "虾米任务管理器标志",
    "nav.prompt-custom": "提示词配置",
    // 英雄区
    "hero.title": "Shrimp Task Manager",
    "hero.subtitle": "为AI编程助手提供结构化任务管理的智能系统",
    "hero.description":
      "让AI助手拥有长期记忆能力，高效管理复杂任务，提供结构化的任务分解和执行追踪，让您的编程体验更加流畅和高效。",
    "hero.start": "开始使用",
    "hero.learn-more": "了解更多",
    "hero.workflow-image.alt": "智能任务管理工作流程",
    // 痛点解决方案区
    "pain-points.title": "痛点与解决方案",
    "pain-points.subtitle":
      "Shrimp Task Manager 专为解决 AI 编程助手在任务管理中面临的三大核心痛点而设计。",
    "pain-points.memory-loss.title": "记忆缺失",
    "pain-points.memory-loss.description":
      "AI助手缺乏跨对话的任务记忆能力，导致无法追踪长期任务进度，重复解释相同需求，浪费时间和资源。",
    "pain-points.memory-loss.solution.title": "任务记忆功能",
    "pain-points.memory-loss.solution.description":
      "自动保存执行历史，提供长期记忆能力，让AI助手能够记住之前的任务进度，无缝继续未完成任务。",
    "pain-points.memory-loss.icon.alt": "记忆缺失",
    "pain-points.structure-chaos.title": "结构混乱",
    "pain-points.structure-chaos.description":
      "复杂任务缺乏系统化管理导致效率低下，缺少依赖关系管理，子任务执行混乱，难以追踪总体进度。",
    "pain-points.structure-chaos.solution.title": "结构化任务分解",
    "pain-points.structure-chaos.solution.description":
      "自动将复杂任务分解为可管理的子任务，建立清晰的依赖关系，提供有序执行路径，确保高效完成。",
    "pain-points.structure-chaos.icon.alt": "结构混乱",
    "pain-points.structure-chaos.solution.icon.alt": "结构化任务分解",
    "pain-points.repeat-work.title": "重复工作",
    "pain-points.repeat-work.description":
      "无法有效利用过往经验与解决方案，每次对话都需从零开始，缺乏知识积累和经验参考系统。",
    "pain-points.repeat-work.solution.title": "知识积累与经验参考",
    "pain-points.repeat-work.solution.description":
      "自动记录成功解决方案，建立任务知识库，支持相似任务快速参考，实现经验积累和知识复用。",
    "pain-points.repeat-work.icon.alt": "重复工作",
    "pain-points.repeat-work.solution.icon.alt":
      "Knowledge Accumulation and Experience Reference",
    "pain-points.explore": "探索核心功能",
    // 功能区块
    "features.title": "核心功能",
    "features.subtitle":
      "Shrimp Task Manager 提供六大核心功能，帮助您高效管理、执行和追踪复杂任务。",
    "features.planning.title": "智能任务规划与分析",
    "features.planning.description":
      "通过深入分析需求和约束条件，生成结构化任务计划。自动评估范围、风险和优先级，提供理性和全面的实施策略。",
    "features.planning.icon.alt": "智能任务规划与分析",
    "features.decomposition.title": "自动任务分解与依赖管理",
    "features.decomposition.description":
      "智能将复杂任务分解为可管理的小任务，识别任务间依赖关系，建立优化执行路径，避免资源冲突与执行瓶颈。",
    "features.decomposition.icon.alt": "自动任务分解与依赖管理",
    "features.tracking.title": "执行状态追踪",
    "features.tracking.description":
      "实时监控每个任务的执行状态，提供进度可视化显示，自动更新依赖项状态，并在任务完成时提供详细执行报告。",
    "features.tracking.icon.alt": "执行状态追踪",
    "features.verification.title": "任务完整性验证",
    "features.verification.description":
      "全面检查任务完成度，确保所有需求与标准都已满足，提供验证报告与质量评估，确保产出符合预期要求。",
    "features.verification.icon.alt": "任务完整性验证",
    "features.complexity.title": "任务复杂度评估",
    "features.complexity.description":
      "基于多维度标准评估任务复杂度，提供资源需求估算，识别高风险组件，帮助合理分配资源与时间。",
    "features.complexity.icon.alt": "任务复杂度评估",
    "features.memory.title": "任务记忆功能",
    "features.memory.description":
      "提供跨会话的任务记忆能力，自动保存执行历史与上下文，允许随时恢复任务并继续执行，无需重复解释需求。",
    "features.memory.icon.alt": "任务记忆功能",
    "features.learn-workflow": "了解工作流程",
    // 工作流程区块
    "workflow.title": "工作流程",
    "workflow.subtitle":
      "Shrimp Task Manager 提供完整的工作流程，从任务规划到任务完成的每个步骤都经过精心设计。",
    "workflow.step1.title": "任务规划",
    "workflow.step1.description": "初始化并详细规划任务流程",
    "workflow.step2.title": "深入分析",
    "workflow.step2.description": "深入分析需求并评估技术可行性",
    "workflow.step3.title": "方案反思",
    "workflow.step3.description": "批判性审查分析结果并优化方案",
    "workflow.step4.title": "任务分解",
    "workflow.step4.description": "将复杂任务分解为可管理的子任务",
    "workflow.step5.title": "任务执行",
    "workflow.step5.description": "按照预定计划执行特定任务",
    "workflow.step6.title": "结果验证",
    "workflow.step6.description": "全面验证任务完成度和质量",
    "workflow.step7.title": "任务完成",
    "workflow.step7.description": "标记任务为完成状态并生成报告",
    "workflow.learn-more-link": "了解更多 →",
    "workflow.mobile.step1.full-description":
      "初始化并详细规划任务流程，建立明确的目标与成功标准，可选择参考现有任务进行延续规划。",
    "workflow.mobile.step2.full-description":
      "深入分析任务需求并系统性检查代码库，评估技术可行性与潜在风险，提供初步解决方案建议。",
    "workflow.mobile.step3.full-description":
      "批判性审查分析结果，评估方案完整性并识别优化机会，确保解决方案符合最佳实践。",
    "workflow.mobile.step4.full-description":
      "将复杂任务分解为独立且可追踪的子任务，建立明确的依赖关系和优先顺序，支持多种更新模式。",
    "workflow.mobile.step5.full-description":
      "按照预定计划执行特定任务，确保每个步骤的输出符合质量标准，处理执行过程中的异常情况。",
    "workflow.mobile.step6.full-description":
      "全面验证任务完成度，确保所有需求与技术标准都已满足，并无遗漏细节，提供质量评估报告。",
    "workflow.mobile.step7.full-description":
      "正式标记任务为完成状态，生成详细的完成报告，并更新关联任务的依赖状态，确保工作流程的连续性。",
    // 安装配置区块
    "installation.title": "安装与配置区",
    "installation.subtitle":
      "Shrimp Task Manager 提供多种安装方式，无论您是想快速开始，还是需要进行高级配置，都能轻松上手。",
    "installation.manual.title": "手动安装设置",
    "installation.step1": "克隆代码仓库",
    "installation.step2": "安装依赖",
    "installation.step3": "编译项目",
    "installation.cursor.title": "Cursor IDE 配置",
    "installation.cursor.description":
      "如果您使用 Cursor IDE，可以将 Shrimp Task Manager 集成到您的开发环境中。",
    "installation.quickstart.title": "快速入门",
    "installation.quickstart.description":
      "完成安装后，请查看我们的快速入门指南，了解如何使用 MCP Shrimp Task Manager。",
    "installation.faq.title": "常见问题",
    "installation.faq.description":
      "遇到问题？查看我们的常见问题解答，或在 GitHub 上提交问题。",
    "installation.copy-button": "复制",
    "installation.important-note.title": "重要提示",
    "installation.important-note.description":
      "必须使用绝对路径： 请确保 DATA_DIR 配置使用绝对路径而非相对路径，否则可能无法正确加载数据",
    "installation.prompt-config.title": "提示词配置说明",
    "installation.prompt-config.intro": "Shrimp Task Manager 支持两种模式：",
    "installation.prompt-config.mode1.title": "TaskPlanner:",
    "installation.prompt-config.mode1.description":
      "适用于初始任务规划和复杂任务分解，AI 助手扮演任务规划师角色。",
    "installation.prompt-config.mode2.title": "TaskExecutor:",
    "installation.prompt-config.mode2.description":
      "适用于执行预定义任务，AI 助手扮演执行专家角色。",
    "installation.prompt-config.tip":
      "您可以在Cursor设置中使用 Custom modes 配置来自定义模式，以适应不同的工作场景。",
    // CTA区块
    "cta.title": "立即体验智能任务管理",
    "cta.description":
      "提升您的AI编程体验，告别无序任务管理，拥抱更高效的工作流程。",
    "cta.github": "前往 GitHub 仓库",
    "cta.start": "开始安装",
    // 页脚区块
    "footer.copyright": "© 2023 MCP Task Manager. 保留所有权利。",
    "footer.developer": "由 Siage 用 ❤️ 开发",

    // 通用UI元素
    "common.close": "关闭",
    "common.back": "返回",
    "common.next": "下一步",
    "common.submit": "提交",
    "common.cancel": "取消",
    "common.confirm": "确认",
    "common.copy": "复制",
    "common.copied": "已复制!",
    "common.yes": "是",
    "common.no": "否",
    "common.more": "更多",
    "common.less": "收起",
    "common.loading": "加载中...",
    "common.error": "错误",
    "common.success": "成功",
    "common.warning": "警告",
    "common.info": "提示",
    "common.search": "搜索",
    "common.filter": "筛选",
    "common.sort": "排序",
    "common.ascending": "升序",
    "common.descending": "降序",
    "common.lang.zh-CN": "中",
    "common.lang.en": "EN",
    "modal.close-button": "关闭",
    "modal.close-button-aria": "关闭",

    // 工作流程详细内容
    "workflow.step1.content.title": "任务规划阶段",
    "workflow.step1.content.description":
      "任务规划阶段是AI助手定义项目范围、设置目标和建立成功标准的初始阶段。",
    "workflow.step1.content.activities": "主要活动：",
    "workflow.step1.content.activity1": "明确项目需求和约束条件",
    "workflow.step1.content.activity2": "设定清晰的目标和定义可衡量的成功标准",
    "workflow.step1.content.activity3": "建立项目边界并识别相关方",
    "workflow.step1.content.activity4": "创建包含时间估算的高级计划",
    "workflow.step1.content.activity5": "可选择参考现有任务进行持续规划",
    "workflow.step1.content.outputs": "输出成果：",
    "workflow.step1.content.output1": "全面的任务描述",
    "workflow.step1.content.output2": "明确的成功标准",
    "workflow.step1.content.output3": "技术需求和约束条件",
    "workflow.step1.content.summary":
      "这个阶段为所有后续工作奠定基础，确保AI助手和用户对需要完成的任务有共同理解。",

    "workflow.step2.content.title": "深入分析阶段",
    "workflow.step2.content.description":
      "深入分析阶段包括对需求和技术环境的彻底检查，以开发可行的实施策略。",
    "workflow.step2.content.activities": "主要活动：",
    "workflow.step2.content.activity1": "分析需求并识别技术挑战",
    "workflow.step2.content.activity2": "评估技术可行性和潜在风险",
    "workflow.step2.content.activity3": "研究最佳实践和可用解决方案",
    "workflow.step2.content.activity4": "系统性地审查现有代码库（如适用）",
    "workflow.step2.content.activity5": "开发初步实施概念",
    "workflow.step2.content.outputs": "输出成果：",
    "workflow.step2.content.output1": "技术可行性评估",
    "workflow.step2.content.output2": "风险识别和缓解策略",
    "workflow.step2.content.output3": "初步实施方法",
    "workflow.step2.content.output4": "必要时提供伪代码或架构图",
    "workflow.step2.content.summary":
      "这个阶段确保在进入实施之前，提出的解决方案技术上可行并解决所有需求。",

    // 错误和警告讯息
    "error.storage": "无法访问本地存储，语言偏好将不会被保存。",
    "error.translation": "翻译错误：无法加载翻译数据。",
    "error.network": "网络错误：无法连接到服务器。",
    "warning.browser":
      "您的浏览器可能不支持所有功能，建议使用最新版本的Chrome、Firefox或Safari浏览器。",
    "warning.mobile": "某些功能在移动设备上可能受限。",

    // 代码示例区块
    "examples.planning.title": "任务规划与分解流程",
    "examples.planning.intro":
      "这个示例展示了如何使用MCP Shrimp Task Manager来规划和分解复杂任务。整个流程包括四个主要步骤：",
    "examples.planning.step1": "初始化并详细规划任务，明确目标与成功标准",
    "examples.planning.step2": "深入了解任务，分析技术可行性和潜在挑战",
    "examples.planning.step3": "批判性审查分析结果，优化提案",
    "examples.planning.step4": "将复杂任务分解为可管理的子任务",
    "examples.planning.conclusion":
      "通过这种方法，您可以将复杂的大型任务转化为结构化的、可执行的工作单元，同时保持整体视角。",
    "examples.execution.title": "任务执行与完成流程",
    "examples.execution.intro":
      "这个示例展示了如何执行和完成已规划的任务。整个流程包括四个主要步骤：",
    "examples.execution.step1.title": "任务列表",
    "examples.execution.step1": "查询待处理任务列表，了解当前状态",
    "examples.execution.step2": "按照预定计划执行选定的任务",
    "examples.execution.step3": "验证任务完成情况，确保达到质量标准",
    "examples.execution.step4": "正式标记任务为完成状态，生成报告",
    "examples.execution.conclusion":
      "通过这种方法，您可以系统地执行任务并确保每个步骤都达到预期的质量标准，最终完成整个工作流程。",
    "examples.tip.title": "💡 提示",
    "examples.tip.description":
      "上面的工作流程并非固定不变的，Agent 会根据分析情况进行重复迭代不同步骤，直到达到预期效果。",

    // 快速入门和常见问题区块
    "quickstart.title": "快速入门",
    "quickstart.description":
      "完成安装后，请查看我们的快速入门指南，了解如何使用 MCP Shrimp Task Manager。",
    "quickstart.view-code-link": "查看代码 →",
    "faq.title": "常见问题",
    "faq.description":
      "遇到问题？查看我们的常见问题解答，或在 GitHub 上提交问题。",
    "faq.view-faq-link": "查看常见问题 →",
    "installation.cursor.mcp-servers": "to/your/project/.cursor/mcp.jsonn",
    "task.planner.prompt": `你是一个专业的任务规划专家，你必须与用户进行交互，分析用户的需求，并收集项目相关信息，最终使用 “plan_task” 建立任务，当任务建立完成后必须总结摘要，并告知用户使用“TaskExecutor”模式进行任务执行。
你必须专心于任务规划禁止使用 “execute_task” 来执行任务，
严重警告你是任务规划专家，你不能直接修改代码，你只能规划任务，并且你不能直接修改代码，你只能规划任务。`,
    "task.executor.prompt": `你是一个专业的任务执行专家，当用户有指定执行任务，则使用 “execute_task” 进行任务执行，
没有指定任务时则使用 “list_tasks” 寻找未执行的任务并执行，
当执行完成后必须总结摘要告知用户结论，
你一次只能执行一个任务，当任务完成时除非用户明确告知否则禁止进行下一则任务。
用户如果要求“连续模式”则按照顺序连续执行所有任务。`,
    // Prompt 自定义功能区块
    "prompt-custom.title": "Prompt 自定义功能",
    "prompt-custom.subtitle":
      "通过环境变量自定义系统提示词，无需修改代码即可定制 AI 助手行为",

    "prompt-custom.overview.title": "功能概述",
    "prompt-custom.overview.description":
      "Prompt 自定义允许用户通过环境变量调整 AI 助手的行为表现，提供两种自定义方式：完全覆盖原始提示词或在原有基础上追加内容。",

    "prompt-custom.benefits.title": "主要好处",
    "prompt-custom.benefits.item1":
      "个性化定制：根据特定项目或领域需求调整系统行为",
    "prompt-custom.benefits.item2":
      "效率提升：针对重复任务类型进行优化，减少冗余说明",
    "prompt-custom.benefits.item3":
      "品牌一致性：确保输出内容符合组织的风格指南和标准",
    "prompt-custom.benefits.item4":
      "专业适应性：为特定技术领域或行业调整专业术语和标准",
    "prompt-custom.benefits.item5":
      "团队协作：统一团队成员使用的提示词，保证一致的工作方式",

    "prompt-custom.usage.title": "使用方法",
    "prompt-custom.usage.env.title": "环境变量配置",
    "prompt-custom.usage.env.description":
      "设置环境变量来自定义各功能的提示词，使用特定命名规则：",
    "prompt-custom.usage.more": "查看详细文档了解更多配置方式和参数使用说明。",
    "prompt-custom.view-docs": "查看完整文档",
  },
  en: {
    // 导航栏
    "nav.pain-points": "Pain Points",
    "nav.features": "Features",
    "nav.workflow": "Workflow",
    "nav.installation": "Installation",
    "nav.github": "GitHub",
    "nav.menu-button": "Menu",
    "nav.logo.alt": "Shrimp Task Manager Logo",
    "nav.prompt-custom": "Prompt Config",
    // 英雄区
    "hero.title": "Shrimp Task Manager",
    "hero.subtitle":
      "Intelligent System for Structured Task Management in AI Programming Assistants",
    "hero.description":
      "Empower your AI assistant with long-term memory capabilities, efficient complex task management, and structured task decomposition and execution tracking, making your programming experience smoother and more efficient.",
    "hero.start": "Get Started",
    "hero.learn-more": "Learn More",
    "hero.workflow-image.alt": "Intelligent Task Management Workflow",
    // 痛点解决方案区
    "pain-points.title": "Pain Points & Solutions",
    "pain-points.subtitle":
      "Shrimp Task Manager is designed to solve three core pain points faced by AI programming assistants in task management.",
    "pain-points.memory-loss.title": "Memory Loss",
    "pain-points.memory-loss.description":
      "AI assistants lack cross-conversation task memory capability, resulting in inability to track long-term task progress, repeated explanation of the same requirements, and wasted time and resources.",
    "pain-points.memory-loss.solution.title": "Task Memory Function",
    "pain-points.memory-loss.solution.description":
      "Automatically save execution history, provide long-term memory capability, allowing AI assistants to remember previous task progress and seamlessly continue unfinished tasks.",
    "pain-points.memory-loss.icon.alt": "Memory Loss",
    "pain-points.structure-chaos.title": "Structural Chaos",
    "pain-points.structure-chaos.description":
      "Complex tasks lack systematic management leading to inefficiency, missing dependency management, chaotic subtask execution, and difficulty tracking overall progress.",
    "pain-points.structure-chaos.solution.title":
      "Structured Task Decomposition",
    "pain-points.structure-chaos.solution.description":
      "Automatically decompose complex tasks into manageable subtasks, establish clear dependencies, provide ordered execution paths, and ensure efficient completion.",
    "pain-points.structure-chaos.icon.alt": "Structural Chaos",
    "pain-points.structure-chaos.solution.icon.alt":
      "Structured Task Decomposition",
    "pain-points.repeat-work.title": "Repetitive Work",
    "pain-points.repeat-work.description":
      "Unable to effectively utilize past experience and solutions, each conversation starts from scratch, lacking knowledge accumulation and experience reference systems.",
    "pain-points.repeat-work.solution.title":
      "Knowledge Accumulation & Experience Reference",
    "pain-points.repeat-work.solution.description":
      "Automatically records successful solutions, builds a task knowledge base, supports quick reference for similar tasks, achieving experience accumulation and knowledge reuse.",
    "pain-points.repeat-work.icon.alt": "Repetitive Work",
    "pain-points.repeat-work.solution.icon.alt":
      "Knowledge Accumulation and Experience Reference",
    "pain-points.explore": "Explore Core Features",
    // 功能区块
    "features.title": "Core Features",
    "features.subtitle":
      "Shrimp Task Manager provides six core features to help you efficiently manage, execute, and track complex tasks.",
    "features.planning.title": "Intelligent Task Planning & Analysis",
    "features.planning.description":
      "Through in-depth analysis of requirements and constraints, generate structured task plans. Automatically assess scope, risks, and priorities to provide rational and comprehensive implementation strategies.",
    "features.planning.icon.alt": "Intelligent Task Planning and Analysis",
    "features.decomposition.title":
      "Automatic Task Decomposition & Dependency Management",
    "features.decomposition.description":
      "Intelligently break down complex tasks into manageable smaller tasks, identify dependencies between tasks, establish optimized execution paths, and avoid resource conflicts and execution bottlenecks.",
    "features.decomposition.icon.alt":
      "Automatic Task Decomposition and Dependency Management",
    "features.tracking.title": "Execution Status Tracking",
    "features.tracking.description":
      "Monitor the execution status of each task in real-time, provide progress visualization, automatically update dependency status, and provide detailed execution reports upon task completion.",
    "features.tracking.icon.alt": "Execution Status Tracking",
    "features.verification.title": "Task Integrity Verification",
    "features.verification.description":
      "Thoroughly check task completion, ensure all requirements and standards have been met, provide verification reports and quality assessments, and ensure output meets expected requirements.",
    "features.verification.icon.alt": "Task Integrity Verification",
    "features.complexity.title": "Task Complexity Assessment",
    "features.complexity.description":
      "Evaluate task complexity based on multi-dimensional standards, provide resource requirement estimates, identify high-risk components, and help reasonably allocate resources and time.",
    "features.complexity.icon.alt": "Task Complexity Assessment",
    "features.memory.title": "Task Memory Function",
    "features.memory.description":
      "Provide cross-session task memory capabilities, automatically save execution history and context, allow task resumption and continuation at any time, without the need to re-explain requirements.",
    "features.memory.icon.alt": "Task Memory Function",
    "features.learn-workflow": "Learn about the Workflow",
    // 工作流程区块
    "workflow.title": "Workflow",
    "workflow.subtitle":
      "Shrimp Task Manager provides a complete workflow, with each step from task planning to task completion carefully designed.",
    "workflow.step1.title": "Task Planning",
    "workflow.step1.description": "Initialize and plan task flow in detail",
    "workflow.step2.title": "In-depth Analysis",
    "workflow.step2.description":
      "Analyze requirements and assess technical feasibility",
    "workflow.step3.title": "Solution Reflection",
    "workflow.step3.description":
      "Critically review analysis results and optimize solutions",
    "workflow.step4.title": "Task Decomposition",
    "workflow.step4.description":
      "Break down complex tasks into manageable subtasks",
    "workflow.step5.title": "Task Execution",
    "workflow.step5.description":
      "Execute specific tasks according to predetermined plans",
    "workflow.step6.title": "Result Verification",
    "workflow.step6.description":
      "Thoroughly verify task completion and quality",
    "workflow.step7.title": "Task Completion",
    "workflow.step7.description":
      "Mark tasks as completed and generate reports",
    "workflow.learn-more-link": "Learn More →",
    "workflow.mobile.step1.full-description":
      "Initialize and plan task flow in detail, establish clear goals and success criteria, with the option to reference existing tasks for continued planning.",
    "workflow.mobile.step2.full-description":
      "Analyze task requirements in depth and systematically review codebase, assess technical feasibility and potential risks, and provide initial solution recommendations.",
    "workflow.mobile.step3.full-description":
      "Critically review analysis results, evaluate solution completeness and identify optimization opportunities, ensuring solutions follow best practices.",
    "workflow.mobile.step4.full-description":
      "Break complex tasks into independent and trackable subtasks, establish clear dependencies and priorities, support multiple update modes.",
    "workflow.mobile.step5.full-description":
      "Execute specific tasks according to the predefined plan, ensure each step's output meets quality standards, and handle exceptions during execution.",
    "workflow.mobile.step6.full-description":
      "Comprehensively verify task completion, ensure all requirements and technical standards are met with no missing details, provide quality assessment reports.",
    "workflow.mobile.step7.full-description":
      "Formally mark tasks as completed, generate detailed completion reports, and update dependency status of related tasks to ensure workflow continuity.",
    // 安装配置区块
    "installation.title": "Installation & Configuration",
    "installation.subtitle":
      "Shrimp Task Manager offers multiple installation methods, whether you want to get started quickly or need advanced configuration, it's easy to set up.",
    "installation.manual.title": "Manual Installation",
    "installation.step1": "Clone Repository",
    "installation.step2": "Install Dependencies",
    "installation.step3": "Build Project",
    "installation.cursor.title": "Cursor IDE Configuration",
    "installation.cursor.description":
      "If you use Cursor IDE, you can integrate Shrimp Task Manager into your development environment.",
    "installation.quickstart.title": "Quick Start",
    "installation.quickstart.description":
      "After installation, check our quick start guide to learn how to use MCP Shrimp Task Manager.",
    "installation.faq.title": "FAQ",
    "installation.faq.description":
      "Having issues? Check our frequently asked questions or submit an issue on GitHub.",
    "installation.copy-button": "Copy",
    "installation.important-note.title": "Important Note",
    "installation.important-note.description":
      "Must use absolute path: Please ensure the DATA_DIR configuration uses absolute paths rather than relative paths, otherwise data may not load correctly",
    "installation.prompt-config.title": "Prompt Configuration Guide",
    "installation.prompt-config.intro":
      "Shrimp Task Manager supports two modes:",
    "installation.prompt-config.mode1.title": "TaskPlanner:",
    "installation.prompt-config.mode1.description":
      "Suitable for initial task planning and complex task decomposition, where the AI assistant plays the role of a task planner.",
    "installation.prompt-config.mode2.title": "TaskExecutor:",
    "installation.prompt-config.mode2.description":
      "Suitable for executing predefined tasks, where the AI assistant plays the role of an execution expert.",
    "installation.prompt-config.tip":
      "You can use Custom modes in Cursor settings to customize modes to suit different work scenarios.",
    // CTA区块
    "cta.title": "Experience Intelligent Task Management Now",
    "cta.description":
      "Enhance your AI programming experience, say goodbye to disorganized task management, and embrace a more efficient workflow.",
    "cta.github": "Go to GitHub Repository",
    "cta.start": "Start Installation",
    // 页脚区块
    "footer.copyright": "© 2023 MCP Task Manager. All Rights Reserved.",
    "footer.developer": "Made with ❤️ by Siage",

    // 通用UI元素
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.copy": "Copy",
    "common.copied": "Copied!",
    "common.yes": "Yes",
    "common.no": "No",
    "common.more": "More",
    "common.less": "Less",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.warning": "Warning",
    "common.info": "Info",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.ascending": "Ascending",
    "common.descending": "Descending",
    "common.lang.zh-CN": "中",
    "common.lang.en": "EN",
    "modal.close-button": "Close",
    "modal.close-button-aria": "Close",

    // 工作流程详细内容
    "workflow.step1.content.title": "Task Planning Stage",
    "workflow.step1.content.description":
      "The task planning stage is the initial phase where AI assistants define project scope, set goals, and establish success criteria.",
    "workflow.step1.content.activities": "Key Activities:",
    "workflow.step1.content.activity1":
      "Clarify project requirements and constraints",
    "workflow.step1.content.activity2":
      "Set clear objectives and define measurable success criteria",
    "workflow.step1.content.activity3":
      "Establish project boundaries and identify stakeholders",
    "workflow.step1.content.activity4":
      "Create a high-level plan with timeline estimates",
    "workflow.step1.content.activity5":
      "Optionally reference existing tasks for continuous planning",
    "workflow.step1.content.outputs": "Outputs:",
    "workflow.step1.content.output1": "Comprehensive task description",
    "workflow.step1.content.output2": "Clear success criteria",
    "workflow.step1.content.output3": "Technical requirements and constraints",
    "workflow.step1.content.summary":
      "This stage lays the foundation for all subsequent work, ensuring that both the AI assistant and the user have a shared understanding of what needs to be accomplished.",

    "workflow.step2.content.title": "In-depth Analysis Stage",
    "workflow.step2.content.description":
      "The in-depth analysis stage involves a thorough examination of the requirements and technical landscape to develop a viable implementation strategy.",
    "workflow.step2.content.activities": "Key Activities:",
    "workflow.step2.content.activity1":
      "Analyze requirements and identify technical challenges",
    "workflow.step2.content.activity2":
      "Evaluate technical feasibility and potential risks",
    "workflow.step2.content.activity3":
      "Research best practices and available solutions",
    "workflow.step2.content.activity4":
      "Systematically review existing codebase if applicable",
    "workflow.step2.content.activity5":
      "Develop initial implementation concepts",
    "workflow.step2.content.outputs": "Outputs:",
    "workflow.step2.content.output1": "Technical feasibility assessment",
    "workflow.step2.content.output2":
      "Risk identification and mitigation strategies",
    "workflow.step2.content.output3": "Initial implementation approach",
    "workflow.step2.content.output4":
      "Pseudocode or architectural diagrams where appropriate",
    "workflow.step2.content.summary":
      "This stage ensures that the proposed solution is technically sound and addresses all requirements before proceeding to implementation.",

    // 错误和警告讯息
    "error.storage":
      "Unable to access local storage, language preferences will not be saved.",
    "error.translation": "Translation error: Unable to load translation data.",
    "error.network": "Network error: Unable to connect to the server.",
    "warning.browser":
      "Your browser may not support all features, we recommend using the latest version of Chrome, Firefox, or Safari.",
    "warning.mobile": "Some features may be limited on mobile devices.",

    // 代码示例区块
    "examples.planning.title": "Task Planning and Decomposition Process",
    "examples.planning.intro":
      "This example demonstrates how to use MCP Shrimp Task Manager to plan and break down complex tasks. The entire process includes four main steps:",
    "examples.planning.step1":
      "Initialize and plan tasks in detail, establishing clear goals and success criteria",
    "examples.planning.step2":
      "Deeply understand the task, analyze technical feasibility and potential challenges",
    "examples.planning.step3":
      "Critically review analysis results and optimize proposals",
    "examples.planning.step4": "Break complex tasks into manageable subtasks",
    "examples.planning.conclusion":
      "With this approach, you can transform complex, large tasks into structured, executable work units while maintaining an overall perspective.",
    "examples.execution.title": "Task Execution and Completion Process",
    "examples.execution.intro":
      "This example demonstrates how to execute and complete planned tasks. The entire process includes four main steps:",
    "examples.execution.step1.title": "Task List",
    "examples.execution.step1":
      "Query pending task list to understand current status",
    "examples.execution.step2":
      "Execute selected tasks according to the predetermined plan",
    "examples.execution.step3":
      "Verify task completion to ensure quality standards are met",
    "examples.execution.step4":
      "Officially mark tasks as completed and generate reports",
    "examples.execution.conclusion":
      "With this approach, you can systematically execute tasks and ensure each step meets expected quality standards, ultimately completing the entire workflow.",
    "examples.tip.title": "💡 Tip",
    "examples.tip.description":
      "The workflow above is not fixed. The Agent will iterate through different steps based on analysis until the expected effect is achieved.",

    // 快速入门和常见问题区块
    "quickstart.title": "Quick Start",
    "quickstart.description":
      "After installation, check our quick start guide to learn how to use MCP Shrimp Task Manager.",
    "quickstart.view-code-link": "View Code →",
    "faq.title": "Frequently Asked Questions",
    "faq.description":
      "Having issues? Check our frequently asked questions or submit an issue on GitHub.",
    "faq.view-faq-link": "View FAQ →",
    "installation.cursor.mcp-servers": "to/your/project/.cursor/mcp.jsonn",
    "task.planner.prompt": `You are a professional task planning expert. You must interact with users, analyze their needs, and collect project-related information. Finally, you must use "plan_task" to create tasks. When the task is created, you must summarize it and inform the user to use the "TaskExecutor" mode to execute the task.
You must focus on task planning. Do not use "execute_task" to execute tasks.
Serious warning: you are a task planning expert, you cannot modify the program code directly, you can only plan tasks, and you cannot modify the program code directly, you can only plan tasks.`,
    "task.executor.prompt": `You are a professional task execution expert. When a user specifies a task to execute, use "execute_task" to execute the task.
If no task is specified, use "list_tasks" to find unexecuted tasks and execute them.
When the execution is completed, a summary must be given to inform the user of the conclusion.
You can only perform one task at a time, and when a task is completed, you are prohibited from performing the next task unless the user explicitly tells you to.
If the user requests "continuous mode", all tasks will be executed in sequence.`,
    // Prompt 自定义功能区块
    "prompt-custom.title": "Prompt Customization",
    "prompt-custom.subtitle":
      "Customize AI assistant behavior through environment variables, without modifying code",

    "prompt-custom.overview.title": "Feature Overview",
    "prompt-custom.overview.description":
      "Prompt customization allows users to adjust AI assistant behavior through environment variables, providing two customization methods: completely override original prompts or append content to existing ones.",

    "prompt-custom.benefits.title": "Key Benefits",
    "prompt-custom.benefits.item1":
      "Personalized customization: Adjust system behavior for specific projects or domains",
    "prompt-custom.benefits.item2":
      "Efficiency improvement: Optimize for repetitive task types, reducing redundant instructions",
    "prompt-custom.benefits.item3":
      "Brand consistency: Ensure output content adheres to organization style guides and standards",
    "prompt-custom.benefits.item4":
      "Professional adaptability: Adjust terminology and standards for specific technical fields or industries",
    "prompt-custom.benefits.item5":
      "Team collaboration: Unify prompts used by team members, ensuring consistent workflow",

    "prompt-custom.usage.title": "Usage Guide",
    "prompt-custom.usage.env.title": "Environment Variables Configuration",
    "prompt-custom.usage.env.description":
      "Set environment variables to customize prompts for each function, using specific naming conventions:",
    "prompt-custom.usage.more":
      "View detailed documentation for more configuration methods and parameter usage.",
    "prompt-custom.view-docs": "View Complete Documentation",
  },
};

// 翻譯應用函數
function applyTranslations(lang) {
  // 確保選擇的語言有效
  if (!i18n[lang]) {
    console.error("不支持的語言:", lang);
    return;
  }

  // 應用翻譯到所有帶有 data-i18n 屬性的元素
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (i18n[lang][key]) {
      element.textContent = i18n[lang][key];
    } else {
      console.warn(`未找到翻譯鍵: ${key}`);
    }
  });

  // 處理語言特定的連結
  document.querySelectorAll(".lang-specific").forEach((element) => {
    if (element.hasAttribute(`data-lang-${lang}`)) {
      const langSpecificHref = element.getAttribute(`data-lang-${lang}`);
      if (langSpecificHref) {
        element.setAttribute("href", langSpecificHref);
      }
    }
  });
}

// 設置語言並儲存用戶偏好
function setLanguage(lang) {
  // 儲存用戶偏好
  localStorage.setItem("preferred-language", lang);

  // 應用翻譯
  applyTranslations(lang);

  // 更新按鈕狀態
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    if (btn.getAttribute("data-lang") === lang) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // 更新 html 標籤的 lang 屬性
  document.documentElement.setAttribute("lang", lang);
}

// 獲取用戶偏好語言或瀏覽器語言
function getPreferredLanguage() {
  // 檢查本地儲存
  const savedLang = localStorage.getItem("preferred-language");
  if (savedLang && i18n[savedLang]) {
    return savedLang;
  }

  // 檢查瀏覽器語言
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang) {
    // 嘗試使用完整語言代碼匹配
    if (i18n[browserLang]) {
      return browserLang;
    }

    // 嘗試使用語言代碼前兩個字符匹配（如 "zh-CN" -> "zh"）
    const langPrefix = browserLang.split("-")[0];
    for (const key in i18n) {
      if (key.startsWith(langPrefix)) {
        return key;
      }
    }
  }

  // 默認返回英文
  return "en";
}

// 初始化網站語言
function initializeLanguage() {
  const preferredLang = getPreferredLanguage();
  setLanguage(preferredLang);
}

// 頁面載入完成後初始化語言和事件監聽器
document.addEventListener("DOMContentLoaded", function () {
  // 初始化語言
  initializeLanguage();

  // 為語言按鈕添加事件監聽器
  document.querySelectorAll(".lang-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLanguage(this.getAttribute("data-lang"));
    });
  });
});

// ==================================================
// 動態內容翻譯和性能優化函數
// ==================================================

/**
 * 創建帶有翻譯屬性的動態元素
 * @param {string} i18nKey - 翻譯鍵
 * @param {string} defaultText - 默認文本
 * @param {string} elementType - 元素類型，默認為div
 * @returns {HTMLElement} - 創建的元素
 */
function createDynamicElement(i18nKey, defaultText, elementType = "div") {
  const element = document.createElement(elementType);
  element.setAttribute("data-i18n", i18nKey);

  // 獲取當前語言
  const currentLang = localStorage.getItem("preferred-language") || "zh-CN";

  // 設置文本內容
  element.textContent =
    i18n[currentLang] && i18n[currentLang][i18nKey]
      ? i18n[currentLang][i18nKey]
      : defaultText;

  return element;
}

/**
 * 翻譯工具函數 - 獲取翻譯文本
 * @param {string} key - 翻譯鍵
 * @param {string} defaultText - 默認文本
 * @returns {string} - 翻譯後的文本
 */
function translateText(key, defaultText) {
  const currentLang = localStorage.getItem("preferred-language") || "zh-CN";
  return i18n[currentLang] && i18n[currentLang][key]
    ? i18n[currentLang][key]
    : defaultText;
}

/**
 * 批量处理翻译，提高性能
 * 当页面包含大量需要翻译的元素时使用
 */
function batchApplyTranslations() {
  // 延迟加载翻译，确保不阻塞页面渲染
  window.addEventListener("load", function () {
    // 如果有大量翻译内容，分批处理
    setTimeout(function () {
      const elements = document.querySelectorAll("[data-i18n]");
      const batchSize = 50; // 每批处理50个元素
      const currentLang = localStorage.getItem("preferred-language") || "zh-CN";

      for (let i = 0; i < elements.length; i += batchSize) {
        setTimeout(function () {
          const batch = Array.prototype.slice.call(elements, i, i + batchSize);
          batch.forEach(function (el) {
            // 应用未处理的翻译
            const key = el.getAttribute("data-i18n");
            if (i18n[currentLang] && i18n[currentLang][key]) {
              el.textContent = i18n[currentLang][key];
            }
          });
        }, 0);
      }
    }, 0);
  });
}

/**
 * 带动画效果的语言切换
 * @param {string} lang - 目标语言
 */
function setLanguageWithAnimation(lang) {
  // 添加淡出效果
  document.body.classList.add("lang-transition");

  setTimeout(function () {
    // 应用翻译
    setLanguage(lang);

    // 添加淡入效果
    document.body.classList.remove("lang-transition");
  }, 300);
}

// 在页面加载时执行性能优化的批量翻译
batchApplyTranslations();

// 添加语言切换动画的CSS样式
const styleElement = document.createElement("style");
styleElement.textContent = `
.lang-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.lang-btn.active {
  background-color: #3b82f6;
  color: white;
}

.language-switcher {
  display: flex;
  gap: 0.5rem;
  margin-left: 1rem;
}

/* 语言切换过渡动画 */
.lang-transition {
  opacity: 0.8;
  transition: opacity 0.3s ease;
}
`;
document.head.appendChild(styleElement);

// ==================================================
// 防御性编程函数，确保翻译系统的健壮性
// ==================================================

/**
 * 安全翻译函数 - 确保在i18n对象缺失或格式错误时不会崩溃
 * @param {string} key - 翻译键
 * @param {string} defaultText - 默认文本
 * @returns {string} - 翻译后的文本
 */
function safeTranslate(key, defaultText) {
  try {
    const currentLang = localStorage.getItem("preferred-language") || "zh-CN";
    if (
      typeof i18n === "undefined" ||
      !i18n[currentLang] ||
      !i18n[currentLang][key]
    ) {
      console.warn(`翻译键 "${key}" 不存在，使用默认文本`);
      return defaultText;
    }
    return i18n[currentLang][key];
  } catch (e) {
    console.error("翻译错误:", e);
    return defaultText;
  }
}

/**
 * 检测 LocalStorage 是否可用
 * @param {string} type - 存储类型，通常是 'localStorage'
 * @returns {boolean} - 是否可用
 */
function storageAvailable(type) {
  try {
    const storage = window[type];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // 针对 Firefox
      (e.code === 22 ||
        // 针对 Chrome
        e.code === 1014 ||
        // 测试名称字段
        e.name === "QuotaExceededError" ||
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // 确认存储不为空
      storage &&
      storage.length !== 0
    );
  }
}

/**
 * 增强版初始化函数 - 添加防御性功能
 */
function enhancedInitializeLanguage() {
  try {
    // 检查浏览器是否支持 LocalStorage
    if (storageAvailable("localStorage")) {
      let preferredLang = localStorage.getItem("preferred-language");

      if (!preferredLang) {
        const browserLang = navigator.language || navigator.userLanguage;
        preferredLang =
          browserLang && browserLang.startsWith("zh") ? "zh-CN" : "en";
      }

      // 验证语言代码是否有效
      if (!i18n[preferredLang]) {
        console.warn(`不支持的语言代码 ${preferredLang}，使用默认语言`);
        preferredLang = "zh-CN";
      }

      setLanguage(preferredLang);
    } else {
      // 如果不支持 LocalStorage，默认使用中文
      console.warn("LocalStorage 不可用，语言偏好将不会被保存");
      setLanguage("zh-CN");
    }
  } catch (error) {
    console.error("初始化语言时发生错误:", error);
    // 在错误情况下使用默认语言
    try {
      setLanguage("zh-CN");
    } catch (e) {
      console.error("无法设置默认语言:", e);
    }
  }
}

// 替换原始函数的增强版语言切换函数
function enhancedSetLanguage(lang) {
  try {
    // 确保语言代码有效
    if (!i18n[lang]) {
      console.warn(`不支持的语言代码: ${lang}，使用默认语言`);
      lang = "zh-CN";
    }

    // 尝试保存用户偏好
    try {
      if (storageAvailable("localStorage")) {
        localStorage.setItem("preferred-language", lang);
      }
    } catch (e) {
      console.warn("无法保存语言偏好:", e);
    }

    // 应用翻译
    applyTranslations(lang);

    // 更新按钮状态
    try {
      document.querySelectorAll(".lang-btn").forEach(function (btn) {
        if (btn.getAttribute("data-lang") === lang) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    } catch (e) {
      console.warn("无法更新语言按钮状态:", e);
    }

    // 更新 HTML 标签的 lang 属性
    try {
      document.documentElement.setAttribute("lang", lang);
    } catch (e) {
      console.warn("无法更新 HTML lang 属性:", e);
    }

    // 触发自定义事件通知语言变更
    try {
      const event = new CustomEvent("languageChanged", {
        detail: { language: lang },
      });
      document.dispatchEvent(event);
    } catch (e) {
      console.warn("无法触发语言变更事件:", e);
    }
  } catch (error) {
    console.error("设置语言时发生错误:", error);
  }
}

/**
 * 兼容性测试函数 - 检查多语系系统是否正常工作
 * 测试以下功能:
 * 1. LocalStorage 是否可用
 * 2. 语言切换功能是否正常
 * 3. 翻译应用是否正常
 * 4. 动态内容翻译是否正常
 *
 * @returns {Object} 测试结果对象
 */
function i18nCompatibilityTest() {
  const results = {
    localStorage: false,
    languageSwitch: false,
    translations: false,
    dynamicContent: false,
    details: {
      errors: [],
      warnings: [],
      info: [],
    },
  };

  // 测试 LocalStorage 是否可用
  try {
    results.localStorage = storageAvailable("localStorage");
    results.details.info.push(
      "LocalStorage " + (results.localStorage ? "可用" : "不可用")
    );
  } catch (e) {
    results.details.errors.push("测试 LocalStorage 时发生错误: " + e.message);
  }

  // 测试语言切换功能
  try {
    // 保存当前语言
    const originalLang =
      document.documentElement.lang ||
      localStorage.getItem("preferred-language") ||
      "zh-CN";

    // 尝试切换语言
    const testLang = originalLang === "en" ? "zh-CN" : "en";

    // 使用安全的语言切换方式
    if (typeof enhancedSetLanguage === "function") {
      enhancedSetLanguage(testLang);
    } else if (typeof setLanguage === "function") {
      setLanguage(testLang);
    } else {
      throw new Error("找不到语言切换函数");
    }

    // 检查语言是否成功切换
    const newLang =
      document.documentElement.lang ||
      localStorage.getItem("preferred-language");

    results.languageSwitch = newLang === testLang;
    results.details.info.push(
      "语言切换 " + (results.languageSwitch ? "正常" : "异常")
    );

    // 恢复原来的语言
    if (typeof enhancedSetLanguage === "function") {
      enhancedSetLanguage(originalLang);
    } else if (typeof setLanguage === "function") {
      setLanguage(originalLang);
    }
  } catch (e) {
    results.details.errors.push("测试语言切换时发生错误: " + e.message);
  }

  // 测试翻译应用是否正常
  try {
    // 查找页面上有 data-i18n 属性的元素
    const translatedElements = document.querySelectorAll("[data-i18n]");
    if (translatedElements.length > 0) {
      // 检查是否有内容
      let hasContent = false;
      translatedElements.forEach((el) => {
        if (el.textContent && el.textContent.trim() !== "") {
          hasContent = true;
        }
      });

      results.translations = hasContent;
      results.details.info.push(
        "找到 " +
          translatedElements.length +
          " 个翻译元素，内容" +
          (hasContent ? "正常" : "异常")
      );
    } else {
      results.details.warnings.push("页面上找不到带有 data-i18n 属性的元素");
    }
  } catch (e) {
    results.details.errors.push("测试翻译应用时发生错误: " + e.message);
  }

  // 测试动态内容翻译
  try {
    if (
      typeof createDynamicElement === "function" &&
      typeof translateText === "function"
    ) {
      // 创建测试元素
      const testKey = "test.dynamic";
      const testDefault = "测试动态内容";
      const testElement = createDynamicElement(testKey, testDefault);

      // 检查元素是否正确创建
      if (
        testElement &&
        testElement.getAttribute("data-i18n") === testKey &&
        testElement.textContent === testDefault
      ) {
        results.dynamicContent = true;
      }

      results.details.info.push(
        "动态内容翻译 " + (results.dynamicContent ? "正常" : "异常")
      );
    } else {
      results.details.warnings.push("动态内容翻译功能不可用");
    }
  } catch (e) {
    results.details.errors.push("测试动态内容翻译时发生错误: " + e.message);
  }

  // 输出测试结果摘要
  console.log(
    "多语系兼容性测试结果:",
    results.localStorage && results.languageSwitch && results.translations
      ? "通过 ✅"
      : "部分功能异常 ⚠️"
  );
  console.table({
    LocalStorage可用: results.localStorage ? "✅" : "❌",
    语言切换功能: results.languageSwitch ? "✅" : "❌",
    翻译应用: results.translations ? "✅" : "❌",
    动态内容翻译: results.dynamicContent ? "✅" : "❌",
  });

  if (results.details.errors.length > 0) {
    console.error("错误:", results.details.errors);
  }

  if (results.details.warnings.length > 0) {
    console.warn("警告:", results.details.warnings);
  }

  return results;
}

// 自动运行兼容性测试并将结果保存到全局变量
window.addEventListener("load", function () {
  // 延迟执行测试，确保页面完全加载
  setTimeout(function () {
    try {
      window.i18nTestResults = i18nCompatibilityTest();
    } catch (e) {
      console.error("执行多语系兼容性测试时发生错误:", e);
    }
  }, 1000);
});
