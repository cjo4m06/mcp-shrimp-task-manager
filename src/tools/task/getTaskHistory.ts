import { z } from "zod";
import { getTaskHistory as modelGetTaskHistory } from "../../models/taskModel.js";
import { getTaskHistoryPrompt } from "../../prompts/index.js";

// 獲取任務歷史工具
// Get task history tool
export const getTaskHistorySchema = z.object({
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .default(50)
    .describe("限制返回的歷史記錄數量，默認為50條"),
    // Limit the number of history records returned, default is 50
  include_deleted: z
    .boolean()
    .optional()
    .default(true)
    .describe("是否包含已刪除任務的歷史記錄，默認為true"),
    // Whether to include history records of deleted tasks, default is true
  since: z
    .string()
    .datetime()
    .optional()
    .describe("僅返回指定日期之後的歷史記錄，ISO8601格式"),
    // Only return history records after the specified date, ISO8601 format
  task_id: z
    .string()
    .optional()
    .describe("僅返回指定任務ID的歷史記錄"),
    // Only return history records for the specified task ID
  operation: z
    .string()
    .optional()
    .describe("按操作類型過濾歷史記錄（如：create, update, complete, delete）"),
    // Filter history records by operation type (e.g., create, update, complete, delete)
});

export async function getTaskHistory({
  limit = 50,
  include_deleted = true,
  since,
  task_id,
  operation,
}: z.infer<typeof getTaskHistorySchema>) {
  try {
    // 準備調用模型函數的選項
    // Prepare options for calling model function
    const options: Parameters<typeof modelGetTaskHistory>[0] = {};
    
    if (limit) {
      options.limit = limit;
    }
    
    if (since) {
      options.since = new Date(since);
    }
    
    if (task_id) {
      options.taskId = task_id;
    }
    
    if (operation) {
      options.operation = operation;
    }

    // 調用模型函數獲取歷史記錄
    // Call model function to get history records
    const historyEntries = await modelGetTaskHistory(options);

    // 使用prompt生成器獲取最終prompt
    // Use prompt generator to get the final prompt
    const prompt = await getTaskHistoryPrompt({
      entries: historyEntries,
      filters: {
        limit,
        include_deleted,
        since,
        task_id,
        operation,
      },
      totalEntries: historyEntries.length,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: prompt,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `## 系統錯誤\n\n獲取任務歷史時發生錯誤: ${
            // ## System Error\n\nAn error occurred while getting task history: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}