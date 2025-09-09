import {
  Task,
  TaskStatus,
  TaskDependency,
  TaskComplexityLevel,
  TaskComplexityThresholds,
  TaskComplexityAssessment,
  RelatedFile,
  TasksData,
} from "../types/index.js";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";
import { getDataDir, getTasksFilePath, getMemoryDir } from "../utils/paths.js";

const execAsync = promisify(exec);

// Helper function to get current date/time in server's local timezone
function getLocalDate(): Date {
  return new Date();
}

// Helper function to get ISO string in local timezone format
function getLocalISOString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Get timezone offset in hours and minutes
  const offset = -now.getTimezoneOffset();
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
  const offsetSign = offset >= 0 ? '+' : '-';
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

// Git helper functions
async function initGitIfNeeded(dataDir: string): Promise<void> {
  const gitDir = path.join(dataDir, '.git');
  try {
    await fs.access(gitDir);
    // Git already initialized
  } catch {
    // Initialize git repository
    await execAsync(`cd "${dataDir}" && git init`);
    await execAsync(`cd "${dataDir}" && git config user.name "Shrimp Task Manager"`);
    await execAsync(`cd "${dataDir}" && git config user.email "shrimp@task-manager.local"`);
    
    // Create .gitignore
    const gitignore = `# Temporary files
*.tmp
*.log

# OS files
.DS_Store
Thumbs.db
`;
    await fs.writeFile(path.join(dataDir, '.gitignore'), gitignore);
    
    // Initial commit
    await execAsync(`cd "${dataDir}" && git add .`);
    await execAsync(`cd "${dataDir}" && git commit -m "Initial commit: Initialize task repository"`);
  }
}

async function commitTaskChanges(dataDir: string, message: string, details?: string): Promise<void> {
  try {
    // Stage the tasks.json file
    await execAsync(`cd "${dataDir}" && git add tasks.json`);
    
    // Check if there are changes to commit
    const { stdout } = await execAsync(`cd "${dataDir}" && git status --porcelain tasks.json`);
    
    if (stdout.trim()) {
      // There are changes to commit
      const fullMessage = details ? `${message}\n\n${details}` : message;
      const timestamp = getLocalISOString();
      const commitMessage = `[${timestamp}] ${fullMessage}`;
      
      await execAsync(`cd "${dataDir}" && git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);
    }
  } catch (error) {
    console.error('Git commit error:', error);
    // Don't fail the operation if git fails
  }
}

// 確保獲取專案資料夾路徑
// Ensure getting project data folder path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// 數據文件路徑（改為異步獲取）
// Data file paths (changed to asynchronous acquisition)
// const DATA_DIR = getDataDir();
// const TASKS_FILE = getTasksFilePath();

// 將exec轉換為Promise形式
// Convert exec to Promise form
const execPromise = promisify(exec);

// 確保數據目錄存在
// Ensure data directory exists
async function ensureDataDir() {
  const DATA_DIR = await getDataDir();
  const TASKS_FILE = await getTasksFilePath();

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

// 讀取任務數據（包含初始請求）
// Read tasks data (including initial request)
async function readTasksData(): Promise<TasksData> {
  await ensureDataDir();
  const TASKS_FILE = await getTasksFilePath();
  const data = await fs.readFile(TASKS_FILE, "utf-8");
  const tasksData = JSON.parse(data);

  // 處理舊格式的向後兼容性
  // Handle backward compatibility with old format
  if (Array.isArray(tasksData)) {
    // 舊格式：直接是任務數組
    // Old format: direct tasks array
    return {
      tasks: tasksData.map((task: any) => ({
        ...task,
        createdAt: task.createdAt ? new Date(task.createdAt) : getLocalDate(),
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : getLocalDate(),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      })),
      initialRequest: undefined,
      createdAt: getLocalDate(),
      updatedAt: getLocalDate(),
    };
  }

  // 新格式：包含 tasks 和其他元數據
  // New format: contains tasks and other metadata
  const tasks = tasksData.tasks || [];
  return {
    tasks: tasks.map((task: any) => ({
      ...task,
      createdAt: task.createdAt ? new Date(task.createdAt) : getLocalDate(),
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : getLocalDate(),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    })),
    initialRequest: tasksData.initialRequest,
    createdAt: tasksData.createdAt ? new Date(tasksData.createdAt) : getLocalDate(),
    updatedAt: tasksData.updatedAt ? new Date(tasksData.updatedAt) : getLocalDate(),
  };
}

// 讀取所有任務
// Read all tasks
async function readTasks(): Promise<Task[]> {
  const tasksData = await readTasksData();
  return tasksData.tasks;
}

// 寫入任務數據（包含初始請求）
// Write tasks data (including initial request)
async function writeTasksData(tasksData: TasksData, commitMessage?: string): Promise<void> {
  await ensureDataDir();
  const TASKS_FILE = await getTasksFilePath();
  const DATA_DIR = await getDataDir();
  
  // Initialize git if needed
  await initGitIfNeeded(DATA_DIR);
  
  // Update the updatedAt timestamp
  tasksData.updatedAt = getLocalDate();
  
  // Write the tasks file
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasksData, null, 2));
  
  // Commit the changes
  if (commitMessage) {
    await commitTaskChanges(DATA_DIR, commitMessage);
  }
}

// 寫入所有任務
// Write all tasks
async function writeTasks(tasks: Task[], commitMessage?: string): Promise<void> {
  // 讀取現有數據以保留初始請求
  // Read existing data to preserve initial request
  const existingData = await readTasksData();
  const tasksData: TasksData = {
    ...existingData,
    tasks,
    updatedAt: getLocalDate(),
  };
  
  await writeTasksData(tasksData, commitMessage);
}

// 獲取所有任務
// Get all tasks
export async function getAllTasks(): Promise<Task[]> {
  return await readTasks();
}

// 根據ID獲取任務
// Get task by ID
export async function getTaskById(taskId: string): Promise<Task | null> {
  const tasks = await readTasks();
  return tasks.find((task) => task.id === taskId) || null;
}

// 創建新任務
// Create new task
export async function createTask(
  name: string,
  description: string,
  notes?: string,
  dependencies: string[] = [],
  relatedFiles?: RelatedFile[],
  agent?: string
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
    createdAt: getLocalDate(),
    updatedAt: getLocalDate(),
    relatedFiles,
    agent,
  };

  tasks.push(newTask);
  await writeTasks(tasks, `Add new task: ${newTask.name}`);

  return newTask;
}

// 更新任務
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

  // 檢查任務是否已完成
  // Check if task is completed，已完成的任務不允許更新（除非是明確允許的欄位）
  // Check if task is completed, completed tasks cannot be updated (unless explicitly allowed fields)
  if (tasks[taskIndex].status === TaskStatus.COMPLETED) {
    // 僅允許更新 summary、completionDetails 和 relatedFiles 欄位
    // Only allow updating summary, completionDetails and relatedFiles fields
    const allowedFields = ["summary", "completionDetails", "relatedFiles"];
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
    updatedAt: getLocalDate(),
  };

  await writeTasks(tasks, `Update task: ${tasks[taskIndex].name}`);

  return tasks[taskIndex];
}

// 更新任務
// Update task狀態
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus
): Promise<Task | null> {
  const updates: Partial<Task> = { status };

  if (status === TaskStatus.COMPLETED) {
    updates.completedAt = getLocalDate();
  }

  return await updateTask(taskId, updates);
}

// 更新任務
// Update task摘要
export async function updateTaskSummary(
  taskId: string,
  summary: string,
  completionDetails?: any
): Promise<Task | null> {
  const updates: any = { summary };
  
  // If completionDetails is provided, store it (could be extended to a separate field if needed)
  // For now, we'll append it to the summary in a structured way
  if (completionDetails) {
    // Store completion details in the task's notes or a dedicated field
    // This maintains backward compatibility while enhancing data storage
    updates.completionDetails = completionDetails;
  }
  
  return await updateTask(taskId, updates);
}

// 更新任務
// Update task內容
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
    agent?: string;
  }
): Promise<{ success: boolean; message: string; task?: Task }> {
  // 獲取任務並檢查是否存在
  // Get task and check if it exists
  const task = await getTaskById(taskId);

  if (!task) {
    return { success: false, message: "找不到指定任務" };
  }

  // 檢查任務是否已完成
  // Check if task is completed
  if (task.status === TaskStatus.COMPLETED) {
    return { success: false, message: "無法更新已完成的任務" };
  }

  // 構建更新物件，只包含實際需要更新的欄位
  // Build update object, only including fields that actually need updating
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

  if (updates.agent !== undefined) {
    updateObj.agent = updates.agent;
  }

  // 如果沒有要更新的內容，提前返回
  // If there is no content to update, return early
  if (Object.keys(updateObj).length === 0) {
    return { success: true, message: "沒有提供需要更新的內容", task };
  }

  // 執行更新
  // Execute update
  const updatedTask = await updateTask(taskId, updateObj);

  if (!updatedTask) {
    return { success: false, message: "更新任務時發生錯誤" };
  }

  return {
    success: true,
    message: "任務內容已成功更新",
    task: updatedTask,
  };
}

// 更新任務
// Update task相關文件
export async function updateTaskRelatedFiles(
  taskId: string,
  relatedFiles: RelatedFile[]
): Promise<{ success: boolean; message: string; task?: Task }> {
  // 獲取任務並檢查是否存在
  // Get task and check if it exists
  const task = await getTaskById(taskId);

  if (!task) {
    return { success: false, message: "找不到指定任務" };
  }

  // 檢查任務是否已完成
  // Check if task is completed
  if (task.status === TaskStatus.COMPLETED) {
    return { success: false, message: "無法更新已完成的任務" };
  }

  // 執行更新
  // Execute update
  const updatedTask = await updateTask(taskId, { relatedFiles });

  if (!updatedTask) {
    return { success: false, message: "更新任務相關文件時發生錯誤" };
  }

  return {
    success: true,
    message: `已成功更新任務相關文件，共 ${relatedFiles.length} 個文件`,
    task: updatedTask,
  };
}

// 批量創建或更新任務
export async function batchCreateOrUpdateTasks(
  taskDataList: Array<{
    name: string;
    description: string;
    notes?: string;
    dependencies?: string[];
    relatedFiles?: RelatedFile[];
    implementationGuide?: string; // 新增：實現指南
    verificationCriteria?: string; // 新增：驗證標準
    agent?: string; // 新增：代理分配
  }>,
  updateMode: "append" | "overwrite" | "selective" | "clearAllTasks", // 必填參數，指定任務更新策略
  globalAnalysisResult?: string // 新增：全局分析結果
): Promise<Task[]> {
  // 讀取現有的所有任務
  const existingTasks = await readTasks();

  // 根據更新模式處理現有任務
  let tasksToKeep: Task[] = [];

  if (updateMode === "append") {
    // 追加模式：保留所有現有任務
    tasksToKeep = [...existingTasks];
  } else if (updateMode === "overwrite") {
    // 覆蓋模式：僅保留已完成的任務，清除所有未完成任務
    tasksToKeep = existingTasks.filter(
      (task) => task.status === TaskStatus.COMPLETED
    );
  } else if (updateMode === "selective") {
    // 選擇性更新模式：根據任務名稱選擇性更新，保留未在更新列表中的任務
    // 1. 提取待更新任務的名稱清單
    const updateTaskNames = new Set(taskDataList.map((task) => task.name));

    // 2. 保留所有沒有出現在更新列表中的任務
    tasksToKeep = existingTasks.filter(
      (task) => !updateTaskNames.has(task.name)
    );
  } else if (updateMode === "clearAllTasks") {
    // 清除所有任務
// Clear all tasks模式：清空任務列表
    tasksToKeep = [];
  }

  // 這個映射將用於存儲名稱到任務ID的映射，用於支持通過名稱引用任務
  const taskNameToIdMap = new Map<string, string>();

  // 對於選擇性更新模式，先將現有任務的名稱和ID記錄下來
  if (updateMode === "selective") {
    existingTasks.forEach((task) => {
      taskNameToIdMap.set(task.name, task.id);
    });
  }

  // 記錄所有任務的名稱和ID，無論是要保留的任務還是新建的任務
  // 這將用於稍後解析依賴關係
  tasksToKeep.forEach((task) => {
    taskNameToIdMap.set(task.name, task.id);
  });

  // 創建新任務
  // 創建新任務的列表
  // Create list of new tasks
  const newTasks: Task[] = [];

  for (const taskData of taskDataList) {
    // 檢查是否為選擇性更新模式且該任務名稱已存在
  // Check if it is selective update mode and the task name already exists
    if (updateMode === "selective" && taskNameToIdMap.has(taskData.name)) {
      // 獲取現有任務的ID
      // Get the ID of the existing task
      const existingTaskId = taskNameToIdMap.get(taskData.name)!;

      // 查找現有任務
      // Find existing task
      const existingTaskIndex = existingTasks.findIndex(
        (task) => task.id === existingTaskId
      );

      // 如果找到現有任務並且該任務未完成，則更新它
      // If existing task is found and not completed, update it
      if (
        existingTaskIndex !== -1 &&
        existingTasks[existingTaskIndex].status !== TaskStatus.COMPLETED
      ) {
        const taskToUpdate = existingTasks[existingTaskIndex];

        // 更新任務
        // 更新任務的基本信息，但保留原始ID、創建時間等
        // Update basic task information, but preserve original ID, creation time, etc.
        const updatedTask: Task = {
          ...taskToUpdate,
          name: taskData.name,
          description: taskData.description,
          notes: taskData.notes,
          // 後面會處理 dependencies
          // Dependencies will be processed later
          updatedAt: getLocalDate(),
          // 新增：保存實現指南（如果有）
          // New: Save implementation guide (if any)
          implementationGuide: taskData.implementationGuide,
          // 新增：保存驗證標準（如果有）
          // New: Save verification criteria (if any)
          verificationCriteria: taskData.verificationCriteria,
          // 新增：保存全局分析結果（如果有）
          // New: Save global analysis result (if any)
          analysisResult: globalAnalysisResult,
          // 新增：保存代理分配（如果有）
          agent: taskData.agent,
        };

        // 處理相關文件（如果有）
        // Process related files (if any)
        if (taskData.relatedFiles) {
          updatedTask.relatedFiles = taskData.relatedFiles;
        }

        // 將更新後的任務添加到新任務列表
        // Add updated task to new task list
        newTasks.push(updatedTask);

        // 從tasksToKeep中移除此任務，因為它已經被更新並添加到newTasks中了
        // Remove this task from tasksToKeep because it has been updated and added to newTasks
        tasksToKeep = tasksToKeep.filter((task) => task.id !== existingTaskId);
      }
    } else {
      // 創建新任務
      // Create new task
// Create new task
      const newTaskId = uuidv4();

      // 將新任務的名稱和ID添加到映射中
      // Add new task name and ID to mapping
      taskNameToIdMap.set(taskData.name, newTaskId);

      const newTask: Task = {
        id: newTaskId,
        name: taskData.name,
        description: taskData.description,
        notes: taskData.notes,
        status: TaskStatus.PENDING,
        dependencies: [], // 後面會填充
        createdAt: getLocalDate(),
        updatedAt: getLocalDate(),
        relatedFiles: taskData.relatedFiles,
        // 新增：保存實現指南（如果有）
        implementationGuide: taskData.implementationGuide,
        // 新增：保存驗證標準（如果有）
        verificationCriteria: taskData.verificationCriteria,
        // 新增：保存全局分析結果（如果有）
        analysisResult: globalAnalysisResult,
        // 新增：保存代理分配（如果有）
        agent: taskData.agent,
      };

      newTasks.push(newTask);
    }
  }

  // 處理任務之間的依賴關係
  // Handle dependencies between tasks
  for (let i = 0; i < taskDataList.length; i++) {
    const taskData = taskDataList[i];
    const newTask = newTasks[i];

    // 如果存在依賴關係，處理它們
    // If dependencies exist, process them
    if (taskData.dependencies && taskData.dependencies.length > 0) {
      const resolvedDependencies: TaskDependency[] = [];

      for (const dependencyName of taskData.dependencies) {
        // 首先嘗試將依賴項解釋為任務ID
        // First try to interpret dependency as task ID
        let dependencyTaskId = dependencyName;

        // 如果依賴項看起來不像UUID，則嘗試將其解釋為任務名稱
        // If dependency does not look like UUID, try to interpret it as task name
        if (
          !dependencyName.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          )
        ) {
          // 如果映射中存在此名稱，則使用對應的ID
          // If this name exists in mapping, use corresponding ID
          if (taskNameToIdMap.has(dependencyName)) {
            dependencyTaskId = taskNameToIdMap.get(dependencyName)!;
          } else {
            continue; // 跳過此依賴 - Skip this dependency
          }
        } else {
          // 是UUID格式，但需要確認此ID是否對應實際存在的任務
          // Is UUID format, but need to confirm if this ID corresponds to an actually existing task
          const idExists = [...tasksToKeep, ...newTasks].some(
            (task) => task.id === dependencyTaskId
          );
          if (!idExists) {
            continue; // 跳過此依賴 - Skip this dependency
          }
        }

        resolvedDependencies.push({ taskId: dependencyTaskId });
      }

      newTask.dependencies = resolvedDependencies;
    }
  }

  // 合併保留的任務和新任務
  // Merge kept tasks and new tasks
  const allTasks = [...tasksToKeep, ...newTasks];

  // 寫入更新後的任務列表
  await writeTasks(allTasks, `Bulk task operation: ${updateMode} mode, ${newTasks.length} tasks`);

  return newTasks;
}

// 檢查任務是否可以執行（所有依賴都已完成）
// Check if task can be executed (all dependencies completed)
export async function canExecuteTask(
  taskId: string
): Promise<{ canExecute: boolean; blockedBy?: string[] }> {
  const task = await getTaskById(taskId);

  if (!task) {
    return { canExecute: false };
  }

  if (task.status === TaskStatus.COMPLETED) {
    return { canExecute: false }; // 已完成的任務不需要再執行 - Completed tasks do not need to be executed again
  }

  if (task.dependencies.length === 0) {
    return { canExecute: true }; // 沒有依賴的任務可以直接執行 - Tasks without dependencies can be executed directly
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

// 刪除任務
// Delete task
export async function deleteTask(
  taskId: string
): Promise<{ success: boolean; message: string }> {
  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return { success: false, message: "找不到指定任務" };
  }

  // 檢查任務狀態，已完成的任務不允許刪除
  // Check task status, completed tasks cannot be deleted
  if (tasks[taskIndex].status === TaskStatus.COMPLETED) {
    return { success: false, message: "無法刪除已完成的任務" };
  }

  // 檢查是否有其他任務依賴此任務
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
      message: `無法刪除此任務，因為以下任務依賴於它: ${dependentTaskNames}`,
    };
  }

  // 執行刪除操作
  // Execute delete operation
  const deletedTask = tasks[taskIndex];
  tasks.splice(taskIndex, 1);
  await writeTasks(tasks, `Delete task: ${deletedTask.name}`);

  return { success: true, message: "任務刪除成功" };
}

// 評估任務複雜度
// Assess task complexity
export async function assessTaskComplexity(
  taskId: string
): Promise<TaskComplexityAssessment | null> {
  const task = await getTaskById(taskId);

  if (!task) {
    return null;
  }

  // 評估各項指標
  // Assess various indicators
  const descriptionLength = task.description.length;
  const dependenciesCount = task.dependencies.length;
  const notesLength = task.notes ? task.notes.length : 0;
  const hasNotes = !!task.notes;

  // 基於各項指標評估複雜度級別
  // Assess complexity level based on various indicators
  let level = TaskComplexityLevel.LOW;

  // 描述長度評估
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

  // 依賴數量評估（取最高級別）
  // Dependencies count assessment (take highest level)
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

  // 注記長度評估（取最高級別）
  // Notes length assessment (take highest level)
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

  // 根據複雜度級別生成處理建議
  // Generate processing suggestions based on complexity level
  const recommendations: string[] = [];

  // 低複雜度任務建議
  // Low complexity task suggestions
  if (level === TaskComplexityLevel.LOW) {
    recommendations.push("此任務複雜度較低，可直接執行");
    recommendations.push("建議設定清晰的完成標準，確保驗收有明確依據");
  }
  // 中等複雜度任務建議
  // Medium complexity task suggestions
  else if (level === TaskComplexityLevel.MEDIUM) {
    recommendations.push("此任務具有一定複雜性，建議詳細規劃執行步驟");
    recommendations.push("可分階段執行並定期檢查進度，確保理解準確且實施完整");
    if (dependenciesCount > 0) {
      recommendations.push("注意檢查所有依賴任務的完成狀態和輸出質量");
    }
  }
  // 高複雜度任務建議
  // High complexity task suggestions
  else if (level === TaskComplexityLevel.HIGH) {
    recommendations.push("此任務複雜度較高，建議先進行充分的分析和規劃");
    recommendations.push("考慮將任務拆分為較小的、可獨立執行的子任務");
    recommendations.push("建立清晰的里程碑和檢查點，便於追蹤進度和品質");
    if (
      dependenciesCount > TaskComplexityThresholds.DEPENDENCIES_COUNT.MEDIUM
    ) {
      recommendations.push(
        "依賴任務較多，建議製作依賴關係圖，確保執行順序正確"
      );
    }
  }
  // 極高複雜度任務建議
  // Very high complexity task suggestions
  else if (level === TaskComplexityLevel.VERY_HIGH) {
    recommendations.push("⚠️ 此任務複雜度極高，強烈建議拆分為多個獨立任務");
    recommendations.push(
      "在執行前進行詳盡的分析和規劃，明確定義各子任務的範圍和介面"
    );
    recommendations.push(
      "對任務進行風險評估，識別可能的阻礙因素並制定應對策略"
    );
    recommendations.push("建立具體的測試和驗證標準，確保每個子任務的輸出質量");
    if (
      descriptionLength >= TaskComplexityThresholds.DESCRIPTION_LENGTH.VERY_HIGH
    ) {
      recommendations.push(
        "任務描述非常長，建議整理關鍵點並建立結構化的執行清單"
      );
    }
    if (dependenciesCount >= TaskComplexityThresholds.DEPENDENCIES_COUNT.HIGH) {
      recommendations.push(
        "依賴任務數量過多，建議重新評估任務邊界，確保任務切分合理"
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

// 清除所有任務
// Clear all tasks
export async function clearAllTasks(): Promise<{
  success: boolean;
  message: string;
  backupFile?: string;
}> {
  try {
    // 確保數據目錄存在
    // Ensure data directory exists
    await ensureDataDir();

    // 讀取現有任務
    // Read existing tasks
    const allTasks = await readTasks();

    // 如果沒有任務，直接返回
    // If no tasks, return directly
    if (allTasks.length === 0) {
      return { success: true, message: "沒有任務需要清除" };
    }

    // 篩選出已完成的任務
    // Filter out completed tasks
    const completedTasks = allTasks.filter(
      (task) => task.status === TaskStatus.COMPLETED
    );

    // 創建備份文件名
    // Create backup file name
    const timestamp = getLocalISOString()
      .replace(/:/g, "-")
      .replace(/\..+/, "")
      .replace(/[+\-]\d{2}-\d{2}$/, ""); // Remove timezone offset for filename
    const backupFileName = `tasks_memory_${timestamp}.json`;

    // 確保 memory 目錄存在
    // Ensure memory directory exists
    const MEMORY_DIR = await getMemoryDir();
    try {
      await fs.access(MEMORY_DIR);
    } catch (error) {
      await fs.mkdir(MEMORY_DIR, { recursive: true });
    }

    // 創建 memory 目錄下的備份路徑
    // Create backup path under memory directory
    const memoryFilePath = path.join(MEMORY_DIR, backupFileName);

    // 同時寫入到 memory 目錄 (只包含已完成的任務)
    // Also write to memory directory (only containing completed tasks)
    await fs.writeFile(
      memoryFilePath,
      JSON.stringify({ tasks: completedTasks }, null, 2)
    );

    // 清空任務文件
    // Clear task file
    await writeTasks([], `Clear all tasks (${allTasks.length} tasks removed)`);

    return {
      success: true,
      message: `已成功清除所有任務，共 ${allTasks.length} 個任務被刪除，已備份 ${completedTasks.length} 個已完成的任務至 memory 目錄`,
      backupFile: backupFileName,
    };
  } catch (error) {
    return {
      success: false,
      message: `清除任務時發生錯誤: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

// 使用系統指令搜尋任務記憶
// Use system command to search task memory
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
  // 讀取當前任務檔案中的任務
  // Read tasks from current task file
  const currentTasks = await readTasks();
  let memoryTasks: Task[] = [];

  // 搜尋記憶資料夾中的任務
  // Search tasks in memory folder
  const MEMORY_DIR = await getMemoryDir();

  try {
    // 確保記憶資料夾存在
    // Ensure memory folder exists
    await fs.access(MEMORY_DIR);

    // 生成搜尋命令
    // Generate search command
    const cmd = generateSearchCommand(query, isId, MEMORY_DIR);

    // 如果有搜尋命令，執行它
    // If there is a search command, execute it
    if (cmd) {
      try {
        const { stdout } = await execPromise(cmd, {
          maxBuffer: 1024 * 1024 * 10,
        });

        if (stdout) {
          // 解析搜尋結果，提取符合的檔案路徑
          // Parse search results, extract matching file paths
          const matchedFiles = new Set<string>();

          stdout.split("\n").forEach((line) => {
            if (line.trim()) {
              // 格式通常是: 文件路徑:匹配內容
              // Format is usually: file path:matching content
              const filePath = line.split(":")[0];
              if (filePath) {
                matchedFiles.add(filePath);
              }
            }
          });

          // 限制讀取檔案數量
          // Limit number of files to read
          const MAX_FILES_TO_READ = 10;
          const sortedFiles = Array.from(matchedFiles)
            .sort()
            .reverse()
            .slice(0, MAX_FILES_TO_READ);

          // 只處理符合條件的檔案
          // Only process files that meet criteria
          for (const filePath of sortedFiles) {
            try {
              const data = await fs.readFile(filePath, "utf-8");
              const tasks = JSON.parse(data).tasks || [];

              // 格式化日期字段
              // Format date fields
              const formattedTasks = tasks.map((task: any) => ({
                ...task,
                createdAt: task.createdAt
                  ? new Date(task.createdAt)
                  : getLocalDate(),
                updatedAt: task.updatedAt
                  ? new Date(task.updatedAt)
                  : getLocalDate(),
                completedAt: task.completedAt
                  ? new Date(task.completedAt)
                  : undefined,
              }));

              // 進一步過濾任務確保符合條件
              // Further filter tasks to ensure criteria are met
              const filteredTasks = isId
                ? formattedTasks.filter((task: Task) => task.id === query)
                : formattedTasks.filter((task: Task) => {
                    const keywords = query
                      .split(/\s+/)
                      .filter((k) => k.length > 0);
                    if (keywords.length === 0) return true;

                    return keywords.every((keyword) => {
                      const lowerKeyword = keyword.toLowerCase();
                      return (
                        task.name.toLowerCase().includes(lowerKeyword) ||
                        task.description.toLowerCase().includes(lowerKeyword) ||
                        (task.notes &&
                          task.notes.toLowerCase().includes(lowerKeyword)) ||
                        (task.implementationGuide &&
                          task.implementationGuide
                            .toLowerCase()
                            .includes(lowerKeyword)) ||
                        (task.summary &&
                          task.summary.toLowerCase().includes(lowerKeyword))
                      );
                    });
                  });

              memoryTasks.push(...filteredTasks);
            } catch (error: unknown) {}
          }
        }
      } catch (error: unknown) {}
    }
  } catch (error: unknown) {}

  // 從當前任務中過濾符合條件的任務
  // Filter qualifying tasks from current tasks
  const filteredCurrentTasks = filterCurrentTasks(currentTasks, query, isId);

  // 合併結果並去重
  // Merge results and deduplicate
  const taskMap = new Map<string, Task>();

  // 當前任務優先
  // Current tasks have priority
  filteredCurrentTasks.forEach((task) => {
    taskMap.set(task.id, task);
  });

  // 加入記憶任務，避免重複
  // Add memory tasks, avoiding duplicates
  memoryTasks.forEach((task) => {
    if (!taskMap.has(task.id)) {
      taskMap.set(task.id, task);
    }
  });

  // 合併後的結果
  // Merged results
  const allTasks = Array.from(taskMap.values());

  // 排序 - 按照更新或完成時間降序排列
  // Sort - by update or completion time in descending order
  allTasks.sort((a, b) => {
    // 優先按完成時間排序
    // Sort by completion time first
    if (a.completedAt && b.completedAt) {
      return b.completedAt.getTime() - a.completedAt.getTime();
    } else if (a.completedAt) {
      return -1; // a完成了但b未完成，a排前面 - a is completed but b is not, a comes first
    } else if (b.completedAt) {
      return 1; // b完成了但a未完成，b排前面 - b is completed but a is not, b comes first
    }

    // 否則按更新時間排序
    // Otherwise sort by update time
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  // 分頁處理
  // Pagination processing
  const totalResults = allTasks.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages || 1)); // 確保頁碼有效 - Ensure page number is valid
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

// 根據平台生成適當的搜尋命令
// Generate appropriate search command based on platform
function generateSearchCommand(
  query: string,
  isId: boolean,
  memoryDir: string
): string {
  // 安全地轉義用戶輸入
  // Safely escape user input
  const safeQuery = escapeShellArg(query);
  const keywords = safeQuery.split(/\s+/).filter((k) => k.length > 0);

  // 檢測操作系統類型
  // Detect operating system type
  const isWindows = process.platform === "win32";

  if (isWindows) {
    // Windows環境，使用findstr命令
    // Windows environment, use findstr command
    if (isId) {
      // ID搜尋
      // ID search
      return `findstr /s /i /c:"${safeQuery}" "${memoryDir}\\*.json"`;
    } else if (keywords.length === 1) {
      // 單一關鍵字
      // Single keyword
      return `findstr /s /i /c:"${safeQuery}" "${memoryDir}\\*.json"`;
    } else {
      // 多關鍵字搜尋 - Windows中使用PowerShell
      // Multi-keyword search - use PowerShell in Windows
      const keywordPatterns = keywords.map((k) => `'${k}'`).join(" -and ");
      return `powershell -Command "Get-ChildItem -Path '${memoryDir}' -Filter *.json -Recurse | Select-String -Pattern ${keywordPatterns} | ForEach-Object { $_.Path }"`;
    }
  } else {
    // Unix/Linux/MacOS環境，使用grep命令
    // Unix/Linux/MacOS environment, use grep command
    if (isId) {
      return `grep -r --include="*.json" "${safeQuery}" "${memoryDir}"`;
    } else if (keywords.length === 1) {
      return `grep -r --include="*.json" "${safeQuery}" "${memoryDir}"`;
    } else {
      // 多關鍵字用管道連接多個grep命令
      // Multi-keyword using pipe to connect multiple grep commands
      const firstKeyword = escapeShellArg(keywords[0]);
      const otherKeywords = keywords.slice(1).map((k) => escapeShellArg(k));

      let cmd = `grep -r --include="*.json" "${firstKeyword}" "${memoryDir}"`;
      for (const keyword of otherKeywords) {
        cmd += ` | grep "${keyword}"`;
      }
      return cmd;
    }
  }
}

/**
 * 安全地轉義shell參數，防止命令注入
 */
/**
 * Safely escape shell arguments to prevent command injection
 */
function escapeShellArg(arg: string): string {
  if (!arg) return "";

  // 移除所有控制字符和特殊字符
  // Remove all control characters and special characters
  return arg
    .replace(/[\x00-\x1F\x7F]/g, "") // 控制字符
    .replace(/[&;`$"'<>|]/g, ""); // Shell 特殊字符 - Shell special characters
}

// 過濾當前任務列表
// Filter current task list
function filterCurrentTasks(
  tasks: Task[],
  query: string,
  isId: boolean
): Task[] {
  if (isId) {
    return tasks.filter((task) => task.id === query);
  } else {
    const keywords = query.split(/\s+/).filter((k) => k.length > 0);
    if (keywords.length === 0) return tasks;

    return tasks.filter((task) => {
      return keywords.every((keyword) => {
        const lowerKeyword = keyword.toLowerCase();
        return (
          task.name.toLowerCase().includes(lowerKeyword) ||
          task.description.toLowerCase().includes(lowerKeyword) ||
          (task.notes && task.notes.toLowerCase().includes(lowerKeyword)) ||
          (task.implementationGuide &&
            task.implementationGuide.toLowerCase().includes(lowerKeyword)) ||
          (task.summary && task.summary.toLowerCase().includes(lowerKeyword))
        );
      });
    });
  }
}

// 獲取初始請求
// Get initial request
export async function getInitialRequest(): Promise<string | undefined> {
  const tasksData = await readTasksData();
  return tasksData.initialRequest;
}

// 設置初始請求
// Set initial request
export async function setInitialRequest(initialRequest: string, commitMessage?: string): Promise<void> {
  const tasksData = await readTasksData();
  tasksData.initialRequest = initialRequest;
  
  const message = commitMessage || "Update initial request";
  await writeTasksData(tasksData, message);
}

// 獲取完整的任務數據（包含初始請求）
// Get complete tasks data (including initial request)
export async function getTasksData(): Promise<TasksData> {
  return await readTasksData();
}

// ==============================================
// History and Archive Functions
// ==============================================

interface TaskHistoryEntry {
  timestamp: string;
  commit: string;
  message: string;
  taskId?: string;
  taskName?: string;
  operation?: string;
}

interface TaskArchive {
  filename: string;
  timestamp: Date;
  tasksCount: number;
  size: number;
}

interface DeletedTaskInfo {
  task: Task;
  deletedAt: Date;
  backupFile: string;
}

// 獲取任務操作歷史
// Get task operation history
export async function getTaskHistory(
  options?: {
    taskId?: string;
    limit?: number;
    since?: Date;
    operation?: string;
  }
): Promise<TaskHistoryEntry[]> {
  try {
    const DATA_DIR = await getDataDir();
    await initGitIfNeeded(DATA_DIR);
    
    let gitCommand = `cd "${DATA_DIR}" && git log --pretty=format:"%H|%ai|%s" --grep="\\[.*\\]" tasks.json`;
    
    if (options?.limit) {
      gitCommand += ` -n ${options.limit}`;
    }
    
    if (options?.since) {
      const sinceDate = options.since.toISOString().split('T')[0];
      gitCommand += ` --since="${sinceDate}"`;
    }
    
    const { stdout } = await execAsync(gitCommand);
    
    if (!stdout.trim()) {
      return [];
    }
    
    const entries: TaskHistoryEntry[] = stdout
      .trim()
      .split('\n')
      .map(line => {
        const [commit, timestamp, message] = line.split('|');
        
        // Parse task information from commit message
        const taskIdMatch = message.match(/ID:\s*([a-f0-9-]+)/i);
        const taskNameMatch = message.match(/task:\s*([^\\n]+)/i);
        const operationMatch = message.match(/^\\[.*?\\]\\s*([^:]+)/);
        
        return {
          timestamp,
          commit,
          message,
          taskId: taskIdMatch ? taskIdMatch[1] : undefined,
          taskName: taskNameMatch ? taskNameMatch[1] : undefined,
          operation: operationMatch ? operationMatch[1].trim() : undefined,
        };
      });
    
    // Filter by taskId if specified
    let filteredEntries = entries;
    if (options?.taskId) {
      filteredEntries = entries.filter(entry => 
        entry.taskId === options.taskId || 
        entry.message.includes(options.taskId!)
      );
    }
    
    // Filter by operation if specified
    if (options?.operation) {
      filteredEntries = filteredEntries.filter(entry =>
        entry.operation?.toLowerCase().includes(options.operation!.toLowerCase()) ||
        entry.message.toLowerCase().includes(options.operation!.toLowerCase())
      );
    }
    
    return filteredEntries;
  } catch (error) {
    console.error('Error getting task history:', error);
    return [];
  }
}

// 創建任務存檔
// Create task archive
export async function createTaskArchive(
  description?: string
): Promise<{ success: boolean; archiveFile: string; message: string }> {
  try {
    const MEMORY_DIR = await getMemoryDir();
    const tasksData = await readTasksData();
    
    // Ensure memory directory exists
    try {
      await fs.access(MEMORY_DIR);
    } catch {
      await fs.mkdir(MEMORY_DIR, { recursive: true });
    }
    
    // Generate timestamp-based filename
    const timestamp = getLocalISOString().replace(/[:.]/g, '-');
    const archiveFile = path.join(MEMORY_DIR, `archive_${timestamp}.json`);
    
    // Create archive data with metadata
    const archiveData = {
      meta: {
        createdAt: getLocalDate(),
        description: description || 'Manual archive',
        tasksCount: tasksData.tasks.length,
        version: '1.0'
      },
      tasksData
    };
    
    // Write archive file
    await fs.writeFile(archiveFile, JSON.stringify(archiveData, null, 2));
    
    // Also commit current state before archiving
    const DATA_DIR = await getDataDir();
    await commitTaskChanges(DATA_DIR, `Create archive: ${description || 'Manual archive'}`);
    
    return {
      success: true,
      archiveFile,
      message: `Archive created successfully: ${path.basename(archiveFile)}`
    };
  } catch (error) {
    return {
      success: false,
      archiveFile: '',
      message: `Failed to create archive: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// 獲取已刪除的任務
// Get deleted tasks
export async function getDeletedTasks(
  options?: {
    limit?: number;
    since?: Date;
  }
): Promise<DeletedTaskInfo[]> {
  try {
    const MEMORY_DIR = await getMemoryDir();
    
    // Ensure memory directory exists
    try {
      await fs.access(MEMORY_DIR);
    } catch {
      return []; // No memory directory means no deleted tasks
    }
    
    // Get all backup files
    const files = await fs.readdir(MEMORY_DIR);
    const backupFiles = files.filter(file => 
      file.startsWith('backup_deleted_') && file.endsWith('.json')
    );
    
    const deletedTasks: DeletedTaskInfo[] = [];
    
    for (const file of backupFiles) {
      try {
        const filePath = path.join(MEMORY_DIR, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        const backupData = JSON.parse(content);
        
        // Extract timestamp from filename
        const timestampMatch = file.match(/backup_deleted_(.+)\.json$/);
        let deletedAt = stats.mtime;
        
        if (timestampMatch) {
          try {
            // Parse timestamp from filename
            const timestamp = timestampMatch[1].replace(/-/g, ':').replace(/T/g, ' ');
            deletedAt = new Date(timestamp);
          } catch {
            // Fall back to file modification time
            deletedAt = stats.mtime;
          }
        }
        
        // Filter by date if specified
        if (options?.since && deletedAt < options.since) {
          continue;
        }
        
        // Handle both single task and multiple tasks backup formats
        const tasks = Array.isArray(backupData) ? backupData : [backupData];
        
        for (const task of tasks) {
          if (task && task.id) {
            deletedTasks.push({
              task: {
                ...task,
                createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
                updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
                completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
              },
              deletedAt,
              backupFile: filePath
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to read backup file ${file}:`, error);
        continue;
      }
    }
    
    // Sort by deletion date (most recent first)
    deletedTasks.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());
    
    // Apply limit if specified
    if (options?.limit && deletedTasks.length > options.limit) {
      return deletedTasks.slice(0, options.limit);
    }
    
    return deletedTasks;
  } catch (error) {
    console.error('Error getting deleted tasks:', error);
    return [];
  }
}

// 恢復已刪除的任務
// Recover deleted task
export async function recoverTask(
  taskId: string
): Promise<{ success: boolean; message: string; recoveredTask?: Task }> {
  try {
    // First check if task already exists
    const existingTasks = await readTasks();
    const existingTask = existingTasks.find(task => task.id === taskId);
    
    if (existingTask) {
      return {
        success: false,
        message: 'Task already exists in current task list'
      };
    }
    
    // Find the deleted task
    const deletedTasks = await getDeletedTasks();
    const deletedTaskInfo = deletedTasks.find(info => info.task.id === taskId);
    
    if (!deletedTaskInfo) {
      return {
        success: false,
        message: 'Deleted task not found in backups'
      };
    }
    
    // Restore the task with updated timestamp
    const restoredTask: Task = {
      ...deletedTaskInfo.task,
      updatedAt: getLocalDate()
    };
    
    // Add the task back to the current task list
    const tasks = await readTasks();
    tasks.push(restoredTask);
    
    // Save the updated task list
    await writeTasks(tasks, `Recover task: ${restoredTask.name} (ID: ${taskId})`);
    
    return {
      success: true,
      message: `Task "${restoredTask.name}" recovered successfully`,
      recoveredTask: restoredTask
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to recover task: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// 列出任務存檔
// List task archives
export async function listTaskArchives(): Promise<TaskArchive[]> {
  try {
    const MEMORY_DIR = await getMemoryDir();
    
    // Ensure memory directory exists
    try {
      await fs.access(MEMORY_DIR);
    } catch {
      return []; // No memory directory means no archives
    }
    
    // Get all archive files
    const files = await fs.readdir(MEMORY_DIR);
    const archiveFiles = files.filter(file => 
      file.startsWith('archive_') && file.endsWith('.json')
    );
    
    const archives: TaskArchive[] = [];
    
    for (const file of archiveFiles) {
      try {
        const filePath = path.join(MEMORY_DIR, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf-8');
        const archiveData = JSON.parse(content);
        
        // Extract timestamp from filename
        const timestampMatch = file.match(/archive_(.+)\.json$/);
        let timestamp = stats.mtime;
        
        if (timestampMatch) {
          try {
            // Parse timestamp from filename
            const timestampStr = timestampMatch[1].replace(/-/g, ':').replace(/T/g, ' ');
            timestamp = new Date(timestampStr);
          } catch {
            // Fall back to file modification time
            timestamp = stats.mtime;
          }
        }
        
        // Get tasks count
        let tasksCount = 0;
        if (archiveData.meta && archiveData.meta.tasksCount) {
          tasksCount = archiveData.meta.tasksCount;
        } else if (archiveData.tasksData && archiveData.tasksData.tasks) {
          tasksCount = archiveData.tasksData.tasks.length;
        } else if (Array.isArray(archiveData.tasks)) {
          tasksCount = archiveData.tasks.length;
        }
        
        archives.push({
          filename: file,
          timestamp,
          tasksCount,
          size: stats.size
        });
      } catch (error) {
        console.warn(`Failed to read archive file ${file}:`, error);
        continue;
      }
    }
    
    // Sort by timestamp (most recent first)
    archives.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return archives;
  } catch (error) {
    console.error('Error listing task archives:', error);
    return [];
  }
}

// 從存檔恢復任務
// Restore tasks from archive
export async function restoreFromArchive(
  archiveFilename: string,
  options?: {
    merge?: boolean; // If true, merge with existing tasks; if false, replace all tasks
    preserveIds?: boolean; // If true, keep original task IDs; if false, generate new IDs
  }
): Promise<{ success: boolean; message: string; restoredCount?: number }> {
  try {
    const MEMORY_DIR = await getMemoryDir();
    const archiveFilePath = path.join(MEMORY_DIR, archiveFilename);
    
    // Check if archive exists
    try {
      await fs.access(archiveFilePath);
    } catch {
      return {
        success: false,
        message: 'Archive file not found'
      };
    }
    
    // Read archive data
    const content = await fs.readFile(archiveFilePath, 'utf-8');
    const archiveData = JSON.parse(content);
    
    // Extract tasks data from different archive formats
    let tasksToRestore: Task[] = [];
    
    if (archiveData.tasksData && archiveData.tasksData.tasks) {
      // New format with metadata
      tasksToRestore = archiveData.tasksData.tasks;
    } else if (Array.isArray(archiveData.tasks)) {
      // Old format - direct tasks array
      tasksToRestore = archiveData.tasks;
    } else if (Array.isArray(archiveData)) {
      // Very old format - direct array
      tasksToRestore = archiveData;
    } else {
      return {
        success: false,
        message: 'Invalid archive format'
      };
    }
    
    // Process tasks with date conversion
    const processedTasks: Task[] = tasksToRestore.map(task => ({
      ...task,
      id: options?.preserveIds ? task.id : uuidv4(), // Generate new ID if requested
      createdAt: task.createdAt ? new Date(task.createdAt) : getLocalDate(),
      updatedAt: getLocalDate(), // Always update the timestamp for restored tasks
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    }));
    
    // Handle merge vs replace
    let finalTasks: Task[] = [];
    
    if (options?.merge) {
      // Merge with existing tasks
      const existingTasks = await readTasks();
      const existingIds = new Set(existingTasks.map(t => t.id));
      
      // Only add tasks that don't already exist (by ID)
      const newTasks = processedTasks.filter(task => !existingIds.has(task.id));
      finalTasks = [...existingTasks, ...newTasks];
    } else {
      // Replace all tasks
      finalTasks = processedTasks;
    }
    
    // Save the tasks
    const action = options?.merge ? 'merge' : 'replace';
    await writeTasks(finalTasks, `Restore from archive: ${archiveFilename} (${action})`);
    
    // Calculate restored count properly for merge operations
    let restoredCount = processedTasks.length;
    if (options?.merge) {
      const existingTasks = await readTasks();
      const existingIds = new Set(existingTasks.map(t => t.id));
      restoredCount = processedTasks.filter(task => !existingIds.has(task.id)).length;
    }
    
    return {
      success: true,
      message: `Successfully restored ${restoredCount} tasks from archive`,
      restoredCount
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to restore from archive: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// 同步任務狀態
// Sync task state for frontend/backend alignment
export async function syncTaskState(): Promise<{
  success: boolean;
  message: string;
  stats?: {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    lastUpdated: Date;
    gitCommits: number;
    archives: number;
    deletedTaskBackups: number;
  };
}> {
  try {
    // Get current task state
    const tasksData = await readTasksData();
    const tasks = tasksData.tasks;
    
    // Calculate task statistics
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    
    // Get git history count
    let gitCommits = 0;
    try {
      const DATA_DIR = await getDataDir();
      await initGitIfNeeded(DATA_DIR);
      const { stdout } = await execAsync(`cd "${DATA_DIR}" && git rev-list --count HEAD 2>/dev/null || echo 0`);
      gitCommits = parseInt(stdout.trim()) || 0;
    } catch {
      gitCommits = 0;
    }
    
    // Get archive count
    const archives = await listTaskArchives();
    
    // Get deleted task backups count
    const deletedTasks = await getDeletedTasks();
    
    // Ensure git state is up to date
    try {
      const DATA_DIR = await getDataDir();
      await commitTaskChanges(DATA_DIR, 'Sync task state');
    } catch (error) {
      console.warn('Failed to commit current state:', error);
    }
    
    return {
      success: true,
      message: 'Task state synchronized successfully',
      stats: {
        totalTasks: tasks.length,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        lastUpdated: tasksData.updatedAt || getLocalDate(),
        gitCommits,
        archives: archives.length,
        deletedTaskBackups: deletedTasks.length
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to sync task state: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
