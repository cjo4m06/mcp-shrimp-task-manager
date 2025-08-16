import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

function TemplatePreview({ 
  template, 
  onBack,
  onActivate,
  onEdit,
  activating = false
}) {
  if (!template) {
    return null;
  }

  const handleActivate = () => {
    if (onActivate) {
      onActivate(template);
    }
  };

  return (
    <div className="template-preview-view">
      <div className="template-preview-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack} title="Back to template list">
            ← Back to Templates
          </button>
          <h2>Preview: {template.functionName || template.name}</h2>
        </div>
        <div className="header-actions">
          <button 
            className="primary-btn edit-btn"
            onClick={() => {
              if (onEdit) {
                onEdit(template);
              }
            }}
            title="Edit this template"
          >
            ✏️ Edit Template
          </button>
          {template.status !== 'default' && (
            <button 
              className="primary-btn activate-btn"
              onClick={handleActivate}
              disabled={activating}
              title="Activate this template by setting environment variable"
            >
              {activating ? 'Activating...' : '🚀 Activate Template'}
            </button>
          )}
        </div>
      </div>

      <div className="template-info-bar">
        <span className={`template-status status-${template.status}`}>
          Status: {template.status}
        </span>
        {template.source && (
          <span className="template-source">
            Source: {template.source}
          </span>
        )}
      </div>

      <div className="template-preview-content" data-color-mode="dark">
        <div className="markdown-content wmde-markdown">
          <MDEditor.Markdown 
            source={template.content || ''} 
            style={{ 
              padding: '20px',
              backgroundColor: 'transparent'
            }}
            rehypePlugins={[]}
          />
        </div>
      </div>

      {template.status !== 'default' && (
        <div className="template-preview-footer">
          <div className="activation-info">
            <h3>🔧 Activation Instructions</h3>
            <p>Clicking "Activate Template" will:</p>
            <ol>
              <li>Copy the environment variable to your clipboard</li>
              <li>Show you how to apply it</li>
              <li>Require a Claude restart to take effect</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default TemplatePreview;