import { z } from 'zod';
import { getAllTasks, batchCreateOrUpdateTasks, clearAllTasks as modelClearAllTasks } from '../../models/taskModel.js';
import { RelatedFileType, Task } from '../../types/index.js';
import { getSplitTasksPrompt } from '../../prompts/index.js';

// 拆分任務工具
export const splitTasksSchema = z.object({
  updateMode: z
    .enum(['append', 'overwrite', 'selective', 'clearAllTasks'])
    .describe(
      "任務更新模式選擇：'append'(保留所有現有任務並添加新任務)、'overwrite'(清除所有未完成任務並完全替換，保留已完成任務)、'selective'(智能更新：根據任務名稱匹配更新現有任務，保留不在列表中的任務，推薦用於任務微調)、'clearAllTasks'(清除所有任務並創建備份)。\n預設為'clearAllTasks'模式，只有用戶要求變更或修改計劃內容才使用其他模式"
    ),
  tasks: z
    .array(
      z.object({
        name: z
          .string()
          .max(100, {
            message: '任務名稱過長，請限制在100個字符以內',
          })
          .describe('簡潔明確的任務名稱，應能清晰表達任務目的'),
        description: z
          .string()
          .min(10, {
            message: '任務描述過短，請提供更詳細的內容以確保理解',
          })
          .describe('詳細的任務描述，包含實施要點、技術細節和驗收標準'),
        implementationGuide: z
          .string()
          .describe('此特定任務的具體實現方法和步驟，請參考之前的分析結果提供精簡pseudocode'),
        dependencies: z
          .array(z.string())
          .optional()
          .describe('此任務依賴的前置任務ID或任務名稱列表，支持兩種引用方式，名稱引用更直觀，是一個字串陣列'),
        notes: z.string().optional().describe('補充說明、特殊處理要求或實施建議（選填）'),
        relatedFiles: z
          .array(
            z.object({
              path: z
                .string()
                .min(1, {
                  message: '文件路徑不能為空',
                })
                .describe('文件路徑，可以是相對於項目根目錄的路徑或絕對路徑'),
              type: z
                .nativeEnum(RelatedFileType)
                .describe(
                  '文件類型 (TO_MODIFY: 待修改, REFERENCE: 參考資料, CREATE: 待建立, DEPENDENCY: 依賴文件, OTHER: 其他)'
                ),
              description: z
                .string()
                .min(1, {
                  message: '文件描述不能為空',
                })
                .describe('文件描述，用於說明文件的用途和內容'),
              lineStart: z.number().int().positive().optional().describe('相關代碼區塊的起始行（選填）'),
              lineEnd: z.number().int().positive().optional().describe('相關代碼區塊的結束行（選填）'),
            })
          )
          .optional()
          .describe('與任務相關的文件列表，用於記錄與任務相關的代碼文件、參考資料、要建立的文件等（選填）'),
        verificationCriteria: z.string().optional().describe('此特定任務的驗證標準和檢驗方法'),
      })
    )
    .min(1, {
      message: '請至少提供一個任務',
    })
    .describe(
      '結構化的任務清單，每個任務應保持原子性且有明確的完成標準，避免過於簡單的任務，簡單修改可與其他任務整合，避免任務過多'
    ),
  globalAnalysisResult: z.string().optional().describe('任務最終目標，來自之前分析適用於所有任務的通用部分'),
});

export async function splitTasks({ updateMode, tasks, globalAnalysisResult }: z.infer<typeof splitTasksSchema>) {
  try {
    // 檢查 tasks 裡面的 name 是否有重複
    const nameSet = new Set();
    for (const task of tasks) {
      if (nameSet.has(task.name)) {
        return {
          content: [
            {
              type: 'text' as const,
              text: 'tasks 參數中存在重複的任務名稱，請確保每個任務名稱是唯一的',
            },
          ],
        };
      }
      nameSet.add(task.name);
    }

    // 根據不同的更新模式處理任務
    let message = '';
    let actionSuccess = true;
    let backupFile = null;
    let createdTasks: Task[] = [];
    let allTasks: Task[] = [];

    // 將任務資料轉換為符合batchCreateOrUpdateTasks的格式
    const convertedTasks = tasks.map((task) => ({
      name: task.name,
      description: task.description,
      notes: task.notes,
      dependencies: task.dependencies,
      implementationGuide: task.implementationGuide,
      verificationCriteria: task.verificationCriteria,
      relatedFiles: task.relatedFiles?.map((file) => ({
        path: file.path,
        type: file.type as RelatedFileType,
        description: file.description,
        lineStart: file.lineStart,
        lineEnd: file.lineEnd,
      })),
    }));

    // 處理 clearAllTasks 模式
    if (updateMode === 'clearAllTasks') {
      const clearResult = await modelClearAllTasks();

      if (clearResult.success) {
        message = clearResult.message;
        backupFile = clearResult.backupFile;

        try {
          // 清空任務後再創建新任務
          createdTasks = await batchCreateOrUpdateTasks(convertedTasks, 'append', globalAnalysisResult);
          message += `\n成功創建了 ${createdTasks.length} 個新任務。`;
        } catch (error) {
          actionSuccess = false;
          message += `\n創建新任務時發生錯誤: ${error instanceof Error ? error.message : String(error)}`;
        }
      } else {
        actionSuccess = false;
        message = clearResult.message;
      }
    } else {
      // 對於其他模式，直接使用 batchCreateOrUpdateTasks
      try {
        createdTasks = await batchCreateOrUpdateTasks(convertedTasks, updateMode, globalAnalysisResult);

        // 根據不同的更新模式生成消息
        switch (updateMode) {
          case 'append':
            message = `成功追加了 ${createdTasks.length} 個新任務。`;
            break;
          case 'overwrite':
            message = `成功清除未完成任務並創建了 ${createdTasks.length} 個新任務。`;
            break;
          case 'selective':
            message = `成功選擇性更新/創建了 ${createdTasks.length} 個任務。`;
            break;
        }
      } catch (error) {
        actionSuccess = false;
        message = `任務創建失敗：${error instanceof Error ? error.message : String(error)}`;
      }
    }

    // 獲取所有任務用於顯示依賴關係
    try {
      allTasks = await getAllTasks();
    } catch (error) {
      allTasks = [...createdTasks]; // 如果獲取失敗，至少使用剛創建的任務
    }

    // 使用prompt生成器獲取最終prompt
    const prompt = getSplitTasksPrompt({
      updateMode,
      createdTasks,
      allTasks,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: prompt,
        },
      ],
      ephemeral: {
        taskCreationResult: {
          success: actionSuccess,
          message,
          backupFilePath: backupFile,
        },
      },
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: '執行任務拆分時發生錯誤: ' + (error instanceof Error ? error.message : String(error)),
        },
      ],
    };
  }
}
