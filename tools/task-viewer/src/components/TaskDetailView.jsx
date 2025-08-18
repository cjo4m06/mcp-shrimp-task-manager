import React from 'react';

function TaskDetailView({ task, onBack, projectRoot, onNavigateToTask, taskIndex, allTasks }) {
  if (!task) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

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
    <div className="task-detail-view">
      <div className="task-detail-header">
        <h2>
          <span className="task-number">TASK {taskIndex + 1}</span>
          {task.name}
        </h2>
        <button className="back-button" onClick={onBack}>
          ← Back to Tasks
        </button>
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
            <div className="detail-row">
              <span className="detail-label">Completed:</span>
              <span className="detail-value">{formatDate(task.completedAt)}</span>
            </div>
          )}
        </div>

        <div className="task-detail-section">
          <h3>Description</h3>
          <div className="detail-content">{task.description || 'No description provided'}</div>
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
            <div className="detail-content">{task.summary}</div>
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
                
                console.log('Dependency:', dep, 'depId:', depId);
                console.log('All tasks:', allTasks);
                
                // Find the task number for this dependency
                const depTaskIndex = allTasks ? allTasks.findIndex(t => t.id === depId) : -1;
                const taskNumber = depTaskIndex >= 0 ? `TASK ${depTaskIndex + 1}` : 'TASK ?';
                
                console.log('Found task index:', depTaskIndex, 'Task number:', taskNumber);
                
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
      </div>
    </div>
  );
}

export default TaskDetailView;