# Claude Subagents for Shrimp Task Manager

This directory contains specialized subagents designed to enhance the Shrimp Task Manager project following Anthropic's best practices for agent-based development.

## Philosophy

Based on Anthropic's best practices, these agents are designed to:
- **Preserve context** by delegating specific verification and analysis tasks
- **Add verification layers** to ensure implementation quality
- **Enable multiple perspectives** on code and task completion
- **Prevent overfitting** by having independent agents verify implementations

## Available Agents

### 🔍 Task Analyzer (`task-analyzer.md`)
Decomposes complex tasks into manageable subtasks while maintaining context and dependencies.
- **Use when**: Starting new features, dealing with complex requirements
- **Integrates with**: `analyze_task`, `split_tasks`, `plan_task` tools

### 👁️ Code Reviewer (`code-reviewer.md`)
Independent verification of code implementations for quality and correctness.
- **Use when**: After implementing code, before marking tasks complete
- **Integrates with**: `verify_task`, `reflect_task` tools

### ✅ Test Validator (`test-validator.md`)
Ensures comprehensive test coverage and prevents overfitting to test cases.
- **Use when**: After writing tests, verifying coverage
- **Key feature**: Detects when code is overfitting to specific tests

### 🔗 Dependency Resolver (`dependency-resolver.md`)
Manages task dependencies and optimizes execution order.
- **Use when**: Planning multi-task projects, resolving blockers
- **Integrates with**: Task dependency system, blocking status

### 🎯 Implementation Verifier (`implementation-verifier.md`)
End-to-end verification that implementations meet all requirements.
- **Use when**: Final validation before task completion
- **Integrates with**: verificationCriteria, acceptance testing

### 🔌 MCP Integration (`mcp-integration.md`)
Specialized for MCP server development and tool creation.
- **Use when**: Creating MCP tools, debugging integrations
- **Integrates with**: MCP SDK, tool schemas, Claude clients

## Usage Patterns

### Sequential Verification
```
1. task-analyzer → break down the problem
2. (implement code)
3. code-reviewer → review implementation
4. test-validator → verify test coverage
5. implementation-verifier → final validation
```

### Parallel Analysis
```
Launch multiple agents concurrently:
- code-reviewer: check code quality
- test-validator: verify test coverage
- dependency-resolver: check for conflicts
```

### Iterative Improvement
```
1. code-reviewer → identify issues
2. (fix issues)
3. test-validator → ensure tests still pass
4. implementation-verifier → confirm requirements met
```

## Best Practices

1. **Use agents early** in the development process for complex tasks
2. **Leverage multiple perspectives** by using different agents for verification
3. **Prevent overfitting** by having test-validator check implementations
4. **Maintain independence** between implementation and verification agents
5. **Batch agent calls** when possible for efficiency

## Integration with Shrimp Task Manager

These agents are specifically designed to work with:
- Task status management (PENDING, IN_PROGRESS, COMPLETED, BLOCKED)
- Task complexity assessment (LOW, MEDIUM, HIGH, VERY_HIGH)
- Verification criteria and implementation guides
- The chain-of-thought and reflection system
- MCP tool development and integration

## Example Workflow

```bash
# Complex feature request arrives
Use task-analyzer to break it down into subtasks

# For each subtask
Use dependency-resolver to determine order

# After implementation
Use code-reviewer for quality check
Use test-validator to verify coverage

# Before marking complete
Use implementation-verifier for final validation

# For MCP-specific work
Use mcp-integration for protocol compliance
```

## Adding New Agents

When creating new agents, follow this template:
1. Clear purpose statement
2. Specific capabilities
3. When to use guidelines
4. Integration points with existing tools
5. Expected outputs
6. Example prompts

Each agent should be:
- **Focused**: Single responsibility principle
- **Independent**: Can work without other agents
- **Verifiable**: Clear success criteria
- **Integrated**: Works with existing Shrimp tools