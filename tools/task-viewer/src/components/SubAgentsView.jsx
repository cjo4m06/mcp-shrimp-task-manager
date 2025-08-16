import React from 'react';
import AgentsListView from './AgentsListView';

function SubAgentsView({ showToast, onNavigateToSettings, refreshTrigger }) {
  return (
    <AgentsListView
      title="🌍 Sub-Agents (Global)"
      subtitle={
        <>
          Manage global agents from Claude folder • {' '}
          <a 
            href="https://docs.anthropic.com/en/docs/claude-code/sub-agents" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#3498db', textDecoration: 'underline' }}
          >
            📚 Documentation
          </a>
        </>
      }
      isGlobal={true}
      profileId={null}
      projectRoot={null}
      showToast={showToast}
      refreshTrigger={refreshTrigger}
      onNavigateToSettings={onNavigateToSettings}
    />
  );
}

export default SubAgentsView;