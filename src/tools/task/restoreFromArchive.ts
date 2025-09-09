import { z } from "zod";
import { restoreFromArchive as modelRestoreFromArchive } from "../../models/taskModel.js";
import { getRestoreFromArchivePrompt } from "../../prompts/index.js";

/**
 * 從存檔恢復任務工具
 * Restore tasks from archive tool
 * 
 * This tool allows users to restore tasks from a previously created archive,
 * with options to merge with existing tasks or completely replace them.
 * 
 * @example
 * ```typescript
 * await restoreFromArchive({
 *   archive_id: "archive_2025-01-15T10-30-00.json",
 *   merge: true
 * });
 * ```
 */
export const restoreFromArchiveSchema = z.object({
  archive_id: z
    .string()
    .min(1, "Archive ID cannot be empty")
    .describe("要恢復的存檔ID或文件名"),
    // Archive ID or filename to restore from
  merge: z
    .boolean()
    .default(true)
    .describe("是否與現有任務合併（true）或完全替換（false），默認為合併"),
    // Whether to merge with existing tasks (true) or completely replace (false), defaults to merge
});

/**
 * Restores tasks from an archive with merge or replace options
 * 
 * @param params - Archive restoration parameters
 * @param params.archive_id - Archive filename or ID to restore from
 * @param params.merge - Whether to merge with existing tasks (true) or replace all (false)
 * @returns Promise resolving to restoration result with count of restored tasks
 */
export async function restoreFromArchive({
  archive_id,
  merge,
}: z.infer<typeof restoreFromArchiveSchema>) {
  try {
    // 確定恢復策略
    // Determine restore strategy
    const action = merge ? "merge" : "replace";

    // 調用模型層恢復任務
    // Call model layer to restore tasks
    const result = await modelRestoreFromArchive(archive_id, {
      merge: merge,
      preserveIds: false,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: await getRestoreFromArchivePrompt({
            success: result.success,
            message: result.message,
            archiveId: archive_id,
            action,
            restoredCount: result.restoredCount || 0,
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
          text: await getRestoreFromArchivePrompt({
            success: false,
            message: `Failed to restore from archive: ${error instanceof Error ? error.message : String(error)}`,
            archiveId: archive_id,
            action: merge ? "merge" : "replace",
            restoredCount: 0,
          }),
        },
      ],
      isError: true,
    };
  }
}