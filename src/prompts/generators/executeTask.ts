/**
 * executeTask prompt 生成器
 * 負責將模板和參數組合成最終的 prompt
 */

import { loadPrompt, generatePrompt, loadPromptFromTemplate } from '../loader.js';
import { Task, TaskStatus } from '../../types/index.js';

/**
 * 任務複雜度評估的介面
 */
interface ComplexityAssessment {
  level: string;
  metrics: {
    descriptionLength: number;
    dependenciesCount: number;
  };
  recommendations?: string[];
}

/**
 * executeTask prompt 參數介面
 */
export interface ExecuteTaskPromptParams {
  task: Task;
  complexityAssessment?: ComplexityAssessment;
  relatedFilesSummary?: string;
  dependencyTasks?: Task[];
}

/**
 * 獲取複雜度級別的樣式文字
 * @param level 複雜度級別
 * @returns 樣式文字
 */
function getComplexityStyle(level: string): string {
  switch (level) {
    case 'VERY_HIGH':
      return '⚠️ **警告：此任務複雜度極高** ⚠️';
    case 'HIGH':
      return '⚠️ **注意：此任務複雜度較高**';
    case 'MEDIUM':
      return '**提示：此任務具有一定複雜性**';
    default:
      return '';
  }
}

/**
 * 獲取 executeTask 的完整 prompt
 * @param params prompt 參數
 * @returns 生成的 prompt
 */
export function getExecuteTaskPrompt(params: ExecuteTaskPromptParams): string {
  const { task, complexityAssessment, relatedFilesSummary, dependencyTasks } = params;

  const notesTemplate = loadPromptFromTemplate('executeTask/notes.md');
  let notesPrompt = '';
  if (task.notes) {
    notesPrompt = generatePrompt(notesTemplate, {
      notes: task.notes,
    });
  }

  const implementationGuideTemplate = loadPromptFromTemplate('executeTask/implementationGuide.md');
  let implementationGuidePrompt = '';
  if (task.implementationGuide) {
    implementationGuidePrompt = generatePrompt(implementationGuideTemplate, {
      implementationGuide: task.implementationGuide,
    });
  }

  const verificationCriteriaTemplate = loadPromptFromTemplate('executeTask/verificationCriteria.md');
  let verificationCriteriaPrompt = '';
  if (task.verificationCriteria) {
    verificationCriteriaPrompt = generatePrompt(verificationCriteriaTemplate, {
      verificationCriteria: task.verificationCriteria,
    });
  }

  const analysisResultTemplate = loadPromptFromTemplate('executeTask/analysisResult.md');
  let analysisResultPrompt = '';
  if (task.analysisResult) {
    analysisResultPrompt = generatePrompt(analysisResultTemplate, {
      analysisResult: task.analysisResult,
    });
  }

  const dependencyTasksTemplate = loadPromptFromTemplate('executeTask/dependencyTasks.md');
  let dependencyTasksPrompt = '';
  if (dependencyTasks && dependencyTasks.length > 0) {
    const completedDependencyTasks = dependencyTasks.filter((t) => t.status === TaskStatus.COMPLETED && t.summary);

    if (completedDependencyTasks.length > 0) {
      let dependencyTasksContent = '';
      for (const depTask of completedDependencyTasks) {
        dependencyTasksContent += `### ${depTask.name}\n${depTask.summary || '*無完成摘要*'}\n\n`;
      }
      dependencyTasksPrompt = generatePrompt(dependencyTasksTemplate, {
        dependencyTasks: dependencyTasksContent,
      });
    }
  }

  const relatedFilesSummaryTemplate = loadPromptFromTemplate('executeTask/relatedFilesSummary.md');
  let relatedFilesSummaryPrompt = '';
  relatedFilesSummaryPrompt = generatePrompt(relatedFilesSummaryTemplate, {
    relatedFilesSummary: relatedFilesSummary || '當前任務沒有關聯的文件。',
  });

  const complexityTemplate = loadPromptFromTemplate('executeTask/complexity.md');
  let complexityPrompt = '';
  if (complexityAssessment) {
    const complexityStyle = getComplexityStyle(complexityAssessment.level);
    let recommendationContent = '';
    if (complexityAssessment.recommendations && complexityAssessment.recommendations.length > 0) {
      for (const recommendation of complexityAssessment.recommendations) {
        recommendationContent += `- ${recommendation}\n`;
      }
    }
    complexityPrompt = generatePrompt(complexityTemplate, {
      level: complexityAssessment.level,
      complexityStyle: complexityStyle,
      descriptionLength: complexityAssessment.metrics.descriptionLength,
      dependenciesCount: complexityAssessment.metrics.dependenciesCount,
      recommendation: recommendationContent,
    });
  }

  const indexTemplate = loadPromptFromTemplate('executeTask/index.md');
  let prompt = generatePrompt(indexTemplate, {
    name: task.name,
    id: task.id,
    description: task.description,
    notesTemplate: notesPrompt,
    implementationGuideTemplate: implementationGuidePrompt,
    verificationCriteriaTemplate: verificationCriteriaPrompt,
    analysisResultTemplate: analysisResultPrompt,
    dependencyTasksTemplate: dependencyTasksPrompt,
    relatedFilesSummaryTemplate: relatedFilesSummaryPrompt,
    complexityTemplate: complexityPrompt,
  });

  // 載入可能的自定義 prompt
  return loadPrompt(prompt, 'EXECUTE_TASK');
}
