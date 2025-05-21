/**
 * Template Engine for the Idea Honing Tool
 * 
 * This component manages specification templates and their rendering,
 * supporting both default and custom templates.
 */

import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SpecSection } from '../models/specification.js';

// Get the base directory for templates
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const CUSTOM_TEMPLATES_DIR = path.join(TEMPLATES_DIR, 'custom');

// Define the template interface
interface Template {
  name: string;
  content: string;
  sections: TemplateSection[];
}

// Define the template section interface
interface TemplateSection {
  id: string;
  title: string;
  placeholder: string;
  required: boolean;
  order: number;
  condition?: string;
}

/**
 * Loads a template by name
 * 
 * @param templateName - Name of the template to load (defaults to 'default-template')
 * @returns Promise that resolves with the loaded template
 */
export async function loadTemplate(templateName: string = 'default-template'): Promise<Template> {
  try {
    // Check if a custom template exists first
    const customTemplatePath = path.join(CUSTOM_TEMPLATES_DIR, `${templateName}.md`);
    const defaultTemplatePath = path.join(TEMPLATES_DIR, `${templateName}.md`);
    
    let templatePath: string;
    let templateExists = false;
    
    // Try custom template first
    try {
      await fsPromises.access(customTemplatePath);
      templatePath = customTemplatePath;
      templateExists = true;
    } catch {
      // If custom template doesn't exist, try default template
      try {
        await fsPromises.access(defaultTemplatePath);
        templatePath = defaultTemplatePath;
        templateExists = true;
      } catch {
        // If neither exists, use the default-template.md
        templatePath = path.join(TEMPLATES_DIR, 'default-template.md');
        
        // Check if even the default template exists
        try {
          await fsPromises.access(templatePath);
        } catch {
          throw new Error(`Template not found: ${templateName}`);
        }
      }
    }
    
    // Load the template content
    const content = await fsPromises.readFile(templatePath, 'utf-8');
    
    // Parse the template to extract sections
    const sections = parseTemplateContent(content);
    
    return {
      name: templateName,
      content,
      sections,
    };
  } catch (error) {
    throw new Error(`Failed to load template: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Lists all available templates
 * 
 * @returns Promise that resolves with an array of template names
 */
export async function listTemplates(): Promise<string[]> {
  try {
    const templates = new Set<string>();
    
    // Get default templates
    try {
      const defaultTemplates = await fsPromises.readdir(TEMPLATES_DIR);
      defaultTemplates
        .filter(file => file.endsWith('.md') && !file.startsWith('.'))
        .forEach(file => templates.add(file.replace('.md', '')));
    } catch (error) {
      console.error(`Error reading default templates: ${error}`);
    }
    
    // Get custom templates
    try {
      const customTemplates = await fsPromises.readdir(CUSTOM_TEMPLATES_DIR);
      customTemplates
        .filter(file => file.endsWith('.md') && !file.startsWith('.'))
        .forEach(file => templates.add(file.replace('.md', '')));
    } catch (error) {
      console.error(`Error reading custom templates: ${error}`);
    }
    
    return Array.from(templates);
  } catch (error) {
    throw new Error(`Failed to list templates: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Validates a template structure
 * 
 * @param template - Template to validate
 * @returns True if the template is valid, false otherwise
 */
export function validateTemplate(template: Template): boolean {
  // Check if the template has a name
  if (!template.name) return false;
  
  // Check if the template has content
  if (!template.content) return false;
  
  // Check if the template has sections
  if (!template.sections || template.sections.length === 0) return false;
  
  // Check if all required sections have titles and placeholders
  for (const section of template.sections) {
    if (!section.id || !section.title) return false;
    if (section.required && !section.placeholder) return false;
  }
  
  return true;
}

/**
 * Renders a template with provided data
 * 
 * @param template - Template to render
 * @param data - Data to use for rendering
 * @returns Rendered content
 */
export function renderTemplate(template: Template, data: Record<string, any>): string {
  let renderedContent = template.content;
  
  // Replace placeholders in the content
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    renderedContent = renderedContent.replace(new RegExp(placeholder, 'g'), String(value));
  }
  
  // Handle conditional sections
  for (const section of template.sections) {
    if (section.condition) {
      const conditionMet = evaluateCondition(section.condition, data);
      
      if (!conditionMet) {
        // Remove the section if the condition is not met
        const sectionRegex = new RegExp(`## ${section.title}[\\s\\S]*?(?=## |$)`, 'g');
        renderedContent = renderedContent.replace(sectionRegex, '');
      }
    }
  }
  
  return renderedContent;
}

/**
 * Creates specification sections from a template
 * 
 * @param template - Template to use
 * @param data - Data to use for rendering
 * @returns Array of specification sections
 */
export function createSectionsFromTemplate(template: Template, data: Record<string, any>): SpecSection[] {
  const sections: SpecSection[] = [];
  
  // Process each template section
  for (const templateSection of template.sections) {
    // Skip sections with unmet conditions
    if (templateSection.condition && !evaluateCondition(templateSection.condition, data)) {
      continue;
    }
    
    // Create a new specification section
    const section: SpecSection = {
      id: templateSection.id,
      title: templateSection.title,
      content: templateSection.placeholder || '',
      order: templateSection.order,
    };
    
    // Replace placeholders in the content
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{${key}}`;
      section.content = section.content.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    sections.push(section);
  }
  
  return sections;
}

/**
 * Parses template content to extract sections
 * 
 * @param content - Template content
 * @returns Array of template sections
 */
function parseTemplateContent(content: string): TemplateSection[] {
  const sections: TemplateSection[] = [];
  const lines = content.split('\n');
  
  let currentSection: Partial<TemplateSection> | null = null;
  let currentContent = '';
  let sectionIndex = 0;
  
  for (const line of lines) {
    // Check for section headers
    if (line.startsWith('## ')) {
      // Save the previous section if there is one
      if (currentSection && currentSection.title) {
        currentSection.placeholder = currentContent.trim();
        currentSection.order = sectionIndex++;
        sections.push(currentSection as TemplateSection);
      }
      
      // Start a new section
      const title = line.substring(3).trim();
      currentSection = {
        id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title,
        placeholder: '',
        required: !title.includes('(Optional)'),
      };
      currentContent = '';
      
      // Check for conditional sections
      const conditionMatch = title.match(/\{if:\s*([^}]+)\}/);
      if (conditionMatch) {
        currentSection.condition = conditionMatch[1].trim();
        currentSection.title = title.replace(/\{if:\s*([^}]+)\}/, '').trim();
      }
    } else if (currentSection) {
      // Add the line to the current section content
      currentContent += line + '\n';
    }
  }
  
  // Save the last section
  if (currentSection && currentSection.title) {
    currentSection.placeholder = currentContent.trim();
    currentSection.order = sectionIndex++;
    sections.push(currentSection as TemplateSection);
  }
  
  return sections;
}

/**
 * Evaluates a condition expression
 * 
 * @param condition - Condition expression
 * @param data - Data to use for evaluation
 * @returns True if the condition is met, false otherwise
 */
function evaluateCondition(condition: string, data: Record<string, any>): boolean {
  try {
    // Simple condition evaluation - this would be enhanced in a real implementation
    // Format: "key == value" or "key != value" or "key"
    
    if (condition.includes('==')) {
      const [key, value] = condition.split('==').map(part => part.trim());
      return data[key] === value;
    } else if (condition.includes('!=')) {
      const [key, value] = condition.split('!=').map(part => part.trim());
      return data[key] !== value;
    } else {
      // Check if the key exists and has a truthy value
      return Boolean(data[condition.trim()]);
    }
  } catch (error) {
    console.error(`Error evaluating condition "${condition}": ${error}`);
    return false;
  }
}
