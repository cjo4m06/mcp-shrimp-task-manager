/**
 * getDeletedTasks prompt 生成器
 * getDeletedTasks prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * getDeletedTasks prompt 參數介面
 * getDeletedTasks prompt parameters interface
 */
export interface GetDeletedTasksPromptParams {
  since?: string;
  deletedTasks: Array<{
    task: {
      id: string;
      name: string;
      description: string;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      completedAt?: Date;
    };
    deletedAt: Date;
    backupFile: string;
  }>;
  totalCount: number;
}

/**
 * 獲取 getDeletedTasks 的完整 prompt
 * Get the complete prompt for getDeletedTasks
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getGetDeletedTasksPrompt(
  params: GetDeletedTasksPromptParams
): Promise<string> {
  const { since, deletedTasks, totalCount } = params;

  if (totalCount === 0) {
    const notFoundTemplate = await loadPromptFromTemplate(
      "getDeletedTasks/notFound.md"
    );
    return generatePrompt(notFoundTemplate, {
      since: since || "任何時間",
    });
  }

  const taskDetailsTemplate = await loadPromptFromTemplate(
    "getDeletedTasks/taskDetails.md"
  );
  let tasksContent = "";
  for (const deletedTaskInfo of deletedTasks) {
    const task = deletedTaskInfo.task;
    tasksContent += generatePrompt(taskDetailsTemplate, {
      taskId: task.id,
      taskName: task.name,
      taskStatus: task.status,
      taskDescription:
        task.description.length > 150
          ? `${task.description.substring(0, 150)}...`
          : task.description,
      createdAt: task.createdAt.toLocaleString(),
      deletedAt: deletedTaskInfo.deletedAt.toLocaleString(),
      backupFile: deletedTaskInfo.backupFile,
    });
  }

  const indexTemplate = await loadPromptFromTemplate("getDeletedTasks/index.md");
  const prompt = generatePrompt(indexTemplate, {
    tasksContent,
    totalCount,
    since: since || "任何時間",
  });

  // 載入可能的自定義 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "GET_DELETED_TASKS");
}