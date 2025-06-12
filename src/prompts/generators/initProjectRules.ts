/**
 * initProjectRules prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import { loadPrompt, loadPromptFromTemplate } from '../loader.js';
/**
 * initProjectRules prompt 參數介面
 */
export interface InitProjectRulesPromptParams {
  // 目前沒有額外參數，未來可按需擴展
}

/**
 * 獲取 initProjectRules 的完整 prompt
 * @param params prompt 參數（可選）
 * @returns 生成的 prompt
 */
export function getInitProjectRulesPrompt(params?: InitProjectRulesPromptParams): string {
  const indexTemplate = loadPromptFromTemplate('initProjectRules/index.md');

  // 載入可能的自定義 prompt (通過環境變數覆蓋或追加)
  return loadPrompt(indexTemplate, 'INIT_PROJECT_RULES');
}
