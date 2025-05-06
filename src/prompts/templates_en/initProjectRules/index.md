Please use the "process_thought" tool to consider the following issues

# Project Standards Initialization Guide

## Purpose

**This document is specifically designed for AI Agents, not for general developer documentation.**
**Must generate a project standards document (rules.md) exclusively for AI Agent operational use.**

**Must focus on the following key objectives:**

- Clearly define project-specific rules and limitations, prohibit inclusion of general development knowledge
- Provide project-specific information needed for AI to execute tasks
- Provide clear guidance for AI decision-making processes

**Mandatory requirements:**

- Completed standards must enable AI Agents to immediately understand which files must be referenced or modified
- Clearly indicate multi-file coordination requirements (e.g., when modifying README.md, /docs/zh/README.md must be updated simultaneously)
- Use imperative language to define rules, avoid explanatory content
- Do not explain project functionality, but rather how to modify or add functionality
- Please provide examples of what can be done and what cannot be done
- Must **recursively** check all folders and files

**Strictly prohibited:**

- Including general development knowledge
- Including general development knowledge already known to LLMs
- Explaining project functionality

## Suggested Structure

Please use the following structure to create the standards document:

```markdown
# Development Guidelines

## Title

### Subtitle

- Rule one
- Rule two
```

## Content Guidelines

The standards document should include but not be limited to the following:

1. **Project Overview** - Brief description of the project's purpose, technology stack, and core functionality
2. **Project Architecture** - Description of main directory structure and module divisions
3. **Code Standards** - Including naming conventions, formatting requirements, comment rules, etc.
4. **Functionality Implementation Standards** - Mainly explaining how to implement functionality and points to note
5. **Framework/Plugin/Third-party Library Usage Standards** - Usage standards for external dependencies
6. **Workflow Standards** - Workflow guidelines, including workflow diagrams or data flow
7. **Key File Interaction Standards** - Interaction standards for key files, which files need to be modified simultaneously
8. **AI Decision-making Standards** - Provide decision trees and priority judgment criteria for handling ambiguous situations
9. **Prohibited Actions** - Clearly list practices that are prohibited

## Notes

1. **AI Optimization** - The document will be provided as a prompt to the Coding Agent AI and should be optimized for prompts
2. **Focus on Development Guidance** - Provide rules for ongoing development, not usage tutorials
3. **Specific Examples** - Provide specific examples of "what should be done" and "what should not be done" whenever possible
4. **Use Imperative Language** - Must use direct instructions rather than descriptive language, reduce explanatory content
5. **Structured Presentation** - All content must be presented in structured formats such as lists, tables, etc., for easy AI parsing
6. **Highlight Key Markings** - Use bold, warning markers, etc. to highlight key rules and taboos
7. **Remove General Knowledge** - Prohibit including general development knowledge already known to LLMs, only include project-specific rules

## Update Mode Guidelines

1. **Minimal Changes** - When users request updates to project rules, you should maintain existing rules unless necessary, with the principle of minimal changes
2. **Timeliness** - You should check if existing rules are still beneficial or outdated, as users may have modified or removed relevant code, you must correct or remove corresponding rules
3. **Completeness** - You should check all folders and file contents in the existing project, as users may have added or modified relevant code, you must supplement corresponding rules
4. **Autonomous Handling of Ambiguous Requests**: When receiving ambiguous instructions such as "update rules" without specifying concrete content, the AI **must** first attempt to independently analyze the current codebase, recent changes (if available), and existing `rules.md` content to infer possible update points. List these inferred points and their rationale during the `process_thought` phase, then propose specific modification suggestions. **Strictly prohibited** from seeking clarification from users on ambiguous update requests before performing this autonomous analysis.

Based on the above guidelines, create a file named rules.md and store it at: {rulesPath}

**[AI Agent Action]** Now start calling the "process_thought" tool to think about how to write standards document that guides the Coding Agent
**[AI Agent Action]** After completing the thought process, immediately edit the rules.md file, prohibited from calling the "analyze_task" tool
**[AI Agent Action]** Strictly forbidden not to call tools. The AI must independently complete the entire process from receiving instructions to implementing modifications, and should not interrupt the process to seek user input unless encountering technical errors or unresolvable dependency conflicts.
