/**
 * Workflow State Manager for the Idea Honing Tool
 * 
 * This component handles the persistence and management of workflow state,
 * enabling continuity across sessions and tracking progress.
 */

import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { WorkflowState, Question } from '../models/workflow-state.js';
import { CodebaseAnalysisResult } from '../models/analysis-result.js';

// Get the base directory for workflow state
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, 'data');
const WORKFLOW_STATE_DIR = path.join(DATA_DIR, 'workflow-state');

/**
 * Session information
 */
interface SessionInfo {
  /** Session identifier */
  id: string;
  
  /** User identifier */
  userId: string;
  
  /** Session start timestamp */
  startTime: string;
  
  /** Session end timestamp (if completed) */
  endTime?: string;
  
  /** Associated specification ID */
  specId: string;
  
  /** Session progress (0-100) */
  progress: number;
  
  /** Session metadata */
  metadata: Record<string, any>;
}

/**
 * Creates or updates a workflow state
 * 
 * @param state - Workflow state to save
 * @returns Promise that resolves with the saved workflow state
 */
export async function saveWorkflowState(state: WorkflowState): Promise<WorkflowState> {
  try {
    // Ensure the workflow state directory exists
    await ensureWorkflowStateDirectory();
    
    // Update the last active timestamp
    state.lastActive = new Date();
    
    // Save the workflow state
    const statePath = path.join(WORKFLOW_STATE_DIR, `${state.specId}.json`);
    await fsPromises.writeFile(statePath, JSON.stringify(state, null, 2), 'utf-8');
    
    return state;
  } catch (error) {
    throw new Error(`Failed to save workflow state: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Loads a workflow state by specification ID
 * 
 * @param specId - Specification identifier
 * @returns Promise that resolves with the loaded workflow state, or null if not found
 */
export async function loadWorkflowState(specId: string): Promise<WorkflowState | null> {
  try {
    // Ensure the workflow state directory exists
    await ensureWorkflowStateDirectory();
    
    // Check if the workflow state file exists
    const statePath = path.join(WORKFLOW_STATE_DIR, `${specId}.json`);
    
    try {
      await fsPromises.access(statePath);
    } catch {
      return null;
    }
    
    // Load and parse the workflow state file
    const stateContent = await fsPromises.readFile(statePath, 'utf-8');
    const state = JSON.parse(stateContent);
    
    // Convert string dates to Date objects
    state.lastActive = new Date(state.lastActive);
    
    return state;
  } catch (error) {
    throw new Error(`Failed to load workflow state: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a new workflow state
 * 
 * @param specId - Specification identifier
 * @param initialPhase - Initial workflow phase
 * @param analysisResults - Optional analysis results
 * @returns Promise that resolves with the created workflow state
 */
export async function createWorkflowState(
  specId: string,
  initialPhase: 'analysis' | 'drafting' | 'review' | 'planning' = 'analysis',
  analysisResults?: CodebaseAnalysisResult
): Promise<WorkflowState> {
  try {
    // Create the workflow state
    const state: WorkflowState = {
      specId,
      currentPhase: initialPhase,
      completedSections: [],
      pendingQuestions: [],
      analysisResults,
      lastActive: new Date()
    };
    
    // Save the workflow state
    return await saveWorkflowState(state);
  } catch (error) {
    throw new Error(`Failed to create workflow state: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Updates the current phase of a workflow state
 * 
 * @param specId - Specification identifier
 * @param phase - New workflow phase
 * @returns Promise that resolves with the updated workflow state
 */
export async function updateWorkflowPhase(
  specId: string,
  phase: 'analysis' | 'drafting' | 'review' | 'planning'
): Promise<WorkflowState> {
  try {
    // Load the existing workflow state
    const state = await loadWorkflowState(specId);
    
    if (!state) {
      throw new Error(`Workflow state not found for specification: ${specId}`);
    }
    
    // Update the phase
    state.currentPhase = phase;
    
    // Save the updated workflow state
    return await saveWorkflowState(state);
  } catch (error) {
    throw new Error(`Failed to update workflow phase: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Marks a section as completed in a workflow state
 * 
 * @param specId - Specification identifier
 * @param sectionId - Section identifier
 * @returns Promise that resolves with the updated workflow state
 */
export async function markSectionCompleted(
  specId: string,
  sectionId: string
): Promise<WorkflowState> {
  try {
    // Load the existing workflow state
    const state = await loadWorkflowState(specId);
    
    if (!state) {
      throw new Error(`Workflow state not found for specification: ${specId}`);
    }
    
    // Add the section to the completed sections if not already present
    if (!state.completedSections.includes(sectionId)) {
      state.completedSections.push(sectionId);
    }
    
    // Save the updated workflow state
    return await saveWorkflowState(state);
  } catch (error) {
    throw new Error(`Failed to mark section as completed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Adds a question to a workflow state
 * 
 * @param specId - Specification identifier
 * @param question - Question to add
 * @returns Promise that resolves with the updated workflow state
 */
export async function addQuestion(
  specId: string,
  question: Omit<Question, 'id' | 'answered'>
): Promise<WorkflowState> {
  try {
    // Load the existing workflow state
    const state = await loadWorkflowState(specId);
    
    if (!state) {
      throw new Error(`Workflow state not found for specification: ${specId}`);
    }
    
    // Create the question with a unique ID
    const newQuestion: Question = {
      id: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text: question.text,
      context: question.context,
      targetSection: question.targetSection,
      answered: false
    };
    
    // Add the question to the pending questions
    state.pendingQuestions.push(newQuestion);
    
    // Save the updated workflow state
    return await saveWorkflowState(state);
  } catch (error) {
    throw new Error(`Failed to add question: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Answers a question in a workflow state
 * 
 * @param specId - Specification identifier
 * @param questionId - Question identifier
 * @param answer - Answer to the question
 * @returns Promise that resolves with the updated workflow state
 */
export async function answerQuestion(
  specId: string,
  questionId: string,
  answer: string
): Promise<WorkflowState> {
  try {
    // Load the existing workflow state
    const state = await loadWorkflowState(specId);
    
    if (!state) {
      throw new Error(`Workflow state not found for specification: ${specId}`);
    }
    
    // Find the question
    const questionIndex = state.pendingQuestions.findIndex(q => q.id === questionId);
    
    if (questionIndex === -1) {
      throw new Error(`Question not found: ${questionId}`);
    }
    
    // Update the question
    state.pendingQuestions[questionIndex].answered = true;
    state.pendingQuestions[questionIndex].answer = answer;
    
    // Save the updated workflow state
    return await saveWorkflowState(state);
  } catch (error) {
    throw new Error(`Failed to answer question: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a new session for a specification
 * 
 * @param specId - Specification identifier
 * @param userId - User identifier
 * @param metadata - Session metadata
 * @returns Promise that resolves with the created session information
 */
export async function createSession(
  specId: string,
  userId: string,
  metadata: Record<string, any> = {}
): Promise<SessionInfo> {
  try {
    // Ensure the workflow state directory exists
    await ensureWorkflowStateDirectory();
    
    // Create the sessions directory if it doesn't exist
    const sessionsDir = path.join(WORKFLOW_STATE_DIR, 'sessions');
    await fsPromises.mkdir(sessionsDir, { recursive: true });
    
    // Generate a session ID
    const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create the session
    const session: SessionInfo = {
      id: sessionId,
      userId,
      startTime: new Date().toISOString(),
      specId,
      progress: 0,
      metadata
    };
    
    // Save the session
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    await fsPromises.writeFile(sessionPath, JSON.stringify(session, null, 2), 'utf-8');
    
    return session;
  } catch (error) {
    throw new Error(`Failed to create session: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Updates a session's progress
 * 
 * @param sessionId - Session identifier
 * @param progress - Session progress (0-100)
 * @returns Promise that resolves with the updated session information
 */
export async function updateSessionProgress(
  sessionId: string,
  progress: number
): Promise<SessionInfo> {
  try {
    // Ensure the workflow state directory exists
    await ensureWorkflowStateDirectory();
    
    // Create the sessions directory if it doesn't exist
    const sessionsDir = path.join(WORKFLOW_STATE_DIR, 'sessions');
    await fsPromises.mkdir(sessionsDir, { recursive: true });
    
    // Load the session
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    
    try {
      await fsPromises.access(sessionPath);
    } catch {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    const sessionContent = await fsPromises.readFile(sessionPath, 'utf-8');
    const session = JSON.parse(sessionContent);
    
    // Update the progress
    session.progress = Math.max(0, Math.min(100, progress));
    
    // Save the updated session
    await fsPromises.writeFile(sessionPath, JSON.stringify(session, null, 2), 'utf-8');
    
    return session;
  } catch (error) {
    throw new Error(`Failed to update session progress: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Ends a session
 * 
 * @param sessionId - Session identifier
 * @returns Promise that resolves with the ended session information
 */
export async function endSession(sessionId: string): Promise<SessionInfo> {
  try {
    // Ensure the workflow state directory exists
    await ensureWorkflowStateDirectory();
    
    // Create the sessions directory if it doesn't exist
    const sessionsDir = path.join(WORKFLOW_STATE_DIR, 'sessions');
    await fsPromises.mkdir(sessionsDir, { recursive: true });
    
    // Load the session
    const sessionPath = path.join(sessionsDir, `${sessionId}.json`);
    
    try {
      await fsPromises.access(sessionPath);
    } catch {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    const sessionContent = await fsPromises.readFile(sessionPath, 'utf-8');
    const session = JSON.parse(sessionContent);
    
    // Update the end time
    session.endTime = new Date().toISOString();
    
    // Save the updated session
    await fsPromises.writeFile(sessionPath, JSON.stringify(session, null, 2), 'utf-8');
    
    return session;
  } catch (error) {
    throw new Error(`Failed to end session: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets sessions for a specification
 * 
 * @param specId - Specification identifier
 * @returns Promise that resolves with an array of session information
 */
export async function getSessionsForSpecification(specId: string): Promise<SessionInfo[]> {
  try {
    // Ensure the workflow state directory exists
    await ensureWorkflowStateDirectory();
    
    // Create the sessions directory if it doesn't exist
    const sessionsDir = path.join(WORKFLOW_STATE_DIR, 'sessions');
    await fsPromises.mkdir(sessionsDir, { recursive: true });
    
    // Get all session files
    const sessionFiles = await fsPromises.readdir(sessionsDir);
    
    // Filter session files to only include .json files
    const jsonSessionFiles = sessionFiles.filter(file => file.endsWith('.json'));
    
    // Read and filter sessions
    const sessions: SessionInfo[] = [];
    
    for (const file of jsonSessionFiles) {
      try {
        const sessionPath = path.join(sessionsDir, file);
        const sessionContent = await fsPromises.readFile(sessionPath, 'utf-8');
        const session = JSON.parse(sessionContent);
        
        // Check if the session is for the specified specification
        if (session.specId === specId) {
          sessions.push(session);
        }
      } catch (error) {
        console.error(`Error reading session file ${file}: ${error}`);
      }
    }
    
    // Sort sessions by start time (newest first)
    return sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  } catch (error) {
    throw new Error(`Failed to get sessions for specification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Calculates the overall progress for a specification
 * 
 * @param specId - Specification identifier
 * @returns Promise that resolves with the progress percentage (0-100)
 */
export async function calculateOverallProgress(specId: string): Promise<number> {
  try {
    // Load the workflow state
    const state = await loadWorkflowState(specId);
    
    if (!state) {
      return 0;
    }
    
    // Calculate progress based on completed sections and answered questions
    let progress = 0;
    
    // Phase progress (25% per phase)
    const phaseProgress = {
      'analysis': 25,
      'drafting': 50,
      'review': 75,
      'planning': 100
    };
    
    progress = phaseProgress[state.currentPhase] || 0;
    
    // Adjust progress based on pending questions
    if (state.pendingQuestions.length > 0) {
      const answeredQuestions = state.pendingQuestions.filter(q => q.answered).length;
      const totalQuestions = state.pendingQuestions.length;
      
      // Reduce progress if there are unanswered questions
      if (totalQuestions > 0 && answeredQuestions < totalQuestions) {
        const questionProgress = answeredQuestions / totalQuestions;
        progress = Math.max(0, progress - (25 * (1 - questionProgress)));
      }
    }
    
    return Math.round(progress);
  } catch (error) {
    throw new Error(`Failed to calculate overall progress: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Ensures the workflow state directory exists
 * 
 * @returns Promise that resolves when the directory exists
 */
async function ensureWorkflowStateDirectory(): Promise<void> {
  try {
    await fsPromises.mkdir(WORKFLOW_STATE_DIR, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create workflow state directory: ${error instanceof Error ? error.message : String(error)}`);
  }
}
