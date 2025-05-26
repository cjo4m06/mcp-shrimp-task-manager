import { z } from "zod";
import { getReflectTaskPrompt } from "../../prompts/index.js";

// 反思構想工具
export const reflectTaskSchema = z.object({
  summary: z
    .string()
    .min(10, {
      message: "任務摘要不能少於10個字符，請提供更詳細的描述以確保任務目標明確",
    })
    .describe("結構化的任務摘要，保持與分析階段一致以確保連續性"),
  analysis: z
    .string()
    .min(100, {
      message: "技術分析內容不夠詳盡，請提供完整的技術分析和實施方案",
    })
    .describe(
      "完整詳盡的技術分析結果，包括所有技術細節、依賴組件和實施方案，如果需要提供程式碼請使用 pseudocode 格式且僅提供高級邏輯流程和關鍵步驟避免完整代碼"
    ),
  taskBrief: z
    .string()
    .max(20, { message: "任务简介不能超过20个字符" })
    .optional()
    .describe("任务的简短概括，不超过20个字，可选"),
});

export async function reflectTask({
  summary,
  analysis,
  taskBrief,
}: z.infer<typeof reflectTaskSchema>) {
  // 使用prompt生成器獲取最終prompt
  const prompt = getReflectTaskPrompt({
    summary,
    analysis,
    taskBrief,
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
