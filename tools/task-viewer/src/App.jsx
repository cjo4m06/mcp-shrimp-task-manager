import React, { useState, useEffect, useMemo, useRef } from 'react';
import TaskTable from './components/TaskTable';
import FinalSummary from './components/FinalSummary';
import ReleaseNotes from './components/ReleaseNotes';
import Help from './components/Help';
import TemplateManagement from './components/TemplateManagement';
import TemplateEditor from './components/TemplateEditor';
import TemplatePreview from './components/TemplatePreview';
import ActivationDialog from './components/ActivationDialog';
import DuplicateTemplateView from './components/DuplicateTemplateView';
import HistoryView from './components/HistoryView';
import HistoryTasksView from './components/HistoryTasksView';
import ArchiveView from './components/ArchiveView';
import ArchiveDetailView from './components/ArchiveDetailView';
import GlobalSettingsView from './components/GlobalSettingsView';
import SubAgentsView from './components/SubAgentsView';
import ProjectAgentsView from './components/ProjectAgentsView';
import ToastContainer from './components/ToastContainer';
import LanguageSelector from './components/LanguageSelector';
import ChatAgent from './components/ChatAgent';
import ErrorBoundary from './components/ErrorBoundary';
import DebugPanel from './components/DebugPanel';
import ExportModal from './components/ExportModal';
import ArchiveModal from './components/ArchiveModal';
import ImportArchiveModal from './components/ImportArchiveModal';
import { useTranslation } from 'react-i18next';
import { parseUrlState, updateUrl, pushUrlState, getInitialUrlState, cleanUrlStateForTab } from './utils/urlStateSync';
import NestedTabs from './components/NestedTabs';
import { debugLog, performanceMonitor } from './utils/debug';
import { usePerformanceMonitoring } from './utils/optimizedHooks';
import { exportToCSV, exportToMarkdown } from './utils/exportUtils';

function AppContent() {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  // Performance monitoring for the main App component
  const performanceData = usePerformanceMonitoring('AppContent', {
    currentLanguage,
    renderTime: Date.now()
  });
  
  // Initialize URL state
  const [urlStateInitialized, setUrlStateInitialized] = useState(false);
  const initialUrlState = useMemo(() => getInitialUrlState(), []);
  
  const [profiles, setProfiles] = useState(() => {
    // Ensure profiles is always initialized as an array
    debugLog('AppContent', 'Profiles State Init', { initialValue: [] });
    return [];
  });
  const [selectedProfile, setSelectedProfile] = useState(initialUrlState.profile || '');
  const [tasks, setTasks] = useState([]);
  const [initialRequest, setInitialRequest] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const saved = localStorage.getItem('autoRefresh');
    return saved !== null ? saved === 'true' : true;
  });
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const saved = localStorage.getItem('refreshInterval');
    return saved !== null ? Number(saved) : 30;
  });
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'completed', 'in_progress', 'pending'
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [draggedTabIndex, setDraggedTabIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [projectRoot, setProjectRoot] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isInDetailView, setIsInDetailView] = useState(false);
  const [isInEditMode, setIsInEditMode] = useState(false);
  const [forceResetDetailView, setForceResetDetailView] = useState(0);
  
  // Outer tab state
  const [selectedOuterTab, setSelectedOuterTab] = useState(initialUrlState.tab || 'projects'); // 'projects', 'release-notes', 'readme', 'templates'
  
  // Template management states
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState('');
  const [templateView, setTemplateView] = useState(initialUrlState.templateView || 'list'); // 'list', 'edit', 'preview', or 'duplicate'
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewingTemplate, setPreviewingTemplate] = useState(null);
  const [templateEditorLoading, setTemplateEditorLoading] = useState(false);
  const [activatingTemplate, setActivatingTemplate] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [templateToActivate, setTemplateToActivate] = useState(null);
  const [duplicatingTemplate, setDuplicatingTemplate] = useState(null);
  
  // Global settings state
  const [claudeFolderPath, setClaudeFolderPath] = useState('');
  const [globalSettingsLoaded, setGlobalSettingsLoaded] = useState(false);
  
  // Inner project tab state (tasks, history, settings)
  const [projectInnerTab, setProjectInnerTab] = useState(initialUrlState.projectTab || 'tasks'); // 'tasks', 'history', 'archive', 'settings'
  const [agentsTabRefresh, setAgentsTabRefresh] = useState(0); // Trigger for refreshing agents view
  const [tasksTabRefresh, setTasksTabRefresh] = useState(0); // Trigger for refreshing tasks view
  
  // Emoji template states
  const [robotEmojiTemplate, setRobotEmojiTemplate] = useState('');
  const [armEmojiTemplate, setArmEmojiTemplate] = useState('');
  
  // History management states
  const [historyView, setHistoryView] = useState(initialUrlState.history || ''); // 'list' or 'details' or '' for normal view
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);
  const [selectedHistoryTasks, setSelectedHistoryTasks] = useState([]);
  const [selectedHistoryInitialRequest, setSelectedHistoryInitialRequest] = useState('');
  const [selectedHistorySummary, setSelectedHistorySummary] = useState('');
  const [selectedHistoryGeneratedRequest, setSelectedHistoryGeneratedRequest] = useState(false);
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  
  // Current task state for chat context
  const [currentTask, setCurrentTask] = useState(null);
  
  // Initial request collapse state
  const [initialRequestCollapsed, setInitialRequestCollapsed] = useState(() => {
    const saved = localStorage.getItem('initialRequestCollapsed');
    return saved !== null ? saved === 'true' : false;
  });

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);

  // Archive modal states
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [archiveView, setArchiveView] = useState('list'); // 'list' or 'details'
  
  // History import modal state
  const [showImportHistoryModal, setShowImportHistoryModal] = useState(false);
  const [archives, setArchives] = useState([]);


  // Helper function to ensure profiles is always an array
  const getSafeProfiles = () => {
    const safe = Array.isArray(profiles) ? profiles : [];
    if (!Array.isArray(profiles)) {
      debugLog('AppContent', 'Profiles Not Array', { profiles, type: typeof profiles });
    }
    return safe;
  };

  // Safe wrapper for setProfiles to ensure it's always an array
  const setSafeProfiles = (value) => {
    try {
      if (typeof value === 'function') {
        setProfiles(prev => {
          try {
            const result = value(prev);
            const safeResult = Array.isArray(result) ? result : [];
            if (!Array.isArray(result)) {
              debugLog('AppContent', 'Non-Array Profiles Function Result', { result, type: typeof result });
            }
            return safeResult;
          } catch (err) {
            debugLog('AppContent', 'Error in Profiles Function', { error: err.message, prev });
            return Array.isArray(prev) ? prev : [];
          }
        });
      } else {
        const safeValue = Array.isArray(value) ? value : [];
        if (!Array.isArray(value)) {
          debugLog('AppContent', 'Non-Array Profiles Value', { value, type: typeof value });
        }
        setProfiles(safeValue);
      }
    } catch (err) {
      debugLog('AppContent', 'Error in setSafeProfiles', { error: err.message, value });
      setProfiles([]);  // Emergency fallback
    }
  };

  // Toast helper functions
  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Export handler function
  const handleExport = async ({ format, selectedStatuses, filteredTasks }) => {
    try {
      let content;
      let filename;
      let mimeType;

      if (format === 'csv') {
        content = exportToCSV(filteredTasks);
        filename = 'tasks.csv';
        mimeType = 'text/csv';
      } else if (format === 'markdown') {
        content = exportToMarkdown(filteredTasks, initialRequest);
        filename = 'tasks.md';
        mimeType = 'text/markdown';
      } else {
        showToast('Invalid export format', 'error');
        return false;
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(t('exportSuccess', { 
        count: filteredTasks.length, 
        format: format.toUpperCase() 
      }), 'success');

      return true;
    } catch (err) {
      console.error('Export error:', err);
      showToast('Failed to export tasks: ' + err.message, 'error');
      return false;
    }
  };

  // Archive handler function
  const handleArchive = () => {
    if (!selectedProfile || tasks.length === 0) {
      showToast('No tasks to archive', 'error');
      return;
    }

    try {
      // Create archive object
      const archiveData = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        projectId: selectedProfile,
        projectName: profiles?.find(p => p.id === selectedProfile)?.name || 'Unknown Project',
        initialRequest: initialRequest || '',
        tasks: tasks,
        stats: {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'completed').length,
          inProgress: tasks.filter(t => t.status === 'in_progress').length,
          pending: tasks.filter(t => t.status === 'pending').length
        },
        summary: summary || ''
      };

      // Get existing archives from localStorage
      const storageKey = `task-archives-${selectedProfile}`;
      const existingArchives = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Add new archive to the beginning
      const updatedArchives = [archiveData, ...existingArchives];
      
      // Limit to 50 archives to prevent localStorage overflow
      const limitedArchives = updatedArchives.slice(0, 50);
      
      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(limitedArchives));
      
      // Update state
      setArchives(limitedArchives);
      
      showToast(`Archived ${tasks.length} tasks successfully`, 'success');
    } catch (err) {
      console.error('Archive error:', err);
      showToast('Failed to archive tasks: ' + err.message, 'error');
    }
  };

  // Handle archive deletion
  const handleDeleteArchive = (archive) => {
    if (!archive || !selectedProfile) return;

    try {
      const storageKey = `task-archives-${selectedProfile}`;
      const existingArchives = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Remove the archive by ID
      const updatedArchives = existingArchives.filter(a => a.id !== archive.id);
      
      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedArchives));
      
      // Update state
      setArchives(updatedArchives);
      
      showToast('Archive deleted successfully', 'success');
    } catch (err) {
      console.error('Delete archive error:', err);
      showToast('Failed to delete archive: ' + err.message, 'error');
    }
  };

  // Handle archive import
  const handleImportArchive = (mode) => {
    if (!selectedArchive || !selectedProfile) {
      showToast('No archive selected for import', 'error');
      return;
    }

    try {
      let newTasks = [...selectedArchive.tasks];
      
      if (mode === 'append') {
        // Add archived tasks to existing tasks
        const existingTaskIds = new Set(tasks.map(t => t.id));
        
        // Filter out tasks that already exist to avoid duplicates
        const uniqueArchivedTasks = newTasks.filter(t => !existingTaskIds.has(t.id));
        
        if (uniqueArchivedTasks.length === 0) {
          showToast('All tasks from this archive already exist', 'info');
          setShowImportModal(false);
          return;
        }
        
        newTasks = [...tasks, ...uniqueArchivedTasks];
        showToast(`Appended ${uniqueArchivedTasks.length} tasks from archive`, 'success');
      } else if (mode === 'replace') {
        // Replace all current tasks with archived tasks
        showToast(`Replaced ${tasks.length} tasks with ${newTasks.length} archived tasks`, 'success');
      }

      // Update tasks state
      setTasks(newTasks);
      
      // Update initial request if present
      if (selectedArchive.initialRequest) {
        setInitialRequest(selectedArchive.initialRequest);
      }
      
      // Update summary if present
      if (selectedArchive.summary) {
        setSummary(selectedArchive.summary);
      }

      // Close modal
      setShowImportModal(false);
      setSelectedArchive(null);
    } catch (err) {
      console.error('Import archive error:', err);
      showToast('Failed to import archive: ' + err.message, 'error');
    }
  };

  // Handle viewing archive
  const handleViewArchive = (archive) => {
    setSelectedArchive(archive);
    setArchiveView('details');
  };

  // Handle history deletion
  const handleDeleteHistory = async (historyEntry) => {
    if (!historyEntry || !selectedProfile) return;

    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete this history entry from ${new Date(historyEntry.timestamp).toLocaleDateString()}?`)) {
      return;
    }

    try {
      // Call API to delete history file
      const response = await fetch(`/api/history/${selectedProfile}/${historyEntry.filename}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete history: ${response.status}`);
      }

      // Update state - remove the deleted entry
      setHistoryData(prevData => prevData.filter(h => h.filename !== historyEntry.filename));
      
      showToast('History entry deleted successfully', 'success');
    } catch (err) {
      console.error('Delete history error:', err);
      showToast('Failed to delete history: ' + err.message, 'error');
    }
  };

  // Handle history import
  const handleImportHistory = (mode) => {
    if (!selectedHistoryEntry || !selectedProfile) {
      showToast('No history entry selected for import', 'error');
      return;
    }

    try {
      let newTasks = [...selectedHistoryTasks];
      
      if (mode === 'append') {
        // Add history tasks to existing tasks
        const existingTaskIds = new Set(tasks.map(t => t.id));
        
        // Filter out tasks that already exist to avoid duplicates
        const uniqueHistoryTasks = newTasks.filter(t => !existingTaskIds.has(t.id));
        
        if (uniqueHistoryTasks.length === 0) {
          showToast('All tasks from this history already exist', 'info');
          setShowImportHistoryModal(false);
          return;
        }
        
        newTasks = [...tasks, ...uniqueHistoryTasks];
        showToast(`Appended ${uniqueHistoryTasks.length} tasks from history`, 'success');
      } else if (mode === 'replace') {
        // Replace all current tasks with history tasks
        showToast(`Replaced ${tasks.length} tasks with ${newTasks.length} history tasks`, 'success');
      }

      // Update tasks state
      setTasks(newTasks);
      
      // Update initial request if present
      if (selectedHistoryInitialRequest) {
        setInitialRequest(selectedHistoryInitialRequest);
      }
      
      // Update summary if present
      if (selectedHistorySummary) {
        setSummary(selectedHistorySummary);
      }

      // Close modal and reset selection
      setShowImportHistoryModal(false);
      setSelectedHistoryEntry(null);
    } catch (err) {
      console.error('Import history error:', err);
      showToast('Failed to import history: ' + err.message, 'error');
    }
  };

  // Auto-refresh interval
  useEffect(() => {
    let interval;
    if (autoRefresh && selectedProfile && !isInEditMode && !isInDetailView) {
      interval = setInterval(() => {
        console.log(`Auto-refreshing tasks every ${refreshInterval}s...`);
        loadTasks(selectedProfile, true); // Force refresh for auto-refresh
      }, refreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedProfile, refreshInterval, isInEditMode, isInDetailView]);

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);
  
  // Track the previous selected profile to detect actual profile switches
  const prevSelectedProfileRef = useRef(selectedProfile);
  
  // Update emoji template states when selected profile changes
  useEffect(() => {
    const currentProfile = getSafeProfiles().find(p => p.id === selectedProfile);
    
    // Only update templates if we're switching to a different profile
    // or if this is the first load (templates are empty)
    if (currentProfile && (
      prevSelectedProfileRef.current !== selectedProfile || 
      !robotEmojiTemplate || 
      !armEmojiTemplate
    )) {
      setRobotEmojiTemplate(currentProfile.robotEmojiTemplate || 
        'use the built in subagent located in [AGENT] to complete this shrimp task: [UUID] please when u start working mark the shrimp task as in progress');
      setArmEmojiTemplate(currentProfile.armEmojiTemplate || 
        'Use task planner to execute this task: [UUID] using the role of [AGENT_NAME] agent. Apply the [AGENT_NAME] agent\'s specialized knowledge and approach, but execute the task yourself without launching a sub-agent. Please mark the task as in progress when you start working.');
    }
    
    prevSelectedProfileRef.current = selectedProfile;
  }, [selectedProfile, profiles, robotEmojiTemplate, armEmojiTemplate]); // Include all dependencies
  
  // Note: Environment variable checking is now handled in GlobalSettingsView component

  // Load global settings on mount
  useEffect(() => {
    const loadGlobalSettings = async () => {
      try {
        const response = await fetch('/api/global-settings');
        if (response.ok) {
          const settings = await response.json();
          setClaudeFolderPath(settings.claudeFolderPath || '');
        }
      } catch (err) {
        console.error('Error loading global settings:', err);
      } finally {
        setGlobalSettingsLoaded(true);
      }
    };
    
    loadGlobalSettings();
  }, []);
  
  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      const urlState = parseUrlState();
      
      // Update tab
      if (urlState.tab && urlState.tab !== selectedOuterTab) {
        setSelectedOuterTab(urlState.tab);
        
        if (urlState.tab === 'projects' && urlState.profile && getSafeProfiles().some(p => p.id === urlState.profile)) {
          setSelectedProfile(urlState.profile);
          loadTasks(urlState.profile);
        } else if (urlState.tab === 'templates') {
          loadTemplates();
        }
      }
      
      // Update profile if on projects tab
      if (urlState.tab === 'projects' && urlState.profile && urlState.profile !== selectedProfile) {
        if (getSafeProfiles().some(p => p.id === urlState.profile)) {
          setSelectedProfile(urlState.profile);
          loadTasks(urlState.profile);
        }
      }
      
      // Update project inner tab
      if (urlState.projectTab && urlState.projectTab !== projectInnerTab) {
        setProjectInnerTab(urlState.projectTab);
        if (urlState.projectTab === 'history' && !historyData.length && urlState.profile) {
          loadHistory(urlState.profile);
        }
        if (urlState.projectTab === 'archive' && urlState.profile) {
          loadArchives(urlState.profile);
        }
      }
      
      // Update history view
      if (urlState.history !== historyView) {
        setHistoryView(urlState.history || '');
        if (urlState.history === 'list' && urlState.profile) {
          loadHistory(urlState.profile);
        } else if (urlState.history === 'details' && urlState.historyDate) {
          loadHistoryTasks(urlState.historyDate, { date: urlState.historyDate });
        }
      }
      
      // Update template view
      if (urlState.templateView && urlState.templateView !== templateView) {
        setTemplateView(urlState.templateView);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedOuterTab, selectedProfile, profiles, historyView, templateView, projectInnerTab]);

  // Save selected profile and outer tab to localStorage when they change
  useEffect(() => {
    if (selectedProfile) {
      localStorage.setItem('selectedProfile', selectedProfile);
    }
    localStorage.setItem('selectedOuterTab', selectedOuterTab);
  }, [selectedProfile, selectedOuterTab]);
  
  // Save auto-refresh settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('autoRefresh', autoRefresh.toString());
  }, [autoRefresh]);

  // Save initial request collapse state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('initialRequestCollapsed', initialRequestCollapsed.toString());
  }, [initialRequestCollapsed]);
  
  useEffect(() => {
    localStorage.setItem('refreshInterval', refreshInterval.toString());
  }, [refreshInterval]);
  
  // Update URL when history view changes
  useEffect(() => {
    if (urlStateInitialized) {
      const urlState = {
        tab: selectedOuterTab,
        profile: selectedProfile,
        lang: currentLanguage,
        history: historyView || undefined,
        historyDate: selectedHistoryEntry?.date || undefined
      };
      updateUrl(urlState);
    }
  }, [historyView, selectedHistoryEntry, urlStateInitialized]);
  
  // Update URL when template view changes
  useEffect(() => {
    if (urlStateInitialized && selectedOuterTab === 'templates') {
      const urlState = {
        tab: 'templates',
        lang: currentLanguage,
        templateView: templateView !== 'list' ? templateView : undefined,
        templateId: (editingTemplate?.name || previewingTemplate?.name || duplicatingTemplate?.name) || undefined
      };
      updateUrl(urlState);
    }
  }, [templateView, editingTemplate, previewingTemplate, duplicatingTemplate, urlStateInitialized]);

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to load profiles');
      const data = await response.json();
      
      // Restore tab order from localStorage if it exists
      let orderedProfiles = Array.isArray(data) ? data : [];
      try {
        const savedOrder = localStorage.getItem('profileTabOrder');
        if (savedOrder) {
          const profileOrder = JSON.parse(savedOrder);
          const orderedData = [];
          const remainingProfiles = [...orderedProfiles];
          
          // Add profiles in saved order
          profileOrder.forEach(profileId => {
            const profileIndex = remainingProfiles.findIndex(p => p.id === profileId);
            if (profileIndex !== -1) {
              orderedData.push(remainingProfiles[profileIndex]);
              remainingProfiles.splice(profileIndex, 1);
            }
          });
          
          // Add any new profiles that weren't in the saved order
          orderedData.push(...remainingProfiles);
          
          orderedProfiles = orderedData;
          debugLog('AppContent', 'Tab order restored from localStorage', { 
            savedOrder: profileOrder, 
            restoredProfiles: orderedProfiles.map(p => p.id)
          });
        }
      } catch (error) {
        debugLog('AppContent', 'Failed to restore tab order from localStorage', { error: error.message });
        // Continue with original order if restoration fails
      }
      
      // Ensure profiles is always an array to prevent TypeError
      setSafeProfiles(orderedProfiles);
      
      // On initial load, restore state from URL
      const safeProfiles = orderedProfiles;
      if (!urlStateInitialized && safeProfiles.length > 0) {
        setUrlStateInitialized(true);
        
        // If on projects tab and profile is specified in URL
        if (initialUrlState.tab === 'projects' && initialUrlState.profile) {
          if (safeProfiles.some(p => p.id === initialUrlState.profile)) {
            handleProfileChange(initialUrlState.profile);
          } else {
            // Profile not found, use first one
            handleProfileChange(safeProfiles[0].id);
          }
        } else if (initialUrlState.tab === 'projects') {
          // No profile in URL, use saved or first profile
          const savedProfile = localStorage.getItem('selectedProfile');
          if (savedProfile && safeProfiles.some(p => p.id === savedProfile)) {
            handleProfileChange(savedProfile);
          } else {
            handleProfileChange(safeProfiles[0].id);
          }
        } else if (initialUrlState.tab === 'templates') {
          loadTemplates();
        }
        
        // If history view is specified in URL
        if (initialUrlState.history) {
          setHistoryView(initialUrlState.history);
          if (initialUrlState.history === 'list' && initialUrlState.profile) {
            loadHistory(initialUrlState.profile);
          } else if (initialUrlState.history === 'details' && initialUrlState.historyDate) {
            loadHistoryTasks(initialUrlState.historyDate, { date: initialUrlState.historyDate });
          }
        }
      }
    } catch (err) {
      setError('Failed to load profiles: ' + err.message);
      // Ensure profiles remains an empty array even on error to prevent TypeError
      setSafeProfiles([]);
    }
  };

  // Cache for loaded tasks to avoid redundant API calls
  const tasksCache = useMemo(() => new Map(), []);
  const loadingRef = useRef(false);
  
  const loadTasks = async (profileId, forceRefresh = false) => {
    if (!profileId) {
      setTasks([]);
      setInitialRequest('');
      return;
    }

    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log('Load already in progress, skipping...');
      return;
    }

    // Check cache first unless force refresh
    if (!forceRefresh && tasksCache.has(profileId)) {
      const cachedData = tasksCache.get(profileId);
      setTasks(cachedData.tasks);
      setProjectRoot(cachedData.projectRoot);
      setInitialRequest(cachedData.initialRequest || '');
      setSummary(cachedData.summary || '');
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/tasks/${profileId}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received tasks data:', data.tasks?.length, 'tasks');
      console.log('Initial request in data:', data.initialRequest);
      
      // Check if there's a message about missing tasks.json
      if (data.message && data.tasks?.length === 0) {
        setError('');  // Clear any previous errors
        // Show informative message instead of error
        showToast(data.message, 'info', 7000);
      }
      
      // Cache the data
      tasksCache.set(profileId, {
        tasks: data.tasks || [],
        projectRoot: data.projectRoot || null,
        initialRequest: data.initialRequest || '',
        summary: data.summary || ''
      });
      
      setTasks(data.tasks || []);
      setProjectRoot(data.projectRoot || null);
      setInitialRequest(data.initialRequest || '');
      setSummary(data.summary || '');
    } catch (err) {
      setError('❌ Error loading tasks: ' + err.message);
      setTasks([]);
      setInitialRequest('');
      setSummary('');
    } finally {
      setLoading(false);
      loadingRef.current = false;
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
    
    // Reset history view when switching profiles
    if (historyView) {
      setHistoryView('');
      setHistoryData([]);
      setSelectedHistoryEntry(null);
      setSelectedHistoryTasks([]);
      setSelectedHistoryInitialRequest('');
      setSelectedHistorySummary('');
      setSelectedHistoryGeneratedRequest(false);
    }
    
    // Clear any stuck loading state and force reload
    loadingRef.current = false;
    setSelectedProfile(profileId);
    setGlobalFilter(''); // Clear search when switching profiles
    loadTasks(profileId, true); // Force refresh to bypass cache
    
    // Update URL when profile changes
    const urlState = {
      tab: selectedOuterTab,
      profile: profileId,
      projectTab: projectInnerTab,
      lang: currentLanguage
    };
    pushUrlState(urlState);
  };
  
  const handleOuterTabChange = (tab) => {
    setSelectedOuterTab(tab);
    
    // Reset states when switching outer tabs
    if (tab === 'templates') {
      loadTemplates();
      setTemplateView('list');
      setEditingTemplate(null);
    } else if (tab === 'projects' && profiles.length > 0) {
      // Reset history state when switching back to projects
      setHistoryView('');
      setHistoryData([]);
      setSelectedHistoryEntry(null);
      setSelectedHistoryTasks([]);
      setSelectedHistoryInitialRequest('');
      setSelectedHistorySummary('');
      setSelectedHistoryGeneratedRequest(false);
      
      // When switching back to projects, ensure a profile is selected
      if (!selectedProfile || selectedProfile === 'release-notes' || selectedProfile === 'help' || selectedProfile === 'templates') {
        const savedProfile = localStorage.getItem('selectedProfile');
        const safeProfiles = getSafeProfiles();
        if (savedProfile && safeProfiles.some(p => p.id === savedProfile)) {
          handleProfileChange(savedProfile);
        } else if (safeProfiles.length > 0) {
          handleProfileChange(safeProfiles[0].id);
        }
      }
    }
    
    // Update URL when tab changes
    const cleanState = cleanUrlStateForTab(tab, {
      tab,
      profile: selectedProfile,
      lang: currentLanguage,
      history: historyView,
      historyDate: selectedHistoryEntry?.date,
      templateView,
      templateId: editingTemplate?.name || previewingTemplate?.name
    });
    pushUrlState(cleanState);
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
        console.log('Sending profile with file path:', { name, filePath, projectRoot });
      } else {
        // File upload method
        const taskFileContent = await file.text();
        body = JSON.stringify({ 
          name, 
          taskFile: taskFileContent,
          projectRoot: projectRoot || null
        });
        console.log('Sending profile with file content');
      }

      console.log('Request body:', body);

      const response = await fetch('/api/add-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add profile');
      }

      const responseText = await response.text();
      let newProfile;
      try {
        newProfile = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response format from server');
      }
      console.log('New profile created:', newProfile);
      
      // Show success toast
      showToast(t('profileAddedSuccess', { name }), 'success');
      
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
      const errorMessage = 'Failed to add profile: ' + err.message;
      setError(errorMessage);
      showToast(errorMessage, 'error', 5000);
    }
  };

  const handleRemoveProfile = async (profileId) => {
    if (!confirm(t('confirmRemoveProfile'))) {
      return;
    }
    
    try {
      const response = await fetch(`/api/remove-project/${profileId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove profile');
      }

      // Find profile name for toast with defensive check
      const profile = getSafeProfiles().find(p => p.id === profileId);
      const profileName = profile ? profile.name : profileId;
      
      // Show success toast
      showToast(t('projectRemovedSuccess', { name: profileName }), 'success');
      
      // If we're removing the currently selected profile, clear selection
      if (selectedProfile === profileId) {
        setSelectedProfile('');
        setTasks([]);
        setInitialRequest('');
      }

      await loadProfiles();
    } catch (err) {
      const errorMessage = 'Failed to remove profile: ' + err.message;
      setError(errorMessage);
      showToast(errorMessage, 'error', 5000);
    }
  };

  const handleUpdateProfile = async (profileId, updates) => {
    try {
      const response = await fetch(`/api/update-project/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.status}`);
      }

      const updatedProfile = await response.json();
      
      // Update profiles in state with defensive check
      setSafeProfiles(prev => {
        const safeProfiles = Array.isArray(prev) ? prev : [];
        return safeProfiles.map(p => 
          p.id === profileId ? { ...p, ...updatedProfile } : p
        );
      });

      // Update projectRoot if it was changed
      if (updates.projectRoot !== undefined) {
        setProjectRoot(updates.projectRoot);
      }

      setShowEditProfile(false);
      setEditingProfile(null);

      // Reload tasks to reflect any changes (especially if task path was changed)
      loadTasks(profileId);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    }
  };

  // Template management functions
  const loadTemplates = async () => {
    setTemplatesLoading(true);
    setTemplatesError('');
    
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error(`Failed to load templates: ${response.status}`);
      }
      
      const data = await response.json();
      // Transform data to match TemplateManagement component expectations
      const templatesData = data.map(template => ({
        functionName: template.name,
        description: `${template.status} template from ${template.source}`,
        status: template.status,
        source: template.source,
        contentLength: template.contentLength,
        category: 'Task Management'
      }));
      
      setTemplates(templatesData);
    } catch (err) {
      setTemplatesError('❌ Error loading templates: ' + err.message);
      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleEditTemplate = async (template) => {
    if (!template) {
      setTemplatesError('No template provided for editing');
      return;
    }
    
    const functionName = template.functionName || template.name;
    if (!functionName) {
      setTemplatesError('Template is missing functionName');
      return;
    }
    
    try {
      setTemplateEditorLoading(true);
      const response = await fetch(`/api/templates/${functionName}`);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status}`);
      }
      
      const templateData = await response.json();
      setEditingTemplate({
        ...templateData,
        functionName
      });
      setTemplateView('edit');
    } catch (err) {
      setTemplatesError('Failed to load template for editing: ' + err.message);
      showToast('Failed to load template for editing', 'error');
    } finally {
      setTemplateEditorLoading(false);
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      setTemplateEditorLoading(true);
      setTemplatesError(''); // Clear any previous errors
      
      const response = await fetch(`/api/templates/${templateData.functionName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: templateData.content,
          mode: templateData.mode 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save template: ${response.status}`);
      }
      
      // Show success toast
      showToast(t('templateSavedSuccess', { name: templateData.functionName }), 'success');
      
      // Go back to list and reload templates
      setTemplateView('list');
      setEditingTemplate(null);
      loadTemplates();
    } catch (err) {
      const errorMessage = 'Failed to save template: ' + err.message;
      setTemplatesError(errorMessage);
      showToast(errorMessage, 'error', 5000);
    } finally {
      setTemplateEditorLoading(false);
    }
  };

  const handleCancelTemplateEdit = () => {
    setTemplateView('list');
    setEditingTemplate(null);
  };

  const handleResetTemplate = async (template) => {
    const functionName = template.functionName;
    if (!confirm(t('confirmResetTemplate', { name: functionName }))) {
      return;
    }
    
    try {
      const response = await fetch(`/api/templates/${functionName}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reset template: ${response.status}`);
      }
      
      // Show success toast
      showToast(t('templateResetSuccess', { name: functionName }), 'success');
      
      // Reload templates to reflect changes
      loadTemplates();
    } catch (err) {
      const errorMessage = 'Failed to reset template: ' + err.message;
      setTemplatesError(errorMessage);
      showToast(errorMessage, 'error', 5000);
    }
  };

  const handleDuplicateTemplate = async (template) => {
    setDuplicatingTemplate(template);
    setTemplateView('duplicate');
  };

  const confirmDuplicateTemplate = async (newName) => {
    if (!duplicatingTemplate) return;
    
    const functionName = duplicatingTemplate.functionName;
    
    try {
      const response = await fetch(`/api/templates/${functionName}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to duplicate template: ${response.status}`);
      }
      
      // Show success toast
      showToast(t('templateDuplicatedSuccess', { name: newName }), 'success');
      
      // Return to template list
      setTemplateView('list');
      setDuplicatingTemplate(null);
      
      // Reload templates to reflect changes
      loadTemplates();
    } catch (err) {
      const errorMessage = 'Failed to duplicate template: ' + err.message;
      setTemplatesError(errorMessage);
      showToast(errorMessage, 'error', 5000);
      throw err; // Re-throw to handle in the view
    }
  };

  const handlePreviewTemplate = async (template) => {
    const functionName = template.functionName;
    try {
      const response = await fetch(`/api/templates/${functionName}`);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status}`);
      }
      
      const templateData = await response.json();
      // Ensure functionName is preserved in the previewing template
      setPreviewingTemplate({
        ...templateData,
        functionName: functionName,
        status: template.status // Also preserve status
      });
      setTemplateView('preview');
      setTemplatesError('');
    } catch (err) {
      setTemplatesError('Failed to load template for preview: ' + err.message);
      showToast('Failed to load template for preview', 'error');
    }
  };

  const handleActivateTemplate = async (template) => {
    // Ensure we have the full template data
    if (!template.content && template.functionName) {
      // Fetch the full template if we only have basic info
      try {
        const response = await fetch(`/api/templates/${template.functionName}`);
        if (response.ok) {
          const fullTemplate = await response.json();
          setTemplateToActivate(fullTemplate);
          setShowActivationDialog(true);
        } else {
          showToast('Failed to load template for activation', 'error');
        }
      } catch (err) {
        showToast('Error loading template: ' + err.message, 'error');
      }
    } else {
      // Show the activation dialog with the template we have
      setTemplateToActivate(template);
      setShowActivationDialog(true);
    }
  };


  // History management functions
  const loadHistory = async (profileId) => {
    if (!profileId) {
      setHistoryData([]);
      return;
    }

    setHistoryLoading(true);
    setHistoryError('');

    try {
      const response = await fetch(`/api/history/${profileId}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to load history: ${response.status}`);
      }
      
      const data = await response.json();
      setHistoryData(data.history || []);
      
      // Show message if no history found
      if (data.message && data.history?.length === 0) {
        showToast(data.message, 'info', 7000);
      }
    } catch (err) {
      setHistoryError('❌ Error loading history: ' + err.message);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadHistoryTasks = async (historyEntry) => {
    if (!selectedProfile || !historyEntry) return;
    
    setHistoryLoading(true);
    setHistoryError('');

    try {
      const response = await fetch(`/api/history/${selectedProfile}/${historyEntry.filename}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to load history tasks: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedHistoryTasks(data.tasks || []);
      setSelectedHistoryInitialRequest(data.initialRequest || '');
      setSelectedHistorySummary(data.summary || '');
      setSelectedHistoryGeneratedRequest(data.generatedInitialRequest || false);
      setSelectedHistoryEntry(historyEntry);
      setHistoryView('details');
    } catch (err) {
      setHistoryError('❌ Error loading history tasks: ' + err.message);
      setSelectedHistoryTasks([]);
      setSelectedHistoryInitialRequest('');
      setSelectedHistorySummary('');
      setSelectedHistoryGeneratedRequest(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Archive management function
  const loadArchives = (profileId) => {
    if (!profileId) {
      setArchives([]);
      return;
    }

    try {
      const storageKey = `task-archives-${profileId}`;
      const archivedData = localStorage.getItem(storageKey);
      const archives = archivedData ? JSON.parse(archivedData) : [];
      setArchives(archives);
    } catch (err) {
      console.error('Error loading archives:', err);
      setArchives([]);
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
    e.dataTransfer.dropEffect = 'move';
    
    // Clear drag-over state if index is -1 (leaving element)
    if (index === -1) {
      setDragOverIndex(null);
    } else {
      setDragOverIndex(index); // Visual feedback for drop target
    }
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
    
    // Save the new tab order to localStorage
    try {
      const profileOrder = newProfiles.map(profile => profile.id);
      localStorage.setItem('profileTabOrder', JSON.stringify(profileOrder));
      debugLog('AppContent', 'Tab order saved to localStorage', { profileOrder });
    } catch (error) {
      debugLog('AppContent', 'Failed to save tab order to localStorage', { error: error.message });
    }
    
    // Update state and clear drag indicators
    setSafeProfiles(newProfiles);
    setDraggedTabIndex(null);
    setDragOverIndex(null);
    
    // Show success feedback
    showToast('Project tab order updated', 'success');
  };

  // Memoized task statistics to avoid recalculation on every render
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in_progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    
    debugLog('AppContent', 'Stats Calculated', { total, completed, inProgress, pending });
    return { total, completed, inProgress, pending };
  }, [tasks]);
  
  // Debug panel state - only include relevant app state
  const debugAppState = useMemo(() => ({
    selectedProfile,
    selectedOuterTab,
    projectInnerTab,
    urlStateInitialized,
    loading,
    stats,
    profiles: profiles.length,
    tasks: tasks.length,
    currentLanguage,
    performanceStats: {
      renderCount: performanceData.renderCount,
      lifespan: performanceData.getLifespan()
    }
  }), [selectedProfile, selectedOuterTab, projectInnerTab, urlStateInitialized, loading, stats, profiles.length, tasks.length, currentLanguage, performanceData]);

  return (
    <ErrorBoundary name="AppContent" logProps={false}>
      <div className="app">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {showActivationDialog && (
        <ActivationDialog 
          template={templateToActivate}
          onClose={() => {
            setShowActivationDialog(false);
            setTemplateToActivate(null);
            showToast(t('rememberToRestartClaude'), 'info', 5000);
          }}
        />
      )}
      
      <header className="header">
        <h1>{t('appTitle')}</h1>
        <div className="header-content">
          <div className="version-info">
            <span>{t('header.version')} 4.1.0</span> • 
            <a href="#" onClick={(e) => {
              e.preventDefault();
              handleOuterTabChange('release-notes');
            }}>
              {t('releaseNotes')}
            </a> • 
            <a href="#" onClick={(e) => {
              e.preventDefault();
              handleOuterTabChange('readme');
            }}>
              {t('header.help')}
            </a> • 
            <a href="#" onClick={(e) => {
              e.preventDefault();
              handleOuterTabChange('templates');
            }}>
              {t('templates')}
            </a>
          </div>
          <LanguageSelector />
        </div>
      </header>

        <NestedTabs 
          profiles={profiles}
          selectedProfile={selectedProfile}
          handleProfileChange={handleProfileChange}
          handleRemoveProfile={handleRemoveProfile}
          setShowAddProfile={setShowAddProfile}
          projectInnerTab={projectInnerTab}
          tasks={tasks}
          setProjectInnerTab={(tab) => {
            setProjectInnerTab(tab);
            if (tab === 'history' && !historyData.length && selectedProfile) {
              loadHistory(selectedProfile);
            }
            if (tab === 'archive' && selectedProfile) {
              loadArchives(selectedProfile);
              // Reset archive view to list when entering archive tab
              setArchiveView('list');
              setSelectedArchive(null);
            }
            // Reset archive view when leaving archive tab
            if (projectInnerTab === 'archive' && tab !== 'archive') {
              setArchiveView('list');
              setSelectedArchive(null);
            }
            // Trigger refresh for agents tab to reset viewing state
            if (tab === 'agents') {
              setAgentsTabRefresh(prev => prev + 1);
            }
            // Trigger refresh for tasks tab to reset viewing state
            if (tab === 'tasks') {
              setTasksTabRefresh(prev => prev + 1);
              setForceResetDetailView(prev => prev + 1); // Reset task detail view
            }
            // Update URL
            pushUrlState({
              tab: 'projects',
              profile: selectedProfile,
              projectTab: tab,
              lang: currentLanguage
            });
          }}
          selectedOuterTab={selectedOuterTab}
          onOuterTabChange={handleOuterTabChange}
          draggedTabIndex={draggedTabIndex}
          dragOverIndex={dragOverIndex}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDragEnd={handleDragEnd}
          handleDrop={handleDrop}
          loading={loading}
          error={error}
          claudeFolderPath={claudeFolderPath}
          children={{
            tasks: !selectedProfile && profiles.length > 0 ? (
              <div className="content-container" name="no-profile-container">
                <div className="loading" name="no-profile-message" title="Choose a profile from the dropdown above">Select a profile to view tasks</div>
              </div>
            ) : profiles.length === 0 ? (
              <div className="content-container" name="no-profile-container">
                <div className="loading" name="no-profile-message" title={t('noProfilesAvailable')}>{t('noProfilesClickAddTab')}</div>
              </div>
            ) : loading && selectedProfile ? (
              <div className="content-container" name="loading-container">
                <div className="loading" name="loading-indicator" title="Loading tasks from file">Loading tasks... ⏳</div>
              </div>
            ) : error ? (
              <div className="error" name="error-message-display" title="Error information">{error}</div>
            ) : (
              <div className="content-container" name="main-content-area">
                <div className="stats-and-search-container" name="stats-and-search-row">
                  <div className="search-container" name="task-search-controls">
                    <input
                      type="text"
                      name="task-search-input"
                      className="search-input"
                      placeholder={t('searchTasksPlaceholder')}
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      title="Search and filter tasks by any text content"
                    />
                  </div>

                  <div className="stats-grid" name="task-statistics-display">
                    <div 
                      className={`stat-card clickable-stat ${statusFilter === 'all' ? 'active' : ''}`}
                      name="total-tasks-counter" 
                      title="Click to show all tasks"
                      onClick={() => setStatusFilter('all')}
                    >
                      <h3>{t('totalTasks')}</h3>
                      <div className="value">{stats.total}</div>
                    </div>
                    <div 
                      className={`stat-card clickable-stat ${statusFilter === 'completed' ? 'active' : ''}`}
                      name="completed-tasks-counter" 
                      title="Click to filter by completed tasks"
                      onClick={() => setStatusFilter('completed')}
                    >
                      <h3>{t('completed')}</h3>
                      <div className="value">{stats.completed}</div>
                    </div>
                    <div 
                      className={`stat-card clickable-stat ${statusFilter === 'in_progress' ? 'active' : ''}`}
                      name="in-progress-tasks-counter" 
                      title="Click to filter by tasks in progress"
                      onClick={() => setStatusFilter('in_progress')}
                    >
                      <h3>{t('inProgress')}</h3>
                      <div className="value">{stats.inProgress}</div>
                    </div>
                    <div 
                      className={`stat-card clickable-stat ${statusFilter === 'pending' ? 'active' : ''}`}
                      name="pending-tasks-counter" 
                      title="Click to filter by pending tasks"
                      onClick={() => setStatusFilter('pending')}
                    >
                      <h3>{t('pending')}</h3>
                      <div className="value">{stats.pending}</div>
                    </div>
                  </div>

                  <div className="controls-right" name="right-side-controls">
                    <button
                      name="export-tasks-button"
                      className="export-button"
                      onClick={() => setShowExportModal(true)}
                      disabled={loading || !selectedProfile || tasks.length === 0}
                      title="Export tasks to CSV or Markdown"
                      style={{
                        padding: '8px 12px',
                        marginRight: '8px',
                        backgroundColor: '#4fbdba',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: tasks.length > 0 && selectedProfile && !loading ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        opacity: tasks.length > 0 && selectedProfile && !loading ? 1 : 0.5
                      }}
                    >
                      📤 Export
                    </button>

                    <button
                      name="archive-tasks-button"
                      className="archive-button"
                      onClick={() => setShowArchiveModal(true)}
                      disabled={loading || !selectedProfile || tasks.length === 0}
                      title="Archive current tasks"
                      style={{
                        padding: '8px 12px',
                        marginRight: '8px',
                        backgroundColor: '#8b5cf6',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: tasks.length > 0 && selectedProfile && !loading ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        opacity: tasks.length > 0 && selectedProfile && !loading ? 1 : 0.5
                      }}
                    >
                      📦 Archive
                    </button>

                    <button 
                      name="refresh-profile-button"
                      className="refresh-button profile-refresh"
                      onClick={() => loadTasks(selectedProfile, true)} // Force refresh on manual click
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
                        {t('autoRefresh')}
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

                {/* Initial Request Display */}
                {initialRequest && (
                  <div style={{
                    backgroundColor: '#16213e',
                    border: '1px solid #2c3e50',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#4fbdba',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderBottom: initialRequestCollapsed ? 'none' : '1px solid #2c3e50'
                      }}
                      onClick={() => setInitialRequestCollapsed(!initialRequestCollapsed)}
                      title={initialRequestCollapsed ? 'Click to expand' : 'Click to collapse'}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          fontSize: '16px'
                        }}>📋</span>
                        {t('initialRequest', 'Initial Request')}
                      </div>
                      <span style={{
                        fontSize: '16px',
                        transition: 'transform 0.2s ease',
                        transform: initialRequestCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
                      }}>
                        ▼
                      </span>
                    </div>
                    {!initialRequestCollapsed && (
                      <div style={{
                        fontSize: '14px',
                        color: '#b8c5d6',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap',
                        padding: '16px',
                        transition: 'all 0.3s ease'
                      }}>
                        {initialRequest.replace(/\n要求:/g, '\nRequirements:').replace(/\n需求:/g, '\nRequirements:')}
                      </div>
                    )}
                  </div>
                )}

                {/* Summarize - positioned at task list level */}
                <FinalSummary
                  tasks={tasks}
                  projectId={selectedProfile}
                  onSummaryGenerated={(summary) => {
                    // Update the summary state when generated
                    setSummary(summary);
                  }}
                  existingSummary={summary}
                />

                <TaskTable 
                  data={tasks} 
                  globalFilter={globalFilter}
                  onGlobalFilterChange={setGlobalFilter}
                  statusFilter={statusFilter}
                  projectRoot={projectRoot}
                  emojiTemplates={{
                    robot: robotEmojiTemplate || getSafeProfiles().find(p => p.id === selectedProfile)?.robotEmojiTemplate,
                    arm: armEmojiTemplate || getSafeProfiles().find(p => p.id === selectedProfile)?.armEmojiTemplate
                  }}
                  onDetailViewChange={(inDetailView, inEditMode, taskId) => {
                    setIsInDetailView(inDetailView);
                    setIsInEditMode(inEditMode || false);
                    
                    // Set current task for chat context
                    if (inDetailView && taskId) {
                      const task = tasks.find(t => t.id === taskId);
                      setCurrentTask(task || null);
                    } else {
                      setCurrentTask(null);
                    }
                    
                    // Update URL when viewing/editing task
                    if (inDetailView && taskId) {
                      pushUrlState({
                        tab: 'projects',
                        profile: selectedProfile,
                        projectTab: 'tasks',
                        taskView: inEditMode ? 'edit' : 'view',
                        taskId: taskId,
                        lang: currentLanguage
                      });
                    } else {
                      // Clear task state when going back to list
                      pushUrlState({
                        tab: 'projects',
                        profile: selectedProfile,
                        projectTab: 'tasks',
                        lang: currentLanguage
                      });
                    }
                  }}
                  resetDetailView={forceResetDetailView}
                  profileId={selectedProfile}
                  onTaskSaved={async () => {
                    // Force refresh tasks after save
                    await loadTasks(selectedProfile, true);
                    showToast(t('taskSavedSuccess'), 'success');
                  }}
                  onDeleteTask={async (taskId) => {
                    try {
                      const response = await fetch(`/api/tasks/${selectedProfile}/${taskId}/delete`, {
                        method: 'DELETE'
                      });
                      
                      if (!response.ok) {
                        throw new Error('Failed to delete task');
                      }
                      
                      // Refresh tasks after delete
                      await loadTasks(selectedProfile, true);
                      showToast(t('taskDeletedSuccess'), 'success');
                    } catch (err) {
                      console.error('Error deleting task:', err);
                      showToast('Failed to delete task: ' + err.message, 'error');
                    }
                  }}
                />
              </div>
            ),
            history: (
              <div className="content-container" name="history-content-area">
                {historyView === 'details' ? (
                  <HistoryTasksView
                    tasks={selectedHistoryTasks}
                    historyEntry={selectedHistoryEntry}
                    loading={historyLoading}
                    error={historyError}
                    initialRequest={selectedHistoryInitialRequest}
                    summary={selectedHistorySummary}
                    generatedInitialRequest={selectedHistoryGeneratedRequest}
                    onBack={() => {
                      setHistoryView('list');
                      setSelectedHistoryEntry(null);
                      setSelectedHistoryTasks([]);
                      setSelectedHistoryInitialRequest('');
                      setSelectedHistorySummary('');
                      setSelectedHistoryGeneratedRequest(false);
                    }}
                  />
                ) : (
                  <HistoryView
                    data={historyData}
                    loading={historyLoading}
                    error={historyError}
                    onViewTasks={loadHistoryTasks}
                    onBack={null} // No back button needed in tab view
                    onDeleteHistory={handleDeleteHistory}
                    onImportHistory={(historyEntry) => {
                      setSelectedHistoryEntry(historyEntry);
                      setShowImportHistoryModal(true);
                      // Load the full history data for import
                      loadHistoryTasks(historyEntry);
                    }}
                    profileId={selectedProfile}
                  />
                )}
              </div>
            ),
            archive: (
              <div className="content-container" name="archive-content-area">
                {archiveView === 'details' && selectedArchive ? (
                  <ArchiveDetailView
                    archive={selectedArchive}
                    onBack={() => {
                      setArchiveView('list');
                      setSelectedArchive(null);
                    }}
                    projectRoot={projectRoot}
                  />
                ) : (
                  <ArchiveView
                    archives={archives}
                    loading={false}
                    error=""
                    onViewArchive={handleViewArchive}
                    onDeleteArchive={handleDeleteArchive}
                    onImportArchive={(archive) => {
                      setSelectedArchive(archive);
                      setShowImportModal(true);
                    }}
                    projectId={selectedProfile}
                  />
                )}
              </div>
            ),
            agents: (
              <ProjectAgentsView 
                profileId={selectedProfile} 
                projectRoot={projectRoot} 
                showToast={showToast}
                refreshTrigger={agentsTabRefresh}
                onAgentViewChange={(view, agentId) => {
                  // Update URL when viewing/editing agent
                  if (view && agentId) {
                    pushUrlState({
                      tab: 'projects',
                      profile: selectedProfile,
                      projectTab: 'agents',
                      agentView: view,
                      agentId: agentId,
                      lang: currentLanguage
                    });
                  } else {
                    // Clear agent state when going back to list
                    pushUrlState({
                      tab: 'projects',
                      profile: selectedProfile,
                      projectTab: 'agents',
                      lang: currentLanguage
                    });
                  }
                }}
              />
            ),
            settings: (
              <div className="content-container" name="settings-content-area">
                <div className="settings-panel">
                  <h2>{t('projectSettings')}</h2>
                  {getSafeProfiles().find(p => p.id === selectedProfile) && (
                    <form name="settings-form" onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const name = formData.get('name');
                      const taskPath = formData.get('taskPath');
                      const projectRoot = formData.get('projectRoot');
                      // Validate task path format
                      if (taskPath && !taskPath.trim().endsWith('.json')) {
                        setError('Task path must point to a .json file');
                        return;
                      }
                      
                      await handleUpdateProfile(selectedProfile, { 
                        name: name.trim(),
                        taskPath: taskPath?.trim() || null,
                        projectRoot: projectRoot || null,
                        robotEmojiTemplate: robotEmojiTemplate?.trim() || null,
                        armEmojiTemplate: armEmojiTemplate?.trim() || null
                      });
                      showToast(t('settingsSaved'), 'success');
                    }}>
                      <div className="form-group" name="profile-name-group">
                        <label htmlFor="settingsProfileName">{t('profileName')}:</label>
                        <input 
                          type="text" 
                          id="settingsProfileName"
                          name="name"
                          defaultValue={getSafeProfiles().find(p => p.id === selectedProfile)?.name}
                          placeholder="e.g., Team Alpha Tasks"
                          title="Edit the profile name"
                          required
                        />
                      </div>
                      <div className="form-group" name="task-path-group">
                        <label htmlFor="settingsTaskPath">{t('taskPath')}:</label>
                        <input 
                          type="text" 
                          id="settingsTaskPath"
                          name="taskPath"
                          defaultValue={getSafeProfiles().find(p => p.id === selectedProfile)?.taskPath || getSafeProfiles().find(p => p.id === selectedProfile)?.filePath || getSafeProfiles().find(p => p.id === selectedProfile)?.path || ''}
                          placeholder={t('taskPathPlaceholder')}
                          title={t('taskPathTitle')}
                          required
                        />
                        <span className="form-hint">
                          {t('taskPathHint')}
                        </span>
                      </div>
                      <div className="form-group" name="project-root-group">
                        <label htmlFor="settingsProjectRoot">{t('projectRoot')} ({t('optional')}):</label>
                        <input 
                          type="text" 
                          id="settingsProjectRoot"
                          name="projectRoot"
                          defaultValue={getSafeProfiles().find(p => p.id === selectedProfile)?.projectRoot || ''}
                          placeholder={t('projectRootEditPlaceholder')}
                          title={t('projectRootEditTitle')}
                        />
                        <span className="form-hint">
                          {t('projectRootEditHint')}
                        </span>
                      </div>
                      
                      {/* Emoji Template Configuration */}
                      <div className="form-group" name="robot-emoji-template-group">
                        <label htmlFor="robotEmojiTemplate">
                          🤖 {t('robotEmojiTemplate') || 'Robot Emoji Template'}:
                        </label>
                        <textarea 
                          id="robotEmojiTemplate"
                          name="robotEmojiTemplate"
                          rows="5"
                          cols="80"
                          value={robotEmojiTemplate}
                          onChange={(e) => setRobotEmojiTemplate(e.target.value)}
                          placeholder="use the built in subagent located in [AGENT] to complete this shrimp task: [UUID] please when u start working mark the shrimp task as in progress"
                          title="Template for robot emoji button. Use [AGENT] for agent path and [UUID] for task ID"
                          style={{ 
                            fontFamily: 'monospace', 
                            fontSize: '12px',
                            width: '100%',
                            minWidth: '600px',
                            minHeight: '120px',
                            resize: 'vertical'
                          }}
                        />
                        <span className="form-hint">
                          Use [AGENT] for agent path and [UUID] for task ID. Example: "use the built in subagent located in [AGENT] to complete this shrimp task: [UUID]"
                        </span>
                      </div>
                      
                      <div className="form-group" name="arm-emoji-template-group">
                        <label htmlFor="armEmojiTemplate">
                          🦾 {t('armEmojiTemplate') || 'Mechanical Arm Emoji Template'}:
                        </label>
                        <textarea 
                          id="armEmojiTemplate"
                          name="armEmojiTemplate"
                          rows="5"
                          cols="80"
                          value={armEmojiTemplate}
                          onChange={(e) => setArmEmojiTemplate(e.target.value)}
                          placeholder="Use task planner to execute this task: [UUID] using the role of [AGENT_NAME] agent"
                          title="Template for mechanical arm emoji button. Use [AGENT_NAME] for agent name and [UUID] for task ID"
                          style={{ 
                            fontFamily: 'monospace', 
                            fontSize: '12px',
                            width: '100%',
                            minWidth: '600px',
                            minHeight: '120px',
                            resize: 'vertical'
                          }}
                        />
                        <span className="form-hint">
                          Use [AGENT_NAME] for agent name and [UUID] for task ID. Special case: When agent is 'task manager', a simpler template is used.
                        </span>
                      </div>
                      
                      <div className="form-actions" name="settings-form-buttons">
                        <button 
                          type="submit" 
                          name="submit-settings"
                          className="primary-btn"
                          title="Save project settings"
                        >
                          {t('saveChanges')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ),
            releaseNotes: <ReleaseNotes />,
            readme: <Help />,
            templates: (
              <div className="content-container" name="templates-content-area">
                {templateView === 'list' ? (
                  <>
                    <div className="stats-and-search-container" name="templates-stats-and-search-row">
                      <div className="search-container" name="template-search-controls">
                        <input
                          type="text"
                          name="template-search-input"
                          className="search-input"
                          placeholder={t('searchTemplatesPlaceholder')}
                          value={globalFilter}
                          onChange={(e) => setGlobalFilter(e.target.value)}
                          title="Search and filter templates by function name or description"
                        />
                      </div>

                      <div className="stats-grid" name="template-statistics-display">
                        <div className="stat-card" name="total-templates-counter" title="Total number of templates">
                          <h3>Total Templates</h3>
                          <div className="value">{templates.length}</div>
                        </div>
                        <div className="stat-card" name="default-templates-counter" title="Number of default templates">
                          <h3>Default</h3>
                          <div className="value">{templates.filter(t => t.status === 'default').length}</div>
                        </div>
                        <div className="stat-card" name="custom-templates-counter" title="Number of custom templates">
                          <h3>Custom</h3>
                          <div className="value">{templates.filter(t => t.status === 'custom').length}</div>
                        </div>
                        <div className="stat-card" name="env-override-templates-counter" title="Number of environment overridden templates">
                          <h3>Env Override</h3>
                          <div className="value">{templates.filter(t => t.status.includes('env')).length}</div>
                        </div>
                      </div>

                      <div className="controls-right" name="template-controls-right">
                        <button 
                          name="refresh-templates-button"
                          className="refresh-button template-refresh"
                          onClick={() => loadTemplates()}
                          disabled={templatesLoading}
                          title="Refresh template data"
                        >
                          {templatesLoading ? '⏳' : '🔄'}
                        </button>
                      </div>
                    </div>

                    <TemplateManagement 
                      data={templates}
                      globalFilter={globalFilter}
                      onGlobalFilterChange={setGlobalFilter}
                      loading={templatesLoading}
                      error={templatesError}
                      onEditTemplate={handleEditTemplate}
                      onResetTemplate={handleResetTemplate}
                      onDuplicateTemplate={handleDuplicateTemplate}
                      onPreviewTemplate={handlePreviewTemplate}
                      onActivateTemplate={handleActivateTemplate}
                    />
                    
                    {templatesError && (
                      <div className="error" name="templates-error-message" title="Template error information">{templatesError}</div>
                    )}
                  </>
                ) : templateView === 'edit' ? (
                  // Template Editor View
                  <TemplateEditor
                    template={editingTemplate}
                    onSave={handleSaveTemplate}
                    onCancel={handleCancelTemplateEdit}
                    loading={templateEditorLoading}
                    error={templatesError}
                    onActivate={handleActivateTemplate}
                  />
                ) : templateView === 'preview' ? (
                  // Template Preview View
                  <TemplatePreview
                    template={previewingTemplate}
                    onBack={() => {
                      setTemplateView('list');
                      setPreviewingTemplate(null);
                    }}
                    onActivate={handleActivateTemplate}
                    onEdit={handleEditTemplate}
                    activating={activatingTemplate}
                  />
                ) : templateView === 'duplicate' ? (
                  // Template Duplicate View
                  <DuplicateTemplateView
                    template={duplicatingTemplate}
                    onBack={() => {
                      setTemplateView('list');
                      setDuplicatingTemplate(null);
                    }}
                    onConfirm={confirmDuplicateTemplate}
                  />
                ) : null}
              </div>
            ),
            globalSettings: (
              <GlobalSettingsView showToast={showToast} />
            ),
            subAgents: claudeFolderPath ? (
              <SubAgentsView 
                showToast={showToast} 
                onNavigateToSettings={() => handleOuterTabChange('global-settings')}
              />
            ) : (
              <div className="content-container">
                <div className="loading">
                  Claude folder path is not configured. Please configure it in{' '}
                  <span 
                    className="settings-link"
                    onClick={() => handleOuterTabChange('global-settings')}
                    style={{ 
                      color: '#3498db', 
                      cursor: 'pointer', 
                      textDecoration: 'underline',
                      fontWeight: 'bold'
                    }}
                    title="Click to go to settings"
                  >
                    Global Settings
                  </span>{' '}
                  to access Sub-Agents.
                </div>
              </div>
            )
          }}
        />

      {/* Export Modal */}
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        tasks={tasks}
      />

      {/* Archive Modal */}
      <ArchiveModal
        isOpen={showArchiveModal}
        onClose={() => setShowArchiveModal(false)}
        onConfirm={handleArchive}
        projectName={profiles?.find(p => p.id === selectedProfile)?.name || 'Unknown Project'}
        tasks={tasks}
        initialRequest={initialRequest}
      />

      {/* Import Archive Modal */}
      <ImportArchiveModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setSelectedArchive(null);
        }}
        onImport={handleImportArchive}
        archive={selectedArchive}
        currentTaskCount={tasks.length}
      />

      {/* Import History Modal - reuse ImportArchiveModal */}
      <ImportArchiveModal
        isOpen={showImportHistoryModal}
        onClose={() => {
          setShowImportHistoryModal(false);
          setSelectedHistoryEntry(null);
        }}
        onImport={handleImportHistory}
        archive={selectedHistoryEntry ? {
          id: selectedHistoryEntry.filename,
          date: selectedHistoryEntry.timestamp,
          projectName: selectedProfile,
          tasks: selectedHistoryTasks,
          initialRequest: selectedHistoryInitialRequest,
          summary: selectedHistorySummary,
          stats: selectedHistoryEntry.stats
        } : null}
        currentTaskCount={tasks.length}
      />



      {showAddProfile && (
        <div className="modal-overlay" name="add-profile-modal-overlay" onClick={() => setShowAddProfile(false)} title="Click outside to close">
          <div className="modal-content" name="add-profile-modal" onClick={(e) => e.stopPropagation()} title="Add new profile form">
            <h3>{t('addNewProfile')}</h3>
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
                <label htmlFor="profileName">{t('profileName')}:</label>
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
                <label htmlFor="folderPath">{t('taskFolderPath')}:</label>
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
                <label htmlFor="projectRoot">{t('projectRootPath')} ({t('optional')}):</label>
                <input 
                  type="text" 
                  id="projectRoot"
                  name="projectRoot"
                  placeholder="/path/to/your/project/root"
                  title="Optional: Enter the project root path for VS Code file links"
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
                  {t('addProject')}
                </button>
                <button 
                  type="button" 
                  name="cancel-add-profile"
                  className="secondary-btn" 
                  onClick={() => setShowAddProfile(false)}
                  title={t('cancelAndCloseDialog')}
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Chat Agent - Available on all pages when a profile is selected */}
      {selectedProfile && (
        <ChatAgent
          currentPage={
            selectedOuterTab === 'projects' 
              ? (isInDetailView ? 'task-detail' : (projectInnerTab === 'history' ? 'history' : projectInnerTab === 'settings' ? 'project-settings' : 'task-list'))
              : selectedOuterTab
          }
          currentTask={currentTask}
          tasks={tasks}
          profileId={selectedProfile}
          profileName={getSafeProfiles().find(p => p.id === selectedProfile)?.name}
          projectRoot={projectRoot}
          showToast={showToast}
          projectInnerTab={projectInnerTab}
          isInDetailView={isInDetailView}
          onTaskUpdate={async (taskId, updates) => {
            // Handle task updates from chat
            console.log('onTaskUpdate called with:', taskId, updates);
            console.log('Current task:', currentTask?.id);
            
            try {
              const response = await fetch(`/api/tasks/${selectedProfile}/update`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ taskId, updates })
              });
              
              console.log('Update response:', response.ok, response.status);
              
              if (response.ok) {
                // Update local state immediately for better UX
                if (currentTask && currentTask.id === taskId) {
                  console.log('Updating current task with:', updates);
                  setCurrentTask(prev => {
                    const updated = {
                      ...prev,
                      ...updates,
                      updatedAt: new Date().toISOString()
                    };
                    console.log('Updated current task:', updated);
                    return updated;
                  });
                }
                
                // Update the tasks list as well
                console.log('Updating tasks list');
                setTasks(prevTasks => 
                  prevTasks.map(task => 
                    task.id === taskId 
                      ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                      : task
                  )
                );
                
                return true;
              }
              return false;
            } catch (err) {
              console.error('Error updating task from chat:', err);
              return false;
            }
          }}
        />
      )}
      
      {/* Debug Panel - Available in development mode */}
      <DebugPanel 
        appState={debugAppState} 
        onStateUpdate={(updates) => {
          // Handle debug panel state updates if needed
          debugLog('DebugPanel', 'State Update Request', updates);
        }} 
      />
      </div>
    </ErrorBoundary>
  );
}

export default AppContent;
