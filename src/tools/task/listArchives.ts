import { z } from "zod";
import { listTaskArchives } from "../../models/taskModel.js";
import { getListArchivesPrompt } from "../../prompts/index.js";

/**
 * 列出任務存檔工具
 * List task archives tool
 * 
 * This tool retrieves and displays all available task archives,
 * with optional filtering capabilities to find specific archives.
 * 
 * @example
 * ```typescript
 * await listArchives({ filter: "sprint" });
 * ```
 */
export const listArchivesSchema = z.object({
  filter: z
    .string()
    .optional()
    .describe("可選的過濾條件，用於搜索特定的存檔"),
    // Optional filter criteria for searching specific archives
});

/**
 * Lists all available task archives with optional filtering
 * 
 * @param params - Archive listing parameters
 * @param params.filter - Optional filter string to search archive names
 * @returns Promise resolving to formatted list of archives
 */
export async function listArchives({
  filter,
}: z.infer<typeof listArchivesSchema>) {
  try {
    // 調用模型層獲取存檔列表
    // Call model layer to get archive list
    const archives = await listTaskArchives();

    // 如果提供了過濾條件，則過濾存檔
    // If filter is provided, filter archives
    const filteredArchives = filter
      ? archives.filter((archive) =>
          archive.filename.toLowerCase().includes(filter.toLowerCase())
        )
      : archives;

    return {
      content: [
        {
          type: "text" as const,
          text: await getListArchivesPrompt({
            archives: filteredArchives,
            filter,
            totalCount: archives.length,
            filteredCount: filteredArchives.length,
          }),
        },
      ],
      isError: false,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: await getListArchivesPrompt({
            archives: [],
            error: `Failed to list archives: ${error instanceof Error ? error.message : String(error)}`,
            totalCount: 0,
            filteredCount: 0,
          }),
        },
      ],
      isError: true,
    };
  }
}