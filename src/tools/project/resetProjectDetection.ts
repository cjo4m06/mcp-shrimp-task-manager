/**
 * 重置项目检测工具
 * 清除所有缓存的项目信息，强制重新检测项目
 */

import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import { log } from '../../utils/logger.js';

/**
 * 重置项目检测的输入schema
 */
export const resetProjectDetectionSchema = z.object({
  clearManualSettings: z.boolean().optional().default(true).describe('是否清除手动设置的项目路径'),
  forceRedetection: z.boolean().optional().default(true).describe('是否强制重新检测项目'),
  showDetectionProcess: z.boolean().optional().default(true).describe('是否显示检测过程'),
});

export type ResetProjectDetectionInput = z.infer<typeof resetProjectDetectionSchema>;

/**
 * 清除手动设置的项目路径
 */
function clearManualProjectPath(): void {
  if (process.env.SHRIMP_PROJECT_PATH) {
    delete process.env.SHRIMP_PROJECT_PATH;
    log.info('ResetProjectDetection', '已清除手动设置的项目路径');
  }
}

/**
 * 清除项目配置文件
 */
async function clearProjectConfigFiles(): Promise<string[]> {
  const clearedFiles: string[] = [];
  const currentDir = process.cwd();

  // 查找并删除.shrimp-config.json文件
  let searchDir = currentDir;
  const maxLevels = 5; // 最多向上查找5级目录

  for (let level = 0; level < maxLevels; level++) {
    const configPath = path.join(searchDir, '.shrimp-config.json');

    try {
      await fs.access(configPath);
      await fs.unlink(configPath);
      clearedFiles.push(configPath);
      log.info('ResetProjectDetection', '删除项目配置文件', { configPath });
    } catch {
      // 文件不存在，继续查找
    }

    const parentDir = path.dirname(searchDir);
    if (parentDir === searchDir) {
      break; // 已到达根目录
    }
    searchDir = parentDir;
  }

  return clearedFiles;
}

/**
 * 执行项目重新检测
 */
async function performProjectRedetection(): Promise<any> {
  try {
    // 动态导入项目检测模块
    const { getProjectContext } = await import('../../utils/projectDetector.js');
    const { clearPathCache } = await import('../../utils/pathManager.js');

    log.info('ResetProjectDetection', '开始重新检测项目');

    // 清除路径缓存
    clearPathCache();

    // 获取项目上下文信息
    const projectContext = await getProjectContext();

    log.info('ResetProjectDetection', '项目重新检测完成', {
      workingDirectory: projectContext.projectRoot,
      projectId: projectContext.projectId,
      detectionMethod: projectContext.metadata.detectionMethod,
    });

    return {
      projectContext,
    };
  } catch (error) {
    log.error('ResetProjectDetection', '项目重新检测失败', error as Error);
    throw error;
  }
}

/**
 * 重置项目检测
 */
export async function resetProjectDetection(input: ResetProjectDetectionInput) {
  try {
    const { clearManualSettings, forceRedetection, showDetectionProcess } = input;

    log.info('ResetProjectDetection', '开始重置项目检测', input);

    const results: string[] = [];
    const clearedFiles: string[] = [];

    // 1. 清除手动设置
    if (clearManualSettings) {
      results.push('🔄 清除手动设置...');
      clearManualProjectPath();

      // 清除配置文件
      const configFiles = await clearProjectConfigFiles();
      clearedFiles.push(...configFiles);

      if (configFiles.length > 0) {
        results.push(`✅ 删除了 ${configFiles.length} 个配置文件`);
        configFiles.forEach((file) => {
          results.push(`   - ${file}`);
        });
      } else {
        results.push('ℹ️ 未找到需要清除的配置文件');
      }
    }

    // 2. 强制重新检测
    if (forceRedetection) {
      results.push('');
      results.push('🔍 开始重新检测项目...');

      try {
        const detectionResult = await performProjectRedetection();

        results.push('✅ 项目重新检测成功');
        results.push('');
        results.push('📋 检测结果:');
        results.push(`   - 工作目录: ${detectionResult.projectContext.projectRoot}`);
        results.push(`   - 项目ID: ${detectionResult.projectContext.projectId}`);
        results.push(`   - 检测方法: ${detectionResult.projectContext.metadata.detectionMethod}`);
        results.push(`   - Git仓库: ${detectionResult.projectContext.projectType.hasGit ? '是' : '否'}`);
        results.push(`   - Package.json: ${detectionResult.projectContext.projectType.hasPackageJson ? '是' : '否'}`);

        if (detectionResult.projectContext.packageInfo?.name) {
          results.push(`   - 包名: ${detectionResult.projectContext.packageInfo.name}`);
        }

        // 显示检测过程（如果需要）
        if (showDetectionProcess) {
          results.push('');
          results.push('🔧 检测过程详情:');
          results.push(`   - 检测时间: ${detectionResult.projectContext.metadata.timestamp.toLocaleString()}`);
          results.push(
            `   - 配置路径: ${detectionResult.projectContext.metadata.configuredPaths.length > 0 ? detectionResult.projectContext.metadata.configuredPaths.join(', ') : '无'}`
          );

          if (detectionResult.projectContext.projectType.hasNodeModules) {
            results.push(`   - Node模块: 是`);
          }
          if (detectionResult.projectContext.projectType.hasPyprojectToml) {
            results.push(`   - Python项目: 是`);
          }
          if (detectionResult.projectContext.projectType.hasCargoToml) {
            results.push(`   - Rust项目: 是`);
          }
          if (detectionResult.projectContext.projectType.hasGoMod) {
            results.push(`   - Go项目: 是`);
          }
        }
      } catch (error) {
        results.push('❌ 项目重新检测失败');
        results.push(`   错误: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // 3. 生成总结
    results.push('');
    results.push('📊 重置总结:');
    results.push(`   - 清除手动设置: ${clearManualSettings ? '是' : '否'}`);
    results.push(`   - 清除配置文件: ${clearedFiles.length} 个`);
    results.push(`   - 重新检测项目: ${forceRedetection ? '是' : '否'}`);

    // 4. 使用建议
    results.push('');
    results.push('💡 使用建议:');
    results.push('   - 如果检测结果仍不正确，请使用 set_project_working_directory 工具手动设置');
    results.push('   - 使用 diagnose_mcp_environment 工具获取详细的环境诊断');
    results.push('   - 使用 get_project_context 工具查看当前项目上下文');

    const message = results.join('\n');

    log.info('ResetProjectDetection', '项目检测重置完成', {
      clearManualSettings,
      forceRedetection,
      clearedFilesCount: clearedFiles.length,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: `# 🔄 项目检测重置完成\n\n${message}`,
        },
      ],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error('ResetProjectDetection', '重置项目检测失败', error as Error, { input });

    return {
      content: [
        {
          type: 'text' as const,
          text: `❌ 重置项目检测失败: ${errorMsg}`,
        },
      ],
    };
  }
}
