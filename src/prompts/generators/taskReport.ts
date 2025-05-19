/**
 * 任务报告提示生成器
 */
import { Task } from "../../types/index.js";
import { loadPromptFromTemplate } from "../loader.js";
import { execSync } from "child_process";

// 定义参数接口
interface TaskReportParams {
  task: Task;
  allCompletedTasks?: Task[]; // 添加所有已完成任务数组
  issue: string;
  username: string;
  template: "default" | "simple" | "detailed";
  includeHistory: boolean;
  outputFormat: "markdown" | "html";
  gitInfo?: {
    commitHash?: string;
    commitDate?: string;
    commitTime?: string;
  };
}

/**
 * 尝试从git获取提交时间信息
 * @returns 包含日期和时间的对象，如果获取失败则返回null
 */
function tryGetGitTimeInfo(commitHash?: string): { date: string; time: string; datetime: string } | null {
  try {
    // 如果提供了特定的commit hash，使用它，否则使用HEAD
    const hash = commitHash || 'HEAD';
    // 获取git提交的日期时间信息
    const dateTimeStr = execSync(`git show -s --format=%ci ${hash}`).toString().trim();
    
    if (dateTimeStr) {
      const dateObj = new Date(dateTimeStr);
      // 格式化为需要的格式
      const date = dateObj.toISOString().split('T')[0];
      const time = dateObj.toISOString().split('T')[1].replace(/\..+/, '');
      const datetime = `${date}_${time.replace(/:/g, '-')}`;
      
      return { date, time, datetime };
    }
  } catch (error) {
    // 获取git信息失败时不抛出错误，仅返回null
  }
  
  return null;
}

/**
 * 生成任务报告提示
 * @param params 任务报告参数
 * @returns 生成的提示
 */
export function getTaskReportPrompt(params: TaskReportParams): string {
  const { task, allCompletedTasks, issue, username, template, includeHistory, outputFormat, gitInfo } = params;

  // 首先尝试从传入的gitInfo获取时间
  let date: string, time: string, datetime: string;
  
  if (gitInfo && gitInfo.commitDate && gitInfo.commitTime) {
    // 使用提供的git信息
    date = gitInfo.commitDate;
    time = gitInfo.commitTime;
    datetime = `${date}_${time.replace(/:/g, '-')}`;
  } else {
    // 尝试从git命令获取时间
    const gitTimeInfo = tryGetGitTimeInfo(gitInfo?.commitHash);
    
    if (gitTimeInfo) {
      // 使用git命令获取的时间
      date = gitTimeInfo.date;
      time = gitTimeInfo.time;
      datetime = gitTimeInfo.datetime;
    } else {
      // 如果无法从git获取，使用当前时间
      const now = new Date();
      date = now.toISOString().split('T')[0];
      time = now.toISOString().split('T')[1].replace(/\..+/, '');
      datetime = `${date}_${time.replace(/:/g, '-')}`;
    }
  }

  // 加载任务报告模板
  let promptTemplate = loadPromptFromTemplate("taskReport/taskreport.md");

  // 准备任务状态映射
  const statusMap: Record<string, string> = {
    PENDING: "待处理",
    IN_PROGRESS: "进行中",
    COMPLETED: "已完成",
    BLOCKED: "已阻塞",
  };

  // 准备已完成任务的列表（如果有）
  let completedTasksList = '';
  if (allCompletedTasks && allCompletedTasks.length > 0) {
    completedTasksList = '# 已完成任务列表\n';
    allCompletedTasks.forEach((completedTask, index) => {
      completedTasksList += `${index + 1}. **${completedTask.name}** (ID: ${completedTask.id})\n`;
      if (completedTask.summary) {
        completedTasksList += `   - 摘要: ${completedTask.summary}\n`;
      }
      if (completedTask.completedAt) {
        const completedDate = new Date(completedTask.completedAt).toISOString().split('T')[0];
        completedTasksList += `   - 完成时间: ${completedDate}\n`;
      }
      completedTasksList += '\n';
    });
  }

  // 替换模板中的占位符
  promptTemplate = promptTemplate
    .replace(/\[TASK\]/g, task.name)
    .replace(/\[TASK_IDENTIFIER\]/g, task.id)
    .replace(/\[TASK_FILE_NAME\]/g, `${date}_${task.id.substring(0, 8)}`)
    .replace(/\[TASK_DATE_AND_NUMBER\]/g, datetime)
    .replace(/\[DATETIME\]/g, datetime)
    .replace(/\[DATE\]/g, date)
    .replace(/\[TIME\]/g, time)
    .replace(/\[USER_NAME\]/g, username)
    .replace(/\[JIRA_ISSUE_NUMBER\]/g, issue)
    .replace(/\[COMPLETED_TASKS_LIST\]/g, completedTasksList); // 添加已完成任务列表

  return promptTemplate;
} 