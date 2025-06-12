/**
 * 显示路径状态工具
 * 显示当前所有路径配置和状态，用于调试路径管理问题
 */

import { z } from 'zod';
import fs from 'fs/promises';
import { log } from '../../utils/logger.js';
import { getPathSummary, clearPathCache } from '../../utils/pathManager.js';
import { getProjectContext } from '../../utils/projectDetector.js';

/**
 * 显示路径状态的输入schema
 */
export const showPathStatusSchema = z.object({
  refreshCache: z.boolean().optional().default(false).describe('是否刷新路径缓存'),
  checkFileExists: z.boolean().optional().default(true).describe('是否检查文件/目录是否存在'),
  showEnvironmentVars: z.boolean().optional().default(true).describe('是否显示相关环境变量'),
});

export type ShowPathStatusInput = z.infer<typeof showPathStatusSchema>;

/**
 * 检查路径是否存在
 */
async function checkPathExists(path: string): Promise<{ exists: boolean; type?: string; error?: string }> {
  try {
    const stats = await fs.stat(path);
    return {
      exists: true,
      type: stats.isDirectory() ? 'directory' : 'file',
    };
  } catch (error) {
    return {
      exists: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 格式化路径状态
 */
function formatPathStatus(path: string, status: { exists: boolean; type?: string; error?: string }): string {
  if (status.exists) {
    const icon = status.type === 'directory' ? '📁' : '📄';
    return `${icon} \`${path}\` ✅`;
  } else {
    return `❌ \`${path}\` (不存在)`;
  }
}

/**
 * 显示路径状态
 */
export async function showPathStatus(input: ShowPathStatusInput) {
  try {
    const { refreshCache, checkFileExists, showEnvironmentVars } = input;

    log.info('ShowPathStatus', '开始显示路径状态', input);

    // 刷新缓存（如果需要）
    if (refreshCache) {
      clearPathCache();
    }

    // 获取路径摘要
    const pathSummary = await getPathSummary();

    // 获取项目上下文信息
    const projectContext = await getProjectContext();

    const results: string[] = [];

    results.push('# 📁 路径状态报告');
    results.push('');

    // 项目检测信息
    results.push('## 🎯 项目检测状态');
    results.push(`- **工作目录**: \`${projectContext.projectRoot}\``);
    results.push(`- **检测方法**: ${projectContext.metadata.detectionMethod}`);
    results.push(`- **项目ID**: ${projectContext.projectId}`);
    results.push(`- **Git仓库**: ${projectContext.projectType.hasGit ? '✅ 是' : '❌ 否'}`);
    results.push(`- **Package.json**: ${projectContext.projectType.hasPackageJson ? '✅ 是' : '❌ 否'}`);

    if (projectContext.packageInfo?.name) {
      results.push(`- **包名**: ${projectContext.packageInfo.name}`);
    }

    results.push('');

    // 路径配置
    results.push('## 📋 路径配置');
    results.push(`- **基础数据目录**: \`${pathSummary.baseDataDir}\``);
    results.push(`- **项目数据目录**: \`${pathSummary.projectDataDir}\``);
    results.push(`- **日志目录**: \`${pathSummary.logDir}\``);
    results.push(`- **任务文件**: \`${pathSummary.tasksFile}\``);
    results.push(`- **配置目录**: \`${pathSummary.configDir}\``);
    results.push(`- **临时目录**: \`${pathSummary.tempDir}\``);

    results.push('');

    // 检查文件存在性（如果需要）
    if (checkFileExists) {
      results.push('## 🔍 路径存在性检查');

      const pathsToCheck = [
        { name: '基础数据目录', path: pathSummary.baseDataDir },
        { name: '项目数据目录', path: pathSummary.projectDataDir },
        { name: '日志目录', path: pathSummary.logDir },
        { name: '任务文件', path: pathSummary.tasksFile },
        { name: '配置目录', path: pathSummary.configDir },
        { name: '临时目录', path: pathSummary.tempDir },
      ];

      for (const { name, path } of pathsToCheck) {
        const status = await checkPathExists(path);
        results.push(`- **${name}**: ${formatPathStatus(path, status)}`);
      }

      results.push('');
    }

    // 项目信息
    if (pathSummary.projectInfo) {
      results.push('## 📊 项目信息');
      results.push(`- **项目ID**: ${pathSummary.projectInfo.id}`);
      results.push(`- **项目名称**: ${pathSummary.projectInfo.rawName}`);
      results.push(`- **检测来源**: ${pathSummary.projectInfo.source}`);
      results.push(`- **项目路径**: \`${pathSummary.projectInfo.path}\``);
      results.push('');
    }

    // 环境变量（如果需要）
    if (showEnvironmentVars) {
      results.push('## ⚙️ 相关环境变量');

      const envVars = [
        'DATA_DIR',
        'SHRIMP_PROJECT_PATH',
        'PROJECT_AUTO_DETECT',
        'PWD',
        'INIT_CWD',
        'HOME',
        'USERPROFILE',
      ];

      for (const envVar of envVars) {
        const value = process.env[envVar];
        if (value) {
          results.push(`- **${envVar}**: \`${value}\``);
        } else {
          results.push(`- **${envVar}**: ❌ 未设置`);
        }
      }

      results.push('');
    }

    // 路径管理建议
    results.push('## 💡 路径管理建议');

    if (projectContext.metadata.detectionMethod === 'fallback') {
      results.push('⚠️ 当前使用回退检测方法，可能不是最佳的项目目录');
      results.push('建议: 使用 `set_project_working_directory` 工具手动设置正确的项目目录');
    }

    if (!projectContext.projectType.hasGit && !projectContext.projectType.hasPackageJson) {
      results.push('⚠️ 当前目录缺少项目指标文件');
      results.push('建议: 确认是否在正确的项目目录中，或初始化Git仓库/创建package.json');
    }

    if (pathSummary.baseDataDir === pathSummary.projectDataDir) {
      results.push('ℹ️ 当前使用基础数据目录，未启用项目隔离');
      results.push('建议: 检查PROJECT_AUTO_DETECT环境变量是否正确设置');
    }

    results.push('');
    results.push('## 🛠️ 可用工具');
    results.push('- `set_project_working_directory` - 手动设置项目目录');
    results.push('- `reset_project_detection` - 重置项目检测');
    results.push('- `diagnose_mcp_environment` - 诊断MCP环境');
    results.push('- `get_project_context` - 获取项目上下文');

    const message = results.join('\n');

    log.info('ShowPathStatus', '路径状态显示完成', {
      refreshCache,
      checkFileExists,
      showEnvironmentVars,
      pathSummary,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: message,
        },
      ],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error('ShowPathStatus', '显示路径状态失败', error as Error, { input });

    return {
      content: [
        {
          type: 'text' as const,
          text: `❌ 显示路径状态失败: ${errorMsg}`,
        },
      ],
    };
  }
}
