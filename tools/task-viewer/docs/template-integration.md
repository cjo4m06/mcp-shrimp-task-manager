# Template Integration Guide

## Overview

The Shrimp Task Manager Viewer allows you to edit prompt templates through a web interface. However, these edited templates need to be properly configured for the MCP server to use them.

## How It Works

### 1. Template Storage Locations

- **Default Templates**: `src/prompts/templates_en/` (in the main project)
- **Viewer Custom Templates**: `~/.shrimp-task-viewer-templates/` (edited via web UI)
- **MCP Server**: Reads from environment variables or default locations

### 2. Template Flow

```
[Web UI Editor] → [~/.shrimp-task-viewer-templates/] → [Export] → [Environment Variables] → [MCP Server]
```

### 3. Why Templates Don't Auto-Sync

- The viewer and MCP server are separate processes
- MCP servers are started when Claude starts and read configuration once
- Environment variables are the primary way to override templates
- Security: Auto-syncing would allow web UI to modify Claude's behavior without explicit approval

## How to Use Custom Templates

### Method 1: Environment Variables (Recommended)

1. Edit templates in the web UI
2. Export templates using the "Export Templates" button
3. Choose ".env" format
4. Add the exported variables to your shell or Claude's MCP configuration

Example:
```bash
export MCP_PROMPT_ANALYZE_TASK="Your custom analyze task prompt..."
export MCP_PROMPT_INIT_PROJECT_RULES="Your custom project rules prompt..."
```

### Method 2: MCP Configuration in Claude

Add to your Claude MCP settings:
```json
{
  "mcps": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["path/to/mcp-shrimp-task-manager"],
      "env": {
        "MCP_PROMPT_ANALYZE_TASK": "Your custom prompt...",
        "MCP_PROMPT_INIT_PROJECT_RULES": "Another custom prompt..."
      }
    }
  }
}
```

### Method 3: Project .env File

Create a `.env` file in your project root:
```env
MCP_PROMPT_ANALYZE_TASK="Your custom analyze task prompt..."
MCP_PROMPT_INIT_PROJECT_RULES="Your custom project rules prompt..."
```

## Testing Your Templates

1. **Check Current Templates**:
   ```bash
   node test-template-integration.js
   ```

2. **Verify Context7 Was Called**:
   - Check Claude's console logs
   - Look for Context7 tool calls in the conversation
   - The Context7 prompt should appear during task analysis

3. **Debug Steps**:
   - Ensure environment variables are set
   - Restart Claude to pick up new variables
   - Check MCP server logs for template loading

## Important Notes

1. **Session Persistence**: Changes require Claude restart
2. **Template Names**: Must match function names (e.g., `analyzeTask` → `MCP_PROMPT_ANALYZE_TASK`)
3. **Special Characters**: Properly escape quotes and newlines in environment variables
4. **Mode Support**: Use `_APPEND` suffix to append to existing templates

## Example: Adding Context7 to Templates

Your modification to use Context7:
```markdown
- Have you used Context7 to search for best practices, code snippets, or implementation examples to better understand and apply the technology used in the solution?
```

This will prompt the AI to use Context7 during the analyze phase, helping to find relevant documentation and examples.

## Troubleshooting

1. **Templates not being used**:
   - Check environment variables are set
   - Restart Claude
   - Verify template names match exactly

2. **Context7 not being called**:
   - Ensure the prompt explicitly mentions Context7
   - Check if Context7 MCP server is properly configured
   - Look for the specific task phase where you added the prompt

3. **Preview button not working**:
   - Fixed in latest version
   - Shows template content in a modal

## Future Improvements

- Auto-sync option with user confirmation
- Template versioning and rollback
- Direct MCP server integration
- Template testing sandbox