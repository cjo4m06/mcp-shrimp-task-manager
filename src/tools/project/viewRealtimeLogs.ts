/**
 * 实时日志查看工具
 * 用于查看最新的日志内容，支持实时刷新和过滤
 */

import { z } from 'zod';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { log } from '../../utils/logger.js';
import { getLogDir } from '../../utils/pathManager.js';

/**
 * 实时日志查看的输入schema
 */
export const viewRealtimeLogsSchema = z.object({
  lines: z.number().optional().default(50).describe('显示最后N行日志'),
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'ALL']).optional().default('ALL').describe('过滤日志级别'),
  category: z.string().optional().describe('过滤特定类别的日志'),
  follow: z.boolean().optional().default(false).describe('是否持续监控（类似tail -f）'),
  forceFlush: z.boolean().optional().default(true).describe('是否强制刷新日志缓冲区'),
});

export type ViewRealtimeLogsInput = z.infer<typeof viewRealtimeLogsSchema>;

/**
 * 获取日志文件路径
 */
async function getLogFilePath(): Promise<string> {
  const logsDir = await getLogDir();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return path.join(logsDir, `app-${today}.log`);
}

/**
 * 过滤日志行
 */
function filterLogLines(lines: string[], level: string, category?: string): string[] {
  return lines.filter((line) => {
    // 级别过滤
    if (level !== 'ALL') {
      if (!line.includes(`[${level}]`)) {
        return false;
      }
    }

    // 类别过滤
    if (category) {
      if (!line.includes(`[${category}]`)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * 格式化日志显示
 */
function formatLogDisplay(lines: string[], totalLines: number, filtered: boolean): string {
  const header = `📋 实时日志查看 (显示最后 ${lines.length} 行${filtered ? '，已过滤' : ''})`;
  const separator = '='.repeat(80);

  if (lines.length === 0) {
    return `${header}\n${separator}\n\n🔍 没有找到匹配的日志记录\n\n${separator}`;
  }

  const logContent = lines.join('');
  const footer = `${separator}\n📊 总计: ${totalLines} 行日志，显示: ${lines.length} 行\n⏰ 查看时间: ${new Date().toLocaleString()}`;

  return `${header}\n${separator}\n\n${logContent}\n${footer}`;
}

/**
 * 获取文件统计信息
 */
async function getLogFileStats(logFile: string): Promise<{ exists: boolean; size: number; mtime: Date | null }> {
  try {
    const stats = await fs.stat(logFile);
    return {
      exists: true,
      size: stats.size,
      mtime: stats.mtime,
    };
  } catch {
    return {
      exists: false,
      size: 0,
      mtime: null,
    };
  }
}

/**
 * 实时日志查看
 */
export async function viewRealtimeLogs(input: ViewRealtimeLogsInput) {
  try {
    const { lines: maxLines, level, category, follow, forceFlush } = input;

    log.info('ViewRealtimeLogs', '开始查看实时日志', {
      maxLines,
      level,
      category,
      follow,
      forceFlush,
    });

    // 强制刷新日志缓冲区
    if (forceFlush) {
      const { logger } = await import('../../utils/logger.js');
      logger.flush();

      // 等待一小段时间确保写入完成
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const logFile = await getLogFilePath();
    const fileStats = await getLogFileStats(logFile);

    if (!fileStats.exists) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `📋 实时日志查看\n${'='.repeat(80)}\n\n❌ 日志文件不存在: ${logFile}\n\n💡 提示: 可能还没有生成日志，或者DATA_DIR配置不正确\n\n${'='.repeat(80)}`,
          },
        ],
      };
    }

    // 读取日志文件
    let logContent: string;
    try {
      logContent = await fs.readFile(logFile, 'utf-8');
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ 读取日志文件失败: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
      };
    }

    // 分割成行
    const allLines = logContent.split('\n').filter((line) => line.trim() !== '');

    // 获取最后N行
    const recentLines = allLines.slice(-maxLines);

    // 过滤日志
    const filteredLines = filterLogLines(recentLines, level, category);

    // 格式化显示
    const isFiltered = level !== 'ALL' || category !== undefined;
    const displayText = formatLogDisplay(filteredLines, allLines.length, isFiltered);

    // 添加文件信息
    const fileInfo = `\n📁 日志文件: ${logFile}\n📊 文件大小: ${(fileStats.size / 1024).toFixed(2)} KB\n⏰ 最后修改: ${fileStats.mtime?.toLocaleString() || 'Unknown'}`;

    // 如果是follow模式，添加提示
    const followInfo = follow ? '\n\n🔄 持续监控模式已启用（注意：此工具调用只显示当前状态）' : '';

    log.info('ViewRealtimeLogs', '日志查看完成', {
      totalLines: allLines.length,
      displayedLines: filteredLines.length,
      fileSize: fileStats.size,
      isFiltered,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: displayText + fileInfo + followInfo,
        },
      ],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error('ViewRealtimeLogs', '查看实时日志失败', error as Error, { input });

    return {
      content: [
        {
          type: 'text' as const,
          text: `❌ 查看实时日志失败: ${errorMsg}`,
        },
      ],
    };
  }
}

/**
 * 监控日志变化（辅助函数，用于未来扩展）
 */
export async function watchLogFile(callback: (newLines: string[]) => void): Promise<() => void> {
  const logFile = await getLogFilePath();
  let lastSize = 0;

  try {
    const stats = await fs.stat(logFile);
    lastSize = stats.size;
  } catch {
    // 文件不存在，从0开始
  }

  const watcher = fsSync.watchFile(logFile, { interval: 1000 }, async (curr, prev) => {
    if (curr.size > lastSize) {
      try {
        // 读取新增内容
        const fd = await fs.open(logFile, 'r');
        const buffer = Buffer.alloc(curr.size - lastSize);
        await fd.read(buffer, 0, buffer.length, lastSize);
        await fd.close();

        const newContent = buffer.toString('utf-8');
        const newLines = newContent.split('\n').filter((line) => line.trim() !== '');

        if (newLines.length > 0) {
          callback(newLines);
        }

        lastSize = curr.size;
      } catch (error) {
        console.error('监控日志文件失败:', error);
      }
    }
  });

  // 返回清理函数
  return () => {
    fsSync.unwatchFile(logFile);
  };
}
