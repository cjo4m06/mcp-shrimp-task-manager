import { z } from "zod";
import path from "path";
import { getAllTasks } from "../../models/taskModel.js";
import { TaskStatus, Task } from "../../types/index.js";
import { getPlanTaskPrompt } from "../../prompts/index.js";

// Start planning tool
export const planTaskSchema = z.object({
  description: z
    .string()
    .min(10, {
      message: "Task description cannot be less than 10 characters, please provide a more detailed description to ensure the task goal is clear",
    })
    .describe("Complete and detailed task problem description, should include task goals, background, and expected outcomes"),
  requirements: z
    .string()
    .optional()
    .describe("Specific technical requirements, business constraints, or quality standards of the task (optional)"),
  existingTasksReference: z
    .boolean()
    .optional()
    .default(false)
    .describe("Whether to refer to existing tasks as a planning basis, used for task adjustment and continuity planning"),
});

export async function planTask({
  description,
  requirements,
  existingTasksReference = false,
}: z.infer<typeof planTaskSchema>) {
  // Get base directory path
  const DATA_DIR = process.env.DATA_DIR
  if (!DATA_DIR) throw new Error("DATA_DIR is not set");
  const MEMORY_DIR = path.join(DATA_DIR, "memory");

  // Prepare required parameters
  let completedTasks: Task[] = [];
  let pendingTasks: Task[] = [];

  // When existingTasksReference is true, load all tasks from the database as a reference
  if (existingTasksReference) {
    try {
      const allTasks = await getAllTasks();

      // Divide tasks into completed and unfinished categories
      completedTasks = allTasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      );
      pendingTasks = allTasks.filter(
        (task) => task.status !== TaskStatus.COMPLETED
      );
    } catch (error) {}
  }

  // Use prompt generator to get the final prompt
  const prompt = getPlanTaskPrompt({
    description,
    requirements,
    existingTasksReference,
    completedTasks,
    pendingTasks,
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
