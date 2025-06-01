/**
 * Data models for codebase analysis results
 * 
 * These interfaces define the structure of codebase analysis results and related data
 * for the Idea Honing Tool.
 */

/**
 * Contains the results of codebase analysis
 * 
 * Codebase analysis identifies components, dependencies, and other elements
 * relevant to a specification.
 */
export interface CodebaseAnalysisResult {
  /** Components affected by the proposed changes */
  affectedComponents: Component[];
  
  /** Files likely to be modified */
  impactedFiles: FileImpact[];
  
  /** Key dependencies between components and files */
  dependencies: Dependency[];
  
  /** Project rules applicable to the specification */
  projectRules: RelevantRule[];
  
  /** Questions to prompt the user during specification creation */
  suggestedQuestions: string[];
  
  /** Confidence score for the analysis (0-1) */
  analysisConfidence: number;
}

/**
 * Represents a component in the codebase
 * 
 * A component is a logical grouping of files that serve a common purpose,
 * such as a module, service, or feature.
 */
export interface Component {
  /** Component name */
  name: string;
  
  /** Path in the codebase */
  path: string;
  
  /** Component description */
  description: string;
  
  /** Expected impact level of the proposed changes */
  impactLevel: 'high' | 'medium' | 'low';
}

/**
 * Represents a file that may be impacted by changes
 * 
 * File impacts identify specific files that may need to be modified
 * as part of implementing the specification.
 */
export interface FileImpact {
  /** File path */
  path: string;
  
  /** Reason why the file is impacted */
  reason: string;
  
  /** Potential changes needed to the file (optional) */
  suggestedChanges?: string;
}

/**
 * Represents a dependency between components or files
 * 
 * Dependencies identify relationships between different parts of the codebase,
 * which is important for understanding the impact of changes.
 */
export interface Dependency {
  /** Source component or file */
  source: string;
  
  /** Target component or file */
  target: string;
  
  /** Type of relationship */
  type: 'imports' | 'extends' | 'uses' | 'data';
  
  /** Description of the dependency */
  description: string;
}

/**
 * Represents a project rule relevant to the specification
 * 
 * Relevant rules are project standards or guidelines that should be
 * considered when implementing the specification.
 */
export interface RelevantRule {
  /** Rule identifier */
  id: string;
  
  /** Rule description */
  description: string;
  
  /** Why the rule is relevant to this specification */
  relevance: string;
  
  /** Target section in the specification where the rule applies */
  sectionId: string;
}
