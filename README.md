[🇺🇸 English](README.md) | [🇩🇪 Deutsch](docs/de/README.md) | [🇪🇸 Español](docs/es/README.md) | [🇫🇷 Français](docs/fr/README.md) | [🇮🇹 Italiano](docs/it/README.md) | [🇮🇳 हिन्दी](docs/hi/README.md) | [🇰🇷 한국어](docs/ko/README.md) | [🇧🇷 Português](docs/pt/README.md) | [🇷🇺 Русский](docs/ru/README.md) | [🇨🇳 中文](docs/zh/README.md)

# MCP Shrimp Task Manager

> 🦐 **Intelligent task management for AI-powered development** - Break down complex projects into manageable tasks, maintain context across sessions, and accelerate your development workflow.

## 📢 Latest Release - Version 4.1.0 (September 6, 2025)

**🎯 Enhanced Task Completion & UI Improvements!**

Version 4.1.0 introduces **structured task completion details** and **improved TaskTable UI** with summary preview functionality. Key highlights:

- **📊 New Task Completion Details**: Structured data model for comprehensive task completion information
- **🔍 Intelligent Summary Parser**: Advanced Markdown parser that extracts structured data from completion summaries
- **📋 TaskTable Summary Preview**: Quick task overview with expandable summaries and optimized mobile design
- **🎨 Enhanced Completion Display**: Rich visual presentation with organized sections and verification scores

[📖 Full 4.1.0 Release Notes](tools/task-viewer/releases/v4.1.0.md)

### Major Features from Version 4.0.0 (September 3, 2025)

**🚀 Archive Management System** - Revolutionary task list archiving with complete context preservation

**💡 Initial Request Display** - Permanently stores the original user request that initiated task planning

**📚 Enhanced Release Notes** - Interactive experience with collapsible Table of Contents

**🤖 7 New MCP Tools** - Complete programmatic access to archive and history functionality

[📖 Full 4.0.0 Release Notes](tools/task-viewer/releases/v4.0.0.md)

<div align="center">
  
[![Shrimp Task Manager Demo](docs/yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

**[Watch Demo Video](https://www.youtube.com/watch?v=Arzu0lV09so)** • **[Quick Start](#-quick-start)** • **[Documentation](#-documentation)**

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)
<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager"><img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" /></a>

</div>

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MCP-compatible AI client (Claude Code, etc.)

### Installation

#### Installing Claude Code

**Windows 11 (with WSL2):**
```bash
# First, ensure WSL2 is installed (in PowerShell as Administrator)
wsl --install

# Enter Ubuntu/WSL environment
wsl -d Ubuntu

# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Start Claude Code
claude
```

**macOS/Linux:**
```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Start Claude Code
claude
```

#### Installing Shrimp Task Manager

```bash
# Clone the repository
git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git
cd mcp-shrimp-task-manager

# Install dependencies
npm install

# Build the project
npm run build
```

### Configure Claude Code

Create a `.mcp.json` file in your project directory:

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/your/shrimp_data",
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

Example configuration:
```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/home/fire/claude/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/home/fire/claude/project/shrimp_data",
        "TEMPLATES_USE": "en",
        "ENABLE_GUI": "false"
      }
    }
  }
}
```

Then start Claude Code with your custom MCP configuration:

```bash
claude --dangerously-skip-permissions --mcp-config .mcp.json
```

<details>
<summary><b>Other AI Clients</b></summary>

**Cline (VS Code Extension)**: A VS Code extension for AI-assisted coding. Add to VS Code settings.json under `cline.mcpServers`

**Claude Desktop**: Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)
</details>

### Start Using

1. **Initialize your project**: `"init project rules"`
2. **Plan a task**: `"plan task: implement user authentication"`
3. **Execute tasks**: `"execute task"` or `"continuous mode"`

## 💡 What is Shrimp?

Shrimp Task Manager is an MCP (Model Context Protocol) server that transforms how AI agents approach software development. Instead of losing context or repeating work, Shrimp provides:

- **🧠 Persistent Memory**: Tasks and progress persist across sessions
- **📋 Structured Workflows**: Guided processes for planning, execution, and verification
- **🔄 Smart Decomposition**: Automatically breaks complex tasks into manageable subtasks
- **🎯 Context Preservation**: Never lose your place, even with token limits

## ✨ Core Features

### Task Management
- **Intelligent Planning**: Deep analysis of requirements before implementation
- **Task Decomposition**: Break down large projects into atomic, testable units
- **Dependency Tracking**: Automatic management of task relationships
- **Progress Monitoring**: Real-time status tracking and updates

### Advanced Capabilities
- **🔬 Research Mode**: Systematic exploration of technologies and solutions
- **🤖 Agent System**: Assign specialized AI agents to specific tasks ([Learn more](docs/agents.md))
- **📏 Project Rules**: Define and maintain coding standards across your project
- **💾 Task Memory**: Automatic backup and restoration of task history
- **📚 Archive Management**: Store and restore complete task lists with full context preservation
- **💡 Initial Request Tracking**: Permanently capture the original context behind task creation

### Web Interfaces

#### 🖥️ Task Viewer
Modern React interface for visual task management with drag-and-drop, real-time search, and multi-profile support.

**Quick Setup:**
```bash
cd tools/task-viewer
npm install
npm run start:all
# Access at http://localhost:5173
```

[📖 Full Task Viewer Documentation](tools/task-viewer/README.md)

<kbd><img src="tools/task-viewer/task-viewer-interface.png" alt="Task Viewer Interface" width="600"/></kbd>

#### 🌐 Web GUI
Optional lightweight web interface for quick task overview.

Enable in `.env`: `ENABLE_GUI=true`

## 📚 Documentation

- [📖 Full Documentation](docs/README.md)
- [🛠️ Available Tools](docs/tools.md)
- [🤖 Agent Management](docs/agents.md)
- [🎨 Prompt Customization](docs/en/prompt-customization.md)
- [🔧 API Reference](docs/api.md)

## 🎯 Common Use Cases

<details>
<summary><b>Feature Development</b></summary>

```
Agent: "plan task: add user authentication with JWT"
# Agent analyzes codebase, creates subtasks

Agent: "execute task"
# Implements authentication step by step
```
</details>

<details>
<summary><b>Bug Fixing</b></summary>

```
Agent: "plan task: fix memory leak in data processing"
# Agent researches issue, creates fix plan

Agent: "continuous mode"
# Executes all fix tasks automatically
```
</details>

<details>
<summary><b>Research & Learning</b></summary>

```
Agent: "research: compare React vs Vue for this project"
# Systematic analysis with pros/cons

Agent: "plan task: migrate component to chosen framework"
# Creates migration plan based on research
```
</details>

<details>
<summary><b>Archive Management</b></summary>

```
Agent: "plan task: implement user dashboard with analytics"
# Agent creates comprehensive task list

Agent: "create archive Dashboard_Implementation"
# Archive tasks for later when priorities change

Agent: "plan task: fix critical security vulnerability"
# Work on urgent issue first

Agent: "restore from archive Dashboard_Implementation"
# Resume dashboard work with full context preserved
```
</details>

## 🛠️ Configuration

### Environment Variables

Create a `.env` file:

```bash
# Required
DATA_DIR=/path/to/data/storage

# Optional
ENABLE_GUI=true          # Enable web GUI
WEB_PORT=3000           # Custom web port
PROMPT_LANGUAGE=en      # Prompt language (en, zh, etc.)
```

### Available Commands

| Command | Description |
|---------|-------------|
| `init project rules` | Initialize project standards |
| `plan task [description]` | Create a task plan |
| `execute task [id]` | Execute specific task |
| `continuous mode` | Execute all tasks sequentially |
| `list tasks` | Show all tasks |
| `research [topic]` | Enter research mode |
| `reflect task [id]` | Review and improve task |
| `create archive [name]` | Create backup archive of tasks |
| `restore from archive [id]` | Restore tasks from archive |
| `get deleted tasks` | View history of deleted tasks |
| `recover task [id]` | Restore previously deleted task |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Credits

Created by [cjo4m06](https://github.com/cjo4m06) and maintained by the community.

**Special Thanks:**
- [Paul Pribisch](https://github.com/paulpreibisch) - Creator of the Shrimp Task Manager Viewer interface

---

<p align="center">
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager">GitHub</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/issues">Issues</a> •
  <a href="https://github.com/cjo4m06/mcp-shrimp-task-manager/discussions">Discussions</a>
</p>