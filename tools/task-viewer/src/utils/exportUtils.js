/**
 * Export utility functions for tasks
 */

/**
 * Filters tasks by selected statuses
 * @param {Array} tasks - Array of task objects
 * @param {Array} selectedStatuses - Array of status strings to filter by
 * @returns {Array} Filtered tasks
 */
export const filterTasksByStatus = (tasks, selectedStatuses) => {
  if (!selectedStatuses || selectedStatuses.length === 0) {
    return [];
  }
  
  return tasks.filter(task => selectedStatuses.includes(task.status));
};

/**
 * Escapes CSV field value by adding quotes and escaping internal quotes
 * @param {string} value - Value to escape
 * @returns {string} Escaped CSV field
 */
const escapeCSVField = (value) => {
  if (value == null) return '';
  
  const stringValue = String(value);
  
  // If the value contains comma, quote, or newline, wrap in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Escape internal quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

/**
 * Exports tasks to CSV format
 * @param {Array} tasks - Array of task objects
 * @returns {string} CSV formatted string
 */
export const exportToCSV = (tasks) => {
  const headers = ['ID', 'Name', 'Description', 'Status', 'Created At', 'Updated At'];
  const csvRows = [headers.join(',')];
  
  tasks.forEach(task => {
    const row = [
      escapeCSVField(task.id),
      escapeCSVField(task.name),
      escapeCSVField(task.description || ''),
      escapeCSVField(task.status),
      escapeCSVField(task.createdAt),
      escapeCSVField(task.updatedAt)
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

/**
 * Formats date for markdown display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatDateForMarkdown = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return new Date(dateString).toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return dateString;
  }
};

/**
 * Groups tasks by status
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Tasks grouped by status
 */
const groupTasksByStatus = (tasks) => {
  return tasks.reduce((groups, task) => {
    const status = task.status || 'unknown';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(task);
    return groups;
  }, {});
};

/**
 * Generates task statistics
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Statistics object
 */
const generateTaskStats = (tasks) => {
  const stats = tasks.reduce((acc, task) => {
    const status = task.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  return {
    total: tasks.length,
    completed: stats.completed || 0,
    in_progress: stats.in_progress || 0,
    pending: stats.pending || 0,
    other: Object.keys(stats).reduce((sum, key) => {
      if (!['completed', 'in_progress', 'pending'].includes(key)) {
        return sum + stats[key];
      }
      return sum;
    }, 0)
  };
};

/**
 * Exports tasks to Markdown format
 * @param {Array} tasks - Array of task objects
 * @param {string} initialRequest - The initial request that started the task planning
 * @returns {string} Markdown formatted string
 */
export const exportToMarkdown = (tasks, initialRequest = '') => {
  if (tasks.length === 0) {
    let markdown = `# Tasks Export

**Export Date:** ${new Date().toISOString().split('T')[0]}

`;
    
    if (initialRequest) {
      markdown += `## Initial Request

${initialRequest}

---

`;
    }
    
    markdown += `Total tasks: 0

No tasks to export.`;
    
    return markdown;
  }

  const stats = generateTaskStats(tasks);
  const groupedTasks = groupTasksByStatus(tasks);
  
  let markdown = `# Tasks Export

**Export Date:** ${new Date().toISOString().split('T')[0]}

Total tasks: ${stats.total}

`;

  // Add initial request if provided
  if (initialRequest) {
    markdown += `## Initial Request

${initialRequest}

---

`;
  }

  markdown += `## Summary

- **Completed:** ${stats.completed}
- **In Progress:** ${stats.in_progress}
- **Pending:** ${stats.pending}`;

  if (stats.other > 0) {
    markdown += `\n- **Other:** ${stats.other}`;
  }

  markdown += '\n\n---\n';

  // Sort statuses for consistent output and create a flat list for numbering
  const sortedStatuses = Object.keys(groupedTasks).sort();
  
  // Create a flat list of all tasks with their original order for numbering
  const allTasksFlat = [];
  tasks.forEach((task, index) => {
    allTasksFlat.push({ ...task, taskNumber: index + 1 });
  });
  
  sortedStatuses.forEach(status => {
    const statusTasks = groupedTasks[status];
    const statusLabel = status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    markdown += `\n### Status: ${statusLabel}\n\n`;
    
    statusTasks.forEach(task => {
      // Find the task number from the original order
      const taskWithNumber = allTasksFlat.find(t => t.id === task.id);
      const taskNumber = taskWithNumber ? taskWithNumber.taskNumber : '?';
      markdown += `## Task ${taskNumber}: ${task.name}\n\n`;
      
      if (task.description) {
        markdown += `**Description:**  \n${task.description}\n\n`;
      }
      
      if (task.notes) {
        markdown += `**Notes:**  \n${task.notes}\n\n`;
      }
      
      if (task.implementationGuide) {
        markdown += `**Implementation Guide:**  \n${task.implementationGuide}\n\n`;
      }
      
      if (task.verificationCriteria) {
        markdown += `**Verification Criteria:**  \n${task.verificationCriteria}\n\n`;
      }
      
      if (task.agent) {
        markdown += `**Assigned Agent:** ${task.agent}\n\n`;
      }
      
      if (task.summary) {
        markdown += `**Summary:**  \n${task.summary}\n\n`;
      }
      
      if (task.analysisResult) {
        markdown += `**Analysis Result:**  \n${task.analysisResult}\n\n`;
      }
      
      if (task.dependencies && task.dependencies.length > 0) {
        markdown += `**Dependencies:**\n`;
        task.dependencies.forEach(dep => {
          if (typeof dep === 'string') {
            markdown += `- ${dep}\n`;
          } else if (dep && typeof dep === 'object') {
            const depId = dep.taskId || dep.id || 'Unknown';
            const depName = dep.name ? ` (${dep.name})` : '';
            markdown += `- ${depId}${depName}\n`;
          }
        });
        markdown += '\n';
      }
      
      if (task.relatedFiles && task.relatedFiles.length > 0) {
        markdown += `**Related Files:**\n`;
        task.relatedFiles.forEach(file => {
          const typeIcons = {
            CREATE: "➕",
            TO_MODIFY: "✏️", 
            REFERENCE: "📖",
            DEPENDENCY: "🔗",
            OTHER: "📄"
          };
          const icon = typeIcons[file.type] || "📄";
          markdown += `- ${icon} **${file.path}** (${file.type})`;
          if (file.description) {
            markdown += ` - ${file.description}`;
          }
          if (file.lineStart || file.lineEnd) {
            const start = file.lineStart || '?';
            const end = file.lineEnd || '?';
            markdown += ` [Lines: ${start}-${end}]`;
          }
          markdown += '\n';
        });
        markdown += '\n';
      }
      
      markdown += `**Metadata:**  \n`;
      markdown += `- **ID:** ${task.id}\n`;
      markdown += `- **Status:** ${status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}\n`;
      markdown += `- **Created:** ${formatDateForMarkdown(task.createdAt)}\n`;
      markdown += `- **Updated:** ${formatDateForMarkdown(task.updatedAt)}\n\n`;
      markdown += '---\n\n';
    });
  });
  
  return markdown.trim();
};