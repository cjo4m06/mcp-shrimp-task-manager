/**
 * Data models for workflow state management
 * 
 * These interfaces define the structure of workflow state and related data
 * for the Idea Honing Tool, supporting continuity when developers pause and resume work.
 */

import { CodebaseAnalysisResult } from './analysis-result.js';

/**
 * Tracks the state of the specification creation workflow
 * 
 * Workflow state enables developers to pause and resume work on a specification,
 * preserving context and progress across sessions.
 */
export interface WorkflowState {
  /** Associated specification identifier */
  specId: string;
  
  /** Current phase of the workflow */
  currentPhase: 'analysis' | 'drafting' | 'review' | 'planning';
  
  /** IDs of completed sections */
  completedSections: string[];
  
  /** Questions that need answers from the user */
  pendingQuestions: Question[];
  
  /** Analysis results if the analysis phase is completed (optional) */
  analysisResults?: CodebaseAnalysisResult;
  
  /** Timestamp of the last activity */
  lastActive: Date;
}

/**
 * Represents a question to be asked during the interactive process
 * 
 * Questions guide users through the specification creation process,
 * ensuring all necessary information is collected.
 */
export interface Question {
  /** Question identifier */
  id: string;
  
  /** Question text */
  text: string;
  
  /** Context explaining why the question is being asked */
  context: string;
  
  /** Section that the question relates to */
  targetSection: string;
  
  /** Whether the question has been answered */
  answered: boolean;
  
  /** The provided answer (optional) */
  answer?: string;
}
