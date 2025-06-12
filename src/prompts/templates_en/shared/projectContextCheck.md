**🚨 MANDATORY FIRST STEP:**

Before proceeding with any task, you MUST call `get_project_context` to:

1. **Confirm Current Working Directory**: Ensure you're working with the correct project
2. **Verify Data Storage Paths**: Confirm where tasks, memory, and logs are stored
3. **Check Project Detection**: Validate that the system detected the right project

**Expected Output Structure:**
```
$DATA_DIR/projects/$PROJECT_NAME/
├── tasks.json     # Your tasks will be stored here
├── memory/        # AI memory and context
├── logs/          # Project-specific logs
└── config/        # Project configuration
```

**If the detected project is wrong:**
- Use `set_project_working_directory` to correct the path
- Provide the absolute path to the correct project directory
- Set `persistent: true` to save the configuration

**This ensures:**
- Tasks are saved in the correct project directory
- Memory and context are project-specific
- All data is properly organized and accessible
