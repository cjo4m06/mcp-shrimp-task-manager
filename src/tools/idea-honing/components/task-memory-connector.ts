/**
 * Task Memory Connector for the Idea Honing Tool
 * 
 * This component integrates with the task memory system to store specifications,
 * create tasks, track task status, and query task memory.
 */

import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { SpecificationDocument } from '../models/specification.js';

// Get the base directory for task memory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '../../../..');
const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, 'data');
const TASK_MEMORY_DIR = path.join(DATA_DIR, 'task-memory');

/**
 * Task structure
 */
interface Task {
  /** Task identifier */
  id: string;
  
  /** Task title */
  title: string;
  
  /** Task description */
  description: string;
  
  /** Task status */
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  
  /** Task dependencies */
  dependencies: string[];
  
  /** Task creation timestamp */
  createdAt: string;
  
  /** Task update timestamp */
  updatedAt: string;
  
  /** Associated specification ID */
  specificationId?: string;
  
  /** Task metadata */
  metadata: Record<string, any>;
}

/**
 * Task creation options
 */
interface TaskCreationOptions {
  /** Task title */
  title: string;
  
  /** Task description */
  description: string;
  
  /** Task dependencies */
  dependencies?: string[];
  
  /** Task metadata */
  metadata?: Record<string, any>;
}

/**
 * Stores a specification in task memory
 * 
 * @param specification - Specification document to store
 * @returns Promise that resolves with the stored specification ID
 */
export async function storeSpecificationInTaskMemory(
  specification: SpecificationDocument
): Promise<string> {
  try {
    // Ensure the task memory directory exists
    await ensureTaskMemoryDirectory();
    
    // Create the specifications directory if it doesn't exist
    const specificationsDir = path.join(TASK_MEMORY_DIR, 'specifications');
    await fsPromises.mkdir(specificationsDir, { recursive: true });
    
    // Create a task memory representation of the specification
    const taskMemorySpec = {
      id: specification.id,
      title: specification.title,
      sections: specification.sections.map(section => ({
        id: section.id,
        title: section.title,
        content: section.content
      })),
      metadata: specification.metadata,
      version: specification.version,
      createdAt: specification.createdAt.toISOString(),
      updatedAt: specification.updatedAt.toISOString(),
      tasks: [] // Will be populated as tasks are created
    };
    
    // Save the specification to task memory
    const specPath = path.join(specificationsDir, `${specification.id}.json`);
    await fsPromises.writeFile(specPath, JSON.stringify(taskMemorySpec, null, 2), 'utf-8');
    
    return specification.id;
  } catch (error) {
    throw new Error(`Failed to store specification in task memory: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a task from a specification
 * 
 * @param specificationId - Specification identifier
 * @param options - Task creation options
 * @returns Promise that resolves with the created task ID
 */
export async function createTaskFromSpecification(
  specificationId: string,
  options: TaskCreationOptions
): Promise<string> {
  try {
    // Ensure the task memory directory exists
    await ensureTaskMemoryDirectory();
    
    // Create the tasks directory if it doesn't exist
    const tasksDir = path.join(TASK_MEMORY_DIR, 'tasks');
    await fsPromises.mkdir(tasksDir, { recursive: true });
    
    // Generate a task ID
    const taskId = `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create the task
    const task: Task = {
      id: taskId,
      title: options.title,
      description: options.description,
      status: 'pending',
      dependencies: options.dependencies || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      specificationId,
      metadata: options.metadata || {}
    };
    
    // Save the task to task memory
    const taskPath = path.join(tasksDir, `${taskId}.json`);
    await fsPromises.writeFile(taskPath, JSON.stringify(task, null, 2), 'utf-8');
    
    // Update the specification with the task ID
    await addTaskToSpecification(specificationId, taskId);
    
    return taskId;
  } catch (error) {
    throw new Error(`Failed to create task from specification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Updates a task's status
 * 
 * @param taskId - Task identifier
 * @param status - New task status
 * @returns Promise that resolves when the task is updated
 */
export async function updateTaskStatus(
  taskId: string,
  status: 'pending' | 'in_progress' | 'completed' | 'verified'
): Promise<void> {
  try {
    // Get the task
    const task = await getTask(taskId);
    
    // Update the task status
    task.status = status;
    task.updatedAt = new Date().toISOString();
    
    // Save the updated task
    const taskPath = path.join(TASK_MEMORY_DIR, 'tasks', `${taskId}.json`);
    await fsPromises.writeFile(taskPath, JSON.stringify(task, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to update task status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets tasks for a specification
 * 
 * @param specificationId - Specification identifier
 * @returns Promise that resolves with an array of tasks
 */
export async function getTasksForSpecification(specificationId: string): Promise<Task[]> {
  try {
    // Get the specification
    const specPath = path.join(TASK_MEMORY_DIR, 'specifications', `${specificationId}.json`);
    
    try {
      await fsPromises.access(specPath);
    } catch {
      throw new Error(`Specification not found: ${specificationId}`);
    }
    
    const specContent = await fsPromises.readFile(specPath, 'utf-8');
    const spec = JSON.parse(specContent);
    
    // Get the tasks
    const tasks: Task[] = [];
    
    for (const taskId of spec.tasks) {
      try {
        const task = await getTask(taskId);
        tasks.push(task);
      } catch (error) {
        console.error(`Error getting task ${taskId}: ${error}`);
      }
    }
    
    return tasks;
  } catch (error) {
    throw new Error(`Failed to get tasks for specification: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Gets a task by ID
 * 
 * @param taskId - Task identifier
 * @returns Promise that resolves with the task
 */
export async function getTask(taskId: string): Promise<Task> {
  try {
    const taskPath = path.join(TASK_MEMORY_DIR, 'tasks', `${taskId}.json`);
    
    try {
      await fsPromises.access(taskPath);
    } catch {
      throw new Error(`Task not found: ${taskId}`);
    }
    
    const taskContent = await fsPromises.readFile(taskPath, 'utf-8');
    return JSON.parse(taskContent);
  } catch (error) {
    throw new Error(`Failed to get task: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Queries task memory for tasks matching criteria
 * 
 * @param criteria - Query criteria
 * @returns Promise that resolves with an array of matching tasks
 */
export async function queryTaskMemory(criteria: {
  status?: 'pending' | 'in_progress' | 'completed' | 'verified';
  specificationId?: string;
  title?: string;
  description?: string;
}): Promise<Task[]> {
  try {
    // Ensure the task memory directory exists
    await ensureTaskMemoryDirectory();
    
    // Create the tasks directory if it doesn't exist
    const tasksDir = path.join(TASK_MEMORY_DIR, 'tasks');
    await fsPromises.mkdir(tasksDir, { recursive: true });
    
    // Get all task files
    const taskFiles = await fsPromises.readdir(tasksDir);
    
    // Filter task files to only include .json files
    const jsonTaskFiles = taskFiles.filter(file => file.endsWith('.json'));
    
    // Read and filter tasks
    const tasks: Task[] = [];
    
    for (const file of jsonTaskFiles) {
      try {
        const taskPath = path.join(tasksDir, file);
        const taskContent = await fsPromises.readFile(taskPath, 'utf-8');
        const task = JSON.parse(taskContent);
        
        // Check if the task matches the criteria
        let matches = true;
        
        if (criteria.status && task.status !== criteria.status) {
          matches = false;
        }
        
        if (criteria.specificationId && task.specificationId !== criteria.specificationId) {
          matches = false;
        }
        
        if (criteria.title && !task.title.toLowerCase().includes(criteria.title.toLowerCase())) {
          matches = false;
        }
        
        if (criteria.description && !task.description.toLowerCase().includes(criteria.description.toLowerCase())) {
          matches = false;
        }
        
        if (matches) {
          tasks.push(task);
        }
      } catch (error) {
        console.error(`Error reading task file ${file}: ${error}`);
      }
    }
    
    return tasks;
  } catch (error) {
    throw new Error(`Failed to query task memory: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Ensures the task memory directory exists
 * 
 * @returns Promise that resolves when the directory exists
 */
async function ensureTaskMemoryDirectory(): Promise<void> {
  try {
    await fsPromises.mkdir(TASK_MEMORY_DIR, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create task memory directory: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Adds a task to a specification
 * 
 * @param specificationId - Specification identifier
 * @param taskId - Task identifier
 * @returns Promise that resolves when the task is added
 */
async function addTaskToSpecification(specificationId: string, taskId: string): Promise<void> {
  try {
    const specPath = path.join(TASK_MEMORY_DIR, 'specifications', `${specificationId}.json`);
    
    try {
      await fsPromises.access(specPath);
    } catch {
      throw new Error(`Specification not found: ${specificationId}`);
    }
    
    const specContent = await fsPromises.readFile(specPath, 'utf-8');
    const spec = JSON.parse(specContent);
    
    // Add the task ID to the specification
    if (!spec.tasks) {
      spec.tasks = [];
    }
    
    if (!spec.tasks.includes(taskId)) {
      spec.tasks.push(taskId);
    }
    
    // Save the updated specification
    await fsPromises.writeFile(specPath, JSON.stringify(spec, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to add task to specification: ${error instanceof Error ? error.message : String(error)}`);
  }
}
