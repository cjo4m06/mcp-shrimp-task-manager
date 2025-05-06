import { z } from "zod";
import { getInitProjectRulesPrompt } from "../../prompts/index.js";
import {
  getRulesFilePath,
  ensureRulesFileExists,
} from "../../utils/pathUtils.js";

// 定義schema
export const initProjectRulesSchema = z.object({});

/**
 * 初始化專案規範工具函數
 * 提供建立規範文件的指導
 */
export async function initProjectRules() {
  try {
    // 從生成器獲取提示詞
    const promptContent = getInitProjectRulesPrompt();

    // 確保 DATA_DIR 目錄中存在 rules.md 文件
    await ensureRulesFileExists();

    // 輸出規則文件的路徑，幫助用戶找到文件
    const rulesPath = getRulesFilePath();

    // 返回成功響應
    return {
      content: [
        {
          type: "text" as const,
          text: promptContent + `\n\n規則文件將位於: ${rulesPath}`,
        },
      ],
    };
  } catch (error) {
    // 錯誤處理
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    return {
      content: [
        {
          type: "text" as const,
          text: `初始化專案規範時發生錯誤: ${errorMessage}`,
        },
      ],
    };
  }
}
