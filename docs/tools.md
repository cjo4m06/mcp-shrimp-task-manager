# Available Tools

## Task Management Tools

### Core Task Operations

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `plan_task` | Create a comprehensive task plan | `"plan task: implement authentication"` |
| `execute_task` | Execute a specific task | `"execute task 1"` |
| `list_tasks` | Display all tasks with status | `"list tasks"` |
| `delete_task` | Remove a task from the queue | `"delete task 3"` |
| `complete_task` | Mark a task as completed | `"complete task 2"` |
| `update_task` | Modify task details | `"update task 1 with new requirements"` |

### Advanced Task Operations

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `split_tasks` | Break down complex tasks | `"split task 1 into subtasks"` |
| `analyze_task` | Deep analysis of task requirements | `"analyze task complexity"` |
| `verify_task` | Validate task completion | `"verify task 1"` |
| `reflect_task` | Review and improve task approach | `"reflect on task 2"` |
| `query_task` | Search tasks by criteria | `"query tasks with status pending"` |

### 📝 Rich Task Completion (New)

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `completeTaskWithRichDetails` | Complete task with comprehensive documentation | See [Rich Completion Guide](rich-completion-guide.md) |
| `batchCompleteTasksWithRichDetails` | Complete multiple tasks with rich details | See [Agent Integration](agent-integration.md) |
| `validateTaskEligibility` | Check if task can be completed | `validateTaskEligibility(taskId)` |
| `createPartialCompletionDetails` | Create completion with partial info | For incomplete information scenarios |

### Task Memory & History

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `get_task_detail` | Retrieve detailed task information | `"get details for task 1"` |
| `get_task_history` | Get historical audit trail for tasks | `"get task history"` |
| `clear_all_tasks` | Remove all tasks (with backup) | `"clear all tasks"` |

### Task Archival & Recovery

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `create_archive` | Create backup archive of current tasks | `"create archive [name]"` |
| `list_archives` | List all available task archives | `"list archives"` |
| `restore_from_archive` | Restore tasks from archive | `"restore from archive [id]"` |
| `sync_task_state` | Synchronize task state across systems | `"sync task state"` |
| `get_deleted_tasks` | Retrieve information about deleted tasks | `"get deleted tasks"` |
| `recover_task` | Recover a previously deleted task | `"recover task [id]"` |

## Project Management Tools

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `init_project_rules` | Initialize project standards | `"init project rules"` |
| `research_mode` | Enter systematic research mode | `"research GraphQL vs REST"` |

## Thought Processing Tools

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `process_thought` | Process and structure thoughts | Internal use by agent |

## Tool Categories

### 🎯 Planning Tools
- `plan_task` - Strategic task planning
- `analyze_task` - Requirement analysis
- `split_tasks` - Task decomposition

### ⚡ Execution Tools
- `execute_task` - Task implementation
- `update_task` - Task modification
- `complete_task` - Mark completion

### ✅ Verification Tools
- `verify_task` - Validate results
- `reflect_task` - Quality review
- `query_task` - Status checking
- `completeTaskWithRichDetails` - Complete with comprehensive documentation (NEW)
- `validateTaskEligibility` - Check completion eligibility (NEW)

### 🧠 Memory Tools
- `get_task_detail` - Retrieve history
- `get_task_history` - Complete audit trail
- `clear_all_tasks` - Clean slate with backup

### 💾 Archival Tools
- `create_archive` - Create task backups
- `list_archives` - Browse available archives
- `restore_from_archive` - Restore from backup
- `sync_task_state` - Synchronize task state
- `get_deleted_tasks` - View deleted task history
- `recover_task` - Restore deleted tasks

### 🔬 Research Tools
- `research_mode` - Technology exploration
- `init_project_rules` - Standards definition

## Best Practices

### Task Planning
1. Always start with `init project rules` for new projects
2. Use `plan task` before implementation
3. Let the system handle task decomposition automatically

### Task Execution
1. Execute tasks in dependency order
2. Use `continuous mode` for batch processing
3. Verify completion with `verify_task`

### Task Completion with Rich Documentation
1. Use `completeTaskWithRichDetails` for comprehensive task documentation
2. Collect accomplishments, features, approach, and decisions during execution
3. Leverage task-specific templates (UI, Backend, DevOps) for consistency
4. See [Rich Completion Guide](rich-completion-guide.md) for detailed usage

### Memory Management
1. Tasks persist across sessions automatically
2. Use `query_task` to find specific tasks
3. `clear_all_tasks` creates automatic backups

### Research Mode
1. Use for technology comparisons
2. Gather information before planning
3. Document findings in task context

## Token Optimization

When working with large projects:
1. Focus on one task at a time
2. Use task IDs instead of descriptions
3. Let the system manage context
4. Start new sessions when hitting limits

## Error Handling

Common scenarios and solutions:

| Issue | Solution |
|-------|----------|
| Lost context | Start new session, system will resume |
| Task conflicts | Use dependency management |
| Complex requirements | Use `split_tasks` for decomposition |
| Unclear specs | Use `research_mode` first |