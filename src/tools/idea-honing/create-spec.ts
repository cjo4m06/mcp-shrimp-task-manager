/**
 * Implementation of the create_spec command for the Idea Honing Tool
 *
 * This file contains the main command execution logic for creating structured
 * specification documents from raw ideas, with deep codebase analysis and
 * project rule integration.
 */

import { z } from "zod";
import { createSpecSchema } from "./index.js";
import { createSpecification } from "./components/specification-manager.js";
import { analyzeRepository } from "./components/codebase-analyzer.js";
import { generateRuleSuggestions, applyRulesToSpecification } from "./components/project-rules-integrator.js";
import { storeSpecificationInTaskMemory, createTaskFromSpecification } from "./components/task-memory-connector.js";
import { createWorkflowState, createSession } from "./components/workflow-state-manager.js";

/**
 * Main function for creating a specification document
 *
 * @param params - Parameters for the create_spec command
 * @returns Response object with content for the MCP framework
 */
/**
 * Extracts keywords from text for codebase analysis
 *
 * @param text - Text to extract keywords from
 * @returns Array of keywords
 */
function extractKeywords(text: string): string[] {
  // Split the text into words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/) // Split on whitespace
    .filter(word => word.length > 3); // Filter out short words

  // Remove common words
  const commonWords = ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'will', 'have', 'been'];
  const filteredWords = words.filter(word => !commonWords.includes(word));

  // Get unique words
  const uniqueWords = [...new Set(filteredWords)];

  // Return the top 5 keywords
  return uniqueWords.slice(0, 5);
}

/**
 * Formats the analysis result for display
 *
 * @param result - Analysis result to format
 * @returns Formatted analysis text
 */
function formatAnalysisResult(result: any): string {
  let text = '';

  // Add confidence score
  text += `**Analysis Confidence**: ${Math.round(result.analysisConfidence * 100)}%\n\n`;

  // Add affected components
  if (result.affectedComponents && result.affectedComponents.length > 0) {
    text += `### Affected Components\n\n`;
    for (const component of result.affectedComponents.slice(0, 5)) {
      text += `- **${component.name}** (${component.path}): ${component.description}\n`;
    }
    if (result.affectedComponents.length > 5) {
      text += `- ... and ${result.affectedComponents.length - 5} more components\n`;
    }
    text += '\n';
  }

  // Add impacted files
  if (result.impactedFiles && result.impactedFiles.length > 0) {
    text += `### Impacted Files\n\n`;
    for (const file of result.impactedFiles.slice(0, 5)) {
      text += `- **${file.path}**: ${file.reason}\n`;
    }
    if (result.impactedFiles.length > 5) {
      text += `- ... and ${result.impactedFiles.length - 5} more files\n`;
    }
    text += '\n';
  }

  // Add suggested questions
  if (result.suggestedQuestions && result.suggestedQuestions.length > 0) {
    text += `### Suggested Questions\n\n`;
    for (const question of result.suggestedQuestions) {
      text += `- ${question}\n`;
    }
    text += '\n';
  }

  return text;
}

export async function createSpec(params: z.infer<typeof createSpecSchema>) {
  try {
    const { title, description, scope, template } = params;

    // Analyze the codebase
    let analysisResult;
    let analysisText = '';
    try {
      // Extract keywords from the title and description
      const keywords = extractKeywords(title + ' ' + description);

      // Configure the analysis
      const analysisConfig = {
        includeDirs: scope ? [scope] : [],
        focusKeywords: keywords,
        maxFiles: 1000 // Limit to prevent excessive processing
      };

      // Perform the analysis
      analysisResult = await analyzeRepository(analysisConfig);

      // Generate analysis text
      analysisText = formatAnalysisResult(analysisResult);
    } catch (error) {
      console.error('Error during codebase analysis:', error);
      analysisText = 'Codebase analysis failed. Proceeding without analysis results.';
    }

    // Create a new specification using the Specification Manager
    let specification = await createSpecification(
      title,
      description,
      "AI Assistant", // Default author
      template || "default-template",
      "default", // Default project ID
      "", // Default feature ID
      {
        scope: scope || "Full codebase",
        hasAPI: false, // Default value for conditional sections
        hasDatabase: false, // Default value for conditional sections
        relatedFiles: analysisResult ?
          analysisResult.impactedFiles.map(file => `- ${file.path}: ${file.reason}`).join('\n') :
          'No related files identified.'
      }
    );

    // Apply project rules to the specification
    try {
      // Generate rule suggestions
      const ruleSuggestions = await generateRuleSuggestions(specification);

      if (ruleSuggestions.length > 0) {
        // Apply rules to the specification
        specification = applyRulesToSpecification(specification, ruleSuggestions);
      }
    } catch (error) {
      console.error('Error applying project rules:', error);
    }

    // Store the specification in task memory
    let taskMemoryId = '';
    try {
      taskMemoryId = await storeSpecificationInTaskMemory(specification);

      // Create an initial planning task from the specification
      await createTaskFromSpecification(taskMemoryId, {
        title: `Plan implementation for: ${specification.title}`,
        description: `Create a detailed implementation plan for the specification: ${specification.title}. Review the specification document and break it down into manageable tasks.`,
        metadata: {
          type: 'planning',
          priority: 'high',
          estimatedEffort: 'medium'
        }
      });
    } catch (error) {
      console.error('Error storing specification in task memory:', error);
    }

    // Create workflow state and session
    let workflowStateId = '';
    let sessionId = '';
    try {
      // Extract keywords from title and description for session metadata
      const extractedKeywords = extractKeywords(title + ' ' + description);

      // Create workflow state with analysis results
      const workflowState = await createWorkflowState(
        specification.id,
        'analysis',
        analysisResult
      );
      workflowStateId = workflowState.specId;

      // Create a new session
      const session = await createSession(
        specification.id,
        'AI Assistant', // Default user ID
        {
          source: 'create_spec',
          initialKeywords: extractedKeywords,
          hasAnalysisResults: !!analysisResult,
          hasRuleSuggestions: false // Will be updated after counting rules
        }
      );
      sessionId = session.id;
    } catch (error) {
      console.error('Error creating workflow state:', error);
    }

    // Count the number of rule suggestions
    let ruleCount = 0;
    for (const section of specification.sections) {
      if (section.content.includes('### Rule Suggestions')) {
        // Count the number of rule suggestions in the section
        const matches = section.content.match(/- \*\*[^*]+\*\*:/g);
        if (matches) {
          ruleCount += matches.length;
        }
      }
    }

    // Return a success message with the specification details and analysis results
    return {
      content: [
        {
          type: "text" as const,
          text: `# Specification Created Successfully\n\n` +
                `A new specification document has been created with the following details:\n\n` +
                `- **Title**: ${specification.title}\n` +
                `- **ID**: ${specification.id}\n` +
                `- **Version**: ${specification.version}\n` +
                `- **Created**: ${specification.createdAt.toISOString().split('T')[0]}\n` +
                `- **Status**: ${specification.metadata.status}\n\n` +
                `The specification contains the following sections:\n\n` +
                `${specification.sections.map(section => `- ${section.title}`).join('\n')}\n\n` +
                `## Codebase Analysis Results\n\n` +
                `${analysisText}\n\n` +
                `${ruleCount > 0 ?
                  `## Project Rules Integration\n\n` +
                  `${ruleCount} project rules have been integrated into the specification. ` +
                  `These rules provide guidance for implementation based on project standards and best practices.\n\n` :
                  ''
                }` +
                `${taskMemoryId ?
                  `## Task Memory Integration\n\n` +
                  `The specification has been stored in task memory with ID: ${taskMemoryId}. ` +
                  `An initial planning task has been created to help break down the implementation into manageable tasks.\n\n` :
                  ''
                }` +
                `${workflowStateId ?
                  `## Workflow State Management\n\n` +
                  `A workflow state has been created for this specification with ID: ${workflowStateId}. ` +
                  `This enables continuity across sessions and progress tracking. ` +
                  `The current workflow phase is 'analysis'.\n\n` :
                  ''
                }` +
                `You can now use this specification as a foundation for task planning and implementation.`
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
          text: `Error creating specification: ${errorMessage}`,
        },
      ],
    };
  }
}
