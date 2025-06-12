/**
 * planTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import { loadPrompt, generatePrompt, loadPromptFromTemplate } from '../loader.js';
import { Task, TaskDependency } from '../../types/index.js';

/**
 * planTask prompt 參數介面
 */
export interface PlanTaskPromptParams {
  description: string;
  requirements?: string;
  existingTasksReference?: boolean;
  completedTasks?: Task[];
  pendingTasks?: Task[];
  memoryDir: string;
}

/**
 * 獲取 planTask 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export function getPlanTaskPrompt(params: PlanTaskPromptParams): string {
  let tasksContent = '';
  if (params.existingTasksReference && params.completedTasks && params.pendingTasks) {
    const allTasks = [...params.completedTasks, ...params.pendingTasks];
    // 如果存在任務，則添加相關資訊
    if (allTasks.length > 0) {
      let completeTasksContent = 'no completed tasks';

      // 處理已完成任務
      if (params.completedTasks.length > 0) {
        completeTasksContent = '';
        // 最多顯示10個已完成任務，避免提示詞過長
        const tasksToShow =
          params.completedTasks.length > 10 ? params.completedTasks.slice(0, 10) : params.completedTasks;

        tasksToShow.forEach((task, index) => {
          // 產生完成時間資訊 (如果有)
          const completedTimeText = task.completedAt ? `   - completedAt：${task.completedAt.toLocaleString()}\n` : '';

          completeTasksContent += `{index}. **${task.name}** (ID: \`${task.id}\`)\n   - description：${
            task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description
          }\n${completedTimeText}`;
          // 如果不是最後一個任務，添加換行
          if (index < tasksToShow.length - 1) {
            completeTasksContent += '\n\n';
          }
        });

        // 如果有更多任務，顯示提示
        if (params.completedTasks.length > 10) {
          completeTasksContent += `\n\n*（僅顯示前10個，共 ${params.completedTasks.length} 個）*\n`;
        }
      }

      let unfinishedTasksContent = 'no pending tasks';
      // 處理未完成任務
      if (params.pendingTasks && params.pendingTasks.length > 0) {
        unfinishedTasksContent = '';

        params.pendingTasks.forEach((task, index) => {
          const dependenciesText =
            task.dependencies && task.dependencies.length > 0
              ? `   - dependence：${task.dependencies.map((dep: TaskDependency) => `\`${dep.taskId}\``).join(', ')}\n`
              : '';

          unfinishedTasksContent += `${index + 1}. **${task.name}** (ID: \`${task.id}\`)\n   - description：${
            task.description.length > 150 ? task.description.substring(0, 150) + '...' : task.description
          }\n   - status：${task.status}\n${dependenciesText}`;

          // 如果不是最後一個任務，添加換行
          if (index < (params.pendingTasks?.length ?? 0) - 1) {
            unfinishedTasksContent += '\n\n';
          }
        });
      }

      const tasksTemplate = loadPromptFromTemplate('planTask/tasks.md');
      tasksContent = generatePrompt(tasksTemplate, {
        completedTasks: completeTasksContent,
        unfinishedTasks: unfinishedTasksContent,
      });
    }
  }

  let thoughtTemplate = '';
  if (process.env.ENABLE_THOUGHT_CHAIN !== 'false') {
    thoughtTemplate = loadPromptFromTemplate('planTask/hasThought.md');
  } else {
    thoughtTemplate = loadPromptFromTemplate('planTask/noThought.md');
  }
  const indexTemplate = loadPromptFromTemplate('planTask/index.md');
  let prompt = generatePrompt(indexTemplate, {
    description: params.description,
    requirements: params.requirements || 'No requirements',
    tasksTemplate: tasksContent,
    rulesPath: 'shrimp-rules.md',
    memoryDir: params.memoryDir,
    thoughtTemplate: thoughtTemplate,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, 'PLAN_TASK');
}
