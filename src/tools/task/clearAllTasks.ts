import { z } from "zod";
import {
  getAllTasks,
  clearAllTasks as modelClearAllTasks,
} from "../../models/taskModel.js";
import { getClearAllTasksPrompt } from "../../prompts/index.js";

// 清除所有任務工具
export const clearAllTasksSchema = z.object({
  confirm: z
    .boolean()
    .refine((val) => val === true, {
      message:
        "必須明確確認清除操作，請將 confirm 參數設置為 true 以確認此危險操作",
    })
    .describe("確認刪除所有未完成的任務（此操作不可逆）"),
});

export async function clearAllTasks({
  confirm,
}: z.infer<typeof clearAllTasksSchema>) {
  // 安全檢查：如果沒有確認，則拒絕操作
  if (!confirm) {
    return {
      content: [
        {
          type: "text" as const,
          text: getClearAllTasksPrompt({ confirm: false }),
        },
      ],
    };
  }

  // 檢查是否真的有任務需要清除
  const allTasks = await getAllTasks();
  if (allTasks.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: getClearAllTasksPrompt({ isEmpty: true }),
        },
      ],
    };
  }

  // 執行清除操作
  const result = await modelClearAllTasks();

  return {
    content: [
      {
        type: "text" as const,
        text: getClearAllTasksPrompt({
          success: result.success,
          message: result.message,
          backupFile: result.backupFile,
        }),
      },
    ],
    isError: !result.success,
  };
}
