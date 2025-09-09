/**
 * recoverTask prompt 生成器
 * recoverTask prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
import { Task } from "../../types/index.js";

/**
 * recoverTask prompt 參數介面
 * recoverTask prompt parameters interface
 */
export interface RecoverTaskPromptParams {
  taskId: string;
  success: boolean;
  message: string;
  recoveredTask?: Task;
}

/**
 * 獲取 recoverTask 的完整 prompt
 * Get the complete prompt for recoverTask
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getRecoverTaskPrompt(
  params: RecoverTaskPromptParams
): Promise<string> {
  const { taskId, success, message, recoveredTask } = params;

  if (!success) {
    const errorTemplate = await loadPromptFromTemplate(
      "recoverTask/error.md"
    );
    return generatePrompt(errorTemplate, {
      taskId,
      message,
    });
  }

  const successTemplate = await loadPromptFromTemplate(
    "recoverTask/success.md"
  );
  
  const taskDetails = recoveredTask ? {
    taskName: recoveredTask.name,
    taskStatus: recoveredTask.status,
    taskDescription: recoveredTask.description.length > 200
      ? `${recoveredTask.description.substring(0, 200)}...`
      : recoveredTask.description,
    createdAt: recoveredTask.createdAt.toLocaleString(),
    updatedAt: recoveredTask.updatedAt.toLocaleString(),
  } : {};

  const prompt = generatePrompt(successTemplate, {
    taskId,
    message,
    ...taskDetails,
  });

  // 載入可能的自定義 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "RECOVER_TASK");
}