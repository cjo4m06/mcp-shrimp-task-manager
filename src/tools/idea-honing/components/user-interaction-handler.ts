/**
 * User Interaction Handler for the Idea Honing Tool
 *
 * This component manages user interactions with the Idea Honing Tool,
 * including command parsing, input handling, and response formatting.
 */

import { SpecificationDocument } from '../models/specification.js';
import { WorkflowState, Question } from '../models/workflow-state.js';
import { CodebaseAnalysisResult } from '../models/analysis-result.js';
import {
  getSpecification,
  updateSpecification
} from './specification-manager.js';
import {
  loadWorkflowState,
  updateWorkflowPhase,
  markSectionCompleted,
  addQuestion,
  answerQuestion,
  createSession,
  endSession,
  calculateOverallProgress
} from './workflow-state-manager.js';
import {
  getTasksForSpecification,
  createTaskFromSpecification
} from './task-memory-connector.js';
import {
  analyzeRepository
} from './codebase-analyzer.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Command types supported by the User Interaction Handler
 */
export enum CommandType {
  VIEW_SPEC = 'view_spec',
  EDIT_SECTION = 'edit_section',
  MARK_COMPLETE = 'mark_complete',
  ADD_QUESTION = 'add_question',
  ANSWER_QUESTION = 'answer_question',
  CHANGE_PHASE = 'change_phase',
  VIEW_TASKS = 'view_tasks',
  VIEW_PROGRESS = 'view_progress',
  HELP = 'help',
  SUGGEST = 'suggest',
  ANALYZE = 'analyze',
  WORKFLOW = 'workflow',
  EXPORT = 'export'
}

/**
 * Command structure
 */
export interface Command {
  /** Command type */
  type: CommandType;

  /** Command parameters */
  params: Record<string, any>;
}

/**
 * Response structure
 */
export interface Response {
  /** Response success status */
  success: boolean;

  /** Response message */
  message: string;

  /** Response data */
  data?: any;
}

/**
 * Parses a command string into a Command object
 *
 * @param commandStr - Command string to parse
 * @returns Parsed command or null if invalid
 */
export function parseCommand(commandStr: string): Command | null {
  try {
    // Trim the command string
    const trimmedCommand = commandStr.trim();

    // Check if the command is empty
    if (!trimmedCommand) {
      return null;
    }

    // Split the command into parts
    const parts = trimmedCommand.split(' ');

    // Get the command type
    const commandTypeStr = parts[0].toLowerCase();

    // Map the command type string to a CommandType
    let commandType: CommandType;
    switch (commandTypeStr) {
      case 'view':
        commandType = CommandType.VIEW_SPEC;
        break;
      case 'edit':
        commandType = CommandType.EDIT_SECTION;
        break;
      case 'complete':
        commandType = CommandType.MARK_COMPLETE;
        break;
      case 'question':
        commandType = CommandType.ADD_QUESTION;
        break;
      case 'answer':
        commandType = CommandType.ANSWER_QUESTION;
        break;
      case 'phase':
        commandType = CommandType.CHANGE_PHASE;
        break;
      case 'tasks':
        commandType = CommandType.VIEW_TASKS;
        break;
      case 'progress':
        commandType = CommandType.VIEW_PROGRESS;
        break;
      case 'help':
        commandType = CommandType.HELP;
        break;
      case 'suggest':
        commandType = CommandType.SUGGEST;
        break;
      case 'analyze':
        commandType = CommandType.ANALYZE;
        break;
      case 'workflow':
        commandType = CommandType.WORKFLOW;
        break;
      case 'export':
        commandType = CommandType.EXPORT;
        break;
      default:
        return null;
    }

    // Parse the command parameters
    const params: Record<string, any> = {};

    // Different parameter parsing based on command type
    switch (commandType) {
      case CommandType.VIEW_SPEC:
        // view <specId>
        if (parts.length > 1) {
          params.specId = parts[1];
        }
        break;

      case CommandType.EDIT_SECTION:
        // edit <specId> <sectionId> <content>
        if (parts.length > 3) {
          params.specId = parts[1];
          params.sectionId = parts[2];
          params.content = parts.slice(3).join(' ');
        }
        break;

      case CommandType.MARK_COMPLETE:
        // complete <specId> <sectionId>
        if (parts.length > 2) {
          params.specId = parts[1];
          params.sectionId = parts[2];
        }
        break;

      case CommandType.ADD_QUESTION:
        // question <specId> <targetSection> <text>
        if (parts.length > 3) {
          params.specId = parts[1];
          params.targetSection = parts[2];
          params.text = parts.slice(3).join(' ');
        }
        break;

      case CommandType.ANSWER_QUESTION:
        // answer <specId> <questionId> <answer>
        if (parts.length > 3) {
          params.specId = parts[1];
          params.questionId = parts[2];
          params.answer = parts.slice(3).join(' ');
        }
        break;

      case CommandType.CHANGE_PHASE:
        // phase <specId> <phase>
        if (parts.length > 2) {
          params.specId = parts[1];
          params.phase = parts[2];
        }
        break;

      case CommandType.VIEW_TASKS:
        // tasks <specId>
        if (parts.length > 1) {
          params.specId = parts[1];
        }
        break;

      case CommandType.VIEW_PROGRESS:
        // progress <specId>
        if (parts.length > 1) {
          params.specId = parts[1];
        }
        break;

      case CommandType.HELP:
        // help [command]
        if (parts.length > 1) {
          params.command = parts[1];
        }
        break;

      case CommandType.SUGGEST:
        // suggest <specId> [section|task|question]
        if (parts.length > 1) {
          params.specId = parts[1];
          if (parts.length > 2) {
            params.type = parts[2];
          } else {
            params.type = 'all'; // Default to all suggestions
          }
        }
        break;

      case CommandType.ANALYZE:
        // analyze <specId> [scope]
        if (parts.length > 1) {
          params.specId = parts[1];
          if (parts.length > 2) {
            params.scope = parts[2];
          }
        }
        break;

      case CommandType.WORKFLOW:
        // workflow <specId> [start|resume|pause|complete]
        if (parts.length > 1) {
          params.specId = parts[1];
          if (parts.length > 2) {
            params.action = parts[2];
          } else {
            params.action = 'status'; // Default to showing workflow status
          }
        }
        break;

      case CommandType.EXPORT:
        // export <specId> [format]
        if (parts.length > 1) {
          params.specId = parts[1];
          if (parts.length > 2) {
            params.format = parts[2];
          } else {
            params.format = 'markdown'; // Default to markdown format
          }
        }
        break;
    }

    return {
      type: commandType,
      params
    };
  } catch (error) {
    console.error(`Error parsing command: ${error}`);
    return null;
  }
}

/**
 * Executes a command
 *
 * @param command - Command to execute
 * @returns Promise that resolves with the command response
 */
export async function executeCommand(command: Command): Promise<Response> {
  try {
    switch (command.type) {
      case CommandType.VIEW_SPEC:
        return await viewSpecification(command.params);

      case CommandType.EDIT_SECTION:
        return await editSection(command.params);

      case CommandType.MARK_COMPLETE:
        return await markSectionComplete(command.params);

      case CommandType.ADD_QUESTION:
        return await addNewQuestion(command.params);

      case CommandType.ANSWER_QUESTION:
        return await answerExistingQuestion(command.params);

      case CommandType.CHANGE_PHASE:
        return await changeWorkflowPhase(command.params);

      case CommandType.VIEW_TASKS:
        return await viewTasks(command.params);

      case CommandType.VIEW_PROGRESS:
        return await viewProgress(command.params);

      case CommandType.HELP:
        return getHelp(command.params);

      case CommandType.SUGGEST:
        return await generateSuggestions(command.params);

      case CommandType.ANALYZE:
        return await analyzeSpecification(command.params);

      case CommandType.WORKFLOW:
        return await manageWorkflow(command.params);

      case CommandType.EXPORT:
        return await exportSpecification(command.params);

      default:
        return {
          success: false,
          message: 'Unknown command type'
        };
    }
  } catch (error) {
    return {
      success: false,
      message: `Error executing command: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Handles user input
 *
 * @param input - User input string
 * @returns Promise that resolves with the response
 */
export async function handleUserInput(input: string): Promise<Response> {
  try {
    // Parse the command
    const command = parseCommand(input);

    // Check if the command is valid
    if (!command) {
      return {
        success: false,
        message: 'Invalid command. Type "help" for a list of available commands.'
      };
    }

    // Execute the command
    return await executeCommand(command);
  } catch (error) {
    return {
      success: false,
      message: `Error handling user input: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Views a specification
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function viewSpecification(params: Record<string, any>): Promise<Response> {
  try {
    // Check if the specification ID is provided
    if (!params.specId) {
      return {
        success: false,
        message: 'Specification ID is required'
      };
    }

    // Get the specification
    const specification = await getSpecification(params.specId);

    // Get the workflow state
    const workflowState = await loadWorkflowState(params.specId);

    // Create a new session
    await createSession(params.specId, 'User', { action: 'view_specification' });

    return {
      success: true,
      message: `Viewing specification: ${specification.title}`,
      data: {
        specification,
        workflowState
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error viewing specification: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Edits a section in a specification
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function editSection(params: Record<string, any>): Promise<Response> {
  try {
    // Check if all required parameters are provided
    if (!params.specId || !params.sectionId || !params.content) {
      return {
        success: false,
        message: 'Specification ID, section ID, and content are required'
      };
    }

    // Get the specification
    const specification = await getSpecification(params.specId);

    // Find the section
    const sectionIndex = specification.sections.findIndex(s => s.id === params.sectionId);

    if (sectionIndex === -1) {
      return {
        success: false,
        message: `Section not found: ${params.sectionId}`
      };
    }

    // Create a copy of the specification
    const updatedSpecification = { ...specification };

    // Update the section content
    updatedSpecification.sections = [...specification.sections];
    updatedSpecification.sections[sectionIndex] = {
      ...updatedSpecification.sections[sectionIndex],
      content: params.content
    };

    // Update the specification
    await updateSpecification(
      params.specId,
      updatedSpecification,
      'User',
      `Updated section: ${updatedSpecification.sections[sectionIndex].title}`
    );

    return {
      success: true,
      message: `Section ${params.sectionId} updated successfully`,
      data: {
        section: updatedSpecification.sections[sectionIndex]
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error editing section: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Marks a section as complete
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function markSectionComplete(params: Record<string, any>): Promise<Response> {
  try {
    // Check if all required parameters are provided
    if (!params.specId || !params.sectionId) {
      return {
        success: false,
        message: 'Specification ID and section ID are required'
      };
    }

    // Mark the section as completed
    const workflowState = await markSectionCompleted(params.specId, params.sectionId);

    // Calculate the overall progress
    const progress = await calculateOverallProgress(params.specId);

    return {
      success: true,
      message: `Section ${params.sectionId} marked as complete`,
      data: {
        workflowState,
        progress
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error marking section as complete: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Adds a new question
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function addNewQuestion(params: Record<string, any>): Promise<Response> {
  try {
    // Check if all required parameters are provided
    if (!params.specId || !params.targetSection || !params.text) {
      return {
        success: false,
        message: 'Specification ID, target section, and question text are required'
      };
    }

    // Add the question
    const workflowState = await addQuestion(params.specId, {
      text: params.text,
      context: 'User question',
      targetSection: params.targetSection
    });

    return {
      success: true,
      message: 'Question added successfully',
      data: {
        workflowState
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error adding question: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Answers an existing question
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function answerExistingQuestion(params: Record<string, any>): Promise<Response> {
  try {
    // Check if all required parameters are provided
    if (!params.specId || !params.questionId || !params.answer) {
      return {
        success: false,
        message: 'Specification ID, question ID, and answer are required'
      };
    }

    // Answer the question
    const workflowState = await answerQuestion(params.specId, params.questionId, params.answer);

    return {
      success: true,
      message: 'Question answered successfully',
      data: {
        workflowState
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error answering question: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Changes the workflow phase
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function changeWorkflowPhase(params: Record<string, any>): Promise<Response> {
  try {
    // Check if all required parameters are provided
    if (!params.specId || !params.phase) {
      return {
        success: false,
        message: 'Specification ID and phase are required'
      };
    }

    // Validate the phase
    const validPhases = ['analysis', 'drafting', 'review', 'planning'];
    if (!validPhases.includes(params.phase)) {
      return {
        success: false,
        message: `Invalid phase: ${params.phase}. Valid phases are: ${validPhases.join(', ')}`
      };
    }

    // Update the workflow phase
    const workflowState = await updateWorkflowPhase(params.specId, params.phase);

    return {
      success: true,
      message: `Workflow phase changed to ${params.phase}`,
      data: {
        workflowState
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error changing workflow phase: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Views tasks for a specification
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function viewTasks(params: Record<string, any>): Promise<Response> {
  try {
    // Check if the specification ID is provided
    if (!params.specId) {
      return {
        success: false,
        message: 'Specification ID is required'
      };
    }

    // Get the tasks for the specification
    const tasks = await getTasksForSpecification(params.specId);

    return {
      success: true,
      message: `Found ${tasks.length} tasks for specification ${params.specId}`,
      data: {
        tasks
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error viewing tasks: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Views progress for a specification
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function viewProgress(params: Record<string, any>): Promise<Response> {
  try {
    // Check if the specification ID is provided
    if (!params.specId) {
      return {
        success: false,
        message: 'Specification ID is required'
      };
    }

    // Get the workflow state
    const workflowState = await loadWorkflowState(params.specId);

    if (!workflowState) {
      return {
        success: false,
        message: `Workflow state not found for specification: ${params.specId}`
      };
    }

    // Calculate the overall progress
    const progress = await calculateOverallProgress(params.specId);

    return {
      success: true,
      message: `Current progress: ${progress}%`,
      data: {
        workflowState,
        progress
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error viewing progress: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Gets help information
 *
 * @param params - Command parameters
 * @returns Response with help information
 */
function getHelp(params: Record<string, any>): Response {
  // General help
  if (!params.command) {
    return {
      success: true,
      message: 'Available commands:',
      data: {
        commands: [
          { command: 'view <specId>', description: 'View a specification' },
          { command: 'edit <specId> <sectionId> <content>', description: 'Edit a section in a specification' },
          { command: 'complete <specId> <sectionId>', description: 'Mark a section as complete' },
          { command: 'question <specId> <targetSection> <text>', description: 'Add a question' },
          { command: 'answer <specId> <questionId> <answer>', description: 'Answer a question' },
          { command: 'phase <specId> <phase>', description: 'Change the workflow phase' },
          { command: 'tasks <specId>', description: 'View tasks for a specification' },
          { command: 'progress <specId>', description: 'View progress for a specification' },
          { command: 'suggest <specId> [section|task|question]', description: 'Generate suggestions' },
          { command: 'analyze <specId> [scope]', description: 'Analyze codebase for a specification' },
          { command: 'workflow <specId> [start|resume|pause|complete]', description: 'Manage workflow' },
          { command: 'export <specId> [format]', description: 'Export a specification' },
          { command: 'help [command]', description: 'Get help information' }
        ]
      }
    };
  }

  // Command-specific help
  switch (params.command) {
    case 'view':
      return {
        success: true,
        message: 'view <specId>',
        data: {
          description: 'View a specification',
          parameters: [
            { name: 'specId', description: 'Specification identifier' }
          ],
          example: 'view abc123'
        }
      };

    case 'edit':
      return {
        success: true,
        message: 'edit <specId> <sectionId> <content>',
        data: {
          description: 'Edit a section in a specification',
          parameters: [
            { name: 'specId', description: 'Specification identifier' },
            { name: 'sectionId', description: 'Section identifier' },
            { name: 'content', description: 'New section content' }
          ],
          example: 'edit abc123 overview This is the new overview content.'
        }
      };

    case 'suggest':
      return {
        success: true,
        message: 'suggest <specId> [section|task|question]',
        data: {
          description: 'Generate contextual suggestions based on codebase analysis and project rules',
          parameters: [
            { name: 'specId', description: 'Specification identifier' },
            { name: 'type', description: 'Type of suggestion (section, task, question, or all)' }
          ],
          example: 'suggest abc123 section'
        }
      };

    case 'analyze':
      return {
        success: true,
        message: 'analyze <specId> [scope]',
        data: {
          description: 'Analyze the codebase for a specification',
          parameters: [
            { name: 'specId', description: 'Specification identifier' },
            { name: 'scope', description: 'Optional scope to limit analysis (e.g., directory path)' }
          ],
          example: 'analyze abc123 src/components'
        }
      };

    case 'workflow':
      return {
        success: true,
        message: 'workflow <specId> [start|resume|pause|complete]',
        data: {
          description: 'Manage workflow for a specification',
          parameters: [
            { name: 'specId', description: 'Specification identifier' },
            { name: 'action', description: 'Workflow action (start, resume, pause, complete, or status)' }
          ],
          example: 'workflow abc123 resume'
        }
      };

    case 'export':
      return {
        success: true,
        message: 'export <specId> [format]',
        data: {
          description: 'Export a specification to a specific format',
          parameters: [
            { name: 'specId', description: 'Specification identifier' },
            { name: 'format', description: 'Export format (markdown, html, pdf, or json)' }
          ],
          example: 'export abc123 html'
        }
      };

    // Add more command-specific help as needed

    default:
      return {
        success: false,
        message: `Unknown command: ${params.command}`
      };
  }
}

/**
 * Generates suggestions based on codebase analysis and project rules
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function generateSuggestions(params: Record<string, any>): Promise<Response> {
  try {
    // Check if the specification ID is provided
    if (!params.specId) {
      return {
        success: false,
        message: 'Specification ID is required'
      };
    }

    // Get the specification
    const specification = await getSpecification(params.specId);

    // Get the workflow state
    const workflowState = await loadWorkflowState(params.specId);

    if (!workflowState) {
      return {
        success: false,
        message: `Workflow state not found for specification: ${params.specId}`
      };
    }

    // Determine the suggestion type
    const type = params.type || 'all';
    const validTypes = ['section', 'task', 'question', 'all'];

    if (!validTypes.includes(type)) {
      return {
        success: false,
        message: `Invalid suggestion type: ${type}. Valid types are: ${validTypes.join(', ')}`
      };
    }

    // Generate suggestions based on type
    const suggestions: Record<string, any> = {};

    // Get analysis results from workflow state or perform a new analysis
    let analysisResults = workflowState.analysisResults;
    if (!analysisResults) {
      // Perform a basic analysis if none exists
      analysisResults = await analyzeRepository({
        includeDirs: [],
        focusKeywords: [specification.title],
        maxFiles: 500
      });
    }

    // Import project rules integrator for rule suggestions
    const { generateRuleSuggestions } = await import('./project-rules-integrator.js');

    // Generate section suggestions if requested
    if (type === 'section' || type === 'all') {
      // Get rule suggestions
      const ruleSuggestions = await generateRuleSuggestions(specification);

      // Map rules to sections
      const sectionSuggestions: Record<string, string[]> = {};

      for (const rule of ruleSuggestions) {
        if (!sectionSuggestions[rule.sectionId]) {
          sectionSuggestions[rule.sectionId] = [];
        }

        sectionSuggestions[rule.sectionId].push(
          `**${rule.description}**: ${rule.relevance}`
        );
      }

      // Add affected components to technical design section
      if (analysisResults && analysisResults.affectedComponents.length > 0) {
        const technicalDesignSection = specification.sections.find(s =>
          s.title.toLowerCase().includes('technical') &&
          s.title.toLowerCase().includes('design')
        );

        if (technicalDesignSection) {
          if (!sectionSuggestions[technicalDesignSection.id]) {
            sectionSuggestions[technicalDesignSection.id] = [];
          }

          sectionSuggestions[technicalDesignSection.id].push(
            '**Consider these components in your design:**\n' +
            analysisResults.affectedComponents
              .map(c => `- ${c.name}: ${c.description} (Impact: ${c.impactLevel})`)
              .join('\n')
          );
        }
      }

      suggestions.sections = sectionSuggestions;
    }

    // Generate task suggestions if requested
    if (type === 'task' || type === 'all') {
      const taskSuggestions: string[] = [];

      // Add implementation tasks based on affected components
      if (analysisResults && analysisResults.affectedComponents.length > 0) {
        for (const component of analysisResults.affectedComponents) {
          taskSuggestions.push(
            `Implement changes to ${component.name} (${component.impactLevel} impact)`
          );
        }
      }

      // Add testing tasks
      taskSuggestions.push('Create unit tests for new functionality');
      taskSuggestions.push('Perform integration testing');

      // Add documentation tasks
      taskSuggestions.push('Update documentation to reflect changes');

      suggestions.tasks = taskSuggestions;
    }

    // Generate question suggestions if requested
    if (type === 'question' || type === 'all') {
      const questionSuggestions: string[] = [];

      // Add questions based on analysis results
      if (analysisResults && analysisResults.suggestedQuestions) {
        questionSuggestions.push(...analysisResults.suggestedQuestions);
      }

      // Add standard questions
      questionSuggestions.push('Are there any performance considerations for this feature?');
      questionSuggestions.push('Are there any security implications to consider?');
      questionSuggestions.push('What are the acceptance criteria for this feature?');

      suggestions.questions = questionSuggestions;
    }

    return {
      success: true,
      message: `Generated ${type} suggestions for specification: ${specification.title}`,
      data: {
        specification,
        suggestions,
        analysisResults
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error generating suggestions: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Analyzes the codebase for a specification
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function analyzeSpecification(params: Record<string, any>): Promise<Response> {
  try {
    // Check if the specification ID is provided
    if (!params.specId) {
      return {
        success: false,
        message: 'Specification ID is required'
      };
    }

    // Get the specification
    const specification = await getSpecification(params.specId);

    // Get the workflow state
    const workflowState = await loadWorkflowState(params.specId);

    if (!workflowState) {
      return {
        success: false,
        message: `Workflow state not found for specification: ${params.specId}`
      };
    }

    // Extract keywords from the specification title and description
    const keywords = [
      specification.title,
      ...specification.sections
        .filter(s => s.title.toLowerCase().includes('overview') || s.title.toLowerCase().includes('requirement'))
        .map(s => s.content)
    ];

    // Configure the analysis
    const analysisConfig = {
      includeDirs: params.scope ? [params.scope] : [],
      focusKeywords: keywords,
      maxFiles: 1000 // Limit to prevent excessive processing
    };

    // Perform the analysis
    console.log(`Starting codebase analysis for specification: ${specification.title}`);
    console.time('Codebase analysis');
    const analysisResults = await analyzeRepository(analysisConfig);
    console.timeEnd('Codebase analysis');

    // Update the workflow state with the analysis results
    workflowState.analysisResults = analysisResults;
    await updateWorkflowPhase(params.specId, 'analysis');

    // Format the analysis results for visualization
    const formattedResults = formatAnalysisResults(analysisResults);

    return {
      success: true,
      message: `Codebase analysis completed for specification: ${specification.title}`,
      data: {
        specification,
        workflowState,
        analysisResults: formattedResults
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error analyzing codebase: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Formats analysis results for visualization
 *
 * @param results - Analysis results to format
 * @returns Formatted analysis results
 */
function formatAnalysisResults(results: CodebaseAnalysisResult): Record<string, any> {
  // Create a formatted version of the results
  const formatted: Record<string, any> = {
    summary: {
      affectedComponentCount: results.affectedComponents.length,
      impactedFileCount: results.impactedFiles.length,
      dependencyCount: results.dependencies.length,
      ruleCount: results.projectRules.length,
      confidence: `${Math.round(results.analysisConfidence * 100)}%`
    },
    components: results.affectedComponents.map(c => ({
      name: c.name,
      path: c.path,
      description: c.description,
      impactLevel: c.impactLevel
    })),
    files: results.impactedFiles.map(f => ({
      path: f.path,
      reason: f.reason,
      suggestedChanges: f.suggestedChanges || 'None'
    })),
    dependencies: results.dependencies.map(d => ({
      source: d.source,
      target: d.target,
      type: d.type,
      description: d.description
    })),
    rules: results.projectRules.map(r => ({
      id: r.id,
      description: r.description,
      relevance: r.relevance,
      sectionId: r.sectionId
    })),
    questions: results.suggestedQuestions
  };

  return formatted;
}

/**
 * Manages workflow for a specification
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function manageWorkflow(params: Record<string, any>): Promise<Response> {
  try {
    // Check if the specification ID is provided
    if (!params.specId) {
      return {
        success: false,
        message: 'Specification ID is required'
      };
    }

    // Get the specification
    const specification = await getSpecification(params.specId);

    // Get the workflow state
    const workflowState = await loadWorkflowState(params.specId);

    if (!workflowState && params.action !== 'start') {
      return {
        success: false,
        message: `Workflow state not found for specification: ${params.specId}`
      };
    }

    // Determine the action
    const action = params.action || 'status';
    const validActions = ['start', 'resume', 'pause', 'complete', 'status'];

    if (!validActions.includes(action)) {
      return {
        success: false,
        message: `Invalid workflow action: ${action}. Valid actions are: ${validActions.join(', ')}`
      };
    }

    // Perform the action
    let updatedWorkflowState = workflowState;
    let message = '';

    switch (action) {
      case 'start':
        // Create a new workflow state if it doesn't exist
        if (!workflowState) {
          updatedWorkflowState = await createWorkflowState(params.specId, 'analysis');
          message = `Started new workflow for specification: ${specification.title}`;
        } else {
          message = `Workflow already exists for specification: ${specification.title}`;
        }
        break;

      case 'resume':
        // Create a new session
        await createSession(params.specId, 'User', { action: 'resume_workflow' });
        message = `Resumed workflow for specification: ${specification.title}`;
        break;

      case 'pause':
        // End the current session
        await endSession(params.specId, 'User', { action: 'pause_workflow' });
        message = `Paused workflow for specification: ${specification.title}`;
        break;

      case 'complete':
        // Update the workflow phase to 'planning'
        updatedWorkflowState = await updateWorkflowPhase(params.specId, 'planning');

        // Update the specification status to 'approved'
        const updatedSpecification = { ...specification };
        updatedSpecification.metadata = { ...specification.metadata, status: 'approved' };

        await updateSpecification(
          params.specId,
          updatedSpecification,
          'User',
          'Marked specification as approved'
        );

        message = `Completed workflow for specification: ${specification.title}`;
        break;

      case 'status':
        // Calculate the overall progress
        const progress = await calculateOverallProgress(params.specId);
        message = `Current workflow status: ${workflowState.currentPhase} (${progress}% complete)`;
        break;
    }

    // Get the updated specification
    const updatedSpecification = await getSpecification(params.specId);

    return {
      success: true,
      message,
      data: {
        specification: updatedSpecification,
        workflowState: updatedWorkflowState,
        progress: await calculateOverallProgress(params.specId)
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error managing workflow: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Exports a specification to a specific format
 *
 * @param params - Command parameters
 * @returns Promise that resolves with the response
 */
async function exportSpecification(params: Record<string, any>): Promise<Response> {
  try {
    // Check if the specification ID is provided
    if (!params.specId) {
      return {
        success: false,
        message: 'Specification ID is required'
      };
    }

    // Get the specification
    const specification = await getSpecification(params.specId);

    // Determine the format
    const format = params.format || 'markdown';
    const validFormats = ['markdown', 'html', 'json', 'pdf'];

    if (!validFormats.includes(format)) {
      return {
        success: false,
        message: `Invalid export format: ${format}. Valid formats are: ${validFormats.join(', ')}`
      };
    }

    // Export the specification
    let exportedContent = '';
    let contentType = '';

    switch (format) {
      case 'markdown':
        exportedContent = exportToMarkdown(specification);
        contentType = 'text/markdown';
        break;

      case 'html':
        exportedContent = exportToHtml(specification);
        contentType = 'text/html';
        break;

      case 'json':
        exportedContent = JSON.stringify(specification, null, 2);
        contentType = 'application/json';
        break;

      case 'pdf':
        // PDF export would require additional libraries
        return {
          success: false,
          message: 'PDF export is not yet implemented'
        };
    }

    // Create the export directory if it doesn't exist
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Save the exported content
    const fileName = `${specification.id}_${format}_${Date.now()}`;
    const filePath = path.join(exportDir, `${fileName}.${format === 'json' ? 'json' : format === 'html' ? 'html' : 'md'}`);

    fs.writeFileSync(filePath, exportedContent, 'utf-8');

    return {
      success: true,
      message: `Specification exported to ${format} format`,
      data: {
        specification,
        exportedContent,
        contentType,
        filePath
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error exporting specification: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Exports a specification to Markdown format
 *
 * @param specification - Specification to export
 * @returns Markdown content
 */
function exportToMarkdown(specification: SpecificationDocument): string {
  let markdown = `# ${specification.title}\n\n`;

  // Add metadata
  markdown += `- **ID**: ${specification.id}\n`;
  markdown += `- **Version**: ${specification.version}\n`;
  markdown += `- **Status**: ${specification.metadata.status}\n`;
  markdown += `- **Authors**: ${specification.metadata.authors.join(', ')}\n`;
  markdown += `- **Created**: ${new Date(specification.createdAt).toLocaleDateString()}\n`;
  markdown += `- **Updated**: ${new Date(specification.updatedAt).toLocaleDateString()}\n\n`;

  // Add tags if present
  if (specification.metadata.tags && specification.metadata.tags.length > 0) {
    markdown += `**Tags**: ${specification.metadata.tags.join(', ')}\n\n`;
  }

  // Add sections
  for (const section of specification.sections) {
    markdown += `## ${section.title}\n\n${section.content}\n\n`;
  }

  // Add related specifications if present
  if (specification.metadata.relatedSpecs && specification.metadata.relatedSpecs.length > 0) {
    markdown += `## Related Specifications\n\n`;
    for (const relatedSpec of specification.metadata.relatedSpecs) {
      markdown += `- ${relatedSpec}\n`;
    }
    markdown += '\n';
  }

  // Add change history
  if (specification.changeHistory && specification.changeHistory.length > 0) {
    markdown += `## Change History\n\n`;
    markdown += `| Date | Author | Description | Section |\n`;
    markdown += `| ---- | ------ | ----------- | ------- |\n`;

    for (const change of specification.changeHistory) {
      const date = new Date(change.timestamp).toLocaleDateString();
      markdown += `| ${date} | ${change.author} | ${change.description} | ${change.sectionId} |\n`;
    }
    markdown += '\n';
  }

  return markdown;
}

/**
 * Exports a specification to HTML format
 *
 * @param specification - Specification to export
 * @returns HTML content
 */
function exportToHtml(specification: SpecificationDocument): string {
  // Convert the specification to Markdown first
  const markdown = exportToMarkdown(specification);

  // Simple Markdown to HTML conversion
  // Note: A proper implementation would use a Markdown parser library
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${specification.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #333;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px;
    }
    th {
      background-color: #f2f2f2;
    }
  </style>
</head>
<body>
  <div class="specification">
`;

  // Very basic Markdown to HTML conversion
  const lines = markdown.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('# ')) {
      html += `    <h1>${line.substring(2)}</h1>\n`;
    } else if (line.startsWith('## ')) {
      html += `    <h2>${line.substring(3)}</h2>\n`;
    } else if (line.startsWith('### ')) {
      html += `    <h3>${line.substring(4)}</h3>\n`;
    } else if (line.startsWith('- ')) {
      html += `    <ul>\n      <li>${line.substring(2)}</li>\n    </ul>\n`;
    } else if (line.startsWith('| ')) {
      // Table handling
      if (i > 0 && !lines[i-1].startsWith('| ')) {
        html += '    <table>\n';
      }

      const cells = line.split('|').filter(cell => cell.trim() !== '');

      if (i > 0 && lines[i-1].startsWith('| ') && line.includes('---')) {
        // This is a table header separator, skip it
        continue;
      }

      html += '      <tr>\n';
      for (const cell of cells) {
        if (i > 0 && lines[i-1].startsWith('| ') && !lines[i-1].includes('---')) {
          html += `        <td>${cell.trim()}</td>\n`;
        } else {
          html += `        <th>${cell.trim()}</th>\n`;
        }
      }
      html += '      </tr>\n';

      if (i < lines.length - 1 && !lines[i+1].startsWith('| ')) {
        html += '    </table>\n';
      }
    } else if (line.trim() === '') {
      html += '    <br>\n';
    } else {
      html += `    <p>${line}</p>\n`;
    }
  }

  html += `  </div>
</body>
</html>`;

  return html;
}
