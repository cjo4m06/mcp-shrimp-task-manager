import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function GlobalSettingsView({ showToast }) {
  const { t } = useTranslation();
  const [claudeFolderPath, setClaudeFolderPath] = useState('');
  const [openAIKey, setOpenAIKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings from server on mount
  useEffect(() => {
    loadGlobalSettings();
  }, []);


  const loadGlobalSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/global-settings');
      if (response.ok) {
        const settings = await response.json();
        setClaudeFolderPath(settings.claudeFolderPath || '');
        setOpenAIKey(settings.openAIKey || '');
      } else {
        console.error('Failed to load global settings');
        if (showToast) {
          showToast('Failed to load settings', 'error');
        }
      }
    } catch (err) {
      console.error('Error loading global settings:', err);
      if (showToast) {
        showToast('Error loading settings', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch('/api/global-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claudeFolderPath: claudeFolderPath,
          openAIKey: openAIKey,
        }),
      });

      if (response.ok) {
        if (showToast) {
          showToast(t('settingsSaved'), 'success');
        }
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving global settings:', err);
      if (showToast) {
        showToast('Error saving settings', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="content-container">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="content-container">
      <div className="settings-panel">
        <h2>{t('globalSettings')}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="claudeFolderPath">{t('claudeFolderPath')}:</label>
            <input
              type="text"
              id="claudeFolderPath"
              value={claudeFolderPath}
              onChange={(e) => setClaudeFolderPath(e.target.value)}
              placeholder={t('claudeFolderPathPlaceholder')}
              title={t('claudeFolderPath')}
              disabled={saving}
            />
            <span className="form-hint">
              {t('claudeFolderPathDesc')}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="openAIKey">
              OpenAI API Key
              {openAIKey && (
                <span style={{ 
                  marginLeft: '10px', 
                  fontSize: '12px', 
                  color: '#22c55e',
                  fontWeight: 'normal'
                }}>
                  ✓ Configured
                </span>
              )}
            </label>
            <div className="api-key-input-wrapper">
              <input
                type={showApiKey ? "text" : "password"}
                id="openAIKey"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="sk-proj-..."
                title="OpenAI API Key for AI agent assignment"
                disabled={saving}
                className="api-key-input"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="api-key-toggle"
                title={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <span className="form-hint">
              <strong>Used for:</strong> AI-powered agent assignment to automatically match agents to tasks.<br/>
              <strong>Get your key:</strong>{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                platform.openai.com/api-keys
              </a>
              {' '}(requires OpenAI account)
            </span>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? 'Saving...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GlobalSettingsView;