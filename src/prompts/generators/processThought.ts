/**
 * processThought prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import { loadPrompt, generatePrompt, loadPromptFromTemplate } from "../loader.js";

export interface ProcessThoughtPromptParams {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  nextThoughtNeeded: boolean;
  stage: string;
  tags: string[];
  axioms_used: string[];
  assumptions_challenged: string[];
}

/**
 * Get the complete prompt for processThought
 * @param param prompt parameters
 * @returns generated prompt
 */
export function getProcessThoughtPrompt(
  param: ProcessThoughtPromptParams
): string {
  let nextThoughtNeeded = "";
  if (param.nextThoughtNeeded) {
    nextThoughtNeeded = loadPromptFromTemplate("processThought/moreThought.md");
  } else {
    nextThoughtNeeded = loadPromptFromTemplate(
      "processThought/complatedThought.md"
    );
  }

  const indexTemplate = loadPromptFromTemplate("processThought/index.md");

  const prompt = generatePrompt(indexTemplate, {
    thought: param.thought,
    thoughtNumber: param.thoughtNumber,
    totalThoughts: param.totalThoughts,
    stage: param.stage,
    tags: param.tags.join(", ") || "no tags",
    axioms_used: param.axioms_used.join(", ") || "no axioms used",
    assumptions_challenged:
      param.assumptions_challenged.join(", ") || "no assumptions challenged",
    nextThoughtNeeded,
  });

  return loadPrompt(prompt, "PROCESS_THOUGHT");
}
