# Task History

{{#if entries.length}}
Found {{entries.length}} history entries:

{{#each entries}}
## {{operation}} - {{timestamp}}
**Task ID**: {{taskId}}
{{#if details}}
**Details**: {{details}}
{{/if}}
**User**: {{user}}

{{/each}}
{{else}}
No history entries found for the specified criteria.
{{/if}}