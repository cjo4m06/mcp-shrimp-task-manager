# Git Change Analysis

This analysis examines code changes to help identify which tasks may have been completed.

## Commit Information
{{commitInfo}}

## Changed Files
{{#each changedFiles}}
- {{this}}
{{/each}}

## Code Changes Summary
The diff output is available for detailed analysis.
Examine the changes to identify what functionality has been implemented or modified.

## Task Analysis
The following tasks may match the changes:

{{#each tasksToAnalyze}}
- **Task ID**: {{this.id}}
- **Name**: {{this.name}}
- **Status**: {{this.status}}
- **Description**: {{this.description}}
{{/each}}

## Recommendations
Based on the changes and tasks, consider which tasks might be completed or partially completed.
Look for clear correlations between code changes and task requirements. 