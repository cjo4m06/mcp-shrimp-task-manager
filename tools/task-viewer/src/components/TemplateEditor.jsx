import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { useTranslation } from 'react-i18next';

function TemplateEditor({ 
  template, 
  onSave, 
  onCancel,
  onActivate, 
  loading = false, 
  error = '' 
}) {
  const { t } = useTranslation();
  // Initialize with template content if available
  const [content, setContent] = useState(template?.content || '');
  const [mode, setMode] = useState(template?.status === 'custom+append' ? 'append' : 'override');
  const [validationError, setValidationError] = useState('');

  // Update content when template changes
  useEffect(() => {
    if (template) {
      console.log('Template data:', template);
      const newContent = template.content || '';
      console.log('Setting content to:', newContent);
      // Force update by using a callback
      setContent(() => newContent);
      
      // Determine mode based on template status
      if (template.status === 'custom+append') {
        setMode('append');
      } else {
        setMode('override');
      }
    }
  }, [template]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setValidationError('Template content cannot be empty');
      return;
    }

    setValidationError('');
    if (onSave) {
      onSave({
        ...template,
        content: content.trim(),
        mode
      });
    }
  };

  if (!template) {
    return null;
  }

  // Available parameters for reference
  const parameterHelp = `
**Available Parameters:**
- {description} - Task description
- {requirements} - Task requirements  
- {summary} - Task summary
- {task} - Task details
- {tasks} - Tasks grouped by status
- {allTasks} - All tasks
- {initialConcept} - Initial concept (analyzeTask)
- {analysis} - Analysis results (reflectTask)
- {updateMode} - Update mode (splitTasks)
- {dependencyTasks} - Dependency task summaries (executeTask)
- {complexityAssessment} - Complexity assessment (executeTask)
- {verificationCriteria} - Verification criteria
- {responseTitle} - Response title (clearAllTasks)
- {message} - Custom message
- {backupInfo} - Backup information
  `;

  return (
    <div className="template-editor-view">
      <div className="template-editor-header">
        <div className="header-left">
          <button className="back-button" onClick={onCancel} title="Back to template list">
            ← Back to Templates
          </button>
          <h2>Edit Template: {template.functionName || template.name}</h2>
        </div>
      </div>

        {error && (
          <div className="error template-editor-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="template-editor-form">
          <div className="template-editor-controls">
            <div className="mode-toggle">
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="override"
                  checked={mode === 'override'}
                  onChange={(e) => setMode(e.target.value)}
                />
                Override Mode
              </label>
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="append"
                  checked={mode === 'append'}
                  onChange={(e) => setMode(e.target.value)}
                />
                Append Mode
              </label>
            </div>
          </div>

          <div className="template-editor-content" data-color-mode="dark">
            <MDEditor
              key={template?.functionName || 'editor'}
              value={content || ''}
              onChange={(val) => {
                setContent(val || '');
                setValidationError('');
              }}
              preview="live"
              height={500}
              hideToolbar={false}
              enableScroll={true}
              textareaProps={{
                placeholder: mode === 'append' 
                  ? "Enter content to append to the default template..."
                  : "Enter the complete template content..."
              }}
              previewOptions={{
                components: {
                  code: ({inline, children, className, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="code-block-wrapper">
                        <pre className={className} {...props}>
                          <code>{children}</code>
                        </pre>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }
              }}
            />
            
            <div className="parameter-help-panel">
              <MDEditor.Markdown source={parameterHelp} />
            </div>
          </div>

          {validationError && (
            <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
              {validationError}
            </div>
          )}
          <div className="form-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={loading || !content.trim()}
            >
              {loading ? t('saving') : t('saveTemplate')}
            </button>
            {template?.status !== 'default' && onActivate && (
              <button
                type="button"
                className="primary-btn activate-btn"
                onClick={async (e) => {
                  e.preventDefault();
                  // First save the template
                  await onSave({
                    ...template,
                    content: content.trim(),
                    mode
                  });
                  // Then activate it
                  setTimeout(() => {
                    onActivate({
                      ...template,
                      content: content.trim(),
                      mode
                    });
                  }, 500);
                }}
                disabled={loading || !content.trim()}
                title="Save and activate this template"
              >
                🚀 Save & Activate
              </button>
            )}
            <button
              type="button"
              className="secondary-btn"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
    </div>
  );
}

export default TemplateEditor;