import { z } from "zod";
import {
  getAllTasks,
  batchCreateOrUpdateTasks,
  clearAllTasks as modelClearAllTasks,
} from "../../models/taskModel.js";
import { RelatedFileType, Task } from "../../types/index.js";
import { getSplitTasksPrompt } from "../../prompts/index.js";

// Split task tool
export const splitTasksRawSchema = z.object({
  updateMode: z
    .enum(["append", "overwrite", "selective", "clearAllTasks"])
    .describe(
      "Task update mode selection: 'append' (keep all existing tasks and add new tasks), 'overwrite' (clear all unfinished tasks and completely replace, keep completed tasks), 'selective' (smart update: update existing tasks based on task name matching, keep tasks not in the list, recommended for task fine-tuning), 'clearAllTasks' (clear all tasks and create a backup).\nDefault is 'clearAllTasks' mode, use other modes only when user requests changes or modifications to the plan content"
    ),
  tasksRaw: z
    .string()
    .describe(
      "Structured task list, each task should maintain atomicity and have clear completion criteria, avoid overly simple tasks, simple modifications can be integrated with other tasks, avoid too many tasks, example: [{name: 'Concise and clear task name, should clearly express the task purpose', description: 'Detailed task description, including implementation points, technical details, and acceptance criteria', implementationGuide: 'Specific implementation methods and steps for this particular task, please refer to previous analysis results to provide concise pseudocode', notes: 'Supplementary instructions, special handling requirements or implementation suggestions (optional)', dependencies: ['Full name of the prerequisite task that this task depends on'], relatedFiles: [{path: 'File path', type: 'File type (TO_MODIFY: to be modified, REFERENCE: reference material, CREATE: to be created, DEPENDENCY: dependency file, OTHER: other)', description: 'File description', lineStart: 1, lineEnd: 100}], verificationCriteria: 'Verification criteria and inspection methods for this particular task'}, {name: 'Task 2', description: 'Task 2 description', implementationGuide: 'Task 2 implementation method', notes: 'Supplementary instructions, special handling requirements or implementation suggestions (optional)', dependencies: ['Task 1'], relatedFiles: [{path: 'File path', type: 'File type (TO_MODIFY: to be modified, REFERENCE: reference material, CREATE: to be created, DEPENDENCY: dependency file, OTHER: other)', description: 'File description', lineStart: 1, lineEnd: 100}], verificationCriteria: 'Verification criteria and inspection methods for this particular task'}]"
    ),
  globalAnalysisResult: z
    .string()
    .optional()
    .describe("Final goal of the task, from previous analysis applicable to all tasks"),
});

const tasksSchema = z
  .array(
    z.object({
      name: z
        .string()
        .max(100, {
          message: "Task name too long, please limit to 100 characters",
        })
        .describe("Concise and clear task name, should clearly express the task purpose"),
      description: z
        .string()
        .min(10, {
          message: "Task description too short, please provide more detailed content to ensure understanding",
        })
        .describe("Detailed task description, including implementation points, technical details, and acceptance criteria"),
      implementationGuide: z
        .string()
        .describe(
          "Specific implementation methods and steps for this particular task, please refer to previous analysis results to provide concise pseudocode"
        ),
      dependencies: z
        .array(z.string())
        .optional()
        .describe(
          "List of prerequisite task IDs or task names that this task depends on, supports two referencing methods, name referencing is more intuitive, and is a string array"
        ),
      notes: z
        .string()
        .optional()
        .describe("Supplementary instructions, special handling requirements or implementation suggestions (optional)"),
      relatedFiles: z
        .array(
          z.object({
            path: z
              .string()
              .min(1, {
                message: "File path cannot be empty",
              })
              .describe("File path, can be relative to the project root directory or absolute path"),
            type: z
              .nativeEnum(RelatedFileType)
              .describe(
                "File type (TO_MODIFY: to be modified, REFERENCE: reference material, CREATE: to be created, DEPENDENCY: dependency file, OTHER: other)"
              ),
            description: z
              .string()
              .min(1, {
                message: "File description cannot be empty",
              })
              .describe("File description, used to explain the purpose and content of the file"),
            lineStart: z
              .number()
              .int()
              .positive()
              .optional()
              .describe("Related code block start line (optional)"),
            lineEnd: z
              .number()
              .int()
              .positive()
              .optional()
              .describe("Related code block end line (optional)"),
          })
        )
        .optional()
        .describe(
          "List of files related to the task, used to record code files, reference materials, files to be created, etc. (optional)"
        ),
      verificationCriteria: z
        .string()
        .optional()
        .describe("Verification criteria and inspection methods for this particular task"),
    })
  )
  .min(1, {
    message: "Please provide at least one task",
  })
  .describe(
    "Structured task list, each task should maintain atomicity and have clear completion criteria, avoid overly simple tasks, simple modifications can be integrated with other tasks, avoid too many tasks"
  );

export async function splitTasksRaw({
  updateMode,
  tasksRaw,
  globalAnalysisResult,
}: z.infer<typeof splitTasksRawSchema>) {
  let tasks: Task[] = [];
  try {
    tasks = JSON.parse(tasksRaw);
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text:
            "tasksRaw parameter format error, please ensure the format is correct, try to fix the error, if the text is too long to fix smoothly, please call in batches, this can avoid the problem of too long messages leading to difficulty in fixing the problem, error message: " +
            (error instanceof Error ? error.message : String(error)),
        },
      ],
    };
  }

  // Use tasksSchema to validate tasks
  const tasksResult = tasksSchema.safeParse(tasks);
  if (!tasksResult.success) {
    // Return error message
    return {
      content: [
        {
          type: "text" as const,
          text:
            "tasks parameter format error, please ensure the format is correct, error message: " +
            tasksResult.error.message,
        },
      ],
    };
  }

  try {
    // Check if there are duplicate names in tasks
    const nameSet = new Set();
    for (const task of tasks) {
      if (nameSet.has(task.name)) {
        return {
          content: [
            {
              type: "text" as const,
              text: "There are duplicate task names in the tasks parameter, please ensure each task name is unique",
            },
          ],
        };
      }
      nameSet.add(task.name);
    }

    // Process tasks according to different update modes
    let message = "";
    let actionSuccess = true;
    let backupFile = null;
    let createdTasks: Task[] = [];
    let allTasks: Task[] = [];

    // Convert task data to a format that conforms to batchCreateOrUpdateTasks
    const convertedTasks = tasks.map((task) => ({
      name: task.name,
      description: task.description,
      notes: task.notes,
      dependencies: task.dependencies as unknown as string[],
      implementationGuide: task.implementationGuide,
      verificationCriteria: task.verificationCriteria,
      relatedFiles: task.relatedFiles?.map((file) => ({
        path: file.path,
        type: file.type as RelatedFileType,
        description: file.description,
        lineStart: file.lineStart,
        lineEnd: file.lineEnd,
      })),
    }));

    // Handle clearAllTasks mode
    if (updateMode === "clearAllTasks") {
      const clearResult = await modelClearAllTasks();

      if (clearResult.success) {
        message = clearResult.message;
        backupFile = clearResult.backupFile;

        try {
          // Clear tasks and then create new tasks
          createdTasks = await batchCreateOrUpdateTasks(
            convertedTasks,
            "append",
            globalAnalysisResult
          );
          message += `\nSuccessfully created ${createdTasks.length} new tasks.`;
        } catch (error) {
          actionSuccess = false;
          message += `\nError occurred while creating new tasks: ${
            error instanceof Error ? error.message : String(error)
          }`;
        }
      } else {
        actionSuccess = false;
        message = clearResult.message;
      }
    } else {
      // For other modes, use batchCreateOrUpdateTasks directly
      try {
        createdTasks = await batchCreateOrUpdateTasks(
          convertedTasks,
          updateMode,
          globalAnalysisResult
        );

        // Generate messages based on different update modes
        switch (updateMode) {
          case "append":
            message = `Successfully appended ${createdTasks.length} new tasks.`;
            break;
          case "overwrite":
            message = `Successfully cleared unfinished tasks and created ${createdTasks.length} new tasks.`;
            break;
          case "selective":
            message = `Successfully selectively updated/created ${createdTasks.length} tasks.`;
            break;
        }
      } catch (error) {
        actionSuccess = false;
        message = `Task creation failed: ${
          error instanceof Error ? error.message : String(error)
        }`;
      }
    }

    // Get all tasks for displaying dependencies
    try {
      allTasks = await getAllTasks();
    } catch (error) {
      allTasks = [...createdTasks]; // If fetching fails, at least use the newly created tasks
    }

    // Use prompt generator to get the final prompt
    const prompt = getSplitTasksPrompt({
      updateMode,
      createdTasks,
      allTasks,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: prompt,
        },
      ],
      ephemeral: {
        taskCreationResult: {
          success: actionSuccess,
          message,
          backupFilePath: backupFile,
        },
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      content: [
        {
          type: "text" as const,
          text: `Error occurred while processing raw task: ${errorMessage}`,
        },
      ],
    };
  }
}
