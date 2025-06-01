# 📁 Data Storage Rules

## Overview
All data should be stored under the `DATA_DIR` directory with a clear hierarchical structure. Directories are automatically created if they don't exist.

## Directory Structure

### Base Data Directory
```
$DATA_DIR/
├── logs/                           # System logs
├── projects/                       # Project-specific data
│   └── $PROJECT_NAME/             # Individual project data
│       ├── tasks.json             # Project tasks
│       ├── memory/                # AI memory storage
│       ├── logs/                  # Project-specific logs
│       └── config/                # Project configuration
└── global/                        # Global settings and cache
    ├── config.json               # Global configuration
    └── cache/                    # Temporary cache files
```

## Specific File Paths

### Logs
- **System logs**: `$DATA_DIR/logs/app-YYYY-MM-DD.log`
- **Project logs**: `$DATA_DIR/projects/$PROJECT_NAME/logs/app-YYYY-MM-DD.log`

### Tasks
- **Project tasks**: `$DATA_DIR/projects/$PROJECT_NAME/tasks.json`
- **Task format**: JSON array with task objects containing id, name, description, status, dependencies, timestamps

### Memory
- **AI memory**: `$DATA_DIR/projects/$PROJECT_NAME/memory/`
- **Memory files**: Organized by date or topic for efficient retrieval

### Configuration
- **Project config**: `$DATA_DIR/projects/$PROJECT_NAME/config/`
- **Global config**: `$DATA_DIR/global/config.json`

## Path Variables

### Environment Variables
- `DATA_DIR`: Base directory for all data storage (required)
- `PROJECT_NAME`: Current project identifier (auto-detected or manually set)

### Auto-Detection Rules
1. **PROJECT_NAME** is derived from:
   - Project root directory name (sanitized)
   - package.json name field (if available)
   - Manual configuration via `set_project_working_directory`

2. **DATA_DIR** defaults to:
   - Environment variable `DATA_DIR` (preferred)
   - `./data` relative to current working directory (fallback)

## Usage Guidelines

### For AI Assistants
1. **Always use project-specific paths** for tasks and memory
2. **Check if directories exist** before writing files
3. **Use absolute paths** when calling MCP tools
4. **Respect the hierarchy** - don't create files in wrong locations

### Path Resolution Examples
```
# If DATA_DIR=/home/user/.shrimp and PROJECT_NAME=my-app
Tasks file: /home/user/.shrimp/projects/my-app/tasks.json
Memory dir: /home/user/.shrimp/projects/my-app/memory/
Logs dir:   /home/user/.shrimp/projects/my-app/logs/
```

### Error Handling
- If `DATA_DIR` is not set, tools will use `./data` as fallback
- If `PROJECT_NAME` cannot be detected, tools will use `default-project`
- Missing directories are created automatically with proper permissions

## Integration with MCP Tools

### Tools that use these paths:
- `list_tasks`, `execute_task`, `delete_task` → tasks.json
- `get_project_context` → project detection and path setup
- `view_realtime_logs` → log files
- `set_project_working_directory` → project configuration

### Best Practices:
1. Call `get_project_context` first to ensure proper path setup
2. Use `show_path_status` to verify current path configuration
3. Set `DATA_DIR` environment variable for consistent behavior
4. Use `set_project_working_directory` for multi-project workflows
