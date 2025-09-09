import { Task, TaskCompletionDetails } from './completionTemplates';
import { parseFlexibleSummary } from './completionSummaryParser';

/**
 * Export utilities for task completion reports
 * Provides functions to export completion summaries in various formats
 */

interface ExportOptions {
  includeIncomplete?: boolean;
  groupByAgent?: boolean;
  groupByDate?: boolean;
  includeDetails?: boolean;
}

/**
 * Triggers a file download in the browser
 */
function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats a date for display
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  return d.toISOString().split('T')[0];
}

/**
 * Groups tasks by completion date
 */
function groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((groups, task) => {
    const date = formatDate(task.completedAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {} as Record<string, Task[]>);
}

/**
 * Groups tasks by agent
 */
function groupTasksByAgent(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((groups, task) => {
    const agent = task.agent || 'Unassigned';
    if (!groups[agent]) {
      groups[agent] = [];
    }
    groups[agent].push(task);
    return groups;
  }, {} as Record<string, Task[]>);
}

/**
 * Exports task completion summaries to Markdown format
 * Creates a well-formatted document with TOC and grouped sections
 */
export function exportToMarkdown(
  tasks: Task[], 
  options: ExportOptions = {}
): string {
  const {
    includeIncomplete = false,
    groupByAgent = false,
    groupByDate = false,
    includeDetails = true
  } = options;

  // Filter tasks based on completion status
  const filteredTasks = includeIncomplete 
    ? tasks 
    : tasks.filter(t => t.status === 'completed' && t.summary);

  if (filteredTasks.length === 0) {
    return '# Task Completion Report\n\nNo completed tasks with summaries found.';
  }

  let markdown = `# Task Completion Report

**Generated:** ${new Date().toISOString()}
**Total Tasks:** ${filteredTasks.length}

## Table of Contents

`;

  // Generate TOC based on grouping
  if (groupByDate) {
    const grouped = groupTasksByDate(filteredTasks);
    markdown += Object.keys(grouped).sort().reverse().map(date => 
      `- [${date}](#${date.replace(/\s+/g, '-').toLowerCase()})`
    ).join('\n');
  } else if (groupByAgent) {
    const grouped = groupTasksByAgent(filteredTasks);
    markdown += Object.keys(grouped).sort().map(agent => 
      `- [${agent}](#${agent.replace(/\s+/g, '-').toLowerCase()})`
    ).join('\n');
  } else {
    markdown += filteredTasks.map((task, idx) => 
      `- [${task.name}](#task-${idx + 1}-${task.name.replace(/\s+/g, '-').toLowerCase()})`
    ).join('\n');
  }

  markdown += '\n\n---\n\n';

  // Generate content based on grouping
  if (groupByDate) {
    const grouped = groupTasksByDate(filteredTasks);
    Object.keys(grouped).sort().reverse().forEach(date => {
      markdown += `## ${date}\n\n`;
      grouped[date].forEach((task, idx) => {
        markdown += generateTaskMarkdown(task, idx, includeDetails);
      });
    });
  } else if (groupByAgent) {
    const grouped = groupTasksByAgent(filteredTasks);
    Object.keys(grouped).sort().forEach(agent => {
      markdown += `## ${agent}\n\n`;
      grouped[agent].forEach((task, idx) => {
        markdown += generateTaskMarkdown(task, idx, includeDetails);
      });
    });
  } else {
    filteredTasks.forEach((task, idx) => {
      markdown += generateTaskMarkdown(task, idx, includeDetails, true);
    });
  }

  return markdown;
}

/**
 * Generates Markdown for a single task
 */
function generateTaskMarkdown(
  task: Task, 
  index: number, 
  includeDetails: boolean,
  includeHeader: boolean = false
): string {
  let md = '';
  
  if (includeHeader) {
    md += `## Task ${index + 1}: ${task.name}\n\n`;
  } else {
    md += `### ${task.name}\n\n`;
  }

  // Basic info
  md += `**Status:** ${task.status}\n`;
  if (task.agent) md += `**Agent:** ${task.agent}\n`;
  if (task.completedAt) md += `**Completed:** ${formatDate(task.completedAt)}\n`;
  md += '\n';

  // Description
  if (task.description) {
    md += `**Description:**\n${task.description}\n\n`;
  }

  // Summary (the main completion summary)
  if (task.summary) {
    md += `### Completion Summary\n\n${task.summary}\n\n`;
    
    // Parse and include structured details if available
    if (includeDetails) {
      const details = parseFlexibleSummary(task.summary);
      
      if (details.keyAccomplishments.length > 0) {
        md += `#### Key Accomplishments\n\n`;
        details.keyAccomplishments.forEach(item => {
          md += `- ${item}\n`;
        });
        md += '\n';
      }
      
      if (details.implementationDetails.length > 0) {
        md += `#### Implementation Details\n\n`;
        details.implementationDetails.forEach(item => {
          md += `- ${item}\n`;
        });
        md += '\n';
      }
      
      if (details.technicalChallenges.length > 0) {
        md += `#### Technical Challenges\n\n`;
        details.technicalChallenges.forEach(item => {
          md += `- ${item}\n`;
        });
        md += '\n';
      }
      
      if (details.verificationScore > 0) {
        md += `**Verification Score:** ${details.verificationScore}/100\n\n`;
      }
    }
  }

  // Notes
  if (task.notes) {
    md += `**Notes:**\n${task.notes}\n\n`;
  }

  md += '---\n\n';
  return md;
}

/**
 * Exports task completion summaries to JSON format
 * Maintains structure for reimport and analysis
 */
export function exportToJSON(
  tasks: Task[], 
  options: ExportOptions = {}
): string {
  const {
    includeIncomplete = false,
    includeDetails = true
  } = options;

  // Filter tasks based on completion status
  const filteredTasks = includeIncomplete 
    ? tasks 
    : tasks.filter(t => t.status === 'completed' && t.summary);

  // Enhance tasks with parsed completion details if requested
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    totalTasks: filteredTasks.length,
    tasks: filteredTasks.map(task => {
      const exportTask: any = {
        id: task.id,
        name: task.name,
        description: task.description,
        status: task.status,
        agent: task.agent,
        createdAt: task.createdAt,
        completedAt: task.completedAt,
        summary: task.summary,
        notes: task.notes,
        dependencies: task.dependencies
      };

      // Include parsed completion details if available and requested
      if (includeDetails && task.summary) {
        exportTask.parsedCompletionDetails = parseFlexibleSummary(task.summary);
      }

      return exportTask;
    }),
    statistics: generateStatistics(filteredTasks)
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Generates statistics for the exported tasks
 */
function generateStatistics(tasks: Task[]): Record<string, any> {
  const stats = {
    totalTasks: tasks.length,
    byStatus: {} as Record<string, number>,
    byAgent: {} as Record<string, number>,
    averageVerificationScore: 0,
    completionDates: {
      earliest: null as string | null,
      latest: null as string | null
    }
  };

  let totalScore = 0;
  let scoreCount = 0;

  tasks.forEach(task => {
    // Status statistics
    stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
    
    // Agent statistics
    const agent = task.agent || 'Unassigned';
    stats.byAgent[agent] = (stats.byAgent[agent] || 0) + 1;
    
    // Verification score
    if (task.summary) {
      const details = parseFlexibleSummary(task.summary);
      if (details.verificationScore > 0) {
        totalScore += details.verificationScore;
        scoreCount++;
      }
    }
    
    // Completion dates
    if (task.completedAt) {
      const date = formatDate(task.completedAt);
      if (!stats.completionDates.earliest || date < stats.completionDates.earliest) {
        stats.completionDates.earliest = date;
      }
      if (!stats.completionDates.latest || date > stats.completionDates.latest) {
        stats.completionDates.latest = date;
      }
    }
  });

  if (scoreCount > 0) {
    stats.averageVerificationScore = Math.round(totalScore / scoreCount);
  }

  return stats;
}

/**
 * Main export function that handles both formats
 * Called by the ExportModal component
 */
export function exportCompletionReports(
  tasks: Task[],
  format: 'markdown' | 'json',
  options: ExportOptions = {}
): void {
  const timestamp = new Date().toISOString().split('T')[0];
  
  if (format === 'markdown') {
    const content = exportToMarkdown(tasks, options);
    const filename = `task-completions-${timestamp}.md`;
    downloadFile(filename, content, 'text/markdown;charset=utf-8');
  } else if (format === 'json') {
    const content = exportToJSON(tasks, options);
    const filename = `task-completions-${timestamp}.json`;
    downloadFile(filename, content, 'application/json;charset=utf-8');
  }
}

/**
 * Validates if a JSON file can be imported
 */
export function validateImportData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (!data.version || !data.tasks || !Array.isArray(data.tasks)) return false;
  
  // Check if tasks have required fields
  return data.tasks.every((task: any) => 
    task.id && task.name && task.status
  );
}

/**
 * Imports tasks from a JSON export file
 */
export function importFromJSON(jsonString: string): Task[] | null {
  try {
    const data = JSON.parse(jsonString);
    if (!validateImportData(data)) {
      throw new Error('Invalid import data format');
    }
    return data.tasks;
  } catch (error) {
    console.error('Failed to import JSON:', error);
    return null;
  }
}