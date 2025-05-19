import { generatePrompt } from "../loader.js";
import { GitAnalysisArgs } from "../../types/index.js";

/**
 * 生成Git分析提示
 * 分析代码更改与任务的关联性，确定完成了哪些任务
 */
export function getGitAnalysisPrompt({
  diffOutput,
  changedFiles,
  commitInfo,
  tasksToAnalyze,
}: GitAnalysisArgs) {
  // 准备任务列表信息
  const taskListInfo = tasksToAnalyze
    .map(
      (task) => `
任务ID: ${task.id}
任务名称: ${task.name}
任务描述: ${task.description}
任务状态: ${task.status}
${
  task.relatedFiles
    ? `相关文件: ${task.relatedFiles
        .map((f) => `${f.path} (${f.type})`)
        .join(", ")}`
    : ""
}
`
    )
    .join("\n---\n");

  // 使用模板生成最终提示
  return generatePrompt("gitAnalysis", {
    diffOutput,
    changedFiles: changedFiles.join("\n"),
    commitInfo,
    taskListInfo,
  });
} 