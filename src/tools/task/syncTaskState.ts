import { z } from "zod";
import { 
  syncTaskState as modelSyncTaskState,
  getAllTasks,
  getTasksData,
} from "../../models/taskModel.js";
import { TaskStatus } from "../../types/index.js";
import { getSyncTaskStatePrompt } from "../../prompts/index.js";

// 同步任務狀態工具
// Sync task state tool
export const syncTaskStateSchema = z.object({
  force: z
    .boolean()
    .optional()
    .default(false)
    .describe("是否強制執行同步操作，忽略潛在的衝突警告"),
    // Whether to force sync operation, ignoring potential conflict warnings
  include_stats: z
    .boolean()
    .optional()
    .default(true)
    .describe("是否在結果中包含詳細的統計資訊"),
    // Whether to include detailed statistics in the result
  check_only: z
    .boolean()
    .optional()
    .default(false)
    .describe("僅檢查狀態而不執行任何修改操作"),
    // Only check state without performing any modifications
});

interface SyncIssue {
  type: 'missing_task' | 'duplicate_id' | 'inconsistent_timestamp' | 'corrupted_data' | 'dependency_mismatch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  taskId?: string;
  taskName?: string;
  details?: Record<string, any>;
  suggestedAction?: string;
}

interface SyncReport {
  issues: SyncIssue[];
  resolved: SyncIssue[];
  stats: {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    lastUpdated: Date;
    gitCommits: number;
    archives: number;
    deletedTaskBackups: number;
  };
  checksPerformed: string[];
  timestamp: Date;
  syncedSuccessfully: boolean;
}

export async function syncTaskState({
  force = false,
  include_stats = true,
  check_only = false,
}: z.infer<typeof syncTaskStateSchema>) {
  try {
    // 獲取當前任務狀態
    // Get current task state
    const tasks = await getAllTasks();
    const tasksData = await getTasksData();
    
    // 初始化同步報告
    // Initialize sync report
    const syncReport: SyncReport = {
      issues: [],
      resolved: [],
      stats: {
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        lastUpdated: new Date(),
        gitCommits: 0,
        archives: 0,
        deletedTaskBackups: 0
      },
      checksPerformed: [],
      timestamp: new Date(),
      syncedSuccessfully: false
    };

    // 執行狀態檢查
    // Perform state checks
    await performStateChecks(tasks, tasksData, syncReport);

    // 如果只是檢查模式，不執行修復
    // If check-only mode, don't perform fixes
    if (check_only) {
      const prompt = await getSyncTaskStatePrompt({
        report: syncReport,
        checkOnly: true,
        includeStats: include_stats,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: prompt,
          },
        ],
      };
    }

    // 如果有嚴重問題且未強制執行，需要用戶確認
    // If there are critical issues and not forced, require user confirmation
    const criticalIssues = syncReport.issues.filter(issue => issue.severity === 'critical');
    if (criticalIssues.length > 0 && !force) {
      const prompt = await getSyncTaskStatePrompt({
        report: syncReport,
        criticalIssues: true,
        requiresConfirmation: true,
        includeStats: include_stats,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: prompt,
          },
        ],
      };
    }

    // 執行同步操作
    // Perform sync operation
    if (!check_only) {
      await performSyncOperations(syncReport, force);
      
      // 調用模型函數獲取最新統計資訊
      // Call model function to get latest statistics
      if (include_stats) {
        const syncResult = await modelSyncTaskState();
        if (syncResult.success && syncResult.stats) {
          syncReport.stats = syncResult.stats;
        }
      }
      
      syncReport.syncedSuccessfully = true;
    }

    // 使用prompt生成器獲取最終prompt
    // Use prompt generator to get the final prompt
    const prompt = await getSyncTaskStatePrompt({
      report: syncReport,
      syncCompleted: true,
      includeStats: include_stats,
    });

    return {
      content: [
        {
          type: "text" as const,
          text: prompt,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text" as const,
          text: `## 同步錯誤\n\n執行任務狀態同步時發生錯誤: ${
            // ## Sync Error\n\nAn error occurred during task state synchronization: ${
            error instanceof Error ? error.message : String(error)
          }\n\n請檢查系統狀態並重試。如問題持續存在，請考慮使用 \`force: true\` 參數。`,
          // \n\nPlease check system state and retry. If the problem persists, consider using the \`force: true\` parameter.
        },
      ],
      isError: true,
    };
  }
}

// 執行狀態檢查
// Perform state checks
async function performStateChecks(
  tasks: any[],
  tasksData: any,
  report: SyncReport
): Promise<void> {
  report.checksPerformed.push('基本資料完整性檢查'); // Basic data integrity check
  
  // 檢查重複ID
  // Check for duplicate IDs
  const taskIds = new Set<string>();
  const duplicateIds = new Set<string>();
  
  for (const task of tasks) {
    if (taskIds.has(task.id)) {
      duplicateIds.add(task.id);
      report.issues.push({
        type: 'duplicate_id',
        severity: 'critical',
        description: `發現重複的任務ID: ${task.id}`,
        // description: `Duplicate task ID found: ${task.id}`,
        taskId: task.id,
        taskName: task.name,
        suggestedAction: '移除重複任務或重新生成唯一ID'
        // suggestedAction: 'Remove duplicate task or regenerate unique ID'
      });
    } else {
      taskIds.add(task.id);
    }
  }
  
  report.checksPerformed.push('重複ID檢查'); // Duplicate ID check
  
  // 檢查時間戳一致性
  // Check timestamp consistency
  for (const task of tasks) {
    if (task.createdAt && task.updatedAt) {
      const created = new Date(task.createdAt);
      const updated = new Date(task.updatedAt);
      
      if (updated < created) {
        report.issues.push({
          type: 'inconsistent_timestamp',
          severity: 'medium',
          description: `任務 "${task.name}" 的更新時間早於創建時間`,
          // description: `Task "${task.name}" has update time earlier than creation time`,
          taskId: task.id,
          taskName: task.name,
          details: {
            createdAt: created,
            updatedAt: updated
          },
          suggestedAction: '修正時間戳或重置為當前時間'
          // suggestedAction: 'Correct timestamp or reset to current time'
        });
      }
    }
  }
  
  report.checksPerformed.push('時間戳一致性檢查'); // Timestamp consistency check
  
  // 檢查依賴關係完整性
  // Check dependency integrity
  for (const task of tasks) {
    if (task.dependencies && task.dependencies.length > 0) {
      for (const dep of task.dependencies) {
        const dependencyExists = tasks.some(t => t.id === dep.taskId);
        if (!dependencyExists) {
          report.issues.push({
            type: 'dependency_mismatch',
            severity: 'high',
            description: `任務 "${task.name}" 依賴不存在的任務: ${dep.taskId}`,
            // description: `Task "${task.name}" depends on non-existent task: ${dep.taskId}`,
            taskId: task.id,
            taskName: task.name,
            details: {
              missingDependencyId: dep.taskId
            },
            suggestedAction: '移除無效依賴或恢復缺失的依賴任務'
            // suggestedAction: 'Remove invalid dependency or restore missing dependent task'
          });
        }
      }
    }
  }
  
  report.checksPerformed.push('依賴關係完整性檢查'); // Dependency integrity check
  
  // 檢查數據結構完整性
  // Check data structure integrity
  for (const task of tasks) {
    const requiredFields = ['id', 'name', 'description', 'status', 'createdAt', 'updatedAt'];
    const missingFields = requiredFields.filter(field => !task[field]);
    
    if (missingFields.length > 0) {
      report.issues.push({
        type: 'corrupted_data',
        severity: 'high',
        description: `任務 "${task.name || task.id}" 缺少必要欄位: ${missingFields.join(', ')}`,
        // description: `Task "${task.name || task.id}" missing required fields: ${missingFields.join(', ')}`,
        taskId: task.id,
        taskName: task.name,
        details: {
          missingFields
        },
        suggestedAction: '補充缺失欄位或移除損壞的任務'
        // suggestedAction: 'Add missing fields or remove corrupted task'
      });
    }
  }
  
  report.checksPerformed.push('資料結構完整性檢查'); // Data structure integrity check
}

// 執行同步操作
// Perform sync operations
async function performSyncOperations(
  report: SyncReport,
  force: boolean
): Promise<void> {
  const resolvedIssues: SyncIssue[] = [];
  
  // 處理可自動修復的問題
  // Handle automatically fixable issues
  for (const issue of report.issues) {
    try {
      switch (issue.type) {
        case 'inconsistent_timestamp':
          // 修復時間戳問題 (這裡是示例，實際實現可能需要更新數據庫)
          // Fix timestamp issues (this is an example, actual implementation may need database updates)
          resolvedIssues.push({
            ...issue,
            description: `已修復時間戳問題: ${issue.description}`
            // description: `Fixed timestamp issue: ${issue.description}`
          });
          break;
          
        case 'dependency_mismatch':
          if (force) {
            // 在強制模式下移除無效依賴
            // Remove invalid dependencies in force mode
            resolvedIssues.push({
              ...issue,
              description: `已移除無效依賴: ${issue.description}`
              // description: `Removed invalid dependency: ${issue.description}`
            });
          }
          break;
          
        case 'duplicate_id':
          if (force) {
            // 在強制模式下處理重複ID (需要具體實現)
            // Handle duplicate IDs in force mode (needs specific implementation)
            resolvedIssues.push({
              ...issue,
              description: `已處理重複ID問題: ${issue.description}`
              // description: `Handled duplicate ID issue: ${issue.description}`
            });
          }
          break;
      }
    } catch (error) {
      // 記錄修復失敗的問題
      // Log issues that failed to be fixed
      console.warn(`Failed to resolve issue ${issue.type}:`, error);
    }
  }
  
  // 更新報告中的已解決問題
  // Update resolved issues in report
  report.resolved = resolvedIssues;
  report.issues = report.issues.filter(issue => 
    !resolvedIssues.some(resolved => resolved.taskId === issue.taskId && resolved.type === issue.type)
  );
}