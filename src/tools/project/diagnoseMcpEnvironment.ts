/**
 * MCP环境诊断工具
 * 用于诊断MCP环境下的工作目录和项目检测问题
 */

import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { log } from "../../utils/logger.js";
import { getProjectContext } from "../../utils/projectDetector.js";

/**
 * MCP环境诊断的输入schema
 */
export const diagnoseMcpEnvironmentSchema = z.object({
  includeSystemInfo: z.boolean().optional().default(true).describe("是否包含系统信息"),
  includeProcessInfo: z.boolean().optional().default(true).describe("是否包含进程信息"),
  includeRecommendations: z.boolean().optional().default(true).describe("是否包含修复建议"),
});

export type DiagnoseMcpEnvironmentInput = z.infer<typeof diagnoseMcpEnvironmentSchema>;

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
 * 检测工作目录问题
 */
async function detectWorkingDirectoryIssues(): Promise<string[]> {
  const issues: string[] = [];
  const projectContext = await getProjectContext();

  // 检查检测方法
  if (projectContext.metadata.detectionMethod === 'fallback') {
    issues.push("🔴 使用回退检测方法：可能未找到合适的项目目录");
  }
  
  // 检查是否在程序安装目录
  const cwd = process.cwd();
  const suspiciousPatterns = [
    /Programs.*Windsurf/i,
    /Programs.*Cursor/i,
    /Programs.*Claude/i,
    /AppData.*Local.*Programs/i,
    /node_modules/i,
    /\.vscode/i
  ];
  
  if (suspiciousPatterns.some(pattern => pattern.test(cwd))) {
    issues.push("🟡 当前目录疑似程序安装目录，可能不是用户项目目录");
  }
  
  // 检查环境变量
  if (!process.env.PWD && !process.env.INIT_CWD) {
    issues.push("🟡 缺少PWD和INIT_CWD环境变量，可能影响工作目录检测");
  }
  
  // 检查项目指标
  if (!projectContext.projectType.hasGit && !projectContext.projectType.hasPackageJson) {
    issues.push("🟡 当前目录缺少项目指标文件（.git、package.json等）");
  }
  
  return issues;
}

/**
 * 获取相关环境变量
 */
function getRelevantEnvVars(): Record<string, string | undefined> {
  return {
    PWD: process.env.PWD,
    INIT_CWD: process.env.INIT_CWD,
    HOME: process.env.HOME,
    USERPROFILE: process.env.USERPROFILE,
    PROJECT_AUTO_DETECT: process.env.PROJECT_AUTO_DETECT,
    DATA_DIR: process.env.DATA_DIR,
    SHRIMP_PROJECT_PATH: process.env.SHRIMP_PROJECT_PATH,
    MCP_TRANSPORT_TYPE: process.env.MCP_TRANSPORT_TYPE,
    NODE_ENV: process.env.NODE_ENV,
  };
}

/**
 * 生成MCP修复建议
 */
function generateMcpRecommendations(issues: string[]): string[] {
  const recommendations: string[] = [];
  
  if (issues.some(issue => issue.includes('MCP环境'))) {
    recommendations.push("🔧 使用 set_project_working_directory 工具手动设置正确的项目目录");
    recommendations.push("📝 在MCP客户端配置中设置正确的工作目录环境变量");
  }
  
  if (issues.some(issue => issue.includes('程序安装目录'))) {
    recommendations.push("📁 确认当前是否在正确的项目目录中工作");
    recommendations.push("🔄 切换到实际的项目目录后重新启动MCP服务器");
  }
  
  if (issues.some(issue => issue.includes('环境变量'))) {
    recommendations.push("⚙️ 在MCP客户端配置中添加PWD或INIT_CWD环境变量");
    recommendations.push("📋 参考项目文档中的MCP配置示例");
  }
  
  if (issues.some(issue => issue.includes('项目指标'))) {
    recommendations.push("✅ 确认当前目录包含项目文件（package.json、.git等）");
    recommendations.push("📂 如果是新项目，考虑初始化Git仓库或创建package.json");
  }
  
  // 通用建议
  recommendations.push("📖 查看项目文档中的MCP环境配置指南");
  recommendations.push("🔍 使用 analyze_working_directory 工具获取详细的目录分析");
  
  return recommendations;
}

/**
 * 诊断MCP环境
 */
export async function diagnoseMcpEnvironment(input: DiagnoseMcpEnvironmentInput) {
  try {
    log.info("DiagnoseMcpEnvironment", "开始MCP环境诊断", input);
    
    const { includeSystemInfo, includeProcessInfo, includeRecommendations } = input;
    
    // 获取基础信息
    const projectContext = await getProjectContext();
    const mcpClient = detectMcpClientType();
    const workingDirIssues = await detectWorkingDirectoryIssues();
    const envVars = getRelevantEnvVars();
    
    // 构建诊断结果
    const diagnosis: any = {
      mcpClient,
      workingDirectory: {
        current: process.cwd(),
        detected: projectContext.projectRoot,
        detectionMethod: projectContext.metadata.detectionMethod,
        issues: workingDirIssues
      },
      projectDetection: {
        hasGitRepo: projectContext.projectType.hasGit,
        hasPackageJson: projectContext.projectType.hasPackageJson,
        packageName: projectContext.packageInfo?.name,
        projectId: projectContext.projectId
      },
      environmentVariables: envVars
    };
    
    // 可选：包含系统信息
    if (includeSystemInfo) {
      diagnosis.systemInfo = {
        platform: process.platform,
        nodeVersion: process.version,
        homeDirectory: os.homedir(),
        architecture: process.arch,
      };
    }
    
    // 可选：包含进程信息
    if (includeProcessInfo) {
      diagnosis.processInfo = {
        title: process.title,
        execPath: process.execPath,
        argv0: process.argv0,
        pid: process.pid,
        ppid: process.ppid,
      };
    }
    
    // 可选：包含修复建议
    if (includeRecommendations) {
      diagnosis.recommendations = generateMcpRecommendations(workingDirIssues);
    }
    
    // 生成诊断报告
    const hasIssues = workingDirIssues.length > 0;
    const statusIcon = hasIssues ? "⚠️" : "✅";
    const statusText = hasIssues ? "发现问题" : "环境正常";
    
    const report = `# ${statusIcon} MCP环境诊断报告

## 📊 诊断摘要
- **状态**: ${statusText}
- **MCP客户端**: ${mcpClient}
- **检测到的问题**: ${workingDirIssues.length}个

## 🔍 工作目录分析
- **当前目录**: \`${diagnosis.workingDirectory.current}\`
- **检测目录**: \`${diagnosis.workingDirectory.detected}\`
- **是否MCP环境**: ${diagnosis.workingDirectory.isMcpEnvironment ? '是' : '否'}
- **检测方法**: ${diagnosis.workingDirectory.detectionMethod}

## 🚨 发现的问题
${workingDirIssues.length > 0 ? workingDirIssues.map(issue => `- ${issue}`).join('\n') : '- 无问题'}

${includeRecommendations && diagnosis.recommendations ? `
## 💡 修复建议
${diagnosis.recommendations.map((rec: string) => `- ${rec}`).join('\n')}
` : ''}

## 📋 详细诊断数据
\`\`\`json
${JSON.stringify(diagnosis, null, 2)}
\`\`\`

## 🎯 下一步操作
${hasIssues ? 
  '1. 根据上述建议修复发现的问题\n2. 使用 set_project_working_directory 工具设置正确的项目目录\n3. 重新运行诊断验证修复效果' :
  '环境配置正常，可以正常使用项目功能'
}`;

    log.info("DiagnoseMcpEnvironment", "MCP环境诊断完成", { 
      issuesCount: workingDirIssues.length,
      mcpClient,
      hasIssues 
    });

    return {
      content: [{
        type: "text" as const,
        text: report
      }]
    };

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error("DiagnoseMcpEnvironment", "MCP环境诊断失败", error as Error, { input });
    
    return {
      content: [{
        type: "text" as const,
        text: `❌ MCP环境诊断失败: ${errorMsg}`
      }]
    };
  }
}
