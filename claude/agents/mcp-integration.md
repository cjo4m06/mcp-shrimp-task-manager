# MCP Integration Agent

## Purpose
Specialized agent for MCP (Model Context Protocol) server development, tool creation, and integration with Claude and other AI systems.

## Capabilities
- MCP tool development and validation
- Protocol compliance verification
- Tool schema generation and validation
- MCP server configuration
- Integration testing with Claude clients
- Prompt template optimization

## When to Use
- When creating new MCP tools
- Validating MCP server implementations
- Debugging MCP communication issues
- Optimizing tool descriptions and schemas
- Integrating with Claude or other MCP clients

## Usage Instructions
```
Use the mcp-integration agent to:
1. Validate MCP tool implementation in [file]
2. Check protocol compliance
3. Generate proper tool schemas
4. Test integration with Claude
```

## Key Responsibilities
1. **Tool Development**: Create and validate MCP tools
2. **Schema Validation**: Ensure proper JSON schemas
3. **Protocol Compliance**: Verify MCP specification adherence
4. **Integration Testing**: Test with MCP clients
5. **Prompt Optimization**: Improve tool descriptions

## Integration with Shrimp Task Manager
This agent understands:
- MCP SDK usage (@modelcontextprotocol/sdk)
- Tool registration and handlers
- Zod schema definitions
- Prompt template system (templates_en/templates_zh)
- Server configuration in .mcp.json

## MCP-Specific Areas

### Tool Implementation
- Handler function signatures
- Input/output validation
- Error handling patterns
- Async operation management

### Schema Definition
- Zod to JSON schema conversion
- Required vs optional fields
- Type definitions
- Validation rules

### Server Configuration
- Environment variables (DATA_DIR, TEMPLATES_USE)
- Server startup and shutdown
- Tool registration
- Resource management

### Client Integration
- Tool descriptions for AI understanding
- Prompt template effectiveness
- Response formatting
- Error message clarity

## Expected Output
- Validation results
- Schema compliance report
- Integration test results
- Optimization suggestions
- Configuration recommendations

## Common Issues to Check
- Missing or incorrect tool schemas
- Improper error handling
- Incomplete tool descriptions
- Protocol version mismatches
- Resource leaks
- Incorrect async handling

## Example Prompt
```
Please use the mcp-integration agent to:
1. Review the new MCP tool implementation in src/tools/
2. Validate the Zod schemas and JSON schema conversion
3. Check that tool descriptions are clear for AI agents
4. Verify proper error handling and protocol compliance
5. Test integration with the MCP server
```