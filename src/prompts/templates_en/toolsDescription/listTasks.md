Generate structured task lists, including complete status tracking, priorities, and dependencies.

**Data Source:** `$DATA_DIR/projects/$PROJECT_NAME/tasks.json`

This tool reads from the project-specific tasks file and provides comprehensive task information including:
- Task ID, name, description, and status
- Creation and update timestamps
- Dependencies and priority levels
- Progress tracking and completion status

**Usage Note:** Ensure project context is set via `get_project_context` before calling this tool to access the correct project's tasks.
