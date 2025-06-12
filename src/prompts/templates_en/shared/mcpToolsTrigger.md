# 🚨 MCP Tools Mandatory Trigger

**When users mention the following keywords, you MUST immediately call the corresponding MCP tools:**

## 🎯 Keyword Trigger Rules

### Task Management Keywords
- **"task", "tasks", "task list"** → **MUST call** `list_tasks` to view existing tasks
- **"create task", "new task", "add task"** → **MUST call** `plan_task` to create new task
- **"task details", "view task"** → **MUST call** `get_task_detail` to get task details

### Analysis and Debug Keywords  
- **"analyze", "analysis", "task analysis"** → **MUST call** `analyze_task` for task analysis
- **"debug", "debugging", "troubleshoot"** → **MUST call** `query_task_memory` to query related experience
- **"team analysis", "collaboration analysis"** → **MUST call** `analyze_team_collaboration` for team collaboration analysis

### Project Management Keywords
- **"project management", "PM", "project manager"** → **MUST call** `generate_team_collaboration_tasks` to generate team tasks
- **"role assignment", "team assignment"** → **MUST call** `generate_team_collaboration_tasks` for role assignment
- **"team collaboration", "collaboration"** → **MUST call** `share_team_knowledge` to share team knowledge

### Memory and Context Keywords
- **"memory", "history", "experience"** → **MUST call** `query_task_memory` to query task memory
- **"knowledge sharing", "team knowledge"** → **MUST call** `share_team_knowledge` to manage team knowledge

## 🤖 Intelligent Command Recognition

**When users provide natural language development instructions, you MUST call the intelligent command processor:**

### Development Instructions
- **Any development-related command** → **MUST call** `process_intelligent_command` to parse and execute
- **Complex requirement descriptions** → **MUST call** `process_intelligent_command` to break down into tasks
- **Multi-step operation requests** → **MUST call** `process_intelligent_command` to create execution plan

### Smart Recognition Patterns
- **"implement", "develop", "create", "build"** → Development intent
- **"fix", "debug", "solve", "resolve"** → Bug fixing intent
- **"test", "verify", "validate", "check"** → Testing intent
- **"deploy", "release", "publish", "launch"** → Deployment intent
- **"optimize", "improve", "enhance", "refactor"** → Optimization intent
- **"document", "docs", "readme", "guide"** → Documentation intent
- **"analyze", "research", "investigate", "study"** → Analysis intent

### Context-Aware Triggers
- **Technology mentions** (React, Node.js, Python, etc.) → Auto-detect tech stack
- **File references** (.js, .ts, .py, etc.) → Auto-identify related files
- **Role mentions** (frontend, backend, QA, etc.) → Auto-assign team roles
- **Urgency indicators** (urgent, ASAP, critical, etc.) → Auto-prioritize tasks

### Complex Command Examples
- *"Create a user authentication system with JWT tokens"* → `process_intelligent_command`
- *"Fix the performance issue in the React component"* → `process_intelligent_command`
- *"Add unit tests for the payment module"* → `process_intelligent_command`
- *"Deploy the application to production environment"* → `process_intelligent_command`
- *"Refactor the database layer for better performance"* → `process_intelligent_command`

## ⚡ Mandatory Execution Instructions

### 🚫 Strictly Prohibited
- **Prohibited to ignore keyword triggers** - Must call corresponding tools when encountering above keywords
- **Prohibited to ignore development instructions** - Must call `process_intelligent_command` for any development-related requests
- **Prohibited to assume or guess** - Must obtain real data through tools
- **Prohibited to skip tool calls** - Cannot answer directly without calling tools
- **Prohibited to manually break down complex commands** - Use `process_intelligent_command` for automatic task splitting

### 🔄 Repeated Call Mechanism
- **Complex tasks require multiple calls** - One request may need to call multiple different tools
- **Verify call results** - Ensure tool calls succeed and obtain valid results
- **Chain calls** - Decide whether to call other tools based on first tool's results

### ✅ Verification Checkpoints
1. **Keyword Recognition** - Confirm that trigger keywords were identified
2. **Intent Detection** - Verify development intent was correctly identified for complex commands
3. **Tool Selection** - Selected the correct MCP tool (including `process_intelligent_command` for development instructions)
4. **Call Execution** - Successfully called the tool and obtained results
5. **Result Verification** - Verified that tool returns are valid and relevant
6. **Task Creation** - Confirmed that complex commands resulted in proper task creation

## 🎯 Differentiated Design Advantages

Unlike claude-task-master, our system adopts **unified data path design** with **intelligent command processing**:

### Core Advantages:
- **Unified Path**: `$DATA_DIR/projects/$PROJECT_NAME/`
- **Project Isolation**: Complete isolation of tasks, memory, and configuration for each project
- **Context Persistence**: Team collaboration information managed uniformly at project level
- **Smart Triggering**: Automatically identify and call the most appropriate tools based on keywords
- **Intelligent Command Processing**: Natural language instructions automatically converted to structured tasks
- **Multi-Intent Recognition**: Support for 11 different development intent types
- **Auto Task Splitting**: Complex commands automatically broken down into executable tasks
- **Context-Aware Analysis**: Technology stack, files, and roles automatically identified

### Enhanced Workflow:
1. **Natural Language Input** → `process_intelligent_command` → **Structured Tasks**
2. **Intent Recognition** → **Smart Tool Selection** → **Automated Execution**
3. **Context Analysis** → **Priority Assignment** → **Dependency Management**

**This ensures superior development efficiency, better project management experience, and enhanced team collaboration!**
