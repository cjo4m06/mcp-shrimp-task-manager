import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import { getAllTasks } from "../../models/taskModel.js";
import { TaskStatus, Task } from "../../types/index.js";
import { getPlanTaskPrompt } from "../../prompts/index.js";

// 開始規劃工具
export const planTaskSchema = z.object({
  description: z
    .string()
    .min(10, {
      message: "任務描述不能少於10個字符，請提供更詳細的描述以確保任務目標明確",
    })
    .describe("完整詳細的任務問題描述，應包含任務目標、背景及預期成果"),
  requirements: z
    .string()
    .optional()
    .describe("任务的特定技术要求、业务约束条件或品质标准（选填）"),
  existingTasksReference: z
    .boolean()
    .optional()
    .describe("是否参考现有任务作为规划基础，用于任务调整和延续性规划"),
  taskBrief: z
    .string()
    .max(20, { message: "任务简介不能超过20个字符" })
    .optional()
    .describe("任务的简短概括，不超过20个字，可选"),
});

export async function planTask({
  description,
  requirements,
  existingTasksReference = false,
}: z.infer<typeof planTaskSchema>) {
  // 獲取基礎目錄路徑
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const PROJECT_ROOT = path.resolve(__dirname, "../../..");
  const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, "data");
  const MEMORY_DIR = path.join(DATA_DIR, "memory");

  // 準備所需參數
  let completedTasks: Task[] = [];
  let pendingTasks: Task[] = [];

  // 當 existingTasksReference 為 true 時，從數據庫中載入所有任務作為參考
  if (existingTasksReference) {
    try {
      const allTasks = await getAllTasks();

      // 將任務分為已完成和未完成兩類
      completedTasks = allTasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      );
      pendingTasks = allTasks.filter(
        (task) => task.status !== TaskStatus.COMPLETED
      );
    } catch (error) {}
  }

  // 使用prompt生成器獲取最終prompt
  const prompt = getPlanTaskPrompt({
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
