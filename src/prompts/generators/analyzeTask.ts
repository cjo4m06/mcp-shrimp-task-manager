/**
 * analyzeTask prompt 生成器
 * 负责将模板和参数组合成最终的 prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * analyzeTask prompt 参数接口
 */
export interface AnalyzeTaskPromptParams {
  summary: string;
  initialConcept: string;
  previousAnalysis?: string;
}

/**
 * 获取 analyzeTask 的完整 prompt
 * @param params prompt 参数
 * @returns 生成的 prompt
 */
export function getAnalyzeTaskPrompt(params: AnalyzeTaskPromptParams): string {
  const indexTemplate = loadPromptFromTemplate("analyzeTask/index.md");

  const iterationTemplate = loadPromptFromTemplate("analyzeTask/iteration.md");

  let iterationPrompt = "";
  if (params.previousAnalysis) {
    iterationPrompt = generatePrompt(iterationTemplate, {
      previousAnalysis: params.previousAnalysis,
    });
  }

  let prompt = generatePrompt(indexTemplate, {
    summary: params.summary,
    initialConcept: params.initialConcept,
    iterationPrompt: iterationPrompt,
  });

  // 加载可能的自定义 prompt
  return loadPrompt(prompt, "ANALYZE_TASK");
}
