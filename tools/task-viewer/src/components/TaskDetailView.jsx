import React, { useEffect, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import TaskSummary from './TaskSummary';
import CompletionDetailsView from './CompletionDetailsView';

const TaskDetailView = memo(function TaskDetailView({ task, onBack, projectRoot, onNavigateToTask, taskIndex, allTasks, isHistorical = false, onEdit }) {
  const { t } = useTranslation();
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Arrow key navigation
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (taskIndex > 0 && allTasks && allTasks[taskIndex - 1]) {
          onNavigateToTask(allTasks[taskIndex - 1].id);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (allTasks && taskIndex < allTasks.length - 1 && allTasks[taskIndex + 1]) {
          onNavigateToTask(allTasks[taskIndex + 1].id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [taskIndex, allTasks, onNavigateToTask, onBack]);
  
  if (!task) return null;

  // Memoize expensive date formatting
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }, []);

  // Memoize time calculation to prevent recalculation on every render
  const timeTaken = useMemo(() => {
    if (!task.createdAt || !task.completedAt) return null;
    
    const start = new Date(task.createdAt);
    const end = new Date(task.completedAt);
    const diffMs = end - start;
    
    if (diffMs < 0) return null;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.join(' ');
  }, [task.createdAt, task.completedAt]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      in_progress: '#3498db',
      completed: '#27ae60',
      blocked: '#e74c3c'
    };
    return colors[status] || '#666';
  };

  const getFileTypeIcon = (type) => {
    const icons = {
      CREATE: '➕',
      TO_MODIFY: '✏️',
      REFERENCE: '📖',
      DEPENDENCY: '🔗',
      OTHER: '📄'
    };
    return icons[type] || '📄';
  };

  return (
    <div className={`task-detail-view ${isHistorical ? 'historical' : ''}`}>
      <div className="task-detail-header">
        <h2>
          <span className="task-number">TASK {taskIndex + 1}</span>
          {task.name}
        </h2>
        <div className="header-buttons">
          <div className="nav-buttons">
            <button 
              className="nav-button prev-button"
              onClick={() => {
                if (taskIndex > 0 && allTasks && allTasks[taskIndex - 1]) {
                  onNavigateToTask(allTasks[taskIndex - 1].id);
                }
              }}
              disabled={!allTasks || taskIndex <= 0}
              title="Previous Task (← Arrow Key)"
            >
              ← Previous
            </button>
            <button 
              className="nav-button next-button"
              onClick={() => {
                if (allTasks && taskIndex < allTasks.length - 1 && allTasks[taskIndex + 1]) {
                  onNavigateToTask(allTasks[taskIndex + 1].id);
                }
              }}
              disabled={!allTasks || taskIndex >= allTasks.length - 1}
              title="Next Task (→ Arrow Key)"
            >
              Next →
            </button>
          </div>
          {!isHistorical && onEdit && (
            <button 
              className={`edit-button ${task.status === 'completed' ? 'disabled' : ''}`}
              onClick={task.status === 'completed' ? undefined : onEdit}
              disabled={task.status === 'completed'}
              title={task.status === 'completed' ? 'Cannot edit completed task' : 'Edit Task'}
            >
              ✏️ Edit Task
            </button>
          )}
          <button className="back-button" onClick={onBack}>
            ← {isHistorical ? 'Back to Task History' : 'Back to Tasks'}
          </button>
        </div>
      </div>
      
      <div className="task-detail-content">
        <div className="task-detail-section">
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className={`status-badge status-${task.status}`} style={{ backgroundColor: getStatusColor(task.status) }}>
              {task.status?.replace('_', ' ')}
            </span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Agent:</span>
            <span className="detail-value">{task.agent || 'No agent assigned'}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">ID:</span>
            <span className="detail-value monospace">{task.id}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Created:</span>
            <span className="detail-value">{formatDate(task.createdAt)}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Updated:</span>
            <span className="detail-value">{formatDate(task.updatedAt)}</span>
          </div>
          
          {task.completedAt && (
            <>
              <div className="detail-row">
                <span className="detail-label">Completed:</span>
                <span className="detail-value">{formatDate(task.completedAt)}</span>
              </div>
              {timeTaken && (
                <div className="detail-row">
                  <span className="detail-label">Total time taken:</span>
                  <span className="detail-value">{timeTaken}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="task-detail-section">
          <h3>{t('description')}</h3>
          <div className="detail-content">{task.description || t('noDescriptionProvided')}</div>
        </div>

        {task.notes && (
          <div className="task-detail-section">
            <h3>Notes</h3>
            <div className="detail-content">{task.notes}</div>
          </div>
        )}

        {task.implementationGuide && (
          <div className="task-detail-section">
            <h3>Implementation Guide</h3>
            <div className="detail-content">{task.implementationGuide}</div>
          </div>
        )}

        {task.verificationCriteria && (
          <div className="task-detail-section">
            <h3>Verification Criteria</h3>
            <div className="detail-content">{task.verificationCriteria}</div>
          </div>
        )}

        {task.summary && (
          <div className="task-detail-section">
            <h3>Summary</h3>
            <TaskSummary 
              summary={task.summary} 
              expandable={task.summary.length > 1000} 
              initiallyExpanded={task.summary.length <= 1000}
            />
          </div>
        )}

        {task.completionDetails && (
          <div className="task-detail-section">
            <CompletionDetailsView completionDetails={task.completionDetails} />
          </div>
        )}

        {task.analysisResult && (
          <div className="task-detail-section">
            <h3>Analysis Result</h3>
            <div className="detail-content">{task.analysisResult}</div>
          </div>
        )}

        {task.dependencies && task.dependencies.length > 0 && (
          <div className="task-detail-section">
            <h3>Dependencies</h3>
            <div className="dependencies-list">
              {task.dependencies.map((dep, idx) => {
                // Handle both string IDs and object dependencies
                let depId, depName;
                if (typeof dep === 'string') {
                  depId = dep;
                  depName = null;
                } else if (dep && typeof dep === 'object') {
                  depId = dep.taskId || dep.id;
                  depName = dep.name;
                } else {
                  return null;
                }
                
                // Find the task number for this dependency
                const depTaskIndex = allTasks ? allTasks.findIndex(t => t.id === depId) : -1;
                const taskNumber = depTaskIndex >= 0 ? `TASK ${depTaskIndex + 1}` : 'TASK ?';
                
                return (
                  <span 
                    key={idx}
                    className="task-number dependency-badge"
                    onClick={() => onNavigateToTask(depId)}
                    title={`${depId}${depName ? ` - ${depName}` : ''}`}
                  >
                    {taskNumber}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {task.relatedFiles && task.relatedFiles.length > 0 && (
          <div className="task-detail-section">
            <h3>Related Files</h3>
            <div className="related-files-list">
              {task.relatedFiles.map((file, idx) => (
                <div key={idx} className="related-file-item">
                  <span className="file-type-icon">{getFileTypeIcon(file.type)}</span>
                  <div className="file-info">
                    <div 
                      className="file-path monospace file-link"
                      onClick={(e) => {
                        // Copy the full file path to clipboard
                        const fullPath = projectRoot ? `${projectRoot}/${file.path}` : file.path;
                        navigator.clipboard.writeText(fullPath);
                        
                        // Show feedback
                        const element = e.currentTarget;
                        element.classList.add('copied');
                        setTimeout(() => {
                          element.classList.remove('copied');
                        }, 2000);
                      }}
                      title={projectRoot ? `Click to copy: ${projectRoot}/${file.path}` : `Click to copy: ${file.path}`}
                    >
                      {file.path}
                    </div>
                    {file.description && (
                      <div className="file-description">{file.description}</div>
                    )}
                    {(file.lineStart || file.lineEnd) && (
                      <div className="file-lines">
                        Lines: {file.lineStart || '?'} - {file.lineEnd || '?'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        
        <div className="keyboard-shortcuts-hint">
          <span className="shortcut-label">Keyboard shortcuts:</span>
          <span className="shortcut-item">← Previous</span>
          <span className="shortcut-item">→ Next</span>
          <span className="shortcut-item">ESC Back to list</span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom memoization comparison to prevent unnecessary re-renders
  return (
    prevProps.task?.id === nextProps.task?.id &&
    prevProps.task?.summary === nextProps.task?.summary &&
    prevProps.task?.completionDetails === nextProps.task?.completionDetails &&
    prevProps.taskIndex === nextProps.taskIndex &&
    prevProps.isHistorical === nextProps.isHistorical &&
    prevProps.projectRoot === nextProps.projectRoot
  );
});

TaskDetailView.displayName = 'TaskDetailView';

export default TaskDetailView;