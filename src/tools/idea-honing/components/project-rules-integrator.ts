/**
 * Project Rules Integrator for the Idea Honing Tool
 * 
 * This component integrates with the project rules system to apply relevant rules
 * to specifications and generate rule suggestions.
 */

import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { RelevantRule } from '../models/analysis-result.js';
import { SpecificationDocument, SpecSection } from '../models/specification.js';

// Get the base directory for project rules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, 'data');
const RULES_DIR = path.join(DATA_DIR, 'project-rules');

/**
 * Project rule structure
 */
interface ProjectRule {
  /** Rule identifier */
  id: string;
  
  /** Rule name */
  name: string;
  
  /** Rule description */
  description: string;
  
  /** Rule category */
  category: string;
  
  /** Rule scope (e.g., 'code', 'documentation', 'testing') */
  scope: string;
  
  /** Rule priority (1-5, with 1 being highest) */
  priority: number;
  
  /** Rule keywords for matching */
  keywords: string[];
  
  /** Rule examples */
  examples?: string[];
}

/**
 * Retrieves all project rules
 * 
 * @returns Promise that resolves with an array of project rules
 */
export async function getAllProjectRules(): Promise<ProjectRule[]> {
  try {
    // Check if the rules directory exists
    try {
      await fsPromises.access(RULES_DIR);
    } catch {
      console.warn(`Project rules directory not found: ${RULES_DIR}`);
      return [];
    }
    
    // Read the rules file
    const rulesPath = path.join(RULES_DIR, 'rules.json');
    
    try {
      await fsPromises.access(rulesPath);
    } catch {
      console.warn(`Project rules file not found: ${rulesPath}`);
      return [];
    }
    
    // Read and parse the rules file
    const rulesContent = await fsPromises.readFile(rulesPath, 'utf-8');
    const rules = JSON.parse(rulesContent);
    
    return Array.isArray(rules) ? rules : [];
  } catch (error) {
    console.error(`Error retrieving project rules: ${error}`);
    return [];
  }
}

/**
 * Determines which rules are relevant to a specification
 * 
 * @param specification - Specification document
 * @param rules - Project rules
 * @returns Array of relevant rules
 */
export function determineRelevantRules(
  specification: SpecificationDocument,
  rules: ProjectRule[]
): RelevantRule[] {
  const relevantRules: RelevantRule[] = [];
  
  // Extract keywords from the specification
  const specKeywords = extractKeywordsFromSpecification(specification);
  
  // Process each rule
  for (const rule of rules) {
    // Check if any rule keywords match the specification keywords
    const matchingKeywords = rule.keywords.filter(keyword => 
      specKeywords.some(specKeyword => 
        specKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(specKeyword.toLowerCase())
      )
    );
    
    if (matchingKeywords.length > 0) {
      // Determine which section this rule is most relevant to
      const sectionId = determineMostRelevantSection(rule, specification.sections);
      
      // Create the relevant rule
      const relevantRule: RelevantRule = {
        id: rule.id,
        description: rule.description,
        relevance: `Matched keywords: ${matchingKeywords.join(', ')}`,
        sectionId
      };
      
      relevantRules.push(relevantRule);
    }
  }
  
  // Sort rules by priority
  return relevantRules.sort((a, b) => {
    const ruleA = rules.find(r => r.id === a.id);
    const ruleB = rules.find(r => r.id === b.id);
    
    if (!ruleA || !ruleB) return 0;
    
    return ruleA.priority - ruleB.priority;
  });
}

/**
 * Extracts keywords from a specification
 * 
 * @param specification - Specification document
 * @returns Array of keywords
 */
function extractKeywordsFromSpecification(specification: SpecificationDocument): string[] {
  const keywords: string[] = [];
  
  // Add keywords from the title
  keywords.push(...extractKeywordsFromText(specification.title));
  
  // Add keywords from each section
  for (const section of specification.sections) {
    keywords.push(...extractKeywordsFromText(section.content));
  }
  
  // Add keywords from metadata tags
  if (specification.metadata.tags) {
    keywords.push(...specification.metadata.tags);
  }
  
  // Remove duplicates
  return [...new Set(keywords)];
}

/**
 * Extracts keywords from text
 * 
 * @param text - Text to extract keywords from
 * @returns Array of keywords
 */
function extractKeywordsFromText(text: string): string[] {
  // Split the text into words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/) // Split on whitespace
    .filter(word => word.length > 3); // Filter out short words
  
  // Remove common words
  const commonWords = ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'will', 'have', 'been'];
  const filteredWords = words.filter(word => !commonWords.includes(word));
  
  // Get unique words
  return [...new Set(filteredWords)];
}

/**
 * Determines the most relevant section for a rule
 * 
 * @param rule - Project rule
 * @param sections - Specification sections
 * @returns ID of the most relevant section
 */
function determineMostRelevantSection(rule: ProjectRule, sections: SpecSection[]): string {
  // Map rule categories to section titles
  const categoryToSectionMap: Record<string, string[]> = {
    'code': ['Technical Design', 'Architecture', 'Components', 'Data Flow', 'API Design'],
    'documentation': ['Overview', 'Documentation'],
    'testing': ['Acceptance Criteria', 'Testing'],
    'security': ['Non-Functional Requirements', 'Security'],
    'performance': ['Non-Functional Requirements', 'Performance'],
    'accessibility': ['Non-Functional Requirements', 'Accessibility'],
    'ux': ['Functional Requirements', 'User Experience'],
    'general': ['Implementation Constraints']
  };
  
  // Get potential section titles for this rule category
  const potentialSectionTitles = categoryToSectionMap[rule.category] || categoryToSectionMap['general'];
  
  // Find matching sections
  const matchingSections = sections.filter(section => 
    potentialSectionTitles.some(title => 
      section.title.toLowerCase().includes(title.toLowerCase())
    )
  );
  
  // Return the first matching section ID, or the first section ID if no matches
  return matchingSections.length > 0 ? matchingSections[0].id : (sections[0]?.id || 'overview');
}

/**
 * Applies rules to a specification
 * 
 * @param specification - Specification document
 * @param relevantRules - Relevant rules
 * @returns Updated specification with rule suggestions
 */
export function applyRulesToSpecification(
  specification: SpecificationDocument,
  relevantRules: RelevantRule[]
): SpecificationDocument {
  // Clone the specification
  const updatedSpecification = { ...specification };
  
  // Group rules by section
  const rulesBySection: Record<string, RelevantRule[]> = {};
  
  for (const rule of relevantRules) {
    if (!rulesBySection[rule.sectionId]) {
      rulesBySection[rule.sectionId] = [];
    }
    rulesBySection[rule.sectionId].push(rule);
  }
  
  // Update each section with rule suggestions
  updatedSpecification.sections = specification.sections.map(section => {
    const sectionRules = rulesBySection[section.id] || [];
    
    if (sectionRules.length === 0) {
      return section;
    }
    
    // Clone the section
    const updatedSection = { ...section };
    
    // Add rule suggestions to the section content
    updatedSection.content = addRuleSuggestionsToContent(section.content, sectionRules);
    
    return updatedSection;
  });
  
  return updatedSpecification;
}

/**
 * Adds rule suggestions to section content
 * 
 * @param content - Section content
 * @param rules - Relevant rules for the section
 * @returns Updated content with rule suggestions
 */
function addRuleSuggestionsToContent(content: string, rules: RelevantRule[]): string {
  if (rules.length === 0) {
    return content;
  }
  
  // Add a rule suggestions section
  let updatedContent = content;
  
  // Check if the content already has a rule suggestions section
  if (!updatedContent.includes('### Rule Suggestions')) {
    updatedContent += '\n\n### Rule Suggestions\n\n';
    
    // Add each rule suggestion
    for (const rule of rules) {
      updatedContent += `- **${rule.id}**: ${rule.description} (${rule.relevance})\n`;
    }
  }
  
  return updatedContent;
}

/**
 * Generates rule suggestions based on a specification
 * 
 * @param specification - Specification document
 * @returns Promise that resolves with an array of rule suggestions
 */
export async function generateRuleSuggestions(
  specification: SpecificationDocument
): Promise<RelevantRule[]> {
  try {
    // Get all project rules
    const rules = await getAllProjectRules();
    
    // Determine relevant rules
    const relevantRules = determineRelevantRules(specification, rules);
    
    return relevantRules;
  } catch (error) {
    console.error(`Error generating rule suggestions: ${error}`);
    return [];
  }
}
