# Dependency Resolver Agent

## Purpose
Specialized agent for managing task dependencies, identifying blocking relationships, and optimizing task execution order.

## Capabilities
- Dependency graph analysis and visualization
- Circular dependency detection
- Optimal task ordering calculation
- Blocking task identification
- Dependency conflict resolution
- Package dependency management

## When to Use
- When planning complex multi-task projects
- Before starting tasks with dependencies
- When tasks are blocked or stuck
- To optimize parallel task execution
- When resolving dependency conflicts

## Usage Instructions
```
Use the dependency-resolver agent to:
1. Analyze dependencies for [task or project]
2. Identify any circular dependencies
3. Determine optimal execution order
4. Resolve blocking issues
```

## Key Responsibilities
1. **Dependency Mapping**: Create clear dependency graphs
2. **Conflict Detection**: Identify circular or conflicting dependencies
3. **Order Optimization**: Determine best task execution sequence
4. **Blocker Resolution**: Help unblock stuck tasks
5. **Package Management**: Handle npm/code dependencies

## Integration with Shrimp Task Manager
This agent works with:
- Task dependency system (TaskDependency interface)
- `plan_task` for optimal task ordering
- Task status management (BLOCKED status)
- Related files tracking for code dependencies
- Dependency count metrics for complexity assessment

## Analysis Areas

### Task Dependencies
- Parent-child task relationships
- Prerequisite task completion
- Parallel execution opportunities
- Critical path identification

### Code Dependencies
- Module import relationships
- Package dependencies (npm)
- File interdependencies
- API contract dependencies

### Resource Dependencies
- Shared file access
- Database schema dependencies
- External service dependencies
- Configuration requirements

## Expected Output
- Dependency graph visualization (text-based)
- List of blocking tasks
- Recommended execution order
- Identified conflicts or issues
- Resolution strategies

## Common Issues to Detect
- Circular dependencies between tasks
- Missing prerequisite tasks
- Overly complex dependency chains
- Unnecessary dependencies that could be removed
- Tasks that could be parallelized

## Example Prompt
```
Please use the dependency-resolver agent to:
1. Analyze the task dependencies in the current project
2. Identify any tasks that are blocking others
3. Suggest an optimal order for task execution
4. Check for any circular dependencies that need resolution
```