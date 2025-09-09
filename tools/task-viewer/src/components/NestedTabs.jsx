import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

const NestedTabs = ({ 
  profiles, 
  selectedProfile, 
  handleProfileChange, 
  handleRemoveProfile,
  setShowAddProfile,
  projectInnerTab,
  setProjectInnerTab,
  children,
  selectedOuterTab,
  onOuterTabChange,
  draggedTabIndex,
  dragOverIndex,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  claudeFolderPath,
  tasks = []
}) => {
  const { t } = useTranslation();
  
  // Create dynamic tab arrays based on Claude folder path configuration
  const baseTabNames = ['projects', 'release-notes', 'readme', 'templates'];
  const tabNames = claudeFolderPath 
    ? [...baseTabNames, 'sub-agents', 'global-settings']
    : [...baseTabNames, 'global-settings'];
  
  // Convert tab name to index for HeadlessUI
  const tabNameToIndex = tabNames.reduce((acc, name, index) => {
    acc[name] = index;
    return acc;
  }, {});
  
  const selectedOuterIndex = tabNameToIndex[selectedOuterTab] || 0;
  
  // Handle tab change with index to name conversion
  const handleOuterTabChange = (index) => {
    if (onOuterTabChange) {
      onOuterTabChange(tabNames[index]);
    }
  };

  return (
    <Tab.Group selectedIndex={selectedOuterIndex} onChange={handleOuterTabChange}>
      <Tab.List className="tabs-list outer-tabs">
        <Tab className={({ selected }) => `tab ${selected ? 'active' : ''}`}>
          <span className="tab-name">📁 {t('projects')}</span>
        </Tab>
        <Tab className={({ selected }) => `tab ${selected ? 'active' : ''}`}>
          <span className="tab-name">📋 {t('releaseNotes')}</span>
        </Tab>
        <Tab className={({ selected }) => `tab ${selected ? 'active' : ''}`}>
          <span className="tab-name">ℹ️ {t('readme')}</span>
        </Tab>
        <Tab className={({ selected }) => `tab ${selected ? 'active' : ''}`}>
          <span className="tab-name">🎨 {t('templates')}</span>
        </Tab>
        {claudeFolderPath && (
          <Tab className={({ selected }) => `tab ${selected ? 'active' : ''}`}>
            <span className="tab-name">🤖 {t('subAgents')}</span>
          </Tab>
        )}
        <Tab className={({ selected }) => `tab ${selected ? 'active' : ''}`}>
          <span className="tab-name">
            <span style={{ color: '#FFD700' }}>⚙️</span> {t('settings')}
          </span>
        </Tab>
      </Tab.List>

      <Tab.Panels className="tab-panels-wrapper">
        {/* Projects Panel */}
        <Tab.Panel className="project-panel">
          <div className="profile-tabs-wrapper">
            <div className="profile-tabs-container">
              <Tab.Group selectedIndex={profiles.findIndex(p => p.id === selectedProfile)} onChange={(index) => handleProfileChange(profiles[index]?.id)}>
                <Tab.List className="tabs-list profile-tabs">
                {profiles.map((profile, index) => (
                  <Tab 
                    key={profile.id} 
                    className={({ selected }) => 
                      `tab ${selected ? 'active' : ''} ${draggedTabIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`
                    }
                    draggable="true"
                    onDragStart={(e) => handleDragStart && handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver && handleDragOver(e, index)}
                    onDragEnter={(e) => handleDragOver && handleDragOver(e, index)}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      // Only clear drag-over if we're leaving the element completely
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX;
                      const y = e.clientY;
                      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                        // Clear drag over state when actually leaving the element
                        if (handleDragOver) handleDragOver(e, -1);
                      }
                    }}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop && handleDrop(e, index)}
                  >
                    <span className="tab-name">{profile.name}</span>
                    <span 
                      className="tab-close-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleRemoveProfile(profile.id);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          e.preventDefault();
                          handleRemoveProfile(profile.id);
                        }
                      }}
                    >
                      ×
                    </span>
                  </Tab>
                ))}
                <button 
                  className="add-tab-btn"
                  onClick={() => setShowAddProfile(true)}
                >
                  + Add Project
                </button>
              </Tab.List>

              <div className="profile-content-wrapper">
                <Tab.Panels>
                  {profiles.map((profile) => (
                    <Tab.Panel key={profile.id}>
                      {/* Inner project tabs */}
                      <div className="inner-tabs-wrapper">
                        <Tab.Group selectedIndex={projectInnerTab === 'tasks' ? 0 : projectInnerTab === 'history' ? 1 : projectInnerTab === 'agents' ? 2 : projectInnerTab === 'settings' ? 3 : 4} 
                                   onChange={(index) => setProjectInnerTab(['tasks', 'history', 'agents', 'settings', 'archive'][index])}>
                          <Tab.List className="inner-tabs-list project-inner-tabs">
                          <Tab className={({ selected }) => `inner-tab ${selected ? 'active' : ''}`}
                               onClick={() => {
                                 // If already on tasks tab, force refresh to reset view
                                 if (projectInnerTab === 'tasks') {
                                   setProjectInnerTab('tasks');
                                 }
                               }}>
                            <span>📋 {t('tasks')}</span>
                          </Tab>
                          <Tab className={({ selected }) => `inner-tab ${selected ? 'active' : ''}`}>
                            <span>📊 {t('history')}</span>
                          </Tab>
                          <Tab className={({ selected }) => `inner-tab ${selected ? 'active' : ''}`}
                               onClick={() => {
                                 // If already on agents tab, force refresh to reset view
                                 if (projectInnerTab === 'agents') {
                                   setProjectInnerTab('agents');
                                 }
                               }}>
                            <span>🤖 {t('agents') || 'Agents'}</span>
                          </Tab>
                          <Tab className={({ selected }) => `inner-tab ${selected ? 'active' : ''}`}>
                            <span>⚙️ {t('settings')}</span>
                          </Tab>
                          <Tab className={({ selected }) => `inner-tab ${selected ? 'active' : ''}`}>
                            <span>📦 {t('archive')}</span>
                          </Tab>
                        </Tab.List>

                        <Tab.Panels className="inner-tab-panels">
                          <Tab.Panel>
                            {/* Tasks content */}
                            {children.tasks}
                          </Tab.Panel>
                          <Tab.Panel>
                            {/* History content */}
                            {children.history}
                          </Tab.Panel>
                          <Tab.Panel>
                            {/* Agents content */}
                            {children.agents}
                          </Tab.Panel>
                          <Tab.Panel>
                            {/* Settings content */}
                            {children.settings}
                          </Tab.Panel>
                          <Tab.Panel>
                            {/* Archive content */}
                            {children.archive}
                          </Tab.Panel>
                        </Tab.Panels>
                      </Tab.Group>
                    </div>
                  </Tab.Panel>
                  ))}
                </Tab.Panels>
              </div>
            </Tab.Group>
            </div>
          </div>
        </Tab.Panel>

        {/* Release Notes Panel */}
        <Tab.Panel>
          {children.releaseNotes}
        </Tab.Panel>

        {/* Readme Panel */}
        <Tab.Panel>
          {children.readme}
        </Tab.Panel>

        {/* Templates Panel */}
        <Tab.Panel>
          {children.templates}
        </Tab.Panel>

        {/* Sub-Agents Panel (conditional) */}
        {claudeFolderPath && (
          <Tab.Panel>
            {children.subAgents}
          </Tab.Panel>
        )}

        {/* Global Settings Panel */}
        <Tab.Panel>
          {children.globalSettings}
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

export default NestedTabs;