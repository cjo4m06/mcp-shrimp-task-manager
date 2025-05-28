import {
  Task,
  TaskStatus,
  TaskDependency,
  TaskComplexityLevel,
  TaskComplexityThresholds,
  TaskComplexityAssessment,
  RelatedFile,
} from "../types/index.js";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { spawnSync } from "child_process";
import { UUID_V4_REGEX } from "../utils/regex.js";

// Data file path
const DATA_DIR = process.env.DATA_DIR as string;
if (!DATA_DIR) throw new Error("DATA_DIR is not set");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(TASKS_FILE);
  } catch (error) {
    await fs.writeFile(TASKS_FILE, JSON.stringify({ tasks: [] }));
  }
}

// Read all tasks
async function readTasks(): Promise<Task[]> {
  await ensureDataDir();
  const data = await fs.readFile(TASKS_FILE, "utf-8");
  const tasks = JSON.parse(data).tasks;

  // Convert date strings back to Date objects
  return tasks.map((task: any) => ({
    ...task,
    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
    updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
    completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
  }));
}

// Write all tasks
async function writeTasks(tasks: Task[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(TASKS_FILE, JSON.stringify({ tasks }, null, 2));
}

// Get all tasks
export async function getAllTasks(): Promise<Task[]> {
  return await readTasks();
}

// Get task by ID
export async function getTaskById(taskId: string): Promise<Task | null> {
  const tasks = await readTasks();
  return tasks.find((task) => task.id === taskId) || null;
}

// Create new task
export async function createTask(
  name: string,
  description: string,
  notes?: string,
  dependencies: string[] = [],
  relatedFiles?: RelatedFile[]
): Promise<Task> {
  const tasks = await readTasks();

  const dependencyObjects: TaskDependency[] = dependencies.map((taskId) => ({
    taskId,
  }));

  const newTask: Task = {
    id: uuidv4(),
    name,
    description,
    notes,
    status: TaskStatus.PENDING,
    dependencies: dependencyObjects,
    createdAt: new Date(),
    updatedAt: new Date(),
    relatedFiles,
  };

  tasks.push(newTask);
  await writeTasks(tasks);

  return newTask;
}

// Update task
export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<Task | null> {
  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  // Check if the task is completed, completed tasks are not allowed to be updated (except for explicitly allowed fields)
  if (tasks[taskIndex].status === TaskStatus.COMPLETED) {
    // Only allow updating the summary field (task summary) and relatedFiles field
    const allowedFields = ["summary", "relatedFiles"];
    const attemptedFields = Object.keys(updates);

    const disallowedFields = attemptedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (disallowedFields.length > 0) {
      return null;
    }
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date(),
  };

  await writeTasks(tasks);

  return tasks[taskIndex];
}

// Update task status
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<Task | null> {
  const updates: Partial<Task> = { status };

  if (status === TaskStatus.COMPLETED) {
    updates.completedAt = new Date();
  }

  return await updateTask(taskId, updates);
}

// Update task summary
export async function updateTaskSummary(
  taskId: string,
  summary: string
): Promise<Task | null> {
  return await updateTask(taskId, { summary });
}

// Update task content
export async function updateTaskContent(
  taskId: string,
  updates: {
    name?: string;
    description?: string;
    notes?: string;
    relatedFiles?: RelatedFile[];
    dependencies?: string[];
    implementationGuide?: string;
    verificationCriteria?: string;
  }
): Promise<{ success: boolean; message: string; task?: Task }> {
  // Get the task and check if it exists
  const task = await getTaskById(taskId);

  if (!task) {
    return { success: false, message: "Task not found" };
  }

  // Check if the task is completed
  if (task.status === TaskStatus.COMPLETED) {
    return { success: false, message: "Cannot update completed task" };
  }

  // Build update object, only include fields that actually need to be updated
  const updateObj: Partial<Task> = {};

  if (updates.name !== undefined) {
    updateObj.name = updates.name;
  }

  if (updates.description !== undefined) {
    updateObj.description = updates.description;
  }

  if (updates.notes !== undefined) {
    updateObj.notes = updates.notes;
  }

  if (updates.relatedFiles !== undefined) {
    updateObj.relatedFiles = updates.relatedFiles;
  }

  if (updates.dependencies !== undefined) {
    updateObj.dependencies = updates.dependencies.map((dep) => ({
      taskId: dep,
    }));
  }

  if (updates.implementationGuide !== undefined) {
    updateObj.implementationGuide = updates.implementationGuide;
  }

  if (updates.verificationCriteria !== undefined) {
    updateObj.verificationCriteria = updates.verificationCriteria;
  }

  // If there is nothing to update, return early
  if (Object.keys(updateObj).length === 0) {
    return { success: true, message: "No content to update", task };
  }

  // Perform update
  const updatedTask = await updateTask(taskId, updateObj);

  if (!updatedTask) {
    return { success: false, message: "Error updating task" };
  }

  return {
    success: true,
    message: "Task content updated successfully",
    task: updatedTask,
  };
}

// Update task related files
export async function updateTaskRelatedFiles(
  taskId: string,
  relatedFiles: RelatedFile[]
): Promise<{ success: boolean; message: string; task?: Task }> {
  // Get the task and check if it exists
  const task = await getTaskById(taskId);

  if (!task) {
    return { success: false, message: "Task not found" };
  }

  // Check if the task is completed
  if (task.status === TaskStatus.COMPLETED) {
    return { success: false, message: "Cannot update completed task" };
  }

  // Perform update
  const updatedTask = await updateTask(taskId, { relatedFiles });

  if (!updatedTask) {
    return { success: false, message: "Error updating task related files" };
  }

  return {
    success: true,
    message: `Successfully updated ${relatedFiles.length} task related files`,
    task: updatedTask,
  };
}

// Batch create or update tasks
export async function batchCreateOrUpdateTasks(
  taskDataList: Array<{
    name: string;
    description: string;
    notes?: string;
    dependencies?: string[];
    relatedFiles?: RelatedFile[];
    implementationGuide?: string;
    verificationCriteria?: string;
  }>,
  updateMode: "append" | "overwrite" | "selective" | "clearAllTasks",
  globalAnalysisResult?: string
): Promise<Task[]> {
  // Read all existing tasks
  const existingTasks = await readTasks();

  // Handle existing tasks according to update mode
  let tasksToKeep: Task[] = [];

  if (updateMode === "append") {
    // Append mode: keep all existing tasks
    tasksToKeep = [...existingTasks];
  } else if (updateMode === "overwrite") {
    // Overwrite mode: only keep completed tasks, clear all unfinished tasks
    tasksToKeep = existingTasks.filter(
      (task) => task.status === TaskStatus.COMPLETED
    );
  } else if (updateMode === "selective") {
    // Selective update mode: selectively update based on task name, keep tasks not in the update list
    // Extract the list of task names to be updated
    const updateTaskNames = new Set(taskDataList.map((task) => task.name));

    // Keep all tasks not in the update list
    tasksToKeep = existingTasks.filter(
      (task) => !updateTaskNames.has(task.name)
    );
  } else if (updateMode === "clearAllTasks") {
    // Clear all tasks mode: clear the task list
    tasksToKeep = [];
  }

  // This map will be used to store the mapping from name to task ID, to support referencing tasks by name
  const taskNameToIdMap = new Map<string, string>();

  // For selective update mode, first record the names and IDs of existing tasks
  if (updateMode === "selective") {
    existingTasks.forEach((task) => {
      taskNameToIdMap.set(task.name, task.id);
    });
  }

  // Record the names and IDs of all tasks, whether to be kept or newly created
  tasksToKeep.forEach((task) => {
    taskNameToIdMap.set(task.name, task.id);
  });

  // Create a list of new tasks
  const newTasks: Task[] = [];

  for (const taskData of taskDataList) {
    // Check if it is selective update mode and the task name already exists
    if (updateMode === "selective" && taskNameToIdMap.has(taskData.name)) {
      // Get the ID of the existing task
      const existingTaskId = taskNameToIdMap.get(taskData.name)!;

      // Find the existing task
      const existingTaskIndex = existingTasks.findIndex(
        (task) => task.id === existingTaskId
      );

      // If the existing task is found and it is not completed, update it
      if (
        existingTaskIndex !== -1 &&
        existingTasks[existingTaskIndex].status !== TaskStatus.COMPLETED
      ) {
        const taskToUpdate = existingTasks[existingTaskIndex];

        // Update the basic information of the task, but keep the original ID, creation time, etc.
        const updatedTask: Task = {
          ...taskToUpdate,
          name: taskData.name,
          description: taskData.description,
          notes: taskData.notes,
          // dependencies handled later
          updatedAt: new Date(),
          // Save implementation guide (if any)
          implementationGuide: taskData.implementationGuide,
          // Save verification criteria (if any)
          verificationCriteria: taskData.verificationCriteria,
          // Save global analysis result (if any)
          analysisResult: globalAnalysisResult,
        };

        // Handle related files (if any)
        if (taskData.relatedFiles) {
          updatedTask.relatedFiles = taskData.relatedFiles;
        }

        // Add the updated task to the new task list
        newTasks.push(updatedTask);

        // Remove this task from tasksToKeep, as it has been updated and added to newTasks
        tasksToKeep = tasksToKeep.filter((task) => task.id !== existingTaskId);
      }
    } else {
      // Create new task
      const newTaskId = uuidv4();

      // Add the name and ID of the new task to the map
      taskNameToIdMap.set(taskData.name, newTaskId);

      const newTask: Task = {
        id: newTaskId,
        name: taskData.name,
        description: taskData.description,
        notes: taskData.notes,
        status: TaskStatus.PENDING,
        dependencies: [], // dependencies handled later
        createdAt: new Date(),
        updatedAt: new Date(),
        relatedFiles: taskData.relatedFiles,
        // Save implementation guide (if any)
        implementationGuide: taskData.implementationGuide,
        // Save verification criteria (if any)
        verificationCriteria: taskData.verificationCriteria,
        // Save global analysis result (if any)
        analysisResult: globalAnalysisResult,
      };

      newTasks.push(newTask);
    }
  }

  // Handle dependencies between tasks
  for (let i = 0; i < taskDataList.length; i++) {
    const taskData = taskDataList[i];
    const newTask = newTasks[i];

    // If there are dependencies, handle them
    if (taskData.dependencies && taskData.dependencies.length > 0) {
      const resolvedDependencies: TaskDependency[] = [];

      for (const dependencyName of taskData.dependencies) {
        // First try to interpret the dependency as a task ID
        let dependencyTaskId = dependencyName;

        // If the dependency does not look like a UUID, try to interpret it as a task name
        if (!UUID_V4_REGEX.test(dependencyName)) {
          // If this name exists in the map, use the corresponding ID
          if (taskNameToIdMap.has(dependencyName)) {
            dependencyTaskId = taskNameToIdMap.get(dependencyName)!;
          } else {
            continue; // Skip this dependency
          }
        } else {
          // It is UUID format, but need to confirm whether this ID corresponds to an actual existing task
          const idExists = [...tasksToKeep, ...newTasks].some(
            (task) => task.id === dependencyTaskId
          );
          if (!idExists) {
            continue; // Skip this dependency
          }
        }

        resolvedDependencies.push({ taskId: dependencyTaskId });
      }

      newTask.dependencies = resolvedDependencies;
    }
  }

  // Merge kept tasks and new tasks
  const allTasks = [...tasksToKeep, ...newTasks];

  // Write the updated task list
  await writeTasks(allTasks);

  return newTasks;
}

// Check if the task can be executed (all dependencies are completed)
export async function canExecuteTask(
  taskId: string
): Promise<{ canExecute: boolean; blockedBy?: string[] }> {
  const task = await getTaskById(taskId);

  if (!task) {
    return { canExecute: false };
  }

  if (task.status === TaskStatus.COMPLETED) {
    return { canExecute: false }; // Completed tasks do not need to be executed again
  }

  if (task.dependencies.length === 0) {
    return { canExecute: true }; // Tasks without dependencies can be executed directly
  }

  const allTasks = await readTasks();
  const blockedBy: string[] = [];

  for (const dependency of task.dependencies) {
    const dependencyTask = allTasks.find((t) => t.id === dependency.taskId);

    if (!dependencyTask || dependencyTask.status !== TaskStatus.COMPLETED) {
      blockedBy.push(dependency.taskId);
    }
  }

  return {
    canExecute: blockedBy.length === 0,
    blockedBy: blockedBy.length > 0 ? blockedBy : undefined,
  };
}

// Delete task
export async function deleteTask(
  taskId: string
): Promise<{ success: boolean; message: string }> {
  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return { success: false, message: "Task not found" };
  }

  // Check task status, completed tasks are not allowed to be deleted
  if (tasks[taskIndex].status === TaskStatus.COMPLETED) {
    return { success: false, message: "Cannot delete completed task" };
  }

  // Check if other tasks depend on this task
  const allTasks = tasks.filter((_, index) => index !== taskIndex);
  const dependentTasks = allTasks.filter((task) =>
    task.dependencies.some((dep) => dep.taskId === taskId)
  );

  if (dependentTasks.length > 0) {
    const dependentTaskNames = dependentTasks
      .map((task) => `"${task.name}" (ID: ${task.id})`)
      .join(", ");
    return {
      success: false,
      message: `Cannot delete this task because it is depended by: ${dependentTaskNames}`,
    };
  }

  // Perform delete operation
  tasks.splice(taskIndex, 1);
  await writeTasks(tasks);

  return { success: true, message: "Task deleted successfully" };
}

// Assess task complexity
export async function assessTaskComplexity(
  taskId: string
): Promise<TaskComplexityAssessment | null> {
  const task = await getTaskById(taskId);

  if (!task) {
    return null;
  }

  // Assess each indicator
  const descriptionLength = task.description.length;
  const dependenciesCount = task.dependencies.length;
  const notesLength = task.notes ? task.notes.length : 0;
  const hasNotes = !!task.notes;

  // Assess complexity level based on each indicator
  let level = TaskComplexityLevel.LOW;

  // Description length assessment
  if (
    descriptionLength >= TaskComplexityThresholds.DESCRIPTION_LENGTH.VERY_HIGH
  ) {
    level = TaskComplexityLevel.VERY_HIGH;
  } else if (
    descriptionLength >= TaskComplexityThresholds.DESCRIPTION_LENGTH.HIGH
  ) {
    level = TaskComplexityLevel.HIGH;
  } else if (
    descriptionLength >= TaskComplexityThresholds.DESCRIPTION_LENGTH.MEDIUM
  ) {
    level = TaskComplexityLevel.MEDIUM;
  }

  // Dependency count assessment (take the highest level)
  if (
    dependenciesCount >= TaskComplexityThresholds.DEPENDENCIES_COUNT.VERY_HIGH
  ) {
    level = TaskComplexityLevel.VERY_HIGH;
  } else if (
    dependenciesCount >= TaskComplexityThresholds.DEPENDENCIES_COUNT.HIGH &&
    level !== TaskComplexityLevel.VERY_HIGH
  ) {
    level = TaskComplexityLevel.HIGH;
  } else if (
    dependenciesCount >= TaskComplexityThresholds.DEPENDENCIES_COUNT.MEDIUM &&
    level !== TaskComplexityLevel.HIGH &&
    level !== TaskComplexityLevel.VERY_HIGH
  ) {
    level = TaskComplexityLevel.MEDIUM;
  }

  // Notes length assessment (take the highest level)
  if (notesLength >= TaskComplexityThresholds.NOTES_LENGTH.VERY_HIGH) {
    level = TaskComplexityLevel.VERY_HIGH;
  } else if (
    notesLength >= TaskComplexityThresholds.NOTES_LENGTH.HIGH &&
    level !== TaskComplexityLevel.VERY_HIGH
  ) {
    level = TaskComplexityLevel.HIGH;
  } else if (
    notesLength >= TaskComplexityThresholds.NOTES_LENGTH.MEDIUM &&
    level !== TaskComplexityLevel.HIGH &&
    level !== TaskComplexityLevel.VERY_HIGH
  ) {
    level = TaskComplexityLevel.MEDIUM;
  }

  // Generate recommendations based on complexity level
  const recommendations: string[] = [];

  // Recommendations for low complexity tasks
  if (level === TaskComplexityLevel.LOW) {
    recommendations.push("This task is low complexity, can be executed directly");
    recommendations.push("It is recommended to set clear completion standards to ensure that the acceptance has clear basis");
  }
  // Recommendations for medium complexity tasks
  else if (level === TaskComplexityLevel.MEDIUM) {
    recommendations.push("This task has a certain complexity, it is recommended to plan the execution steps in detail");
    recommendations.push("It can be executed in stages and regularly checked to ensure accurate understanding and implementation");
    if (dependenciesCount > 0) {
      recommendations.push("Pay attention to check the completion status and output quality of all dependent tasks");
    }
  }
  // Recommendations for high complexity tasks
  else if (level === TaskComplexityLevel.HIGH) {
    recommendations.push("This task has a high complexity, it is recommended to perform a thorough analysis and planning first");
    recommendations.push("Consider splitting the task into smaller, independently executable sub-tasks");
    recommendations.push("Establish clear milestones and checkpoints to facilitate tracking progress and quality");
    if (
      dependenciesCount > TaskComplexityThresholds.DEPENDENCIES_COUNT.MEDIUM
    ) {
      recommendations.push(
        "There are many dependent tasks, it is recommended to make a dependency graph to ensure the correct execution order"
      );
    }
  }
  // Recommendations for very high complexity tasks
  else if (level === TaskComplexityLevel.VERY_HIGH) {
    recommendations.push("⚠️ This task has a very high complexity, it is strongly recommended to split it into multiple independent tasks");
    recommendations.push(
      "Perform a thorough analysis and planning before execution, clearly define the scope and interface of each sub-task"
    );
    recommendations.push(
      "Perform risk assessment on the task, identify possible obstacles and develop countermeasures"
    );
    recommendations.push("Establish specific test and verification standards to ensure the output quality of each sub-task");
    if (
      descriptionLength >= TaskComplexityThresholds.DESCRIPTION_LENGTH.VERY_HIGH
    ) {
      recommendations.push(
        "The task description is very long, it is recommended to organize key points and establish a structured execution list"
      );
    }
    if (dependenciesCount >= TaskComplexityThresholds.DEPENDENCIES_COUNT.HIGH) {
      recommendations.push(
        "There are too many dependent tasks, it is recommended to re-evaluate the task boundaries to ensure the task split is reasonable"
      );
    }
  }

  return {
    level,
    metrics: {
      descriptionLength,
      dependenciesCount,
      notesLength,
      hasNotes,
    },
    recommendations,
  };
}

// Clear all tasks
export async function clearAllTasks(): Promise<{
  success: boolean;
  message: string;
  backupFile?: string;
}> {
  try {
    // Read existing tasks
    const allTasks = await readTasks();

    // If there are no tasks, return directly
    if (allTasks.length === 0) {
      return { success: true, message: "No tasks need to be cleared" };
    }

    // Filter out completed tasks
    const completedTasks = allTasks.filter(
      (task) => task.status === TaskStatus.COMPLETED
    );

    // Create backup file name
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\..+/, "");
    const backupFileName = `tasks_memory_${timestamp}.json`;

    // Ensure memory directory exists
    const MEMORY_DIR = path.join(DATA_DIR, "memory");
    try {
      await fs.access(MEMORY_DIR);
    } catch (error) {
      await fs.mkdir(MEMORY_DIR, { recursive: true });
    }

    // Create backup path in memory directory
    const memoryFilePath = path.join(MEMORY_DIR, backupFileName);

    // Write to memory directory (only completed tasks)
    await fs.writeFile(
      memoryFilePath,
      JSON.stringify({ tasks: completedTasks }, null, 2)
    );

    // Clear task file
    await writeTasks([]);

    return {
      success: true,
      message: `Successfully cleared all tasks, ${allTasks.length} tasks were deleted, ${completedTasks.length} completed tasks were backed up to memory directory`,
      backupFile: backupFileName,
    };
  } catch (error) {
    return {
      success: false,
      message: `Error clearing tasks: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// Search task memory using system command
export async function searchTasksWithCommand(
  query: string,
  isId: boolean = false,
  page: number = 1,
  pageSize: number = 5
): Promise<{
  tasks: Task[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasMore: boolean;
  };
}> {
  // Read tasks from the current task file
  const currentTasks = await readTasks();
  let memoryTasks: Task[] = [];

  // Search for tasks in the memory folder
  const MEMORY_DIR = path.join(DATA_DIR, "memory");

  try {
    // Ensure the memory folder exists
    await fs.access(MEMORY_DIR);

    // Execute search using spawnSync
    const searchResult = executeSearch(query, isId, MEMORY_DIR);

    if (searchResult.success && searchResult.stdout) {
      // Parse search results and extract matching file paths
      const matchedFiles = new Set<string>();

      searchResult.stdout.split("\n").forEach((line: string) => {
        if (line.trim()) {
          // Format usually is: file path:matching content
          const filePath = line.split(":")[0];
          if (filePath) {
            matchedFiles.add(filePath);
          }
        }
      });

      // Limit the number of files read
      const MAX_FILES_TO_READ = 10;
      const sortedFiles = Array.from(matchedFiles)
        .sort()
        .reverse()
        .slice(0, MAX_FILES_TO_READ);

      // Only process files that meet the criteria
      for (const filePath of sortedFiles) {
        try {
          const data = await fs.readFile(filePath, "utf-8");
          const tasks = JSON.parse(data).tasks || [];

          // Format date fields
          const formattedTasks = tasks.map((task: any) => ({
            ...task,
            createdAt: task.createdAt
              ? new Date(task.createdAt)
              : new Date(),
            updatedAt: task.updatedAt
              ? new Date(task.updatedAt)
              : new Date(),
            completedAt: task.completedAt
              ? new Date(task.completedAt)
              : undefined,
          }));

          // Further filter tasks to ensure they meet the criteria
          const filteredTasks = filterCurrentTasks(formattedTasks, query, isId);

          memoryTasks.push(...filteredTasks);
        } catch (error: unknown) {}
      }
    }
  } catch (error: unknown) {}

  // Filter current tasks that meet the criteria
  const filteredCurrentTasks = filterCurrentTasks(currentTasks, query, isId);

  // Merge results and remove duplicates
  const taskMap = new Map<string, Task>();

  // Current tasks take priority
  filteredCurrentTasks.forEach((task) => {
    taskMap.set(task.id, task);
  });

  // Add memory tasks, avoid duplicates
  memoryTasks.forEach((task) => {
    if (!taskMap.has(task.id)) {
      taskMap.set(task.id, task);
    }
  });

  // Merged results
  const allTasks = Array.from(taskMap.values());

  // Sort - sort by update or completion time in descending order
  allTasks.sort((a, b) => {
    // Priority is given to completion time
    if (a.completedAt && b.completedAt) {
      return b.completedAt.getTime() - a.completedAt.getTime();
    } else if (a.completedAt) {
      return -1; // a is completed but b is not, a comes first
    } else if (b.completedAt) {
      return 1; // b is completed but a is not, b comes first
    }

    // Otherwise, sort by update time
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  // Paging
  const totalResults = allTasks.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages || 1)); // Ensure the page number is valid
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const paginatedTasks = allTasks.slice(startIndex, endIndex);

  return {
    tasks: paginatedTasks,
    pagination: {
      currentPage: safePage,
      totalPages: totalPages || 1,
      totalResults,
      hasMore: safePage < totalPages,
    },
  };
}

// Execute search using spawnSync to prevent command injection
// TODO: support windows
function executeSearch(
  query: string,
  isId: boolean,
  memoryDir: string
): { success: boolean; stdout?: string } {
  // Validate input
  if (!query || typeof query !== 'string') {
    return { success: false };
  }

  // Clean the query by removing control characters
  const cleanQuery = query.replace(/[\x00-\x1F\x7F]/g, '').trim();
  if (!cleanQuery) {
    return { success: false };
  }

  try {
    if (isId) {
      // For ID searches, use exact string matching
      const args = ['-r', '--include=*.json', cleanQuery, memoryDir];
      
      const result = spawnSync('grep', args, {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10,
      });

      if (result.error) {
        return { success: false };
      }

      return {
        success: true,
        stdout: result.stdout || '',
      };
    } else {
      // For text searches, search for individual keywords with OR logic
      // The JavaScript filtering will handle the AND logic later
      const keywords = cleanQuery
        .split(/\s+/)
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);
      
      if (keywords.length === 0) {
        return { success: false };
      }

      // Use grep with multiple -e options for OR search
      const args = ['-r', '--include=*.json', '-i'];
      
      // Add each keyword as a separate pattern
      keywords.forEach(keyword => {
        args.push('-e', keyword);
      });
      
      args.push(memoryDir);
      
      const result = spawnSync('grep', args, {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10,
      });

      // grep returns exit code 1 when no matches found, which is normal
      if (result.error) {
        return { success: false };
      }

      return {
        success: true,
        stdout: result.stdout || '',
      };
    }
  } catch (error) {
    return { success: false };
  }
}

/**
 * Check if a task matches the given search keywords
 */
function taskMatchesKeywords(task: Task, keywords: string[]): boolean {
  const searchableFields = [
    task.name,
    task.description,
    task.notes,
    task.implementationGuide,
    task.summary,
  ];

  return keywords.every((keyword) => {
    const lowerKeyword = keyword.toLowerCase();
    return searchableFields.some((field) => 
      field && field.toLowerCase().includes(lowerKeyword)
    );
  });
}

/**
 * Filter current task list based on search criteria
 */
function filterCurrentTasks(
  tasks: Task[],
  query: string,
  isId: boolean
): Task[] {
  if (isId) {
    return tasks.filter((task) => task.id === query);
  }

  // Parse and clean search query into keywords
  const keywords = query
    .split(/\s+/)
    .map(keyword => keyword.trim())
    .filter(keyword => keyword.length > 0);
  
  // Return all tasks if no valid keywords
  if (keywords.length === 0) {
    return tasks;
  }

  // Filter tasks by keyword matching
  return tasks.filter((task) => taskMatchesKeywords(task, keywords));
}
