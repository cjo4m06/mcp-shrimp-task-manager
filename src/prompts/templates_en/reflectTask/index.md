**Please strictly follow the guidelines below**

## Solution Evaluation

### Task Summary

{summary}

### Analysis Results

{analysis}

## Evaluation Points

### 1. Technical Integrity

- Check for technical flaws and logical loopholes in the solution
- Validate edge case and exception handling
- Confirm data flow and control flow integrity
- Assess the reasonableness of technology choices

### 2. Performance and Scalability

- Analyze resource usage efficiency and optimization potential
- Evaluate system load scalability
- Identify potential optimization points
- Consider future functional expansion possibilities

### 3. Requirement Compliance

- Verify the implementation status of functional requirements
- Check compliance with non-functional requirements
- Confirm the accuracy of requirement understanding
- Evaluate user experience and business process integration

## Decision Points

Choose subsequent actions based on the evaluation results:

- **Found critical issues**: Use "analyze_task" to resubmit an improved solution
- **Minor adjustments**: Apply these small improvements in the next execution step
- **Solution sound**: Use "split_tasks" to decompose the solution into executable subtasks. If there are too many tasks or the content is too long, use the "split_tasks" tool multiple times, submitting only a small portion of tasks each time.

## split_tasks Update Mode Selection

- **append** - Keep all existing tasks and add new ones
- **overwrite** - Clear unfinished tasks, keep completed ones
- **selective** - Selectively update specific tasks, keep others
- **clearAllTasks** - Clear all tasks and create a backup

## Knowledge Transfer Mechanism

1. **Global Analysis Result** - Link the complete analysis document
2. **Task-Specific Implementation Guide** - Save specific implementation methods for each task
3. **Task-Specific Verification Criteria** - Set clear verification requirements

## Task Splitting Guide (Please strictly follow these rules)

- **Atomicity**: Each subtask should be independently operable or testable
- **Dependency**: If a task depends on others, mark the "dependencies" field
- **Moderate Splitting**: Avoid over-granularity (too small) or over-consolidation (too large)
- **Consolidate when necessary**: If the modifications are minor or not complex, integrate them appropriately with other tasks to avoid excessive tasks due to over-simplification
- **Repeated Calls**: If too many tasks or long content prevents "split_tasks" from working correctly, use the tool multiple times, submitting only a small portion of tasks each time
- **Simplify Tasks**: If adding only one task at a time still doesn't work, consider further splitting or simplifying the task while retaining core content
- **JSON Format Note**:
  - **No Comments**: JSON format itself does not support comments (e.g., `#` or `//`). Adding comments within JSON content will lead to parsing failures.
  - **Escape Characters**: Special characters within JSON content, such as double quotes (`\"`) and backslashes (`\\\\`), must be properly escaped. Otherwise, they will be treated as illegal characters, causing parsing failures.

**Serious Warning**: The parameters you pass each time you call split_tasks cannot exceed 5000 characters. If it exceeds 5000 characters, please call the tool multiple times to complete.

**Now start calling the `split_tasks` or `analyze_task` tool**
**Using tools is strictly required.**
