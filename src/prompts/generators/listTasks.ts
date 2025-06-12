/**
 * listTasks prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import { loadPrompt, generatePrompt, loadPromptFromTemplate } from '../loader.js';
import { Task, TaskStatus } from '../../types/index.js';

/**
 * listTasks prompt 參數介面
 */
export interface ListTasksPromptParams {
  status: string;
  tasks: Record<string, Task[]>;
  allTasks: Task[];
}

/**
 * 獲取 listTasks 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export function getListTasksPrompt(params: ListTasksPromptParams): string {
  const { status, tasks, allTasks } = params;

  // 如果沒有任務，顯示通知
  if (allTasks.length === 0) {
    const notFoundTemplate = loadPromptFromTemplate('listTasks/notFound.md');
    const statusText = status === 'all' ? '任何' : `任何 ${status} 的`;
    return generatePrompt(notFoundTemplate, {
      statusText: statusText,
    });
  }

  // 獲取所有狀態的計數
  const statusCounts = Object.values(TaskStatus)
    .map((statusType) => {
      const count = tasks[statusType]?.length || 0;
      return `- **${statusType}**: ${count} 個任務`;
    })
    .join('\n');

  let filterStatus = 'all';
  switch (status) {
    case 'pending':
      filterStatus = TaskStatus.PENDING;
      break;
    case 'in_progress':
      filterStatus = TaskStatus.IN_PROGRESS;
      break;
    case 'completed':
      filterStatus = TaskStatus.COMPLETED;
      break;
  }

  let taskDetails = '';
  let taskDetailsTemplate = loadPromptFromTemplate('listTasks/taskDetails.md');
  // 添加每個狀態下的詳細任務
  for (const statusType of Object.values(TaskStatus)) {
    const tasksWithStatus = tasks[statusType] || [];
    if (tasksWithStatus.length > 0 && (filterStatus === 'all' || filterStatus === statusType)) {
      for (const task of tasksWithStatus) {
        let dependencies = '沒有依賴';
        if (task.dependencies && task.dependencies.length > 0) {
          dependencies = task.dependencies.map((d) => `\`${d.taskId}\``).join(', ');
        }
        taskDetails += generatePrompt(taskDetailsTemplate, {
          name: task.name,
          id: task.id,
          description: task.description,
          createAt: task.createdAt,
          complatedSummary: (task.summary || '').substring(0, 100) + ((task.summary || '').length > 100 ? '...' : ''),
          dependencies: dependencies,
          complatedAt: task.completedAt,
        });
      }
    }
  }

  const indexTemplate = loadPromptFromTemplate('listTasks/index.md');
  let prompt = generatePrompt(indexTemplate, {
    statusCount: statusCounts,
    taskDetailsTemplate: taskDetails,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, 'LIST_TASKS');
}
