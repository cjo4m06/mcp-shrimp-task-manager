import React, { useState, useEffect, useMemo } from 'react';
import TaskTable from './components/TaskTable';
import ReleaseNotes from './components/ReleaseNotes';
import Help from './components/Help';

function App() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [globalFilter, setGlobalFilter] = useState('');
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [draggedTabIndex, setDraggedTabIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [projectRoot, setProjectRoot] = useState(null);
  const [showReleaseNotesTab, setShowReleaseNotesTab] = useState(true);
  const [showHelpTab, setShowHelpTab] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isInDetailView, setIsInDetailView] = useState(false);
  const [forceResetDetailView, setForceResetDetailView] = useState(0);

  // Auto-refresh interval
  useEffect(() => {
    let interval;
    if (autoRefresh && selectedProfile) {
      interval = setInterval(() => {
        console.log(`Auto-refreshing tasks every ${refreshInterval}s...`);
        loadTasks(selectedProfile);
      }, refreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedProfile, refreshInterval]);

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  // Save selected profile to localStorage when it changes
  useEffect(() => {
    if (selectedProfile) {
      localStorage.setItem('selectedProfile', selectedProfile);
      if (selectedProfile === 'release-notes') {
        localStorage.setItem('showReleaseNotesTab', 'true');
      } else if (selectedProfile === 'help') {
        localStorage.setItem('showHelpTab', 'true');
      }
    }
  }, [selectedProfile]);

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to load profiles');
      const data = await response.json();
      setProfiles(data);
      
      // On initial load, select the appropriate profile
      if (!selectedProfile && data.length > 0) {
        // Try to restore the last selected profile
        const savedProfile = localStorage.getItem('selectedProfile');
        const savedShowReleaseNotes = localStorage.getItem('showReleaseNotesTab') === 'true';
        
        // Check if release notes was the last selected tab
        if (savedProfile === 'release-notes' && savedShowReleaseNotes) {
          setShowReleaseNotesTab(true);
          setSelectedProfile('release-notes');
          // Clear the flag so it doesn't persist incorrectly
          localStorage.removeItem('showReleaseNotesTab');
        } else if (savedProfile && data.some(p => p.id === savedProfile)) {
          // Restore the last selected profile if it still exists
          handleProfileChange(savedProfile);
        } else {
          // Select the first profile by default
          handleProfileChange(data[0].id);
        }
      }
    } catch (err) {
      setError('Failed to load profiles: ' + err.message);
    }
  };

  const loadTasks = async (profileId) => {
    if (!profileId) {
      setTasks([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/tasks/${profileId}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received tasks data:', data.tasks?.length, 'tasks');
      const task880f = data.tasks?.find(t => t.id === '880f4dd8-a603-4bb9-8d4d-5033887d0e0f');
      if (task880f) {
        console.log('Task 880f4dd8 status from API:', task880f.status);
      }
      setTasks(data.tasks || []);
      setProjectRoot(data.projectRoot || null);
    } catch (err) {
      setError('❌ Error loading tasks: ' + err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (profileId) => {
    console.log('handleProfileChange:', profileId, 'selectedProfile:', selectedProfile, 'isInDetailView:', isInDetailView);
    // If clicking the same tab and we're in detail view, just refresh to go back to list
    if (profileId === selectedProfile && isInDetailView) {
      console.log('Resetting detail view...');
      // Force reset the detail view
      setForceResetDetailView(prev => {
        console.log('Setting forceResetDetailView from', prev, 'to', prev + 1);
        return prev + 1;
      });
      setIsInDetailView(false);
      return;
    }
    
    if (profileId === 'release-notes') {
      setSelectedProfile('release-notes');
      return;
    } else if (profileId === 'help') {
      setSelectedProfile('help');
      return;
    }
    setSelectedProfile(profileId);
    setGlobalFilter(''); // Clear search when switching profiles
    loadTasks(profileId);
  };

  const handleAddProfile = async (name, file, projectRoot, filePath) => {
    try {
      let body;
      
      if (filePath) {
        // Direct file path method
        body = JSON.stringify({ 
          name, 
          filePath,
          projectRoot: projectRoot || null
        });
      } else {
        // File upload method
        const taskFileContent = await file.text();
        body = JSON.stringify({ 
          name, 
          taskFile: taskFileContent,
          projectRoot: projectRoot || null
        });
      }

      const response = await fetch('/api/add-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      });

      if (!response.ok) {
        throw new Error('Failed to add profile');
      }

      const newProfile = await response.json();
      console.log('New profile created:', newProfile);
      setShowAddProfile(false);
      
      // Load profiles first, then select the new one
      await loadProfiles();
      
      // Use setTimeout to ensure state updates have propagated
      setTimeout(() => {
        if (newProfile && newProfile.id) {
          console.log('Auto-selecting profile:', newProfile.id);
          setSelectedProfile(newProfile.id);
          setGlobalFilter(''); // Clear search when switching profiles
          loadTasks(newProfile.id);
        }
      }, 100);
    } catch (err) {
      setError('Failed to add profile: ' + err.message);
    }
  };

  const handleRemoveProfile = async (profileId) => {
    if (!confirm('Are you sure you want to remove this profile? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/remove-profile/${profileId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove profile');
      }

      // If we're removing the currently selected profile, clear selection
      if (selectedProfile === profileId) {
        setSelectedProfile('');
        setTasks([]);
      }

      await loadProfiles();
    } catch (err) {
      setError('Failed to remove profile: ' + err.message);
    }
  };

  const handleUpdateProfile = async (profileId, updates) => {
    try {
      const response = await fetch(`/api/update-profile/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      const updatedProfile = await response.json();
      
      // Update profiles in state
      setProfiles(prev => prev.map(p => 
        p.id === profileId ? { ...p, ...updatedProfile } : p
      ));

      // Update projectRoot if it was changed
      if (updates.projectRoot !== undefined) {
        setProjectRoot(updates.projectRoot);
      }

      setShowEditProfile(false);
      setEditingProfile(null);

      // Reload tasks to reflect any changes
      loadTasks(profileId);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    }
  };


  // Drag and drop handlers for tab reordering
  const handleDragStart = (e, index) => {
    setDraggedTabIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', ''); // Required for Firefox compatibility
  };

  const handleDragOver = (e, index) => {
    e.preventDefault(); // Required to allow drop
    setDragOverIndex(index); // Visual feedback for drop target
  };

  const handleDragEnd = () => {
    // Clean up drag state regardless of drop success
    setDraggedTabIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    // Ignore invalid drops (same position or invalid state)
    if (draggedTabIndex === null || draggedTabIndex === dropIndex) {
      return;
    }

    // Reorder profiles array using splice operations
    const newProfiles = [...profiles];
    const draggedProfile = newProfiles[draggedTabIndex];
    
    // Remove dragged item from original position
    newProfiles.splice(draggedTabIndex, 1);
    // Insert at new position
    newProfiles.splice(dropIndex, 0, draggedProfile);
    
    // Update state and clear drag indicators
    setProfiles(newProfiles);
    setDraggedTabIndex(null);
    setDragOverIndex(null);
  };

  // Memoized task statistics to avoid recalculation on every render
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    return { total, completed, inProgress, pending };
  }, [tasks]);

  return (
    <div className="app">
      <header className="header">
        <h1>🦐 Shrimp Task Manager Viewer</h1>
        <div className="version-info">
          <span>v2.1.0</span> • 
          <a href="#" onClick={(e) => {
            e.preventDefault();
            setShowReleaseNotesTab(true);
            setSelectedProfile('release-notes');
          }}>
            Releases
          </a> • 
          <a href="#" onClick={(e) => {
            e.preventDefault();
            setShowHelpTab(true);
            setSelectedProfile('help');
          }}>
            Readme
          </a>
        </div>
        <p>Web-based dashboard for viewing and monitoring task data across multiple profiles</p>
      </header>

      <div className="controls" name="main-controls-section">
        <div className="tab-border-line" name="tab-border-separator"></div>
        <div className="profile-controls" name="profile-selection-controls">
          <div className="profile-tabs" name="profile-tabs-container">
            <div className="tabs-list" name="profile-tabs-list" style={{ display: 'flex', width: '100%' }}>
              {profiles.map((profile, index) => (
                <div 
                  key={profile.id} 
                  className={`tab ${selectedProfile === profile.id ? 'active' : ''} ${draggedTabIndex === index ? 'dragging' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                  name={`profile-tab-${profile.id}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => handleProfileChange(profile.id)}
                  title={`Switch to ${profile.name} profile - Drag to reorder tabs`}
                >
                  <span className="tab-name">{profile.name}</span>
                  <button 
                    className="tab-close-btn"
                    name={`close-tab-${profile.id}-button`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveProfile(profile.id);
                    }}
                    title={`Close ${profile.name} tab and remove profile`}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                className="add-tab-btn"
                name="add-new-tab-button"
                onClick={() => setShowAddProfile(true)}
                title="Add a new profile tab"
              >
                + Add Tab
              </button>
              <div style={{ marginLeft: 'auto', display: 'flex' }}>
                {showReleaseNotesTab && (
                  <div 
                    className={`tab ${selectedProfile === 'release-notes' ? 'active' : ''}`}
                    name="release-notes-tab"
                    onClick={() => handleProfileChange('release-notes')}
                    title="View release notes"
                  >
                    <span className="tab-name">📋 Release Notes</span>
                    <button 
                      className="tab-close-btn"
                      name="close-release-notes-tab-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReleaseNotesTab(false);
                        if (selectedProfile === 'release-notes' && profiles.length > 0) {
                          handleProfileChange(profiles[0].id);
                        }
                      }}
                      title="Close release notes"
                    >
                      ×
                    </button>
                  </div>
                )}
                {showHelpTab && (
                  <div 
                    className={`tab ${selectedProfile === 'help' ? 'active' : ''}`}
                    name="help-tab"
                    onClick={() => handleProfileChange('help')}
                    title="View README documentation"
                  >
                    <span className="tab-name">ℹ️ Readme</span>
                    <button 
                      className="tab-close-btn"
                      name="close-help-tab-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHelpTab(false);
                        if (selectedProfile === 'help' && profiles.length > 0) {
                          handleProfileChange(profiles[0].id);
                        }
                      }}
                      title="Close readme"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedProfile === 'release-notes' ? (
        <div className="content-container" name="release-notes-content-area">
          <ReleaseNotes />
        </div>
      ) : selectedProfile === 'help' ? (
        <div className="content-container" name="help-content-area">
          <Help />
        </div>
      ) : selectedProfile && (
        <>
          <div className="content-container" name="main-content-area">
            <div className="stats-and-search-container" name="stats-and-search-row">
              <div className="search-container" name="task-search-controls">
                <input
                  type="text"
                  name="task-search-input"
                  className="search-input"
                  placeholder="🔍 Search tasks..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  title="Search and filter tasks by any text content"
                />
              </div>

              <div className="stats-grid" name="task-statistics-display">
                <div className="stat-card" name="total-tasks-counter" title="Total number of tasks in this profile">
                  <h3>Total Tasks</h3>
                  <div className="value">{stats.total}</div>
                </div>
                <div className="stat-card" name="completed-tasks-counter" title="Number of completed tasks">
                  <h3>Completed</h3>
                  <div className="value">{stats.completed}</div>
                </div>
                <div className="stat-card" name="in-progress-tasks-counter" title="Number of tasks currently in progress">
                  <h3>In Progress</h3>
                  <div className="value">{stats.inProgress}</div>
                </div>
                <div className="stat-card" name="pending-tasks-counter" title="Number of pending tasks">
                  <h3>Pending</h3>
                  <div className="value">{stats.pending}</div>
                </div>
              </div>

              <div className="controls-right" name="right-side-controls">
                <button 
                  name="edit-profile-button"
                  className="edit-profile-button"
                  onClick={() => {
                    const currentProfile = profiles.find(p => p.id === selectedProfile);
                    if (currentProfile) {
                      setShowEditProfile(true);
                      setEditingProfile(currentProfile);
                    }
                  }}
                  disabled={!selectedProfile || selectedProfile === 'release-notes'}
                  title="Edit profile settings (project root, etc.)"
                >
                  ⚙️ Edit
                </button>
                <button 
                  name="refresh-profile-button"
                  className="refresh-button profile-refresh"
                  onClick={() => loadTasks(selectedProfile)}
                  disabled={loading || !selectedProfile}
                  title="Refresh current profile data - reload tasks from file"
                >
                  {loading ? '⏳' : '🔄'}
                </button>

                <div className="auto-refresh-controls" name="auto-refresh-controls" title="Configure automatic task refresh">
                  <label className="auto-refresh" name="auto-refresh-toggle">
                    <input 
                      type="checkbox"
                      name="auto-refresh-checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      title={`Enable automatic refresh every ${refreshInterval} seconds`}
                    />
                    Auto-refresh
                  </label>
                  
                  <select 
                    className="refresh-interval-select"
                    name="refresh-interval-selector"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    disabled={!autoRefresh}
                    title="Set how often to automatically refresh task data"
                  >
                    <option value={5}>5s</option>
                    <option value={10}>10s</option>
                    <option value={15}>15s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                    <option value={120}>2m</option>
                    <option value={300}>5m</option>
                  </select>
                </div>
              </div>
            </div>

            <TaskTable 
              data={tasks} 
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              projectRoot={projectRoot}
              onDetailViewChange={setIsInDetailView}
              resetDetailView={forceResetDetailView}
            />
          </div>
        </>
      )}

      {error && (
        <div className="error" name="error-message-display" title="Error information">{error}</div>
      )}

      {!selectedProfile && (
        <div className="content-container" name="no-profile-container">
          <div className="loading" name="no-profile-message" title="Choose a profile from the dropdown above">Select a profile to view tasks</div>
        </div>
      )}

      {loading && selectedProfile && (
        <div className="content-container" name="loading-container">
          <div className="loading" name="loading-indicator" title="Loading tasks from file">Loading tasks... ⏳</div>
        </div>
      )}

      {showAddProfile && (
        <div className="modal-overlay" name="add-profile-modal-overlay" onClick={() => setShowAddProfile(false)} title="Click outside to close">
          <div className="modal-content" name="add-profile-modal" onClick={(e) => e.stopPropagation()} title="Add new profile form">
            <h3>Add New Profile</h3>
            <form name="add-profile-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const name = formData.get('name');
              const folderPath = formData.get('folderPath');
              const projectRoot = formData.get('projectRoot');
              
              if (name && folderPath) {
                // Auto-append tasks.json to the folder path
                const filePath = folderPath.endsWith('/') 
                  ? folderPath + 'tasks.json' 
                  : folderPath + '/tasks.json';
                handleAddProfile(name, null, projectRoot, filePath);
              }
            }}>
              <div className="form-group" name="profile-name-group">
                <label htmlFor="profileName">Profile Name:</label>
                <input 
                  type="text" 
                  id="profileName"
                  name="name"
                  placeholder="e.g., Team Alpha Tasks"
                  title="Enter a descriptive name for this profile"
                  required
                />
              </div>
              <div className="form-group" name="task-folder-group">
                <label htmlFor="folderPath">Task Folder Path:</label>
                <input 
                  type="text" 
                  id="folderPath"
                  name="folderPath"
                  placeholder="/path/to/shrimp_data_folder"
                  title="Enter the path to your shrimp data folder containing tasks.json"
                  required
                />
                <span className="form-hint">
                  <strong>Tip:</strong> Navigate to your shrimp data folder in terminal and <strong style={{ color: '#f59e0b' }}>type <code>pwd</code> to get the full path</strong><br />
                  Example: /home/user/project/shrimp_data_team
                </span>
              </div>
              <div className="form-group" name="project-root-group">
                <label htmlFor="projectRoot">Project Root Path (optional):</label>
                <input 
                  type="text" 
                  id="projectRoot"
                  name="projectRoot"
                  placeholder="e.g., /home/user/my-project"
                  title="Enter the absolute path to the project root directory"
                />
                <small className="form-hint">This enables clickable file links that open in VS Code</small>
              </div>
              <div className="form-actions" name="modal-form-buttons">
                <button 
                  type="submit" 
                  name="submit-add-profile"
                  className="primary-btn"
                  title="Create the new profile with the provided information"
                >
                  Add Profile
                </button>
                <button 
                  type="button" 
                  name="cancel-add-profile"
                  className="secondary-btn" 
                  onClick={() => setShowAddProfile(false)}
                  title="Cancel and close this dialog"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{showEditProfile && editingProfile && (
        <div className="modal-overlay" name="edit-profile-modal-overlay" onClick={() => {
          setShowEditProfile(false);
          setEditingProfile(null);
        }} title="Click outside to close">
          <div className="modal-content" name="edit-profile-modal" onClick={(e) => e.stopPropagation()} title="Edit profile settings">
            <h3>Edit Profile Settings</h3>
            <form name="edit-profile-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const name = formData.get('name');
              const projectRoot = formData.get('projectRoot');
              handleUpdateProfile(editingProfile.id, { 
                name: name.trim(),
                projectRoot: projectRoot || null 
              });
            }}>
              <div className="form-group" name="profile-name-group">
                <label htmlFor="editProfileName">Profile Name:</label>
                <input 
                  type="text" 
                  id="editProfileName"
                  name="name"
                  defaultValue={editingProfile.name}
                  placeholder="e.g., Team Alpha Tasks"
                  title="Edit the profile name"
                  required
                />
              </div>
              <div className="form-group" name="project-root-group">
                <label htmlFor="editProjectRoot">Project Root (optional):</label>
                <input 
                  type="text" 
                  id="editProjectRoot"
                  name="projectRoot"
                  defaultValue={editingProfile.projectRoot || ''}
                  placeholder="e.g., /home/user/projects/my-project"
                  title="Set the project root path to enable VS Code file links"
                />
                <span className="form-hint">
                  Set this to enable clickable VS Code links for task files
                </span>
              </div>
              <div className="form-actions" name="modal-form-buttons">
                <button 
                  type="submit" 
                  name="submit-edit-profile"
                  className="primary-btn"
                  title="Save profile settings"
                >
                  Save Changes
                </button>
                <button 
                  type="button" 
                  name="cancel-edit-profile"
                  className="secondary-btn"
                  onClick={() => {
                    setShowEditProfile(false);
                    setEditingProfile(null);
                  }}
                  title="Cancel and close this dialog"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;