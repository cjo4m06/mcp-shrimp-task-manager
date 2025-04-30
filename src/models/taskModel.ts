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
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

// 確保獲取專案資料夾路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// 數據文件路徑
const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");

// 將exec轉換為Promise形式
const execPromise = promisify(exec);

// 確保數據目錄存在
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

// 讀取所有任務
async function readTasks(): Promise<Task[]> {
  await ensureDataDir();
  const data = await fs.readFile(TASKS_FILE, "utf-8");
  const tasks = JSON.parse(data).tasks;

  // 將日期字串轉換回 Date 物件
  return tasks.map((task: any) => ({
    ...task,
    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
    updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
    completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
  }));
}

// 寫入所有任務
async function writeTasks(tasks: Task[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(TASKS_FILE, JSON.stringify({ tasks }, null, 2));
}

// 獲取所有任務
export async function getAllTasks(): Promise<Task[]> {
  return await readTasks();
}

// 根據ID獲取任務
export async function getTaskById(taskId: string): Promise<Task | null> {
  const tasks = await readTasks();
  return tasks.find((task) => task.id === taskId) || null;
}

// 創建新任務
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

// 更新任務
export async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<Task | null> {
  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return null;
  }

  // 檢查任務是否已完成，已完成的任務不允許更新（除非是明確允許的欄位）
  if (tasks[taskIndex].status === TaskStatus.COMPLETED) {
    // 僅允許更新 summary 欄位（任務摘要）和 relatedFiles 欄位
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

// 更新任務狀態
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

// 更新任務摘要
export async function updateTaskSummary(
  taskId: string,
  summary: string
): Promise<Task | null> {
  return await updateTask(taskId, { summary });
}

// 更新任務內容
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
  // 獲取任務並檢查是否存在
  const task = await getTaskById(taskId);

  if (!task) {
    return { success: false, message: "找不到指定任務" };
  }

  // 檢查任務是否已完成
  if (task.status === TaskStatus.COMPLETED) {
    return { success: false, message: "無法更新已完成的任務" };
  }

  // 構建更新物件，只包含實際需要更新的欄位
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

  // 如果沒有要更新的內容，提前返回
  if (Object.keys(updateObj).length === 0) {
    return { success: true, message: "沒有提供需要更新的內容", task };
  }

  // 執行更新
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

// 更新任務相關文件
export async function updateTaskRelatedFiles(
  taskId: string,
  relatedFiles: RelatedFile[]
): Promise<{ success: boolean; message: string; task?: Task }> {
  // 獲取任務並檢查是否存在
  const task = await getTaskById(taskId);

  if (!task) {
    return { success: false, message: "找不到指定任務" };
  }

  // 檢查任務是否已完成
  if (task.status === TaskStatus.COMPLETED) {
    return { success: false, message: "無法更新已完成的任務" };
  }

  // 執行更新
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
    // 清除所有任務模式：清空任務列表
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

  // 創建新任務的列表
  const newTasks: Task[] = [];

  for (const taskData of taskDataList) {
    // 檢查是否為選擇性更新模式且該任務名稱已存在
    if (updateMode === "selective" && taskNameToIdMap.has(taskData.name)) {
      // 獲取現有任務的ID
      const existingTaskId = taskNameToIdMap.get(taskData.name)!;

      // 查找現有任務
      const existingTaskIndex = existingTasks.findIndex(
        (task) => task.id === existingTaskId
      );

      // 如果找到現有任務並且該任務未完成，則更新它
      if (
        existingTaskIndex !== -1 &&
        existingTasks[existingTaskIndex].status !== TaskStatus.COMPLETED
      ) {
        const taskToUpdate = existingTasks[existingTaskIndex];

        // 更新任務的基本信息，但保留原始ID、創建時間等
        const updatedTask: Task = {
          ...taskToUpdate,
          name: taskData.name,
          description: taskData.description,
          notes: taskData.notes,
          // 後面會處理 dependencies
          updatedAt: new Date(),
          // 新增：保存實現指南（如果有）
          implementationGuide: taskData.implementationGuide,
          // 新增：保存驗證標準（如果有）
          verificationCriteria: taskData.verificationCriteria,
          // 新增：保存全局分析結果（如果有）
          analysisResult: globalAnalysisResult,
        };

        // 處理相關文件（如果有）
        if (taskData.relatedFiles) {
          updatedTask.relatedFiles = taskData.relatedFiles;
        }

        // 將更新後的任務添加到新任務列表
        newTasks.push(updatedTask);

        // 從tasksToKeep中移除此任務，因為它已經被更新並添加到newTasks中了
        tasksToKeep = tasksToKeep.filter((task) => task.id !== existingTaskId);
      }
    } else {
      // 創建新任務
      const newTaskId = uuidv4();

      // 將新任務的名稱和ID添加到映射中
      taskNameToIdMap.set(taskData.name, newTaskId);

      const newTask: Task = {
        id: newTaskId,
        name: taskData.name,
        description: taskData.description,
        notes: taskData.notes,
        status: TaskStatus.PENDING,
        dependencies: [], // 後面會填充
        createdAt: new Date(),
        updatedAt: new Date(),
        relatedFiles: taskData.relatedFiles,
        // 新增：保存實現指南（如果有）
        implementationGuide: taskData.implementationGuide,
        // 新增：保存驗證標準（如果有）
        verificationCriteria: taskData.verificationCriteria,
        // 新增：保存全局分析結果（如果有）
        analysisResult: globalAnalysisResult,
      };

      newTasks.push(newTask);
    }
  }

  // 處理任務之間的依賴關係
  for (let i = 0; i < taskDataList.length; i++) {
    const taskData = taskDataList[i];
    const newTask = newTasks[i];

    // 如果存在依賴關係，處理它們
    if (taskData.dependencies && taskData.dependencies.length > 0) {
      const resolvedDependencies: TaskDependency[] = [];

      for (const dependencyName of taskData.dependencies) {
        // 首先嘗試將依賴項解釋為任務ID
        let dependencyTaskId = dependencyName;

        // 如果依賴項看起來不像UUID，則嘗試將其解釋為任務名稱
        if (
          !dependencyName.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          )
        ) {
          // 如果映射中存在此名稱，則使用對應的ID
          if (taskNameToIdMap.has(dependencyName)) {
            dependencyTaskId = taskNameToIdMap.get(dependencyName)!;
          } else {
            continue; // 跳過此依賴
          }
        } else {
          // 是UUID格式，但需要確認此ID是否對應實際存在的任務
          const idExists = [...tasksToKeep, ...newTasks].some(
            (task) => task.id === dependencyTaskId
          );
          if (!idExists) {
            continue; // 跳過此依賴
          }
        }

        resolvedDependencies.push({ taskId: dependencyTaskId });
      }

      newTask.dependencies = resolvedDependencies;
    }
  }

  // 合併保留的任務和新任務
  const allTasks = [...tasksToKeep, ...newTasks];

  // 寫入更新後的任務列表
  await writeTasks(allTasks);

  return newTasks;
}

// 檢查任務是否可以執行（所有依賴都已完成）
export async function canExecuteTask(
  taskId: string
): Promise<{ canExecute: boolean; blockedBy?: string[] }> {
  const task = await getTaskById(taskId);

  if (!task) {
    return { canExecute: false };
  }

  if (task.status === TaskStatus.COMPLETED) {
    return { canExecute: false }; // 已完成的任務不需要再執行
  }

  if (task.dependencies.length === 0) {
    return { canExecute: true }; // 沒有依賴的任務可以直接執行
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
export async function deleteTask(
  taskId: string
): Promise<{ success: boolean; message: string }> {
  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (taskIndex === -1) {
    return { success: false, message: "找不到指定任務" };
  }

  // 檢查任務狀態，已完成的任務不允許刪除
  if (tasks[taskIndex].status === TaskStatus.COMPLETED) {
    return { success: false, message: "無法刪除已完成的任務" };
  }

  // 檢查是否有其他任務依賴此任務
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
  tasks.splice(taskIndex, 1);
  await writeTasks(tasks);

  return { success: true, message: "任務刪除成功" };
}

// 評估任務複雜度
export async function assessTaskComplexity(
  taskId: string
): Promise<TaskComplexityAssessment | null> {
  const task = await getTaskById(taskId);

  if (!task) {
    return null;
  }

  // 評估各項指標
  const descriptionLength = task.description.length;
  const dependenciesCount = task.dependencies.length;
  const notesLength = task.notes ? task.notes.length : 0;
  const hasNotes = !!task.notes;

  // 基於各項指標評估複雜度級別
  let level = TaskComplexityLevel.LOW;

  // 描述長度評估
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
  const recommendations: string[] = [];

  // 低複雜度任務建議
  if (level === TaskComplexityLevel.LOW) {
    recommendations.push("此任務複雜度較低，可直接執行");
    recommendations.push("建議設定清晰的完成標準，確保驗收有明確依據");
  }
  // 中等複雜度任務建議
  else if (level === TaskComplexityLevel.MEDIUM) {
    recommendations.push("此任務具有一定複雜性，建議詳細規劃執行步驟");
    recommendations.push("可分階段執行並定期檢查進度，確保理解準確且實施完整");
    if (dependenciesCount > 0) {
      recommendations.push("注意檢查所有依賴任務的完成狀態和輸出質量");
    }
  }
  // 高複雜度任務建議
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
export async function clearAllTasks(): Promise<{
  success: boolean;
  message: string;
  backupFile?: string;
}> {
  try {
    // 確保數據目錄存在
    await ensureDataDir();

    // 讀取現有任務
    const allTasks = await readTasks();

    // 如果沒有任務，直接返回
    if (allTasks.length === 0) {
      return { success: true, message: "沒有任務需要清除" };
    }

    // 篩選出已完成的任務
    const completedTasks = allTasks.filter(
      (task) => task.status === TaskStatus.COMPLETED
    );

    // 創建備份文件名
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\..+/, "");
    const backupFileName = `tasks_memory_${timestamp}.json`;

    // 確保 memory 目錄存在
    const MEMORY_DIR = path.join(DATA_DIR, "memory");
    try {
      await fs.access(MEMORY_DIR);
    } catch (error) {
      await fs.mkdir(MEMORY_DIR, { recursive: true });
    }

    // 創建 memory 目錄下的備份路徑
    const memoryFilePath = path.join(MEMORY_DIR, backupFileName);

    // 同時寫入到 memory 目錄 (只包含已完成的任務)
    await fs.writeFile(
      memoryFilePath,
      JSON.stringify({ tasks: completedTasks }, null, 2)
    );

    // 清空任務文件
    await writeTasks([]);

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
  const currentTasks = await readTasks();
  let memoryTasks: Task[] = [];

  // 搜尋記憶資料夾中的任務
  const MEMORY_DIR = path.join(DATA_DIR, "memory");

  try {
    // 確保記憶資料夾存在
    await fs.access(MEMORY_DIR);

    // 生成搜尋命令
    const cmd = generateSearchCommand(query, isId, MEMORY_DIR);

    // 如果有搜尋命令，執行它
    if (cmd) {
      try {
        const { stdout } = await execPromise(cmd, {
          maxBuffer: 1024 * 1024 * 10,
        });

        if (stdout) {
          // 解析搜尋結果，提取符合的檔案路徑
          const matchedFiles = new Set<string>();

          stdout.split("\n").forEach((line) => {
            if (line.trim()) {
              // 格式通常是: 文件路徑:匹配內容
              const filePath = line.split(":")[0];
              if (filePath) {
                matchedFiles.add(filePath);
              }
            }
          });

          // 限制讀取檔案數量
          const MAX_FILES_TO_READ = 10;
          const sortedFiles = Array.from(matchedFiles)
            .sort()
            .reverse()
            .slice(0, MAX_FILES_TO_READ);

          // 只處理符合條件的檔案
          for (const filePath of sortedFiles) {
            try {
              const data = await fs.readFile(filePath, "utf-8");
              const tasks = JSON.parse(data).tasks || [];

              // 格式化日期字段
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

              // 進一步過濾任務確保符合條件
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
  const filteredCurrentTasks = filterCurrentTasks(currentTasks, query, isId);

  // 合併結果並去重
  const taskMap = new Map<string, Task>();

  // 當前任務優先
  filteredCurrentTasks.forEach((task) => {
    taskMap.set(task.id, task);
  });

  // 加入記憶任務，避免重複
  memoryTasks.forEach((task) => {
    if (!taskMap.has(task.id)) {
      taskMap.set(task.id, task);
    }
  });

  // 合併後的結果
  const allTasks = Array.from(taskMap.values());

  // 排序 - 按照更新或完成時間降序排列
  allTasks.sort((a, b) => {
    // 優先按完成時間排序
    if (a.completedAt && b.completedAt) {
      return b.completedAt.getTime() - a.completedAt.getTime();
    } else if (a.completedAt) {
      return -1; // a完成了但b未完成，a排前面
    } else if (b.completedAt) {
      return 1; // b完成了但a未完成，b排前面
    }

    // 否則按更新時間排序
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  // 分頁處理
  const totalResults = allTasks.length;
  const totalPages = Math.ceil(totalResults / pageSize);
  const safePage = Math.max(1, Math.min(page, totalPages || 1)); // 確保頁碼有效
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
function generateSearchCommand(
  query: string,
  isId: boolean,
  memoryDir: string
): string {
  // 安全地轉義用戶輸入
  const safeQuery = escapeShellArg(query);
  const keywords = safeQuery.split(/\s+/).filter((k) => k.length > 0);

  // 檢測操作系統類型
  const isWindows = process.platform === "win32";

  if (isWindows) {
    // Windows環境，使用findstr命令
    if (isId) {
      // ID搜尋
      return `findstr /s /i /c:"${safeQuery}" "${memoryDir}\\*.json"`;
    } else if (keywords.length === 1) {
      // 單一關鍵字
      return `findstr /s /i /c:"${safeQuery}" "${memoryDir}\\*.json"`;
    } else {
      // 多關鍵字搜尋 - Windows中使用PowerShell
      const keywordPatterns = keywords.map((k) => `'${k}'`).join(" -and ");
      return `powershell -Command "Get-ChildItem -Path '${memoryDir}' -Filter *.json -Recurse | Select-String -Pattern ${keywordPatterns} | ForEach-Object { $_.Path }"`;
    }
  } else {
    // Unix/Linux/MacOS環境，使用grep命令
    if (isId) {
      return `grep -r --include="*.json" "${safeQuery}" "${memoryDir}"`;
    } else if (keywords.length === 1) {
      return `grep -r --include="*.json" "${safeQuery}" "${memoryDir}"`;
    } else {
      // 多關鍵字用管道連接多個grep命令
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
function escapeShellArg(arg: string): string {
  if (!arg) return "";

  // 移除所有控制字符和特殊字符
  return arg
    .replace(/[\x00-\x1F\x7F]/g, "") // 控制字符
    .replace(/[&;`$"'<>|]/g, ""); // Shell 特殊字符
}

// 過濾當前任務列表
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
