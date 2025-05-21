/**
 * File system utilities for the Idea Honing Tool
 * 
 * These utilities handle reading, writing, and managing specification files and related data.
 */

import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SpecificationDocument, ChangeRecord } from '../models/specification.js';

// Get the base directory for storing specifications
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, 'data');
const SPECS_DIR = path.join(DATA_DIR, 'specifications');

/**
 * Creates the necessary directory structure for storing specifications
 * 
 * @param projectId - Optional project identifier for project-specific directories
 * @returns Promise that resolves when directories are created
 */
export async function createDirectoryStructure(projectId?: string): Promise<void> {
  try {
    // Create the main specifications directory if it doesn't exist
    await fsPromises.mkdir(SPECS_DIR, { recursive: true });
    
    // Create project-specific directory if a project ID is provided
    if (projectId) {
      const projectDir = path.join(SPECS_DIR, projectId);
      await fsPromises.mkdir(projectDir, { recursive: true });
    }
    
    // Create directories for backups and metadata
    await fsPromises.mkdir(path.join(SPECS_DIR, 'backups'), { recursive: true });
    await fsPromises.mkdir(path.join(SPECS_DIR, 'metadata'), { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory structure: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets the path for a specification file
 * 
 * @param specId - Specification identifier
 * @param projectId - Optional project identifier
 * @returns Path to the specification file
 */
export function getSpecificationPath(specId: string, projectId?: string): string {
  if (projectId) {
    return path.join(SPECS_DIR, projectId, `${specId}.md`);
  }
  return path.join(SPECS_DIR, `${specId}.md`);
}

/**
 * Gets the path for a specification metadata file
 * 
 * @param specId - Specification identifier
 * @returns Path to the metadata file
 */
export function getMetadataPath(specId: string): string {
  return path.join(SPECS_DIR, 'metadata', `${specId}.json`);
}

/**
 * Gets the path for a specification backup file
 * 
 * @param specId - Specification identifier
 * @param version - Version number
 * @returns Path to the backup file
 */
export function getBackupPath(specId: string, version: number): string {
  return path.join(SPECS_DIR, 'backups', `${specId}_v${version}.md`);
}

/**
 * Saves a specification document to the file system
 * 
 * @param spec - Specification document to save
 * @returns Promise that resolves when the specification is saved
 */
export async function saveSpecification(spec: SpecificationDocument): Promise<void> {
  try {
    // Ensure the directory structure exists
    await createDirectoryStructure(spec.projectId);
    
    // Generate the markdown content from the specification
    const markdownContent = generateMarkdownFromSpec(spec);
    
    // Save the markdown content to the specification file
    const specPath = getSpecificationPath(spec.id, spec.projectId);
    await fsPromises.writeFile(specPath, markdownContent, 'utf-8');
    
    // Save the metadata to a separate JSON file
    const metadataPath = getMetadataPath(spec.id);
    const metadata = {
      id: spec.id,
      title: spec.title,
      metadata: spec.metadata,
      version: spec.version,
      projectId: spec.projectId,
      featureId: spec.featureId,
      createdAt: spec.createdAt,
      updatedAt: spec.updatedAt,
    };
    await fsPromises.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    
    // Create a backup of this version
    await createBackup(spec);
  } catch (error) {
    throw new Error(`Failed to save specification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Loads a specification document from the file system
 * 
 * @param specId - Specification identifier
 * @param projectId - Optional project identifier
 * @returns Promise that resolves with the loaded specification
 */
export async function loadSpecification(specId: string, projectId?: string): Promise<SpecificationDocument> {
  try {
    // Load the metadata file
    const metadataPath = getMetadataPath(specId);
    const metadataContent = await fsPromises.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);
    
    // Load the specification file
    const specPath = getSpecificationPath(specId, projectId);
    const markdownContent = await fsPromises.readFile(specPath, 'utf-8');
    
    // Parse the markdown content into sections
    const sections = parseMarkdownToSections(markdownContent);
    
    // Load the change history
    const changeHistory = await loadChangeHistory(specId);
    
    // Construct and return the complete specification document
    return {
      id: metadata.id,
      title: metadata.title,
      sections,
      metadata: metadata.metadata,
      version: metadata.version,
      changeHistory,
      projectId: metadata.projectId,
      featureId: metadata.featureId,
      createdAt: new Date(metadata.createdAt),
      updatedAt: new Date(metadata.updatedAt),
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Specification not found: ${specId}`);
    }
    throw new Error(`Failed to load specification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a backup of a specification
 * 
 * @param spec - Specification document to backup
 * @returns Promise that resolves when the backup is created
 */
export async function createBackup(spec: SpecificationDocument): Promise<void> {
  try {
    // Generate the markdown content from the specification
    const markdownContent = generateMarkdownFromSpec(spec);
    
    // Save the backup file
    const backupPath = getBackupPath(spec.id, spec.version);
    await fsPromises.writeFile(backupPath, markdownContent, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Loads the change history for a specification
 * 
 * @param specId - Specification identifier
 * @returns Promise that resolves with the change history
 */
export async function loadChangeHistory(specId: string): Promise<ChangeRecord[]> {
  try {
    const historyPath = path.join(SPECS_DIR, 'metadata', `${specId}_history.json`);
    
    // Check if the history file exists
    try {
      await fsPromises.access(historyPath);
    } catch {
      // If the file doesn't exist, return an empty history
      return [];
    }
    
    // Load and parse the history file
    const historyContent = await fsPromises.readFile(historyPath, 'utf-8');
    const history = JSON.parse(historyContent);
    
    // Convert string timestamps to Date objects
    return history.map((record: any) => ({
      ...record,
      timestamp: new Date(record.timestamp),
    }));
  } catch (error) {
    throw new Error(`Failed to load change history: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Saves a change record to the change history
 * 
 * @param specId - Specification identifier
 * @param changeRecord - Change record to save
 * @returns Promise that resolves when the change record is saved
 */
export async function saveChangeRecord(specId: string, changeRecord: ChangeRecord): Promise<void> {
  try {
    const historyPath = path.join(SPECS_DIR, 'metadata', `${specId}_history.json`);
    
    // Load existing history or create a new one
    let history: ChangeRecord[] = [];
    try {
      const historyContent = await fsPromises.readFile(historyPath, 'utf-8');
      history = JSON.parse(historyContent);
    } catch (error) {
      // If the file doesn't exist or can't be parsed, start with an empty history
      if (!(error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT')) {
        console.error(`Error reading change history: ${error}`);
      }
    }
    
    // Add the new change record
    history.push(changeRecord);
    
    // Save the updated history
    await fsPromises.writeFile(historyPath, JSON.stringify(history, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save change record: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generates markdown content from a specification document
 * 
 * @param spec - Specification document
 * @returns Markdown content
 */
function generateMarkdownFromSpec(spec: SpecificationDocument): string {
  // Start with the title
  let markdown = `# ${spec.title}\n\n`;
  
  // Sort sections by order
  const sortedSections = [...spec.sections].sort((a, b) => a.order - b.order);
  
  // Add each section
  for (const section of sortedSections) {
    markdown += `## ${section.title}\n\n${section.content}\n\n`;
  }
  
  // Add metadata at the end
  markdown += `<!-- Metadata: ${JSON.stringify({
    id: spec.id,
    version: spec.version,
    updatedAt: spec.updatedAt,
  })} -->\n`;
  
  return markdown;
}

/**
 * Parses markdown content into specification sections
 * 
 * @param markdown - Markdown content
 * @returns Array of specification sections
 */
function parseMarkdownToSections(markdown: string): any[] {
  // Simple parsing logic - this would be enhanced in a real implementation
  const sections = [];
  const lines = markdown.split('\n');
  
  let currentSection: any = null;
  let currentContent = '';
  
  for (const line of lines) {
    // Skip metadata line
    if (line.startsWith('<!-- Metadata:')) continue;
    
    // Check for section headers
    if (line.startsWith('## ')) {
      // Save the previous section if there is one
      if (currentSection) {
        currentSection.content = currentContent.trim();
        sections.push(currentSection);
      }
      
      // Start a new section
      const title = line.substring(3).trim();
      currentSection = {
        id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title,
        content: '',
        order: sections.length,
      };
      currentContent = '';
    } else if (currentSection) {
      // Add the line to the current section content
      currentContent += line + '\n';
    }
  }
  
  // Save the last section
  if (currentSection) {
    currentSection.content = currentContent.trim();
    sections.push(currentSection);
  }
  
  return sections;
}

/**
 * Lists all specifications in the system
 * 
 * @param projectId - Optional project identifier to filter by
 * @returns Promise that resolves with an array of specification metadata
 */
export async function listSpecifications(projectId?: string): Promise<any[]> {
  try {
    const metadataDir = path.join(SPECS_DIR, 'metadata');
    
    // Ensure the metadata directory exists
    try {
      await fsPromises.access(metadataDir);
    } catch {
      // If the directory doesn't exist, return an empty array
      return [];
    }
    
    // Get all metadata files
    const files = await fsPromises.readdir(metadataDir);
    const metadataFiles = files.filter(file => file.endsWith('.json') && !file.includes('_history'));
    
    // Load metadata for each specification
    const specifications = [];
    for (const file of metadataFiles) {
      try {
        const metadataPath = path.join(metadataDir, file);
        const metadataContent = await fsPromises.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);
        
        // Filter by project ID if provided
        if (!projectId || metadata.projectId === projectId) {
          specifications.push(metadata);
        }
      } catch (error) {
        console.error(`Error loading metadata from ${file}: ${error}`);
      }
    }
    
    return specifications;
  } catch (error) {
    throw new Error(`Failed to list specifications: ${error instanceof Error ? error.message : String(error)}`);
  }
}
