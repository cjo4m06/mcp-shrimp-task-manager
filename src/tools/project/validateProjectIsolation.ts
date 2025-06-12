/**
 * 验证项目隔离功能
 * 检查项目是否正确隔离，任务是否存储在正确的位置
 */

import { z } from 'zod';
import { getProjectContext } from '../../utils/projectDetector.js';
import { getPathSummary } from '../../utils/pathManager.js';
import path from 'path';
import fs from 'fs/promises';

export const validateProjectIsolationSchema = z.object({
  includeRecommendations: z.boolean().optional().default(true),
  checkTaskFiles: z.boolean().optional().default(true),
});

export type ValidateProjectIsolationInput = z.infer<typeof validateProjectIsolationSchema>;

/**
 * 验证项目隔离功能
 */
export async function validateProjectIsolation(input: ValidateProjectIsolationInput): Promise<{
  content: Array<{
    type: 'text';
    text: string;
  }>;
}> {
  try {
    // 使用 schema 解析以应用默认值
    const parsed = validateProjectIsolationSchema.parse(input);
    const { includeRecommendations, checkTaskFiles } = parsed;

    // 获取项目上下文和路径信息
    const projectContext = await getProjectContext();
    const pathSummary = await getPathSummary();

    // 检查项目隔离状态
    const autoDetectEnabled = process.env.PROJECT_AUTO_DETECT === 'true';
    const expectedProjectDir = path.join(pathSummary.baseDataDir, 'projects', projectContext.projectId);
    const isIsolated = pathSummary.projectDataDir === expectedProjectDir;

    // 检查任务文件
    let taskFileStatus = '未检查';
    let taskFileExists = false;
    let taskCount = 0;

    if (checkTaskFiles) {
      try {
        await fs.access(pathSummary.tasksFile);
        taskFileExists = true;
        const taskData = await fs.readFile(pathSummary.tasksFile, 'utf-8');
        const tasks = JSON.parse(taskData).tasks || [];
        taskCount = tasks.length;
        taskFileStatus = `存在 (${taskCount} 个任务)`;
      } catch {
        taskFileStatus = '不存在';
      }
    }

    // 生成报告
    const report = generateIsolationReport({
      projectContext,
      pathSummary,
      autoDetectEnabled,
      isIsolated,
      taskFileStatus,
      taskFileExists,
      taskCount,
      includeRecommendations,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: report,
        },
      ],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text' as const,
          text: `❌ 验证项目隔离功能失败: ${errorMsg}`,
        },
      ],
    };
  }
}

/**
 * 生成隔离验证报告
 */
function generateIsolationReport(params: {
  projectContext: any;
  pathSummary: any;
  autoDetectEnabled: boolean;
  isIsolated: boolean;
  taskFileStatus: string;
  taskFileExists: boolean;
  taskCount: number;
  includeRecommendations: boolean;
}): string {
  const {
    projectContext,
    pathSummary,
    autoDetectEnabled,
    isIsolated,
    taskFileStatus,
    taskFileExists,
    taskCount,
    includeRecommendations,
  } = params;

  const lines: string[] = [];

  lines.push('# 🔍 项目隔离验证报告');
  lines.push('');

  // 基本信息
  lines.push('## 📊 当前状态');
  lines.push('');
  lines.push(`**当前项目**: ${projectContext.projectName}`);
  lines.push(`**项目ID**: \`${projectContext.projectId}\``);
  lines.push(`**项目路径**: \`${projectContext.projectRoot}\``);
  lines.push(`**检测方法**: ${projectContext.metadata.detectionMethod}`);
  lines.push('');

  // 隔离状态
  lines.push('## 🛡️ 隔离状态');
  lines.push('');
  lines.push(`**自动检测**: ${autoDetectEnabled ? '✅ 启用' : '❌ 禁用'}`);
  lines.push(`**项目隔离**: ${isIsolated ? '✅ 启用' : '❌ 禁用'}`);
  lines.push('');

  // 路径信息
  lines.push('## 📁 存储路径');
  lines.push('');
  lines.push(`**基础数据目录**: \`${pathSummary.baseDataDir}\``);
  lines.push(`**项目数据目录**: \`${pathSummary.projectDataDir}\``);
  lines.push(`**任务文件**: \`${pathSummary.tasksFile}\``);
  lines.push(`**任务文件状态**: ${taskFileStatus}`);
  lines.push('');

  // 问题诊断
  lines.push('## 🩺 问题诊断');
  lines.push('');

  if (!autoDetectEnabled) {
    lines.push("🔴 **自动检测禁用**: PROJECT_AUTO_DETECT 环境变量未设置为 'true'");
  }

  if (!isIsolated) {
    lines.push('🔴 **项目隔离失败**: 任务存储在共享目录而非项目特定目录');
  }

  if (autoDetectEnabled && isIsolated) {
    lines.push('✅ **无明显问题**: 项目隔离功能正常工作');
  }

  lines.push('');

  // 建议
  if (includeRecommendations) {
    lines.push('## 💡 建议');
    lines.push('');

    if (!autoDetectEnabled) {
      lines.push('### 启用自动检测');
      lines.push('```bash');
      lines.push('export PROJECT_AUTO_DETECT=true');
      lines.push('```');
      lines.push('');
    }

    if (!isIsolated) {
      lines.push('### 修复项目隔离');
      lines.push('1. 确保 PROJECT_AUTO_DETECT=true');
      lines.push('2. 重启 MCP 服务器');
      lines.push('3. 使用 `reset_project_detection` 工具清除缓存');
      lines.push('');
    }

    lines.push('### 验证隔离效果');
    lines.push('1. 在不同项目中创建任务');
    lines.push('2. 检查任务是否存储在不同的目录中');
    lines.push('3. 确认任务不会跨项目显示');
    lines.push('');
  }

  // 技术详情
  lines.push('## 🔧 技术详情');
  lines.push('');
  lines.push('```json');
  lines.push(
    JSON.stringify(
      {
        environment: {
          PROJECT_AUTO_DETECT: process.env.PROJECT_AUTO_DETECT,
          DATA_DIR: process.env.DATA_DIR,
          SHRIMP_PROJECT_PATH: process.env.SHRIMP_PROJECT_PATH,
        },
        paths: {
          baseDataDir: pathSummary.baseDataDir,
          projectDataDir: pathSummary.projectDataDir,
          tasksFile: pathSummary.tasksFile,
        },
        project: {
          id: projectContext.projectId,
          name: projectContext.projectName,
          root: projectContext.projectRoot,
          detectionMethod: projectContext.metadata.detectionMethod,
        },
        isolation: {
          enabled: isIsolated,
          autoDetect: autoDetectEnabled,
        },
      },
      null,
      2
    )
  );
  lines.push('```');

  return lines.join('\n');
}
