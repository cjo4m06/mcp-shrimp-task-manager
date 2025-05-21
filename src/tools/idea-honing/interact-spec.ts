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
    
    // Construct the full command string
    let fullCommand = command;
    if (specId && !command.includes(specId)) {
      // If specId is provided and not already in the command, prepend it
      const commandParts = command.split(' ');
      if (!['help'].includes(commandParts[0])) {
        fullCommand = `${commandParts[0]} ${specId} ${commandParts.slice(1).join(' ')}`;
      }
    }
    
    // Handle the user input
    const response = await handleUserInput(fullCommand);
    
    // Format the response
    let responseText = `# ${response.success ? 'Success' : 'Error'}\n\n${response.message}\n\n`;
    
    // Add data to the response if available
    if (response.data) {
      if (response.data.specification) {
        // Format specification
        const spec = response.data.specification;
        responseText += `## Specification: ${spec.title}\n\n`;
        responseText += `- **ID**: ${spec.id}\n`;
        responseText += `- **Version**: ${spec.version}\n`;
        responseText += `- **Status**: ${spec.metadata.status}\n\n`;
        
        // Add sections
        responseText += `### Sections\n\n`;
        for (const section of spec.sections) {
          responseText += `#### ${section.title}\n\n${section.content}\n\n`;
        }
      }
      
      if (response.data.workflowState) {
        // Format workflow state
        const state = response.data.workflowState;
        responseText += `## Workflow State\n\n`;
        responseText += `- **Current Phase**: ${state.currentPhase}\n`;
        responseText += `- **Completed Sections**: ${state.completedSections.length > 0 ? state.completedSections.join(', ') : 'None'}\n`;
        
        // Add pending questions
        if (state.pendingQuestions && state.pendingQuestions.length > 0) {
          responseText += `\n### Pending Questions\n\n`;
          for (const question of state.pendingQuestions) {
            responseText += `- **${question.id}**: ${question.text} (${question.answered ? 'Answered' : 'Unanswered'})\n`;
            if (question.answered && question.answer) {
              responseText += `  - Answer: ${question.answer}\n`;
            }
          }
        }
      }
      
      if (response.data.tasks) {
        // Format tasks
        const tasks = response.data.tasks;
        responseText += `## Tasks\n\n`;
        
        if (tasks.length === 0) {
          responseText += `No tasks found for this specification.\n\n`;
        } else {
          for (const task of tasks) {
            responseText += `### ${task.title}\n\n`;
            responseText += `- **ID**: ${task.id}\n`;
            responseText += `- **Status**: ${task.status}\n`;
            responseText += `- **Description**: ${task.description}\n\n`;
          }
        }
      }
      
      if (response.data.progress !== undefined) {
        // Format progress
        responseText += `## Progress\n\n`;
        responseText += `Overall progress: ${response.data.progress}%\n\n`;
        
        // Add a simple progress bar
        const progressBar = '[' + '#'.repeat(Math.floor(response.data.progress / 5)) + 
                           '.'.repeat(20 - Math.floor(response.data.progress / 5)) + ']';
        responseText += `${progressBar}\n\n`;
      }
      
      if (response.data.commands) {
        // Format commands for help
        responseText += `## Available Commands\n\n`;
        for (const cmd of response.data.commands) {
          responseText += `- \`${cmd.command}\`: ${cmd.description}\n`;
        }
      }
      
      if (response.data.description) {
        // Format command help
        responseText += `## Command: ${response.message}\n\n`;
        responseText += `${response.data.description}\n\n`;
        
        if (response.data.parameters) {
          responseText += `### Parameters\n\n`;
          for (const param of response.data.parameters) {
            responseText += `- \`${param.name}\`: ${param.description}\n`;
          }
        }
        
        if (response.data.example) {
          responseText += `\n### Example\n\n\`${response.data.example}\`\n\n`;
        }
      }
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
    // Error handling
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text" as const,
          text: `Error interacting with specification: ${errorMessage}`,
        },
      ],
    };
  }
}
