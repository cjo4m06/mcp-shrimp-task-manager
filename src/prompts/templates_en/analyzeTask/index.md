## Codebase Analysis

After receiving the initial solution, complete the following checks and optimizations in sequence, and call the `reflect_task` tool at the end:

1. **Structural Integrity Check**

   - Does it cover all requirements and constraints?
   - Are module boundaries and interface definitions clear?
   - Is the dependency graph reasonable and maintainable?
   - Does the design conform to the project's core architectural patterns?
   - Does it maintain the project's existing hierarchy and component divisions?

2. **Duplicate Functionality Detection and Sharing Assessment**

   - Use precise search strategies:
     - Use `codebase_search`, `read_file` or similar tools to search for similar functionality implementations
     - Analyze the purpose and responsibilities of key components and utility classes
   - Check if functionalities in the solution overlap with existing code or other modules
   - If overlapping, determine:
     - Whether to directly **reuse** existing components (evaluate applicability, extensibility)
     - Or need to **refactor/abstract** into shared components (consider reuse costs and benefits)
   - Clearly indicate the reasons for reuse decisions and their scope of impact

3. **Performance and Scalability Assessment**

   - Are there potential performance bottlenecks?
   - How scalable is the design for future requirements?
   - Have resource usage and system load been considered?
   - Does the expansion strategy conform to existing project patterns?

4. **Consistency and Style Validation**

   - Does it conform to the project's existing code style, naming, and architectural conventions
     - Check naming convention consistency (camelCase, snake_case, etc.)
     - Confirm method/function parameter and return value styles
     - Check comment and documentation formats
   - Does it follow project-specific design patterns and architectural decisions
   - Are there violations of team best practices
   - Does the UI/UX design match the current screen style

5. **Architectural Integration Assessment**

   - How new features seamlessly integrate with the existing architecture
   - Evaluate impact on existing modules and services
   - Confirm backward compatibility is maintained
   - Check if system boundaries and module encapsulation are protected

6. **Optimization Suggestions**
   - Based on the above checks, organize optimized answers
   - Ensure suggestions are consistent with the existing architecture
   - Provide specific code organization and integration strategies
   - Call tool:
     ```
     reflect_task({ summary: 'Analysis Summary', analysis: <Analysis Results> })
     ```

**Now call `reflect_task`, strictly forbidden not to call the tool**
