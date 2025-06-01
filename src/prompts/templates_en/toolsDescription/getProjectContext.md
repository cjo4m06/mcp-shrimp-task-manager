Get current project context information, including project detection status, data directory configuration, and environment variable settings. Used to understand the current working environment and task storage location.

This tool provides comprehensive project context using the new MCP-style project detection system, including:
- Project root directory and identification
- Project type detection (Git, Node.js, Python, Rust, Go)
- Detection method used (explicit, environment, auto-detection, fallback)
- Package information if available
- Data directory paths and configuration
- AI usage suggestions for optimal workflow

## 📁 Data Storage Integration

This tool automatically sets up the data storage structure according to our standardized rules:

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

**Key Paths Created:**
- Tasks: `$DATA_DIR/projects/$PROJECT_NAME/tasks.json`
- Memory: `$DATA_DIR/projects/$PROJECT_NAME/memory/`
- Logs: `$DATA_DIR/projects/$PROJECT_NAME/logs/`

**Usage Note:** Always call this tool first to ensure proper project context and data directory setup before using other project-related tools.
