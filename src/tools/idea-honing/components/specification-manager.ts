/**
 * Specification Manager for the Idea Honing Tool
 *
 * This component handles the creation, storage, and retrieval of specification documents.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  SpecificationDocument,
  SpecSection,
  SpecMetadata,
  ChangeRecord
} from '../models/specification.js';
import {
  saveSpecification,
  loadSpecification,
  createBackup,
  saveChangeRecord,
  listSpecifications
} from '../utils/file-system.js';
import {
  loadTemplate,
  createSectionsFromTemplate,
  renderTemplate
} from './template-engine.js';
import {
  buildSearchIndex,
  indexSpecification,
  searchSpecifications as searchSpecsInIndex,
  SearchFilter,
  SearchResult
} from '../utils/search-indexer.js';

/**
 * Creates a new specification document
 *
 * @param title - Title of the specification
 * @param description - Description of the feature or idea
 * @param author - Author of the specification
 * @param templateName - Name of the template to use (defaults to 'default-template')
 * @param projectId - Optional project identifier
 * @param featureId - Optional feature identifier
 * @param additionalData - Optional additional data for template rendering
 * @returns Promise that resolves with the created specification
 */
export async function createSpecification(
  title: string,
  description: string,
  author: string,
  templateName: string = 'default-template',
  projectId: string = 'default',
  featureId: string = '',
  additionalData: Record<string, any> = {}
): Promise<SpecificationDocument> {
  try {
    // Generate a unique ID for the specification
    const specId = uuidv4();

    // Set the current date
    const now = new Date();

    // Load the template
    const template = await loadTemplate(templateName);

    // Prepare data for template rendering
    const data = {
      title,
      description,
      author,
      currentDate: now.toISOString().split('T')[0],
      projectId,
      featureId,
      relatedFiles: '',
      ...additionalData
    };

    // Create sections from the template
    const sections = createSectionsFromTemplate(template, data);

    // Create the metadata
    const metadata: SpecMetadata = {
      authors: [author],
      status: 'draft',
      tags: [],
      relatedSpecs: []
    };

    // Create the specification document
    const specification: SpecificationDocument = {
      id: specId,
      title,
      sections,
      metadata,
      version: 1,
      changeHistory: [],
      projectId,
      featureId: featureId || specId,
      createdAt: now,
      updatedAt: now
    };

    // Create the initial change record
    const initialChange: ChangeRecord = {
      timestamp: now,
      author,
      description: 'Initial creation',
      sectionId: 'all',
      newContent: renderTemplate(template, data)
    };

    // Add the initial change to the history
    specification.changeHistory.push(initialChange);

    // Save the specification
    await saveSpecification(specification);

    // Save the change record
    await saveChangeRecord(specId, initialChange);

    // Index the specification for search
    try {
      await indexSpecification(specification);
    } catch (error) {
      console.error(`Failed to index specification: ${error}`);
      // Non-blocking error - continue even if indexing fails
    }

    return specification;
  } catch (error) {
    throw new Error(`Failed to create specification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves a specification document by ID
 *
 * @param specId - Specification identifier
 * @param projectId - Optional project identifier
 * @returns Promise that resolves with the retrieved specification
 */
export async function getSpecification(specId: string, projectId?: string): Promise<SpecificationDocument> {
  try {
    return await loadSpecification(specId, projectId);
  } catch (error) {
    throw new Error(`Failed to retrieve specification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Updates a specification document
 *
 * @param specId - Specification identifier
 * @param updates - Updates to apply to the specification
 * @param author - Author of the changes
 * @param changeDescription - Description of the changes
 * @returns Promise that resolves with the updated specification
 */
export async function updateSpecification(
  specId: string,
  updates: Partial<SpecificationDocument>,
  author: string,
  changeDescription: string
): Promise<SpecificationDocument> {
  try {
    // Load the existing specification
    const specification = await loadSpecification(specId, updates.projectId);

    // Create a backup of the current version
    await createBackup(specification);

    // Track changes to sections
    const sectionChanges: ChangeRecord[] = [];

    // Update the specification
    if (updates.title) {
      specification.title = updates.title;
    }

    if (updates.metadata) {
      // Merge metadata
      specification.metadata = {
        ...specification.metadata,
        ...updates.metadata
      };

      // Add the author if not already present
      if (!specification.metadata.authors.includes(author)) {
        specification.metadata.authors.push(author);
      }
    }

    if (updates.sections) {
      // Process each updated section
      for (const updatedSection of updates.sections) {
        // Find the existing section
        const existingSection = specification.sections.find(s => s.id === updatedSection.id);

        if (existingSection) {
          // Record the change if the content has changed
          if (existingSection.content !== updatedSection.content) {
            sectionChanges.push({
              timestamp: new Date(),
              author,
              description: changeDescription,
              sectionId: updatedSection.id,
              previousContent: existingSection.content,
              newContent: updatedSection.content
            });
          }

          // Update the section
          existingSection.title = updatedSection.title || existingSection.title;
          existingSection.content = updatedSection.content || existingSection.content;
          existingSection.stakeholder = updatedSection.stakeholder || existingSection.stakeholder;
          existingSection.order = updatedSection.order ?? existingSection.order;
        } else {
          // Add a new section
          specification.sections.push(updatedSection);

          // Record the addition
          sectionChanges.push({
            timestamp: new Date(),
            author,
            description: `Added section: ${updatedSection.title}`,
            sectionId: updatedSection.id,
            newContent: updatedSection.content
          });
        }
      }
    }

    // Increment the version
    specification.version += 1;

    // Update the timestamp
    specification.updatedAt = new Date();

    // Add the changes to the history
    specification.changeHistory.push(...sectionChanges);

    // Save the updated specification
    await saveSpecification(specification);

    // Save each change record
    for (const change of sectionChanges) {
      await saveChangeRecord(specId, change);
    }

    // Update the search index
    try {
      await indexSpecification(specification);
    } catch (error) {
      console.error(`Failed to update search index: ${error}`);
      // Non-blocking error - continue even if indexing fails
    }

    return specification;
  } catch (error) {
    throw new Error(`Failed to update specification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Lists all specifications, optionally filtered by project
 *
 * @param projectId - Optional project identifier to filter by
 * @returns Promise that resolves with an array of specification metadata
 */
export async function listAllSpecifications(projectId?: string): Promise<any[]> {
  try {
    return await listSpecifications(projectId);
  } catch (error) {
    throw new Error(`Failed to list specifications: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Searches for specifications by keyword and filters
 *
 * @param query - Search query
 * @param filters - Optional search filters
 * @returns Promise that resolves with an array of search results
 */
export async function searchSpecifications(query: string, filters?: SearchFilter): Promise<SearchResult[]> {
  try {
    // Use the search indexer to find matching specifications
    return await searchSpecsInIndex(query, filters);
  } catch (error) {
    console.error(`Error using search index: ${error}`);

    // Fallback to basic search if the index fails
    try {
      // Get all specifications
      const allSpecs = await listSpecifications(filters?.projectId);
      const results: SearchResult[] = [];

      // Process each specification
      for (const specId of allSpecs) {
        try {
          // Load the specification
          const spec = await loadSpecification(specId);

          // Apply filters
          if (filters) {
            if (filters.projectId && spec.projectId !== filters.projectId) {
              continue;
            }

            if (filters.featureId && spec.featureId !== filters.featureId) {
              continue;
            }

            if (filters.status && spec.metadata.status !== filters.status) {
              continue;
            }

            if (filters.author && !spec.metadata.authors.includes(filters.author)) {
              continue;
            }

            if (filters.tag && !spec.metadata.tags.includes(filters.tag)) {
              continue;
            }

            if (filters.startDate && new Date(spec.createdAt) < new Date(filters.startDate)) {
              continue;
            }

            if (filters.endDate && new Date(spec.createdAt) > new Date(filters.endDate)) {
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

            // Check title match
            if (spec.title.toLowerCase().includes(normalizedQuery)) {
              relevance += 0.5;
            }

            // Check section titles and content
            for (const section of spec.sections) {
              if (section.title.toLowerCase().includes(normalizedQuery)) {
                relevance += 0.2;
                matchingSections.push(section.title);
              }

              if (section.content.toLowerCase().includes(normalizedQuery)) {
                relevance += 0.1;
                if (!matchingSections.includes(section.title)) {
                  matchingSections.push(section.title);
                }
              }
            }

            // Check tags
            for (const tag of spec.metadata.tags) {
              if (tag.toLowerCase().includes(normalizedQuery)) {
                relevance += 0.1;
                matchingKeywords.push(tag);
              }
            }
          } else {
            // If no query but filters match, give a base relevance
            relevance = 0.5;
          }

          // Add to results if relevant
          if (relevance > 0) {
            // Find overview section for description
            const overviewSection = spec.sections.find(s =>
              s.title.toLowerCase().includes('overview')
            );

            results.push({
              id: spec.id,
              title: spec.title,
              description: overviewSection ?
                overviewSection.content.substring(0, 200) + '...' :
                'No description available',
              projectId: spec.projectId,
              featureId: spec.featureId,
              status: spec.metadata.status,
              relevance,
              matchingSections,
              matchingKeywords
            });
          }
        } catch (error) {
          console.error(`Error processing specification ${specId}:`, error);
        }
      }

      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);

      return results;
    } catch (fallbackError) {
      throw new Error(`Failed to search specifications: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
    }
  }
}

/**
 * Resolves conflicts between different versions of a specification
 *
 * @param specId - Specification identifier
 * @param conflictingVersions - Array of conflicting versions
 * @param resolutionStrategy - Strategy for resolving conflicts ('latest', 'merge', or 'manual')
 * @param manualResolution - Manual resolution data (required if strategy is 'manual')
 * @param author - Author of the resolution
 * @returns Promise that resolves with the resolved specification
 */
/**
 * Rebuilds the search index for all specifications
 *
 * @returns Promise that resolves when the index is rebuilt
 */
export async function rebuildSearchIndex(): Promise<void> {
  try {
    // Build the search index
    await buildSearchIndex();
    console.log('Search index rebuilt successfully');
  } catch (error) {
    throw new Error(`Failed to rebuild search index: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Resolves conflicts between different versions of a specification
 *
 * @param specId - Specification identifier
 * @param conflictingVersions - Array of conflicting versions
 * @param resolutionStrategy - Strategy for resolving conflicts ('latest', 'merge', or 'manual')
 * @param manualResolution - Manual resolution data (required if strategy is 'manual')
 * @param author - Author of the resolution
 * @returns Promise that resolves with the resolved specification
 */
export async function resolveConflicts(
  specId: string,
  conflictingVersions: SpecificationDocument[],
  resolutionStrategy: 'latest' | 'merge' | 'manual',
  manualResolution?: Partial<SpecificationDocument>,
  author: string = 'system'
): Promise<SpecificationDocument> {
  try {
    let resolvedSpec: SpecificationDocument;

    if (resolutionStrategy === 'latest') {
      // Use the version with the latest timestamp
      resolvedSpec = conflictingVersions.reduce((latest, current) => {
        return current.updatedAt > latest.updatedAt ? current : latest;
      }, conflictingVersions[0]);
    } else if (resolutionStrategy === 'merge') {
      // Start with the latest version
      const latestVersion = conflictingVersions.reduce((latest, current) => {
        return current.updatedAt > latest.updatedAt ? current : latest;
      }, conflictingVersions[0]);

      // Create a new specification based on the latest version
      resolvedSpec = { ...latestVersion };

      // Merge sections from all versions
      const mergedSections: Record<string, SpecSection> = {};

      // Process each version
      for (const version of conflictingVersions) {
        for (const section of version.sections) {
          // If this section doesn't exist yet, or this version is newer, use this section
          if (!mergedSections[section.id] || version.updatedAt > resolvedSpec.updatedAt) {
            mergedSections[section.id] = section;
          }
        }
      }

      // Convert the merged sections back to an array
      resolvedSpec.sections = Object.values(mergedSections);

      // Merge metadata
      const allAuthors = new Set<string>();
      const allTags = new Set<string>();
      const allRelatedSpecs = new Set<string>();

      for (const version of conflictingVersions) {
        version.metadata.authors.forEach(author => allAuthors.add(author));
        version.metadata.tags.forEach(tag => allTags.add(tag));
        version.metadata.relatedSpecs.forEach(spec => allRelatedSpecs.add(spec));
      }

      resolvedSpec.metadata = {
        authors: Array.from(allAuthors),
        status: resolvedSpec.metadata.status,
        tags: Array.from(allTags),
        relatedSpecs: Array.from(allRelatedSpecs)
      };
    } else if (resolutionStrategy === 'manual' && manualResolution) {
      // Use the manual resolution
      const latestVersion = conflictingVersions.reduce((latest, current) => {
        return current.updatedAt > latest.updatedAt ? current : latest;
      }, conflictingVersions[0]);

      // Create a new specification based on the latest version
      resolvedSpec = { ...latestVersion };

      // Apply manual resolution
      if (manualResolution.title) {
        resolvedSpec.title = manualResolution.title;
      }

      if (manualResolution.sections) {
        resolvedSpec.sections = manualResolution.sections;
      }

      if (manualResolution.metadata) {
        resolvedSpec.metadata = {
          ...resolvedSpec.metadata,
          ...manualResolution.metadata
        };
      }
    } else {
      throw new Error('Invalid resolution strategy or missing manual resolution data');
    }

    // Increment the version
    resolvedSpec.version += 1;

    // Update the timestamp
    resolvedSpec.updatedAt = new Date();

    // Add a change record for the conflict resolution
    const changeRecord: ChangeRecord = {
      timestamp: new Date(),
      author,
      description: `Resolved conflicts using ${resolutionStrategy} strategy`,
      sectionId: 'all',
      newContent: 'Conflict resolution'
    };

    resolvedSpec.changeHistory.push(changeRecord);

    // Save the resolved specification
    await saveSpecification(resolvedSpec);

    // Save the change record
    await saveChangeRecord(specId, changeRecord);

    return resolvedSpec;
  } catch (error) {
    throw new Error(`Failed to resolve conflicts: ${error instanceof Error ? error.message : String(error)}`);
  }
}
