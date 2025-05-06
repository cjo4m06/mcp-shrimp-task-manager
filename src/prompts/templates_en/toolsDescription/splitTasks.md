Break down complex tasks into independent subtasks, establishing dependencies and priorities.

## 1. **Granularity Control (Required Reading)**

- ### **Minimum Viable Task**

  Each subtask should be completable and verifiable by a single developer within **1–2 working days** (approximately 8–16 hours).

- ### **Maximum Complexity Limitation**

  A single subtask should not span multiple technical domains such as **frontend**, **backend**, and **database**.  
  If cross-domain work is required, split it into multiple subtasks.

- ### **Recommended Number of Tasks**

  Avoid splitting into more than **10 subtasks** at once.  
  If more are needed, submit them in prioritized batches (6–8 tasks per batch).

- ### **Recommended Task Length**

  Each split should not exceed **5,000 characters**.  
  If it does, divide and submit in multiple batches.

- ### **Depth Limitation**
  The task tree should not exceed **3 levels**:
  - **Level 1**: Functional Modules
  - **Level 2**: Main Processes
  - **Level 3**: Key Steps

## 2. **Task Splitting Example**

- Identify **core functionality points**, and create a subtask for each.
- Annotate each subtask with:
  - **Input/Output**
  - **Acceptance Criteria**
- If needed, provide **pseudocode**:
  - Only outline high-level logic and key steps.
  - Avoid providing complete source code.
- Check **dependencies** between subtasks and specify them in the `dependencies` field.

## 3. **Dependencies and Prioritization**

- Mark each subtask with its `dependencies` list.
- Automatically compute and enforce execution order based on the dependency graph to prioritize the **critical path**.

## 4. **Update Mode Explanation (`updateMode`)**

When you need to create a new task that is not related to the current task list, be sure to use `clearAllTasks` to avoid task confusion.

- `append`: Keep existing unfinished tasks and add new ones.
- `overwrite`: Delete all unfinished tasks, keep completed ones.
- `selective`: Smart-match and update tasks by name.
- `clearAllTasks`: Clear all tasks and automatically back up the current list.

---

## 5. **Strict JSON Rules**

- ### **No Comments Allowed**

  JSON does not support comments.  
  Any use of `#` or `//` will cause parsing failures.

- ### **Proper Escaping Required**
  All special characters (e.g., double quotes `\"`, backslashes `\\`) must be properly escaped,  
  or they will be considered invalid.
