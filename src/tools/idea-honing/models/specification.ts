/**
 * Data models for specification documents
 * 
 * These interfaces define the structure of specification documents and related data
 * for the Idea Honing Tool.
 */

/**
 * Represents a complete specification document
 * 
 * A specification document contains all the information needed to describe a feature
 * or idea, including its requirements, design, and implementation details.
 */
export interface SpecificationDocument {
  /** Unique identifier for the specification */
  id: string;
  
  /** Title of the feature or idea */
  title: string;
  
  /** Content sections of the specification */
  sections: SpecSection[];
  
  /** Metadata for filtering and search */
  metadata: SpecMetadata;
  
  /** Version counter for tracking changes */
  version: number;
  
  /** History of changes made to the specification */
  changeHistory: ChangeRecord[];
  
  /** Associated project identifier */
  projectId: string;
  
  /** Associated feature identifier */
  featureId: string;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Represents a section within a specification document
 * 
 * Specifications are divided into sections for better organization and to allow
 * different stakeholders to focus on relevant parts.
 */
export interface SpecSection {
  /** Section identifier */
  id: string;
  
  /** Section title */
  title: string;
  
  /** Markdown content of the section */
  content: string;
  
  /** Optional stakeholder association */
  stakeholder?: string;
  
  /** Display order for the section */
  order: number;
}

/**
 * Contains metadata about a specification document
 * 
 * Metadata is used for filtering, searching, and organizing specifications.
 */
export interface SpecMetadata {
  /** Contributing authors */
  authors: string[];
  
  /** Current status of the specification */
  status: 'draft' | 'review' | 'approved' | 'implemented';
  
  /** Custom tags for categorization */
  tags: string[];
  
  /** IDs of related specifications */
  relatedSpecs: string[];
}

/**
 * Tracks a change made to a specification document
 * 
 * Change records provide a history of modifications to the specification,
 * allowing for tracking and auditing.
 */
export interface ChangeRecord {
  /** When the change occurred */
  timestamp: Date;
  
  /** Who made the change */
  author: string;
  
  /** Description of what changed */
  description: string;
  
  /** Which section was changed */
  sectionId: string;
  
  /** Content before the change (optional) */
  previousContent?: string;
  
  /** Content after the change */
  newContent: string;
}
