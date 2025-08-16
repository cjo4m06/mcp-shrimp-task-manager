import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function TaskEditView({ task, onBack, projectRoot, profileId, onNavigateToTask, taskIndex, allTasks, onSave }) {
  const { t } = useTranslation();
  const [editedTask, setEditedTask] = useState({
    description: task.description || '',
    notes: task.notes || '',
    implementationGuide: task.implementationGuide || '',
    verificationCriteria: task.verificationCriteria || '',
    agent: task.agent || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [availableAgents, setAvailableAgents] = useState([]);

  // Load available agents on mount
  useEffect(() => {
    const loadAgents = async () => {
      if (!profileId) return;
      
      try {
        const response = await fetch(`/api/agents/combined/${profileId}`);
        if (response.ok) {
          const agents = await response.json();
          setAvailableAgents(agents);
        }
      } catch (err) {
        console.error('Error loading agents:', err);
      }
    };
    
    loadAgents();
  }, [profileId]);

  const formatDate = (dateStr) => {
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

  const handleInputChange = (field, value) => {
    setEditedTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    console.log('Saving task with profileId:', profileId);
    console.log('Task data:', { taskId: task.id, updates: editedTask });
    
    // Check if profileId is provided
    if (!profileId) {
      setError('Profile ID is missing. Please try again.');
      setIsSaving(false);
      return;
    }
    
    try {
      const url = `/api/tasks/${profileId}/update`;
      console.log('Calling API:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          updates: editedTask
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      if (onSave) {
        onSave(editedTask);
      }
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="task-detail-view edit-mode">
      <div className="task-detail-header">
        <h2>
          <span className="task-number">TASK {taskIndex + 1}</span>
          {task.name}
          <span className="edit-badge">EDITING</span>
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
        </div>

        <div className="task-detail-section">
          <h3>{t('description')}</h3>
          <textarea
            className="edit-textarea"
            value={editedTask.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter task description..."
            rows={4}
          />
        </div>

        <div className="task-detail-section">
          <h3>Notes</h3>
          <textarea
            className="edit-textarea"
            value={editedTask.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Enter notes..."
            rows={3}
          />
        </div>

        <div className="task-detail-section">
          <h3>Implementation Guide</h3>
          <textarea
            className="edit-textarea"
            value={editedTask.implementationGuide}
            onChange={(e) => handleInputChange('implementationGuide', e.target.value)}
            placeholder="Enter implementation guide..."
            rows={6}
          />
        </div>

        <div className="task-detail-section">
          <h3>Verification Criteria</h3>
          <textarea
            className="edit-textarea"
            value={editedTask.verificationCriteria}
            onChange={(e) => handleInputChange('verificationCriteria', e.target.value)}
            placeholder="Enter verification criteria..."
            rows={4}
          />
        </div>

        <div className="task-detail-section">
          <h3>Assigned Agent</h3>
          <select
            className="agent-select"
            value={editedTask.agent}
            onChange={(e) => handleInputChange('agent', e.target.value)}
          >
            <option value="">No agent assigned</option>
            {availableAgents.map((agent) => {
              // Remove file extension from agent name for display and value
              const agentBaseName = agent.name.replace(/\.(md|yaml|yml)$/, '');
              return (
                <option key={agent.name} value={agentBaseName}>
                  {agentBaseName} {agent.description ? `- ${agent.description.substring(0, 100)}${agent.description.length > 100 ? '...' : ''}` : ''}
                </option>
              );
            })}
          </select>
        </div>

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
                        const fullPath = projectRoot ? `${projectRoot}/${file.path}` : file.path;
                        navigator.clipboard.writeText(fullPath);
                        
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

        <div className="edit-actions">
          {error && (
            <div className="error-message">{error}</div>
          )}
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            className="cancel-button"
            onClick={onBack}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskEditView;