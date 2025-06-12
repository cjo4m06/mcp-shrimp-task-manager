/**
 * 获取文档路径管理工具
 * 用于获取和管理AI生成文档的存储路径
 */

import { z } from 'zod';
import path from 'path';
import { getDocumentationDir } from '../../utils/pathManager.js';
import { log } from '../../utils/logger.js';

/**
 * 获取文档路径的输入schema
 */
export const getDocumentationPathSchema = z.object({
  filename: z.string().optional().describe('文档文件名（可选），如果提供则返回完整文件路径'),
  subDir: z.string().optional().describe('子目录名（可选），用于组织不同类型的文档'),
  createDir: z.boolean().optional().default(true).describe('是否自动创建目录结构'),
});

export type GetDocumentationPathInput = z.infer<typeof getDocumentationPathSchema>;

/**
 * 验证文件名是否安全
 */
function validateFilename(filename: string): { valid: boolean; error?: string } {
  // 检查文件名是否包含非法字符
  const invalidChars = /[<>:"|?*\x00-\x1f]/;
  if (invalidChars.test(filename)) {
    return { valid: false, error: '文件名包含非法字符' };
  }

  // 检查是否为保留名称（Windows）
  const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
  if (reservedNames.test(filename)) {
    return { valid: false, error: '文件名为系统保留名称' };
  }

  // 检查文件名长度
  if (filename.length > 255) {
    return { valid: false, error: '文件名过长' };
  }

  return { valid: true };
}

/**
 * 验证子目录名是否安全
 */
function validateSubDir(subDir: string): { valid: boolean; error?: string } {
  // 检查是否包含路径遍历字符
  if (subDir.includes('..')) {
    return { valid: false, error: '子目录名不能包含路径遍历字符' };
  }

  // 检查是否包含绝对路径标识符
  if (subDir.startsWith('/') || subDir.startsWith('\\') || /^[A-Za-z]:/.test(subDir)) {
    return { valid: false, error: '子目录名不能是绝对路径' };
  }

  // 分割路径并验证每个部分
  const parts = subDir.split(/[/\\]/);
  for (const part of parts) {
    if (part === '' || part === '.') {
      continue; // 允许空部分和当前目录引用
    }

    const partValidation = validateFilename(part);
    if (!partValidation.valid) {
      return { valid: false, error: `子目录部分 "${part}" 无效: ${partValidation.error}` };
    }
  }

  return { valid: true };
}

/**
 * 获取文档路径
 * @param input 输入参数
 * @returns 文档路径信息
 */
export async function getDocumentationPath(input: GetDocumentationPathInput) {
  try {
    log.info('GetDocumentationPath', '开始获取文档路径', input);

    // 获取基础文档目录
    const baseDocDir = await getDocumentationDir();

    let targetDir = baseDocDir;
    let fullPath = baseDocDir;

    // 处理子目录
    if (input.subDir) {
      const subDirValidation = validateSubDir(input.subDir);
      if (!subDirValidation.valid) {
        throw new Error(`子目录名无效: ${subDirValidation.error}`);
      }
      targetDir = path.join(baseDocDir, input.subDir);
    }

    // 处理文件名
    if (input.filename) {
      const filenameValidation = validateFilename(input.filename);
      if (!filenameValidation.valid) {
        throw new Error(`文件名无效: ${filenameValidation.error}`);
      }
      fullPath = path.join(targetDir, input.filename);
    } else {
      fullPath = targetDir;
    }

    // 构建响应信息
    const result = {
      success: true,
      paths: {
        baseDocumentationDir: baseDocDir,
        targetDir: targetDir,
        fullPath: fullPath,
        relativePath: input.subDir
          ? input.filename
            ? path.join(input.subDir, input.filename)
            : input.subDir
          : input.filename
            ? input.filename
            : '',
      },
      info: {
        isFile: !!input.filename,
        isDirectory: !input.filename,
        hasSubDir: !!input.subDir,
        autoCreateEnabled: input.createDir ?? true,
      },
    };

    log.info('GetDocumentationPath', '文档路径获取成功', result);

    return {
      content: [
        {
          type: 'text' as const,
          text: `# 📁 文档路径信息

## 🎯 路径详情

- **基础文档目录**: \`${result.paths.baseDocumentationDir}\`
- **目标目录**: \`${result.paths.targetDir}\`
- **完整路径**: \`${result.paths.fullPath}\`
${result.paths.relativePath ? `- **相对路径**: \`${result.paths.relativePath}\`` : ''}

## 📋 路径信息

- **类型**: ${result.info.isFile ? '📄 文件路径' : '📁 目录路径'}
${result.info.hasSubDir ? `- **子目录**: \`${input.subDir}\`` : ''}
- **自动创建**: ${result.info.autoCreateEnabled ? '✅ 启用' : '❌ 禁用'}

## 💡 使用说明

${
  result.info.isFile
    ? `此路径指向文件 \`${input.filename}\`，可以直接用于文档创建操作。`
    : `此路径指向目录，可以用于存储多个文档文件。`
}

${
  result.info.autoCreateEnabled
    ? '目录结构已自动创建，可以直接使用此路径进行文档操作。'
    : '⚠️ 自动创建已禁用，请确保目录存在后再使用。'
}

## 🔧 技术信息

\`\`\`json
${JSON.stringify(result, null, 2)}
\`\`\``,
        },
      ],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error('GetDocumentationPath', '获取文档路径失败', error as Error, { input });

    return {
      content: [
        {
          type: 'text' as const,
          text: `❌ 获取文档路径失败: ${errorMsg}

## 🔍 调试信息

- **输入参数**: ${JSON.stringify(input, null, 2)}
- **错误详情**: ${errorMsg}

## 💡 建议

1. 检查文件名是否包含非法字符
2. 确保子目录名不包含路径遍历字符
3. 验证项目上下文是否正确设置

请修正输入参数后重试。`,
        },
      ],
    };
  }
}
