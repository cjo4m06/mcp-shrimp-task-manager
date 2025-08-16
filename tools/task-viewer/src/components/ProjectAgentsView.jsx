import React from 'react';
import AgentsListView from './AgentsListView';

function ProjectAgentsView({ profileId, projectRoot, showToast, refreshTrigger, onAgentViewChange }) {
  return (
    <AgentsListView
      title="🤖 Project Agents"
      subtitle="Manage agents from .claude/agents directory"
      isGlobal={false}
      profileId={profileId}
      projectRoot={projectRoot}
      showToast={showToast}
      refreshTrigger={refreshTrigger}
      onAgentViewChange={onAgentViewChange}
    />
  );
}

export default ProjectAgentsView;