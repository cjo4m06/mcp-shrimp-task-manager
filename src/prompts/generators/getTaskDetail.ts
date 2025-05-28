/**
 * getTaskDetail prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import { loadPrompt, generatePrompt, loadPromptFromTemplate } from "../loader.js";
import { Task } from "../../types/index.js";

export interface GetTaskDetailPromptParams {
  taskId: string;
  task?: Task | null;
  error?: string;
}

/**
 * Get the complete prompt for getTaskDetail
 * @param params prompt parameters
 * @returns generated prompt
 */
export function getGetTaskDetailPrompt(
  params: GetTaskDetailPromptParams
): string {
  const { taskId, task, error } = params;

  // If there is an error, display the error message
  if (error) {
    const errorTemplate = loadPromptFromTemplate("getTaskDetail/error.md");
    return generatePrompt(errorTemplate, {
      errorMessage: error,
    });
  }

  // If the task is not found, display the message indicating the task is not found
  if (!task) {
    const notFoundTemplate = loadPromptFromTemplate(
      "getTaskDetail/notFound.md"
    );
    return generatePrompt(notFoundTemplate, {
      taskId,
    });
  }

  let notesPrompt = "";
  if (task.notes) {
    const notesTemplate = loadPromptFromTemplate("getTaskDetail/notes.md");
    notesPrompt = generatePrompt(notesTemplate, {
      notes: task.notes,
    });
  }

  let dependenciesPrompt = "";
  if (task.dependencies && task.dependencies.length > 0) {
    const dependenciesTemplate = loadPromptFromTemplate(
      "getTaskDetail/dependencies.md"
    );
    dependenciesPrompt = generatePrompt(dependenciesTemplate, {
      dependencies: task.dependencies
        .map((dep) => `\`${dep.taskId}\``)
        .join(", "),
    });
  }

  let implementationGuidePrompt = "";
  if (task.implementationGuide) {
    const implementationGuideTemplate = loadPromptFromTemplate(
      "getTaskDetail/implementationGuide.md"
    );
    implementationGuidePrompt = generatePrompt(implementationGuideTemplate, {
      implementationGuide: task.implementationGuide,
    });
  }

  let verificationCriteriaPrompt = "";
  if (task.verificationCriteria) {
    const verificationCriteriaTemplate = loadPromptFromTemplate(
      "getTaskDetail/verificationCriteria.md"
    );
    verificationCriteriaPrompt = generatePrompt(verificationCriteriaTemplate, {
      verificationCriteria: task.verificationCriteria,
    });
  }

  let relatedFilesPrompt = "";
  if (task.relatedFiles && task.relatedFiles.length > 0) {
    const relatedFilesTemplate = loadPromptFromTemplate(
      "getTaskDetail/relatedFiles.md"
    );
    relatedFilesPrompt = generatePrompt(relatedFilesTemplate, {
      files: task.relatedFiles
        .map(
          (file) =>
            `- \`${file.path}\` (${file.type})${
              file.description ? `: ${file.description}` : ""
            }`
        )
        .join("\n"),
    });
  }

  let complatedSummaryPrompt = "";
  if (task.completedAt) {
    const complatedSummaryTemplate = loadPromptFromTemplate(
      "getTaskDetail/complatedSummary.md"
    );
    complatedSummaryPrompt = generatePrompt(complatedSummaryTemplate, {
      completedTime: new Date(task.completedAt).toLocaleString("zh-TW"),
      summary: task.summary || "*No completed summary*",
    });
  }

  const indexTemplate = loadPromptFromTemplate("getTaskDetail/index.md");

  // Start building the basic prompt
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
    createdTime: new Date(task.createdAt).toLocaleString("zh-TW"),
    updatedTime: new Date(task.updatedAt).toLocaleString("zh-TW"),
    complatedSummaryTemplate: complatedSummaryPrompt,
  });

  // Load possible custom prompts
  return loadPrompt(prompt, "GET_TASK_DETAIL");
}
