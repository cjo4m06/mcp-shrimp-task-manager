/**
 * initProjectRules prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import { loadPrompt, loadPromptFromTemplate } from "../loader.js";

export interface InitProjectRulesPromptParams {
  // Currently no additional parameters, can be expanded as needed
}

/**
 * Get the complete prompt for initProjectRules
 * @param params prompt parameters (optional)
 * @returns Generated prompt
 */
export function getInitProjectRulesPrompt(
  params?: InitProjectRulesPromptParams
): string {
  const indexTemplate = loadPromptFromTemplate("initProjectRules/index.md");

  // Load possible custom prompts (via environment variable override or addition)
  return loadPrompt(indexTemplate, "INIT_PROJECT_RULES");
}
