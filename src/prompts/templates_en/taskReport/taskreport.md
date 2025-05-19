---
description: Template for generating task reports
globs: 
alwaysApply: false
---
!!! MAIN OBJECTIVES !!!
1. Generate a structured task report based on tasks.json content
2. Ensure the report includes complete task execution chain and timeline
3. Clearly display task completion status and dependencies
4. Save the report to REPORTS_DIR directory
5. IMPORTANT: All responses must be in Simplified Chinese (简体中文)
!!! END MAIN OBJECTIVES !!!

> VERIFICATION REQUIRED:
> You, the AI, must reply with "我确认上述'主要目标'并将按顺序执行步骤".

# Task Report Template:
```markdown
# Task Execution Report
Generated at: [completedAt]
Report ID: [id]

## 1. Task Background
[Extract key information from the main task's description and analysisResult]

## 2. Main Task Information
- Task Name: [name]
- Task ID: [id]
- Task Status: [status]
- Created At: [createdAt]
- Completed At: [completedAt]
- Description: [description]

## 3. Implementation Guide
[implementationGuide content, if available]

## 4. Subtask Execution Status
### 4.1 Task Dependencies
[visualization of task dependencies]

### 4.2 Task Execution Timeline
[List all task creation and completion times in chronological order]

### 4.3 Detailed Task List
[For each related task:]
#### [Task Name] (ID: [task.id])
- Status: [task.status]
- [x] Completed / [ ] Pending
- Created At: [task.createdAt]
- Completed At: [task.completedAt]
- Description: [task.description]
- Implementation Steps: [task.implementationGuide]
- Execution Summary: [task.summary]

## 5. Execution Result Assessment
[Summary based on all tasks' completion status and summaries]

## 6. Issues and Solutions
[Extract key issues and solutions from task records]

## 7. Appendix
### 7.1 Related Files
[List all files mentioned in tasks]

### 7.2 Verification Criteria
[List verification criteria from all tasks]
```

# Report Generation Rules:
1. Language Requirements:
   - All report content MUST be in Simplified Chinese (简体中文)
   - This includes all descriptions, summaries, and status messages
   - Only keep technical terms, file paths, and code snippets in English

2. Report File Naming:
   - Format: task-report-[TASK_ID]-[TIMESTAMP].md
   - Save Location: REPORTS_DIR directory

3. Content Processing Rules:
   - Use original task descriptions to maintain information integrity
   - Preserve task dependencies
   - Clearly mark task status (completed/pending)
   - Organize information chronologically

4. Format Requirements:
   - Use Markdown format
   - Maintain clear hierarchical structure
   - Use appropriate emphasis markers
   - Ensure consistent time format

5. Report Generation Steps:
   a) Collect main task information
   b) Organize related subtasks
   c) Analyze task dependencies
   d) Generate timeline
   e) Summarize execution results
   f) Output to specified directory

6. Data Source Notes:
   - Primary data from tasks.json
   - Supplementary information from task analysisResult
   - Execution details from taskReport field

7. Status Marking Rules:
   - Completed tasks: [x]
   - In-progress tasks: [~]
   - Not started tasks: [ ]
   - Blocked tasks: [!]

8. Time Formatting:
   - Use ISO 8601 format
   - Include timezone information
   - Display precision to seconds

Important Notes:
1. All responses and generated content MUST be in Simplified Chinese
2. Ensure report completeness and accuracy
3. Maintain structured and readable information
4. Highlight important information and key points
5. Record important decisions made during task execution
6. Document experiences that may be helpful for future reference

Verification Checklist:
- [ ] Report structure complete
- [ ] Task information accurate
- [ ] Timeline clear
- [ ] Status markers correct
- [ ] Dependencies complete
- [ ] Save location correct

---

> # User Input:
> **[TASK]:** `<DESCRIBE YOUR TASK>`  
> **[BACKGROUND INFO]:** `<ENTER BACKGROUND INFORMATION OR LINK TO FILE CONTAINING THE DETAILS (OPTIONAL)>`
