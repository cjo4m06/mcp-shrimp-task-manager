/**
 * getTaskHistory prompt 生成器
 * getTaskHistory prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * 任務歷史條目介面
 * Task history entry interface
 */
export interface TaskHistoryEntry {
  timestamp: string;
  commit: string;
  message: string;
  taskId?: string;
  taskName?: string;
  operation?: string;
}

/**
 * getTaskHistory prompt 參數介面
 * getTaskHistory prompt parameters interface
 */
export interface GetTaskHistoryPromptParams {
  entries: TaskHistoryEntry[];
  filters: {
    limit: number;
    include_deleted: boolean;
    since?: string;
    task_id?: string;
    operation?: string;
  };
  totalEntries: number;
}

/**
 * 獲取 getTaskHistory 的完整 prompt
 * Get the complete prompt for getTaskHistory
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getTaskHistoryPrompt(
  params: GetTaskHistoryPromptParams
): Promise<string> {
  const { entries, filters, totalEntries } = params;

  // 如果沒有歷史記錄，顯示通知
  // If there are no history entries, show notification
  if (entries.length === 0) {
    const noEntriesTemplate = await loadPromptFromTemplate(
      "getTaskHistory/noEntries.md"
    );
    return noEntriesTemplate;
  }

  // 生成篩選條件摘要
  // Generate filters summary
  let filtersSummary = "## 查詢條件\n\n";
  filtersSummary += `- **記錄限制:** ${filters.limit} 條\n`;
  filtersSummary += `- **包含已刪除任務:** ${filters.include_deleted ? "是" : "否"}\n`;
  
  if (filters.since) {
    filtersSummary += `- **起始時間:** ${filters.since}\n`;
  }
  
  if (filters.task_id) {
    filtersSummary += `- **任務ID:** \`${filters.task_id}\`\n`;
  }
  
  if (filters.operation) {
    filtersSummary += `- **操作類型:** ${filters.operation}\n`;
  }

  // 生成歷史記錄列表
  // Generate history entries list
  let historyEntries = "";
  const entryTemplate = await loadPromptFromTemplate(
    "getTaskHistory/historyEntry.md"
  );

  for (const entry of entries) {
    // 格式化時間戳
    // Format timestamp
    const formattedTime = new Date(entry.timestamp).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Taipei'
    });

    // 生成任務資訊
    // Generate task info
    let taskInfo = "";
    if (entry.taskId) {
      taskInfo += `**任務ID:** \`${entry.taskId}\`  \n`;
    }
    if (entry.taskName) {
      taskInfo += `**任務名稱:** ${entry.taskName}  \n`;
    }

    // 確定操作類型圖標和名稱
    // Determine operation type icon and name
    let operation = "操作";
    if (entry.operation) {
      switch (entry.operation.toLowerCase()) {
        case "create":
          operation = "🆕 創建";
          break;
        case "update":
          operation = "📝 更新";
          break;
        case "complete":
          operation = "✅ 完成";
          break;
        case "delete":
          operation = "🗑️ 刪除";
          break;
        default:
          operation = `🔄 ${entry.operation}`;
      }
    }

    historyEntries += generatePrompt(entryTemplate, {
      operation,
      timestamp: formattedTime,
      commit: entry.commit.substring(0, 7), // Short commit hash
      message: entry.message,
      taskInfo,
    });
  }

  // 生成最終 prompt
  // Generate final prompt
  const indexTemplate = await loadPromptFromTemplate("getTaskHistory/index.md");
  let prompt = generatePrompt(indexTemplate, {
    filtersSummary,
    totalEntries,
    historyEntries,
    noEntriesMessage: "", // Empty since we have entries
  });

  // 載入可能的自定義 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "GET_TASK_HISTORY");
}