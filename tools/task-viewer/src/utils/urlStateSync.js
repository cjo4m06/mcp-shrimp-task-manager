// URL State Synchronization Utilities

/**
 * Parse URL parameters and return state object
 */
export function parseUrlState() {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.slice(1); // Remove #
  
  return {
    // Main tab from hash (projects, release-notes, readme, templates)
    tab: hash || 'projects',
    // Profile/inner tab
    profile: params.get('profile'),
    // Inner project tab (tasks, history, settings)
    projectTab: params.get('view') || 'tasks',
    // Language
    lang: params.get('lang'),
    // History view state
    history: params.get('history'),
    // History date for specific date view
    historyDate: params.get('date'),
    // Template view state
    templateView: params.get('template-view'),
    templateId: params.get('template-id'),
    // Agent view state
    agentView: params.get('agent-view'),
    agentId: params.get('agent-id'),
    // Task view state
    taskView: params.get('task-view'),
    taskId: params.get('task-id')
  };
}

/**
 * Update URL based on current state
 */
export function updateUrl(state) {
  const params = new URLSearchParams();
  
  // Add profile if on projects tab
  if (state.tab === 'projects' && state.profile) {
    params.set('profile', state.profile);
    
    // Add project inner tab if not default (tasks)
    if (state.projectTab && state.projectTab !== 'tasks') {
      params.set('view', state.projectTab);
    }
  }
  
  // Add language if not default
  if (state.lang && state.lang !== 'en') {
    params.set('lang', state.lang);
  }
  
  // Add history view state (for history details within history tab)
  if (state.history) {
    params.set('history', state.history);
    if (state.historyDate) {
      params.set('date', state.historyDate);
    }
  }
  
  // Add template view state
  if (state.templateView && state.templateView !== 'list') {
    params.set('template-view', state.templateView);
    if (state.templateId) {
      params.set('template-id', state.templateId);
    }
  }
  
  // Add agent view state
  if (state.projectTab === 'agents' && state.agentView) {
    params.set('agent-view', state.agentView);
    if (state.agentId) {
      params.set('agent-id', state.agentId);
    }
  }
  
  // Add task view state
  if (state.projectTab === 'tasks' && state.taskView) {
    params.set('task-view', state.taskView);
    if (state.taskId) {
      params.set('task-id', state.taskId);
    }
  }
  
  // Build the URL
  const queryString = params.toString();
  const hash = state.tab || 'projects';
  const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}#${hash}`;
  
  // Update URL without reloading the page
  window.history.replaceState({ ...state }, '', newUrl);
}

/**
 * Push new state to browser history
 */
export function pushUrlState(state) {
  const params = new URLSearchParams();
  
  // Add profile if on projects tab
  if (state.tab === 'projects' && state.profile) {
    params.set('profile', state.profile);
    
    // Add project inner tab if not default (tasks)
    if (state.projectTab && state.projectTab !== 'tasks') {
      params.set('view', state.projectTab);
    }
  }
  
  // Add language if not default
  if (state.lang && state.lang !== 'en') {
    params.set('lang', state.lang);
  }
  
  // Add history view state (for history details within history tab)
  if (state.history) {
    params.set('history', state.history);
    if (state.historyDate) {
      params.set('date', state.historyDate);
    }
  }
  
  // Add template view state
  if (state.templateView && state.templateView !== 'list') {
    params.set('template-view', state.templateView);
    if (state.templateId) {
      params.set('template-id', state.templateId);
    }
  }
  
  // Add agent view state
  if (state.projectTab === 'agents' && state.agentView) {
    params.set('agent-view', state.agentView);
    if (state.agentId) {
      params.set('agent-id', state.agentId);
    }
  }
  
  // Add task view state
  if (state.projectTab === 'tasks' && state.taskView) {
    params.set('task-view', state.taskView);
    if (state.taskId) {
      params.set('task-id', state.taskId);
    }
  }
  
  // Build the URL
  const queryString = params.toString();
  const hash = state.tab || 'projects';
  const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}#${hash}`;
  
  // Push new state to history
  window.history.pushState({ ...state }, '', newUrl);
}

/**
 * Get initial state from URL or defaults
 */
export function getInitialUrlState(defaults = {}) {
  const urlState = parseUrlState();
  
  return {
    tab: urlState.tab || defaults.tab || 'projects',
    profile: urlState.profile || defaults.profile,
    projectTab: urlState.projectTab || defaults.projectTab || 'tasks',
    lang: urlState.lang || defaults.lang || 'en',
    history: urlState.history || null,
    historyDate: urlState.historyDate || null,
    templateView: urlState.templateView || 'list',
    templateId: urlState.templateId || null
  };
}

/**
 * Clean up URL state when switching tabs
 */
export function cleanUrlStateForTab(tab, currentState) {
  const cleanState = { ...currentState, tab };
  
  // Remove profile-specific params when not on projects tab
  if (tab !== 'projects') {
    delete cleanState.profile;
    delete cleanState.history;
    delete cleanState.historyDate;
  }
  
  // Remove template-specific params when not on templates tab
  if (tab !== 'templates') {
    delete cleanState.templateView;
    delete cleanState.templateId;
  }
  
  return cleanState;
}