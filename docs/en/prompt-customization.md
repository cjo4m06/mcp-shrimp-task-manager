[English](../en/prompt-customization.md) | [中文](../zh/prompt-customization.md)

# Prompt Customization Guide

## Overview

This system allows users to customize the prompt content for each tool function through environment variables. This provides high flexibility, enabling you to adjust the AI assistant's behavior according to specific needs without modifying the code. There are two customization methods:

1. **Override Mode**: Completely replace the original prompt
2. **Append Mode**: Add new content based on the existing prompt

## Environment Variable Naming Rules

- Override Mode: `MCP_PROMPT_[FUNCTION_NAME]`
- Append Mode: `MCP_PROMPT_[FUNCTION_NAME]_APPEND`

Where `[FUNCTION_NAME]` is the name of the tool function in uppercase. For example, for the task planning function `planTask`, the corresponding environment variable name is `MCP_PROMPT_PLAN_TASK`.

## Multi-language Prompt Templates

Shrimp Task Manager supports prompt templates in multiple languages, configurable via the `TEMPLATES_USE` environment variable:

- Currently supported languages: `en` (English) and `zh` (Traditional Chinese)
- Default is `en` (English)

### Switching Languages

Set in the `mcp.json` configuration:

```json
"env": {
  "TEMPLATES_USE": "zh"  // Use Traditional Chinese templates
}
```

Or in the `.env` file:

```
TEMPLATES_USE=zh
```

### Custom Templates

You can create your own template set:

1. Copy an existing template set (e.g., `src/prompts/templates_en` or `src/prompts/templates_zh`) to your directory specified by `DATA_DIR`
2. Rename the copied directory (e.g., `my_templates`)
3. Modify the template files to meet your needs
4. Set the `TEMPLATES_USE` environment variable to your template directory name:

```json
"env": {
  "DATA_DIR": "/path/to/project/data",
  "TEMPLATES_USE": "my_templates"
}
```

The system will prioritize your custom templates and fall back to the built-in English templates if specific template files cannot be found.

## Supported Tool Functions

All major functions in the system support prompt customization through environment variables:

| Function Name      | Environment Variable Prefix     | Description              |
| ------------------ | ------------------------------- | ------------------------ |
| `planTask`         | `MCP_PROMPT_PLAN_TASK`          | Task planning            |
| `analyzeTask`      | `MCP_PROMPT_ANALYZE_TASK`       | Task analysis            |
| `reflectTask`      | `MCP_PROMPT_REFLECT_TASK`       | Solution evaluation      |
| `splitTasks`       | `MCP_PROMPT_SPLIT_TASKS`        | Task splitting           |
| `executeTask`      | `MCP_PROMPT_EXECUTE_TASK`       | Task execution           |
| `verifyTask`       | `MCP_PROMPT_VERIFY_TASK`        | Task verification        |
| `listTasks`        | `MCP_PROMPT_LIST_TASKS`         | List tasks               |
| `queryTask`        | `MCP_PROMPT_QUERY_TASK`         | Query tasks              |
| `getTaskDetail`    | `MCP_PROMPT_GET_TASK_DETAIL`    | Get task details         |
| `processThought`   | `MCP_PROMPT_PROCESS_THOUGHT`    | Thought chain processing |
| `initProjectRules` | `MCP_PROMPT_INIT_PROJECT_RULES` | Initialize project rules |

## Environment Variable Configuration Methods

There are two main configuration methods:

### 1. Using `.env` File

Use the `.env` file to set environment variables at the project level:

1. Copy `.env.example` to `.env` in the project root directory
2. Add the required environment variable configurations
3. The application will automatically load these environment variables when starting

```
# .env file example
MCP_PROMPT_PLAN_TASK=Custom prompt content
MCP_PROMPT_ANALYZE_TASK=Custom analysis prompt content
```

> Note: Ensure the `.env` file is ignored in version control (add to `.gitignore`), especially when it contains sensitive information.

### 2. Direct Configuration in mcp.json

You can also set environment variables directly in the Cursor IDE's `mcp.json` configuration file, eliminating the need for a separate `.env` file:

```json
{
  "mcpServers": {
    "shrimp-task-manager": {
      "command": "node",
      "args": ["/path/to/mcp-shrimp-task-manager/dist/index.js"],
      "env": {
        "DATA_DIR": "/path/to/project/data",
        "MCP_PROMPT_PLAN_TASK": "Custom task planning prompt",
        "MCP_PROMPT_EXECUTE_TASK_APPEND": "Additional execution guidance"
      }
    }
  }
}
```

This method has the advantage of keeping prompt configurations together with other MCP configurations, which is particularly useful when different projects require different prompts.

## Usage Examples

### Override Mode Example

```
# In .env file - completely replace the PLAN_TASK prompt
MCP_PROMPT_PLAN_TASK=## Custom Task Planning\n\nPlease plan the task based on the following information:\n\n{description}\n\nRequirements: {requirements}\n
```

Or configure in mcp.json:

```json
"env": {
  "MCP_PROMPT_PLAN_TASK": "## Custom Task Planning\n\nPlease plan the task based on the following information:\n\n{description}\n\nRequirements: {requirements}\n"
}
```

### Append Mode Example

```
# In .env file - append content after the original PLAN_TASK prompt
MCP_PROMPT_PLAN_TASK_APPEND=\n\n## Additional Guidance\n\nPlease pay special attention to the following:\n1. Prioritize task dependencies\n2. Minimize task coupling
```

Or configure in mcp.json:

```json
"env": {
  "MCP_PROMPT_PLAN_TASK_APPEND": "\n\n## Additional Guidance\n\nPlease pay special attention to the following:\n1. Prioritize task dependencies\n2. Minimize task coupling"
}
```

## Dynamic Parameter Support

Custom prompts can also use defined dynamic parameters by using the `{paramName}` syntax. The system will replace these placeholders with actual parameter values during processing.

The parameters supported by each function are as follows:

### planTask Supported Parameters

- `{description}` - Task description
- `{requirements}` - Task requirements
- `{existingTasksReference}` - Whether to reference existing tasks
- `{completedTasks}` - List of completed tasks
- `{pendingTasks}` - List of pending tasks
- `{memoryDir}` - Task memory storage directory

### analyzeTask Supported Parameters

- `{summary}` - Task summary
- `{initialConcept}` - Initial concept
- `{previousAnalysis}` - Previous analysis results

### reflectTask Supported Parameters

- `{summary}` - Task summary
- `{analysis}` - Analysis results

### splitTasks Supported Parameters

- `{updateMode}` - Update mode
- `{createdTasks}` - Created tasks
- `{allTasks}` - All tasks

### executeTask Supported Parameters

- `{task}` - Task details
- `{complexityAssessment}` - Complexity assessment results
- `{relatedFilesSummary}` - Related files summary
- `{dependencyTasks}` - Dependency tasks
- `{potentialFiles}` - Potentially related files

### verifyTask Supported Parameters

- `{task}` - Task details

### listTasks Supported Parameters

- `{status}` - Task status
- `{tasks}` - Tasks grouped by status
- `{allTasks}` - All tasks

### queryTask Supported Parameters

- `{query}` - Query content
- `{isId}` - Whether it's an ID query
- `{tasks}` - Query results
- `{totalTasks}` - Total number of results
- `{page}` - Current page number
- `{pageSize}` - Page size
- `{totalPages}` - Total number of pages

### getTaskDetail Supported Parameters

- `{taskId}` - Task ID
- `{task}` - Task details
- `{error}` - Error message (if any)

## Advanced Customization Cases

### Example 1: Add Brand Customization Prompts

Suppose you want to add company-specific brand information and guidelines to all task execution guides:

```
# In .env file
MCP_PROMPT_EXECUTE_TASK_APPEND=\n\n## Company-Specific Guidelines\n\nWhen executing tasks, please follow these principles:\n1. Keep code consistent with company style guide\n2. All new features must have corresponding unit tests\n3. Documentation must use company standard templates\n4. Ensure all user interface elements comply with brand design specifications
```

Or configure in mcp.json:

```json
"env": {
  "MCP_PROMPT_EXECUTE_TASK_APPEND": "\n\n## Company-Specific Guidelines\n\nWhen executing tasks, please follow these principles:\n1. Keep code consistent with company style guide\n2. All new features must have corresponding unit tests\n3. Documentation must use company standard templates\n4. Ensure all user interface elements comply with brand design specifications"
}
```

### Example 2: Adjust Task Analysis Style

Suppose you want to make task analysis more security-oriented:

```
# In .env file
MCP_PROMPT_ANALYZE_TASK=## Security-Oriented Task Analysis\n\nPlease conduct a comprehensive security analysis for the following task:\n\n**Task Summary:**\n{summary}\n\n**Initial Concept:**\n{initialConcept}\n\nDuring the analysis, please pay special attention to:\n1. Code injection risks\n2. Permission management issues\n3. Data validation and sanitization\n4. Security risks of third-party dependencies\n5. Potential configuration errors\n\nFor each potential issue, please provide:\n- Issue description\n- Impact level (Low/Medium/High)\n- Recommended solution\n\n{previousAnalysis}
```

Or configure in mcp.json:

```json
"env": {
  "MCP_PROMPT_ANALYZE_TASK": "## Security-Oriented Task Analysis\n\nPlease conduct a comprehensive security analysis for the following task:\n\n**Task Summary:**\n{summary}\n\n**Initial Concept:**\n{initialConcept}\n\nDuring the analysis, please pay special attention to:\n1. Code injection risks\n2. Permission management issues\n3. Data validation and sanitization\n4. Security risks of third-party dependencies\n5. Potential configuration errors\n\nFor each potential issue, please provide:\n- Issue description\n- Impact level (Low/Medium/High)\n- Recommended solution\n\n{previousAnalysis}"
}
```

### Example 3: Simplify Task List Display

If you find the default task list too detailed, you can simplify the display:

```
# In .env file
MCP_PROMPT_LIST_TASKS=# Task Overview\n\n## Pending Tasks\n{tasks.pending}\n\n## In-Progress Tasks\n{tasks.in_progress}\n\n## Completed Tasks\n{tasks.completed}
```

Or configure in mcp.json:

```json
"env": {
  "MCP_PROMPT_LIST_TASKS": "# Task Overview\n\n## Pending Tasks\n{tasks.pending}\n\n## In-Progress Tasks\n{tasks.in_progress}\n\n## Completed Tasks\n{tasks.completed}"
}
```

## Best Practices

1. **Incremental Adjustments**: Start with small changes and ensure the system still works properly after each modification.

2. **Save Configurations**: Save effective environment variable configurations to the project's `.env.example` file for team members to reference.

3. **Mind the Format**: Ensure proper line breaks and formatting in prompts, especially for environment variables enclosed in quotes.

4. **Test and Validate**: Test custom prompts in different scenarios to ensure they work properly in various situations.

5. **Consider Task Flow**: When modifying prompts, consider the entire task flow to ensure consistency between different stages.

## Troubleshooting

- **Environment Variables Not Taking Effect**: Ensure you have correctly set the environment variables and restarted the application after setting.

- **Format Issues**: Check if line breaks and special characters in environment variables are properly escaped.

- **Parameter Replacement Failure**: Ensure the parameter names you use match those supported by the system, including case sensitivity.

- **Restore Default Settings**: If custom prompts cause issues, you can delete the corresponding environment variables to restore default settings.

## Appendix: Default Prompt Reference
