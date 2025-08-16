import React, { useState, useRef, useEffect } from 'react';

function AgentDropdown({ 
  value, 
  onChange, 
  agents = [], 
  disabled = false,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState(null);
  const dropdownRef = useRef(null);
  
  // Find current agent
  const currentAgent = agents.find(a => a.name === value);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setHoveredAgent(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = (agentName) => {
    onChange(agentName);
    setIsOpen(false);
    setHoveredAgent(null);
  };
  
  return (
    <div className="agent-dropdown-container" ref={dropdownRef}>
      <button
        className={`agent-dropdown-trigger ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        disabled={disabled}
        style={currentAgent?.color ? {
          backgroundColor: currentAgent.color,
          color: '#ffffff',
          borderColor: currentAgent.color
        } : {}}
      >
        <span className="agent-dropdown-value">
          {value || 'No agent'}
        </span>
        <span className="agent-dropdown-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div className="agent-dropdown-menu">
          <div 
            className="agent-dropdown-option"
            onClick={() => handleSelect('')}
            onMouseEnter={() => setHoveredAgent(null)}
          >
            No agent
          </div>
          
          {agents.map((agent) => (
            <div
              key={agent.name}
              className={`agent-dropdown-option ${value === agent.name ? 'selected' : ''}`}
              onClick={() => handleSelect(agent.name)}
              onMouseEnter={() => setHoveredAgent(agent)}
              onMouseLeave={() => setHoveredAgent(null)}
              style={agent.color ? {
                backgroundColor: agent.color,
                color: '#ffffff'
              } : {}}
            >
              {agent.name}
            </div>
          ))}
        </div>
      )}
      
      {hoveredAgent && (
        <div className="agent-dropdown-tooltip">
          <div className="agent-tooltip-header">
            <strong>{hoveredAgent.name}</strong>
            {hoveredAgent.type && (
              <span className="agent-type-badge">{hoveredAgent.type}</span>
            )}
          </div>
          {hoveredAgent.description && (
            <div className="agent-tooltip-description">
              {hoveredAgent.description}
            </div>
          )}
          {hoveredAgent.tools && hoveredAgent.tools.length > 0 && (
            <div className="agent-tooltip-tools">
              <strong>Tools:</strong> {hoveredAgent.tools.slice(0, 3).join(', ')}
              {hoveredAgent.tools.length > 3 && ` +${hoveredAgent.tools.length - 3} more`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AgentDropdown;