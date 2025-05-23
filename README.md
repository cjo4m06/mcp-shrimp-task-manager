[English](docs/en/README.md) | [简体中文](README.md) | [繁體中文](docs/zh/README.md)

## 目录

- [✨ 功能特性](#features1)
- [🧭 使用指南](#usage-guide)
- [🧠 任务记忆功能](#task-memory-function)
- [📋 项目规范初始化](#project-rules)
- [🌐 Web GUI](#web-gui)
- [📚 文档资源](#documentation)
- [🔧 安装与使用](#installation)
- [🔌 与MCP兼容的客户端一起使用](#clients)
- [💡 系统提示指导](#prompt)
- [🛠️ 可用工具概览](#tools)
- [📄 许可证](#license)
- [🤖 推荐模型](#recommended)

# MCP 虾米任务管理器


> 🚀 一个基于模型上下文协议 (MCP) 的智能任务管理系统，为 AI Agent 提供高效的编程工作流框架。


虾米任务管理器通过结构化的工作流引导 Agent 进行系统化编程，增强任务记忆管理机制，并有效避免冗余和重复的编码工作。

## ✨ <a id="features1"></a>功能特性

- **任务规划与分析**：深入理解和分析复杂任务需求
- **智能任务分解**：自动将大型任务分解为可管理的小型任务
- **依赖管理**：精确处理任务间的依赖关系，确保正确的执行顺序
- **执行状态跟踪**：实时监控任务执行进度和状态
- **任务完成性验证**：确保任务结果符合预期要求
- **任务复杂度评估**：自动评估任务复杂度并提供最佳处理建议
- **自动任务摘要更新**：任务完成时自动生成摘要，优化记忆性能
- **任务记忆功能**：自动备份任务历史，提供长期记忆和参考能力
- **项目规范初始化**：定义项目标准和规则，以保持大型项目的一致性
- **<a id="web-gui"></a>Web GUI**：提供一个可选的基于 Web 的图形用户界面来管理任务。通过在您的 `.env` 文件中设置 `ENABLE_GUI=true` 来启用。启用后，将在您的 `DATA_DIR` 中创建一个包含访问地址的 `WebGUI.md` 文件。

## 🧭 <a id="usage-guide"></a>使用指南

虾米任务管理器通过引导式工作流和系统化任务管理，为 AI 辅助编程提供了一种结构化方法。

### 什么是虾米？

虾米本质上是一个提示模板，引导 AI Agent 更好地理解和使用您的项目。它使用一系列提示来确保 Agent 与您项目的特定需求和约定紧密对齐。

### 首次设置

在处理新项目时，只需告诉 Agent "初始化项目规范"。这将引导 Agent 生成一套适合您项目特定需求和结构的规范。

### 任务规划流程

要开发或更新功能，请使用命令"规划任务 [您的描述]"。系统将参考先前建立的规范，尝试理解您的项目，搜索相关代码段，并根据项目的当前状态提出综合计划。

### 反馈机制

在规划过程中，虾米会引导 Agent 完成多步思考。您可以审查此过程，如果觉得方向有误，可以提供反馈。只需打断并分享您的观点——Agent 将采纳您的反馈并继续规划过程。

### 任务执行

当您对计划满意后，使用"执行任务 [任务名称或ID]"来实施它。如果您未指定任务名称或ID，系统将自动识别并执行优先级最高的任务。

### 连续模式

如果您希望按顺序执行所有任务，而无需为每个任务手动干预，请使用"连续模式"自动处理整个任务队列。

### Token 限制说明

由于语言模型的 Token 限制，在长时间对话中可能会丢失上下文。如果发生这种情况，只需打开一个新的聊天会话并要求 Agent 继续执行。系统将从中断处继续，无需您重复任务细节或上下文。

### 提示语言和自定义

您可以通过设置 `TEMPLATES_USE` 环境变量来切换系统提示的语言。默认支持 `en` (英语) 和 `zh` (繁体中文)。此外，您可以将现有的模板目录（例如 `src/prompts/templates_en`）复制到 `DATA_DIR` 指定的位置，对其进行修改，然后将 `TEMPLATES_USE` 指向您的自定义模板目录名称。这允许更深层次的提示自定义。有关详细说明，请参阅相关文档。

## 🧠 <a id="task-memory-function"></a>任务记忆功能

虾米任务管理器具有长期记忆功能，可自动保存任务执行历史，并在规划新任务时提供参考经验。

### 主要特点

- 系统自动将任务备份到记忆目录
- 备份文件按时间顺序命名，格式为 tasks_backup_YYYY-MM-DDThh-mm-ss.json
- 任务规划 Agent 会自动获得关于如何使用记忆功能的指导

### 优势与益处

- **避免重复工作**：参考过去的任务，无需从头解决类似问题
- **借鉴成功经验**：利用行之有效的解决方案，提高开发效率
- **学习与改进**：识别过去的错误或低效解决方案，持续优化工作流程
- **知识积累**：随着系统使用量的增加，形成不断扩展的知识库

通过有效利用任务记忆功能，系统可以不断积累经验，智能水平和工作效率也将持续提高。

## 📋 <a id="project-rules"></a>项目规范初始化

项目规范功能有助于保持代码库的一致性：

- **规范化开发**：建立一致的编码模式和实践
- **新开发人员入门**：为项目贡献提供清晰的指南
- **保持质量**：确保所有代码符合既定的项目标准

> **⚠️ 建议**：当您的项目变大或发生重大更改时，请初始化项目规范。这有助于在复杂性增加时保持一致性和质量。

在以下情况下使用 `init_project_rules` 工具设置或更新项目标准：

- 启动新的大型项目
- 新团队成员加入
- 实施重大的架构变更
- 采用新的开发约定

### 使用示例

您可以通过简单的自然语言命令轻松访问此功能：

- **初次设置**：只需告诉 Agent "初始化规范"或"初始化项目规范"
- **更新时**：当您的项目演变时，告诉 Agent "更新规范"或"更新项目规范"

当您的代码库扩展或经历重大结构性更改时，此工具尤其有价值，有助于在整个项目生命周期中保持一致的开发实践。

## 📚 <a id="documentation"></a>文档资源

- [提示自定义指南](docs/en/prompt-customization.md)：有关通过环境变量自定义工具提示的说明

## 🔧 <a id="installation"></a>安装与使用

### 通过 NPM 安装 (推荐)

您可以使用以下命令直接从我们的私有 Nexus 仓库安装 `@unis/mcp-shrimp-task-manager`：

```bash
npm install @unis/mcp-shrimp-task-manager --registry=http://nexus.item.pub/repository/npm-private/
```

### 本地开发和构建

如果您需要从源码进行本地开发或构建：

```bash
# 安装依赖
npm install

# 构建服务
npm run build
```

## 🔌 <a id="clients"></a>与MCP兼容的客户端一起使用

虾米任务管理器可以与任何支持模型上下文协议的客户端一起使用，例如 Cursor IDE。

### 在 Cursor IDE 中配置

虾米任务管理器提供两种配置方法：全局配置和项目特定配置。

#### 全局配置

1. 打开 Cursor IDE 全局配置文件（通常位于 `~/.cursor/mcp.json`）
2. 在 `mcpServers` 部分添加以下配置：

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/project/data", // 必须使用绝对路径
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    }
  }
}


或者

{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "npx",
      "args": ["-y", "mcp-shrimp-task-manager"],
      "env": {
        "DATA_DIR": "/mcp-shrimp-task-manager/data",
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

> ⚠️ 请将 `/mcp-shrimp-task-manager` 替换为您的实际路径。

#### 项目特定配置

您还可以为每个项目设置专用配置，以便为不同的项目使用独立的数据目录：

1. 在项目根目录中创建一个 `.cursor` 目录
2. 在此目录中创建一个 `mcp.json` 文件，内容如下：

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/project/data", // 必须使用绝对路径
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    }
  }
}


或者

{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "npx",
      "args": ["-y", "mcp-shrimp-task-manager"],
      "env": {
        "DATA_DIR": "/path/to/project/data", // 必须使用绝对路径
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

### ⚠️ 重要配置说明

**DATA_DIR 参数**是虾米任务管理器存储任务数据、对话日志和其他信息的目录。正确设置此参数对于系统的正常运行至关重要。此参数必须使用**绝对路径**；使用相对路径可能会导致系统错误地定位数据目录，从而导致数据丢失或功能故障。

> **警告**：使用相对路径可能会导致以下问题：
>
> - 找不到数据文件，导致系统初始化失败
> - 任务状态丢失或无法正确保存
> - 不同环境下应用程序行为不一致
> - 系统崩溃或无法启动

### 🔧 环境变量配置

虾米任务管理器支持通过环境变量自定义提示行为，使您无需修改代码即可微调 AI 助手的响应。您可以在配置中或通过 `.env` 文件设置这些变量：

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/project/data",
        "MCP_PROMPT_PLAN_TASK": "自定义规划指南...",
        "MCP_PROMPT_EXECUTE_TASK_APPEND": "附加执行说明...",
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

有两种自定义方法：

- **覆盖模式** (`MCP_PROMPT_[FUNCTION_NAME]`)：完全替换默认提示
- **追加模式** (`MCP_PROMPT_[FUNCTION_NAME]_APPEND`)：向现有提示添加内容

此外，还有其他系统配置变量：

- **DATA_DIR**：指定存储任务数据的目录
- **TEMPLATES_USE**：指定用于提示的模板集。默认为 `en`。当前可用选项为 `en` 和 `zh`。要使用自定义模板，请将 `src/prompts/templates_en` 目录复制到 `DATA_DIR` 指定的位置，重命名复制的目录（例如，`my_templates`），然后将 `TEMPLATES_USE` 设置为新的目录名称（例如，`my_templates`）。

有关自定义提示的详细说明，包括支持的参数和示例，请参阅[提示自定义指南](docs/en/prompt-customization.md)。

## 💡 <a id="prompt"></a>系统提示指导

### Cursor IDE 配置

您可以启用 Cursor 设置 => 功能 => 自定义模式，并配置以下两种模式：

#### 任务规划器模式

```
您是一位专业的任务规划专家。您必须与用户互动，分析他们的需求，并收集项目相关信息。最后，您必须使用 "plan_task" 来创建任务。创建任务后，您必须对其进行总结，并通知用户使用 "TaskExecutor" 模式执行任务。
您必须专注于任务规划。不要使用 "execute_task" 来执行任务。
严重警告：您是任务规划专家，不能直接修改程序代码，只能规划任务，不能直接修改程序代码，只能规划任务。
```

#### 任务执行器模式

```
您是一位专业的任务执行专家。当用户指定要执行的任务时，请使用 "execute_task" 执行任务。
如果未指定任务，请使用 "list_tasks" 查找未执行的任务并执行它们。
执行完成后，必须给出总结以通知用户结论。
您一次只能执行一个任务，完成一个任务后，除非用户明确告知，否则禁止执行下一个任务。
如果用户请求"连续模式"，则所有任务将按顺序执行。
```

> 💡 根据您的需求选择合适的模式：
>
> - 规划任务时使用**任务规划器**模式
> - 执行任务时使用**任务执行器**模式

### 与其他工具一起使用

如果您的工具不支持自定义模式，您可以：

- 在不同阶段手动粘贴相应的提示
- 或者直接使用简单的命令，例如 `请规划以下任务：......` 或 `请开始执行任务...`

## 🛠️ <a id="tools"></a>可用工具概览

配置完成后，您可以使用以下工具：

| 类别                | 工具名称            | 描述                                      |
| ----------------------- | -------------------- | ------------------------------------------------ |
| **任务规划**       | `plan_task`          | 开始规划任务                             |
| **任务分析**       | `analyze_task`       | 深入分析任务需求           |
|                         | `process_thought`    | 对复杂问题进行逐步推理      |
| **解决方案评估** | `reflect_task`       | 反思和改进解决方案概念            |
| **项目管理**  | `init_project_rules` | 初始化或更新项目标准和规则 |
| **任务管理**     | `split_tasks`        | 将任务分解为子任务                        |
|                         | `list_tasks`         | 显示所有任务和状态                     |
|                         | `query_task`         | 搜索和列出任务                            |
|                         | `get_task_detail`    | 显示完整的任务详细信息                    |
|                         | `delete_task`        | 删除未完成的任务                          |
| **任务执行**      | `execute_task`       | 执行特定任务                           |
|                         | `verify_task`        | 验证任务完成情况                           |

## 🔧 技术实现

- **Node.js**：高性能 JavaScript 运行时环境
- **TypeScript**：提供类型安全的开发环境
- **MCP SDK**：用于与大型语言模型无缝交互的接口
- **UUID**：生成唯一可靠的任务标识符

## 📄 <a id="license"></a>许可证

本项目根据 MIT 许可证授权 - 详见 [LICENSE](LICENSE) 文件。

## <a id="recommended"></a>推荐模型

为获得最佳体验，我们建议使用以下模型：

- **Claude 3.7**：提供强大的理解和生成能力。
- **Gemini 2.5**：谷歌最新模型，表现优异。

由于不同模型的训练方法和理解能力存在差异，使用其他模型可能会导致相同提示产生不同的结果。本项目已针对 Claude 3.7 和 Gemini 2.5 进行了优化。

## 🐞 使用 MCP Inspector 进行调试

虾米任务管理器包含内置调试工具，利用 MCP Inspector 帮助您解决问题并了解工具的工作方式。

### 使用调试脚本

我们提供多种在调试模式下运行应用程序的方法：

#### 1. 使用 npm 脚本

```bash
npm run debug
```

这将启动带有 MCP Inspector 的应用程序，允许您查看所有工具调用和模型响应。

#### 2. 使用 debug.bat 文件 (Windows)

```bash
debug.bat
```

或带参数：

```bash
debug.bat --port 3001 --feature verifyTask
```

#### 3. 直接使用 Node.js 脚本

```bash
node scripts/debug.js
```

带参数：

```bash
node scripts/debug.js --port 3001 --feature verifyTask
```

### 调试参数

- `--port`：指定服务器的端口（默认为 3000）
- `--feature`：将调试重点放在特定功能或工具上

### 调试功能

在调试模式下运行时：

1. MCP Inspector 界面将在 http://localhost:3000（或您指定的端口）上可用
2. 所有工具调用和模型响应都将显示在 Inspector 中
3. Node.js 调试通过 `--inspect` 标志启用，允许您连接 Chrome DevTools（导航到 chrome://inspect）
4. 控制台输出将显示应用程序活动的详细日志

### 常见调试场景

- **API 错误**：调试 API 响应和请求格式问题
- **工具链问题**：检查 verifyTask 和 taskReport 等不同工具之间的流程
- **模板问题**：检查模板文件是否正确加载
- **数据持久性**：监控任务数据的保存和检索方式

> **提示**：调试模板问题时，请在启动调试模式前运行 `npm run build`，确保您的构建过程已将所有模板文件正确复制到 dist 目录。
