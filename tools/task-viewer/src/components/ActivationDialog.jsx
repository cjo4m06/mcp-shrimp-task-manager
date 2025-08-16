import React, { useState } from 'react';

function ActivationDialog({ template, onClose }) {
  const [copiedSection, setCopiedSection] = useState('');
  
  if (!template) return null;

  // Generate environment variable name
  const functionName = template.functionName || template.name || '';
  const envVarName = `MCP_PROMPT_${functionName.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
  
  // Escape content for shell
  const escapeForShell = (str) => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\$/g, '\\$')
      .replace(/`/g, '\\`')
      .replace(/\n/g, '\\n');
  };
  
  const escapedContent = escapeForShell(template.content || '');
  
  // Generate commands for different scenarios
  const exportCommand = `export ${envVarName}="${escapedContent}"`;
  
  const bashCommand = `echo 'export ${envVarName}="${escapedContent}"' >> ~/.bashrc && source ~/.bashrc`;
  
  const zshCommand = `echo 'export ${envVarName}="${escapedContent}"' >> ~/.zshrc && source ~/.zshrc`;
  
  const envFileCommand = `echo '${envVarName}="${escapedContent}"' >> .env`;
  
  // Commands to check and remove existing entries
  const sedBashCommand = `sed -i '/${envVarName}=/d' ~/.bashrc && echo 'export ${envVarName}="${escapedContent}"' >> ~/.bashrc && source ~/.bashrc`;
  
  const sedZshCommand = `sed -i '/${envVarName}=/d' ~/.zshrc && echo 'export ${envVarName}="${escapedContent}"' >> ~/.zshrc && source ~/.zshrc`;

  const handleCopy = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="activation-dialog-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="activation-dialog">
        <div className="activation-dialog-header">
          <h2>🚀 Activate Template: {functionName}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        
        <div className="activation-dialog-body">
          <div className="activation-info-box">
            <h3>📋 What is an Environment Variable?</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '15px' }}>
              Environment variables are settings that programs can read when they start. The MCP server checks for 
              custom template variables to override its default prompts. By setting <code>{envVarName}</code>, 
              you're telling the MCP server to use your edited template instead of the built-in one.
            </p>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '15px' }}>
              <strong>Why do we need this?</strong> When Claude starts the MCP server, it reads these environment 
              variables to customize how it responds. Without setting this variable, your template edits won't be used.
            </p>
            <div style={{ background: '#1a1f36', padding: '12px', borderRadius: '6px', marginTop: '15px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#8892b0' }}>
                <strong>Your template will be exported as:</strong>
              </p>
              <code className="env-var-name" style={{ fontSize: '16px', display: 'block', marginTop: '8px' }}>{envVarName}</code>
            </div>
          </div>

          <div className="activation-section" style={{ marginTop: '20px' }}>
            <h3>🚀 How to Set This Variable</h3>
            <p style={{ fontSize: '14px', marginBottom: '15px' }}>
              Choose the appropriate command below based on your setup. These commands will export the variable 
              to your shell configuration file (like ~/.bashrc or ~/.zshrc) so it's available when Claude starts.
            </p>
          </div>

          <div className="activation-section">
            <h3>1️⃣ Temporary (Current Session Only)</h3>
            <p>Copy and paste this command into your terminal to set the custom template for your current session only:</p>
            <div className="command-box">
              <pre>{exportCommand}</pre>
              <button 
                className={`copy-btn ${copiedSection === 'temp' ? 'copied' : ''}`}
                onClick={() => handleCopy(exportCommand, 'temp')}
              >
                {copiedSection === 'temp' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#f39c12', marginTop: '10px' }}>
              ⚠️ <strong>Note:</strong> This is temporary! The custom template will only work until you close your terminal 
              or log out. When you open a new terminal session, you'll need to run this command again. For permanent setup, 
              use options 2 or 3 below.
            </p>
          </div>

          <div className="activation-section">
            <h3>2️⃣ Permanent for Bash (~/.bashrc) - Recommended</h3>
            <p>This command removes any existing {envVarName} entries before adding the new one, preventing duplicates:</p>
            <div className="command-box">
              <pre>{sedBashCommand}</pre>
              <button 
                className={`copy-btn ${copiedSection === 'bash-sed' ? 'copied' : ''}`}
                onClick={() => handleCopy(sedBashCommand, 'bash-sed')}
              >
                {copiedSection === 'bash-sed' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <details>
              <summary>Alternative: Simple append (may create duplicates)</summary>
              <p style={{ fontSize: '13px', color: '#95a5a6', marginTop: '10px' }}>
                This simpler command just appends to ~/.bashrc. If run multiple times, it will create duplicate entries.
              </p>
              <div className="command-box">
                <pre>{bashCommand}</pre>
                <button 
                  className={`copy-btn ${copiedSection === 'bash' ? 'copied' : ''}`}
                  onClick={() => handleCopy(bashCommand, 'bash')}
                >
                  {copiedSection === 'bash' ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </details>
          </div>

          <div className="activation-section">
            <h3>3️⃣ Permanent for Zsh (~/.zshrc) - Recommended</h3>
            <p>This command removes any existing {envVarName} entries before adding the new one, preventing duplicates:</p>
            <div className="command-box">
              <pre>{sedZshCommand}</pre>
              <button 
                className={`copy-btn ${copiedSection === 'zsh-sed' ? 'copied' : ''}`}
                onClick={() => handleCopy(sedZshCommand, 'zsh-sed')}
              >
                {copiedSection === 'zsh-sed' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <details>
              <summary>Alternative: Simple append (may create duplicates)</summary>
              <p style={{ fontSize: '13px', color: '#95a5a6', marginTop: '10px' }}>
                This simpler command just appends to ~/.zshrc. If run multiple times, it will create duplicate entries.
              </p>
              <div className="command-box">
                <pre>{zshCommand}</pre>
                <button 
                  className={`copy-btn ${copiedSection === 'zsh' ? 'copied' : ''}`}
                  onClick={() => handleCopy(zshCommand, 'zsh')}
                >
                  {copiedSection === 'zsh' ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </details>
          </div>

          <div className="activation-section">
            <h3>4️⃣ Project .env File</h3>
            <p>
              Add to your MCP server's .env file <span style={{ color: '#f39c12' }}>(typically in the mcp-shrimp-task-manager root directory)</span>:
            </p>
            <div className="command-box">
              <pre>{envFileCommand}</pre>
              <button 
                className={`copy-btn ${copiedSection === 'env' ? 'copied' : ''}`}
                onClick={() => handleCopy(envFileCommand, 'env')}
              >
                {copiedSection === 'env' ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#95a5a6', marginTop: '10px' }}>
              Note: The .env file should be in the directory where the MCP server is launched from. 
              If it doesn't exist, create it in the mcp-shrimp-task-manager root directory.
            </p>
          </div>

          <div className="activation-warning">
            <h3>⚠️ Important Notes</h3>
            <ul>
              <li>After setting the environment variable, you must <strong>restart Claude Code</strong> for changes to take effect</li>
              <li>The "Remove old entries" commands use sed to prevent duplicate environment variable definitions</li>
              <li>Check your current shell with: <code>echo $SHELL</code></li>
              <li>Verify the variable is set with: <code>echo ${envVarName}</code></li>
            </ul>
          </div>
        </div>

        <div className="activation-dialog-footer">
          <button className="primary-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActivationDialog;