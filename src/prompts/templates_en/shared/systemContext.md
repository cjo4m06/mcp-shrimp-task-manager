# 🤖 System Context for AI Assistants

## Data Storage Rules

All data must be stored under the `DATA_DIR` directory following this structure:

```
$DATA_DIR/
├── logs/                           # System logs
├── projects/                       # Project-specific data
│   └── $PROJECT_NAME/             # Current project data
│       ├── tasks.json             # Project tasks
│       ├── memory/                # AI memory storage
│       ├── logs/                  # Project-specific logs
│       └── config/                # Project configuration
└── global/                        # Global settings
```

### Key File Paths:
- **Tasks**: `$DATA_DIR/projects/$PROJECT_NAME/tasks.json`
- **Memory**: `$DATA_DIR/projects/$PROJECT_NAME/memory/`
- **Logs**: `$DATA_DIR/projects/$PROJECT_NAME/logs/app-YYYY-MM-DD.log`
- **Config**: `$DATA_DIR/projects/$PROJECT_NAME/config/`

### Environment Variables:
- `DATA_DIR`: Base directory for all data (auto-created if missing)
- `PROJECT_NAME`: Current project identifier (auto-detected from project root)

## Workflow Guidelines

### 1. Project Context Setup
**Always start with:** `get_project_context()` to ensure proper path configuration.

### 2. Path Verification
Use `show_path_status()` to verify current data directory setup.

### 3. Multi-Project Support
Use `set_project_working_directory()` when switching between projects.

### 4. Data Access Patterns
- **Tasks**: Use task-related tools (list_tasks, execute_task, etc.)
- **Memory**: Store in project-specific memory directory
- **Logs**: Automatically handled by the logging system

## Error Handling

### Common Issues:
1. **Wrong project detected**: Use `set_project_working_directory` to correct
2. **Missing DATA_DIR**: System will create `./data` as fallback
3. **Permission errors**: Ensure write access to DATA_DIR

### Diagnostic Tools:
- `analyze_working_directory`: Diagnose path detection issues
- `diagnose_mcp_environment`: Check MCP environment setup
- `get_project_context`: Verify current project configuration

## Best Practices

### For Task Management:
1. Call `get_project_context` first
2. Use project-specific task storage
3. Maintain task dependencies and status
4. Log important operations

### For Memory Management:
1. Store memories in project-specific directories
2. Organize by date or topic for easy retrieval
3. Use consistent naming conventions

### For Multi-Project Workflows:
1. Set explicit project paths when switching
2. Verify data isolation between projects
3. Use persistent configuration when needed

## Integration Notes

This system is designed to work seamlessly with MCP (Model Context Protocol) environments where:
- `process.cwd()` may point to IDE installation directories
- Multiple projects need isolated data storage
- AI assistants need clear guidance on data organization
- Path detection must be reliable across different environments
