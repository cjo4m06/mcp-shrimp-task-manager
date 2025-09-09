# Test Validator Agent

## Purpose
Specialized agent for ensuring test coverage, validating test implementations, and verifying that implementations aren't overfitting to specific test cases.

## Capabilities
- Test coverage analysis and gap identification
- Test quality assessment
- Edge case generation
- Test-implementation alignment verification
- Prevention of test overfitting
- Test suite completeness validation

## When to Use
- After writing new tests for a feature
- When verifying existing test coverage
- Before marking implementation as complete
- To ensure tests actually validate requirements
- When suspicious that code might be overfitting to tests

## Usage Instructions
```
Use the test-validator agent to:
1. Verify test coverage for [feature/file]
2. Check that tests validate actual requirements
3. Ensure no overfitting to specific test cases
4. Identify missing test scenarios
```

## Key Responsibilities
1. **Coverage Verification**: Ensure adequate test coverage
2. **Test Quality**: Validate that tests are meaningful and comprehensive
3. **Edge Case Detection**: Identify untested scenarios
4. **Overfitting Prevention**: Ensure implementation is general, not test-specific
5. **Requirements Alignment**: Verify tests match task requirements

## Integration with Shrimp Task Manager
This agent supports task verification by:
- Validating verificationCriteria defined in tasks
- Working with `verify_task` to ensure proper testing
- Supporting iterative improvement through `reflect_task`
- Ensuring task completion meets quality standards

## Validation Checklist
- [ ] All main code paths are tested
- [ ] Edge cases are covered
- [ ] Error conditions are tested
- [ ] Tests are independent and isolated
- [ ] Test descriptions are clear and accurate
- [ ] No hardcoded test data that limits validity
- [ ] Tests actually fail when code is broken
- [ ] Performance boundaries are tested (if applicable)
- [ ] Integration points are tested

## Anti-Patterns to Detect
- Tests that always pass regardless of implementation
- Overly specific tests that don't generalize
- Missing negative test cases
- Insufficient edge case coverage
- Tests that depend on execution order
- Flaky or non-deterministic tests

## Expected Output
- Test coverage report
- List of missing test scenarios
- Quality assessment of existing tests
- Recommendations for improvement
- Risk assessment of current coverage

## Example Prompt
```
Please use the test-validator agent to:
1. Review the test suite in src/tools/task/*.test.ts
2. Verify it adequately tests the task management functions
3. Check that the implementation isn't overfitting to these specific tests
4. Identify any missing test scenarios or edge cases
```