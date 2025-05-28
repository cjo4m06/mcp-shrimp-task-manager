import { RelatedFile, RelatedFileType } from "../types/index.js";

/**
 * Generate content summary for task-related files
 *
 * This function generates a summary of files based on the provided RelatedFile object list, without actually reading the file content.
 * This is a lightweight implementation that generates a formatted summary based only on file metadata (such as path, type, description, etc.),
 * suitable for scenarios where file context information is needed but actual file content does not need to be accessed.
 *
 * @param relatedFiles List of related files - an array of RelatedFile objects, including file path, type, description, etc.
 * @param maxTotalLength Maximum total length of the summary content - controls the total number of characters generated in the summary to avoid excessive return content
 * @returns An object containing two fields:
 *   - content: Detailed file information, including basic information and prompt messages for each file
 *   - summary: Concise file list overview, suitable for quick browsing
 */
export async function loadTaskRelatedFiles(
  relatedFiles: RelatedFile[],
  maxTotalLength: number = 15000
): Promise<{ content: string; summary: string }> {
  if (!relatedFiles || relatedFiles.length === 0) {
    return {
      content: "",
      summary: "No related files",
    };
  }

  let totalContent = "";
  let filesSummary = `## Related File Content Summary (Total ${relatedFiles.length} files)\n\n`;
  let totalLength = 0;

  // Sort files by priority (first process files to be modified)
  const priorityOrder: Record<RelatedFileType, number> = {
    [RelatedFileType.TO_MODIFY]: 1,
    [RelatedFileType.REFERENCE]: 2,
    [RelatedFileType.DEPENDENCY]: 3,
    [RelatedFileType.CREATE]: 4,
    [RelatedFileType.OTHER]: 5,
  };

  const sortedFiles = [...relatedFiles].sort(
    (a, b) => priorityOrder[a.type] - priorityOrder[b.type]
  );

  // Process each file
  for (const file of sortedFiles) {
    if (totalLength >= maxTotalLength) {
      filesSummary += `\n### Context length limit reached, some files not loaded\n`;
      break;
    }

    // Generate file basic information
    const fileInfo = generateFileInfo(file);

    // Add to total content
    const fileHeader = `\n### ${file.type}: ${file.path}${
      file.description ? ` - ${file.description}` : ""
    }${
      file.lineStart && file.lineEnd
        ? ` (lines ${file.lineStart}-${file.lineEnd})`
        : ""
    }\n\n`;

    totalContent += fileHeader + "```\n" + fileInfo + "\n```\n\n";
    filesSummary += `- **${file.path}**${
      file.description ? ` - ${file.description}` : ""
    } (${fileInfo.length} characters)\n`;

    totalLength += fileInfo.length + fileHeader.length + 8; // 8 for "```\n" and "\n```"
  }

  return {
    content: totalContent,
    summary: filesSummary,
  };
}

/**
 * Generate basic file information summary
 *
 * Generates a formatted information summary based on file metadata, including file path, type, and related prompts.
 * Does not read actual file content, only generates information based on the provided RelatedFile object.
 *
 * @param file Related file object - includes file path, type, description, and other basic information
 * @returns Formatted file information summary text
 */
function generateFileInfo(file: RelatedFile): string {
  let fileInfo = `File: ${file.path}\n`;
  fileInfo += `Type: ${file.type}\n`;

  if (file.description) {
    fileInfo += `Description: ${file.description}\n`;
  }

  if (file.lineStart && file.lineEnd) {
    fileInfo += `Line range: ${file.lineStart}-${file.lineEnd}\n`;
  }

  fileInfo += `To view the actual content, please check the file directly: ${file.path}\n`;

  return fileInfo;
}
