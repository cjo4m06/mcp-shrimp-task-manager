**🔄 New Session Context Recovery Guide**

If this is a new AI session, you need to first recover project context:

## Step 1: Get Project Context
```
get_project_context
```

This will help you understand:
- What project you're currently working on
- Where tasks are stored
- Basic project information and structure

## Step 2: View Existing Tasks
```
list_tasks
```

This will show:
- All tasks in the current project
- Task status and progress
- List of incomplete tasks

## Step 3: Understand Project Rules (if exists)
If there's a `shrimp-rules.md` file in the project root, please read it to understand:
- Project-specific development standards
- Code style requirements
- Architecture patterns and conventions

## Why These Steps Are Needed?

Each new AI session is independent and has no memory of previous sessions. Through these steps:

1. **Restore Project Awareness** - Understand which project you're working on
2. **Restore Task Status** - Know which tasks are completed and which are in progress
3. **Restore Development Context** - Understand project development standards and patterns

This ensures that even in new sessions, you can:
- Correctly understand project structure and requirements
- Continue previous work progress
- Follow project development standards
- Access correct task and data storage locations
