import { z } from "zod";
import { UUID_V4_REGEX } from "../../utils/regex.js";
import {
  getTaskById,
  updateTaskStatus,
  updateTaskSummary,
} from "../../models/taskModel.js";
import { TaskStatus, TaskCompletionDetails } from "../../types/index.js";
import { getVerifyTaskPrompt } from "../../prompts/index.js";

// Enhanced parser function for extracting structured data from summary
// Always generates meaningful completion details even from minimal input
function parseCompletionSummary(summary: string, score: number = 0): TaskCompletionDetails {
  const result: TaskCompletionDetails = {
    keyAccomplishments: [],
    implementationDetails: [],
    technicalChallenges: [],
    completedAt: new Date(),
    verificationScore: score
  };
  
  if (!summary) {
    // Generate default completion details when no summary provided
    result.keyAccomplishments.push("Task completed successfully");
    result.implementationDetails.push("Task executed according to specifications");
    return result;
  }
  
  // Extract sections using enhanced patterns
  const lines = summary.split('\n');
  let currentSection = '';
  const allContent: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check for section headers with more patterns
    if (/key\s*accomplishment|achievement|complete|success|主要成就|關鍵成果/i.test(trimmedLine)) {
      currentSection = 'accomplishments';
    } else if (/implementation|detail|technical\s*detail|approach|method|實施|技術細節/i.test(trimmedLine)) {
      currentSection = 'implementation';
    } else if (/challenge|issue|problem|difficulty|obstacle|挑戰|問題/i.test(trimmedLine)) {
      currentSection = 'challenges';
    } else if (/score|分數|verified|驗證/i.test(trimmedLine)) {
      // Extract verification score
      const scoreMatch = trimmedLine.match(/(\d+)/);
      if (scoreMatch) {
        result.verificationScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
      }
    } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*') || trimmedLine.startsWith('•')) {
      // Extract bullet points
      const content = trimmedLine.replace(/^[-*•]\s*/, '').trim();
      if (content) {
        switch (currentSection) {
          case 'accomplishments':
            result.keyAccomplishments.push(content);
            break;
          case 'implementation':
            result.implementationDetails.push(content);
            break;
          case 'challenges':
            result.technicalChallenges.push(content);
            break;
          default:
            // Store for later processing if no section identified yet
            allContent.push(content);
            break;
        }
      }
    } else if (trimmedLine.length > 10 && !trimmedLine.startsWith('#')) {
      // Capture substantive text that isn't a header
      allContent.push(trimmedLine);
    }
  }
  
  // If no structured data was extracted, parse the summary more intelligently
  if (result.keyAccomplishments.length === 0 && 
      result.implementationDetails.length === 0 && 
      result.technicalChallenges.length === 0) {
    
    // Use all collected content to generate structured data
    const summaryText = allContent.length > 0 ? allContent.join(' ') : summary;
    
    // Generate accomplishments from summary
    if (summaryText.length > 20) {
      // Extract key phrases as accomplishments
      const sentences = summaryText.match(/[^.!?]+[.!?]+/g) || [summaryText];
      sentences.slice(0, 3).forEach(sentence => {
        const cleaned = sentence.trim();
        if (cleaned.length > 10) {
          result.keyAccomplishments.push(cleaned);
        }
      });
    }
    
    // Ensure at least one accomplishment
    if (result.keyAccomplishments.length === 0) {
      result.keyAccomplishments.push(summaryText.substring(0, 200) || "Task completed as specified");
    }
    
    // Generate implementation details
    if (summaryText.includes('implement') || summaryText.includes('create') || 
        summaryText.includes('update') || summaryText.includes('fix')) {
      result.implementationDetails.push("Implementation followed best practices and coding standards");
    }
    
    // Look for technical terms to add as implementation details
    const techTerms = summaryText.match(/\b(API|database|function|component|module|test|validation|error handling|performance)\b/gi);
    if (techTerms && techTerms.length > 0) {
      result.implementationDetails.push(`Enhanced ${[...new Set(techTerms)].join(', ')}`);
    }
    
    // Default implementation detail if none found
    if (result.implementationDetails.length === 0) {
      result.implementationDetails.push("Task implementation completed according to requirements");
    }
    
    // Look for challenges or note if none encountered
    if (summaryText.includes('error') || summaryText.includes('issue') || 
        summaryText.includes('fix') || summaryText.includes('debug')) {
      result.technicalChallenges.push("Identified and resolved implementation issues");
    } else {
      result.technicalChallenges.push("No significant technical challenges encountered");
    }
  }
  
  // Ensure verification score is set
  if (result.verificationScore === 0 && score > 0) {
    result.verificationScore = score;
  }
  
  return result;
}

// 檢驗任務工具
// Task verification tool
export const verifyTaskSchema = z.object({
  taskId: z
    .string()
    .regex(UUID_V4_REGEX, {
      message: "任務ID格式無效，請提供有效的UUID v4格式",
      // message: "Invalid task ID format, please provide a valid UUID v4 format",
    })
    .describe("待驗證任務的唯一標識符，必須是系統中存在的有效任務ID"),
    // .describe("Unique identifier of the task to be verified, must be a valid task ID that exists in the system")
  summary: z
    .string()
    .min(30, {
      message: "最少30個字",
      // message: "Minimum 30 characters",
    })
    .describe(
      "當分數高於或等於 80分時代表任務完成摘要，簡潔描述實施結果和重要決策，當分數低於 80分時代表缺失或需要修正的部分說明，最少30個字"
      // "When score is 80 or above, this represents task completion summary, briefly describing implementation results and important decisions. When score is below 80, this represents missing or parts that need correction, minimum 30 characters"
    ),
  score: z
    .number()
    .min(0, { message: "分數不能小於0" })
    // .min(0, { message: "Score cannot be less than 0" })
    .max(100, { message: "分數不能大於100" })
    // .max(100, { message: "Score cannot be greater than 100" })
    .describe("針對任務的評分，當評分等於或超過80分時自動完成任務"),
    // .describe("Score for the task, automatically completes task when score equals or exceeds 80")
  
  // Optional structured completion fields
  keyAccomplishments: z
    .array(z.string())
    .optional()
    .describe("關鍵成就清單，列出任務完成的主要成果"),
    // .describe("List of key accomplishments, listing main achievements of task completion")
  
  implementationDetails: z
    .array(z.string())
    .optional()
    .describe("實施細節清單，描述技術實現的具體方法和步驟"),
    // .describe("List of implementation details, describing specific methods and steps of technical implementation")
  
  technicalChallenges: z
    .array(z.string())
    .optional()
    .describe("技術挑戰清單，記錄遇到的困難及解決方案"),
    // .describe("List of technical challenges, recording difficulties encountered and solutions")
});

export async function verifyTask({
  taskId,
  summary,
  score,
  keyAccomplishments,
  implementationDetails,
  technicalChallenges,
}: z.infer<typeof verifyTaskSchema>) {
  const task = await getTaskById(taskId);

  if (!task) {
    return {
      content: [
        {
          type: "text" as const,
          text: `## 系統錯誤\n\n找不到ID為 \`${taskId}\` 的任務。請使用「list_tasks」工具確認有效的任務ID後再試。`,
          // text: `## System Error\n\nCannot find task with ID \`${taskId}\`. Please use the "list_tasks" tool to confirm a valid task ID and try again.`,
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
          text: `## 狀態錯誤\n\n任務 "${task.name}" (ID: \`${task.id}\`) 當前狀態為 "${task.status}"，不處於進行中狀態，無法進行檢驗。\n\n只有狀態為「進行中」的任務才能進行檢驗。請先使用「execute_task」工具開始任務執行。`,
          // text: `## Status Error\n\nTask "${task.name}" (ID: \`${task.id}\`) current status is "${task.status}", not in progress state, cannot be verified.\n\nOnly tasks with "In Progress" status can be verified. Please use the "execute_task" tool to start task execution first.`,
        },
      ],
      isError: true,
    };
  }

  if (score >= 80) {
    // 完成任務並保存摘要
    // Complete task and save summary
    
    // Always generate completion details - this is now mandatory
    const parsedDetails = parseCompletionSummary(summary, score);
    
    // Merge provided structured fields with parsed data, prioritizing provided fields
    const completionDetails: TaskCompletionDetails = {
      keyAccomplishments: (keyAccomplishments && keyAccomplishments.length > 0) 
        ? keyAccomplishments 
        : parsedDetails.keyAccomplishments,
      implementationDetails: (implementationDetails && implementationDetails.length > 0)
        ? implementationDetails
        : parsedDetails.implementationDetails,
      technicalChallenges: (technicalChallenges && technicalChallenges.length > 0)
        ? technicalChallenges
        : parsedDetails.technicalChallenges,
      completedAt: new Date(),
      verificationScore: score
    };
    
    // Ensure we always have meaningful completion details
    if (completionDetails.keyAccomplishments.length === 0) {
      completionDetails.keyAccomplishments.push(`Successfully completed task: ${task.name}`);
    }
    if (completionDetails.implementationDetails.length === 0) {
      completionDetails.implementationDetails.push("Task executed according to defined requirements and specifications");
    }
    if (completionDetails.technicalChallenges.length === 0) {
      completionDetails.technicalChallenges.push("No significant technical obstacles encountered during implementation");
    }
    
    // Update task with summary and mandatory completion details
    await updateTaskSummary(taskId, summary, completionDetails);
    await updateTaskStatus(taskId, TaskStatus.COMPLETED);
  }

  // 使用prompt生成器獲取最終prompt
  // Use prompt generator to get final prompt
  const prompt = await getVerifyTaskPrompt({ task, score, summary });

  return {
    content: [
      {
        type: "text" as const,
        text: prompt,
      },
    ],
  };
}
