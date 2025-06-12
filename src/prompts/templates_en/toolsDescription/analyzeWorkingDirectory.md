# 🔍 Working Directory Analysis Tool

## Description
A specialized tool for analyzing and resolving working directory detection issues in MCP environments. In MCP environments, `process.cwd()` may point to the MCP server's working directory rather than the user's actual project directory. This tool helps diagnose and resolve such issues.

## Main Uses
1. **Diagnose Working Directory Issues** - Check if the current working directory is correct
2. **MCP Environment Analysis** - Identify if running in an MCP environment
3. **Project Detection Verification** - Verify project identifiers (.git, package.json, etc.)
4. **Provide Solutions** - Offer specific solutions for AI assistants

## Use Cases
- When project detection fails
- When task storage paths are incorrect
- When suspecting working directory points to wrong location
- When debugging project context issues

## Output Content
- Detailed working directory analysis report
- Problem diagnosis and solution recommendations
- Environment variables and path information
- AI usage guidelines and recommended calling methods

## AI Usage Recommendations
When encountering project detection or path-related issues, prioritize using this tool for diagnosis, then adjust subsequent function calls based on the analysis results.

## Parameters
- `suggestedDir` (optional): User-suggested working directory path
- `includeFileAnalysis` (optional): Whether to include detailed file system analysis, defaults to false
