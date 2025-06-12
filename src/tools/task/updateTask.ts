import { z } from 'zod';
import { UUID_V4_REGEX } from '../../utils/regex.js';
import { getTaskById, updateTaskContent as modelUpdateTaskContent } from '../../models/taskModel.js';
import { RelatedFileType } from '../../types/index.js';
import { getUpdateTaskContentPrompt } from '../../prompts/index.js';

// 更新任務內容工具
export const updateTaskContentSchema = z.object({
  taskId: z
    .string()
    .regex(UUID_V4_REGEX, {
      message: '任務ID格式無效，請提供有效的UUID v4格式',
    })
    .describe('待更新任務的唯一標識符，必須是系統中存在且未完成的任務ID'),
  name: z.string().optional().describe('任務的新名稱（選填）'),
  description: z.string().optional().describe('任務的新描述內容（選填）'),
  notes: z.string().optional().describe('任務的新補充說明（選填）'),
  dependencies: z.array(z.string()).optional().describe('任務的新依賴關係（選填）'),
  relatedFiles: z
    .array(
      z.object({
        path: z
          .string()
          .min(1, { message: '文件路徑不能為空，請提供有效的文件路徑' })
          .describe('文件路徑，可以是相對於項目根目錄的路徑或絕對路徑'),
        type: z
          .nativeEnum(RelatedFileType)
          .describe('文件與任務的關係類型 (TO_MODIFY, REFERENCE, CREATE, DEPENDENCY, OTHER)'),
        description: z.string().optional().describe('文件的補充描述（選填）'),
        lineStart: z.number().int().positive().optional().describe('相關代碼區塊的起始行（選填）'),
        lineEnd: z.number().int().positive().optional().describe('相關代碼區塊的結束行（選填）'),
      })
    )
    .optional()
    .describe('與任務相關的文件列表，用於記錄與任務相關的代碼文件、參考資料、要建立的檔案等（選填）'),
  implementationGuide: z.string().optional().describe('任務的新實現指南（選填）'),
  verificationCriteria: z.string().optional().describe('任務的新驗證標準（選填）'),
});

export async function updateTaskContent({
  taskId,
  name,
  description,
  notes,
  relatedFiles,
  dependencies,
  implementationGuide,
  verificationCriteria,
}: z.infer<typeof updateTaskContentSchema>) {
  if (relatedFiles) {
    for (const file of relatedFiles) {
      if (
        (file.lineStart && !file.lineEnd) ||
        (!file.lineStart && file.lineEnd) ||
        (file.lineStart && file.lineEnd && file.lineStart > file.lineEnd)
      ) {
        return {
          content: [
            {
              type: 'text' as const,
              text: getUpdateTaskContentPrompt({
                taskId,
                validationError: '行號設置無效：必須同時設置起始行和結束行，且起始行必須小於結束行',
              }),
            },
          ],
        };
      }
    }
  }

  if (!(name || description || notes || dependencies || implementationGuide || verificationCriteria || relatedFiles)) {
    return {
      content: [
        {
          type: 'text' as const,
          text: getUpdateTaskContentPrompt({
            taskId,
            emptyUpdate: true,
          }),
        },
      ],
    };
  }

  // 獲取任務以檢查它是否存在
  const task = await getTaskById(taskId);

  if (!task) {
    return {
      content: [
        {
          type: 'text' as const,
          text: getUpdateTaskContentPrompt({
            taskId,
          }),
        },
      ],
      isError: true,
    };
  }

  // 記錄要更新的任務和內容
  let updateSummary = `準備更新任務：${task.name} (ID: ${task.id})`;
  if (name) updateSummary += `，新名稱：${name}`;
  if (description) updateSummary += `，更新描述`;
  if (notes) updateSummary += `，更新注記`;
  if (relatedFiles) updateSummary += `，更新相關文件 (${relatedFiles.length} 個)`;
  if (dependencies) updateSummary += `，更新依賴關係 (${dependencies.length} 個)`;
  if (implementationGuide) updateSummary += `，更新實現指南`;
  if (verificationCriteria) updateSummary += `，更新驗證標準`;

  // 執行更新操作
  const result = await modelUpdateTaskContent(taskId, {
    name,
    description,
    notes,
    relatedFiles,
    dependencies,
    implementationGuide,
    verificationCriteria,
  });

  return {
    content: [
      {
        type: 'text' as const,
        text: getUpdateTaskContentPrompt({
          taskId,
          task,
          success: result.success,
          message: result.message,
          updatedTask: result.task,
        }),
      },
    ],
    isError: !result.success,
  };
}
