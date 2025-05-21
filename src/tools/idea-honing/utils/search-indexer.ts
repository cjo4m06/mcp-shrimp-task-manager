/**
 * Search Indexer for the Idea Honing Tool
 * 
 * This utility provides search and discovery functionality for specifications,
 * allowing users to find and browse existing specifications.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { SpecificationDocument, SpecMetadata } from '../models/specification.js';
import { loadSpecification, listSpecifications } from './file-system.js';

// Define the directory for the search index
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEARCH_INDEX_DIR = path.join(__dirname, '../../../../data/idea-honing/search-index');

/**
 * Search index entry structure
 */
interface SearchIndexEntry {
  /** Specification identifier */
  id: string;
  
  /** Specification title */
  title: string;
  
  /** Specification description (from overview section) */
  description: string;
  
  /** Project identifier */
  projectId: string;
  
  /** Feature identifier */
  featureId: string;
  
  /** Specification status */
  status: string;
  
  /** Specification authors */
  authors: string[];
  
  /** Specification tags */
  tags: string[];
  
  /** Creation timestamp */
  createdAt: string;
  
  /** Update timestamp */
  updatedAt: string;
  
  /** Section titles */
  sectionTitles: string[];
  
  /** Section content (for full-text search) */
  sectionContent: string;
  
  /** Keywords extracted from content */
  keywords: string[];
}

/**
 * Search result structure
 */
export interface SearchResult {
  /** Specification identifier */
  id: string;
  
  /** Specification title */
  title: string;
  
  /** Specification description */
  description: string;
  
  /** Project identifier */
  projectId: string;
  
  /** Feature identifier */
  featureId: string;
  
  /** Specification status */
  status: string;
  
  /** Relevance score (0-1) */
  relevance: number;
  
  /** Matching sections */
  matchingSections: string[];
  
  /** Matching keywords */
  matchingKeywords: string[];
}

/**
 * Search filter structure
 */
export interface SearchFilter {
  /** Project identifier filter */
  projectId?: string;
  
  /** Feature identifier filter */
  featureId?: string;
  
  /** Status filter */
  status?: string;
  
  /** Author filter */
  author?: string;
  
  /** Tag filter */
  tag?: string;
  
  /** Date range filter (start) */
  startDate?: string;
  
  /** Date range filter (end) */
  endDate?: string;
}

/**
 * Builds the search index for all specifications
 * 
 * @returns Promise that resolves when the index is built
 */
export async function buildSearchIndex(): Promise<void> {
  try {
    // Ensure the search index directory exists
    if (!fs.existsSync(SEARCH_INDEX_DIR)) {
      fs.mkdirSync(SEARCH_INDEX_DIR, { recursive: true });
    }
    
    // Get all specifications
    const specificationIds = await listSpecifications();
    
    // Process each specification
    for (const specId of specificationIds) {
      try {
        // Load the specification
        const specification = await loadSpecification(specId);
        
        // Index the specification
        await indexSpecification(specification);
      } catch (error) {
        console.error(`Error indexing specification ${specId}:`, error);
      }
    }
    
    console.log(`Search index built with ${specificationIds.length} specifications`);
  } catch (error) {
    throw new Error(`Failed to build search index: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Indexes a single specification
 * 
 * @param specification - Specification to index
 * @returns Promise that resolves when the specification is indexed
 */
export async function indexSpecification(specification: SpecificationDocument): Promise<void> {
  try {
    // Extract the overview section for the description
    const overviewSection = specification.sections.find(s => 
      s.title.toLowerCase().includes('overview')
    );
    
    // Extract keywords from the specification content
    const keywords = extractKeywords(
      specification.title + ' ' + 
      (overviewSection ? overviewSection.content : '') + ' ' + 
      specification.sections.map(s => s.title).join(' ')
    );
    
    // Create the search index entry
    const indexEntry: SearchIndexEntry = {
      id: specification.id,
      title: specification.title,
      description: overviewSection ? overviewSection.content.substring(0, 200) + '...' : '',
      projectId: specification.projectId,
      featureId: specification.featureId,
      status: specification.metadata.status,
      authors: specification.metadata.authors,
      tags: specification.metadata.tags,
      createdAt: specification.createdAt.toISOString(),
      updatedAt: specification.updatedAt.toISOString(),
      sectionTitles: specification.sections.map(s => s.title),
      sectionContent: specification.sections.map(s => s.content).join(' '),
      keywords
    };
    
    // Save the index entry
    const indexPath = path.join(SEARCH_INDEX_DIR, `${specification.id}.json`);
    await fs.promises.writeFile(indexPath, JSON.stringify(indexEntry, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to index specification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extracts keywords from text
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
  
  // Count word frequency
  const wordCounts = new Map<string, number>();
  for (const word of filteredWords) {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  }
  
  // Sort by frequency
  const sortedWords = [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // Return the top 10 keywords
  return sortedWords.slice(0, 10);
}

/**
 * Searches for specifications matching a query
 * 
 * @param query - Search query
 * @param filters - Optional search filters
 * @returns Promise that resolves with search results
 */
export async function searchSpecifications(query: string, filters?: SearchFilter): Promise<SearchResult[]> {
  try {
    // Ensure the search index directory exists
    if (!fs.existsSync(SEARCH_INDEX_DIR)) {
      return [];
    }
    
    // Get all index files
    const indexFiles = await fs.promises.readdir(SEARCH_INDEX_DIR);
    
    // Process each index file
    const results: SearchResult[] = [];
    
    for (const indexFile of indexFiles) {
      try {
        // Read the index file
        const indexPath = path.join(SEARCH_INDEX_DIR, indexFile);
        const indexContent = await fs.promises.readFile(indexPath, 'utf-8');
        const indexEntry: SearchIndexEntry = JSON.parse(indexContent);
        
        // Apply filters
        if (filters) {
          if (filters.projectId && indexEntry.projectId !== filters.projectId) {
            continue;
          }
          
          if (filters.featureId && indexEntry.featureId !== filters.featureId) {
            continue;
          }
          
          if (filters.status && indexEntry.status !== filters.status) {
            continue;
          }
          
          if (filters.author && !indexEntry.authors.includes(filters.author)) {
            continue;
          }
          
          if (filters.tag && !indexEntry.tags.includes(filters.tag)) {
            continue;
          }
          
          if (filters.startDate && new Date(indexEntry.createdAt) < new Date(filters.startDate)) {
            continue;
          }
          
          if (filters.endDate && new Date(indexEntry.createdAt) > new Date(filters.endDate)) {
            continue;
          }
        }
        
        // Skip if query is empty and no filters are applied
        if (!query && !filters) {
          continue;
        }
        
        // Calculate relevance score
        let relevance = 0;
        const matchingSections: string[] = [];
        const matchingKeywords: string[] = [];
        
        if (query) {
          // Normalize the query
          const normalizedQuery = query.toLowerCase();
          const queryWords = normalizedQuery.split(/\s+/);
          
          // Check title match
          if (indexEntry.title.toLowerCase().includes(normalizedQuery)) {
            relevance += 0.5;
          }
          
          // Check description match
          if (indexEntry.description.toLowerCase().includes(normalizedQuery)) {
            relevance += 0.3;
          }
          
          // Check section titles
          for (const sectionTitle of indexEntry.sectionTitles) {
            if (sectionTitle.toLowerCase().includes(normalizedQuery)) {
              relevance += 0.2;
              matchingSections.push(sectionTitle);
            }
          }
          
          // Check keyword match
          for (const keyword of indexEntry.keywords) {
            if (queryWords.includes(keyword)) {
              relevance += 0.1;
              matchingKeywords.push(keyword);
            }
          }
          
          // Check content match
          if (indexEntry.sectionContent.toLowerCase().includes(normalizedQuery)) {
            relevance += 0.1;
          }
        } else {
          // If no query but filters match, give a base relevance
          relevance = 0.5;
        }
        
        // Add to results if relevant
        if (relevance > 0) {
          results.push({
            id: indexEntry.id,
            title: indexEntry.title,
            description: indexEntry.description,
            projectId: indexEntry.projectId,
            featureId: indexEntry.featureId,
            status: indexEntry.status,
            relevance,
            matchingSections,
            matchingKeywords
          });
        }
      } catch (error) {
        console.error(`Error processing index file ${indexFile}:`, error);
      }
    }
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    return results;
  } catch (error) {
    throw new Error(`Failed to search specifications: ${error instanceof Error ? error.message : String(error)}`);
  }
}
