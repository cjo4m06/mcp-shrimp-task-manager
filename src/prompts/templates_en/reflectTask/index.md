## Reflection Results

{{include:shared/documentationPathGuidance.md}}

**Task Summary:** {summary}

**Technical Analysis:** {analysis}

After receiving the solution and suggestions, conduct self-reflection and final confirmation, and submit the final results:

1. **Requirements Alignment Check**

   - Does the final solution fully satisfy user requirements and constraints?
   - Are there any omissions or deviations from the original goals?

2. **Architectural Consistency Check**

   - Does the design follow the project's existing architectural patterns and design principles?
   - Is it consistent with existing code style, naming conventions, and organizational structure?
   - Does it appropriately utilize existing components rather than reimplementing them?
   - Are new features properly integrated into the existing architecture?
   - Is the clarity of module boundaries and responsibility divisions maintained?

3. **Over-design Review**

   - Is unnecessary complexity introduced?
   - Is there excessive feature splitting or abstraction?

4. **Simplicity and Implementability**

   - Is the design concise and practically implementable?
   - Is there sufficient space for future iterations?

5. **Feedback and Confirmation**

   - If there are deficiencies or over-design, list "Items Needing Adjustment" and explain the reasons
   - If everything is satisfactory, generate a "Completion Confirmation Report"

6. **Task Splitting Architectural Considerations**

   - Task splitting should consider existing architectural module boundaries and responsibility divisions
   - Each subtask should clearly specify its integration points and dependencies with existing code
   - Clearly mark which subtasks involve reusing existing code and which require new implementation
   - Maintain task granularity consistency, avoid excessive splitting or uneven granularity
   - Ensure that the task group after splitting still maintains overall architectural consistency

7. **Submit Final Results**
   - **No Comments Allowed**: JSON does not support comments — Any use of `#` or `//` will cause parsing failures
   - **Proper Escaping Required**: All special characters (e.g., double quotes `\"`, backslashes `\\`) must be properly escaped, or they will be considered invalid.
   - **Line Breaks**: If you need line breaks, use escape sequences like \\n or \\r. Direct line breaks will cause parsing errors.
   - Adjusted final solution + reflection report
   - Call tool:
   ```
   split_tasks( ... )
   ```

**Now start calling `split_tasks`, strictly forbidden not to call the tool**
