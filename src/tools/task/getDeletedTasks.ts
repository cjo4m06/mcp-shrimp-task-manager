import { z } from "zod";
import { getDeletedTasks as modelGetDeletedTasks } from "../../models/taskModel.js";
import { getGetDeletedTasksPrompt } from "../../prompts/index.js";

// 獲取已刪除任務工具
// Get deleted tasks tool
export const getDeletedTasksSchema = z.object({
  since: z
    .string()
    .optional()
    .describe("可選的時間戳，僅返回此時間之後刪除的任務（ISO 8601 格式）"),
    // Optional timestamp, only return tasks deleted after this time (ISO 8601 format)
});

export async function getDeletedTasks({
  since,
}: z.infer<typeof getDeletedTasksSchema>) {
  try {
    // Parse since parameter if provided
    let sinceDate: Date | undefined = undefined;
    if (since) {
      try {
        sinceDate = new Date(since);
        // Validate the date
        if (isNaN(sinceDate.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `## 系統錯誤\n\n無效的日期格式: ${since}。請使用 ISO 8601 格式 (例如: 2023-12-01T10:00:00Z)`,
              // ## System Error\n\nInvalid date format: ${since}. Please use ISO 8601 format (e.g.: 2023-12-01T10:00:00Z)
            },
          ],
          isError: true,
        };
      }
    }

    // Get deleted tasks using model function
    const deletedTaskInfos = await modelGetDeletedTasks({
      since: sinceDate,
      limit: 50, // Reasonable limit to prevent excessive results
    });

    // Use prompt generator to get the final prompt
    const prompt = await getGetDeletedTasksPrompt({
      since,
      deletedTasks: deletedTaskInfos,
      totalCount: deletedTaskInfos.length,
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
          text: `## 系統錯誤\n\n獲取已刪除任務時發生錯誤: ${
            // ## System Error\n\nAn error occurred while getting deleted tasks: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}