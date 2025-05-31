import { z } from "zod";
import {
  getProcessThoughtPrompt,
  ProcessThoughtPromptParams,
} from "../../prompts/generators/processThought.js";

/**
 * processThought工具的參數結構
 */
export const processThoughtSchema = z.object({
  thought: z
    .string()
    .min(1, {
      message: "思維內容不能為空，請提供有效的思考內容",
    })
    .describe("思維內容"),
  thought_number: z
    .number()
    .int()
    .positive({
      message: "思維編號必須是正整數",
    })
    .describe("當前思維編號"),
  total_thoughts: z
    .number()
    .int()
    .positive({
      message: "總思維數必須是正整數",
    })
    .describe("預計總思維數量，如果需要更多的思考可以隨時變更"),
  next_thought_needed: z.boolean().describe("是否需要下一步思維"),
  stage: z
    .string()
    .min(1, {
      message: "思維階段不能為空，請提供有效的思考階段",
    })
    .describe(
      "Thinking stage. Available stages include: Problem Definition, Information Gathering, Research, Analysis, Synthesis, Conclusion, Critical Questioning, and Planning."
    ),
  tags: z.array(z.string()).optional().describe("思維標籤，是一個陣列字串"),
  axioms_used: z
    .array(z.string())
    .optional()
    .describe("使用的公理，是一個陣列字串"),
  assumptions_challenged: z
    .array(z.string())
    .optional()
    .describe("挑戰的假設，是一個陣列字串"),
});

/**
 * 處理單一思維並返回格式化輸出
 */
export async function processThought(
  params: z.infer<typeof processThoughtSchema>
) {
  try {
    // 將參數轉換為規範的ThoughtData格式
    const thoughtData: ProcessThoughtPromptParams = {
      thought: params.thought,
      thoughtNumber: params.thought_number,
      totalThoughts: params.total_thoughts,
      nextThoughtNeeded: params.next_thought_needed,
      stage: params.stage,
      tags: params.tags || [],
      axioms_used: params.axioms_used || [],
      assumptions_challenged: params.assumptions_challenged || [],
    };

    // 確保思維編號不超過總思維數
    if (thoughtData.thoughtNumber > thoughtData.totalThoughts) {
      // 自動調整總思維數量
      thoughtData.totalThoughts = thoughtData.thoughtNumber;
    }

    // 格式化思維輸出
    const formattedThought = getProcessThoughtPrompt(thoughtData);

    // 返回成功響應
    return {
      content: [
        {
          type: "text" as const,
          text: formattedThought,
        },
      ],
    };
  } catch (error) {
    // 捕獲並處理所有未預期的錯誤
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    return {
      content: [
        {
          type: "text" as const,
          text: `處理思維時發生錯誤: ${errorMessage}`,
        },
      ],
    };
  }
}
