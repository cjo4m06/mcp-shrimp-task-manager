# 📁 数据存储规则

## 概述
所有数据都应存储在 `DATA_DIR` 目录下，采用清晰的层次结构。如果目录不存在会自动创建。

## 目录结构

### 基础数据目录
```
$DATA_DIR/
├── logs/                           # 系统日志
├── projects/                       # 项目特定数据
│   └── $PROJECT_NAME/             # 单个项目数据
│       ├── tasks.json             # 项目任务
│       ├── memory/                # AI记忆存储
│       ├── logs/                  # 项目特定日志
│       └── config/                # 项目配置
└── global/                        # 全局设置和缓存
    ├── config.json               # 全局配置
    └── cache/                    # 临时缓存文件
```

## 具体文件路径

### 日志
- **系统日志**: `$DATA_DIR/logs/app-YYYY-MM-DD.log`
- **项目日志**: `$DATA_DIR/projects/$PROJECT_NAME/logs/app-YYYY-MM-DD.log`

### 任务
- **项目任务**: `$DATA_DIR/projects/$PROJECT_NAME/tasks.json`
- **任务格式**: JSON数组，包含id、name、description、status、dependencies、timestamps等字段的任务对象

### 记忆
- **AI记忆**: `$DATA_DIR/projects/$PROJECT_NAME/memory/`
- **记忆文件**: 按日期或主题组织，便于高效检索

### 配置
- **项目配置**: `$DATA_DIR/projects/$PROJECT_NAME/config/`
- **全局配置**: `$DATA_DIR/global/config.json`

## 路径变量

### 环境变量
- `DATA_DIR`: 所有数据存储的基础目录（必需）
- `PROJECT_NAME`: 当前项目标识符（自动检测或手动设置）

### 自动检测规则
1. **PROJECT_NAME** 来源于：
   - 项目根目录名称（清理后）
   - package.json的name字段（如果可用）
   - 通过 `set_project_working_directory` 手动配置

2. **DATA_DIR** 默认值：
   - 环境变量 `DATA_DIR`（首选）
   - 相对于当前工作目录的 `./data`（回退）

## 使用指南

### 对于AI助手
1. **始终使用项目特定路径** 存储任务和记忆
2. **写入文件前检查目录是否存在**
3. **调用MCP工具时使用绝对路径**
4. **遵循层次结构** - 不要在错误位置创建文件

### 路径解析示例
```
# 如果 DATA_DIR=/home/user/.shrimp 且 PROJECT_NAME=my-app
任务文件: /home/user/.shrimp/projects/my-app/tasks.json
记忆目录: /home/user/.shrimp/projects/my-app/memory/
日志目录: /home/user/.shrimp/projects/my-app/logs/
```

### 错误处理
- 如果未设置 `DATA_DIR`，工具将使用 `./data` 作为回退
- 如果无法检测 `PROJECT_NAME`，工具将使用 `default-project`
- 缺失的目录会自动创建并设置适当权限

## 与MCP工具集成

### 使用这些路径的工具：
- `list_tasks`, `execute_task`, `delete_task` → tasks.json
- `get_project_context` → 项目检测和路径设置
- `view_realtime_logs` → 日志文件
- `set_project_working_directory` → 项目配置

### 最佳实践：
1. 首先调用 `get_project_context` 确保正确的路径设置
2. 使用 `show_path_status` 验证当前路径配置
3. 设置 `DATA_DIR` 环境变量以确保行为一致
4. 在多项目工作流中使用 `set_project_working_directory`
