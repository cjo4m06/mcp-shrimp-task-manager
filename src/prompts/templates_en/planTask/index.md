## Task Analysis

{{include:shared/projectContextCheck.md}}
{{include:shared/mcpToolsTrigger.md}}
{{include:shared/teamCollaborationTrigger.md}}

You must complete the following sub-steps in sequence, and at the end call the `analyze_task` tool to pass the preliminary design solution to the next stage.

1. **Analysis Purpose**

   - Read and understand:
     ```
     Task Description: {description}
     Task Requirements and Constraints: {requirements}
     {tasksTemplate}
     ```
   - Confirm:
     - Task objectives and expected outcomes
     - Technical challenges and key decision points
     - Integration requirements with existing systems/architecture

2. **Identify Project Architecture**

   - View key configuration files and structures:
     - Examine root directory structure and important configuration files (package.json, tsconfig.json, etc.)
     - If shrimp-rules.md exists, please read and refer to it in detail
     - Analyze main directory organization and module divisions
   - Identify architectural patterns:
     - Identify core design patterns and architectural styles (MVC, MVVM, microservices, etc.)
     - Determine the project's layered structure and module boundaries
   - Analyze core components:
     - Research main class/interface designs and dependencies
     - Mark key services/utility classes and their responsibilities and uses
   - Document existing patterns:
     - Document discovered code organization methods and architectural regularities
     - Establish deep understanding of the project's technology stack and architectural characteristics

3. **Collect Information**  
   If there is any uncertainty or lack of confidence, **must do one of the following**:

   - Ask the user for clarification
   - Use `query_task`, `read_file`, `codebase_search` or other similar tools to query existing programs/architecture
   - Use `web_search` or other web search tools to query unfamiliar concepts or technologies  
     Speculation is prohibited; all information must have traceable sources.

4. **Check Existing Programs and Structures**

   - Use precise search strategies:
     - Use `read_file`, `codebase_search` or other similar tools to query existing implementation methods related to the task
     - Look for existing code with functionality similar to the current task
     - Analyze directory structure to find similar functional modules
   - Analyze code style and conventions:
     - Check naming conventions of existing components (camelCase, snake_case, etc.)
     - Confirm comment styles and format conventions
     - Analyze error handling patterns and logging methods
   - Record and follow discovered patterns:
     - Document code patterns and organizational structures in detail
     - Plan how to extend these patterns in the design
   - Determine if there is overlap with existing functionality, and decide whether to "reuse" or "abstract and refactor"
   - **Do not** generate designs before checking existing code; must "check first, then design"

5. **Task Type-Specific Guidelines**

   Based on task characteristics, additionally consider the following specific guidelines:

   - **Frontend/UI Tasks**:

     - Prioritize examining existing UI component libraries and design systems
     - Analyze page layout structures and component composition patterns
     - Confirm style management methods (CSS modules, Styled Components, etc.)
     - Understand state management and data flow patterns

   - **Backend API Tasks**:

     - Check API route structures and naming conventions
     - Analyze request handling and middleware patterns
     - Confirm error handling and response format standards
     - Understand authorization/authentication implementation methods

   - **Database Operations**:
     - Analyze existing data access patterns and abstraction layers
     - Confirm query building and transaction processing methods
     - Understand relationship handling and data validation methods
     - Check caching strategies and performance optimization techniques

6. **Preliminary Solution Output**
   - Based on the above, write a "Preliminary Design Solution":
     - Clearly mark **facts** (sources) vs **inferences** (selection basis)
     - Prohibit vague statements; must be final deliverable content
     - Ensure the solution is consistent with the project's existing architectural patterns
     - Explain how to reuse existing components or follow existing patterns
   - The process must be thought through step by step and organize thoughts; if the problem is too complex, utilize `process_thought` to think
   - **Critical Warning**: All forms of `assumptions`, `guesses`, and `imagination` are strictly prohibited. You must use every `available tool` at your disposal to `gather real information`.
   - Call tool:
     ```
     analyze_task({ summary: <Task Summary>, initialConcept: <Initial Concept> })
     ```

**Now start calling `analyze_task`, strictly forbidden not to call the tool**
