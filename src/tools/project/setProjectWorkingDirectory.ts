/**
 * 设置项目工作目录工具
 * 用于手动指定正确的项目工作目录，解决MCP环境下的路径检测问题
 */

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { log } from '../../utils/logger.js';
import { updateProjectPath, getPathSummary } from '../../utils/pathManager.js';

/**
 * 设置项目工作目录的输入schema
 */
export const setProjectWorkingDirectorySchema = z.object({
  projectPath: z.string().describe('项目目录的绝对路径'),
  persistent: z.boolean().optional().default(false).describe('是否持久化保存此设置'),
  validateProject: z.boolean().optional().default(true).describe('是否验证目录包含项目文件'),
});

export type SetProjectWorkingDirectoryInput = z.infer<typeof setProjectWorkingDirectorySchema>;

/**
 * 验证目录是否为有效的项目目录
 */
async function validateProjectDirectory(dirPath: string): Promise<boolean> {
  const projectIndicators = [
    'package.json',
    '.git',
    'pyproject.toml',
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'build.gradle',
    'composer.json',
    'Gemfile',
    'requirements.txt',
    'tsconfig.json',
    'src',
    'lib',
    'app',
  ];

  let foundIndicators = 0;

  for (const indicator of projectIndicators) {
    try {
      const indicatorPath = path.join(dirPath, indicator);
      await fs.access(indicatorPath);
      foundIndicators++;

      // 如果找到关键项目文件，直接认为是有效项目
      if (['package.json', '.git', 'pyproject.toml', 'Cargo.toml', 'go.mod'].includes(indicator)) {
        return true;
      }
    } catch {
      // 文件不存在，继续检查其他指标
    }
  }

  // 如果找到2个或以上指标，认为是项目目录
  return foundIndicators >= 2;
}

/**
 * 保存项目配置到配置文件
 */
async function saveProjectConfig(projectPath: string): Promise<void> {
  const configPath = path.join(projectPath, '.shrimp-config.json');
  const config = {
    projectPath: projectPath,
    lastUpdated: new Date().toISOString(),
    autoDetected: false,
    manuallySet: true,
  };

  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    log.info('ProjectConfig', '项目配置已保存', { configPath, projectPath });
  } catch (error) {
    log.warn('ProjectConfig', '保存项目配置失败', { error, configPath });
  }
}

/**
 * 更新全局项目上下文
 */
async function updateGlobalProjectContext(projectPath: string): Promise<void> {
  // 使用统一的路径管理器更新项目路径
  await updateProjectPath(projectPath);

  log.info('ProjectContext', '全局项目上下文已更新', { projectPath });
}

/**
 * 设置项目工作目录
 */
export async function setProjectWorkingDirectory(input: SetProjectWorkingDirectoryInput) {
  try {
    const { projectPath, persistent, validateProject } = input;

    log.info('SetProjectWorkingDirectory', '开始设置项目工作目录', {
      projectPath,
      persistent,
      validateProject,
    });

    // 验证路径是绝对路径
    if (!path.isAbsolute(projectPath)) {
      throw new Error(`项目路径必须是绝对路径，当前路径: ${projectPath}`);
    }

    // 验证目录存在
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        throw new Error(`指定路径不是目录: ${projectPath}`);
      }
    } catch (error) {
      throw new Error(`无法访问目录 ${projectPath}: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 可选：验证是否为有效项目目录
    if (validateProject) {
      const isValidProject = await validateProjectDirectory(projectPath);
      if (!isValidProject) {
        log.warn('SetProjectWorkingDirectory', '目录可能不是有效的项目目录', { projectPath });
        // 不抛出错误，只是警告
      }
    }

    // 更新全局项目上下文
    await updateGlobalProjectContext(projectPath);

    // 可选：持久化保存
    if (persistent) {
      await saveProjectConfig(projectPath);
    }

    // 获取更新后的路径摘要
    const pathSummary = await getPathSummary();

    const message = `✅ 项目工作目录已设置为: ${projectPath}${persistent ? ' (已持久化保存)' : ''}

📁 路径配置摘要:
- 项目目录: ${projectPath}
- 数据目录: ${pathSummary.projectDataDir}
- 日志目录: ${pathSummary.logDir}
- 任务文件: ${pathSummary.tasksFile}
- 配置目录: ${pathSummary.configDir}

🔄 所有相关模块的路径已自动更新`;

    log.info('SetProjectWorkingDirectory', '项目工作目录设置成功', {
      projectPath,
      persistent,
      validateProject,
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
    log.error('SetProjectWorkingDirectory', '设置项目工作目录失败', error as Error, {
      input,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: `❌ 设置项目工作目录失败: ${errorMsg}`,
        },
      ],
    };
  }
}
