import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import { getAllTasks, setInitialRequest } from "../../models/taskModel.js";
import { TaskStatus, Task } from "../../types/index.js";
import { getPlanTaskPrompt } from "../../prompts/index.js";
import { getMemoryDir } from "../../utils/paths.js";

// 開始規劃工具
// Start planning tool
export const planTaskSchema = z.object({
  description: z
    .string()
    .min(10, {
      message: "任務描述不能少於10個字符，請提供更詳細的描述以確保任務目標明確",
      // Task description cannot be less than 10 characters, please provide a more detailed description to ensure clear task objectives
    })
    .describe("完整詳細的任務問題描述，應包含任務目標、背景及預期成果"),
    // Complete and detailed task problem description, should include task objectives, background and expected results
  requirements: z
    .string()
    .optional()
    .describe("任務的特定技術要求、業務約束條件或品質標準（選填）"),
    // Specific technical requirements, business constraints or quality standards for the task (optional)
  existingTasksReference: z
    .boolean()
    .optional()
    .default(false)
    .describe("是否參考現有任務作為規劃基礎，用於任務調整和延續性規劃"),
    // Whether to reference existing tasks as a planning foundation, used for task adjustment and continuity planning
});

export async function planTask({
  description,
  requirements,
  existingTasksReference = false,
}: z.infer<typeof planTaskSchema>) {
  // 獲取基礎目錄路徑
  // Get base directory path
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const PROJECT_ROOT = path.resolve(__dirname, "../../..");
  const MEMORY_DIR = await getMemoryDir();

  // 準備所需參數
  // Prepare required parameters
  let completedTasks: Task[] = [];
  let pendingTasks: Task[] = [];

  // 當 existingTasksReference 為 true 時，從數據庫中載入所有任務作為參考
  // When existingTasksReference is true, load all tasks from database as reference
  if (existingTasksReference) {
    try {
      const allTasks = await getAllTasks();

      // 將任務分為已完成和未完成兩類
      // Divide tasks into completed and incomplete categories
      completedTasks = allTasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      );
      pendingTasks = allTasks.filter(
        (task) => task.status !== TaskStatus.COMPLETED
      );
    } catch (error) {}
  }

  // 如果不是參考現有任務（即新的規劃），儲存初始請求
  // If not referencing existing tasks (i.e., new planning), save the initial request
  if (!existingTasksReference) {
    const initialRequestText = requirements 
      ? `${description}\n\n要求: ${requirements}`
      : description;
    
    try {
      await setInitialRequest(initialRequestText, "Save initial user request");
    } catch (error) {
      console.error("Failed to save initial request:", error);
      // 不要因為儲存初始請求失敗而中斷任務規劃
      // Don't interrupt task planning due to failure to save initial request
    }
  }

  // 使用prompt生成器獲取最終prompt
  // Use prompt generator to get the final prompt
  const prompt = await getPlanTaskPrompt({
    description,
    requirements,
    existingTasksReference,
    completedTasks,
    pendingTasks,
    memoryDir: MEMORY_DIR,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: prompt,
      },
    ],
  };
}
