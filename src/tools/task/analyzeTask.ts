import { z } from "zod";
import { getAnalyzeTaskPrompt } from "../../prompts/index.js";

// Analyze task tool
export const analyzeTaskSchema = z.object({
  summary: z
    .string()
    .min(10, {
      message: "Task summary cannot be less than 10 characters, please provide a more detailed description to ensure the task goal is clear",
    })
    .describe(
      "Structured task summary, including task goals, scope, and key technical challenges, at least 10 characters"
    ),
  initialConcept: z
    .string()
    .min(50, {
      message:
        "Initial concept cannot be less than 50 characters, please provide more detailed content to ensure the technical solution is clear",
    })
    .describe(
      "At least 50 characters of initial concept, including technical solutions, architecture design, and implementation strategies, if code needs to be provided, please use pseudocode format and only provide high-level logic flow and key steps to avoid complete code"
    ),
  previousAnalysis: z
    .string()
    .optional()
    .describe("Previous iteration analysis results, used for continuous improvement of the solution (only need to be provided when re-analyzing)"),
});

export async function analyzeTask({
  summary,
  initialConcept,
  previousAnalysis,
}: z.infer<typeof analyzeTaskSchema>) {
  // Get final prompt using prompt generator
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
