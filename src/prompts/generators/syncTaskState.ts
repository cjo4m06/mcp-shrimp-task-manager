/**
 * syncTaskState prompt 生成器
 * syncTaskState prompt generator
 * 負責將模板和參數組合成最終的 prompt
 * Responsible for combining templates and parameters into the final prompt
 */

import {
  loadPrompt,
  generatePrompt,
  loadPromptFromTemplate,
} from "../loader.js";

/**
 * 同步問題介面
 * Sync issue interface
 */
export interface SyncIssue {
  type: 'missing_task' | 'duplicate_id' | 'inconsistent_timestamp' | 'corrupted_data' | 'dependency_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  taskId?: string;
  taskName?: string;
  details?: Record<string, any>;
  suggestedAction?: string;
}

/**
 * 同步統計介面
 * Sync statistics interface
 */
export interface SyncStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  lastUpdated: Date;
  gitCommits: number;
  archives: number;
  deletedTaskBackups: number;
}

/**
 * 同步報告介面
 * Sync report interface
 */
export interface SyncReport {
  issues: SyncIssue[];
  resolved: SyncIssue[];
  stats: SyncStats;
  checksPerformed: string[];
  timestamp: Date;
  syncedSuccessfully: boolean;
}

/**
 * syncTaskState prompt 參數介面
 * syncTaskState prompt parameters interface
 */
export interface SyncTaskStatePromptParams {
  report: SyncReport;
  checkOnly?: boolean;
  syncCompleted?: boolean;
  criticalIssues?: boolean;
  requiresConfirmation?: boolean;
  includeStats?: boolean;
}

/**
 * 獲取 syncTaskState 的完整 prompt
 * Get the complete prompt for syncTaskState
 * @param params prompt 參數
 * @param params prompt parameters
 * @returns 生成的 prompt
 * @returns generated prompt
 */
export async function getSyncTaskStatePrompt(
  params: SyncTaskStatePromptParams
): Promise<string> {
  const { 
    report, 
    checkOnly = false,
    syncCompleted = false,
    criticalIssues = false,
    requiresConfirmation = false,
    includeStats = true
  } = params;

  // 如果需要確認才能執行
  // If confirmation is required before execution
  if (requiresConfirmation && criticalIssues) {
    const confirmationTemplate = await loadPromptFromTemplate(
      "syncTaskState/criticalIssuesConfirmation.md"
    );
    
    const criticalIssuesList = generateIssuesList(
      report.issues.filter(issue => issue.severity === 'critical')
    );
    
    return generatePrompt(confirmationTemplate, {
      criticalIssuesList,
      totalCriticalIssues: report.issues.filter(issue => issue.severity === 'critical').length,
    });
  }

  // 如果只是檢查模式
  // If it's check-only mode
  if (checkOnly) {
    const checkOnlyTemplate = await loadPromptFromTemplate(
      "syncTaskState/checkOnly.md"
    );
    
    const issuesSummary = generateIssuesSummary(report.issues);
    const checksPerformedList = generateChecksPerformedList(report.checksPerformed);
    const statsSection = includeStats ? generateStatsSection(report.stats) : "";
    
    return generatePrompt(checkOnlyTemplate, {
      issuesSummary,
      checksPerformedList,
      statsSection,
      timestamp: report.timestamp.toLocaleString('zh-TW'),
      totalIssues: report.issues.length,
    });
  }

  // 如果同步已完成
  // If sync has been completed
  if (syncCompleted) {
    const completedTemplate = await loadPromptFromTemplate(
      "syncTaskState/completed.md"
    );
    
    const resolvedIssuesList = generateIssuesList(report.resolved);
    const remainingIssuesList = generateIssuesList(report.issues);
    const statsSection = includeStats ? generateStatsSection(report.stats) : "";
    
    return generatePrompt(completedTemplate, {
      resolvedIssuesList,
      remainingIssuesList,
      statsSection,
      timestamp: report.timestamp.toLocaleString('zh-TW'),
      totalResolved: report.resolved.length,
      totalRemaining: report.issues.length,
      success: report.syncedSuccessfully,
    });
  }

  // 默認的同步狀態報告
  // Default sync status report
  const indexTemplate = await loadPromptFromTemplate("syncTaskState/index.md");
  
  const issuesSummary = generateIssuesSummary(report.issues);
  const checksPerformedList = generateChecksPerformedList(report.checksPerformed);
  const statsSection = includeStats ? generateStatsSection(report.stats) : "";
  
  let prompt = generatePrompt(indexTemplate, {
    issuesSummary,
    checksPerformedList,
    statsSection,
    timestamp: report.timestamp.toLocaleString('zh-TW'),
    totalIssues: report.issues.length,
  });

  // 載入可能的自定義 prompt
  // Load possible custom prompt
  return loadPrompt(prompt, "SYNC_TASK_STATE");
}

/**
 * 生成問題摘要
 * Generate issues summary
 */
function generateIssuesSummary(issues: SyncIssue[]): string {
  if (issues.length === 0) {
    return "✅ **狀態良好** - 未發現任何同步問題";
  }

  const severityGroups = issues.reduce((acc, issue) => {
    if (!acc[issue.severity]) {
      acc[issue.severity] = [];
    }
    acc[issue.severity].push(issue);
    return acc;
  }, {} as Record<string, SyncIssue[]>);

  let summary = "## 🔍 發現的問題\n\n";
  
  // 按嚴重程度排序
  const severityOrder = ['critical', 'high', 'medium', 'low'];
  const severityIcons = {
    critical: '🔴',
    high: '🟠', 
    medium: '🟡',
    low: '🟢'
  };
  
  const severityNames = {
    critical: '嚴重',
    high: '高',
    medium: '中等',
    low: '低'
  };

  for (const severity of severityOrder) {
    if (severityGroups[severity]) {
      summary += `### ${severityIcons[severity as keyof typeof severityIcons]} ${severityNames[severity as keyof typeof severityNames]}嚴重程度 (${severityGroups[severity].length}個)\n\n`;
      
      for (const issue of severityGroups[severity]) {
        summary += `- **${issue.taskName || issue.taskId || '未知任務'}**: ${issue.description}\n`;
        if (issue.suggestedAction) {
          summary += `  *建議操作: ${issue.suggestedAction}*\n`;
        }
      }
      summary += '\n';
    }
  }

  return summary;
}

/**
 * 生成問題列表
 * Generate issues list
 */
function generateIssuesList(issues: SyncIssue[]): string {
  if (issues.length === 0) {
    return "無";
  }

  let list = "";
  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    const severityIcon = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    }[issue.severity];
    
    list += `${i + 1}. ${severityIcon} **${issue.taskName || issue.taskId || '未知任務'}**: ${issue.description}\n`;
    if (issue.suggestedAction) {
      list += `   💡 *建議: ${issue.suggestedAction}*\n`;
    }
    list += '\n';
  }

  return list;
}

/**
 * 生成檢查項目列表
 * Generate checks performed list
 */
function generateChecksPerformedList(checks: string[]): string {
  if (checks.length === 0) {
    return "無檢查項目執行";
  }

  let list = "";
  for (let i = 0; i < checks.length; i++) {
    list += `${i + 1}. ✓ ${checks[i]}\n`;
  }

  return list;
}

/**
 * 生成統計資訊區塊
 * Generate statistics section
 */
function generateStatsSection(stats: SyncStats): string {
  const lastUpdated = stats.lastUpdated.toLocaleString('zh-TW');
  
  return `## 📊 系統統計

### 任務狀態分布
- **總任務數:** ${stats.totalTasks}
- **待執行:** ${stats.pendingTasks}
- **執行中:** ${stats.inProgressTasks}  
- **已完成:** ${stats.completedTasks}

### 系統資源
- **Git 提交數:** ${stats.gitCommits}
- **存檔數量:** ${stats.archives}
- **已刪除任務備份:** ${stats.deletedTaskBackups}

**最後更新:** ${lastUpdated}

`;
}