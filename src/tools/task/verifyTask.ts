import { z } from "zod";
import { UUID_V4_REGEX } from "../../utils/regex.js";
import {
  getTaskById,
  updateTaskStatus,
  updateTaskSummary,
} from "../../models/taskModel.js";
import { TaskStatus } from "../../types/index.js";
import { getVerifyTaskPrompt } from "../../prompts/index.js";

// Verify task tool
export const verifyTaskSchema = z.object({
  taskId: z
    .string()
    .regex(UUID_V4_REGEX, {
      message: "Invalid task ID format, please provide a valid UUID v4 format",
    })
    .describe("Unique identifier of the task to be verified, must be a valid task ID in the system"),
  summary: z
    .string()
    .min(30, {
      message: "At least 30 characters",
    })
    .describe(
      "When the score is 80 or above, it represents the task completion summary, briefly describing the implementation results and important decisions, when the score is below 80, it represents the missing or parts that need to be corrected, at least 30 characters"
    ),
  score: z
    .number()
    .min(0, { message: "Score cannot be less than 0" })
    .max(100, { message: "Score cannot be greater than 100" })
    .describe("Score for the task, when the score is equal to or exceeds 80, the task is automatically completed"),
});

export async function verifyTask({
  taskId,
  summary,
  score,
}: z.infer<typeof verifyTaskSchema>) {
  const task = await getTaskById(taskId);

  if (!task) {
    return {
      content: [
        {
          type: "text" as const,
          text: `## System error\n\nCannot find task with ID \`${taskId}\`. Please use the "list_tasks" tool to confirm a valid task ID before trying again.`,
        },
      ],
      isError: true,
    };
  }

  if (task.status !== TaskStatus.IN_PROGRESS) {
    return {
      content: [
        {
          type: "text" as const,
          text: `## Status error\n\nTask "${task.name}" (ID: \`${task.id}\`) is currently in status "${task.status}", which is not in progress status. Cannot perform verification.\n\nOnly tasks in "in progress" status can be verified. Please use the "execute_task" tool to start task execution.`,
        },
      ],
      isError: true,
    };
  }

  if (score >= 80) {
    // Update task status to completed and add summary
    await updateTaskSummary(taskId, summary);
    await updateTaskStatus(taskId, TaskStatus.COMPLETED);
  }

  // Use prompt generator to get the final prompt
  const prompt = getVerifyTaskPrompt({ task, score, summary });

  return {
    content: [
      {
        type: "text" as const,
        text: prompt,
      },
    ],
  };
}
