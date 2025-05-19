import { z } from "zod";
import { generateTaskReport, getAllTasks } from "../../models/taskModel.js";
import { TaskExecutionStep, Task, TaskStatus } from "../../types/index.js";
import { getTaskReportPrompt } from "../../prompts/index.js";

// 任務報告工具 - 不需要参数，直接使用所有已完成任务
export const taskReportSchema = z.object({});

export async function taskReport() {
  try {
    // 获取所有任务
    const allTasks = await getAllTasks();
    
    // 筛选出所有已完成的任务
    const completedTasks = allTasks.filter(t => t.status === TaskStatus.COMPLETED);
    
    if (completedTasks.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `## 生成任務報告失敗\n\n沒有已完成的任務，無法生成報告`,
          },
        ],
        isError: true,
      };
    }
    
    // 选择最近完成的任务作为报告主体
    const latestTask = completedTasks.sort((a, b) => 
      (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0)
    )[0];
    
    // 从任务中提取必要信息
    const reportData = {
      requirements: latestTask.description || "",
      taskBreakdown: latestTask.implementationGuide || "",
      executionSteps: [] as TaskExecutionStep[],
      completionStatus: latestTask.summary || "任务已完成"
    };
    
    // 如果任务已有报告，则使用现有数据
    if (latestTask.taskReport) {
      Object.assign(reportData, latestTask.taskReport);
    }
    
    // 调用generateTaskReport生成报告
    const result = await generateTaskReport(latestTask.id, reportData, completedTasks);

    if (!result.success) {
      return {
        content: [
          {
            type: "text" as const,
            text: `## 生成任務報告失敗\n\n${result.message}`,
          },
        ],
        isError: true,
      };
    }
    
    // 获取任务数据
    const updatedTask = result.task;
    
    if (!updatedTask) {
      return {
        content: [
          {
            type: "text" as const,
            text: `## 系統錯誤\n\n無法獲取任務數據。`,
          },
        ],
        isError: true,
      };
    }

    // 生成报告提示词
    const prompt = getTaskReportPrompt({
      task: updatedTask,
      allCompletedTasks: completedTasks,
      issue: "",
      username: "system",
      template: "default",
      includeHistory: true,
      outputFormat: "markdown"
    });

    return {
      content: [
        {
          type: "text" as const,
          text: `## 任務報告已生成\n\n共 ${completedTasks.length} 個已完成任務的報告已成功生成。\n\n主要任務: "${updatedTask.name}" (ID: \`${updatedTask.id}\`)\n\n json文件路徑: ${result.reportFilePath || "未保存到文件"}\n\n 读取该文件内容，参考本文档的格式来输出一份taskreport.md  \n\n${prompt}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "未知錯誤";
    return {
      content: [
        {
          type: "text" as const,
          text: `## 生成任務報告時發生錯誤\n\n${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
} 