/**
 * reflectTask prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import { loadPrompt, generatePrompt, loadPromptFromTemplate } from "../loader.js";

export interface ReflectTaskPromptParams {
  summary: string;
  analysis: string;
}

/**
 * Get the complete prompt for reflectTask
 * @param params prompt parameters
 * @returns generated prompt
 */
export function getReflectTaskPrompt(params: ReflectTaskPromptParams): string {
  const indexTemplate = loadPromptFromTemplate("reflectTask/index.md");
  const prompt = generatePrompt(indexTemplate, {
    summary: params.summary,
    analysis: params.analysis,
  });

  // Load possible custom prompts
  return loadPrompt(prompt, "REFLECT_TASK");
}
