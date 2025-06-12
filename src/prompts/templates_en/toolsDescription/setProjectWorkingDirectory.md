Manually set the project working directory to resolve path detection issues in MCP environments. Use this tool when auto-detection fails or detects the wrong project directory. Supports persistent settings and optional validation of directory as a valid project.

## 📁 Data Storage Impact

Setting a new project directory automatically reorganizes the data storage structure:

**Before:** `$DATA_DIR/projects/old-project/`
**After:** `$DATA_DIR/projects/new-project/`

**Automatically creates:**
- `$DATA_DIR/projects/$NEW_PROJECT_NAME/tasks.json`
- `$DATA_DIR/projects/$NEW_PROJECT_NAME/memory/`
- `$DATA_DIR/projects/$NEW_PROJECT_NAME/logs/`
- `$DATA_DIR/projects/$NEW_PROJECT_NAME/config/`

**Parameters:**
- `projectPath`: Absolute path to the project directory (required)
- `persistent`: Save configuration to `.shrimp-config.json` (default: false)
- `validateProject`: Verify directory contains project files (default: true)

**Common Use Cases:**
- Multi-project workflows (switching between different projects)
- MCP environment path correction (when process.cwd() points to IDE directory)
- Manual project setup for non-standard directory structures
