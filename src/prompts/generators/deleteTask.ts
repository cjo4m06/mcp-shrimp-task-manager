/**
 * deleteTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import { loadPrompt, generatePrompt, loadPromptFromTemplate } from '../loader.js';
import { Task } from '../../types/index.js';

/**
 * deleteTask prompt 參數介面
 */
export interface DeleteTaskPromptParams {
  taskId: string;
  task?: Task;
  success?: boolean;
  message?: string;
  isTaskCompleted?: boolean;
}

/**
 * 獲取 deleteTask 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export function getDeleteTaskPrompt(params: DeleteTaskPromptParams): string {
  const { taskId, task, success, message, isTaskCompleted } = params;

  // 處理任務不存在的情況
  if (!task) {
    const notFoundTemplate = loadPromptFromTemplate('deleteTask/notFound.md');
    return generatePrompt(notFoundTemplate, {
      taskId,
    });
  }

  // 處理任務已完成的情況
  if (isTaskCompleted) {
    const completedTemplate = loadPromptFromTemplate('deleteTask/completed.md');
    return generatePrompt(completedTemplate, {
      taskId: task.id,
      taskName: task.name,
    });
  }

  // 處理刪除成功或失敗的情況
  const responseTitle = success ? 'Success' : 'Failure';
  const indexTemplate = loadPromptFromTemplate('deleteTask/index.md');
  const prompt = generatePrompt(indexTemplate, {
    responseTitle,
    message,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, 'DELETE_TASK');
}
