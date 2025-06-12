import { z } from 'zod';
import { getInitProjectRulesPrompt } from '../../prompts/index.js';

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

    // 返回成功響應
    return {
      content: [
        {
          type: 'text' as const,
          text: promptContent,
        },
      ],
    };
  } catch (error) {
    // 錯誤處理
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    return {
      content: [
        {
          type: 'text' as const,
          text: `初始化專案規範時發生錯誤: ${errorMessage}`,
        },
      ],
    };
  }
}
