import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';

function ChatAgent({ 
  currentPage, 
  currentTask, 
  tasks, 
  profileId,
  profileName,
  projectRoot,
  projectInnerTab,
  isInDetailView,
  showToast,
  onTaskUpdate 
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedAgents, setSelectedAgents] = useState({});
  const [availableAgents, setAvailableAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [openAIKey, setOpenAIKey] = useState('');
  const [agentsExpanded, setAgentsExpanded] = useState(() => {
    // Load expanded state from localStorage
    const saved = localStorage.getItem('chatAgentsExpanded');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [chatMode, setChatMode] = useState('normal'); // 'normal', 'expanded', 'floating'
  const [floatingPosition, setFloatingPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Load saved agent selections for this project
  const loadSavedSelections = () => {
    const saved = localStorage.getItem(`chatAgentSelections_${profileId}`);
    if (saved) {
      try {
        const selections = JSON.parse(saved);
        setSelectedAgents(selections);
      } catch {
        setSelectedAgents({ openai: true });
      }
    } else {
      setSelectedAgents({ openai: true });
    }
  };

  // Save agent selections for this project
  const saveSelections = (selections) => {
    localStorage.setItem(`chatAgentSelections_${profileId}`, JSON.stringify(selections));
  };

  // Load available agents and OpenAI key when profile changes
  useEffect(() => {
    if (profileId) {
      loadAvailableAgents();
      loadOpenAIKey();
      loadSavedSelections();
      
      // Clear messages when switching projects to avoid confusion
      setMessages([]);
    }
  }, [profileId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Store previous context to detect significant changes
  const prevContextRef = useRef({ profileId, projectInnerTab, isInDetailView });
  
  // Handle context changes (tab switches, detail view changes)
  useEffect(() => {
    const prevContext = prevContextRef.current;
    const contextChanged = 
      prevContext.projectInnerTab !== projectInnerTab ||
      prevContext.isInDetailView !== isInDetailView;
    
    if (contextChanged && messages.length > 0) {
      // Add a system message about context change
      const contextMessage = {
        id: Date.now(),
        role: 'system',
        content: t('chat.contextSwitched', { context: `${currentPage}${currentTask ? ' - ' + currentTask.name : ''}` }),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, contextMessage]);
    }
    
    // Update ref for next comparison
    prevContextRef.current = { profileId, projectInnerTab, isInDetailView };
  }, [projectInnerTab, isInDetailView, currentPage, currentTask, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadOpenAIKey = async () => {
    try {
      const response = await fetch('/api/global-settings');
      if (response.ok) {
        const settings = await response.json();
        setOpenAIKey(settings.openAIKey || '');
      }
    } catch (err) {
      console.error('Error loading OpenAI key:', err);
    }
  };

  const loadAvailableAgents = async () => {
    if (!profileId) return;
    
    setAgentsLoading(true);
    try {
      // Load combined list of global and project agents
      const response = await fetch(`/api/agents/combined/${profileId}`);
      if (response.ok) {
        const agents = await response.json();
        console.log('Loaded agents for chat:', agents);
        
        // Transform agent data for display
        const formattedAgents = agents.map(agent => {
          // Debug log to see what we're getting
          console.log('Agent metadata:', agent.name, agent.metadata);
          
          return {
            id: agent.name.replace(/\.(md|yaml|yml)$/, ''), // Remove file extension for ID
            name: agent.metadata?.name || agent.name.replace(/\.(md|yaml|yml)$/, '').replace(/-/g, ' '),
            description: agent.metadata?.description || '',
            type: agent.type,
            color: agent.metadata?.color || null,
            tools: agent.metadata?.tools || []
          };
        });
        
        setAvailableAgents(formattedAgents);
      }
    } catch (err) {
      console.error('Error loading agents:', err);
      setAvailableAgents([]);
    } finally {
      setAgentsLoading(false);
    }
  };

  // Memoize the context to avoid unnecessary recomputation
  const getPageContext = React.useCallback(() => {
    const context = {
      currentPage,
      timestamp: new Date().toISOString()
    };

    if (currentTask) {
      context.currentTask = {
        id: currentTask.id,
        name: currentTask.name,
        description: currentTask.description,
        status: currentTask.status,
        assignedAgent: currentTask.assignedAgent || null,
        dependencies: currentTask.dependencies,
        relatedFiles: currentTask.relatedFiles,
        implementationGuide: currentTask.implementationGuide,
        verificationCriteria: currentTask.verificationCriteria,
        notes: currentTask.notes
      };
    }

    if (tasks && tasks.length > 0) {
      context.tasksSummary = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        pending: tasks.filter(t => t.status === 'pending').length
      };
      
      // Include full task list for list page
      if (currentPage === 'task-list' || currentPage === 'history') {
        context.tasks = tasks.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          status: t.status,
          assignedAgent: t.assignedAgent || null,
          dependencies: t.dependencies || [],
          implementationGuide: t.implementationGuide || '',
          verificationCriteria: t.verificationCriteria || '',
          notes: t.notes || '',
          relatedFiles: t.relatedFiles || []
        }));
        
        // Add specific completed tasks details for better summaries
        context.completedTasks = tasks
          .filter(t => t.status === 'completed')
          .map(t => ({
            name: t.name,
            description: t.description || '',
            summary: t.summary || ''
          }));
          
        context.inProgressTasks = tasks
          .filter(t => t.status === 'in_progress')
          .map(t => ({
            name: t.name,
            description: t.description || ''
          }));
          
        context.pendingTasks = tasks
          .filter(t => t.status === 'pending')
          .map(t => ({
            name: t.name,
            description: t.description || ''
          }));
          
        // Add agent assignment statistics
        const agentStats = {};
        tasks.forEach(task => {
          if (task.assignedAgent) {
            if (!agentStats[task.assignedAgent]) {
              agentStats[task.assignedAgent] = {
                total: 0,
                completed: 0,
                inProgress: 0,
                pending: 0,
                tasks: []
              };
            }
            agentStats[task.assignedAgent].total++;
            agentStats[task.assignedAgent][task.status === 'in_progress' ? 'inProgress' : task.status]++;
            agentStats[task.assignedAgent].tasks.push({
              name: task.name,
              status: task.status
            });
          }
        });
        
        context.agentAssignments = agentStats;
        
        // Count unassigned tasks
        const unassignedTasks = tasks.filter(t => !t.assignedAgent);
        context.unassignedTasks = {
          total: unassignedTasks.length,
          completed: unassignedTasks.filter(t => t.status === 'completed').length,
          inProgress: unassignedTasks.filter(t => t.status === 'in_progress').length,
          pending: unassignedTasks.filter(t => t.status === 'pending').length,
          tasks: unassignedTasks.map(t => ({ name: t.name, status: t.status }))
        };
      }
    }
    
    // Always include available agents information
    if (availableAgents && availableAgents.length > 0) {
      context.availableAgents = availableAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description || 'No description available',
        type: agent.type,
        color: agent.color,
        tools: agent.tools || []
      }));
    }

    return context;
  }, [currentPage, currentTask, tasks, availableAgents]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const selectedAgentsList = Object.entries(selectedAgents)
        .filter(([_, selected]) => selected)
        .map(([agentId, _]) => agentId);

      if (selectedAgentsList.length === 0) {
        throw new Error(t('chat.selectAgentError'));
      }

      const contextData = getPageContext();
      console.log('Sending context to AI:', contextData);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          agents: selectedAgentsList,
          context: contextData,
          profileId,
          openAIKey,
          availableAgents: availableAgents
        })
      });

      if (!response.ok) {
        throw new Error(t('chat.responseError'));
      }

      const data = await response.json();
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        agents: data.respondingAgents || selectedAgentsList,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle task modifications if suggested
      if (data.taskModification && currentTask) {
        console.log('Task modification received:', data.taskModification);
        
        const shouldModify = window.confirm(
          t('chat.modifyConfirm')
        );
        
        if (shouldModify && onTaskUpdate) {
          console.log('Applying task modification:', currentTask.id, data.taskModification);
          const success = await onTaskUpdate(currentTask.id, data.taskModification);
          if (success) {
            showToast(t('chat.taskUpdatedSuccess'), 'success');
          } else {
            showToast(t('chat.taskUpdateFailed'), 'error');
          }
        }
      }

    } catch (err) {
      console.error('Error sending message:', err);
      showToast(err.message || t('chat.sendError'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAgent = (agentId) => {
    setSelectedAgents(prev => {
      const newSelections = {
        ...prev,
        [agentId]: !prev[agentId]
      };
      saveSelections(newSelections);
      return newSelections;
    });
  };

  const toggleAgentsExpanded = () => {
    const newState = !agentsExpanded;
    setAgentsExpanded(newState);
    localStorage.setItem('chatAgentsExpanded', JSON.stringify(newState));
  };

  // Handle chat mode changes
  const handleModeChange = (mode) => {
    setChatMode(mode);
    if (mode === 'floating') {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  // Drag functionality for floating mode
  const handleMouseDown = (e) => {
    if (chatMode === 'floating' && e.target.closest('.chat-agent-header')) {
      setIsDragging(true);
      const rect = chatRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && chatMode === 'floating') {
      setFloatingPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isOpen) {
    return (
      <button
        className="chat-agent-fab"
        onClick={() => setIsOpen(true)}
        title={t('chat.openTooltip')}
      >
        💬
      </button>
    );
  }

  return (
    <div 
      ref={chatRef}
      className={`chat-agent-container ${isMinimized ? 'minimized' : ''} ${chatMode}`}
      style={chatMode === 'floating' ? {
        position: 'fixed',
        left: floatingPosition.x,
        top: floatingPosition.y,
        right: 'auto',
        bottom: 'auto'
      } : {}}
      onMouseDown={handleMouseDown}
    >
      <div className={`chat-agent-header ${chatMode === 'floating' ? 'draggable' : ''}`}>
        <div className="chat-agent-title">
          <span className="chat-icon">🤖</span>
          <span>{t('chat.title')}</span>
          <span className="chat-mode-indicator">
            {chatMode === 'expanded' && '📐'}
            {chatMode === 'floating' && '🪟'}
          </span>
        </div>
        <div className="chat-agent-controls">
          <button
            className="chat-control-btn"
            onClick={() => handleModeChange(chatMode === 'normal' ? 'expanded' : 'normal')}
            title={chatMode === 'normal' ? t('chat.controls.expandWidth') : t('chat.controls.normalWidth')}
          >
            {chatMode === 'normal' ? '⟷' : '⟵'}
          </button>
          <button
            className="chat-control-btn"
            onClick={() => handleModeChange(chatMode === 'floating' ? 'normal' : 'floating')}
            title={chatMode === 'floating' ? t('chat.controls.dockToCorner') : t('chat.controls.popOutWindow')}
          >
            {chatMode === 'floating' ? '📌' : '🪟'}
          </button>
          <button
            className="chat-control-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? t('chat.controls.expand') : t('chat.controls.minimize')}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button
            className="chat-control-btn"
            onClick={() => setIsOpen(false)}
            title={t('chat.controls.close')}
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="chat-agent-agents">
            <div className="agents-selection-header">
              <div className="agents-header-row" onClick={toggleAgentsExpanded}>
                <span className="agents-label">
                  <span className="expand-chevron">{agentsExpanded ? '▼' : '▶'}</span>
                  {t('chat.chatWith')}
                  {agentsLoading && <span className="agents-loading"> {t('chat.loadingAgents')}</span>}
                </span>
                <span className="agents-count">
                  {Object.values(selectedAgents).filter(v => v).length} {t('chat.selected')}
                </span>
              </div>
              {agentsExpanded && (
                <div className="agents-checkboxes">
                <label className="agent-checkbox" title="OpenAI GPT-4 - General purpose AI assistant">
                  <input
                    type="checkbox"
                    checked={selectedAgents.openai || false}
                    onChange={() => toggleAgent('openai')}
                  />
                  <span className="agent-name openai-agent">
                    🤖 OpenAI GPT-4
                  </span>
                </label>
                {availableAgents.map(agent => (
                  <label 
                    key={agent.id} 
                    className="agent-checkbox" 
                    title={`${agent.name}\n${agent.description || 'No description available'}\nType: ${agent.type === 'project' ? 'Project' : 'Global'} agent${agent.tools && agent.tools.length > 0 ? '\nTools: ' + agent.tools.join(', ') : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAgents[agent.id] || false}
                      onChange={() => toggleAgent(agent.id)}
                    />
                    <span 
                      className={`agent-name ${agent.type}`}
                      style={agent.color ? { 
                        backgroundColor: `${agent.color}33`,  // 20% opacity
                        color: agent.color,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: `1px solid ${agent.color}66`,  // 40% opacity
                        fontWeight: '500'
                      } : {}}
                    >
                      🤖 {agent.name || agent.id}
                    </span>
                  </label>
                ))}
                {!agentsLoading && availableAgents.length === 0 && (
                  <span className="no-agents-message">{t('chat.noAgentsFound')}</span>
                )}
              </div>
              )}
            </div>
          </div>

          <div className="chat-agent-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <p>{t('chat.welcome')}</p>
                <ul>
                  {currentPage === 'task-list' && (
                    <li>{t('chat.welcomeTaskList')}</li>
                  )}
                  {currentPage === 'task-detail' && currentTask && (
                    <li>{t('chat.welcomeTaskDetail', { taskName: currentTask.name })}</li>
                  )}
                  {currentPage === 'history' && (
                    <li>{t('chat.welcomeHistory')}</li>
                  )}
                  <li>{t('chat.welcomeAssignment')}</li>
                  <li>{t('chat.welcomeWorkload')}</li>
                  <li>{t('chat.welcomeQuestions')}</li>
                  {currentTask && <li>{t('chat.welcomeModify')}</li>}
                </ul>
                <p className="chat-context-info">
                  <strong>{t('chat.contextProject')}</strong> {profileName || profileId}<br/>
                  <strong>{t('chat.contextContext')}</strong> {currentPage}
                  {currentTask && ` - Task: ${currentTask.name}`}<br/>
                  <strong>{t('chat.contextAvailableAgents')}</strong> {availableAgents.length + 1} (OpenAI + {availableAgents.length} {t('chat.projectAgents')})
                </p>
              </div>
            )}
            
            {messages.map(message => (
              <div key={message.id} className={`chat-message ${message.role}`}>
                {message.role === 'system' ? (
                  <div className="system-message">
                    <span className="system-icon">ℹ️</span>
                    <span className="system-text">{message.content}</span>
                  </div>
                ) : (
                  <>
                    <div className="message-header">
                      <span className="message-role">
                        {message.role === 'user' ? '👤 You' : '🤖 AI'}
                      </span>
                      {message.agents && message.agents.length > 0 && (
                        <span className="message-agents">
                          ({message.agents.join(', ')})
                        </span>
                      )}
                    </div>
                    <div className="message-content">
                      {message.role === 'assistant' ? (
                        <MDEditor.Markdown
                          source={message.content}
                          style={{ 
                            whiteSpace: 'pre-wrap',
                            backgroundColor: 'transparent',
                            color: 'inherit'
                          }}
                        />
                      ) : (
                        message.content
                      )}
                    </div>
                    <div className="message-timestamp">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="chat-message assistant loading">
                <div className="message-content">
                  <span className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-agent-input">
            <textarea
              ref={chatInputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.inputPlaceholder')}
              disabled={isLoading}
              rows="2"
            />
            <button
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatAgent;