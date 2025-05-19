/**
 * verifyTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";
import { Task } from "../../types/index.js";

/**
 * verifyTask prompt 參數介面
 */
export interface VerifyTaskPromptParams {
  task: Task;
  score: number;
  summary: string;
  taskCompleted?: boolean; // 任务是否已完成
  isLastTask?: boolean; // 是否为最后一个任务
}

/**
 * 提取摘要內容
 * @param content 原始內容
 * @param maxLength 最大長度
 * @returns 提取的摘要
 */
function extractSummary(
  content: string | undefined,
  maxLength: number
): string {
  if (!content) return "";

  if (content.length <= maxLength) {
    return content;
  }

  // 簡單的摘要提取：截取前 maxLength 個字符並添加省略號
  return content.substring(0, maxLength) + "...";
}

/**
 * 獲取 verifyTask 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export function getVerifyTaskPrompt(params: VerifyTaskPromptParams): string {
  const { task, score, summary, taskCompleted, isLastTask } = params;
  if (score < 80) {
    const noPassTemplate = loadPromptFromTemplate("verifyTask/noPass.md");
    const prompt = generatePrompt(noPassTemplate, {
      name: task.name,
      id: task.id,
      summary,
    });
    return prompt;
  }
  
  const indexTemplate = loadPromptFromTemplate("verifyTask/index.md");
  const prompt = generatePrompt(indexTemplate, {
    name: task.name,
    id: task.id,
    description: task.description,
    notes: task.notes || "no notes",
    verificationCriteria:
      task.verificationCriteria || "no verification criteria",
    implementationGuideSummary:
      extractSummary(task.implementationGuide, 200) ||
      "no implementation guide",
    analysisResult:
      extractSummary(task.analysisResult, 300) || "no analysis result",
    taskCompleted: taskCompleted || false,
    isLastTask: isLastTask || false,
  });

  // 添加调用taskReport的指导
  let finalPrompt = loadPrompt(prompt, "VERIFY_TASK");
  
  // 如果任务已完成且是最后一个任务，添加关于生成报告的提示
  if (taskCompleted && isLastTask) {
    finalPrompt += `\n\n## 🎉 所有任务已完成！\n\n恭喜您已完成所有任务！现在可以使用 taskReport 工具生成完整的任务报告：\n\n请使用以下命令生成任务报告：\n\`\`\`\ntaskReport({\n  taskId: "${task.id}"\n})\n\`\`\`\n\n这将自动生成一份包含任务需求、执行步骤和完成状态的详细报告。`;
  }
  
  return finalPrompt;
}
