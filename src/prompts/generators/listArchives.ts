/**
 * listArchives prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */
/**
 * listArchives prompt generator
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * TaskArchive 介面
 */
/**
 * TaskArchive interface
 */
interface TaskArchive {
  filename: string;
  timestamp: Date;
  tasksCount: number;
  size: number;
}

/**
 * listArchives prompt 參數介面
 */
/**
 * listArchives prompt parameter interface
 */
export interface ListArchivesPromptParams {
  archives: TaskArchive[];
  filter?: string;
  error?: string;
  totalCount: number;
  filteredCount: number;
}

/**
 * 獲取 listArchives 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
/**
 * Get complete prompt for listArchives
 * @param params prompt parameters
 * @returns generated prompt
 */
export async function getListArchivesPrompt(
  params: ListArchivesPromptParams
): Promise<string> {
  const { archives, filter, error, totalCount, filteredCount } = params;

  // 處理錯誤情況
  // Handle error situations
  if (error) {
    const errorTemplate = await loadPromptFromTemplate("listArchives/error.md");
    return generatePrompt(errorTemplate, { error });
  }

  // 處理空列表情況
  // Handle empty list situations
  if (archives.length === 0 && !filter) {
    const emptyTemplate = await loadPromptFromTemplate("listArchives/empty.md");
    return generatePrompt(emptyTemplate, {});
  }

  // 處理過濾後無結果情況
  // Handle no results after filtering
  if (archives.length === 0 && filter) {
    const noResultsTemplate = await loadPromptFromTemplate("listArchives/noResults.md");
    return generatePrompt(noResultsTemplate, { filter });
  }

  // 生成存檔列表內容
  // Generate archive list content
  const archiveList = archives
    .map((archive) => {
      const date = archive.timestamp.toLocaleDateString();
      const time = archive.timestamp.toLocaleTimeString();
      const sizeKB = Math.round(archive.size / 1024);
      return `- **${archive.filename}**\n  📅 ${date} ${time} | 📊 ${archive.tasksCount} tasks | 💾 ${sizeKB} KB`;
    })
    .join("\n");

  // 使用主模板生成最終 prompt
  // Use main template to generate final prompt
  const indexTemplate = await loadPromptFromTemplate("listArchives/index.md");
  const prompt = generatePrompt(indexTemplate, {
    archiveList,
    filter: filter || "",
    totalCount,
    filteredCount,
    hasFilter: !!filter,
  });

  // 載入可能的自定義 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "LIST_ARCHIVES");
}