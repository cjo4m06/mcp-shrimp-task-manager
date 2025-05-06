import { z } from "zod";
import { getAnalyzeTaskPrompt } from "../../prompts/index.js";

// 分析問題工具
export const analyzeTaskSchema = z.object({
  summary: z
    .string()
    .min(10, {
      message: "任務摘要不能少於10個字符，請提供更詳細的描述以確保任務目標明確",
    })
    .describe(
      "結構化的任務摘要，包含任務目標、範圍與關鍵技術挑戰，最少10個字符"
    ),
  initialConcept: z
    .string()
    .min(50, {
      message:
        "初步解答構想不能少於50個字符，請提供更詳細的內容確保技術方案清晰",
    })
    .describe(
      "最少50個字符的初步解答構想，包含技術方案、架構設計和實施策略，如果需要提供程式碼請使用 pseudocode 格式且僅提供高級邏輯流程和關鍵步驟避免完整代碼"
    ),
  previousAnalysis: z
    .string()
    .optional()
    .describe("前次迭代的分析結果，用於持續改進方案（僅在重新分析時需提供）"),
});

export async function analyzeTask({
  summary,
  initialConcept,
  previousAnalysis,
}: z.infer<typeof analyzeTaskSchema>) {
  // 使用prompt生成器獲取最終prompt
  const prompt = getAnalyzeTaskPrompt({
    summary,
    initialConcept,
    previousAnalysis,
  });

  return {
    content: [
      {
        type: "text" as const,
        text: prompt,
      },
    ],
  };
}
