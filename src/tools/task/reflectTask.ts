import { z } from "zod";
import { getReflectTaskPrompt } from "../../prompts/index.js";

// Reflect on task tool
export const reflectTaskSchema = z.object({
  summary: z
    .string()
    .min(10, {
      message: "Task summary cannot be less than 10 characters, please provide a more detailed description to ensure the task goal is clear",
    })
    .describe("Structured task summary, consistent with the analysis phase to ensure continuity"),
  analysis: z
    .string()
    .min(100, {
      message: "Technical analysis content is not detailed enough, please provide a complete technical analysis and implementation plan",
    })
    .describe(
      "Complete and detailed technical analysis results, including all technical details, dependencies, and implementation plans, if code needs to be provided, please use pseudocode format and only provide high-level logic flow and key steps to avoid complete code"
    ),
});

export async function reflectTask({
  summary,
  analysis,
}: z.infer<typeof reflectTaskSchema>) {
  // Use prompt generator to get the final prompt
  const prompt = getReflectTaskPrompt({
    summary,
    analysis,
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
