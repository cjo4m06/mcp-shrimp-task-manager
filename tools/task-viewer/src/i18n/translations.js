export const translations = {
  en: {
    // Header
    appTitle: "🦐 Shrimp Task Manager Viewer",
    version: "Version",
    releaseNotes: "Release Notes",
    help: "Help",
    language: "Language",
    
    // Navigation tabs
    tasks: "Tasks",
    templates: "Templates",
    projects: "Projects",
    
    // Template Management
    templateManagement: "🎨 Template Management",
    templateManagementDesc: "Manage prompt templates for all task manager functions. Edit, duplicate, or reset templates to customize AI behavior.",
    exportTemplates: "📤 Export Templates",
    exportTemplatesDesc: "Export your template configurations to share with your team or backup for later use",
    
    // Template columns
    function: "Function",
    description: "Description",
    status: "Status",
    actions: "Actions",
    
    // Template statuses
    statusDefault: "Default",
    statusCustom: "Custom",
    statusCustomAppend: "Custom+Append",
    
    // Template actions
    edit: "Edit",
    editTemplate: "✏️ Edit Template",
    preview: "Preview",
    previewTemplate: "Preview: {name}",
    duplicate: "Duplicate",
    duplicateTemplate: "📋 Duplicate Template",
    activate: "Activate",
    activateTemplate: "🚀 Activate Template",
    reset: "Reset",
    resetToDefault: "Reset to default template",
    
    // Common actions
    save: "Save",
    cancel: "Cancel",
    back: "Back",
    backToTemplates: "← Back to Templates",
    close: "Close",
    
    // Duplicate Template View
    whyDuplicate: "📚 Why Duplicate Templates?",
    duplicateExplanation: "Duplicating templates allows you to create specialized versions of existing templates for different use cases:",
    createVariations: "🎯 Creating Variations",
    createVariationsDesc: "Make specialized versions for different contexts:",
    safeExperimentation: "🧪 Safe Experimentation",
    safeExperimentationDesc: "Test changes without affecting your working template:",
    templateLibraries: "📂 Template Libraries",
    templateLibrariesDesc: "Build collections of related templates:",
    versionManagement: "💾 Version Management",
    versionManagementDesc: "Keep different versions for different needs:",
    
    // Duplicate form
    createDuplicate: "📝 Create Duplicate",
    originalTemplate: "Original Template",
    newTemplateName: "New Template Name",
    required: "*",
    nameHint: "Choose a descriptive name that indicates the purpose or variation of this duplicate",
    whatWillHappen: "📋 What will happen:",
    createNewTemplate: "Create new template",
    copyContent: "Copy content",
    independentEditing: "Independent editing",
    readyToUse: "Ready to use",
    
    // Export Templates
    exportTemplateConfigurations: "Export Template Configurations",
    exportFormat: "Export Format:",
    exportOnlyModified: "Export only modified templates (recommended)",
    exportHint: "When checked, only exports templates that have been customized or overridden",
    
    // Activation Dialog
    whatIsEnvVar: "📋 What is an Environment Variable?",
    envVarExplanation: "Environment variables are settings that programs can read when they start. The MCP server checks for custom template variables to override its default prompts. By setting {envVar}, you're telling the MCP server to use your edited template instead of the built-in one.",
    whyNeedThis: "Why do we need this?",
    whyNeedThisExplanation: "When Claude starts the MCP server, it reads these environment variables to customize how it responds. Without setting this variable, your template edits won't be used.",
    howToSetVariable: "🚀 How to Set This Variable",
    chooseCommand: "Choose the appropriate command below based on your setup. These commands will export the variable to your shell configuration file (like ~/.bashrc or ~/.zshrc) so it's available when Claude starts.",
    
    // Messages
    loading: "Loading...",
    error: "Error",
    success: "Success",
    noTemplatesFound: "No templates found",
    failedToLoad: "Failed to load",
    
    // Pagination
    showing: "Showing",
    to: "to",
    of: "of",
    page: "Page",
    filteredFrom: "filtered from",
    total: "total",
    
    // Statistics
    totalTemplates: "Total Templates",
    totalNumberOfTemplates: "Total number of templates",
    numberOfDefaultTemplates: "Number of default templates",
    numberOfCustomTemplates: "Number of custom templates",
    numberOfEnvOverrideTemplates: "Number of environment overridden templates",
    default: "Default",
    custom: "Custom", 
    envOverride: "Env Override",
    
    // Project management
    readme: "Readme",
    addTab: "Add Project",
    history: "History",
    viewProjectHistory: "View project history",
    totalTasks: "Total Tasks",
    completed: "Completed",
    inProgress: "In Progress",
    pending: "Pending",
    autoRefresh: "Auto-refresh",
    initialRequest: "Initial Request",
    
    // History management
    backToTasks: "Back to Tasks",
    backToHistory: "Back to History",
    projectHistory: "Project History",
    dateTime: "Date/Time",
    taskCount: "Task Count",
    notes: "Notes",
    statusSummary: "Status Summary",
    viewTasks: "View Tasks",
    noHistoryFound: "No History Found",
    noHistoryDescription: "No historical task snapshots are available for this project",
    historyRowTitle: "History entry - click View Tasks to see details",
    historyEntries: "history entries",
    tasksFrom: "Tasks from",
    taskName: "Task Name",
    noDependencies: "None",
    created: "Created",
    noTasksFound: "No Tasks Found",
    noTasksMessage: "The tasks.json file hasn't been created yet. Run shrimp in this folder to generate tasks.",
    noTasksInHistory: "This history snapshot contains no tasks",
    taskRowTitle: "Task details from historical snapshot",
    
    // Search and UI
    searchTemplatesPlaceholder: "🔍 Search templates...",
    searchTemplatesTitle: "Search and filter templates by function name or description",
    refreshTemplateData: "Refresh template data",
    searchTasksPlaceholder: "🔍 Search tasks...",
    searchTasksTitle: "Search and filter tasks by any text content",
    refreshCurrentProfile: "Refresh current project data - reload tasks from file",
    
    // Project management
    editProjectSettings: "Edit Project Settings",
    chooseProfileTitle: "Choose a project from the dropdown above",
    selectProfileToViewTasks: "Select a project to view tasks",
    noProfilesAvailable: "No projects available",
    noProfilesClickAddTab: "No projects available. Click \"Add Project\" to create one.",
    loadingTasksFromFile: "Loading tasks from file",
    loadingTasks: "Loading tasks... ⏳",
    
    // Add/Edit Project forms
    addNewProfile: "Add New Project",
    profileName: "Project Name",
    profileNamePlaceholder: "e.g., Team Alpha Tasks",
    profileNameTitle: "Enter a descriptive name for this project",
    taskFolderPath: "Task Folder Path",
    taskFolderPathPlaceholder: "/path/to/shrimp_data_folder",
    taskFolderPathTitle: "Enter the path to your shrimp data folder containing tasks.json",
    tip: "Tip",
    navigateToFolder: "Navigate to your shrimp data folder in terminal and",
    typePwd: "type pwd to get the full path",
    example: "Example",
    projectRootPath: "Project Root Path",
    projectRootPlaceholder: "e.g., /home/user/my-project",
    projectRootTitle: "Enter the absolute path to the project root directory",
    projectRootHint: "This enables clickable file links that open in VS Code",
    optional: "optional",
    addProfile: "Add Project",
    cancelAndCloseDialog: "Cancel and close this dialog",
    addProject: "Add Project",
    
    // Edit Project specific
    projectRoot: "Project Root",
    taskPath: "Task Path",
    editProfileNameTitle: "Edit the project name",
    projectRootEditPlaceholder: "e.g., /home/user/projects/my-project",
    projectRootEditTitle: "Set the project root path to enable VS Code file links",
    projectRootEditHint: "Set this to enable clickable VS Code links for task files",
    taskPathPlaceholder: "/path/to/shrimp_data_folder/tasks.json",
    taskPathTitle: "Edit the path to the tasks.json file for this project",
    taskPathHint: "Path to the tasks.json file containing the project's task data",
    saveChanges: "Save Changes",
    
    // Toast messages with parameters
    profileAddedSuccess: "Project \"{name}\" added successfully!",
    profileRemovedSuccess: "Project \"{name}\" removed successfully!",
    templateSavedSuccess: "Template \"{name}\" saved successfully!",
    templateResetSuccess: "Template \"{name}\" reset to default!",
    templateDuplicatedSuccess: "Template duplicated as \"{name}\"!",
    rememberToRestartClaude: "💡 Remember to restart Claude Code after setting environment variables",
    
    // Confirmation dialogs
    confirmRemoveProfile: "Are you sure you want to remove this project? This action cannot be undone.",
    confirmResetTemplate: "Are you sure you want to reset {name} to default? This will remove any customizations.",
    
    // Template activation
    defaultTemplateAlreadyActive: "Default template is already active - no activation needed",
    
    // Duplicate Template View additional keys
    noTemplateSelected: "No template selected",
    pleaseEnterDuplicateName: "Please enter a name for the duplicate template",
    duplicateNameMustBeDifferent: "Duplicate name must be different from the original",
    failedToDuplicateTemplate: "Failed to duplicate template",
    backToTemplateList: "Back to template list",
    creatingDuplicate: "Creating Duplicate...",
    
    // Task Table
    task: "TASK",
    taskName: "Task Name",
    created: "Created",
    updated: "Updated",
    dependencies: "Dependencies",
    noTasksFound: "No tasks found in this project",
    noDescriptionProvided: "No description provided",
    viewTask: "View task",
    clickToCopyUuid: "Click to copy UUID to clipboard",
    copyTaskInstruction: "Copy the following to the clipboard: Use task manager to complete this shrimp task",
    useTaskManager: "Use task manager to complete this shrimp task",
    clickToViewTaskDetails: "Click to view task details",
    
    // Template Editor
    saving: "Saving...",
    saveTemplate: "Save Template",
    
    // Project Settings
    projectSettings: "Project Settings",
    settingsSaved: "Settings saved successfully",
    settings: "Settings",
    
    // Global Settings
    globalSettings: "Global Settings",
    claudeFolderPath: "Claude Folder Path",
    claudeFolderPathDesc: "If you specify your Claude folder path, you will have access to sub-agent and hook settings",
    claudeFolderPathPlaceholder: "e.g., ~/.config/claude",
    
    // Task messages
    taskSavedSuccess: "Task saved successfully",
    confirmDeleteTask: "Are you sure you want to delete this task?",
    taskDeletedSuccess: "Task deleted successfully",
    deleteTask: "Delete task",
    
    // Bulk status reset
    resetToPending: "Reset to Pending",
    resetTasksConfirmTitle: "Reset Tasks to Pending",
    resetTasksConfirmMessage: "This will reset {count} completed task(s) back to pending status. Completion data will be cleared.",
    resetTasksSuccess: "Successfully reset {count} task(s) to pending status",
    resetTasksFailed: "Failed to update task statuses",
    
    // Bulk mark as completed
    markAsCompleted: "Mark as Completed",
    markTasksCompleted: "Mark Tasks as Completed",
    markTasksCompletedMessage: "Are you sure you want to mark {count} task(s) as completed?",
    markTasksCompletedSuccess: "Successfully marked {count} task(s) as completed",
    markTasksCompletedFailed: "Failed to mark tasks as completed",
    
    // Agent functionality
    subAgents: "Sub-Agents",
    agents: "Agents", 
    agentName: "Agent Name",
    type: "Type",
    viewAgent: "View Agent",
    editAgent: "Edit Agent",
    noAgentsFound: "No agents found",
    agentSavedSuccess: "Agent saved successfully",
    aiInstruction: "AI Instruction"
  },
  
  zh: {
    // Header
    appTitle: "🦐 虾米任务管理器查看器",
    version: "版本",
    releaseNotes: "发布说明",
    help: "帮助",
    language: "语言",
    
    // Navigation tabs
    tasks: "任务",
    templates: "模板",
    projects: "项目",
    
    // Template Management
    templateManagement: "🎨 模板管理",
    templateManagementDesc: "管理所有任务管理器功能的提示模板。编辑、复制或重置模板以自定义 AI 行为。",
    exportTemplates: "📤 导出模板",
    exportTemplatesDesc: "导出您的模板配置以与团队共享或备份以供日后使用",
    
    // Template columns
    function: "功能",
    description: "描述",
    status: "状态",
    actions: "操作",
    
    // Template statuses
    statusDefault: "默认",
    statusCustom: "自定义",
    statusCustomAppend: "自定义+追加",
    
    // Template actions
    edit: "编辑",
    editTemplate: "✏️ 编辑模板",
    preview: "预览",
    previewTemplate: "预览：{name}",
    duplicate: "复制",
    duplicateTemplate: "📋 复制模板",
    activate: "激活",
    activateTemplate: "🚀 激活模板",
    reset: "重置",
    resetToDefault: "重置为默认模板",
    
    // Common actions
    save: "保存",
    cancel: "取消",
    back: "返回",
    backToTemplates: "← 返回模板列表",
    close: "关闭",
    
    // Duplicate Template View
    whyDuplicate: "📚 为什么要复制模板？",
    duplicateExplanation: "复制模板允许您为不同的用例创建现有模板的专门版本：",
    createVariations: "🎯 创建变体",
    createVariationsDesc: "为不同上下文制作专门版本：",
    safeExperimentation: "🧪 安全实验",
    safeExperimentationDesc: "在不影响工作模板的情况下测试更改：",
    templateLibraries: "📂 模板库",
    templateLibrariesDesc: "构建相关模板的集合：",
    versionManagement: "💾 版本管理",
    versionManagementDesc: "根据不同需求保留不同版本：",
    
    // Duplicate form
    createDuplicate: "📝 创建副本",
    originalTemplate: "原始模板",
    newTemplateName: "新模板名称",
    required: "*",
    nameHint: "选择一个能说明此副本用途或变体的描述性名称",
    whatWillHappen: "📋 将会发生什么：",
    createNewTemplate: "创建新模板",
    copyContent: "复制内容",
    independentEditing: "独立编辑",
    readyToUse: "准备使用",
    
    // Export Templates
    exportTemplateConfigurations: "导出模板配置",
    exportFormat: "导出格式：",
    exportOnlyModified: "仅导出修改过的模板（推荐）",
    exportHint: "选中后，仅导出已自定义或覆盖的模板",
    
    // Activation Dialog
    whatIsEnvVar: "📋 什么是环境变量？",
    envVarExplanation: "环境变量是程序启动时可以读取的设置。MCP 服务器会检查自定义模板变量以覆盖其默认提示。通过设置 {envVar}，您告诉 MCP 服务器使用您编辑的模板而不是内置模板。",
    whyNeedThis: "为什么需要这个？",
    whyNeedThisExplanation: "当 Claude 启动 MCP 服务器时，它会读取这些环境变量来自定义响应方式。如果不设置此变量，您的模板编辑将不会被使用。",
    howToSetVariable: "🚀 如何设置此变量",
    chooseCommand: "根据您的设置选择下面的适当命令。这些命令会将变量导出到您的 shell 配置文件（如 ~/.bashrc 或 ~/.zshrc），以便在 Claude 启动时可用。",
    
    // Messages
    loading: "加载中...",
    error: "错误",
    success: "成功",
    noTemplatesFound: "未找到模板",
    failedToLoad: "加载失败",
    
    // Pagination
    showing: "显示",
    to: "至",
    of: "共",
    page: "页",
    filteredFrom: "筛选自",
    total: "总计",
    
    // Statistics
    totalTemplates: "模板总数",
    totalNumberOfTemplates: "模板总数",
    numberOfDefaultTemplates: "默认模板数量",
    numberOfCustomTemplates: "自定义模板数量",
    numberOfEnvOverrideTemplates: "环境覆盖模板数量",
    default: "默认",
    custom: "自定义", 
    envOverride: "环境覆盖",
    
    // Project management
    readme: "说明文档",
    addTab: "添加项目",
    history: "历史记录",
    viewProjectHistory: "查看项目历史记录",
    totalTasks: "任务总数",
    completed: "已完成",
    inProgress: "进行中",
    pending: "待处理",
    autoRefresh: "自动刷新",
    initialRequest: "初始请求",
    
    // History management
    backToTasks: "返回任务",
    backToHistory: "返回历史记录",
    projectHistory: "项目历史",
    dateTime: "日期/时间",
    taskCount: "任务数量",
    notes: "备注",
    statusSummary: "状态摘要",
    viewTasks: "查看任务",
    noHistoryFound: "未找到历史记录",
    noHistoryDescription: "此项目没有可用的历史任务快照",
    historyRowTitle: "历史条目 - 点击查看任务查看详情",
    historyEntries: "历史条目",
    tasksFrom: "任务来自",
    taskName: "任务名称",
    noDependencies: "无",
    created: "创建时间",
    noTasksFound: "未找到任务",
    noTasksInHistory: "此历史快照不包含任务",
    taskRowTitle: "来自历史快照的任务详情",
    
    // Search and UI
    searchTemplatesPlaceholder: "🔍 搜索模板...",
    searchTemplatesTitle: "按功能名称或描述搜索和筛选模板",
    refreshTemplateData: "刷新模板数据",
    searchTasksPlaceholder: "🔍 搜索任务...",
    searchTasksTitle: "按任何文本内容搜索和筛选任务",
    refreshCurrentProfile: "刷新当前项目数据 - 从文件重新加载任务",
    
    // Project management
    editProjectSettings: "编辑项目设置",
    chooseProfileTitle: "从上面的下拉菜单中选择项目",
    selectProfileToViewTasks: "选择项目以查看任务",
    noProfilesAvailable: "没有可用的项目",
    noProfilesClickAddTab: "没有可用的项目。点击\"添加项目\"创建一个。",
    loadingTasksFromFile: "从文件加载任务",
    loadingTasks: "加载任务中... ⏳",
    
    // Add/Edit Project forms
    addNewProfile: "添加新项目",
    profileName: "项目名称",
    profileNamePlaceholder: "例如，团队 Alpha 任务",
    profileNameTitle: "为此项目输入描述性名称",
    taskFolderPath: "任务文件夹路径",
    taskFolderPathPlaceholder: "/path/to/shrimp_data_folder",
    taskFolderPathTitle: "输入包含 tasks.json 的虾米数据文件夹路径",
    tip: "提示",
    navigateToFolder: "在终端中导航到您的虾米数据文件夹并",
    typePwd: "输入 pwd 获取完整路径",
    example: "示例",
    projectRootPath: "项目根路径",
    projectRootPlaceholder: "例如，/home/user/my-project",
    projectRootTitle: "输入项目根目录的绝对路径",
    projectRootHint: "这启用了在 VS Code 中打开的可点击文件链接",
    optional: "可选",
    addProfile: "添加项目",
    cancelAndCloseDialog: "取消并关闭对话框",
    addProject: "添加项目",
    
    // Edit Project specific
    projectRoot: "项目根目录",
    taskPath: "任务路径",
    editProfileNameTitle: "编辑项目名称",
    projectRootEditPlaceholder: "例如，/home/user/projects/my-project",
    projectRootEditTitle: "设置项目根路径以启用 VS Code 文件链接",
    projectRootEditHint: "设置此项以启用任务文件的可点击 VS Code 链接",
    taskPathPlaceholder: "/path/to/shrimp_data_folder/tasks.json",
    taskPathTitle: "编辑此项目的 tasks.json 文件路径",
    taskPathHint: "包含项目任务数据的 tasks.json 文件路径",
    saveChanges: "保存更改",
    
    // Toast messages with parameters
    profileAddedSuccess: "项目\"{name}\"添加成功！",
    profileRemovedSuccess: "项目\"{name}\"删除成功！",
    templateSavedSuccess: "模板\"{name}\"保存成功！",
    templateResetSuccess: "模板\"{name}\"重置为默认！",
    templateDuplicatedSuccess: "模板复制为\"{name}\"！",
    rememberToRestartClaude: "💡 记住在设置环境变量后重启 Claude Code",
    
    // Confirmation dialogs
    confirmRemoveProfile: "您确定要删除此项目吗？此操作无法撤消。",
    confirmResetTemplate: "您确定要将 {name} 重置为默认吗？这将删除任何自定义设置。",
    
    // Template activation
    defaultTemplateAlreadyActive: "默认模板已经激活 - 无需激活",
    
    // Duplicate Template View additional keys
    noTemplateSelected: "未选择模板",
    pleaseEnterDuplicateName: "请为复制模板输入名称",
    duplicateNameMustBeDifferent: "复制名称必须与原始名称不同",
    failedToDuplicateTemplate: "复制模板失败",
    backToTemplateList: "返回模板列表",
    creatingDuplicate: "正在创建副本...",
    
    // Task Table
    task: "任务",
    taskName: "任务名称",
    created: "创建时间",
    updated: "更新时间",
    dependencies: "依赖项",
    noTasksFound: "此项目中未找到任务",
    noDescriptionProvided: "未提供描述",
    viewTask: "查看任务",
    clickToCopyUuid: "点击复制 UUID 到剪贴板",
    copyTaskInstruction: "复制以下内容到剪贴板：使用任务管理器完成此虾米任务",
    useTaskManager: "使用任务管理器完成此虾米任务",
    clickToViewTaskDetails: "点击查看任务详情",
    
    // Template Editor
    saving: "保存中...",
    saveTemplate: "保存模板",
    
    // Project Settings
    projectSettings: "项目设置",
    settingsSaved: "设置保存成功",
    settings: "设置",
    
    // Global Settings
    globalSettings: "全局设置",
    claudeFolderPath: "Claude 文件夹路径",
    claudeFolderPathDesc: "如果您指定 Claude 文件夹路径，您将能够访问子代理和钩子设置",
    claudeFolderPathPlaceholder: "例如：~/.config/claude",
    
    // Task messages
    taskSavedSuccess: "任务保存成功",
    confirmDeleteTask: "您确定要删除此任务吗？",
    taskDeletedSuccess: "任务删除成功",
    deleteTask: "删除任务",
    
    // Bulk status reset
    resetToPending: "重置为待处理",
    resetTasksConfirmTitle: "重置任务为待处理",
    resetTasksConfirmMessage: "这将把 {count} 个已完成的任务重置为待处理状态。完成数据将被清除。",
    resetTasksSuccess: "成功重置 {count} 个任务为待处理状态",
    resetTasksFailed: "更新任务状态失败",
    
    // Bulk mark as completed
    markAsCompleted: "标记为已完成",
    markTasksCompleted: "标记任务为已完成",
    markTasksCompletedMessage: "确定要将 {count} 个任务标记为已完成吗？",
    markTasksCompletedSuccess: "成功标记 {count} 个任务为已完成",
    markTasksCompletedFailed: "标记任务为已完成失败",
    
    // Agent functionality
    subAgents: "子代理",
    agents: "代理",
    agentName: "代理名称", 
    type: "类型",
    viewAgent: "查看代理",
    editAgent: "编辑代理",
    noAgentsFound: "未找到代理",
    agentSavedSuccess: "代理保存成功",
    aiInstruction: "AI 指令"
  },
  
  es: {
    // Header
    appTitle: "🦐 Visor del Gestor de Tareas Shrimp",
    version: "Versión",
    releaseNotes: "Notas de la versión",
    help: "Ayuda",
    language: "Idioma",
    
    // Navigation tabs
    tasks: "Tareas",
    templates: "Plantillas",
    projects: "Proyectos",
    
    // Template Management
    templateManagement: "🎨 Gestión de Plantillas",
    templateManagementDesc: "Gestiona las plantillas de prompts para todas las funciones del gestor de tareas. Edita, duplica o restablece plantillas para personalizar el comportamiento de la IA.",
    exportTemplates: "📤 Exportar Plantillas",
    exportTemplatesDesc: "Exporta tus configuraciones de plantillas para compartir con tu equipo o hacer copias de seguridad",
    
    // Template columns
    function: "Función",
    description: "Descripción",
    status: "Estado",
    actions: "Acciones",
    
    // Template statuses
    statusDefault: "Predeterminado",
    statusCustom: "Personalizado",
    statusCustomAppend: "Personalizado+Añadir",
    
    // Template actions
    edit: "Editar",
    editTemplate: "✏️ Editar Plantilla",
    preview: "Vista previa",
    previewTemplate: "Vista previa: {name}",
    duplicate: "Duplicar",
    duplicateTemplate: "📋 Duplicar Plantilla",
    activate: "Activar",
    activateTemplate: "🚀 Activar Plantilla",
    reset: "Restablecer",
    resetToDefault: "Restablecer a plantilla predeterminada",
    
    // Common actions
    save: "Guardar",
    cancel: "Cancelar",
    back: "Atrás",
    backToTemplates: "← Volver a Plantillas",
    close: "Cerrar",
    
    // Duplicate Template View
    whyDuplicate: "📚 ¿Por qué duplicar plantillas?",
    duplicateExplanation: "Duplicar plantillas te permite crear versiones especializadas de plantillas existentes para diferentes casos de uso:",
    createVariations: "🎯 Crear Variaciones",
    createVariationsDesc: "Crea versiones especializadas para diferentes contextos:",
    safeExperimentation: "🧪 Experimentación Segura",
    safeExperimentationDesc: "Prueba cambios sin afectar tu plantilla de trabajo:",
    templateLibraries: "📂 Bibliotecas de Plantillas",
    templateLibrariesDesc: "Construye colecciones de plantillas relacionadas:",
    versionManagement: "💾 Gestión de Versiones",
    versionManagementDesc: "Mantén diferentes versiones para diferentes necesidades:",
    
    // Duplicate form
    createDuplicate: "📝 Crear Duplicado",
    originalTemplate: "Plantilla Original",
    newTemplateName: "Nombre de la Nueva Plantilla",
    required: "*",
    nameHint: "Elige un nombre descriptivo que indique el propósito o variación de este duplicado",
    whatWillHappen: "📋 ¿Qué sucederá?",
    createNewTemplate: "Crear nueva plantilla",
    copyContent: "Copiar contenido",
    independentEditing: "Edición independiente",
    readyToUse: "Lista para usar",
    
    // Export Templates
    exportTemplateConfigurations: "Exportar Configuraciones de Plantillas",
    exportFormat: "Formato de exportación:",
    exportOnlyModified: "Exportar solo plantillas modificadas (recomendado)",
    exportHint: "Cuando está marcado, solo exporta plantillas que han sido personalizadas o sobrescritas",
    
    // Activation Dialog
    whatIsEnvVar: "📋 ¿Qué es una Variable de Entorno?",
    envVarExplanation: "Las variables de entorno son configuraciones que los programas pueden leer cuando se inician. El servidor MCP verifica las variables de plantilla personalizadas para sobrescribir sus prompts predeterminados. Al establecer {envVar}, le estás diciendo al servidor MCP que use tu plantilla editada en lugar de la incorporada.",
    whyNeedThis: "¿Por qué necesitamos esto?",
    whyNeedThisExplanation: "Cuando Claude inicia el servidor MCP, lee estas variables de entorno para personalizar cómo responde. Sin establecer esta variable, tus ediciones de plantilla no se utilizarán.",
    howToSetVariable: "🚀 Cómo Establecer Esta Variable",
    chooseCommand: "Elige el comando apropiado a continuación según tu configuración. Estos comandos exportarán la variable a tu archivo de configuración del shell (como ~/.bashrc o ~/.zshrc) para que esté disponible cuando Claude se inicie.",
    
    // Messages
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    noTemplatesFound: "No se encontraron plantillas",
    failedToLoad: "Error al cargar",
    
    // Pagination
    showing: "Mostrando",
    to: "a",
    of: "de",
    page: "Página",
    filteredFrom: "filtrado de",
    total: "total",
    
    // Statistics
    totalTemplates: "Total de Plantillas",
    totalNumberOfTemplates: "Número total de plantillas",
    numberOfDefaultTemplates: "Número de plantillas predeterminadas",
    numberOfCustomTemplates: "Número de plantillas personalizadas",
    numberOfEnvOverrideTemplates: "Número de plantillas sobrescritas por el entorno",
    default: "Predeterminado",
    custom: "Personalizado", 
    envOverride: "Sobrescrito por Entorno",
    
    // Project management
    readme: "Léeme",
    addTab: "Agregar Proyecto",
    history: "Historial",
    viewProjectHistory: "Ver historial del proyecto",
    totalTasks: "Total de Tareas",
    completed: "Completadas",
    inProgress: "En Progreso",
    pending: "Pendientes",
    autoRefresh: "Actualización automática",
    initialRequest: "Solicitud Inicial",
    
    // History management
    backToTasks: "Volver a Tareas",
    backToHistory: "Volver al Historial",
    projectHistory: "Historial del Proyecto",
    dateTime: "Fecha/Hora",
    taskCount: "Cantidad de Tareas",
    notes: "Notas",
    statusSummary: "Resumen de Estado",
    viewTasks: "Ver Tareas",
    noHistoryFound: "No se Encontró Historial",
    noHistoryDescription: "No hay instantáneas históricas de tareas disponibles para este proyecto",
    historyRowTitle: "Entrada de historial - haz clic en Ver Tareas para ver detalles",
    historyEntries: "entradas de historial",
    tasksFrom: "Tareas de",
    taskName: "Nombre de Tarea",
    noDependencies: "Ninguna",
    created: "Creado",
    noTasksFound: "No se Encontraron Tareas",
    noTasksInHistory: "Esta instantánea histórica no contiene tareas",
    taskRowTitle: "Detalles de tareas de instantánea histórica",
    
    // Search and UI
    searchTemplatesPlaceholder: "🔍 Buscar plantillas...",
    searchTemplatesTitle: "Buscar y filtrar plantillas por nombre de función o descripción",
    refreshTemplateData: "Actualizar datos de plantillas",
    searchTasksPlaceholder: "🔍 Buscar tareas...",
    searchTasksTitle: "Buscar y filtrar tareas por cualquier contenido de texto",
    refreshCurrentProfile: "Actualizar datos del proyecto actual - recargar tareas desde archivo",
    
    // Project management
    editProjectSettings: "Editar Configuración del Proyecto",
    chooseProfileTitle: "Elige un proyecto del menú desplegable de arriba",
    selectProfileToViewTasks: "Selecciona un proyecto para ver las tareas",
    noProfilesAvailable: "No hay proyectos disponibles",
    noProfilesClickAddTab: "No hay proyectos disponibles. Haz clic en \"Agregar Proyecto\" para crear uno.",
    loadingTasksFromFile: "Cargando tareas desde archivo",
    loadingTasks: "Cargando tareas... ⏳",
    
    // Add/Edit Project forms
    addNewProfile: "Agregar Nuevo Proyecto",
    profileName: "Nombre del Proyecto",
    profileNamePlaceholder: "ej., Tareas del Equipo Alpha",
    profileNameTitle: "Ingresa un nombre descriptivo para este proyecto",
    taskFolderPath: "Ruta de la Carpeta de Tareas",
    taskFolderPathPlaceholder: "/ruta/a/carpeta_datos_shrimp",
    taskFolderPathTitle: "Ingresa la ruta a tu carpeta de datos shrimp que contiene tasks.json",
    tip: "Consejo",
    navigateToFolder: "Navega a tu carpeta de datos shrimp en terminal y",
    typePwd: "escribe pwd para obtener la ruta completa",
    example: "Ejemplo",
    projectRootPath: "Ruta Raíz del Proyecto",
    projectRootPlaceholder: "ej., /home/usuario/mi-proyecto",
    projectRootTitle: "Ingresa la ruta absoluta al directorio raíz del proyecto",
    projectRootHint: "Esto habilita enlaces de archivos clicables que se abren en VS Code",
    optional: "opcional",
    addProfile: "Agregar Proyecto",
    cancelAndCloseDialog: "Cancelar y cerrar diálogo",
    addProject: "Agregar Proyecto",
    
    // Edit Project specific
    projectRoot: "Raíz del Proyecto",
    taskPath: "Ruta de Tareas",
    editProfileNameTitle: "Editar el nombre del proyecto",
    projectRootEditPlaceholder: "ej., /home/usuario/proyectos/mi-proyecto",
    projectRootEditTitle: "Establece la ruta raíz del proyecto para habilitar enlaces de archivos VS Code",
    projectRootEditHint: "Establece esto para habilitar enlaces VS Code clicables para archivos de tareas",
    taskPathPlaceholder: "/ruta/a/carpeta_datos_shrimp/tasks.json",
    taskPathTitle: "Editar la ruta al archivo tasks.json para este proyecto",
    taskPathHint: "Ruta al archivo tasks.json que contiene los datos de tareas del proyecto",
    saveChanges: "Guardar Cambios",
    
    // Toast messages with parameters
    profileAddedSuccess: "¡Proyecto \"{name}\" agregado exitosamente!",
    profileRemovedSuccess: "¡Proyecto \"{name}\" eliminado exitosamente!",
    templateSavedSuccess: "¡Plantilla \"{name}\" guardada exitosamente!",
    templateResetSuccess: "¡Plantilla \"{name}\" restablecida a predeterminada!",
    templateDuplicatedSuccess: "¡Plantilla duplicada como \"{name}\"!",
    rememberToRestartClaude: "💡 Recuerda reiniciar Claude Code después de establecer variables de entorno",
    
    // Confirmation dialogs
    confirmRemoveProfile: "¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.",
    confirmResetTemplate: "¿Estás seguro de que quieres restablecer {name} a predeterminado? Esto eliminará cualquier personalización.",
    
    // Template activation
    defaultTemplateAlreadyActive: "La plantilla predeterminada ya está activa - no necesita activación",
    
    // Duplicate Template View additional keys
    noTemplateSelected: "Ninguna plantilla seleccionada",
    pleaseEnterDuplicateName: "Por favor ingresa un nombre para la plantilla duplicada",
    duplicateNameMustBeDifferent: "El nombre del duplicado debe ser diferente del original",
    failedToDuplicateTemplate: "Error al duplicar plantilla",
    backToTemplateList: "Volver a la lista de plantillas",
    creatingDuplicate: "Creando Duplicado...",
    
    // Task Table
    task: "TAREA",
    taskName: "Nombre de Tarea",
    created: "Creado",
    updated: "Actualizado",
    dependencies: "Dependencias",
    noTasksFound: "No se encontraron tareas en este proyecto",
    noDescriptionProvided: "No se proporcionó descripción",
    viewTask: "Ver tarea",
    clickToCopyUuid: "Haz clic para copiar UUID al portapapeles",
    copyTaskInstruction: "Copiar lo siguiente al portapapeles: Usa el gestor de tareas para completar esta tarea shrimp",
    useTaskManager: "Usa el gestor de tareas para completar esta tarea shrimp",
    clickToViewTaskDetails: "Haz clic para ver detalles de la tarea",
    
    // Template Editor
    saving: "Guardando...",
    saveTemplate: "Guardar Plantilla",
    
    // Project Settings
    projectSettings: "Configuración del Proyecto",
    settingsSaved: "Configuración guardada exitosamente",
    settings: "Configuración",
    
    // Global Settings
    globalSettings: "Configuración Global",
    claudeFolderPath: "Ruta de la Carpeta Claude",
    claudeFolderPathDesc: "Si especifica la ruta de su carpeta Claude, tendrá acceso a la configuración de sub-agentes y hooks",
    claudeFolderPathPlaceholder: "p.ej., ~/.config/claude",
    
    // Task messages
    taskSavedSuccess: "Tarea guardada exitosamente",
    confirmDeleteTask: "¿Está seguro de que desea eliminar esta tarea?",
    taskDeletedSuccess: "Tarea eliminada exitosamente",
    deleteTask: "Eliminar tarea",
    
    // Bulk status reset
    resetToPending: "Restablecer a Pendiente",
    resetTasksConfirmTitle: "Restablecer Tareas a Pendiente",
    resetTasksConfirmMessage: "Esto restablecerá {count} tarea(s) completada(s) al estado pendiente. Los datos de finalización se borrarán.",
    resetTasksSuccess: "Se restablecieron con éxito {count} tarea(s) al estado pendiente",
    resetTasksFailed: "Error al actualizar los estados de las tareas",
    
    // Bulk mark as completed
    markAsCompleted: "Marcar como Completado",
    markTasksCompleted: "Marcar Tareas como Completadas",
    markTasksCompletedMessage: "¿Está seguro de que desea marcar {count} tarea(s) como completada(s)?",
    markTasksCompletedSuccess: "Se marcaron exitosamente {count} tarea(s) como completada(s)",
    markTasksCompletedFailed: "Error al marcar las tareas como completadas",
    
    // Agent functionality
    subAgents: "Sub-Agentes",
    agents: "Agentes",
    agentName: "Nombre del Agente",
    type: "Tipo", 
    viewAgent: "Ver Agente",
    editAgent: "Editar Agente",
    noAgentsFound: "No se encontraron agentes",
    agentSavedSuccess: "Agente guardado exitosamente",
    aiInstruction: "Instrucción IA"
  },

  pt: {
    // Header
    appTitle: "🦐 Visualizador do Gerenciador de Tarefas Shrimp",
    version: "Versão",
    releaseNotes: "Notas de Lançamento",
    help: "Ajuda",
    language: "Idioma",
    
    // Navigation tabs
    tasks: "Tarefas",
    templates: "Templates",
    projects: "Projetos",
    
    // Template Management
    templateManagement: "🎨 Gerenciamento de Templates",
    templateManagementDesc: "Gerencie templates de prompts para todas as funções do gerenciador de tarefas. Edite, duplique ou redefina templates para personalizar o comportamento da IA.",
    exportTemplates: "📤 Exportar Templates",
    exportTemplatesDesc: "Exporte suas configurações de templates para compartilhar com sua equipe ou fazer backup para uso posterior",
    
    // Template columns
    function: "Função",
    description: "Descrição",
    status: "Status",
    actions: "Ações",
    
    // Template statuses
    statusDefault: "Padrão",
    statusCustom: "Personalizado",
    statusCustomAppend: "Personalizado+Anexar",
    
    // Template actions
    edit: "Editar",
    editTemplate: "✏️ Editar Template",
    preview: "Visualizar",
    previewTemplate: "Visualizar: {name}",
    duplicate: "Duplicar",
    duplicateTemplate: "📋 Duplicar Template",
    activate: "Ativar",
    activateTemplate: "🚀 Ativar Template",
    reset: "Redefinir",
    resetToDefault: "Redefinir para template padrão",
    
    // Common actions
    save: "Salvar",
    cancel: "Cancelar",
    back: "Voltar",
    backToTemplates: "← Voltar aos Templates",
    close: "Fechar",
    
    // Project management
    readme: "Leia-me",
    addTab: "Adicionar Projeto",
    history: "Histórico",
    viewProjectHistory: "Ver histórico do projeto",
    totalTasks: "Total de Tarefas",
    completed: "Concluídas",
    inProgress: "Em Progresso",
    pending: "Pendentes",
    autoRefresh: "Atualização automática",
    initialRequest: "Solicitação Inicial",
    
    // History management
    backToTasks: "Voltar às Tarefas",
    backToHistory: "Voltar ao Histórico",
    projectHistory: "Histórico do Projeto",
    dateTime: "Data/Hora",
    taskCount: "Quantidade de Tarefas",
    notes: "Anotações",
    statusSummary: "Resumo do Status",
    viewTasks: "Ver Tarefas",
    noHistoryFound: "Nenhum Histórico Encontrado",
    noHistoryDescription: "Nenhum snapshot histórico de tarefas está disponível para este projeto",
    historyRowTitle: "Entrada de histórico - clique em Ver Tarefas para ver detalhes",
    historyEntries: "entradas de histórico",
    tasksFrom: "Tarefas de",
    taskName: "Nome da Tarefa",
    noDependencies: "Nenhuma",
    created: "Criado",
    noTasksFound: "Nenhuma Tarefa Encontrada",
    noTasksMessage: "O arquivo tasks.json ainda não foi criado. Execute shrimp nesta pasta para gerar tarefas.",
    noTasksInHistory: "Este snapshot histórico não contém tarefas",
    taskRowTitle: "Detalhes da tarefa do snapshot histórico",
    
    // Search and UI
    searchTemplatesPlaceholder: "🔍 Procurar templates...",
    searchTemplatesTitle: "Pesquisar e filtrar templates por nome de função ou descrição",
    refreshTemplateData: "Atualizar dados dos templates",
    searchTasksPlaceholder: "🔍 Procurar tarefas...",
    searchTasksTitle: "Pesquisar e filtrar tarefas por qualquer conteúdo de texto",
    refreshCurrentProfile: "Atualizar dados do projeto atual - recarregar tarefas do arquivo",
    
    // Project management
    editProjectSettings: "Editar Configurações do Projeto",
    chooseProfileTitle: "Escolha um projeto no menu suspenso acima",
    selectProfileToViewTasks: "Selecione um projeto para ver as tarefas",
    noProfilesAvailable: "Nenhum projeto disponível",
    noProfilesClickAddTab: "Nenhum projeto disponível. Clique em \"Adicionar Projeto\" para criar um.",
    loadingTasksFromFile: "Carregando tarefas do arquivo",
    loadingTasks: "Carregando tarefas... ⏳",
    
    // Add/Edit Project forms
    addNewProfile: "Adicionar Novo Projeto",
    profileName: "Nome do Projeto",
    profileNamePlaceholder: "ex., Tarefas da Equipe Alpha",
    profileNameTitle: "Digite um nome descritivo para este projeto",
    taskFolderPath: "Caminho da Pasta de Tarefas",
    taskFolderPathPlaceholder: "/caminho/para/pasta_dados_shrimp",
    taskFolderPathTitle: "Digite o caminho para sua pasta de dados shrimp contendo tasks.json",
    tip: "Dica",
    navigateToFolder: "Navegue até sua pasta de dados shrimp no terminal e",
    typePwd: "digite pwd para obter o caminho completo",
    example: "Exemplo",
    projectRootPath: "Caminho Raiz do Projeto",
    projectRootPlaceholder: "ex., /home/usuario/meu-projeto",
    projectRootTitle: "Digite o caminho absoluto para o diretório raiz do projeto",
    projectRootHint: "Isso habilita links de arquivos clicáveis que abrem no VS Code",
    optional: "opcional",
    addProfile: "Adicionar Projeto",
    cancelAndCloseDialog: "Cancelar e fechar este diálogo",
    addProject: "Adicionar Projeto",
    
    // Edit Project specific
    projectRoot: "Raiz do Projeto",
    taskPath: "Caminho da Tarefa",
    editProfileNameTitle: "Editar o nome do projeto",
    projectRootEditPlaceholder: "ex., /home/usuario/projetos/meu-projeto",
    projectRootEditTitle: "Definir o caminho raiz do projeto para habilitar links de arquivos do VS Code",
    projectRootEditHint: "Configure isso para habilitar links clicáveis do VS Code para arquivos de tarefas",
    taskPathPlaceholder: "/caminho/para/pasta_dados_shrimp/tasks.json",
    taskPathTitle: "Editar o caminho para o arquivo tasks.json para este projeto",
    taskPathHint: "Caminho para o arquivo tasks.json contendo os dados de tarefas do projeto",
    saveChanges: "Salvar Alterações",
    
    // Toast messages with parameters
    profileAddedSuccess: "Projeto \"{name}\" adicionado com sucesso!",
    profileRemovedSuccess: "Projeto \"{name}\" removido com sucesso!",
    templateSavedSuccess: "Template \"{name}\" salvo com sucesso!",
    templateResetSuccess: "Template \"{name}\" redefinido para padrão!",
    templateDuplicatedSuccess: "Template duplicado como \"{name}\"!",
    rememberToRestartClaude: "💡 Lembre-se de reiniciar o Claude Code após definir variáveis de ambiente",
    
    // Confirmation dialogs
    confirmRemoveProfile: "Tem certeza de que deseja remover este projeto? Esta ação não pode ser desfeita.",
    confirmResetTemplate: "Tem certeza de que deseja redefinir {name} para padrão? Isso removerá qualquer personalização.",
    
    // Template activation
    defaultTemplateAlreadyActive: "Template padrão já está ativo - não precisa de ativação",
    
    // Task Table
    task: "TAREFA",
    taskName: "Nome da Tarefa",
    created: "Criado",
    updated: "Atualizado",
    dependencies: "Dependências",
    noTasksFound: "Nenhuma tarefa encontrada neste projeto",
    noDescriptionProvided: "Nenhuma descrição fornecida",
    viewTask: "Ver tarefa",
    clickToCopyUuid: "Clique para copiar UUID para área de transferência",
    copyTaskInstruction: "Copiar o seguinte para a área de transferência: Use o gerenciador de tarefas para completar esta tarefa shrimp",
    useTaskManager: "Use o gerenciador de tarefas para completar esta tarefa shrimp",
    clickToViewTaskDetails: "Clique para ver detalhes da tarefa",
    
    // Template Editor
    saving: "Salvando...",
    saveTemplate: "Salvar Template",
    
    // Project Settings
    projectSettings: "Configurações do Projeto",
    settingsSaved: "Configurações salvas com sucesso",
    settings: "Configurações",
    
    // Global Settings
    globalSettings: "Configurações Globais",
    claudeFolderPath: "Caminho da Pasta Claude",
    claudeFolderPathDesc: "Se você especificar o caminho da sua pasta Claude, terá acesso às configurações de sub-agentes e hooks",
    claudeFolderPathPlaceholder: "ex., ~/.config/claude",
    
    // Task messages
    taskSavedSuccess: "Tarefa salva com sucesso",
    confirmDeleteTask: "Tem certeza de que deseja excluir esta tarefa?",
    taskDeletedSuccess: "Tarefa excluída com sucesso",
    deleteTask: "Excluir tarefa",
    
    // Bulk status reset
    resetToPending: "Redefinir para Pendente",
    resetTasksConfirmTitle: "Redefinir Tarefas para Pendente",
    resetTasksConfirmMessage: "Isso redefinirá {count} tarefa(s) concluída(s) para o status pendente. Os dados de conclusão serão apagados.",
    resetTasksSuccess: "Redefinidas com sucesso {count} tarefa(s) para o status pendente",
    resetTasksFailed: "Falha ao atualizar os status das tarefas",
    
    // Bulk mark as completed
    markAsCompleted: "Marcar como Concluído",
    markTasksCompleted: "Marcar Tarefas como Concluídas",
    markTasksCompletedMessage: "Tem certeza de que deseja marcar {count} tarefa(s) como concluída(s)?",
    markTasksCompletedSuccess: "Marcou com sucesso {count} tarefa(s) como concluída(s)",
    markTasksCompletedFailed: "Falha ao marcar as tarefas como concluídas",
    
    // Agent functionality
    subAgents: "Sub-Agentes",
    agents: "Agentes",
    agentName: "Nome do Agente",
    type: "Tipo",
    viewAgent: "Ver Agente",
    editAgent: "Editar Agente",
    noAgentsFound: "Nenhum agente encontrado",
    agentSavedSuccess: "Agente salvo com sucesso",
    aiInstruction: "Instrução de IA",
    
    // Messages
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    noTemplatesFound: "Nenhum template encontrado",
    failedToLoad: "Falha ao carregar",
    
    // Pagination
    showing: "Mostrando",
    to: "até",
    of: "de",
    page: "Página",
    filteredFrom: "filtrados de",
    total: "total",
    
    // Statistics
    totalTemplates: "Total de Templates",
    totalNumberOfTemplates: "Número total de templates",
    numberOfDefaultTemplates: "Número de templates padrão",
    numberOfCustomTemplates: "Número de templates personalizados",
    numberOfEnvOverrideTemplates: "Número de templates sobrescritos por ambiente",
    default: "Padrão",
    custom: "Personalizado", 
    envOverride: "Sobrescrito por Ambiente"
  },

  tr: {
    // Header
    appTitle: "🦐 Shrimp Görev Yöneticisi Görüntüleyici",
    version: "Sürüm",
    releaseNotes: "Sürüm Notları",
    help: "Yardım",
    language: "Dil",
    
    // Navigation tabs
    tasks: "Görevler",
    templates: "Şablonlar",
    projects: "Projeler",
    
    // Template Management
    templateManagement: "🎨 Şablon Yönetimi",
    templateManagementDesc: "Tüm görev yöneticisi işlevleri için prompt şablonlarını yönetin. AI davranışını özelleştirmek için şablonları düzenleyin, çoğaltın veya sıfırlayın.",
    exportTemplates: "📤 Şablonları Dışa Aktar",
    exportTemplatesDesc: "Ekibinizle paylaşmak veya daha sonra kullanmak üzere yedeklemek için şablon yapılandırmalarınızı dışa aktarın",
    
    // Template columns
    function: "İşlev",
    description: "Açıklama",
    status: "Durum",
    actions: "Eylemler",
    
    // Template statuses
    statusDefault: "Varsayılan",
    statusCustom: "Özel",
    statusCustomAppend: "Özel+Ekle",
    
    // Template actions
    edit: "Düzenle",
    editTemplate: "✏️ Şablonu Düzenle",
    preview: "Önizleme",
    previewTemplate: "Önizleme: {name}",
    duplicate: "Çoğalt",
    duplicateTemplate: "📋 Şablonu Çoğalt",
    activate: "Etkinleştir",
    activateTemplate: "🚀 Şablonu Etkinleştir",
    reset: "Sıfırla",
    resetToDefault: "Varsayılan şablona sıfırla",
    
    // Common actions
    save: "Kaydet",
    cancel: "İptal",
    back: "Geri",
    backToTemplates: "← Şablonlara Geri Dön",
    close: "Kapat",
    
    // Project management
    readme: "Beni Oku",
    addTab: "Proje Ekle",
    history: "Geçmiş",
    viewProjectHistory: "Proje geçmişini görüntüle",
    totalTasks: "Toplam Görevler",
    completed: "Tamamlanmış",
    inProgress: "Devam Eden",
    pending: "Bekleyen",
    autoRefresh: "Otomatik yenileme",
    initialRequest: "İlk Talep",
    
    // History management
    backToTasks: "Görevlere Geri Dön",
    backToHistory: "Geçmişe Geri Dön",
    projectHistory: "Proje Geçmişi",
    dateTime: "Tarih/Saat",
    taskCount: "Görev Sayısı",
    notes: "Notlar",
    statusSummary: "Durum Özeti",
    viewTasks: "Görevleri Görüntüle",
    noHistoryFound: "Geçmiş Bulunamadı",
    noHistoryDescription: "Bu proje için mevcut geçmiş görev anlık görüntüleri yok",
    historyRowTitle: "Geçmiş girişi - detayları görmek için Görevleri Görüntüle'ye tıklayın",
    historyEntries: "geçmiş girişleri",
    tasksFrom: "Görevler şundan:",
    taskName: "Görev Adı",
    noDependencies: "Yok",
    created: "Oluşturuldu",
    noTasksFound: "Görev Bulunamadı",
    noTasksMessage: "tasks.json dosyası henüz oluşturulmadı. Görevler oluşturmak için bu klasörde shrimp çalıştırın.",
    noTasksInHistory: "Bu geçmiş anlık görüntüsü görev içermiyor",
    taskRowTitle: "Geçmiş anlık görüntüsünden görev detayları",
    
    // Search and UI
    searchTemplatesPlaceholder: "🔍 Şablonları ara...",
    searchTemplatesTitle: "İşlev adı veya açıklamaya göre şablonları ara ve filtrele",
    refreshTemplateData: "Şablon verilerini yenile",
    searchTasksPlaceholder: "🔍 Görevleri ara...",
    searchTasksTitle: "Herhangi bir metin içeriğine göre görevleri ara ve filtrele",
    refreshCurrentProfile: "Mevcut proje verilerini yenile - dosyadan görevleri yeniden yükle",
    
    // Project management
    editProjectSettings: "Proje Ayarlarını Düzenle",
    chooseProfileTitle: "Yukarıdaki açılır menüden bir proje seçin",
    selectProfileToViewTasks: "Görevleri görüntülemek için bir proje seçin",
    noProfilesAvailable: "Mevcut proje yok",
    noProfilesClickAddTab: "Mevcut proje yok. Bir tane oluşturmak için \"Proje Ekle\"ye tıklayın.",
    loadingTasksFromFile: "Dosyadan görevler yükleniyor",
    loadingTasks: "Görevler yükleniyor... ⏳",
    
    // Add/Edit Project forms
    addNewProfile: "Yeni Proje Ekle",
    profileName: "Proje Adı",
    profileNamePlaceholder: "örn., Takım Alpha Görevleri",
    profileNameTitle: "Bu proje için açıklayıcı bir ad girin",
    taskFolderPath: "Görev Klasörü Yolu",
    taskFolderPathPlaceholder: "/yol/to/shrimp_veri_klasoru",
    taskFolderPathTitle: "tasks.json içeren shrimp veri klasörünüzün yolunu girin",
    tip: "İpucu",
    navigateToFolder: "Terminalde shrimp veri klasörünüze gidin ve",
    typePwd: "tam yolu almak için pwd yazın",
    example: "Örnek",
    projectRootPath: "Proje Kök Yolu",
    projectRootPlaceholder: "örn., /home/kullanici/projem",
    projectRootTitle: "Proje kök dizininin mutlak yolunu girin",
    projectRootHint: "Bu, VS Code'da açılan tıklanabilir dosya bağlantılarını etkinleştirir",
    optional: "isteğe bağlı",
    addProfile: "Proje Ekle",
    cancelAndCloseDialog: "İptal et ve bu diyalogu kapat",
    addProject: "Proje Ekle",
    
    // Edit Project specific
    projectRoot: "Proje Kökü",
    taskPath: "Görev Yolu",
    editProfileNameTitle: "Proje adını düzenle",
    projectRootEditPlaceholder: "örn., /home/kullanici/projeler/projem",
    projectRootEditTitle: "VS Code dosya bağlantılarını etkinleştirmek için proje kök yolunu ayarla",
    projectRootEditHint: "Görev dosyaları için tıklanabilir VS Code bağlantılarını etkinleştirmek için bunu ayarlayın",
    taskPathPlaceholder: "/yol/to/shrimp_veri_klasoru/tasks.json",
    taskPathTitle: "Bu proje için tasks.json dosyasının yolunu düzenle",
    taskPathHint: "Projenin görev verilerini içeren tasks.json dosyasının yolu",
    saveChanges: "Değişiklikleri Kaydet",
    
    // Toast messages with parameters
    profileAddedSuccess: "Proje \"{name}\" başarıyla eklendi!",
    profileRemovedSuccess: "Proje \"{name}\" başarıyla kaldırıldı!",
    templateSavedSuccess: "Şablon \"{name}\" başarıyla kaydedildi!",
    templateResetSuccess: "Şablon \"{name}\" varsayılana sıfırlandı!",
    templateDuplicatedSuccess: "Şablon \"{name}\" olarak çoğaltıldı!",
    rememberToRestartClaude: "💡 Çevre değişkenlerini ayarladıktan sonra Claude Code'u yeniden başlatmayı unutmayın",
    
    // Confirmation dialogs
    confirmRemoveProfile: "Bu projeyi kaldırmak istediğinizden emin misiniz? Bu eylem geri alınamaz.",
    confirmResetTemplate: "{name} şablonunu varsayılana sıfırlamak istediğinizden emin misiniz? Bu, tüm özelleştirmeleri kaldıracak.",
    
    // Template activation
    defaultTemplateAlreadyActive: "Varsayılan şablon zaten etkin - etkinleştirme gerekmiyor",
    
    // Task Table
    task: "GÖREV",
    taskName: "Görev Adı",
    created: "Oluşturuldu",
    updated: "Güncellendi",
    dependencies: "Bağımlılıklar",
    noTasksFound: "Bu projede görev bulunamadı",
    noDescriptionProvided: "Açıklama sağlanmadı",
    viewTask: "Görevi görüntüle",
    clickToCopyUuid: "UUID'yi panoya kopyalamak için tıklayın",
    copyTaskInstruction: "Aşağıdakini panoya kopyala: Bu shrimp görevini tamamlamak için görev yöneticisini kullan",
    useTaskManager: "Bu shrimp görevini tamamlamak için görev yöneticisini kullan",
    clickToViewTaskDetails: "Görev detaylarını görüntülemek için tıklayın",
    
    // Template Editor
    saving: "Kaydediliyor...",
    saveTemplate: "Şablonu Kaydet",
    
    // Project Settings
    projectSettings: "Proje Ayarları",
    settingsSaved: "Ayarlar başarıyla kaydedildi",
    settings: "Ayarlar",
    
    // Global Settings
    globalSettings: "Genel Ayarlar",
    claudeFolderPath: "Claude Klasör Yolu",
    claudeFolderPathDesc: "Claude klasör yolunuzu belirtirseniz, alt ajan ve hook ayarlarına erişiminiz olacak",
    claudeFolderPathPlaceholder: "örn., ~/.config/claude",
    
    // Task messages
    taskSavedSuccess: "Görev başarıyla kaydedildi",
    confirmDeleteTask: "Bu görevi silmek istediğinizden emin misiniz?",
    taskDeletedSuccess: "Görev başarıyla silindi",
    deleteTask: "Görevi sil",
    
    // Bulk status reset
    resetToPending: "Beklemeye Sıfırla",
    resetTasksConfirmTitle: "Görevleri Beklemeye Sıfırla",
    resetTasksConfirmMessage: "Bu işlem {count} tamamlanmış görevi beklemede durumuna sıfırlayacak. Tamamlanma verileri silinecek.",
    resetTasksSuccess: "{count} görev başarıyla beklemede durumuna sıfırlandı",
    resetTasksFailed: "Görev durumları güncellenemedi",
    
    // Bulk mark as completed
    markAsCompleted: "Tamamlandı Olarak İşaretle",
    markTasksCompleted: "Görevleri Tamamlandı Olarak İşaretle",
    markTasksCompletedMessage: "{count} görevi tamamlandı olarak işaretlemek istediğinizden emin misiniz?",
    markTasksCompletedSuccess: "{count} görev başarıyla tamamlandı olarak işaretlendi",
    markTasksCompletedFailed: "Görevler tamamlandı olarak işaretlenemedi",
    
    // Agent functionality
    subAgents: "Alt Ajanlar",
    agents: "Ajanlar",
    agentName: "Ajan Adı",
    type: "Tip",
    viewAgent: "Ajanı Görüntüle",
    editAgent: "Ajanı Düzenle",
    noAgentsFound: "Ajan bulunamadı",
    agentSavedSuccess: "Ajan başarıyla kaydedildi",
    aiInstruction: "AI Talimatı",
    
    // Messages
    loading: "Yükleniyor...",
    error: "Hata",
    success: "Başarılı",
    noTemplatesFound: "Şablon bulunamadı",
    failedToLoad: "Yükleme başarısız",
    
    // Pagination
    showing: "Gösteriliyor",
    to: "ile",
    of: "arasında",
    page: "Sayfa",
    filteredFrom: "filtrelendi",
    total: "toplam",
    
    // Statistics
    totalTemplates: "Toplam Şablonlar",
    totalNumberOfTemplates: "Toplam şablon sayısı",
    numberOfDefaultTemplates: "Varsayılan şablon sayısı",
    numberOfCustomTemplates: "Özel şablon sayısı",
    numberOfEnvOverrideTemplates: "Çevre tarafından geçersiz kılınmış şablon sayısı",
    default: "Varsayılan",
    custom: "Özel", 
    envOverride: "Çevre Geçersiz Kılma"
  },
  
  ko: {
    // Header
    appTitle: "🦐 새우 작업 관리자 뷰어",
    version: "버전",
    releaseNotes: "릴리스 노트",
    help: "도움말",
    language: "언어",
    
    // Navigation tabs
    tasks: "작업",
    templates: "템플릿",
    projects: "프로젝트",
    
    // Template Management
    templateManagement: "🎨 템플릿 관리",
    templateManagementDesc: "모든 작업 관리자 기능에 대한 프롬프트 템플릿을 관리합니다. 템플릿을 편집, 복제 또는 재설정하여 AI 동작을 사용자 정의하세요.",
    exportTemplates: "📤 템플릿 내보내기",
    exportTemplatesDesc: "팀과 공유하거나 나중에 사용하기 위해 백업할 템플릿 구성을 내보냅니다",
    
    // Template columns
    function: "기능",
    description: "설명",
    status: "상태",
    actions: "작업",
    
    // Template statuses
    statusDefault: "기본",
    statusCustom: "사용자 정의",
    statusCustomAppend: "사용자 정의+추가",
    
    // Template actions
    edit: "편집",
    editTemplate: "✏️ 템플릿 편집",
    preview: "미리보기",
    previewTemplate: "미리보기: {name}",
    duplicate: "복제",
    duplicateTemplate: "📋 템플릿 복제",
    activate: "활성화",
    activateTemplate: "🚀 템플릿 활성화",
    reset: "재설정",
    resetToDefault: "기본 템플릿으로 재설정",
    
    // Common actions
    save: "저장",
    cancel: "취소",
    back: "뒤로",
    backToTemplates: "← 템플릿으로 돌아가기",
    close: "닫기",
    
    // Common UI elements
    loading: "로딩 중...",
    error: "오류",
    success: "성공",
    warning: "경고",
    info: "정보",
    
    // Profile Management
    profileManagement: "🔧 프로필 관리",
    profileManagementDesc: "작업 파일 프로필을 관리합니다. 새 프로필을 생성하거나 기존 프로필을 편집하세요.",
    taskFolderPath: "작업 폴더 경로",
    taskFolderPathPlaceholder: "작업 파일이 포함된 폴더 경로 입력",
    profileName: "프로필 이름",
    profileNamePlaceholder: "프로필 이름 입력",
    projectRootPath: "프로젝트 루트 경로",
    projectRootPathPlaceholder: "프로젝트 루트 경로 입력 (선택사항)",
    addProfile: "프로필 추가",
    editProfile: "프로필 편집",
    deleteProfile: "프로필 삭제",
    
    // Task Table
    taskNumber: "작업 번호",
    taskName: "작업 이름",
    taskStatus: "상태",
    dependencies: "의존성",
    assignedAgent: "할당된 에이전트",
    
    // Task statuses
    pending: "대기 중",
    inProgress: "진행 중",
    completed: "완료됨",
    
    // Bulk status reset
    resetToPending: '대기 중으로 재설정',
    resetTasksConfirmTitle: '작업을 대기 중으로 재설정',
    resetTasksConfirmMessage: '{count}개의 완료된 작업을 대기 중 상태로 재설정합니다. 완료 데이터가 삭제됩니다.',
    resetTasksSuccess: '{count}개의 작업을 대기 중 상태로 성공적으로 재설정했습니다',
    resetTasksFailed: '작업 상태 업데이트 실패',
    
    // Bulk mark as completed
    markAsCompleted: '완료로 표시',
    markTasksCompleted: '작업을 완료로 표시',
    markTasksCompletedMessage: '{count}개의 작업을 완료로 표시하시겠습니까?',
    markTasksCompletedSuccess: '{count}개의 작업을 성공적으로 완료로 표시했습니다',
    markTasksCompletedFailed: '작업을 완료로 표시하는데 실패했습니다',
    
    // Task actions
    viewDetails: "세부정보 보기",
    editTask: "작업 편집",
    copyUUID: "UUID 복사",
    copyAIInstruction: "AI 지시 복사",
    
    // Bulk operations
    bulkOperations: "일괄 작업",
    selectAll: "모두 선택",
    deselectAll: "모두 선택 해제",
    bulkAssignAgent: "에이전트 일괄 할당",
    bulkDelete: "일괄 삭제",
    
    // Task Detail View
    taskDetails: "작업 세부정보",
    relatedFiles: "관련 파일",
    verificationCriteria: "검증 기준",
    implementationGuide: "구현 가이드",
    notes: "메모",
    
    // Agent Management
    agentManagement: "🤖 에이전트 관리",
    agentManagementDesc: "AI 에이전트를 관리하고 작업에 할당합니다.",
    availableAgents: "사용 가능한 에이전트",
    assignAgent: "에이전트 할당",
    unassignAgent: "에이전트 할당 해제",
    agentInstructions: "에이전트 지시사항",
    
    // Project History
    projectHistory: "📊 프로젝트 기록",
    projectHistoryDesc: "프로젝트 작업 기록과 통계를 확인합니다.",
    historyEntries: "기록 항목",
    commitHistory: "커밋 기록",
    
    // Global Settings
    globalSettings: "⚙️ 전역 설정",
    globalSettingsDesc: "애플리케이션 전역 설정을 구성합니다.",
    settings: "설정",
    readme: "읽어보기",
    subAgents: "서브 에이전트",
    projectSettings: "프로젝트 설정",
    editProjectSettings: "프로젝트 설정 편집",
    settingsSaved: "설정이 성공적으로 저장되었습니다",
    openaiApiKey: "OpenAI API 키",
    openaiApiKeyPlaceholder: "OpenAI API 키 입력",
    
    // Notifications
    profileCreatedSuccess: "프로필이 성공적으로 생성되었습니다",
    profileUpdatedSuccess: "프로필이 성공적으로 업데이트되었습니다",
    profileDeletedSuccess: "프로필이 성공적으로 삭제되었습니다",
    taskUpdatedSuccess: "작업이 성공적으로 업데이트되었습니다",
    settingsSavedSuccess: "설정이 성공적으로 저장되었습니다",
    copiedToClipboard: "클립보드에 복사되었습니다",
    
    // Empty states
    noTasksFound: "작업을 찾을 수 없습니다",
    noProfilesFound: "프로필을 찾을 수 없습니다",
    noTemplatesFound: "템플릿을 찾을 수 없습니다",
    noHistoryFound: "기록을 찾을 수 없습니다",
    
    // File operations
    selectFolder: "폴더 선택",
    browseFolder: "폴더 찾아보기",
    invalidPath: "잘못된 경로입니다",
    pathNotFound: "경로를 찾을 수 없습니다",
    
    // Search and filters
    search: "검색",
    searchPlaceholder: "검색...",
    filter: "필터",
    filterByStatus: "상태별 필터",
    filterByAgent: "에이전트별 필터",
    
    // Pagination
    page: "페이지",
    of: "의",
    itemsPerPage: "페이지당 항목",
    showingItems: "{start}-{end} 항목 표시 (총 {total}개)",
    
    // Statistics
    totalTasks: "총 작업",
    completedTasks: "완료된 작업",
    pendingTasks: "대기 중 작업",
    inProgressTasks: "진행 중 작업",
    initialRequest: "초기 요청",
    
    // Agent related
    viewAgent: "에이전트 보기",
    editAgent: "에이전트 편집",
    noAgentsFound: "에이전트를 찾을 수 없습니다",
    agentSavedSuccess: "에이전트가 성공적으로 저장되었습니다",
    aiInstruction: "AI 지시사항"
  },
  
  ja: {
    // Header
    appTitle: "🦐 シュリンプタスクマネージャービューア",
    version: "バージョン",
    releaseNotes: "リリースノート",
    help: "ヘルプ",
    language: "言語",
    
    // Navigation tabs
    tasks: "タスク",
    templates: "テンプレート",
    projects: "プロジェクト",
    
    // Template Management
    templateManagement: "🎨 テンプレート管理",
    templateManagementDesc: "すべてのタスクマネージャー機能のプロンプトテンプレートを管理します。テンプレートを編集、複製、またはリセットしてAIの動作をカスタマイズします。",
    exportTemplates: "📤 テンプレートエクスポート",
    exportTemplatesDesc: "チームと共有したり、後で使用するためにバックアップするテンプレート設定をエクスポートします",
    
    // Template columns
    function: "機能",
    description: "説明",
    status: "ステータス",
    actions: "操作",
    
    // Template statuses
    statusDefault: "デフォルト",
    statusCustom: "カスタム",
    statusCustomAppend: "カスタム+追加",
    
    // Template actions
    edit: "編集",
    editTemplate: "✏️ テンプレート編集",
    preview: "プレビュー",
    previewTemplate: "プレビュー: {name}",
    duplicate: "複製",
    duplicateTemplate: "📋 テンプレート複製",
    activate: "アクティベート",
    activateTemplate: "🚀 テンプレートアクティベート",
    reset: "リセット",
    resetToDefault: "デフォルトテンプレートにリセット",
    
    // Common actions
    save: "保存",
    cancel: "キャンセル",
    back: "戻る",
    backToTemplates: "← テンプレートに戻る",
    close: "閉じる",
    
    // Common UI elements
    loading: "読み込み中...",
    error: "エラー",
    success: "成功",
    warning: "警告",
    info: "情報",
    
    // Profile Management
    profileManagement: "🔧 プロファイル管理",
    profileManagementDesc: "タスクファイルプロファイルを管理します。新しいプロファイルを作成するか、既存のプロファイルを編集します。",
    taskFolderPath: "タスクフォルダパス",
    taskFolderPathPlaceholder: "タスクファイルを含むフォルダパスを入力",
    profileName: "プロファイル名",
    profileNamePlaceholder: "プロファイル名を入力",
    projectRootPath: "プロジェクトルートパス",
    projectRootPathPlaceholder: "プロジェクトルートパスを入力（オプション）",
    addProfile: "プロファイル追加",
    editProfile: "プロファイル編集",
    deleteProfile: "プロファイル削除",
    
    // Task Table
    taskNumber: "タスク番号",
    taskName: "タスク名",
    taskStatus: "ステータス",
    dependencies: "依存関係",
    assignedAgent: "割り当てられたエージェント",
    
    // Task statuses
    pending: "保留中",
    inProgress: "進行中",
    completed: "完了",
    
    // Bulk status reset
    resetToPending: '保留中にリセット',
    resetTasksConfirmTitle: 'タスクを保留中にリセット',
    resetTasksConfirmMessage: '{count}個の完了タスクを保留中状態にリセットします。完了データは削除されます。',
    resetTasksSuccess: '{count}個のタスクを保留中状態に正常にリセットしました',
    resetTasksFailed: 'タスクステータスの更新に失敗しました',
    
    // Bulk mark as completed
    markAsCompleted: '完了としてマーク',
    markTasksCompleted: 'タスクを完了としてマーク',
    markTasksCompletedMessage: '{count}個のタスクを完了としてマークしますか？',
    markTasksCompletedSuccess: '{count}個のタスクを正常に完了としてマークしました',
    markTasksCompletedFailed: 'タスクを完了としてマークできませんでした',
    
    // Task actions
    viewDetails: "詳細表示",
    editTask: "タスク編集",
    copyUUID: "UUID をコピー",
    copyAIInstruction: "AI指示をコピー",
    
    // Bulk operations
    bulkOperations: "一括操作",
    selectAll: "すべて選択",
    deselectAll: "すべて選択解除",
    bulkAssignAgent: "エージェント一括割り当て",
    bulkDelete: "一括削除",
    
    // Task Detail View
    taskDetails: "タスク詳細",
    relatedFiles: "関連ファイル",
    verificationCriteria: "検証基準",
    implementationGuide: "実装ガイド",
    notes: "メモ",
    
    // Agent Management
    agentManagement: "🤖 エージェント管理",
    agentManagementDesc: "AIエージェントを管理し、タスクに割り当てます。",
    availableAgents: "利用可能なエージェント",
    assignAgent: "エージェント割り当て",
    unassignAgent: "エージェント割り当て解除",
    agentInstructions: "エージェント指示",
    
    // Project History
    projectHistory: "📊 プロジェクト履歴",
    projectHistoryDesc: "プロジェクトタスク履歴と統計を確認します。",
    historyEntries: "履歴エントリ",
    commitHistory: "コミット履歴",
    
    // Global Settings
    globalSettings: "⚙️ グローバル設定",
    globalSettingsDesc: "アプリケーションのグローバル設定を構成します。",
    settings: "設定",
    readme: "リードミー",
    subAgents: "サブエージェント",
    projectSettings: "プロジェクト設定",
    editProjectSettings: "プロジェクト設定を編集",
    settingsSaved: "設定が正常に保存されました",
    openaiApiKey: "OpenAI APIキー",
    openaiApiKeyPlaceholder: "OpenAI APIキーを入力",
    
    // Notifications
    profileCreatedSuccess: "プロファイルが正常に作成されました",
    profileUpdatedSuccess: "プロファイルが正常に更新されました",
    profileDeletedSuccess: "プロファイルが正常に削除されました",
    taskUpdatedSuccess: "タスクが正常に更新されました",
    settingsSavedSuccess: "設定が正常に保存されました",
    copiedToClipboard: "クリップボードにコピーされました",
    
    // Empty states
    noTasksFound: "タスクが見つかりません",
    noProfilesFound: "プロファイルが見つかりません",
    noTemplatesFound: "テンプレートが見つかりません",
    noHistoryFound: "履歴が見つかりません",
    
    // File operations
    selectFolder: "フォルダ選択",
    browseFolder: "フォルダを参照",
    invalidPath: "無効なパスです",
    pathNotFound: "パスが見つかりません",
    
    // Search and filters
    search: "検索",
    searchPlaceholder: "検索...",
    filter: "フィルター",
    filterByStatus: "ステータス別フィルター",
    filterByAgent: "エージェント別フィルター",
    
    // Pagination
    page: "ページ",
    of: "の",
    itemsPerPage: "ページあたりのアイテム",
    showingItems: "{start}-{end}項目を表示中（合計{total}件）",
    
    // Statistics
    totalTasks: "総タスク数",
    completedTasks: "完了タスク",
    pendingTasks: "保留中タスク",
    inProgressTasks: "進行中タスク",
    initialRequest: "初期リクエスト",
    
    // Agent related
    viewAgent: "エージェント表示",
    editAgent: "エージェント編集",
    noAgentsFound: "エージェントが見つかりません",
    agentSavedSuccess: "エージェントが正常に保存されました",
    aiInstruction: "AI指示"
  },
  
  // Thai
  th: {
    projects: "โครงการ",
    releaseNotes: "บันทึกการเผยแพร่",
    readme: "อ่านเพิ่มเติม",
    templates: "เทมเพลต",
    subAgents: "ตัวแทนย่อย",
    settings: "การตั้งค่า"
  },
  
  // Vietnamese
  vi: {
    projects: "Dự án",
    releaseNotes: "Ghi chú phát hành",
    readme: "Tài liệu",
    templates: "Mẫu",
    subAgents: "Tác nhân phụ",
    settings: "Cài đặt"
  },
  
  // Hindi
  hi: {
    projects: "परियोजनाएं",
    releaseNotes: "रिलीज़ नोट्स",
    readme: "रीडमी",
    templates: "टेम्प्लेट",
    subAgents: "उप-एजेंट",
    settings: "सेटिंग्स"
  },
  
  // Italian
  it: {
    projects: "Progetti",
    releaseNotes: "Note di rilascio",
    readme: "Leggimi",
    templates: "Modelli",
    subAgents: "Sotto-agenti",
    settings: "Impostazioni"
  },
  
  // French
  fr: {
    projects: "Projets",
    releaseNotes: "Notes de version",
    readme: "Lisez-moi",
    templates: "Modèles",
    subAgents: "Sous-agents",
    settings: "Paramètres"
  },
  
  // German
  de: {
    projects: "Projekte",
    releaseNotes: "Versionshinweise",
    readme: "Liesmich",
    templates: "Vorlagen",
    subAgents: "Unter-Agenten",
    settings: "Einstellungen"
  },
  
  // Russian
  ru: {
    projects: "Проекты",
    releaseNotes: "Примечания к выпуску",
    readme: "Прочитай меня",
    templates: "Шаблоны",
    subAgents: "Суб-агенты",
    settings: "Настройки"
  }
};

export const getTranslation = (lang, key, params = {}) => {
  // Default to 'en' if lang is null, undefined, or not a valid language
  const safeLang = lang && translations[lang] ? lang : 'en';
  const keys = key.split('.');
  let value = translations[safeLang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (!value) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  
  // Replace parameters like {name} with actual values
  let result = value;
  Object.entries(params).forEach(([param, val]) => {
    result = result.replace(`{${param}}`, val);
  });
  
  return result;
};