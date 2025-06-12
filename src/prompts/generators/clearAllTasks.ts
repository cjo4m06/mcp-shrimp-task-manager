/**
 * clearAllTasks prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import { loadPrompt, generatePrompt, loadPromptFromTemplate } from '../loader.js';

/**
 * clearAllTasks prompt 參數介面
 */
export interface ClearAllTasksPromptParams {
  confirm?: boolean;
  success?: boolean;
  message?: string;
  backupFile?: string;
  isEmpty?: boolean;
}

/**
 * 獲取 clearAllTasks 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export function getClearAllTasksPrompt(params: ClearAllTasksPromptParams): string {
  const { confirm, success, message, backupFile, isEmpty } = params;

  // 處理未確認的情況
  if (confirm === false) {
    const cancelTemplate = loadPromptFromTemplate('clearAllTasks/cancel.md');
    return generatePrompt(cancelTemplate, {});
  }

  // 處理無任務需要清除的情況
  if (isEmpty) {
    const emptyTemplate = loadPromptFromTemplate('clearAllTasks/empty.md');
    return generatePrompt(emptyTemplate, {});
  }

  // 處理清除成功或失敗的情況
  const responseTitle = success ? 'Success' : 'Failure';

  // 使用模板生成 backupInfo
  const backupInfo = backupFile
    ? generatePrompt(loadPromptFromTemplate('clearAllTasks/backupInfo.md'), {
        backupFile,
      })
    : '';

  const indexTemplate = loadPromptFromTemplate('clearAllTasks/index.md');
  const prompt = generatePrompt(indexTemplate, {
    responseTitle,
    message,
    backupInfo,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, 'CLEAR_ALL_TASKS');
}
