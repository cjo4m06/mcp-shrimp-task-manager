import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { useTranslation } from 'react-i18next';

function AgentViewer({ 
  agent, 
  onBack,
  onEdit,
  isGlobal = false,
  profileId = null
}) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getFileType = (filename) => {
    if (!filename) return 'Unknown';
    if (filename.toLowerCase().endsWith('.md')) return 'Markdown';
    if (filename.toLowerCase().endsWith('.yaml') || filename.toLowerCase().endsWith('.yml')) return 'YAML';
    return 'Unknown';
  };

  useEffect(() => {
    if (!agent) return;
    
    const fetchAgentContent = async () => {
      setLoading(true);
      setError('');
      
      try {
        const endpoint = isGlobal 
          ? `/api/agents/global/${encodeURIComponent(agent.name)}`
          : `/api/agents/project/${profileId}/${encodeURIComponent(agent.name)}`;
          
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to load agent: ${response.status}`);
        }
        
        const data = await response.json();
        setContent(data.content || '');
      } catch (err) {
        console.error('Error loading agent:', err);
        setError('Failed to load agent content: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgentContent();
  }, [agent, isGlobal, profileId]);

  if (!agent) {
    return null;
  }

  return (
    <div className="template-preview-view agent-viewer">
      <div className="template-preview-header">
        <div className="header-left">
          <h2>{t('viewAgent') || 'View Agent'}: {agent.name}</h2>
        </div>
        <div className="header-actions">
          {onEdit && (
            <button 
              className="primary-btn edit-btn"
              onClick={() => onEdit(agent)}
              title="Edit this agent"
            >
              ✏️ {t('editAgent') || 'Edit Agent'}
            </button>
          )}
          <button className="back-button" onClick={onBack} title="Back to agents list">
            ← {t('backToAgents') || 'Back to Agents'}
          </button>
        </div>
      </div>

      <div className="template-info-bar">
        <span className="template-source">
          {t('type') || 'Type'}: {getFileType(agent.name)}
        </span>
        {agent.description && (
          <span className="template-status">
            {agent.description}
          </span>
        )}
        <span className="template-path">
          {isGlobal 
            ? `[Claude Folder]/agents/${agent.name}`
            : `.claude/agents/${agent.name}`}
        </span>
      </div>

      {loading ? (
        <div className="template-preview-content">
          <div className="loading" style={{ padding: '40px', textAlign: 'center' }}>
            {t('loading') || 'Loading...'}
          </div>
        </div>
      ) : error ? (
        <div className="template-preview-content">
          <div className="error" style={{ padding: '40px', textAlign: 'center' }}>
            {error}
          </div>
        </div>
      ) : (
        <div className="template-preview-content" data-color-mode="dark">
          <div className="markdown-content wmde-markdown">
            <MDEditor.Markdown 
              source={content} 
              style={{ 
                padding: '20px',
                backgroundColor: 'transparent'
              }}
              rehypePlugins={[]}
            />
          </div>
        </div>
      )}

      <div className="template-preview-footer">
        <div className="activation-info">
          <h3>📄 {t('agentInfo') || 'Agent Information'}</h3>
          <p>
            {isGlobal 
              ? (t('globalAgentDesc') || 'This is a global agent available across all projects.')
              : (t('projectAgentDesc') || 'This is a project-specific agent.')}
          </p>
          <p>
            <strong>{t('filePath') || 'File Path'}:</strong> {' '}
            {isGlobal 
              ? `[Claude Folder]/agents/${agent.name}`
              : `.claude/agents/${agent.name}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AgentViewer;