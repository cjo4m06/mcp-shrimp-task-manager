[English](README.md) | [中文](docs/zh/README.md)

## 目錄

- [✨ Features](#features1)
- [🎯 Idea Honing System](#idea-honing)
- [🧪 MCP Testing Bridge](#mcp-testing-bridge)
- [🧭 Usage Guide](#usage-guide)
- [🔬 Research Mode](#research-mode)
- [🧠 Task Memory Function](#task-memory-function)
- [📋 Project Rules Initialization](#project-rules)
- [🌐 Web GUI](#web-gui)
- [📚 Documentation Resources](#documentation)
- [🔧 Installation and Usage](#installation)
- [🔌 Using with MCP-Compatible Clients](#clients)
- [💡 System Prompt Guidance](#prompt)
- [🛠️ Available Tools Overview](#tools)
- [📄 License](#license)
- [🤖 Recommended Models](#recommended)

# MCP Shrimp Task Manager

[![Shrimp Task Manager Demo](/docs/yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)

> 🚀 An intelligent task management system based on Model Context Protocol (MCP), providing an efficient programming workflow framework for AI Agents.

<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" />
</a>

Shrimp Task Manager guides Agents through structured workflows for systematic programming, enhancing task memory management mechanisms, and effectively avoiding redundant and repetitive coding work.

## ✨ <a id="features1"></a>Features

- **Task Planning and Analysis**: Deep understanding and analysis of complex task requirements
- **Intelligent Task Decomposition**: Automatically break down large tasks into manageable smaller tasks
- **Dependency Management**: Precisely handle dependencies between tasks, ensuring correct execution order
- **Execution Status Tracking**: Real-time monitoring of task execution progress and status
- **Task Completeness Verification**: Ensure task results meet expected requirements
- **Task Complexity Assessment**: Automatically evaluate task complexity and provide optimal handling suggestions
- **Automatic Task Summary Updates**: Automatically generate summaries upon task completion, optimizing memory performance
- **Task Memory Function**: Automatically backup task history, providing long-term memory and reference capabilities
- **Research Mode**: Systematic technical research capabilities with guided workflows for exploring technologies, best practices, and solution comparisons
- **Project Rules Initialization**: Define project standards and rules to maintain consistency across large projects
- **<a id="web-gui"></a>Web GUI**: Provides an optional web-based graphical user interface for task management. Enable by setting `ENABLE_GUI=true` in your `.env` file. When enabled, a `WebGUI.md` file containing the access address will be created in your `DATA_DIR`.
- **🧪 MCP Testing Bridge**: Advanced testing infrastructure with sophisticated fallback architecture for bulletproof CI/CD integration
- **Adaptive Confidence Thresholds**: Automatic adjustment based on testing environment and capabilities
- **Methodological Pragmatism**: Systematic verification with explicit confidence scoring and fallibilism

## 🎯 <a id="idea-honing"></a>Idea Honing System

The Idea Honing System transforms raw ideas into structured specifications through deep codebase analysis and project integration. This addresses the critical challenge of workflow continuity when developers start and stop working on projects.

### **Core Capabilities:**

#### 🎯 **`create_spec` Tool**
Transforms raw ideas into structured specifications with comprehensive codebase analysis:

- **Deep Codebase Analysis**: Analyzes repository structure, dependencies, and patterns
- **Project Rules Integration**: Incorporates existing project standards automatically  
- **Structured Documentation**: Generates complete specification files with implementation guidance
- **UUID-Based Storage**: Stores specifications in MCP server data directory for persistent access
- **Task Integration**: Automatically creates foundation for task planning workflow
- **Scope-Aware Processing**: Optional scope limitation for focused analysis

**Enhanced Features:**
- **Persistent Storage**: Specifications stored in `data/specifications/{uuid}.md` format
- **Interactive Management**: Provides UUID for specification management via `interact_spec` and `get_spec`
- **Complete Workflow Integration**: Seamlessly connects to task planning system

**Usage Example:**
```
create_spec({
  title: "User Authentication System",
  description: "Implement JWT-based authentication with refresh tokens and role-based access control",
  scope: "src/auth/", // optional
  template: "auth-template" // optional
})
```

**Output:**
- **UUID Storage**: Specification stored with unique ID in MCP server data directory
- **Task Foundation**: Initial planning task created automatically
- **Access Instructions**: Clear guidance on using `get_spec` and `interact_spec`

#### 📖 **`get_spec` Tool**
Retrieves and displays stored specification documents using UUID references:

- **UUID-Based Access**: Direct retrieval using specification identifiers from `create_spec`
- **Multiple Output Formats**: Support for markdown (complete), json (structured), and summary formats
- **Persistent Storage**: Accesses specifications from MCP server's secure data directory
- **Format Flexibility**: Choose appropriate format based on use case and context

**Enhanced Features:**
- **Comprehensive Validation**: UUID format validation with helpful error messages
- **Smart Error Handling**: Clear troubleshooting guidance for missing specifications
- **Rich Formatting**: Enhanced output with metadata, sections, and access information
- **Integration Ready**: Seamless compatibility with `interact_spec` and task management tools

**Usage Examples:**
```
// Retrieve complete specification document
get_spec({
  specId: "32b80802-89fb-4b57-bb5b-757561c27a05",
  format: "markdown" // complete document
})

// Get quick overview
get_spec({
  specId: "32b80802-89fb-4b57-bb5b-757561c27a05", 
  format: "summary" // brief overview with sections list
})

// Structured data for processing
get_spec({
  specId: "32b80802-89fb-4b57-bb5b-757561c27a05",
  format: "json" // structured data format
})
```

**Available Formats:**
- `markdown`: Complete specification document with full content
- `summary`: Brief overview with metadata and section list
- `json`: Structured data format for programmatic access

#### 📋 **`interact_spec` Tool**
Provides comprehensive interactive management of created specifications:

- **Specification Viewing**: Display existing specifications with enhanced formatting
- **Dynamic Editing**: Modify specifications through natural language commands
- **Workflow Management**: Track specification status and implementation progress
- **Progress Tracking**: Visual progress indicators with status-based guidance
- **Task Integration**: View and manage associated implementation tasks
- **Command Interface**: Flexible command system for specification manipulation

**Enhanced Features:**
- **UUID-Based Access**: Direct specification access using unique identifiers
- **Enhanced Formatting**: Rich, structured output with tables and progress bars
- **Troubleshooting Guidance**: Built-in help and error resolution suggestions
- **Integration References**: Automatic references to `get_spec` for document retrieval

**Usage Examples:**
```
// View complete specification
interact_spec({
  specId: "uuid-from-create-spec",
  command: "view"
})

// Check implementation progress
interact_spec({
  specId: "uuid-from-create-spec", 
  command: "progress"
})

// Edit a specific section
interact_spec({
  specId: "uuid-from-create-spec",
  command: "edit overview Updated overview content here"
})

// Get help and available commands
interact_spec({
  command: "help"
})
```

**Available Commands:**
- `view`: Display complete specification with metadata
- `edit <section> <content>`: Modify specific sections
- `progress`: Check implementation progress with visual indicators
- `tasks`: View associated implementation tasks
- `help`: Get detailed command documentation
- `list`: Display available specifications

### **Complete Workflow Architecture:**

The Idea Honing System provides a complete development workflow:

```
Raw Idea → create_spec → get_spec/interact_spec → plan_task → Implementation
```

**Step-by-Step Process:**
1. **`create_spec`**: Transform idea into structured specification with UUID
2. **`get_spec`**: Retrieve and review complete specification document
3. **`interact_spec`**: Manage workflow, track progress, edit sections
4. **`plan_task`**: Create implementation tasks based on specification
5. **`split_tasks`**: Break down into manageable work items
6. **`execute_task`**: Implement with specification-guided context

### **Methodological Benefits:**

1. **Workflow Continuity**: Enables seamless project re-engagement after breaks
2. **Knowledge Capture**: Preserves architectural decisions and implementation context
3. **Team Collaboration**: Provides shared understanding through structured documentation
4. **Quality Assurance**: Integrates project standards into specification generation

### **Integration with Task Management:**

The Idea Honing System works seamlessly with the core task management tools:

1. **`create_spec`** → Generates structured foundation for task planning
2. **`plan_task`** → Creates actionable tasks based on specifications
3. **`split_tasks`** → Breaks down specification-driven tasks into manageable units
4. **`execute_task`** → Implements tasks with specification-guided context

This creates a complete development workflow from raw idea to working implementation.

## 🧪 <a id="mcp-testing-bridge"></a>MCP Testing Bridge

The MCP Testing Bridge (`mcp-shrimp-bridge.py`) is a sophisticated testing infrastructure that provides comprehensive validation of MCP servers with intelligent fallback capabilities. Built on methodological pragmatism principles, it ensures reliable testing in any environment.

### ✨ Key Features

- **🔄 Intelligent Fallback Architecture**: Automatically degrades from full framework testing to basic CI compatibility mode
- **📊 Confidence Scoring**: Systematic verification with numerical confidence assessments for all test results
- **🛡️ Error Architecture Awareness**: Distinguishes between human-cognitive and artificial-stochastic errors with appropriate handling
- **🌐 Universal Compatibility**: Works reliably across development, CI/CD, and production environments
- **⚡ Four Test Dimensions**: Comprehensive coverage of functional, security, performance, and integration testing

### 🎯 Methodological Pragmatism Framework

The testing bridge implements methodological pragmatism through four core principles:

1. **Explicit Fallibilism**: Acknowledges testing limitations and provides graceful degradation paths
2. **Systematic Verification**: Structured testing processes with confidence scoring and validation
3. **Pragmatic Success Criteria**: Prioritizes practical outcomes while maintaining quality standards  
4. **Cognitive Systematization**: Organizes testing knowledge into coherent, comprehensive systems

### 🔧 Testing Architecture

#### Full Framework Mode
When the `mcp-testing-framework` is available, the bridge provides:
- **Deep MCP Protocol Testing**: Complete server connectivity and tool discovery validation
- **Advanced Performance Metrics**: Response time analysis with configurable thresholds
- **Comprehensive Integration Tests**: End-to-end workflow validation with dependency checking
- **Rich Diagnostic Output**: Detailed error reporting and performance analytics

#### Basic Fallback Mode  
In CI environments or when dependencies are unavailable:
- **Essential Validation**: Core functionality checks (file existence, package validation)
- **Synchronous Operations**: Avoids complex asyncio issues for maximum reliability
- **High Confidence Scoring**: Achieves 80-85% confidence through focused validation
- **Zero External Dependencies**: Runs with only Python standard library

### 📋 Usage Examples

#### Command Line Interface

```bash
# Run all test types with verbose output
python mcp-shrimp-bridge.py --test-type all --verbose

# Run specific test type
python mcp-shrimp-bridge.py --test-type functional

# Use custom configuration
python mcp-shrimp-bridge.py --config custom-test-config.json --confidence-check
```

#### Test Types Available

- **`functional`**: Core MCP server functionality and tool availability
- **`security`**: Security validation and connectivity testing  
- **`performance`**: Response time analysis and load testing
- **`integration`**: End-to-end workflow and configuration validation
- **`all`**: Comprehensive test suite across all dimensions

#### Configuration

Create a `test-config.json` file to customize testing behavior:

```json
{
  "testing": {
    "timeout": 30,
    "outputFormat": "table"
  },
  "confidence_thresholds": {
    "functional_minimum": 75,
    "security_minimum": 80,
    "performance_minimum": 70,
    "integration_minimum": 85
  },
  "servers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "NODE_ENV": "test",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### 🚀 CI/CD Integration

The bridge is designed for seamless CI/CD integration with automatic fallback:

```yaml
# Example GitHub Actions integration
- name: Setup MCP Testing Framework
  run: pip install mcp-testing-framework || echo 'Using fallback mode'

- name: Run MCP Tests  
  run: python mcp-shrimp-bridge.py --test-type all --verbose
```

**Key Benefits for CI/CD:**
- **Zero-Failure Deployment**: Automatic fallback ensures tests never fail due to environment issues
- **Fast Execution**: Optimized for quick CI pipeline execution with reduced iterations
- **Clear Reporting**: Structured output with confidence scores for quality gates
- **Environment Agnostic**: Works consistently across GitHub Actions, GitLab CI, Jenkins, and local development

### 📊 Output and Reporting

The bridge provides comprehensive reporting with confidence scoring:

```
🚀 Running Comprehensive Test Suite (Full MCP Framework)
============================================================

📋 FUNCTIONAL TESTS:
------------------------------
✅ Status: PASSED
📊 Confidence: 85.00% (threshold: 75.00%)
🔧 Mode: basic_fallback

🎯 OVERALL RESULTS:
==============================
🔧 Framework: Full MCP Framework
📈 Success Rate: 4/4 (100.0%)
📊 Overall Confidence: 81.00%
🎉 Status: PASSED
```

### 🛠️ Advanced Features

- **Automatic Framework Detection**: Intelligently detects available testing capabilities
- **Graceful Error Handling**: Comprehensive exception handling with fallback triggers
- **Performance Optimization**: Reduced test iterations for faster CI execution
- **Memory Management**: Safe cleanup procedures that avoid asyncio task cancellation issues
- **Extensible Architecture**: Easy to extend with additional test types and validation methods

> **💡 Recommendation**: The MCP Testing Bridge is particularly valuable for maintaining code quality in complex MCP server deployments, providing confidence through systematic verification while ensuring reliable operation across all deployment environments.

## 🧭 <a id="usage-guide"></a>Usage Guide

Shrimp Task Manager offers a structured approach to AI-assisted programming through guided workflows and systematic task management.

### What is Shrimp?

Shrimp is essentially a prompt template that guides AI Agents to better understand and work with your project. It uses a series of prompts to ensure the Agent aligns closely with your project's specific needs and conventions.

### Research Mode in Practice

Before diving into task planning, you can leverage the research mode for technical investigation and knowledge gathering. This is particularly useful when:

- You need to explore new technologies or frameworks
- You want to compare different solution approaches
- You're investigating best practices for your project
- You need to understand complex technical concepts

Simply tell the Agent "research [your topic]" or "enter research mode for [technology/problem]" to begin systematic investigation. The research findings will then inform your subsequent task planning and development decisions.

### First-Time Setup

When working with a new project, simply tell the Agent "init project rules". This will guide the Agent to generate a set of rules tailored to your project's specific requirements and structure.

### Task Planning Process

To develop or update features, use the command "plan task [your description]". The system will reference the previously established rules, attempt to understand your project, search for relevant code sections, and propose a comprehensive plan based on the current state of your project.

### Feedback Mechanism

During the planning process, Shrimp guides the Agent through multiple steps of thinking. You can review this process and provide feedback if you feel it's heading in the wrong direction. Simply interrupt and share your perspective - the Agent will incorporate your feedback and continue the planning process.

### Task Execution

When you're satisfied with the plan, use "execute task [task name or ID]" to implement it. If you don't specify a task name or ID, the system will automatically identify and execute the highest priority task.

### Continuous Mode

If you prefer to execute all tasks in sequence without manual intervention for each task, use "continuous mode" to automatically process the entire task queue.

### Token Limitation Note

Due to LLM token limits, context may be lost during lengthy conversations. If this occurs, simply open a new chat session and ask the Agent to continue execution. The system will pick up where it left off without requiring you to repeat the task details or context.

### Prompt Language and Customization

You can switch the language of system prompts by setting the `TEMPLATES_USE` environment variable. It supports `en` (English) and `zh` (Traditional Chinese) by default. Furthermore, you can copy an existing template directory (e.g., `src/prompts/templates_en`) to the location specified by `DATA_DIR`, modify it, and then point `TEMPLATES_USE` to your custom template directory name. This allows for deeper prompt customization. For detailed instructions.

## 🔬 <a id="research-mode"></a>Research Mode

Shrimp Task Manager includes a specialized research mode designed for systematic technical investigation and knowledge gathering.

### What is Research Mode?

Research Mode is a guided workflow system that helps AI Agents conduct thorough and systematic technical research. It provides structured approaches to exploring technologies, comparing solutions, investigating best practices, and gathering comprehensive information for programming tasks.

### Key Features

- **Systematic Investigation**: Structured workflows ensure comprehensive coverage of research topics
- **Multi-Source Research**: Combines web search and codebase analysis for complete understanding
- **State Management**: Maintains research context and progress across multiple sessions
- **Guided Exploration**: Prevents research from becoming unfocused or going off-topic
- **Knowledge Integration**: Seamlessly integrates research findings with task planning and execution

### When to Use Research Mode

Research Mode is particularly valuable for:

- **Technology Exploration**: Investigating new frameworks, libraries, or tools
- **Best Practices Research**: Finding industry standards and recommended approaches
- **Solution Comparison**: Evaluating different technical approaches or architectures
- **Problem Investigation**: Deep-diving into complex technical challenges
- **Architecture Planning**: Researching design patterns and system architectures

### How to Use Research Mode

Simply tell the Agent to enter research mode with your topic:

- **Basic usage**: "Enter research mode for [your topic]"
- **Specific research**: "Research [specific technology/problem]"
- **Comparative analysis**: "Research and compare [options A vs B]"

The system will guide the Agent through structured research phases, ensuring thorough investigation while maintaining focus on your specific needs.

### Research Workflow

1. **Topic Definition**: Clearly define the research scope and objectives
2. **Information Gathering**: Systematic collection of relevant information
3. **Analysis and Synthesis**: Processing and organizing findings
4. **State Updates**: Regular progress tracking and context preservation
5. **Integration**: Applying research results to your project context

> **💡 Recommendation**: For the best research mode experience, we recommend using **Claude 4 Sonnet**, which provides exceptional analytical capabilities and comprehensive research synthesis.

## 🧠 <a id="task-memory-function"></a>Task Memory Function

Shrimp Task Manager has long-term memory capabilities, automatically saving task execution history and providing reference experiences when planning new tasks.

### Key Features

- The system automatically backs up tasks to the memory directory
- Backup files are named in chronological order, in the format tasks_backup_YYYY-MM-DDThh-mm-ss.json
- Task planning Agents automatically receive guidance on how to use the memory function

### Advantages and Benefits

- **Avoid Duplicate Work**: Reference past tasks, no need to solve similar problems from scratch
- **Learn from Successful Experiences**: Utilize proven effective solutions, improve development efficiency
- **Learning and Improvement**: Identify past mistakes or inefficient solutions, continuously optimize workflows
- **Knowledge Accumulation**: Form a continuously expanding knowledge base as system usage increases

Through effective use of the task memory function, the system can continuously accumulate experience, with intelligence level and work efficiency continuously improving.

## 📋 <a id="project-rules"></a>Project Rules Initialization

The Project Rules feature helps maintain consistency across your codebase:

- **Standardize Development**: Establish consistent coding patterns and practices
- **Onboard New Developers**: Provide clear guidelines for project contributions
- **Maintain Quality**: Ensure all code meets established project standards

> **⚠️ Recommendation**: Initialize project rules when your project grows larger or undergoes significant changes. This helps maintain consistency and quality as complexity increases.

Use the `init_project_rules` tool to set up or update project standards when:

- Starting a new large-scale project
- Onboarding new team members
- Implementing major architectural changes
- Adopting new development conventions

### Usage Examples

You can easily access this feature with simple natural language commands:

- **For initial setup**: Simply tell the Agent "init rules" or "init project rules"
- **For updates**: When your project evolves, tell the Agent "Update rules" or "Update project rules"

This tool is particularly valuable when your codebase expands or undergoes significant structural changes, helping maintain consistent development practices throughout the project lifecycle.

## 📚 <a id="documentation"></a>Documentation Resources

- [Prompt Customization Guide](docs/en/prompt-customization.md): Instructions for customizing tool prompts via environment variables
- [Changelog](CHANGELOG.md): Record of all notable changes to this project

## 🔧 <a id="installation"></a>Installation and Usage

### Installing via Smithery

To install Shrimp Task Manager for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager):

```bash
npx -y @smithery/cli install @cjo4m06/mcp-shrimp-task-manager --client claude
```

### Manual Installation

```bash
# Install dependencies
npm install

# Build and start service
npm run build
```

## 🔌 <a id="clients"></a>Using with MCP-Compatible Clients

Shrimp Task Manager can be used with any client that supports the Model Context Protocol, such as Cursor IDE.

### Configuration in Cursor IDE

Shrimp Task Manager offers two configuration methods: global configuration and project-specific configuration.

#### Global Configuration

1. Open the Cursor IDE global configuration file (usually located at `~/.cursor/mcp.json`)
2. Add the following configuration in the `mcpServers` section:

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/project/data", // 必須使用絕對路徑
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
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
        "DATA_DIR": "/mcp-shrimp-task-manager/data",
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

> ⚠️ Please replace `/mcp-shrimp-task-manager` with your actual path.

#### Project-Specific Configuration

You can also set up dedicated configurations for each project to use independent data directories for different projects:

1. Create a `.cursor` directory in the project root
2. Create an `mcp.json` file in this directory with the following content:

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/project/data", // Must use absolute path
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
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
        "DATA_DIR": "/path/to/project/data", // Must use absolute path
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

### ⚠️ Important Configuration Notes

The **DATA_DIR parameter** is the directory where Shrimp Task Manager stores task data, conversation logs, and other information. Setting this parameter correctly is crucial for the normal operation of the system. This parameter must use an **absolute path**; using a relative path may cause the system to incorrectly locate the data directory, resulting in data loss or function failure.

> **Warning**: Using relative paths may cause the following issues:
>
> - Data files not found, causing system initialization failure
> - Task status loss or inability to save correctly
> - Inconsistent application behavior across different environments
> - System crashes or failure to start

### 🔧 Environment Variable Configuration

Shrimp Task Manager supports customizing prompt behavior through environment variables, allowing you to fine-tune AI assistant responses without modifying code. You can set these variables in the configuration or through an `.env` file:

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/project/data",
        "MCP_PROMPT_PLAN_TASK": "Custom planning guidance...",
        "MCP_PROMPT_EXECUTE_TASK_APPEND": "Additional execution instructions...",
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

There are two customization methods:

- **Override Mode** (`MCP_PROMPT_[FUNCTION_NAME]`): Completely replace the default prompt
- **Append Mode** (`MCP_PROMPT_[FUNCTION_NAME]_APPEND`): Add content to the existing prompt

Additionally, there are other system configuration variables:

- **DATA_DIR**: Specifies the directory where task data is stored
- **TEMPLATES_USE**: Specifies the template set to use for prompts. Defaults to `en`. Currently available options are `en` and `zh`. To use custom templates, copy the `src/prompts/templates_en` directory to the location specified by `DATA_DIR`, rename the copied directory (e.g., to `my_templates`), and set `TEMPLATES_USE` to the new directory name (e.g., `my_templates`).

For detailed instructions on customizing prompts, including supported parameters and examples, see the [Prompt Customization Guide](docs/en/prompt-customization.md).

## 💡 <a id="prompt"></a>System Prompt Guidance

### Cursor IDE Configuration

You can enable Cursor Settings => Features => Custom modes, and configure the following two modes:

#### TaskPlanner Mode

```
You are a professional task planning expert. You must interact with users, analyze their needs, and collect project-related information. Finally, you must use "plan_task" to create tasks. When the task is created, you must summarize it and inform the user to use the "TaskExecutor" mode to execute the task.
You must focus on task planning. Do not use "execute_task" to execute tasks.
Serious warning: you are a task planning expert, you cannot modify the program code directly, you can only plan tasks, and you cannot modify the program code directly, you can only plan tasks.
```

#### TaskExecutor Mode

```
You are a professional task execution expert. When a user specifies a task to execute, use "execute_task" to execute the task.
If no task is specified, use "list_tasks" to find unexecuted tasks and execute them.
When the execution is completed, a summary must be given to inform the user of the conclusion.
You can only perform one task at a time, and when a task is completed, you are prohibited from performing the next task unless the user explicitly tells you to.
If the user requests "continuous mode", all tasks will be executed in sequence.
```

> 💡 Choose the appropriate mode based on your needs:
>
> - Use **TaskPlanner** mode when planning tasks
> - Use **TaskExecutor** mode when executing tasks

### Using with Other Tools

If your tool doesn't support Custom modes, you can:

- Manually paste the appropriate prompts at different stages
- Or directly use simple commands like `Please plan the following task: ......` or `Please start executing the task...`

## 🛠️ <a id="tools"></a>Available Tools Overview

After configuration, you can use the following tools:

| Category                     | Tool Name            | Description                                      |
| ---------------------------- | -------------------- | ------------------------------------------------ |
| **Task Planning**            | `plan_task`          | Start planning tasks                             |
| **Task Analysis**            | `analyze_task`       | In-depth analysis of task requirements           |
|                              | `process_thought`    | Step-by-step reasoning for complex problems      |
| **Solution Assessment**      | `reflect_task`       | Reflect and improve solution concepts            |
| **Research & Investigation** | `research_mode`      | Enter systematic technical research mode         |
| **Idea Honing**              | `create_spec`        | Transform raw ideas into structured specifications with codebase analysis |
|                              | `get_spec`           | Retrieve and read stored specification documents using UUID |
|                              | `interact_spec`      | Interact with specifications through commands for viewing, editing, and workflow management |
| **Project Management**       | `init_project_rules` | Initialize or update project standards and rules |
| **Task Management**          | `split_tasks`        | Break tasks into subtasks                        |
|                              | `list_tasks`         | Display all tasks and status                     |
|                              | `query_task`         | Search and list tasks                            |
|                              | `get_task_detail`    | Display complete task details                    |
|                              | `delete_task`        | Delete incomplete tasks                          |
| **Task Execution**           | `execute_task`       | Execute specific tasks                           |
|                              | `verify_task`        | Verify task completion                           |

## 🔧 Technical Implementation

- **Node.js**: High-performance JavaScript runtime environment
- **TypeScript**: Provides type-safe development environment
- **MCP SDK**: Interface for seamless interaction with large language models
- **UUID**: Generate unique and reliable task identifiers

## 📄 <a id="license"></a>License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## <a id="recommended"></a>Recommended Models

For the best experience, we recommend using the following models:

- **Claude 3.7**: Offers strong understanding and generation capabilities.
- **Gemini 2.5**: Google's latest model, performs excellently.

Due to differences in training methods and understanding capabilities across models, using other models might lead to varying results for the same prompts. This project has been optimized for Claude 3.7 and Gemini 2.5.

## 🧪 Testing

### 🚀 Comprehensive Integrated Testing (Recommended)
**Complete end-to-end validation with 17/17 tools and 100% success rate:**

✅ **Real MCP server connection**  
✅ **Actual tool calls execution**  
✅ **All major tool categories validated**  
✅ **UUID/ID extraction and cross-tool integration**  
✅ **Detailed output demonstration**  

```bash
# Run comprehensive integrated testing
npm run test:integrated

# Clear terminal and run comprehensive testing
npm run test:integrated:clear

# Automatically validates all tool categories:
# - Project Management (init_project_rules)
# - Idea Honing System (create_spec, get_spec, interact_spec)
# - Task Management (plan_task, split_tasks, list_tasks, query_task, get_task_detail)
# - Task Execution (execute_task, verify_task, delete_task)
# - Research Mode (research_mode)
```

**What makes this comprehensive:**
- **Real MCP Protocol**: Direct communication with live MCP server
- **Actual Tool Execution**: Tools create real specifications and tasks
- **Cross-Tool Integration**: UUID extraction and data passing between tools
- **Detailed Output**: Full tool response validation and demonstration
- **Production Ready**: 100% success rate across all 17+ tools
- **Optional LLM Integration**: OpenAI GPT-4 analysis (if OPENAI_API_KEY provided)

**Expected Results:**
```
🚀 MCP Shrimp Task Manager - COMPREHENSIVE INTEGRATED TESTING
✅ Tests Passed: 17/17
📈 Success Rate: 100.0%
🔧 Integration Validation:
   ✅ REAL MCP Connection: YES
   ✅ ACTUAL Tool Calls: YES
   ✅ Complete Tool Coverage: YES
   ✅ Detailed Output Demo: YES
```

### 🔧 Professional MCP Testing (CI/CD)
Using the industry-standard `mcp-test` framework for automated validation:

```bash
# Complete test suite (used in GitHub Actions)
npm test

# Functional testing only
npm run test:functional
```

### 🧪 Legacy Testing Infrastructure
For development and debugging purposes:

```bash
# Comprehensive testing with methodological pragmatism
npm run test:legacy
```

### 🎯 GitHub Actions Integration
Our comprehensive testing runs automatically on:
- Every push to main, develop, mods branches
- Every pull request
- All releases and publications
- Cross-platform validation (Ubuntu, Windows, macOS)
- Multi-Node.js version support (18, 20, 22)

**Quality Gates:**
- Pre-publish validation ensures 100% test success before NPM releases
- Cross-platform compatibility verification
- Real MCP server connection validation
- Complete tool ecosystem testing

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cjo4m06/mcp-shrimp-task-manager&type=Timeline)](https://www.star-history.com/#cjo4m06/mcp-shrimp-task-manager&Timeline)
