/**
 * 获取当前项目上下文信息工具
 * 用于让AI了解当前工作的项目环境和配置
 */

import { z } from "zod";
import { getProjectContext as getProjectContextUtil } from "../../utils/projectDetector.js";
import { getPathSummary } from "../../utils/pathManager.js";
import fs from "fs/promises";

/**
 * 检测MCP客户端类型
 */
function detectMcpClientType(): string {
  const processTitle = process.title || '';
  const execPath = process.execPath || '';
  const argv0 = process.argv0 || '';

  // 检查进程路径和标题
  const indicators = [
    { pattern: /cursor/i, client: 'Cursor IDE' },
    { pattern: /windsurf/i, client: 'Windsurf' },
    { pattern: /claude/i, client: 'Claude Desktop' },
    { pattern: /vscode/i, client: 'VS Code' },
    { pattern: /code/i, client: 'VS Code' },
  ];

  for (const indicator of indicators) {
    if (indicator.pattern.test(processTitle) ||
        indicator.pattern.test(execPath) ||
        indicator.pattern.test(argv0)) {
      return indicator.client;
    }
  }

  return 'Unknown';
}

/**
 * 生成AI使用建议
 */
function generateAiSuggestions(context: any): string[] {
  const suggestions: string[] = [];

  if (context.debug?.isMcpEnvironment) {
    suggestions.push("🔧 检测到MCP环境问题，建议使用 set_project_working_directory 工具手动设置正确的项目目录");
  }

  if (!context.project.detected) {
    suggestions.push("📁 未检测到项目，建议检查当前目录是否包含项目文件，或手动指定项目目录");
  }

  if (context.debug?.detectionMethod === 'process.cwd') {
    suggestions.push("⚠️ 使用了process.cwd()检测，在MCP环境下可能不准确，建议设置环境变量或使用配置文件");
  }

  const currentDir = process.cwd();
  const suspiciousPatterns = [
    /Programs.*Windsurf/i,
    /Programs.*Cursor/i,
    /Programs.*Claude/i,
    /AppData.*Local.*Programs/i,
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(currentDir))) {
    suggestions.push("🚨 当前目录疑似程序安装目录，强烈建议使用 set_project_working_directory 设置正确的项目目录");
  }

  if (suggestions.length === 0) {
    suggestions.push("✅ 项目检测正常，可以正常使用所有功能");
  }

  return suggestions;
}

/**
 * 获取项目上下文的输入schema
 */
export const getProjectContextSchema = z.object({
  includeEnvVars: z.boolean().optional().default(false).describe("是否包含环境变量信息"),
  includeDataDir: z.boolean().optional().default(true).describe("是否包含数据目录信息"),
  includeAiSuggestions: z.boolean().optional().default(true).describe("是否包含AI使用建议"),
  includeMcpInfo: z.boolean().optional().default(true).describe("是否包含MCP环境信息"),
});

export type GetProjectContextInput = z.infer<typeof getProjectContextSchema>;

/**
 * 获取当前项目上下文信息
 * @param input 输入参数
 * @returns 项目上下文信息
 */
export async function getProjectContext(input: GetProjectContextInput) {
  try {
    // 获取项目上下文信息
    const projectContext = await getProjectContextUtil();

    // 获取路径摘要
    const pathSummary = await getPathSummary();

    // 构建项目上下文信息
    const context: any = {
      project: {
        detected: true,
        info: {
          id: projectContext.projectId,
          name: projectContext.projectName,
          rawName: projectContext.projectName, // 添加 rawName 字段
          path: projectContext.projectRoot,
          detectionMethod: projectContext.metadata.detectionMethod,
          source: 'auto-detected', // 添加 source 字段
        },
      },
      projectType: {
        hasGit: projectContext.projectType.hasGit,
        hasPackageJson: projectContext.projectType.hasPackageJson,
        hasNodeModules: projectContext.projectType.hasNodeModules,
        hasPyprojectToml: projectContext.projectType.hasPyprojectToml,
        hasCargoToml: projectContext.projectType.hasCargoToml,
        hasGoMod: projectContext.projectType.hasGoMod,
      },
      packageInfo: projectContext.packageInfo,
      metadata: projectContext.metadata,
      // 添加自动检测信息
      autoDetection: {
        enabled: process.env.PROJECT_AUTO_DETECT === 'true',
        method: projectContext.metadata.detectionMethod,
        timestamp: projectContext.metadata.timestamp
      },
    };

    // 包含数据目录信息
    if (input.includeDataDir) {
      context.dataDirectory = {
        base: pathSummary.baseDataDir,
        project: pathSummary.projectDataDir,
        tasksFile: pathSummary.tasksFile,
        logDir: pathSummary.logDir,
        configDir: pathSummary.configDir,
        tempDir: pathSummary.tempDir,
      };

      // 检查任务文件是否存在
      try {
        await fs.access(pathSummary.tasksFile);
        context.dataDirectory.tasksFileExists = true;
      } catch {
        context.dataDirectory.tasksFileExists = false;
      }
    }

    // 包含环境变量信息（可选）
    if (input.includeEnvVars) {
      context.environment = {
        PROJECT_AUTO_DETECT: process.env.PROJECT_AUTO_DETECT || null,
        DATA_DIR: process.env.DATA_DIR || null,
        TEMPLATES_USE: process.env.TEMPLATES_USE || null,
        SHRIMP_PROJECT_PATH: process.env.SHRIMP_PROJECT_PATH || null,
        PWD: process.env.PWD || null,
        INIT_CWD: process.env.INIT_CWD || null,
      };
    }

    // 包含MCP环境信息（可选）
    if (input.includeMcpInfo) {
      context.mcpEnvironment = {
        clientType: detectMcpClientType(),
        transportType: process.env.MCP_TRANSPORT_TYPE || 'stdio',
        serverVersion: "1.0.19",
        detectionCapabilities: [
          'environment-variables',
          'config-files',
          'heuristic-detection',
          'manual-override'
        ]
      };
    }

    // 包含AI使用建议（可选）
    if (input.includeAiSuggestions) {
      context.aiSuggestions = generateAiSuggestions(context);
      context.availableTools = [
        'set_project_working_directory',
        'diagnose_mcp_environment',
        'analyze_working_directory',
        'get_project_context'
      ];
    }

    // 生成用户友好的摘要
    const summary = generateContextSummary(context);

    return {
      content: [
        {
          type: "text" as const,
          text: `# 🎯 当前项目上下文信息

${summary}

## 📋 详细信息

\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

## 💡 说明

- **项目检测**: ${context.project.detected ? '✅ 成功' : '❌ 失败'}
- **数据隔离**: ${context.autoDetection.enabled ? '✅ 启用' : '❌ 禁用'}
- **任务存储**: \`${context.dataDirectory?.project || pathSummary.baseDataDir}\`

${context.project.detected ? 
  `当前工作在项目 **${context.project.info.rawName}** (ID: \`${context.project.info.id}\`)，任务将存储在独立的项目目录中。` :
  '⚠️ 未检测到项目信息，任务将存储在默认目录中。'
}`,
        },
      ],
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text" as const,
          text: `❌ 获取项目上下文失败: ${errorMsg}`,
        },
      ],
    };
  }
}

/**
 * 生成项目上下文摘要
 */
function generateContextSummary(context: any): string {
  const lines: string[] = [];

  if (context.project.detected) {
    lines.push(`**当前项目**: ${context.project.info.rawName} (${context.project.info.source})`);
    lines.push(`**项目ID**: \`${context.project.info.id}\``);
    lines.push(`**项目路径**: \`${context.project.info.path}\``);
  } else {
    lines.push(`**项目状态**: ⚠️ 未检测到项目`);
  }

  if (context.autoDetection) {
    lines.push(`**自动检测**: ${context.autoDetection.enabled ? '✅ 启用' : '❌ 禁用'}`);
    if (context.autoDetection.method !== 'none') {
      lines.push(`**检测方式**: ${context.autoDetection.method}`);
    }
  }

  // 添加调试信息摘要
  if (context.debug) {
    lines.push(`\n### 🔍 调试信息`);
    lines.push(`**工作目录检测**: ${context.debug.detectionMethod}`);
    lines.push(`**检测到的目录**: \`${context.debug.detectedWorkingDir}\``);
    lines.push(`**process.cwd()**: \`${context.debug.processCwd}\``);

    if (context.debug.isMcpEnvironment) {
      lines.push(`**⚠️ MCP环境**: 检测到工作目录与process.cwd()不同`);
    }

    if (context.debug.providedWorkingDir) {
      lines.push(`**用户提供目录**: \`${context.debug.providedWorkingDir}\``);
    }
  }

  if (context.dataDirectory) {
    lines.push(`\n### 📁 数据存储`);
    lines.push(`**任务存储**: \`${context.dataDirectory.project}\``);
    lines.push(`**任务文件**: ${context.dataDirectory.tasksFileExists ? '✅ 存在' : '❌ 不存在'}`);
  }

  return lines.join('\n');
}
