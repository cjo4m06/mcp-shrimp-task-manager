/**
 * researchMode prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * researchMode prompt 參數介面
 */
export interface ResearchModePromptParams {
  topic: string;
  previousState: string;
  currentState: string;
  nextSteps: string;
  memoryDir: string;
}

/**
 * 獲取 researchMode 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export function getResearchModePrompt(
  params: ResearchModePromptParams
): string {
  // 處理之前的研究狀態
  let previousStateContent = "";
  if (params.previousState && params.previousState.trim() !== "") {
    const previousStateTemplate = loadPromptFromTemplate(
      "researchMode/previousState.md"
    );
    previousStateContent = generatePrompt(previousStateTemplate, {
      previousState: params.previousState,
    });
  } else {
    previousStateContent = "這是第一次進行此主題的研究，沒有之前的研究狀態。";
  }

  // 載入主要模板
  const indexTemplate = loadPromptFromTemplate("researchMode/index.md");
  let prompt = generatePrompt(indexTemplate, {
    topic: params.topic,
    previousStateContent: previousStateContent,
    currentState: params.currentState,
    nextSteps: params.nextSteps,
    memoryDir: params.memoryDir,
    time: new Date().toLocaleString(),
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, "RESEARCH_MODE");
}
