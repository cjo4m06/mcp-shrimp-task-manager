import { z } from "zod";
import { exec, execSync } from "child_process";
import { promisify } from "util";
import { loadPromptFromTemplate, generatePrompt } from "../prompts/loader.js";
import { Task, TaskStatus } from "../types/index.js";
import { getAllTasks } from "../models/taskModel.js";
import fs from "fs";
import path from "path";

const execPromise = promisify(exec);

// 定义schema
export const analyzeGitDiffSchema = z.object({
  commitRange: z
    .string()
    .optional()
    .describe("要分析的提交范围，例如'HEAD~3..HEAD'，默认为最新提交"),
  taskId: z
    .string()
    .optional()
    .describe("要验证的特定任务ID，如果提供则仅分析与该任务相关的更改"),
});

/**
 * 从git commit信息中提取日期和时间
 * @param commitInfo Git提交信息
 * @returns 包含日期和时间的对象，如果无法提取则返回null
 */
function extractCommitDateTime(commitInfo: string): { date: string; time: string; commitHash: string } | null {
  try {
    // 提取commit日期时间 - 匹配Date: YYYY-MM-DD HH:MM:SS格式
    const dateTimeMatch = commitInfo.match(/Date:\s+(.+?)(\s+[-+]\d{4})?$/m);
    // 提取commit hash
    const commitHashMatch = commitInfo.match(/^commit\s+([0-9a-f]{40})/m);
    
    if (dateTimeMatch && dateTimeMatch[1]) {
      const dateTimeStr = dateTimeMatch[1].trim();
      const dateObj = new Date(dateTimeStr);
      
      // 格式化为需要的格式
      const date = dateObj.toISOString().split('T')[0];
      const time = dateObj.toISOString().split('T')[1].replace(/\..+/, '');
      const commitHash = commitHashMatch ? commitHashMatch[1] : '';
      
      return { date, time, commitHash };
    }
  } catch (error) {
    console.error("提取Git提交日期时间失败:", error);
  }
  
  return null;
}

/**
 * 分析Git差异并确定完成了什么任务
 * 通过git diff输出分析代码更改，识别与任务相关的修改
 */
export async function analyzeGitDiff({
  commitRange = "HEAD~1..HEAD",
  taskId,
}: z.infer<typeof analyzeGitDiffSchema>) {
  try {
    // 记录传入的原始参数
    console.error(`传入的参数 - commitRange: ${commitRange}`);
    console.error(`传入的参数 - taskId: ${taskId || "未提供"}`);
    
    // 记录环境变量和当前工作目录
    console.error(`环境变量 - PROJECT_DIR: ${process.env.PROJECT_DIR || "未设置"}`);
    console.error(`当前工作目录: ${process.cwd()}`);
    
    // 按优先级获取项目目录：环境变量 > 默认当前目录
    const effectiveProjectDir = process.env.PROJECT_DIR || process.cwd();
    
    // 检查目录是否存在
    if (!fs.existsSync(effectiveProjectDir)) {
      console.error(`错误: 目录不存在 - ${effectiveProjectDir}`);
      return {
        content: [
          {
            type: "text" as const,
            text: `项目目录不存在: ${effectiveProjectDir}。请提供有效的项目路径。`,
          },
        ],
      };
    }
    
    // 检查是否为Git仓库
    const gitDirPath = path.join(effectiveProjectDir, '.git');
    const isGitRepo = fs.existsSync(gitDirPath);
    console.error(`Git仓库检查 - .git目录${isGitRepo ? '存在' : '不存在'}: ${gitDirPath}`);
    
    if (!isGitRepo) {
      console.error(`警告: 提供的目录不是Git仓库 - ${effectiveProjectDir}`);
      return {
        content: [
          {
            type: "text" as const,
            text: `提供的目录 ${effectiveProjectDir} 不是Git仓库（未找到.git目录）。请提供有效的Git仓库路径。`,
          },
        ],
      };
    }
    
    // 记录最终使用的项目目录
    console.error(`最终使用的项目目录: ${effectiveProjectDir}`);
    
    // 使用直接方法执行Git命令
    console.error(`执行Git命令 - 获取差异输出...`);
    
    // 获取git diff输出
    let diffOutput = '';
    try {
      diffOutput = execSync(`git --no-pager show ${commitRange}`, {
        cwd: effectiveProjectDir,
        encoding: 'utf8'
      });
      console.error(`Git diff命令执行成功，输出大小: ${diffOutput.length} 字符`);
    } catch (error) {
      console.error(`Git diff命令执行失败:`, error);
      return {
        content: [
          {
            type: "text" as const,
            text: `执行git diff命令失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }

    // 如果diff输出为空，返回错误信息
    if (!diffOutput.trim()) {
      return {
        content: [
          {
            type: "text" as const,
            text: "未检测到代码更改。请确保指定的提交范围包含有效的更改。",
          },
        ],
      };
    }

    // 获取变更的文件列表
    console.error(`执行Git命令 - 获取变更文件列表...`);
    let filesChanged = '';
    try {
      filesChanged = execSync(`git --no-pager diff --name-only ${commitRange}`, {
        cwd: effectiveProjectDir,
        encoding: 'utf8'
      });
      console.error(`Git diff --name-only命令执行成功，变更文件数量: ${filesChanged.trim().split('\n').length}`);
    } catch (error) {
      console.error(`Git diff --name-only命令执行失败:`, error);
      return {
        content: [
          {
            type: "text" as const,
            text: `执行git diff --name-only命令失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
    
    const changedFiles = filesChanged.trim().split("\n");
    
    // 获取提交信息
    console.error(`执行Git命令 - 获取提交信息...`);
    let commitInfo = '';
    try {
      commitInfo = execSync(`git --no-pager show ${commitRange}`, {
        cwd: effectiveProjectDir,
        encoding: 'utf8'
      });
      console.error(`Git log命令执行成功，输出大小: ${commitInfo.length} 字符`);
    } catch (error) {
      console.error(`Git log命令执行失败:`, error);
      return {
        content: [
          {
            type: "text" as const,
            text: `执行git log命令失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }

    // 提取提交的日期和时间信息
    const commitDateTime = extractCommitDateTime(commitInfo);
    let gitTimeInfo = {};
    if (commitDateTime) {
      gitTimeInfo = {
        commitDate: commitDateTime.date,
        commitTime: commitDateTime.time,
        commitHash: commitDateTime.commitHash
      };
      console.error(`成功提取Git提交时间: ${commitDateTime.date} ${commitDateTime.time}`);
    } else {
      console.error(`无法提取Git提交时间信息`);
    }

    // 获取所有任务（或特定任务）以进行匹配分析
    let tasksToAnalyze: Task[] = [];
    if (taskId) {
      const allTasks = await getAllTasks();
      const targetTask = allTasks.find(task => task.id === taskId);
      if (targetTask) {
        tasksToAnalyze = [targetTask];
      } else {
        return {
          content: [
            {
              type: "text" as const,
              text: `找不到ID为 ${taskId} 的任务。`,
            },
          ],
        };
      }
    } else {
      const allTasks = await getAllTasks();
      // 获取所有非完成状态的任务进行分析
      tasksToAnalyze = allTasks.filter(
        (task) => task.status !== TaskStatus.COMPLETED
      );
    }

    // 准备传递给模板的数据
    const templateData = {
      commitInfo,
      changedFiles: changedFiles.join("\n"),
      diffOutput,
      tasksToAnalyze: tasksToAnalyze.map(task => `- **${task.id}**: ${task.name} (${task.status})`).join('\n'),
      ...gitTimeInfo
    };

    try {
      // 先加载模板
      const templateContent = loadPromptFromTemplate("gitAnalysis/analyzeGitDiff.md");
      // 使用模板引擎处理数据
      const analysisResult = generatePrompt(templateContent, templateData);
      
      console.error(`模板加载和处理成功，生成分析结果`);
      
      return {
        content: [
          {
            type: "text" as const,
            text: analysisResult,
          },
        ],
        metadata: {
          gitTimeInfo
        }
      };
    } catch (error) {
      console.error(`模板处理或渲染失败:`, error);
      return {
        content: [
          {
            type: "text" as const,
            text: `生成分析结果时出错: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }
  } catch (error) {
    console.error(`执行gitAnalyzeTask出错:`, error);
    return {
      content: [
        {
          type: "text" as const,
          text: `分析Git更改时出错: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
} 