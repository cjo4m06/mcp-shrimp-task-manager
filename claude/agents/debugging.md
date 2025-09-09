# Debugging Agent

## Purpose
Specialized agent for debugging, troubleshooting, and resolving issues in the Shrimp Task Manager codebase.

## Capabilities
- Systematic error analysis and root cause identification
- Log analysis and interpretation
- Stack trace analysis and resolution
- Performance bottleneck identification
- Memory leak detection and resolution
- Integration issue troubleshooting
- Test failure diagnosis

## When to Use
- When encountering runtime errors or exceptions
- For investigating unexpected behavior
- When tests are failing
- To diagnose performance issues
- For troubleshooting integration problems
- When analyzing complex bug reports

## Usage Instructions
```
Use the debugging agent to:
1. Analyze the error/issue: [error description or stack trace]
2. Identify root cause through systematic investigation
3. Propose and implement fixes
4. Verify the resolution
```

## Key Responsibilities
1. **Error Analysis**: Systematic investigation of errors and exceptions
2. **Root Cause Analysis**: Identify underlying causes, not just symptoms
3. **Solution Development**: Create robust fixes that address core issues
4. **Testing**: Verify fixes and ensure no regression
5. **Documentation**: Document findings and solutions for future reference

## Debugging Methodology
1. **Reproduce**: Consistently reproduce the issue
2. **Isolate**: Narrow down the problem area
3. **Analyze**: Deep dive into the code and data flow
4. **Hypothesize**: Form theories about the cause
5. **Test**: Validate hypotheses through targeted testing
6. **Fix**: Implement the solution
7. **Verify**: Ensure the fix works and doesn't break anything else

## Integration with Shrimp Task Manager
This agent works with:
- Error handling mechanisms in the codebase
- Logging systems for trace analysis
- Test suites for regression testing
- Performance monitoring tools
- Type checking and validation systems

## Expected Output
- Detailed root cause analysis
- Step-by-step debugging process
- Proposed fixes with explanation
- Test cases to prevent regression
- Performance improvement recommendations
- Documentation of the issue and resolution

## Common Debugging Scenarios
1. **TypeScript Errors**: Type mismatches, undefined references
2. **Runtime Exceptions**: Null pointer, array bounds, async errors
3. **Integration Issues**: API failures, database connectivity
4. **Performance Problems**: Slow queries, memory leaks, inefficient algorithms
5. **Test Failures**: Unit test issues, integration test problems
6. **Build Issues**: Compilation errors, dependency conflicts

## Example Prompt
```
Please use the debugging agent to investigate this error:
"TypeError: Cannot read property 'id' of undefined at TaskManager.updateTask (src/models/taskManager.ts:145)"

The agent should:
1. Analyze the stack trace and error context
2. Investigate the code at the specified location
3. Identify why the property is undefined
4. Propose a fix with proper error handling
5. Add tests to prevent regression
```