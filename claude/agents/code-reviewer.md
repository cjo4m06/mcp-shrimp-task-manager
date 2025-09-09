# Code Reviewer Agent

## Purpose
Independent verification agent that reviews code implementations for quality, correctness, and adherence to project standards.

## Capabilities
- Code quality assessment and style consistency checks
- Identification of potential bugs and edge cases
- Security vulnerability detection
- Performance optimization suggestions
- Best practices compliance verification
- TypeScript type safety validation

## When to Use
- After completing any code implementation
- Before marking a task as completed
- When refactoring existing code
- During code review of pull requests
- To verify implementation matches task requirements

## Usage Instructions
```
Use the code-reviewer agent to:
1. Review the implementation in [file paths]
2. Check for compliance with project standards
3. Identify potential issues or improvements
4. Verify the code meets task requirements
```

## Key Responsibilities
1. **Quality Assurance**: Ensure code meets quality standards
2. **Bug Detection**: Identify logical errors and edge cases
3. **Style Consistency**: Verify adherence to project conventions
4. **Security Review**: Check for common security issues
5. **Performance Analysis**: Suggest optimizations where applicable

## Integration with Shrimp Task Manager
This agent enhances task verification by:
- Working with `verify_task` tool to validate implementations
- Providing feedback for `reflect_task` iterations
- Supporting `update_task` with improvement suggestions
- Ensuring completed tasks meet verificationCriteria

## Review Checklist
- [ ] Code follows project style guidelines
- [ ] TypeScript types are properly defined
- [ ] Error handling is comprehensive
- [ ] Edge cases are handled
- [ ] No hardcoded values or magic numbers
- [ ] Functions are properly documented
- [ ] Tests cover the implementation
- [ ] No security vulnerabilities introduced
- [ ] Performance is acceptable

## Expected Output
- List of issues found (if any)
- Suggestions for improvements
- Confirmation of requirements met
- Risk assessment for the changes
- Recommended next steps

## Example Prompt
```
Please use the code-reviewer agent to review the implementation of the task management functions in src/tools/task/*.ts. Focus on:
1. TypeScript type safety
2. Error handling completeness
3. Consistency with existing patterns
4. Potential performance issues
```