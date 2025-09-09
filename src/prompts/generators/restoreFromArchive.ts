/**
 * restoreFromArchive prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */
/**
 * restoreFromArchive prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * restoreFromArchive prompt 參數介面
 */
/**
 * restoreFromArchive prompt parameter interface
 */
export interface RestoreFromArchivePromptParams {
  success: boolean;
  message: string;
  archiveId: string;
  action: string;
  restoredCount: number;
}

/**
 * 獲取 restoreFromArchive 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
/**
 * Get complete prompt for restoreFromArchive
 * @param params prompt parameters
 * @returns generated prompt
 */
export async function getRestoreFromArchivePrompt(
  params: RestoreFromArchivePromptParams
): Promise<string> {
  const { success, message, archiveId, action, restoredCount } = params;

  // 處理成功或失敗的情況
  // Handle success or failure situations
  const responseTitle = success ? "Success" : "Failure";

  // 使用模板生成 restoreInfo
  // Use template to generate restoreInfo
  const restoreInfo = success
    ? generatePrompt(
        await loadPromptFromTemplate("restoreFromArchive/restoreInfo.md"),
        {
          archiveId,
          action,
          restoredCount,
        }
      )
    : "";

  const indexTemplate = await loadPromptFromTemplate("restoreFromArchive/index.md");
  const prompt = generatePrompt(indexTemplate, {
    responseTitle,
    message,
    restoreInfo,
  });

  // 載入可能的自定義 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "RESTORE_FROM_ARCHIVE");
}