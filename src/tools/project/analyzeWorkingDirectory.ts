/**
 * 工作目录分析工具
 * 专门用于分析和解决MCP环境下的工作目录检测问题
 */

import { z } from "zod";
import { getProjectContext } from "../../utils/projectDetector.js";
import path from "path";
import fs from "fs/promises";

/**
 * 分析工作目录的输入schema
 */
export const AnalyzeWorkingDirectoryInputSchema = z.object({
  /** 用户提供的可能工作目录 */
  suggestedDir: z.string().optional(),
  /** 是否包含详细的文件系统分析 */
  includeFileAnalysis: z.boolean().default(false),
});

export type AnalyzeWorkingDirectoryInput = z.infer<typeof AnalyzeWorkingDirectoryInputSchema>;

// 为了保持一致性，导出一个别名
export const analyzeWorkingDirectorySchema = AnalyzeWorkingDirectoryInputSchema;

/**
 * 分析工作目录问题
 * @param input 输入参数
 * @returns 工作目录分析结果
 */
export async function analyzeWorkingDirectory(input: AnalyzeWorkingDirectoryInput) {
  try {
    // 获取项目上下文信息
    const projectContext = await getProjectContext({
      fallbackDir: input.suggestedDir || process.cwd()
    });
    
    // 分析不同的目录路径
    const analysis = {
      processCwd: process.cwd(),
      detectedWorkingDir: projectContext.projectRoot,
      environmentVars: {
        PWD: process.env.PWD,
        INIT_CWD: process.env.INIT_CWD,
        HOME: process.env.HOME,
        USERPROFILE: process.env.USERPROFILE,
      },
      pathAnalysis: {
        isSameAsProcessCwd: projectContext.projectRoot === process.cwd(),
        isAbsolute: path.isAbsolute(projectContext.projectRoot),
        basename: path.basename(projectContext.projectRoot),
        dirname: path.dirname(projectContext.projectRoot),
      },
      projectIndicators: {
        hasGitRepo: projectContext.projectType.hasGit,
        hasPackageJson: projectContext.projectType.hasPackageJson,
        packageName: projectContext.packageInfo?.name,
      },
      detectionMethod: projectContext.metadata.detectionMethod,
      projectId: projectContext.projectId,
    };

    // 如果需要文件系统分析
    let fileAnalysis = null;
    if (input.includeFileAnalysis) {
      fileAnalysis = await analyzeFileSystem(projectContext.projectRoot);
    }

    // 生成问题诊断
    const diagnosis = generateDiagnosis(analysis);
    
    // 生成解决建议
    const recommendations = generateRecommendations(analysis);

    return {
      content: [
        {
          type: "text" as const,
          text: `# 🔍 工作目录分析报告

## 📊 检测结果

${generateAnalysisSummary(analysis)}

## 🩺 问题诊断

${diagnosis}

## 💡 解决建议

${recommendations}

## 📋 详细分析数据

\`\`\`json
${JSON.stringify({ analysis, fileAnalysis }, null, 2)}
\`\`\`

## 🎯 AI使用指南

**对于AI助手**：
1. 如果 \`isMcpEnvironment\` 为 true，说明当前在MCP环境下运行
2. 使用 \`detectedWorkingDir\` 而不是 \`process.cwd()\` 作为项目根目录
3. 在调用项目相关函数时，明确传递正确的工作目录参数
4. 如果检测失败，提示用户手动指定项目目录

**推荐的调用方式**：
\`\`\`typescript
// ✅ 正确的方式
const projectContext = await getProjectContext({
  fallbackDir: "${projectContext.projectRoot}"
});

// ❌ 错误的方式（在MCP环境下）
const projectContext = await getProjectContext(); // 可能使用错误的process.cwd()
\`\`\``,
        },
      ],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text" as const,
          text: `❌ 工作目录分析失败: ${errorMsg}`,
        },
      ],
    };
  }
}

/**
 * 分析文件系统结构
 */
async function analyzeFileSystem(dirPath: string) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = entries.filter(e => e.isFile()).map(e => e.name);
    const directories = entries.filter(e => e.isDirectory()).map(e => e.name);
    
    return {
      totalEntries: entries.length,
      files: files.slice(0, 10), // 只显示前10个文件
      directories: directories.slice(0, 10), // 只显示前10个目录
      hasCommonProjectFiles: [
        'package.json',
        '.git',
        'README.md',
        'tsconfig.json',
        'src',
        'node_modules'
      ].filter(name => entries.some(e => e.name === name)),
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * 生成分析摘要
 */
function generateAnalysisSummary(analysis: any): string {
  const lines = [
    `**检测到的工作目录**: \`${analysis.detectedWorkingDir}\``,
    `**process.cwd()**: \`${analysis.processCwd}\``,
    `**检测方法**: ${analysis.detectionMethod}`,
    `**是否MCP环境**: ${analysis.isMcpEnvironment ? '✅ 是' : '❌ 否'}`,
    `**目录一致性**: ${analysis.pathAnalysis.isSameAsProcessCwd ? '✅ 一致' : '⚠️ 不一致'}`,
  ];

  if (analysis.projectIndicators.hasGitRepo) {
    lines.push(`**Git仓库**: ✅ 检测到`);
  }
  
  if (analysis.projectIndicators.hasPackageJson) {
    lines.push(`**Package.json**: ✅ 检测到 (${analysis.projectIndicators.packageName || '无名称'})`);
  }

  return lines.join('\n');
}

/**
 * 生成问题诊断
 */
function generateDiagnosis(analysis: any): string {
  const issues = [];
  
  if (analysis.isMcpEnvironment) {
    issues.push("🔴 **MCP环境问题**: 检测到在MCP环境下运行，process.cwd()指向server目录而非用户项目目录");
  }
  
  if (!analysis.pathAnalysis.isSameAsProcessCwd) {
    issues.push("🟡 **目录不一致**: 检测到的工作目录与process.cwd()不同，可能影响项目检测");
  }
  
  if (!analysis.projectIndicators.hasGitRepo && !analysis.projectIndicators.hasPackageJson) {
    issues.push("🟡 **项目标识缺失**: 未检测到.git或package.json，可能不是有效的项目目录");
  }
  
  if (issues.length === 0) {
    return "✅ **无明显问题**: 工作目录检测正常";
  }
  
  return issues.join('\n\n');
}

/**
 * 生成解决建议
 */
function generateRecommendations(analysis: any): string {
  const recommendations = [];
  
  if (analysis.isMcpEnvironment) {
    recommendations.push(`
**1. 使用明确的工作目录参数**
   - 在调用项目检测函数时，明确传递工作目录参数
   - 避免依赖process.cwd()的默认行为`);
    
    recommendations.push(`
**2. 启用项目自动检测**
   - 设置环境变量: \`PROJECT_AUTO_DETECT=true\`
   - 这将启用智能工作目录检测机制`);
  }
  
  if (!analysis.projectIndicators.hasGitRepo && !analysis.projectIndicators.hasPackageJson) {
    recommendations.push(`
**3. 确认项目目录**
   - 确保当前目录是正确的项目根目录
   - 项目应包含.git目录或package.json文件`);
  }
  
  recommendations.push(`
**4. 手动指定项目目录**
   - 如果自动检测失败，可以手动指定项目目录
   - 使用绝对路径以避免相对路径问题`);
  
  return recommendations.join('\n');
}
