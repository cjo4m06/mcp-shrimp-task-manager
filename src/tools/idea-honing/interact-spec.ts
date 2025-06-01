/**
 * Implementation of the interact_spec command for the Idea Honing Tool
 * 
 * This file contains the command execution logic for interacting with specifications
 * through the User Interaction Handler.
 */

import { z } from "zod";
import { handleUserInput } from "./components/user-interaction-handler.js";

// Define the schema for the interact_spec command
export const interactSpecSchema = z.object({
  specId: z
    .string()
    .optional()
    .describe("Specification identifier (optional)"),
  command: z
    .string()
    .describe("Command to execute"),
});

/**
 * Main function for interacting with specifications
 * 
 * @param params - Parameters for the interact_spec command
 * @returns Response object with content for the MCP framework
 */
export async function interactSpec(params: z.infer<typeof interactSpecSchema>) {
  try {
    const { specId, command } = params;
    
    // If no specId is provided, try to find specifications or provide help
    if (!specId && !['help', 'list'].includes(command.split(' ')[0])) {
      return {
        content: [
          {
            type: "text" as const,
            text: `# Specification ID Required\n\n` +
                  `Most commands require a specification ID. Here are your options:\n\n` +
                  `## Available Commands\n\n` +
                  `- \`help\`: Get detailed command help\n` +
                  `- \`list\`: List available specifications\n\n` +
                  `## Example Usage\n\n` +
                  `If you have a specification ID (e.g., from create_spec output):\n\n` +
                  `\`\`\`\n` +
                  `interact_spec({\n` +
                  `  specId: "your-uuid-here",\n` +
                  `  command: "view"\n` +
                  `})\n` +
                  `\`\`\`\n\n` +
                  `Or create a new specification first:\n\n` +
                  `\`\`\`\n` +
                  `create_spec({\n` +
                  `  title: "Your Feature Title",\n` +
                  `  description: "Detailed description of your feature"\n` +
                  `})\n` +
                  `\`\`\``,
          },
        ],
      };
    }
    
    // Construct the full command string
    let fullCommand = command;
    if (specId && !command.includes(specId)) {
      // If specId is provided and not already in the command, prepend it
      const commandParts = command.split(' ');
      if (!['help', 'list'].includes(commandParts[0])) {
        fullCommand = `${commandParts[0]} ${specId} ${commandParts.slice(1).join(' ')}`;
      }
    }
    
    // Handle the user input
    const response = await handleUserInput(fullCommand);
    
    // Enhanced response formatting
    let responseText = `# ${response.success ? 'Success' : 'Error'}: ${response.message}\n\n`;
    
    // Add data to the response if available
    if (response.data) {
      if (response.data.specification) {
        // Enhanced specification formatting
        const spec = response.data.specification;
        responseText += `## Specification Details\n\n`;
        responseText += `- **Title**: ${spec.title}\n`;
        responseText += `- **ID**: \`${spec.id}\`\n`;
        responseText += `- **Version**: ${spec.version}\n`;
        responseText += `- **Status**: ${spec.metadata.status}\n`;
        responseText += `- **Created**: ${spec.createdAt.toISOString().split('T')[0]}\n`;
        responseText += `- **Updated**: ${spec.updatedAt.toISOString().split('T')[0]}\n`;
        responseText += `- **Authors**: ${spec.metadata?.authors?.join(', ') || 'AI Assistant'}\n\n`;
        
        // Add sections with better formatting
        if (spec.sections && spec.sections.length > 0) {
          responseText += `## Specification Content\n\n`;
          for (const section of spec.sections) {
            responseText += `### ${section.title}\n\n${section.content}\n\n`;
          }
        }
        
        // Add reference information
        responseText += `---\n\n`;
        responseText += `## Local File Integration\n\n`;
        responseText += `This specification is also available as \`dev_spec.md\` in your project directory `;
        responseText += `(if generated using create_spec).\n\n`;
        responseText += `**Next Steps:**\n`;
        responseText += `- Use \`plan_task\` to create implementation tasks\n`;
        responseText += `- Use \`interact_spec\` with \`edit\` command to modify sections\n`;
        responseText += `- Use \`interact_spec\` with \`progress\` to track implementation\n\n`;
      }
      
      if (response.data.workflowState) {
        // Enhanced workflow state formatting
        const state = response.data.workflowState;
        responseText += `## Workflow State\n\n`;
        responseText += `- **Current Phase**: ${state.currentPhase}\n`;
        responseText += `- **Completed Sections**: ${state.completedSections.length > 0 ? state.completedSections.join(', ') : 'None'}\n`;
        
        // Add pending questions with better formatting
        if (state.pendingQuestions && state.pendingQuestions.length > 0) {
          responseText += `\n### Pending Questions\n\n`;
          for (const question of state.pendingQuestions) {
            responseText += `#### ${question.id}\n`;
            responseText += `**Question**: ${question.text}\n`;
            responseText += `**Status**: ${question.answered ? '✅ Answered' : '❓ Unanswered'}\n`;
            if (question.answered && question.answer) {
              responseText += `**Answer**: ${question.answer}\n`;
            }
            responseText += `\n`;
          }
        }
      }
      
      if (response.data.tasks) {
        // Enhanced tasks formatting
        const tasks = response.data.tasks;
        responseText += `## Associated Tasks\n\n`;
        
        if (tasks.length === 0) {
          responseText += `No tasks found for this specification.\n\n`;
          responseText += `**Suggestion**: Use \`plan_task\` to create implementation tasks based on this specification.\n\n`;
        } else {
          for (const task of tasks) {
            responseText += `### ${task.title}\n\n`;
            responseText += `- **ID**: \`${task.id}\`\n`;
            responseText += `- **Status**: ${task.status}\n`;
            responseText += `- **Description**: ${task.description}\n\n`;
          }
        }
      }
      
      if (response.data.progress !== undefined) {
        // Enhanced progress formatting
        responseText += `## Implementation Progress\n\n`;
        responseText += `**Overall Progress**: ${response.data.progress}%\n\n`;
        
        // Add a visual progress bar
        const progressBar = '[' + '█'.repeat(Math.floor(response.data.progress / 5)) + 
                           '░'.repeat(20 - Math.floor(response.data.progress / 5)) + ']';
        responseText += `${progressBar} ${response.data.progress}%\n\n`;
        
        // Add status-based guidance
        if (response.data.progress < 25) {
          responseText += `**Status**: Just getting started\n`;
          responseText += `**Next Steps**: Review specification and create detailed tasks\n\n`;
        } else if (response.data.progress < 75) {
          responseText += `**Status**: In progress\n`;
          responseText += `**Next Steps**: Continue executing tasks and track progress\n\n`;
        } else if (response.data.progress < 100) {
          responseText += `**Status**: Nearing completion\n`;
          responseText += `**Next Steps**: Finalize remaining tasks and review\n\n`;
        } else {
          responseText += `**Status**: ✅ Complete\n`;
          responseText += `**Next Steps**: Review implementation and create documentation\n\n`;
        }
      }
      
      if (response.data.commands) {
        // Enhanced commands formatting
        responseText += `## Available Commands\n\n`;
        responseText += `| Command | Description |\n`;
        responseText += `|---------|-------------|\n`;
        for (const cmd of response.data.commands) {
          responseText += `| \`${cmd.command}\` | ${cmd.description} |\n`;
        }
        responseText += `\n`;
      }
      
      if (response.data.description) {
        // Enhanced command help formatting
        responseText += `## Command Help: ${response.message}\n\n`;
        responseText += `${response.data.description}\n\n`;
        
        if (response.data.parameters) {
          responseText += `### Parameters\n\n`;
          responseText += `| Parameter | Description |\n`;
          responseText += `|-----------|-------------|\n`;
          for (const param of response.data.parameters) {
            responseText += `| \`${param.name}\` | ${param.description} |\n`;
          }
          responseText += `\n`;
        }
        
        if (response.data.example) {
          responseText += `### Example Usage\n\n`;
          responseText += `\`\`\`\n${response.data.example}\n\`\`\`\n\n`;
        }
      }
    }
    
    // Add troubleshooting section for errors
    if (!response.success) {
      responseText += `## Troubleshooting\n\n`;
      responseText += `If you're having issues:\n\n`;
      responseText += `1. **Check Specification ID**: Ensure you're using the correct UUID from create_spec\n`;
      responseText += `2. **List Specifications**: Use \`interact_spec({ command: "list" })\` to see available specs\n`;
      responseText += `3. **Get Help**: Use \`interact_spec({ command: "help" })\` for detailed command information\n`;
      responseText += `4. **Create New Spec**: Use \`create_spec()\` to generate a new specification\n\n`;
    }
    
    return {
      content: [
        {
          type: "text" as const,
          text: responseText,
        },
      ],
    };
  } catch (error) {
    // Enhanced error handling
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text" as const,
          text: `# Error: Specification Interaction Failed\n\n` +
                `**Error Details**: ${errorMessage}\n\n` +
                `## Common Solutions\n\n` +
                `1. **Invalid Specification ID**: Ensure you're using a valid UUID from create_spec\n` +
                `2. **Command Format**: Check your command syntax (e.g., "view", "edit section content")\n` +
                `3. **Missing Specification**: Create a specification first using create_spec\n\n` +
                `## Get Help\n\n` +
                `Use \`interact_spec({ command: "help" })\` for detailed command information.\n\n` +
                `## Create New Specification\n\n` +
                `\`\`\`\n` +
                `create_spec({\n` +
                `  title: "Your Feature Title",\n` +
                `  description: "Detailed description of your feature"\n` +
                `})\n` +
                `\`\`\``,
        },
      ],
    };
  }
}
