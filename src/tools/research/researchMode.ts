import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import { getResearchModePrompt } from "../../prompts/index.js";

// 研究模式工具
export const researchModeSchema = z.object({
  topic: z
    .string()
    .min(5, {
      message: "研究主題不能少於5個字符，請提供明確的研究主題",
    })
    .describe("要研究的程式編程主題內容，應該明確且具體"),
  previousState: z
    .string()
    .optional()
    .default("")
    .describe(
      "之前的研究狀態和內容摘要，第一次執行時為空，後續會包含之前詳細且關鍵的研究成果，這將幫助後續的研究"
    ),
  currentState: z
    .string()
    .describe(
      "當前 Agent 主要該執行的內容，例如使用網路工具搜尋某些關鍵字或分析特定程式碼，研究完畢後請呼叫 research_mode 來記錄狀態並與之前的`previousState`整合，這將幫助你更好的保存與執行研究內容"
    ),
  nextSteps: z
    .string()
    .describe(
      "後續的計劃、步驟或研究方向，用來約束 Agent 不偏離主題或走錯方向，如果研究過程中發現需要調整研究方向，請更新此欄位"
    ),
});

export async function researchMode({
  topic,
  previousState = "",
  currentState,
  nextSteps,
}: z.infer<typeof researchModeSchema>) {
  // 獲取基礎目錄路徑
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const PROJECT_ROOT = path.resolve(__dirname, "../../..");
  const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, "data");
  const MEMORY_DIR = path.join(DATA_DIR, "memory");

  // 使用prompt生成器獲取最終prompt
  const prompt = getResearchModePrompt({
    topic,
    previousState,
    currentState,
    nextSteps,
    memoryDir: MEMORY_DIR,
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
