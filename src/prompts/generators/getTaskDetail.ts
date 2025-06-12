/**
 * getTaskDetail prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import { loadPrompt, generatePrompt, loadPromptFromTemplate } from '../loader.js';
import { Task } from '../../types/index.js';

/**
 * getTaskDetail prompt 參數介面
 */
export interface GetTaskDetailPromptParams {
  taskId: string;
  task?: Task | null;
  error?: string;
}

/**
 * 獲取 getTaskDetail 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export function getGetTaskDetailPrompt(params: GetTaskDetailPromptParams): string {
  const { taskId, task, error } = params;

  // 如果有錯誤，顯示錯誤訊息
  if (error) {
    const errorTemplate = loadPromptFromTemplate('getTaskDetail/error.md');
    return generatePrompt(errorTemplate, {
      errorMessage: error,
    });
  }

  // 如果找不到任務，顯示找不到任務的訊息
  if (!task) {
    const notFoundTemplate = loadPromptFromTemplate('getTaskDetail/notFound.md');
    return generatePrompt(notFoundTemplate, {
      taskId,
    });
  }

  let notesPrompt = '';
  if (task.notes) {
    const notesTemplate = loadPromptFromTemplate('getTaskDetail/notes.md');
    notesPrompt = generatePrompt(notesTemplate, {
      notes: task.notes,
    });
  }

  let dependenciesPrompt = '';
  if (task.dependencies && task.dependencies.length > 0) {
    const dependenciesTemplate = loadPromptFromTemplate('getTaskDetail/dependencies.md');
    dependenciesPrompt = generatePrompt(dependenciesTemplate, {
      dependencies: task.dependencies.map((dep) => `\`${dep.taskId}\``).join(', '),
    });
  }

  let implementationGuidePrompt = '';
  if (task.implementationGuide) {
    const implementationGuideTemplate = loadPromptFromTemplate('getTaskDetail/implementationGuide.md');
    implementationGuidePrompt = generatePrompt(implementationGuideTemplate, {
      implementationGuide: task.implementationGuide,
    });
  }

  let verificationCriteriaPrompt = '';
  if (task.verificationCriteria) {
    const verificationCriteriaTemplate = loadPromptFromTemplate('getTaskDetail/verificationCriteria.md');
    verificationCriteriaPrompt = generatePrompt(verificationCriteriaTemplate, {
      verificationCriteria: task.verificationCriteria,
    });
  }

  let relatedFilesPrompt = '';
  if (task.relatedFiles && task.relatedFiles.length > 0) {
    const relatedFilesTemplate = loadPromptFromTemplate('getTaskDetail/relatedFiles.md');
    relatedFilesPrompt = generatePrompt(relatedFilesTemplate, {
      files: task.relatedFiles
        .map((file) => `- \`${file.path}\` (${file.type})${file.description ? `: ${file.description}` : ''}`)
        .join('\n'),
    });
  }

  let complatedSummaryPrompt = '';
  if (task.completedAt) {
    const complatedSummaryTemplate = loadPromptFromTemplate('getTaskDetail/complatedSummary.md');
    complatedSummaryPrompt = generatePrompt(complatedSummaryTemplate, {
      completedTime: new Date(task.completedAt).toLocaleString('zh-TW'),
      summary: task.summary || '*無完成摘要*',
    });
  }

  const indexTemplate = loadPromptFromTemplate('getTaskDetail/index.md');

  // 開始構建基本 prompt
  let prompt = generatePrompt(indexTemplate, {
    name: task.name,
    id: task.id,
    status: task.status,
    description: task.description,
    notesTemplate: notesPrompt,
    dependenciesTemplate: dependenciesPrompt,
    implementationGuideTemplate: implementationGuidePrompt,
    verificationCriteriaTemplate: verificationCriteriaPrompt,
    relatedFilesTemplate: relatedFilesPrompt,
    createdTime: new Date(task.createdAt).toLocaleString('zh-TW'),
    updatedTime: new Date(task.updatedAt).toLocaleString('zh-TW'),
    complatedSummaryTemplate: complatedSummaryPrompt,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, 'GET_TASK_DETAIL');
}
