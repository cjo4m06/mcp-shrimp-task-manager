Get and manage storage paths for AI-generated documentation. This tool provides a simple interface for AI to call, ensuring all document creation operations use the correct project-specific paths.

## 🎯 Core Features

- **Path Retrieval**: Get project-specific documentation storage paths
- **Path Validation**: Validate filename and subdirectory name security
- **Directory Creation**: Automatically create necessary directory structures
- **Error Handling**: Provide detailed error information and debugging suggestions

## 📁 Path Structure

This tool is based on a unified project data directory structure:

```
$DATA_DIR/projects/$PROJECT_NAME/
├── tasks.json             # Project tasks
├── memory/                # AI memory storage
├── logs/                  # Project logs
├── config/                # Project configuration
└── docs/                  # Document storage ← Directory managed by this tool
    ├── analysis/          # Analysis documents
    ├── reflection/        # Reflection documents
    ├── research/          # Research documents
    └── summary/           # Summary documents
```

## 🔧 Use Cases

- **Analysis Documents**: Store project analysis and technical research documents
- **Reflection Summaries**: Save task execution reflections and summaries
- **Research Records**: Record research processes and discoveries
- **Team Collaboration**: Generate shared documentation for teams

## 💡 Best Practices

1. **Use Subdirectories**: Organize different types of documents through the `subDir` parameter
2. **Standard Naming**: Use clear filenames, avoid special characters
3. **Auto Creation**: Keep `createDir: true` to ensure complete directory structure

## ⚠️ Security Features

- Filename security validation to prevent path traversal attacks
- System reserved name checking (Windows compatibility)
- Filename length restrictions
- Subdirectory name security validation

**Usage Instructions:** Before creating any project documentation, please use this tool to get the correct storage path, ensuring unified document management and project isolation.
