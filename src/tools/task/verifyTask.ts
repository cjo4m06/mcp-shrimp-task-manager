import { z } from 'zod';
import { UUID_V4_REGEX } from '../../utils/regex.js';
import { getTaskById, updateTaskStatus, updateTaskSummary } from '../../models/taskModel.js';
import { TaskStatus } from '../../types/index.js';
import { getVerifyTaskPrompt } from '../../prompts/index.js';

// 檢驗任務工具
export const verifyTaskSchema = z.object({
  taskId: z
    .string()
    .regex(UUID_V4_REGEX, {
      message: '任務ID格式無效，請提供有效的UUID v4格式',
    })
    .describe('待驗證任務的唯一標識符，必須是系統中存在的有效任務ID'),
  summary: z
    .string()
    .min(30, {
      message: '最少30個字',
    })
    .describe(
      '當分數高於或等於 80分時代表任務完成摘要，簡潔描述實施結果和重要決策，當分數低於 80分時代表缺失或需要修正的部分說明，最少30個字'
    ),
  score: z
    .number()
    .min(0, { message: '分數不能小於0' })
    .max(100, { message: '分數不能大於100' })
    .describe('針對任務的評分，當評分等於或超過80分時自動完成任務'),
});

export async function verifyTask({ taskId, summary, score }: z.infer<typeof verifyTaskSchema>) {
  const task = await getTaskById(taskId);

  if (!task) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `## 系統錯誤\n\n找不到ID為 \`${taskId}\` 的任務。請使用「list_tasks」工具確認有效的任務ID後再試。`,
        },
      ],
      isError: true,
    };
  }

  if (task.status !== TaskStatus.IN_PROGRESS) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `## 狀態錯誤\n\n任務 "${task.name}" (ID: \`${task.id}\`) 當前狀態為 "${task.status}"，不處於進行中狀態，無法進行檢驗。\n\n只有狀態為「進行中」的任務才能進行檢驗。請先使用「execute_task」工具開始任務執行。`,
        },
      ],
      isError: true,
    };
  }

  if (score >= 80) {
    // 更新任務狀態為已完成，並添加摘要
    await updateTaskSummary(taskId, summary);
    await updateTaskStatus(taskId, TaskStatus.COMPLETED);
  }

  // 使用prompt生成器獲取最終prompt
  const prompt = getVerifyTaskPrompt({ task, score, summary });

  return {
    content: [
      {
        type: 'text' as const,
        text: prompt,
      },
    ],
  };
}
