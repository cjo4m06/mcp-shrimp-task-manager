import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { useTranslation } from 'react-i18next';

function AgentEditor({ 
  agent, 
  onSave, 
  onBack,
  isGlobal = false,
  profileId = null,
  showToast,
  loading = false, 
  error = '' 
}) {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [initialColor, setInitialColor] = useState('');
  
  // Predefined color palette
  const colorPalette = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Gray', value: '#6b7280' }
  ];

  // Fetch agent content on mount
  useEffect(() => {
    if (!agent) return;
    
    const fetchAgentContent = async () => {
      setIsLoading(true);
      setLoadError('');
      
      try {
        const endpoint = isGlobal 
          ? `/api/agents/global/${encodeURIComponent(agent.name)}`
          : `/api/agents/project/${profileId}/${encodeURIComponent(agent.name)}`;
          
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to load agent: ${response.status}`);
        }
        
        const data = await response.json();
        const agentContent = data.content || '';
        setContent(agentContent);
        setInitialContent(agentContent);
        
        // Extract color from content metadata
        let extractedColor = '';
        if (agentContent.startsWith('---')) {
          const parts = agentContent.split('---');
          if (parts.length >= 3) {
            const metadata = parts[1];
            const colorMatch = metadata.match(/^color:\s*["']?([^"'\n]+)["']?/m);
            if (colorMatch) {
              extractedColor = colorMatch[1];
            }
          }
        }
        
        // Set color from extracted metadata or fallback sources
        if (extractedColor) {
          setSelectedColor(extractedColor);
          setInitialColor(extractedColor);
        } else if (data.metadata && data.metadata.color) {
          setSelectedColor(data.metadata.color);
          setInitialColor(data.metadata.color);
        } else if (agent.color) {
          setSelectedColor(agent.color);
          setInitialColor(agent.color);
        }
      } catch (err) {
        console.error('Error loading agent:', err);
        setLoadError('Failed to load agent content: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAgentContent();
  }, [agent, isGlobal, profileId]);

  // Helper function to update color in YAML metadata
  const updateContentWithColor = (content, color) => {
    // Check if content starts with metadata section (---)
    if (content.startsWith('---')) {
      const parts = content.split('---');
      if (parts.length >= 3) {
        // Extract metadata section
        let metadata = parts[1];
        const bodyContent = parts.slice(2).join('---');
        
        // Check if color property exists
        const colorRegex = /^color:\s*.*/m;
        if (colorRegex.test(metadata)) {
          // Update existing color
          if (color) {
            metadata = metadata.replace(colorRegex, `color: "${color}"`);
          } else {
            // Remove color line if no color selected
            metadata = metadata.replace(colorRegex, '');
          }
        } else if (color) {
          // Add color property
          metadata = metadata.trimEnd() + `\ncolor: "${color}"`;
        }
        
        return `---${metadata}---${bodyContent}`;
      }
    }
    
    // If no metadata section exists and color is selected, create one
    if (color) {
      return `---\ncolor: "${color}"\n---\n${content}`;
    }
    
    return content;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    setIsSaving(true);
    
    try {
      // Update content with color in metadata
      const updatedContent = updateContentWithColor(content.trim(), selectedColor);
      
      const endpoint = isGlobal 
        ? `/api/agents/global/${encodeURIComponent(agent.name)}`
        : `/api/agents/project/${profileId}/${encodeURIComponent(agent.name)}`;
        
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: updatedContent
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save agent: ${response.status}`);
      }
      
      if (showToast) {
        showToast(t('agentSavedSuccess') || 'Agent saved successfully', 'success');
      }
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(agent);
      }
      
      // Navigate back after successful save
      setTimeout(() => {
        onBack?.();
      }, 1000);
      
    } catch (err) {
      console.error('Error saving agent:', err);
      const errorMessage = 'Failed to save agent: ' + err.message;
      if (showToast) {
        showToast(errorMessage, 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!agent) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="template-editor-view agent-editor">
        <div className="template-editor-header">
          <div className="header-left">
            <h2>{t('editAgent') || 'Edit Agent'}: {agent.name}</h2>
          </div>
          <div className="header-actions">
            <button className="back-button" onClick={onBack} title="Back to agents list">
              ← {t('backToAgents') || 'Back to Agents'}
            </button>
          </div>
        </div>
        <div className="loading" style={{ padding: '40px', textAlign: 'center' }}>
          {t('loading') || 'Loading...'}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="template-editor-view agent-editor">
        <div className="template-editor-header">
          <div className="header-left">
            <h2>{t('editAgent') || 'Edit Agent'}: {agent.name}</h2>
          </div>
          <div className="header-actions">
            <button className="back-button" onClick={onBack} title="Back to agents list">
              ← {t('backToAgents') || 'Back to Agents'}
            </button>
          </div>
        </div>
        <div className="error" style={{ padding: '40px', textAlign: 'center' }}>
          {loadError}
        </div>
      </div>
    );
  }

  const hasChanges = content !== initialContent;

  return (
    <div className="template-editor-view agent-editor">
      <div className="template-editor-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack} title="Back to agents list">
            ← {t('backToAgents') || 'Back to Agents'}
          </button>
          <h2>{t('editAgent') || 'Edit Agent'}: {agent.name}</h2>
        </div>
      </div>

      <div className="template-info-bar">
        <span className="template-source">
          {t('type') || 'Type'}: {agent.type || 'Unknown'}
        </span>
        {agent.description && (
          <span className="template-status">
            {agent.description}
          </span>
        )}
        <div className="agent-color-selector">
          <label htmlFor="agent-color">{t('color') || 'Color'}:</label>
          <select 
            id="agent-color"
            value={selectedColor} 
            onChange={(e) => {
              const newColor = e.target.value;
              setSelectedColor(newColor);
              // Update content with new color
              setContent(updateContentWithColor(content, newColor));
            }}
            className="color-dropdown"
            style={selectedColor ? {
              backgroundColor: selectedColor,
              color: '#ffffff'
            } : {}}
          >
            <option value="">No color</option>
            {colorPalette.map((color) => (
              <option 
                key={color.value} 
                value={color.value}
                style={{
                  backgroundColor: color.value,
                  color: '#ffffff'
                }}
              >
                {color.name}
              </option>
            ))}
          </select>
        </div>
        <span className="template-path">
          {isGlobal 
            ? `[Claude Folder]/agents/${agent.name}`
            : `.claude/agents/${agent.name}`}
        </span>
      </div>

      {(error || loadError) && (
        <div className="error template-editor-error">
          {error || loadError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="template-editor-form">
        <div className="template-editor-content" data-color-mode="dark">
          <MDEditor
            key={agent?.name || 'agent-editor'}
            value={content || ''}
            onChange={(val) => setContent(val || '')}
            preview="live"
            height={500}
            hideToolbar={false}
            enableScroll={true}
            textareaProps={{
              placeholder: "Enter the agent content (markdown or YAML)..."
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
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="primary-btn"
            disabled={loading || isSaving || !content.trim() || !hasChanges}
          >
            {(loading || isSaving) ? (t('saving') || 'Saving...') : (t('save') || 'Save')}
          </button>
          <button
            type="button"
            className="secondary-btn"
            onClick={onBack}
            disabled={loading || isSaving}
          >
            {t('cancel') || 'Cancel'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AgentEditor;