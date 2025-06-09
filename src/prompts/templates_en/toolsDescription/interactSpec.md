# Interact with Specification Tool

This tool allows you to interact with specifications created by the Idea Honing Tool through a command-based interface. It provides commands for viewing, editing, and managing the workflow of specifications.

## Key Features

- **View Specifications**: View the content and metadata of specifications
- **Edit Sections**: Update the content of specification sections
- **Mark Sections Complete**: Track progress by marking sections as complete
- **Manage Questions**: Add and answer questions related to specifications
- **Change Workflow Phase**: Move between analysis, drafting, review, and planning phases
- **View Tasks**: See tasks associated with a specification
- **Track Progress**: Monitor the overall progress of a specification

## Usage

Provide a command to execute and optionally a specification ID. If a specification ID is provided, it will be automatically included in the command if not already present.

## Parameters

- **specId**: Specification identifier (optional)
- **command**: Command to execute (required)

## Available Commands

- `view <specId>`: View a specification
- `edit <specId> <sectionId> <content>`: Edit a section in a specification
- `complete <specId> <sectionId>`: Mark a section as complete
- `question <specId> <targetSection> <text>`: Add a question
- `answer <specId> <questionId> <answer>`: Answer a question
- `phase <specId> <phase>`: Change the workflow phase
- `tasks <specId>`: View tasks for a specification
- `progress <specId>`: View progress for a specification
- `help [command]`: Get help information

## Examples

```json
{
  "specId": "abc123",
  "command": "view"
}
```

```json
{
  "command": "help"
}
```

```json
{
  "specId": "abc123",
  "command": "edit overview This is the new overview content."
}
```

## Output

The tool will return a formatted response with the results of the command execution, including any relevant data such as specification content, workflow state, tasks, or progress information.
