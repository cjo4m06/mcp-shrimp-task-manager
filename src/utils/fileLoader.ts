import { RelatedFile, RelatedFileType } from '../types/index.js';

/**
 * 生成任務相關文件的內容摘要
 *
 * 此函數根據提供的 RelatedFile 物件列表，生成文件的摘要信息，而不實際讀取檔案內容。
 * 這是一個輕量級的實現，僅基於檔案元數據（如路徑、類型、描述等）生成格式化的摘要，
 * 適用於需要提供文件上下文信息但不需要訪問實際檔案內容的情境。
 *
 * @param relatedFiles 相關文件列表 - RelatedFile 物件數組，包含文件的路徑、類型、描述等資訊
 * @param maxTotalLength 摘要內容的最大總長度 - 控制生成摘要的總字符數，避免過大的返回內容
 * @returns 包含兩個字段的物件：
 *   - content: 詳細的文件資訊，包含每個檔案的基本資訊和提示訊息
 *   - summary: 簡潔的檔案列表概覽，適合快速瀏覽
 */
export async function loadTaskRelatedFiles(
  relatedFiles: RelatedFile[],
  maxTotalLength: number = 15000 // 控制生成內容的總長度
): Promise<{ content: string; summary: string }> {
  if (!relatedFiles || relatedFiles.length === 0) {
    return {
      content: '',
      summary: '無相關文件',
    };
  }

  let totalContent = '';
  let filesSummary = `## 相關文件內容摘要 (共 ${relatedFiles.length} 個文件)\n\n`;
  let totalLength = 0;

  // 按文件類型優先級排序（首先處理待修改的文件）
  const priorityOrder: Record<RelatedFileType, number> = {
    [RelatedFileType.TO_MODIFY]: 1,
    [RelatedFileType.REFERENCE]: 2,
    [RelatedFileType.DEPENDENCY]: 3,
    [RelatedFileType.CREATE]: 4,
    [RelatedFileType.OTHER]: 5,
  };

  const sortedFiles = [...relatedFiles].sort((a, b) => priorityOrder[a.type] - priorityOrder[b.type]);

  // 處理每個文件
  for (const file of sortedFiles) {
    if (totalLength >= maxTotalLength) {
      filesSummary += `\n### 已達到上下文長度限制，部分文件未載入\n`;
      break;
    }

    // 生成文件基本資訊
    const fileInfo = generateFileInfo(file);

    // 添加到總內容
    const fileHeader = `\n### ${file.type}: ${file.path}${file.description ? ` - ${file.description}` : ''}${
      file.lineStart && file.lineEnd ? ` (行 ${file.lineStart}-${file.lineEnd})` : ''
    }\n\n`;

    totalContent += fileHeader + '```\n' + fileInfo + '\n```\n\n';
    filesSummary += `- **${file.path}**${file.description ? ` - ${file.description}` : ''} (${fileInfo.length} 字符)\n`;

    totalLength += fileInfo.length + fileHeader.length + 8; // 8 for "```\n" and "\n```"
  }

  return {
    content: totalContent,
    summary: filesSummary,
  };
}

/**
 * 生成文件基本資訊摘要
 *
 * 根據檔案的元數據生成格式化的資訊摘要，包含檔案路徑、類型和相關提示。
 * 不讀取實際檔案內容，僅基於提供的 RelatedFile 物件生成信息。
 *
 * @param file 相關文件物件 - 包含檔案路徑、類型、描述等基本資訊
 * @returns 格式化的檔案資訊摘要文字
 */
function generateFileInfo(file: RelatedFile): string {
  let fileInfo = `檔案: ${file.path}\n`;
  fileInfo += `類型: ${file.type}\n`;

  if (file.description) {
    fileInfo += `描述: ${file.description}\n`;
  }

  if (file.lineStart && file.lineEnd) {
    fileInfo += `行範圍: ${file.lineStart}-${file.lineEnd}\n`;
  }

  fileInfo += `若需查看實際內容，請直接查看檔案: ${file.path}\n`;

  return fileInfo;
}
