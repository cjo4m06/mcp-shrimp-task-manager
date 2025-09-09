# Implementation Verifier Agent

## Purpose
End-to-end verification agent that ensures implementations fully satisfy task requirements and work correctly in the complete system context.

## Capabilities
- Requirements-to-implementation traceability
- Integration testing verification
- End-to-end workflow validation
- Acceptance criteria checking
- Regression detection
- Cross-component compatibility verification

## When to Use
- Before marking any task as complete
- After implementing complex features
- When integrating multiple components
- To verify fixes actually solve reported issues
- During final validation of task chains

## Usage Instructions
```
Use the implementation-verifier agent to:
1. Verify that [implementation] meets all requirements
2. Check integration with existing system
3. Validate end-to-end functionality
4. Ensure no regressions introduced
```

## Key Responsibilities
1. **Requirements Validation**: Ensure all requirements are met
2. **Integration Testing**: Verify component interactions
3. **E2E Validation**: Check complete workflows
4. **Regression Prevention**: Ensure nothing is broken
5. **Acceptance Verification**: Validate against criteria

## Integration with Shrimp Task Manager
This agent leverages:
- verificationCriteria field from tasks
- implementationGuide for validation points
- Task completion summaries
- Related files for scope verification
- Chain of thought from analysis phases

## Verification Process

### Pre-Implementation Check
- Review original task requirements
- Check analysisResult for technical specifications
- Verify implementationGuide was followed

### Implementation Validation
- Code matches requirements
- All acceptance criteria met
- Edge cases handled properly
- Error conditions managed

### Integration Verification
- Works with existing components
- No breaking changes introduced
- Performance acceptable
- Security maintained

### Post-Implementation
- Documentation updated if needed
- Tests pass and are comprehensive
- No regressions in related areas
- Task summary accurate

## Expected Output
- Verification status (PASS/FAIL)
- Requirements coverage report
- List of any gaps or issues
- Integration test results
- Recommendations for completion

## Verification Checklist
- [ ] All task requirements implemented
- [ ] Verification criteria satisfied
- [ ] Integration points tested
- [ ] No regressions introduced
- [ ] Edge cases handled
- [ ] Error handling complete
- [ ] Performance acceptable
- [ ] Security considerations met
- [ ] Documentation current
- [ ] Tests comprehensive

## Example Prompt
```
Please use the implementation-verifier agent to:
1. Verify the task management feature implementation
2. Check it meets all requirements from the original task
3. Validate integration with existing MCP server
4. Ensure no regressions in core functionality
5. Confirm all verification criteria are satisfied
```