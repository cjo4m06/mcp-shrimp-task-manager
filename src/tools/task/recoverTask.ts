import { z } from "zod";
import { recoverTask as modelRecoverTask } from "../../models/taskModel.js";
import { getRecoverTaskPrompt } from "../../prompts/index.js";

// 恢復任務工具
// Recover task tool
export const recoverTaskSchema = z.object({
  task_id: z
    .string()
    .min(1, {
      message: "任務ID不能為空",
      // Task ID cannot be empty
    })
    .describe("待恢復任務的唯一標識符，必須是系統中存在的有效任務ID"),
    // Unique identifier of the task to recover, must be a valid task ID that exists in the system
});

export async function recoverTask({
  task_id,
}: z.infer<typeof recoverTaskSchema>) {
  try {
    // Validate task ID format (basic UUID pattern check)
    const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidPattern.test(task_id)) {
      return {
        content: [
          {
            type: "text" as const,
            text: `## 系統錯誤\n\n無效的任務ID格式: ${task_id}。任務ID必須是有效的UUID格式。`,
            // ## System Error\n\nInvalid task ID format: ${task_id}. Task ID must be a valid UUID format.
          },
        ],
        isError: true,
      };
    }

    // Attempt to recover the task using existing function
    const result = await modelRecoverTask(task_id);

    // Use prompt generator to get the final prompt
    const prompt = await getRecoverTaskPrompt({
      taskId: task_id,
      success: result.success,
      message: result.message,
      recoveredTask: result.recoveredTask,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: prompt,
        },
      ],
      isError: !result.success,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `## 系統錯誤\n\n恢復任務時發生錯誤: ${
            // ## System Error\n\nAn error occurred while recovering task: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}