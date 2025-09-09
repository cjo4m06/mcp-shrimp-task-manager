import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import AgentViewer from './AgentViewer';
import AgentEditor from './AgentEditor';

function AgentsListView({ 
  title = '🤖 Agents',
  subtitle = 'Manage your agents',
  isGlobal = false,
  profileId = null,
  projectRoot = null,
  showToast,
  refreshTrigger,
  onAgentViewChange,
  onNavigateToSettings
}) {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [viewingAgent, setViewingAgent] = useState(null);
  const [editingAgent, setEditingAgent] = useState(null);
  const [claudeFolderPath, setClaudeFolderPath] = useState('');
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // Load agents on mount and when dependencies change
  useEffect(() => {
    const initializeData = async () => {
      if (isGlobal) {
        await loadGlobalSettings();
      }
      if (isGlobal || profileId) {
        await loadAgents();
      }
    };
    initializeData();
  }, [isGlobal, profileId]);

  // Reset viewing/editing states when tab is clicked (refreshTrigger changes)
  useEffect(() => {
    if (refreshTrigger) {
      setViewingAgent(null);
      setEditingAgent(null);
      const refreshData = async () => {
        if (isGlobal) {
          await loadGlobalSettings();
        }
        await loadAgents();
      };
      refreshData();
    }
  }, [refreshTrigger]);

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
      setSettingsLoaded(true);
    }
  };

  const loadAgents = async () => {
    if (!isGlobal && !profileId) {
      setError('No profile selected');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const endpoint = isGlobal 
        ? '/api/agents/global'
        : `/api/agents/project/${profileId}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        if (response.status === 404) {
          const errorMsg = isGlobal 
            ? '📁 No agents directory found in Claude folder'
            : '📁 No .claude/agents directory found in this project';
          setError(errorMsg);
        } else {
          throw new Error(`Failed to load agents: ${response.status}`);
        }
        setData([]);
        return;
      }
      
      const agents = await response.json();
      setData(agents || []);
    } catch (err) {
      const errorMsg = isGlobal 
        ? '❌ Error loading global agents: ' + err.message
        : '❌ Error loading project agents: ' + err.message;
      setError(errorMsg);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (filename) => {
    if (filename.endsWith('.md')) return 'Markdown';
    if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'YAML';
    return 'Unknown';
  };

  const getFileTypeIcon = (filename) => {
    return '🤖';
  };

  // Define table columns configuration
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: t('agentName') || 'Agent Name',
      cell: ({ row }) => {
        const agentName = row.original.metadata?.name || row.original.name.replace(/\.(md|yaml|yml)$/, '');
        const color = row.original.metadata?.color;
        return (
          <div>
            <div className="task-name" style={color ? { 
              backgroundColor: color, 
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'inline-block'
            } : {}}>
              <span className="template-icon">{getFileTypeIcon(row.original.name)}</span>
              {agentName}
            </div>
            <div className="task-meta">
              <span className="task-id">
                {getFileType(row.original.name)}
              </span>
            </div>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: 'description',
      header: t('description') || 'Description',
      cell: ({ getValue, row }) => {
        // Use metadata description if available, otherwise fall back to content preview
        const description = row.original.metadata?.description || 
                         getValue() || 
                         row.original.content?.slice(0, 120) || 
                         'No description available';
        return (
          <div className="task-description">
            {description.slice(0, 120)}
            {description.length > 120 ? '...' : ''}
          </div>
        );
      },
      size: 300,
    },
    {
      accessorKey: 'tools',
      header: t('tools') || 'Tools',
      cell: ({ row }) => {
        const tools = row.original.metadata?.tools || [];
        // Debug logging
        console.log(`Agent ${row.original.name} metadata:`, row.original.metadata);
        if (tools.length === 0) {
          return <span className="tools-list">All tools</span>;
        }
        return (
          <div className="tools-list">
            {tools.map((tool, index) => (
              <span key={index} className="tool-badge">
                {tool}
              </span>
            ))}
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: 'aiInstruction',
      header: t('aiInstruction') || 'AI Instruction',
      cell: ({ row }) => {
        // Use absolute paths for both global and project agents
        const agentPath = isGlobal 
          ? `${claudeFolderPath || './claude'}/agents/${row.original.name}` 
          : `${projectRoot || '.'}/.claude/agents/${row.original.name}`;
        
        // Log for debugging
        console.log('Agent instruction generation:', {
          isGlobal,
          projectRoot,
          claudeFolderPath,
          agentName: row.original.name,
          agentPath
        });
        
        const instruction = `use subagent ${row.original.name} located in ${agentPath}:`;
        
        return (
          <div className="actions-cell">
            <button
              className="action-button robot-button"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(instruction);
                // Visual feedback
                const button = e.target.closest('.robot-button');
                button.textContent = '✓';
                button.classList.add('success');
                setTimeout(() => {
                  button.textContent = '🤖';
                  button.classList.remove('success');
                }, 1000);
                if (showToast) {
                  showToast('success', 'AI instruction copied to clipboard');
                }
              }}
              title={instruction}
            >
              🤖
            </button>
          </div>
        );
      },
      size: 80,
    },
    {
      accessorKey: 'actions',
      header: t('actions') || 'Actions',
      cell: ({ row }) => (
        <div className="actions-cell">
          <button
            className="action-button preview-button"
            onClick={(e) => {
              e.stopPropagation();
              setViewingAgent(row.original);
              onAgentViewChange?.('view', row.original.name);
            }}
            title={t('viewAgent') || 'View agent'}
          >
            👁️
          </button>
          <button
            className="action-button edit-button"
            onClick={(e) => {
              e.stopPropagation();
              setEditingAgent(row.original);
              onAgentViewChange?.('edit', row.original.name);
            }}
            title={t('editAgent') || 'Edit agent'}
          >
            ✏️
          </button>
        </div>
      ),
      size: 120,
    },
  ], [t, isGlobal, showToast]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  // Handle viewing agent with AgentViewer component
  if (viewingAgent) {
    return (
      <AgentViewer
        agent={viewingAgent}
        onBack={() => {
          setViewingAgent(null);
          onAgentViewChange?.(null, null);
        }}
        onEdit={(agent) => {
          setViewingAgent(null);
          setEditingAgent(agent);
          onAgentViewChange?.('edit', agent.name);
        }}
        isGlobal={isGlobal}
        profileId={profileId}
      />
    );
  }

  // Handle editing agent with AgentEditor component
  if (editingAgent) {
    return (
      <AgentEditor
        agent={editingAgent}
        onBack={() => {
          setEditingAgent(null);
          onAgentViewChange?.(null, null);
        }}
        onSave={() => {
          loadAgents(); // Refresh the list after save
        }}
        isGlobal={isGlobal}
        profileId={profileId}
        showToast={showToast}
      />
    );
  }

  // Handle no profile selected for project agents
  if (!isGlobal && !profileId) {
    return (
      <div className="template-management-view">
        <div className="template-management-header">
          <div className="header-content">
            <div className="header-text">
              <h2>{title}</h2>
              <p>Select a project to view its agents</p>
            </div>
          </div>
        </div>
        <div className="loading">
          {t('selectProfileToViewTasks') || 'Select a project to view tasks'}
        </div>
      </div>
    );
  }

  if (loading || (isGlobal && !settingsLoaded)) {
    const loadingPath = isGlobal 
      ? (claudeFolderPath ? `${claudeFolderPath}/agents` : 'Claude folder/agents')
      : (projectRoot ? `${projectRoot}/.claude/agents` : 'project/.claude/agents');
    
    return (
      <div className="template-management-view">
        <div className="template-management-header">
          <div className="header-content">
            <div className="header-text">
              <h2>{title}</h2>
              <p>Loading agents...</p>
            </div>
          </div>
        </div>
        <div className="loading">
          {isGlobal && !settingsLoaded ? 'Loading settings... ⏳' : `Loading agents from ${loadingPath}... ⏳`}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="template-management-view">
        <div className="template-management-header">
          <div className="header-content">
            <div className="header-text">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="error">
          {error}
          {error.includes('agents') && (
            <div style={{ marginTop: '10px', fontSize: '14px', opacity: 0.8 }}>
              <p>
                {isGlobal 
                  ? 'To use global agents, create an agents directory in your Claude folder and add .md or .yaml agent files.'
                  : 'To use project agents, create a .claude/agents directory in your project root and add .md or .yaml agent files.'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    const emptyPath = isGlobal 
      ? (claudeFolderPath ? `${claudeFolderPath}/agents` : 'Claude folder/agents')
      : (projectRoot ? `${projectRoot}/.claude/agents` : 'project/.claude/agents');
    
    return (
      <div className="template-management-view">
        <div className="template-management-header">
          <div className="header-content">
            <div className="header-text">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="loading">
          {isGlobal && !claudeFolderPath ? (
            <>
              Claude folder path is not configured. Please configure it in{' '}
              <span 
                className="settings-link"
                onClick={onNavigateToSettings}
                style={{ 
                  color: '#3498db', 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  fontWeight: 'bold'
                }}
                title="Click to go to settings"
              >
                settings
              </span>.
            </>
          ) : (
            <>
              No agents found in {emptyPath}.{' '}
              {isGlobal ? (
                <>
                  Make sure this directory exists and contains .md or .yaml agent files, or update the Claude folder path in{' '}
                  <span 
                    className="settings-link"
                    onClick={onNavigateToSettings}
                    style={{ 
                      color: '#3498db', 
                      cursor: 'pointer', 
                      textDecoration: 'underline',
                      fontWeight: 'bold'
                    }}
                    title="Click to go to settings"
                  >
                    settings
                  </span>.
                </>
              ) : (
                'Create a .claude/agents directory in your project root and add .md or .yaml agent files.'
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="template-management-view">
      <div className="template-management-header">
        <div className="header-content">
          <div className="header-text">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="stats-and-search-container">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder={t('searchTemplatesPlaceholder') || '🔍 Search agents...'}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            title="Search and filter agents by name or content"
          />
        </div>

        <div className="stats-grid">
          <div className="stat-card" title="Total number of agents">
            <h3>{t('totalTemplates') || 'Total Agents'}</h3>
            <div className="value">{data.length}</div>
          </div>
          <div className="stat-card" title="Number of Markdown agents">
            <h3>Markdown</h3>
            <div className="value">{data.filter(a => a.name.endsWith('.md')).length}</div>
          </div>
          <div className="stat-card" title="Number of YAML agents">
            <h3>YAML</h3>
            <div className="value">{data.filter(a => a.name.endsWith('.yaml') || a.name.endsWith('.yml')).length}</div>
          </div>
        </div>

        <div className="controls-right">
          <button 
            className="refresh-button"
            onClick={async () => {
              if (isGlobal) {
                await loadGlobalSettings();
              }
              await loadAgents();
            }}
            disabled={loading}
            title={isGlobal ? "Refresh settings and agent data" : "Refresh agent data"}
          >
            {loading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      <table className="table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id}
                  style={{ width: header.getSize() }}
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  className={header.column.getCanSort() ? 'sortable' : ''}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() && (
                    <span style={{ marginLeft: '8px' }}>
                      {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr 
              key={row.id}
              className="clickable-row template-row"
              onClick={() => {
                setViewingAgent(row.original);
                onAgentViewChange?.('view', row.original.name);
              }}
              title="Click to view agent details"
            >
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <div className="pagination-info">
          {t('showing') || 'Showing'} {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} {t('to') || 'to'}{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          {t('of') || 'of'} {table.getFilteredRowModel().rows.length} {t('agents') || 'agents'}
          {globalFilter && ` (${t('filteredFrom') || 'filtered from'} ${data.length} ${t('total') || 'total'})`}
        </div>
        
        <div className="pagination-controls">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <span>
            {t('page') || 'Page'} {table.getState().pagination.pageIndex + 1} {t('of') || 'of'}{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgentsListView;