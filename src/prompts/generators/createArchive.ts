/**
 * createArchive prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */
/**
 * createArchive prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * createArchive prompt 參數介面
 * createArchive prompt parameters interface
 */
export interface CreateArchivePromptParams {
  success: boolean;
  message: string;
  archiveFile?: string;
  timestamp?: Date;
  taskCount?: number;
  fileSize?: string;
  errorMessage?: string;
}

/**
 * 獲取 createArchive 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
/**
 * Get complete prompt for createArchive
 * @param params prompt parameters
 * @returns generated prompt
 */
export async function getCreateArchivePrompt(
  params: CreateArchivePromptParams
): Promise<string> {
  const { success, message, archiveFile, timestamp, taskCount, fileSize, errorMessage } = params;

  // 準備結果狀態
  // Prepare result status
  const resultStatus = success ? "✅ 操作成功" : "❌ 操作失敗";

  let archiveInfo = "";
  let errorDetails = "";

  if (success && archiveFile) {
    // 成功情況的詳細信息
    // Detailed information for success case
    const successTemplate = await loadPromptFromTemplate("createArchive/success.md");
    archiveInfo = generatePrompt(successTemplate, {
      archiveFile,
      timestamp: timestamp ? timestamp.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Taipei'
      }) : new Date().toLocaleString('zh-TW'),
      taskCount: taskCount || 0,
      fileSize: fileSize || "未知",
    });
  } else if (!success) {
    // 錯誤情況的詳細信息
    // Detailed information for error case
    const errorTemplate = await loadPromptFromTemplate("createArchive/error.md");
    errorDetails = generatePrompt(errorTemplate, {
      errorMessage: errorMessage || "未知錯誤",
    });
  }

  // 生成最終 prompt
  // Generate final prompt
  const indexTemplate = await loadPromptFromTemplate("createArchive/index.md");
  const prompt = generatePrompt(indexTemplate, {
    resultStatus,
    message,
    archiveInfo,
    errorDetails,
  });

  // 載入可能的自定義 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "CREATE_ARCHIVE");
}