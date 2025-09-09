import { z } from "zod";
import { createTaskArchive } from "../../models/taskModel.js";
import { getCreateArchivePrompt } from "../../prompts/index.js";

/**
 * 創建任務存檔工具
 * Create task archive tool
 * 
 * This tool allows users to create archives of the current task state,
 * preserving all task data with metadata for future restoration.
 * 
 * @example
 * ```typescript
 * await createArchive({
 *   name: "Sprint 1 Completion",
 *   description: "Archive after completing all sprint 1 tasks"
 * });
 * ```
 */
export const createArchiveSchema = z.object({
  name: z
    .string()
    .min(1, "Archive name cannot be empty")
    .max(100, "Archive name cannot exceed 100 characters")
    .describe("存檔名稱，用於標識和組織存檔"),
    // Archive name for identification and organization
  description: z
    .string()
    .optional()
    .describe("存檔描述，可選的詳細說明"),
    // Archive description, optional detailed explanation
});

/**
 * Creates a new task archive with the current task state
 * 
 * @param params - Archive creation parameters
 * @param params.name - Archive name for identification
 * @param params.description - Optional detailed description
 * @returns Promise resolving to archive creation result
 */
export async function createArchive({
  name,
  description,
}: z.infer<typeof createArchiveSchema>) {
  try {
    // 調用模型層創建存檔
    // Call model layer to create archive
    const archiveDescription = description ? `${name} - ${description}` : name;
    const result = await createTaskArchive(archiveDescription);

    return {
      content: [
        {
          type: "text" as const,
          text: await getCreateArchivePrompt({
            success: result.success,
            message: result.message,
            archiveFile: result.archiveFile,
          }),
        },
      ],
      isError: !result.success,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: await getCreateArchivePrompt({
            success: false,
            message: `Failed to create archive: ${error instanceof Error ? error.message : String(error)}`,
            archiveFile: "",
          }),
        },
      ],
      isError: true,
    };
  }
}