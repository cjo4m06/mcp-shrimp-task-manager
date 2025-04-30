/**
 * clearAllTasks prompt 生成器
 * 负责将模板和参数组合成最终的 prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * clearAllTasks prompt 参数接口
 */
export interface ClearAllTasksPromptParams {
  confirm?: boolean;
  success?: boolean;
  message?: string;
  backupFile?: string;
  isEmpty?: boolean;
}

/**
 * 获取 clearAllTasks 的完整 prompt
 * @param params prompt 参数
 * @returns 生成的 prompt
 */
export function getClearAllTasksPrompt(
  params: ClearAllTasksPromptParams
): string {
  const { confirm, success, message, backupFile, isEmpty } = params;

  // 处理未确认的情况
  if (confirm === false) {
    const cancelTemplate = loadPromptFromTemplate("clearAllTasks/cancel.md");
    return generatePrompt(cancelTemplate, {});
  }

  // 处理无任务需要清除的情况
  if (isEmpty) {
    const emptyTemplate = loadPromptFromTemplate("clearAllTasks/empty.md");
    return generatePrompt(emptyTemplate, {});
  }

  // 处理清除成功或失败的情况
  const responseTitle = success ? "Success" : "Failure";

  // 使用模板生成 backupInfo
  const backupInfo = backupFile
    ? generatePrompt(loadPromptFromTemplate("clearAllTasks/backupInfo.md"), {
        backupFile,
      })
    : "";

  const indexTemplate = loadPromptFromTemplate("clearAllTasks/index.md");
  const prompt = generatePrompt(indexTemplate, {
    responseTitle,
    message,
    backupInfo,
  });

  // 加载可能的自定义 prompt
  return loadPrompt(prompt, "CLEAR_ALL_TASKS");
}
