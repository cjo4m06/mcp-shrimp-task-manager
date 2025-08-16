import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function DuplicateTemplateModal({ template, onClose, onConfirm }) {
  const { t } = useTranslation();
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  
  if (!template) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      setError(t('pleaseEnterDuplicateName'));
      return;
    }
    
    if (newName.trim() === template.functionName) {
      setError(t('duplicateNameMustBeDifferent'));
      return;
    }
    
    onConfirm(newName.trim());
  };

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal-content duplicate-modal">
        <div className="modal-header">
          <h2>📋 Duplicate Template</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="duplicate-info-section">
            <h3>Why Duplicate Templates?</h3>
            <p>Duplicating templates is useful for:</p>
            <ul>
              <li><strong>Creating Variations:</strong> Make specialized versions for different use cases (e.g., security-focused, performance-focused)</li>
              <li><strong>Safe Experimentation:</strong> Test changes without affecting your current working template</li>
              <li><strong>Building Template Libraries:</strong> Create collections of related templates for different projects or clients</li>
              <li><strong>Backup Before Changes:</strong> Keep a copy of a working template before making major modifications</li>
            </ul>
          </div>

          <div className="duplicate-form-section">
            <h3>Original Template</h3>
            <div className="template-info">
              <p><strong>Name:</strong> {template.functionName}</p>
              <p><strong>Status:</strong> <span className={`status-badge status-${template.status}`}>{template.status}</span></p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="newName">New Template Name *</label>
                <input
                  type="text"
                  id="newName"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setError('');
                  }}
                  placeholder={`${template.functionName}_copy`}
                  autoFocus
                />
                {error && <div className="error-message">{error}</div>}
                <small className="form-hint">
                  Choose a descriptive name that indicates the purpose of this duplicate
                </small>
              </div>

              <div className="duplicate-preview">
                <h4>What will happen:</h4>
                <ol>
                  <li>A new custom template will be created with the name: <code>{newName || '[your-name-here]'}</code></li>
                  <li>It will contain the exact same content as the original template</li>
                  <li>You can edit it independently without affecting the original</li>
                  <li>The new template will appear in your template list as a custom template</li>
                </ol>
              </div>

              <div className="modal-actions">
                <button type="submit" className="primary-btn" disabled={!newName.trim()}>
                  📋 Create Duplicate
                </button>
                <button type="button" className="secondary-btn" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DuplicateTemplateModal;