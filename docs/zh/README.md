[English](../../README.md) | [中文](README.md)

## 目录

- [✨ 功能特点](#功能特点1)
- [📖 使用指南](#使用指南)
- [🧠 任务记忆功能](#任务记忆功能)
- [🤔 思维链过程](#思维链过程)
- [📋 专案规范初始化](#专案规范初始化)
- [📚 文件资源](#文件资源)
- [🔧 安装与使用](#安装与使用)
- [🔌 在支援 MCP 的客户端中使用](#客户端中使用)
- [💡 系统提示词指导](#系统提示词指导)
- [🛠️ 可用工具一览](#可用工具一览)
- [📄 许可协议](#许可协议)
- [🤖 推荐模型](#推荐模型)

# MCP 虾米任务管理器

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)

> 🚀 基于 Model Context Protocol (MCP) 的智能任务管理系统，为 AI Agent 提供高效的程式开发工作流程框架。

虾米任务管理器透过结构化的工作流程引导，协助 Agent 系统性规划程式开发步骤，强化任务记忆管理机制，有效避免冗余与重复的编程工作。

## ✨ <a id="功能特点1"></a>功能特点

- **任务规划与分析**：深入理解与分析复杂任务需求
- **智能任务拆分**：将大型任务自动拆分为可管理的小型任务
- **依赖关系管理**：精确处理任务间的依赖关系，确保正确的执行顺序
- **执行状态追踪**：即时监控任务执行进度和状态
- **任务完整性验证**：确保任务成果符合预期要求
- **任务复杂度评估**：自动评估任务复杂度并提供最佳处理建议
- **任务摘要自动更新**：完成任务时自动产生摘要，优化记忆效能
- **任务记忆功能**：自动备份任务历史记录，提供长期记忆和参考能力
- **思维链过程**：通过步骤化的推理系统性地分析复杂问题
- **专案规范初始化**：定义专案标准和规则，维持大型专案的一致性

## 🧭 <a id="使用指南"></a>使用指南

虾米任务管理器提供结构化的 AI 辅助程式开发方法，通过引导式工作流程和系统化任务管理实现高效开发。

### 什么是虾米？

虾米本质上是一个提示词范本，通过一系列提示词引导 AI Agent 更好地理解和适应您的专案。它确保 Agent 能够更贴近您专案的特定需求和惯例。

### 首次使用设置

在使用新专案时，只需对 Agent 说「init project rules」（初始化专案规则）。这将引导 Agent 生成一份符合您专案特定需求和结构的规则档案。

### 任务规划流程

要开发或更新功能，使用命令「plan task [您的描述]」（规划任务 [您的描述]）。系统将参考先前建立的规则，尝试理解您的专案，搜寻相关程式码区块，并根据专案的当前状态提出全面的计划。

### 反馈机制

在规划过程中，虾米引导 Agent 进行多步骤思考。您可以审查这个过程，如果您觉得某个部分偏离了您的目标，可以直接打断并提出您的观点。Agent 将采纳您的反馈并继续思考过程。

### 任务执行

当您对规划内容满意后，使用「execute task [任务名称或 ID]」（执行任务 [任务名称或 ID]）来实施计划。如果您不指定任务名称或 ID，系统将自动识别并执行最优先的任务。

### 连续模式

如果您希望连续执行所有任务而不需要为每个任务手动干预，可以使用「continuous mode」（连续模式）自动处理整个任务队列。

### Token 限制注意事项

由于 LLM 的 Token 限制，在长时间对话中可能会丧失上下文。如果发生这种情况，只需开启新的聊天会话并请 Agent 继续执行即可。系统将从上次中断的地方继续，无需重复任务细节或上下文。

### 提示词语言与客制化

您可以透过设定 `TEMPLATES_USE` 环境变数来切换系统提示词的语言。预设支援 `en`（英文）和 `zh`（繁体中文）。此外，您也可以复制现有的模板目录（例如 `src/prompts/templates_en`）到 `DATA_DIR` 指定的位置，进行修改后，将 `TEMPLATES_USE` 指向您的客制化模板目录名称，以实现更深度的提示词客制化

## 🧠 <a id="任务记忆功能"></a>任务记忆功能

虾米任务管理器具备长期记忆功能，可以自动保存任务执行的历史记录，并在规划新任务时提供参考经验。

### 功能特点

- 系统会自动将任务备份到 memory 目录中
- 备份文件按照时间顺序命名，格式为 tasks_backup_YYYY-MM-DDThh-mm-ss.json
- 任务规划 Agent 会自动获得关于如何利用记忆功能的指导

### 优势与效益

- **避免重复工作**：参考过去任务，不必从零开始解决类似问题
- **借鉴成功经验**：利用已验证有效的解决方案，提高开发效率
- **学习与改进**：识别过去的错误或低效方案，持续优化工作流程
- **知识沉淀**：随着系统使用时间增长，形成持续扩展的知识库

通过有效利用任务记忆功能，系统能够不断积累经验，智能化程度和工作效率将持续提升。

## 🤔 <a id="思维链过程"></a>思维链过程

思维链功能通过结构化思考增强问题解决能力：

- **系统化推理**：将复杂问题分解为逻辑步骤
- **假设测试**：挑战假设以验证解决方案的可行性
- **批判性分析**：使用严格标准评估各种解决方案选项
- **改进决策过程**：通过深思熟虑达成更可靠的结论

当启用此功能（预设设定）时，系统会引导 Agent 使用 `process_thought` 工具进行逐步推理，确保在实施前进行彻底的问题分析。

## 📋 <a id="专案规范初始化"></a>专案规范初始化

专案规范功能有助于维持代码库的一致性：

- **标准化开发**：建立一致的编码模式和实践
- **新开发者引导**：为专案贡献提供明确的指南
- **维持品质**：确保所有代码符合既定的专案标准

> **⚠️ 建议**：当专案规模不断扩大或发生重大变更时，请初始化专案规范。这有助于在复杂度增加时维持一致性和品质。

在以下情况使用 `init_project_rules` 工具设置或更新专案标准：

- 启动新的大型专案
- 有新团队成员加入
- 实施重大架构变更
- 采用新的开发惯例

### 使用范例

您可以透过简单的自然语言指令轻松使用此功能：

- **首次设定时**：只需对 Agent 说「初始化规则」或「初始化专案规则」
- **需要更新时**：当专案发展变化时，对 Agent 说「更新规则」或「更新专案规则」

当您的代码库扩展或经历重大结构变化时，此工具特别有价值，有助于在整个专案生命周期中保持一致的开发实践。

## 📚 <a id="文件资源"></a>文件资源

- [系统架构](architecture.md)：详细的系统设计与数据流说明
- [提示词自定义指南](prompt-customization.md)：透过环境变数自定义工具提示词的说明
- [更新日志](CHANGELOG.md)：记录此专案的所有重要变更

## 🔧 <a id="安装与使用"></a>安装与使用

### Installing via Smithery

To install 虾米任务管理器 for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager):

```bash
npx -y @smithery/cli install @cjo4m06/mcp-shrimp-task-manager --client claude
```

### Manual Installation

```bash
# 安装依赖套件
npm install

# 建置并启动服务
npm run build
```

## 🔌 <a id="客户端中使用"></a>在支援 MCP 的客户端中使用

虾米任务管理器可以与任何支援 Model Context Protocol 的客户端一起使用，例如 Cursor IDE。

### 在 Cursor IDE 中配置

虾米任务管理器提供两种配置方式：全局配置和专案特定配置。

#### 全局配置

1. 开启 Cursor IDE 的全局设定档案（通常位于 `~/.cursor/mcp.json`）
2. 在 `mcpServers` 区段中添加以下配置：

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/mcp-shrimp-task-manager/data"
      }
    }
  }
}

or

{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "npx",
      "args": ["-y", "mcp-shrimp-task-manager"],
      "env": {
        "DATA_DIR": "/mcp-shrimp-task-manager/data"
      }
    }
  }
}
```

> ⚠️ 请将 `/mcp-shrimp-task-manager` 替换为您的实际路径。

#### 专案特定配置

您也可以为每个专案设定专属配置，以便针对不同专案使用独立的数据目录：

1. 在专案根目录创建 `.cursor` 目录
2. 在该目录下创建 `mcp.json` 文件，内容如下：

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/project/data" // 必须使用绝对路径
      }
    }
  }
}

or

{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "npx",
      "args": ["-y", "mcp-shrimp-task-manager"],
      "env": {
        "DATA_DIR": "/path/to/project/data" // 必须使用绝对路径
      }
    }
  }
}
```

### ⚠️ 重要配置说明

**DATA_DIR 参数**是虾米任务管理器存储任务数据、对话记录等信息的目录，正确设置此参数对于系统的正常运行至关重要。此参数必须使用**绝对路径**，使用相对路径可能导致系统无法正确定位数据目录，造成数据丢失或功能失效。

> **警告**：使用相对路径可能导致以下问题：
>
> - 数据档案找不到，导致系统初始化失败
> - 任务状态丢失或无法正确保存
> - 应用程式在不同环境下行为不一致
> - 系统崩溃或无法启动

### 🔧 环境变数配置

虾米任务管理器支援透过环境变数自定义提示词行为，让您无需修改程式码即可微调 AI 助手的回应。您可以在配置中或透过 `.env` 文件设置这些变数：

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/project/data",
        "MCP_PROMPT_PLAN_TASK": "自定义规划指导...",
        "MCP_PROMPT_EXECUTE_TASK_APPEND": "附加执行说明...",
        "ENABLE_THOUGHT_CHAIN": "true",
        "TEMPLATES_USE": "en"
      }
    }
  }
}
```

提供两种自定义方式：

- **覆盖模式**（`MCP_PROMPT_[FUNCTION_NAME]`）：完全替换预设提示词
- **追加模式**（`MCP_PROMPT_[FUNCTION_NAME]_APPEND`）：在现有提示词基础上增加内容

此外，还有其他系统配置变数：

- **DATA_DIR**：指定任务数据存储的目录
- **ENABLE_THOUGHT_CHAIN**：控制任务规划工作流中的思考模式。当设置为 `true`（预设值）时，系统引导用户使用 `process_thought` 工具进行逐步推理。当设置为 `false` 时，系统直接使用 `analyze_task` 提交分析结果，跳过详细的思考过程。
- **TEMPLATES_USE**：指定提示词使用的模板集。预设为 `en`。目前可用的选项有 `en` 和 `zh`。若要使用自定义模板，请将 `src/prompts/templates_en` 目录复制到 `DATA_DIR` 指定的位置，重新命名复制的目录（例如，`my_templates`），并将 `TEMPLATES_USE` 设置为新的目录名称（例如，`my_templates`）。

有关自定义提示词的详细说明，包括支援的参数和范例，请参阅[提示词自定义指南](prompt-customization.md)。

## 💡 <a id="系统提示词指导"></a>系统提示词指导

### Cursor IDE 配置

您可以启用 Cursor Settings => Features => Custom modes 功能，并配置以下两个模式：

#### TaskPlanner 模式

```
你是一个专业的任务规划专家，你必须与用户进行交互，分析用户的需求，并收集专案相关资讯，最终使用 「plan_task」 建立任务，当任务建立完成后必须总结摘要，并告知用户使用「TaskExecutor」模式进行任务执行。
你必须专心于任务规划禁止使用 「execute_task」 来执行任务，
严重警告你是任务规划专家，你不能直接修改程式码，你只能规划任务，并且你不能直接修改程式码，你只能规划任务。
```

#### TaskExecutor 模式

```
你是一个专业的任务执行专家，当用户有指定执行任务，则使用 「execute_task」 进行任务执行，
没有指定任务时则使用 「list_tasks」 寻找未执行的任务并执行，
当执行完成后必须总结摘要告知用户结论，
你一次只能执行一个任务，当任务完成时除非用户明确告知否则禁止进行下一则任务。
用户如果要求「连续模式」则按照顺序连续执行所有任务
```

> 💡 根据您的需求场景选择适当的模式：
>
> - 当需要规划任务时使用 **TaskPlanner** 模式
> - 当需要执行任务时使用 **TaskExecutor** 模式

### 在其他工具中使用

如果您的工具不支援 Custom modes 功能，可以：

- 在不同阶段手动贴上相应的提示词
- 或直接使用简单命令如 `请规划以下任务：......` 或 `请开始执行任务...`

## 🛠️ <a id="可用工具一览"></a>可用工具一览

配置完成后，您可使用以下工具：

| 功能分类     | 工具名称             | 功能描述                   |
| ------------ | -------------------- | -------------------------- |
| **任务规划** | `plan_task`          | 开始规划任务               |
| **任务分析** | `analyze_task`       | 深入分析任务需求           |
|              | `process_thought`    | 针对复杂问题进行步骤化推理 |
| **方案评估** | `reflect_task`       | 反思与改进方案构想         |
| **专案管理** | `init_project_rules` | 初始化或更新专案标准与规则 |
| **任务管理** | `split_tasks`        | 将任务拆分为子任务         |
|              | `list_tasks`         | 显示所有任务及状态         |
|              | `query_task`         | 搜寻并列出任务             |
|              | `get_task_detail`    | 显示完整任务详情           |
|              | `delete_task`        | 删除未完成的任务           |
| **任务执行** | `execute_task`       | 执行特定任务               |
|              | `verify_task`        | 检验任务完成情况           |
|              | `complete_task`      | 标记任务为已完成           |

## 📄 <a id="许可协议"></a>许可协议

此专案根据 MIT 许可协议授权 - 详情请参阅 [LICENSE](../../LICENSE) 文件。

## 🤖 <a id="推荐模型"></a>推荐模型

为了获得最佳体验，建议使用以下模型：

- **Claude 3.7**: 提供强大的理解和生成能力。
- **Gemini 2.5**: Google 的最新模型，表现优异。

由于不同模型的训练方式和理解能力存在差异，使用其他模型可能会导致相同的提示词产生不同的效果。本专案已针对 Claude 3.7 和 Gemini 2.5 进行了最佳化。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cjo4m06/mcp-shrimp-task-manager&type=Timeline)](https://www.star-history.com/#cjo4m06/mcp-shrimp-task-manager&Timeline)
