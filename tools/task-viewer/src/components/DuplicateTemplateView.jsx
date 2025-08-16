import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

function DuplicateTemplateView({ template, onBack, onConfirm }) {
  const { t } = useTranslation();
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [duplicating, setDuplicating] = useState(false);
  
  if (!template) {
    return (
      <div className="duplicate-template-view">
        <div className="duplicate-template-header">
          <button className="back-button" onClick={onBack}>
            {t('backToTemplates')}
          </button>
          <h2>{t('noTemplateSelected')}</h2>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      setError(t('pleaseEnterDuplicateName'));
      return;
    }
    
    if (newName.trim() === template.functionName) {
      setError(t('duplicateNameMustBeDifferent'));
      return;
    }
    
    setDuplicating(true);
    try {
      await onConfirm(newName.trim());
    } catch (err) {
      setError(t('failedToDuplicateTemplate') + ': ' + err.message);
      setDuplicating(false);
    }
  };

  return (
    <div className="duplicate-template-view">
      <div className="duplicate-template-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack} title={t('backToTemplateList')}>
            {t('backToTemplates')}
          </button>
          <h2>{t('duplicateTemplate')}: {template.functionName || template.name}</h2>
        </div>
      </div>

      <div className="duplicate-template-content">
        <div className="duplicate-info-section">
          <h3>{t('whyDuplicate')}</h3>
          <p>{t('duplicateExplanation')}</p>
          
          <div className="use-cases-grid">
            <div className="use-case-card">
              <h4>{t('createVariations')}</h4>
              <p>{t('createVariationsDesc')}</p>
              <ul>
                <li>Security-focused analysis</li>
                <li>Performance optimization</li>
                <li>Different project types</li>
                <li>Client-specific requirements</li>
              </ul>
            </div>
            
            <div className="use-case-card">
              <h4>{t('safeExperimentation')}</h4>
              <p>{t('safeExperimentationDesc')}</p>
              <ul>
                <li>Try new prompt strategies</li>
                <li>Experiment with different formats</li>
                <li>Test edge cases</li>
                <li>Keep a working backup</li>
              </ul>
            </div>
            
            <div className="use-case-card">
              <h4>{t('templateLibraries')}</h4>
              <p>{t('templateLibrariesDesc')}</p>
              <ul>
                <li>Department-specific templates</li>
                <li>Technology stack variations</li>
                <li>Language/framework specific</li>
                <li>Different complexity levels</li>
              </ul>
            </div>
            
            <div className="use-case-card">
              <h4>{t('versionManagement')}</h4>
              <p>{t('versionManagementDesc')}</p>
              <ul>
                <li>Stable vs experimental</li>
                <li>Quick vs thorough analysis</li>
                <li>Simple vs detailed output</li>
                <li>Before major changes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="duplicate-form-section">
          <h3>{t('createDuplicate')}</h3>
          
          <div className="original-template-info">
            <h4>{t('originalTemplate')}</h4>
            <div className="template-details">
              <div className="detail-row">
                <span className="label">Name:</span>
                <span className="value">{template.functionName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status-badge status-${template.status}`}>{template.status}</span>
              </div>
              {template.description && (
                <div className="detail-row">
                  <span className="label">Description:</span>
                  <span className="value">{template.description}</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="duplicate-form">
            <div className="form-group">
              <label htmlFor="newName">
                {t('newTemplateName')} <span className="required">{t('required')}</span>
              </label>
              <input
                type="text"
                id="newName"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError('');
                }}
                placeholder={`${template.functionName}_v2`}
                autoFocus
                disabled={duplicating}
              />
              {error && <div className="error-message">{error}</div>}
              <small className="form-hint">
                {t('nameHint')}
              </small>
            </div>

            <div className="duplicate-preview-section">
              <h4>{t('whatWillHappen')}</h4>
              <div className="preview-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <strong>{t('createNewTemplate')}</strong>
                    <p>A new custom template named <code>{newName || '[your-name-here]'}</code> will be created</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <strong>{t('copyContent')}</strong>
                    <p>All content from the original template will be copied exactly</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <strong>{t('independentEditing')}</strong>
                    <p>You can edit the duplicate without affecting the original</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <strong>{t('readyToUse')}</strong>
                    <p>The duplicate will appear in your template list as a custom template</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="primary-btn" 
                disabled={!newName.trim() || duplicating}
              >
                {duplicating ? t('creatingDuplicate') : t('createDuplicate')}
              </button>
              <button 
                type="button" 
                className="secondary-btn" 
                onClick={onBack}
                disabled={duplicating}
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DuplicateTemplateView;