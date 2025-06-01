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
import fs from 'fs/promises';
import path from 'path';

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

/**
 * Generates intelligent content for specification sections based on input description
 * 
 * @param title - Title of the specification
 * @param description - Detailed description provided by user
 * @returns Object containing generated content for each section
 */
function generateIntelligentContent(title: string, description: string): Record<string, string> {
  // Extract key features and requirements from the description
  const features = extractFeatures(description);
  const requirements = extractRequirements(description);
  
  return {
    functionalRequirements: generateFunctionalRequirements(description, features),
    nonFunctionalRequirements: generateNonFunctionalRequirements(description),
    technicalDesign: generateTechnicalDesign(description, features),
    acceptanceCriteria: generateAcceptanceCriteria(description, features),
    implementationConstraints: generateImplementationConstraints(description),
    openQuestions: generateOpenQuestions(description, title)
  };
}

/**
 * Extracts key features from description
 */
function extractFeatures(description: string): string[] {
  const features: string[] = [];
  const featureKeywords = ['featuring', 'include', 'with', 'support', 'provide', 'enable', 'allow'];
  
  // Look for feature-indicating patterns
  const sentences = description.split(/[.!?]+/);
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if (featureKeywords.some(keyword => lowerSentence.includes(keyword))) {
      // Extract potential features
      const words = sentence.split(',').map(s => s.trim()).filter(s => s.length > 0);
      features.push(...words);
    }
  }
  
  return features.slice(0, 8); // Limit to top 8 features
}

/**
 * Extracts requirements from description
 */
function extractRequirements(description: string): string[] {
  const requirements: string[] = [];
  const requirementKeywords = ['must', 'should', 'require', 'need', 'essential', 'critical'];
  
  const sentences = description.split(/[.!?]+/);
  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if (requirementKeywords.some(keyword => lowerSentence.includes(keyword))) {
      requirements.push(sentence.trim());
    }
  }
  
  return requirements;
}

/**
 * Generates functional requirements based on description
 */
function generateFunctionalRequirements(description: string, features: string[]): string {
  const baseRequirements = [
    "Core functionality implementation with user-friendly interface",
    "Data persistence and state management",
    "Error handling and validation mechanisms",
    "Integration with existing system components"
  ];
  
  // Add feature-specific requirements
  const featureRequirements = features.map(feature => 
    `${feature.charAt(0).toUpperCase() + feature.slice(1)} implementation and management`
  ).slice(0, 4);
  
  const allRequirements = [...featureRequirements, ...baseRequirements].slice(0, 6);
  
  return allRequirements.map(req => `- **${req}**`).join('\n');
}

/**
 * Generates non-functional requirements
 */
function generateNonFunctionalRequirements(description: string): string {
  const requirements = [
    "**Performance**: Response times under 200ms for core operations",
    "**Scalability**: Support for concurrent users and growing data volumes", 
    "**Security**: Authentication, authorization, and data protection",
    "**Usability**: Intuitive interface with accessibility compliance",
    "**Reliability**: 99.9% uptime with graceful error handling",
    "**Maintainability**: Clean code architecture with comprehensive documentation"
  ];
  
  // Add domain-specific requirements based on description
  if (description.toLowerCase().includes('real-time')) {
    requirements.unshift("**Real-time Performance**: Sub-100ms latency for live updates");
  }
  if (description.toLowerCase().includes('mobile')) {
    requirements.push("**Mobile Compatibility**: Responsive design for all device types");
  }
  if (description.toLowerCase().includes('api')) {
    requirements.push("**API Performance**: RESTful API with proper rate limiting");
  }
  
  return requirements.slice(0, 6).map(req => `- ${req}`).join('\n');
}

/**
 * Generates technical design content
 */
function generateTechnicalDesign(description: string, features: string[]): string {
  let design = `### Architecture\n\n`;
  design += `The ${description.includes('platform') ? 'platform' : 'system'} follows a modular architecture with clear separation of concerns:\n\n`;
  design += `- **Frontend Layer**: User interface and experience components\n`;
  design += `- **Business Logic Layer**: Core functionality and business rules\n`;
  design += `- **Data Layer**: Database and storage management\n`;
  design += `- **Integration Layer**: External service connections and APIs\n\n`;
  
  design += `### Components\n\n`;
  design += `Key components to be implemented or modified:\n\n`;
  
  // Generate component list based on features
  const components = [
    "Main application controller and routing",
    "User interface components and views", 
    "Data models and validation logic",
    "Service layer for business operations",
    "Database access and ORM integration"
  ];
  
  if (features.some(f => f.toLowerCase().includes('auth'))) {
    components.push("Authentication and authorization service");
  }
  if (features.some(f => f.toLowerCase().includes('api'))) {
    components.push("API endpoints and middleware");
  }
  
  design += components.slice(0, 6).map(comp => `- **${comp}**`).join('\n');
  design += `\n\n### Data Flow\n\n`;
  design += `1. **User Input**: Interface captures user interactions and data\n`;
  design += `2. **Validation**: Input validation and sanitization\n`;
  design += `3. **Processing**: Business logic execution and data transformation\n`;
  design += `4. **Storage**: Database operations and state persistence\n`;
  design += `5. **Response**: Result formatting and user feedback\n`;
  
  return design;
}

/**
 * Generates acceptance criteria
 */
function generateAcceptanceCriteria(description: string, features: string[]): string {
  const baseCriteria = [
    "**Functionality**: All core features work as specified without errors",
    "**User Experience**: Interface is intuitive and responsive across devices",
    "**Performance**: System meets specified performance benchmarks",
    "**Testing**: All unit, integration, and user acceptance tests pass",
    "**Documentation**: Complete technical and user documentation provided",
    "**Deployment**: Successfully deployed to production environment"
  ];
  
  // Add feature-specific criteria
  const featureCriteria = features.slice(0, 2).map(feature => 
    `**${feature.charAt(0).toUpperCase() + feature.slice(1)}**: Feature is fully implemented and tested`
  );
  
  const allCriteria = [...featureCriteria, ...baseCriteria].slice(0, 6);
  return allCriteria.map(criteria => `- ${criteria}`).join('\n');
}

/**
 * Generates implementation constraints
 */
function generateImplementationConstraints(description: string): string {
  const constraints = [
    "**Technology Stack**: Must use existing project technologies and frameworks",
    "**Timeline**: Implementation must fit within project schedule constraints",
    "**Resources**: Development team capacity and skill set limitations",
    "**Budget**: Cost limitations for external services and tools",
    "**Compatibility**: Backward compatibility with existing system versions"
  ];
  
  // Add domain-specific constraints
  if (description.toLowerCase().includes('security')) {
    constraints.unshift("**Security Compliance**: Must meet industry security standards");
  }
  if (description.toLowerCase().includes('performance')) {
    constraints.push("**Performance Standards**: Must not degrade existing system performance");
  }
  
  return constraints.slice(0, 5).map(constraint => `- ${constraint}`).join('\n');
}

/**
 * Generates open questions
 */
function generateOpenQuestions(description: string, title: string): string {
  const questions = [
    `What are the specific user personas and use cases for ${title}?`,
    "How should the feature integrate with existing authentication systems?",
    "What are the data retention and privacy requirements?",
    "Are there any third-party service dependencies to consider?",
    "What are the monitoring and analytics requirements?",
    "How should error scenarios and edge cases be handled?"
  ];
  
  // Add domain-specific questions
  if (description.toLowerCase().includes('api')) {
    questions.push("What API rate limits and versioning strategy should be implemented?");
  }
  if (description.toLowerCase().includes('real-time')) {
    questions.push("What is the acceptable latency for real-time features?");
  }
  
  return questions.slice(0, 5).map(q => `- ${q}`).join('\n');
}

export async function createSpec(params: z.infer<typeof createSpecSchema>) {
  try {
    const { title, description, scope, template } = params;

    // **ENHANCED: Generate intelligent content for each section**
    const intelligentContent = generateIntelligentContent(title, description);

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
        hasAPI: description.toLowerCase().includes('api') || description.toLowerCase().includes('endpoint'),
        hasDatabase: description.toLowerCase().includes('database') || description.toLowerCase().includes('storage') || description.toLowerCase().includes('persist'),
        relatedFiles: analysisResult ?
          analysisResult.impactedFiles.map(file => `- ${file.path}: ${file.reason}`).join('\n') :
          'No related files identified.',
        // **NEW: Add intelligent content to template data**
        functionalRequirements: intelligentContent.functionalRequirements,
        nonFunctionalRequirements: intelligentContent.nonFunctionalRequirements,
        technicalDesign: intelligentContent.technicalDesign,
        acceptanceCriteria: intelligentContent.acceptanceCriteria,
        implementationConstraints: intelligentContent.implementationConstraints,
        openQuestions: intelligentContent.openQuestions
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

    // **UPDATED: Store dev_spec.md in MCP server data directory AND project root**
    try {
      const devSpecContent = generateDevSpecMarkdown(specification, analysisText);
      
      // Store in MCP server's data directory for UUID-based access
      const dataDir = path.join(process.cwd(), 'data', 'specifications');
      await fs.mkdir(dataDir, { recursive: true });
      
      const devSpecPath = path.join(dataDir, `${specification.id}.md`);
      await fs.writeFile(devSpecPath, devSpecContent, 'utf-8');
      
      // ALSO store as dev_spec.md in project root for developer convenience
      const rootDevSpecPath = path.join(process.cwd(), 'dev_spec.md');
      await fs.writeFile(rootDevSpecPath, devSpecContent, 'utf-8');
      
      console.log(`Generated dev_spec.md stored at: ${devSpecPath}`);
      console.log(`Developer convenience copy created at: ${rootDevSpecPath}`);
    } catch (error) {
      console.error('Error storing dev_spec.md file:', error);
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
                `- **Status**: ${specification.metadata.status}\n` +
                `- **Storage**: Stored in MCP server data directory\n\n` +
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
                `## Specification Access\n\n` +
                `- **UUID**: ${specification.id} (for \`interact_spec\` commands)\n` +
                `- **File Storage**: Available via \`get_spec\` tool using UUID\n` +
                `- **Interactive Management**: Use \`interact_spec\` for viewing and editing\n\n` +
                `## Next Steps\n\n` +
                `1. Use \`get_spec\` with UUID ${specification.id} to read the complete specification\n` +
                `2. Use \`interact_spec\` with ID ${specification.id} for interactive management\n` +
                `3. Use \`plan_task\` to create implementation tasks based on this specification`
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

/**
 * Generates a complete dev_spec.md markdown file from a specification
 * 
 * @param specification - The specification document
 * @param analysisText - The codebase analysis results text
 * @returns Formatted markdown content for dev_spec.md
 */
function generateDevSpecMarkdown(specification: any, analysisText: string): string {
  const sections = specification.sections || [];
  let content = `# ${specification.title}\n\n`;
  
  // Add metadata
  content += `## Specification Metadata\n\n`;
  content += `- **ID**: \`${specification.id}\`\n`;
  content += `- **Version**: ${specification.version}\n`;
  content += `- **Status**: ${specification.metadata?.status || 'draft'}\n`;
  content += `- **Created**: ${specification.createdAt.toISOString().split('T')[0]}\n`;
  content += `- **Updated**: ${specification.updatedAt.toISOString().split('T')[0]}\n`;
  content += `- **Authors**: ${specification.metadata?.authors?.join(', ') || 'AI Assistant'}\n\n`;
  
  // Add analysis results
  if (analysisText && analysisText.trim()) {
    content += `## Codebase Analysis\n\n`;
    content += `${analysisText}\n\n`;
  }
  
  // Add all sections from the specification
  for (const section of sections) {
    content += `## ${section.title}\n\n`;
    content += `${section.content}\n\n`;
  }
  
  // Add UUID reference for interactive commands
  content += `---\n\n`;
  content += `## Interactive Management\n\n`;
  content += `This specification can be managed interactively using:\n\n`;
  content += `\`\`\`\n`;
  content += `interact_spec({\n`;
  content += `  specId: "${specification.id}",\n`;
  content += `  command: "view"  // or "edit", "progress", "tasks", etc.\n`;
  content += `})\n`;
  content += `\`\`\`\n\n`;
  content += `**Available Commands:**\n`;
  content += `- \`view\`: Display the complete specification\n`;
  content += `- \`edit <section> <content>\`: Edit a specific section\n`;
  content += `- \`progress\`: Check implementation progress\n`;
  content += `- \`tasks\`: View related tasks\n`;
  content += `- \`help\`: Get detailed command help\n\n`;
  
  return content;
}
