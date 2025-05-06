## Task Splitting - {updateMode} Mode

## Splitting Strategy

1. **Functional Decomposition** - Independent testable sub-functions with clear inputs and outputs
2. **Technical Layer Decomposition** - Separate tasks along architectural layers, ensuring clear interfaces
3. **Development Stage Decomposition** - Core functionality first, optimization features later
4. **Risk-based Decomposition** - Isolate high-risk parts, reduce overall risk

## Task Quality Review

1. **Task Atomicity** - Each task is small and specific enough to be completed independently
2. **Dependencies** - Task dependencies form a directed acyclic graph, avoiding circular dependencies
3. **Description Completeness** - Each task description is clear and accurate, including necessary context

## Task List

{tasksContent}

## Dependency Management

- Dependencies can be set using task names or task IDs
- Minimize the number of dependencies, only set direct prerequisite tasks
- Avoid circular dependencies, ensure the task graph is directed and acyclic
- Balance the critical path, optimize possibilities for parallel execution

## Decision Points

- If task splitting is found unreasonable: call "split_tasks" again to adjust
- If task splitting is confirmed to be sound: generate execution plan, determine priorities

**Severe Warning** Each time you call split_tasks, the parameters you pass cannot exceed 5000 characters. If it exceeds 5000 characters, please call the tool multiple times to complete

**If there are remaining tasks, please continue to call "split_tasks"**
