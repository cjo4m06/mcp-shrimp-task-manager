获取当前项目上下文信息，包括项目检测状态、数据目录配置和环境变量设置。用于了解当前工作环境和任务存储位置。

此工具使用新的MCP风格项目检测系统，提供全面的项目上下文信息，包括：
- 项目根目录和标识信息
- 项目类型检测（Git、Node.js、Python、Rust、Go）
- 使用的检测方法（显式配置、环境变量、自动检测、回退）
- 包信息（如果可用）
- 数据目录路径和配置
- AI使用建议，优化工作流程

## 📁 数据存储集成

此工具会根据我们的标准化规则自动设置数据存储结构：

```
$DATA_DIR/
├── logs/                           # 系统日志
├── projects/                       # 项目特定数据
│   └── $PROJECT_NAME/             # 当前项目数据
│       ├── tasks.json             # 项目任务
│       ├── memory/                # AI记忆存储
│       ├── logs/                  # 项目特定日志
│       └── config/                # 项目配置
└── global/                        # 全局设置
```

**创建的关键路径：**
- 任务: `$DATA_DIR/projects/$PROJECT_NAME/tasks.json`
- 记忆: `$DATA_DIR/projects/$PROJECT_NAME/memory/`
- 日志: `$DATA_DIR/projects/$PROJECT_NAME/logs/`

**使用说明：** 在使用其他项目相关工具之前，请始终先调用此工具以确保正确的项目上下文和数据目录设置。
