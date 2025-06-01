# 🤖 AI助手系统上下文

## 数据存储规则

所有数据必须存储在 `DATA_DIR` 目录下，遵循以下结构：

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

### 关键文件路径：
- **任务**: `$DATA_DIR/projects/$PROJECT_NAME/tasks.json`
- **记忆**: `$DATA_DIR/projects/$PROJECT_NAME/memory/`
- **日志**: `$DATA_DIR/projects/$PROJECT_NAME/logs/app-YYYY-MM-DD.log`
- **配置**: `$DATA_DIR/projects/$PROJECT_NAME/config/`

### 环境变量：
- `DATA_DIR`: 所有数据的基础目录（如缺失会自动创建）
- `PROJECT_NAME`: 当前项目标识符（从项目根目录自动检测）

## 工作流程指南

### 1. 项目上下文设置
**始终以此开始：** `get_project_context()` 确保正确的路径配置。

### 2. 路径验证
使用 `show_path_status()` 验证当前数据目录设置。

### 3. 多项目支持
在项目间切换时使用 `set_project_working_directory()`。

### 4. 数据访问模式
- **任务**: 使用任务相关工具（list_tasks、execute_task等）
- **记忆**: 存储在项目特定的记忆目录中
- **日志**: 由日志系统自动处理

## 错误处理

### 常见问题：
1. **检测到错误项目**: 使用 `set_project_working_directory` 纠正
2. **缺失DATA_DIR**: 系统将创建 `./data` 作为回退
3. **权限错误**: 确保对DATA_DIR有写入权限

### 诊断工具：
- `analyze_working_directory`: 诊断路径检测问题
- `diagnose_mcp_environment`: 检查MCP环境设置
- `get_project_context`: 验证当前项目配置

## 最佳实践

### 任务管理：
1. 首先调用 `get_project_context`
2. 使用项目特定的任务存储
3. 维护任务依赖关系和状态
4. 记录重要操作

### 记忆管理：
1. 将记忆存储在项目特定目录中
2. 按日期或主题组织以便检索
3. 使用一致的命名约定

### 多项目工作流：
1. 切换时设置明确的项目路径
2. 验证项目间数据隔离
3. 需要时使用持久化配置

## 集成说明

此系统设计用于与MCP（模型上下文协议）环境无缝协作，其中：
- `process.cwd()` 可能指向IDE安装目录
- 多个项目需要隔离的数据存储
- AI助手需要清晰的数据组织指导
- 路径检测必须在不同环境中可靠工作
