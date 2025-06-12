/**
 * analyzeTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import { loadPrompt, generatePrompt, loadPromptFromTemplate } from '../loader.js';

/**
 * analyzeTask prompt 參數介面
 */
export interface AnalyzeTaskPromptParams {
  summary: string;
  initialConcept: string;
  previousAnalysis?: string;
}

/**
 * 獲取 analyzeTask 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export function getAnalyzeTaskPrompt(params: AnalyzeTaskPromptParams): string {
  const indexTemplate = loadPromptFromTemplate('analyzeTask/index.md');

  const iterationTemplate = loadPromptFromTemplate('analyzeTask/iteration.md');

  let iterationPrompt = '';
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

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, 'ANALYZE_TASK');
}
