// Optimized version of TaskTable with performance enhancements
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import TaskDetailView from './TaskDetailView';
import Tooltip from './Tooltip';
import AgentInfoModal from './AgentInfoModal';
import { useTranslation } from 'react-i18next';
import { generateTaskNumbers, getTaskNumber, convertDependenciesToNumbers, getTaskByNumber } from '../utils/taskNumbering';

// Performance optimization imports
import { debugLog, performanceMonitor } from '../utils/debug';
import { 
  usePerformanceMonitoring, 
  useDebugMemo, 
  useDebugCallback,
  useEventListener,
  useFetch
} from '../utils/optimizedHooks';
import { 
  optimizedMemo, 
  VirtualList, 
  OptimizedTableRow,
  DebouncedInput
} from '../utils/optimizedComponents';
import { fetchWithAnalytics } from '../utils/networkOptimization';
import ErrorBoundary from './ErrorBoundary';

// Memoized components for better performance
const MemoizedTaskDetailView = optimizedMemo(TaskDetailView, null, 'TaskDetailView');
const MemoizedAgentInfoModal = optimizedMemo(AgentInfoModal, null, 'AgentInfoModal');

function OptimizedTaskTable({ 
  data, 
  globalFilter, 
  onGlobalFilterChange, 
  projectRoot, 
  onDetailViewChange, 
  resetDetailView, 
  profileId, 
  onTaskSaved, 
  onDeleteTask, 
  showToast 
}) {
  const { t } = useTranslation();
  
  // Performance monitoring
  const performanceData = usePerformanceMonitoring('OptimizedTaskTable', {
    dataLength: data?.length || 0,
    profileId,
    globalFilter
  });
  
  // State with debugging
  const [selectedTask, setSelectedTask] = useState(null);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [savingAgents, setSavingAgents] = useState({});
  const [agentModalInfo, setAgentModalInfo] = useState({ isOpen: false, agent: null, taskId: null });
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Memoized task number mapping with debugging
  const taskNumberMap = useDebugMemo(
    () => generateTaskNumbers(data), 
    [data], 
    'TaskNumberMapping'
  );
  
  // Optimized agent loading with network optimization
  useEffect(() => {
    const loadAgents = async () => {
      if (!profileId) return;
      
      try {
        performanceMonitor.startTiming('load-agents');
        
        const agents = await fetchWithAnalytics(
          `/api/agents/combined/${profileId}`,
          {},
          {
            cache: true,
            cacheTTL: 2 * 60 * 1000, // 2 minutes cache for agents
            retry: 2
          }
        );
        
        setAvailableAgents(agents);
        performanceMonitor.endTiming('load-agents');
        
        debugLog('OptimizedTaskTable', 'Agents Loaded', {
          profileId,
          agentCount: agents.length
        });
        
      } catch (err) {
        debugLog('OptimizedTaskTable', 'Agent Load Error', {
          profileId,
          error: err.message
        });
        console.error('Error loading agents:', err);
      }
    };
    
    loadAgents();
  }, [profileId]);
  
  // Optimized detail view change handler
  const handleDetailViewChange = useDebugCallback((inDetailView, inEditMode, taskId) => {
    if (onDetailViewChange) {
      onDetailViewChange(inDetailView, inEditMode, taskId);
    }
  }, [onDetailViewChange], 'HandleDetailViewChange');
  
  // Memory leak prevention for detail view effects
  useEffect(() => {
    if (selectedTask) {
      if (selectedTask.editMode) {
        handleDetailViewChange(true, true, selectedTask?.id);
      } else {
        handleDetailViewChange(true, false, selectedTask?.id);
      }
    } else {
      handleDetailViewChange(false, false, null);
    }
  }, [selectedTask, handleDetailViewChange]);
  
  // Reset selected task when parent requests it
  useEffect(() => {
    debugLog('OptimizedTaskTable', 'Reset Detail View', { resetDetailView });
    if (resetDetailView && resetDetailView > 0) {
      setSelectedTask(null);
    }
  }, [resetDetailView]);
  
  // Optimized agent update function with retry logic
  const updateTaskAgent = useDebugCallback(async (taskId, newAgent) => {
    setSavingAgents(prev => ({ ...prev, [taskId]: true }));
    
    try {
      performanceMonitor.startTiming(`update-agent-${taskId}`);
      
      const response = await fetchWithAnalytics(
        `/api/tasks/${profileId}/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: taskId,
            updates: { agent: newAgent }
          })
        },
        {
          retry: 2,
          retryDelay: 500
        }
      );
      
      if (onTaskSaved) {
        await onTaskSaved();
      }
      
      performanceMonitor.endTiming(`update-agent-${taskId}`);
      
      debugLog('OptimizedTaskTable', 'Agent Updated Successfully', {
        taskId,
        newAgent,
        profileId
      });
      
    } catch (err) {
      debugLog('OptimizedTaskTable', 'Agent Update Error', {
        taskId,
        newAgent,
        error: err.message
      });
      console.error('Error updating agent:', err);
      
      if (showToast) {
        showToast(`Failed to update agent: ${err.message}`, 'error');
      }
    } finally {
      setSavingAgents(prev => {
        const newState = { ...prev };
        delete newState[taskId];
        return newState;
      });
    }
  }, [profileId, onTaskSaved, showToast], 'UpdateTaskAgent');
  
  // Memoized columns with optimization
  const columns = useDebugMemo(() => [
    {
      id: 'select',
      header: ({ table }) => {
        const isIndeterminate = selectedRows.size > 0 && selectedRows.size < data.length;
        const checkboxRef = React.useRef(null);
        
        React.useEffect(() => {
          if (checkboxRef.current) {
            checkboxRef.current.indeterminate = isIndeterminate;
          }
        }, [isIndeterminate]);
        
        return (
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={selectedRows.size === data.length && data.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRows(new Set(data.map(task => task.id)));
              } else {
                setSelectedRows(new Set());
              }
              setShowBulkActions(e.target.checked && data.length > 0);
            }}
          />
        );
      },
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.has(row.original.id)}
          onChange={(e) => {
            const newSelectedRows = new Set(selectedRows);
            if (e.target.checked) {
              newSelectedRows.add(row.original.id);
            } else {
              newSelectedRows.delete(row.original.id);
            }
            setSelectedRows(newSelectedRows);
            setShowBulkActions(newSelectedRows.size > 0);
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      size: 50,
    },
    {
      accessorKey: 'name',
      header: t('task.name'),
      cell: ({ row }) => {
        const task = row.original;
        const taskNumber = getTaskNumber(task.id, taskNumberMap);
        
        return (
          <div className="task-name-cell">
            <div className="task-number" title={`UUID: ${task.id}`}>
              #{taskNumber}
            </div>
            <div className="task-name-content">
              <strong>{task.name}</strong>
              {task.description && (
                <div className="task-description-preview">
                  {task.description.length > 100 
                    ? `${task.description.substring(0, 100)}...` 
                    : task.description}
                </div>
              )}
            </div>
          </div>
        );
      },
      size: 300,
    },
    {
      accessorKey: 'status',
      header: t('task.status'),
      cell: ({ getValue }) => (
        <span className={`status-badge status-${getValue()}`}>
          {getValue()?.replace('_', ' ')}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'agent',
      header: 'Agent',
      cell: ({ row }) => {
        const currentAgent = row.original.agent || '';
        const taskId = row.original.id;
        const isSaving = savingAgents[taskId] || false;
        
        return (
          <div className="agent-cell-wrapper">
            <select
              className="agent-table-select"
              value={currentAgent}
              style={(() => {
                const selectedAgent = availableAgents.find(a => a.name === currentAgent);
                if (selectedAgent?.color) {
                  return {
                    backgroundColor: selectedAgent.color,
                    color: '#ffffff',
                    borderColor: selectedAgent.color
                  };
                }
                return {};
              })()}
              onChange={(e) => {
                e.stopPropagation();
                updateTaskAgent(taskId, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              disabled={isSaving}
            >
              <option value="">No agent</option>
              {availableAgents.map((agent) => (
                <option 
                  key={agent.name} 
                  value={agent.name}
                  style={agent.color ? { backgroundColor: agent.color, color: '#ffffff' } : {}}
                >
                  {agent.name}
                </option>
              ))}
            </select>
            <button
              className="agent-info-button"
              onClick={(e) => {
                e.stopPropagation();
                if (currentAgent && currentAgent !== '') {
                  const agentData = availableAgents.find(a => a.name === currentAgent) || currentAgent;
                  setAgentModalInfo({ isOpen: true, agent: agentData, taskId: taskId });
                }
              }}
              disabled={!currentAgent || currentAgent === ''}
              title={currentAgent ? `View info for ${currentAgent}` : 'Select an agent first'}
            >
              👁️
            </button>
            {isSaving && <span className="saving-indicator">💾</span>}
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: 'createdAt',
      header: t('created') + '/' + t('updated'),
      cell: ({ row }) => {
        const createdDate = new Date(row.original.createdAt);
        const updatedDate = new Date(row.original.updatedAt);
        return (
          <div className="task-dates">
            <div className="date-created">
              <small style={{ color: '#666', fontSize: '10px' }}>{t('created')}:</small><br />
              {createdDate.toLocaleDateString(undefined, {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
              })}{' '}
              {createdDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </div>
            <div className="date-updated" style={{ marginTop: '4px' }}>
              <small style={{ color: '#666', fontSize: '10px' }}>{t('updated')}:</small><br />
              {updatedDate.toLocaleDateString(undefined, {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit'
              })}{' '}
              {updatedDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </div>
          </div>
        );
      },
      size: 140,
    },
  ], [data, selectedRows, availableAgents, savingAgents, taskNumberMap, t, updateTaskAgent], 'TableColumns');
  
  // Optimized table configuration
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20, // Smaller page size for better performance
      },
    },
  });
  
  // Memoized filtered data for virtual scrolling
  const filteredData = useDebugMemo(
    () => table.getRowModel().rows,
    [table.getRowModel().rows],
    'FilteredTableData'
  );
  
  // Handle row click with optimization
  const handleRowClick = useDebugCallback((task) => {
    debugLog('OptimizedTaskTable', 'Row Clicked', { taskId: task.id });
    setSelectedTask(task);
  }, [], 'HandleRowClick');
  
  // If showing task detail, render that instead
  if (selectedTask) {
    return (
      <ErrorBoundary name="TaskDetailView" logProps={false}>
        <MemoizedTaskDetailView
          task={selectedTask}
          onBack={() => setSelectedTask(null)}
          onSave={onTaskSaved}
          onDelete={onDeleteTask}
          projectRoot={projectRoot}
          availableAgents={availableAgents}
          showToast={showToast}
        />
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary name="OptimizedTaskTable" logProps={false}>
      <div className="table-container">
        {/* Performance info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            fontSize: '10px',
            color: '#666',
            marginBottom: '8px',
            fontFamily: 'monospace'
          }}>
            Renders: {performanceData.renderCount} | 
            Lifespan: {(performanceData.getLifespan() / 1000).toFixed(1)}s | 
            Rows: {filteredData.length}
          </div>
        )}
        
        <div className="table-wrapper">
          <table className="task-table">
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
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanSort() && (
                        <span className="sort-indicator">
                          {header.column.getIsSorted() === 'asc' ? ' 🔼' : 
                           header.column.getIsSorted() === 'desc' ? ' 🔽' : ' ↕️'}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {/* Use virtual scrolling for large datasets */}
              {filteredData.length > 50 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <VirtualList
                      items={filteredData}
                      itemHeight={60}
                      containerHeight={400}
                      renderItem={(row, index) => (
                        <OptimizedTableRow
                          key={row.id}
                          rowData={row.original}
                          columns={columns}
                          onRowClick={() => handleRowClick(row.original)}
                          className={`table-row ${selectedRows.has(row.original.id) ? 'selected' : ''}`}
                        />
                      )}
                      getItemKey={(row) => row.id}
                    />
                  </td>
                </tr>
              ) : (
                // Regular rendering for smaller datasets
                filteredData.map(row => (
                  <tr 
                    key={row.id}
                    onClick={() => handleRowClick(row.original)}
                    className={`table-row ${selectedRows.has(row.original.id) ? 'selected' : ''}`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
        
        {/* Agent Modal */}
        {agentModalInfo.isOpen && (
          <MemoizedAgentInfoModal
            agent={agentModalInfo.agent}
            taskId={agentModalInfo.taskId}
            onClose={() => setAgentModalInfo({ isOpen: false, agent: null, taskId: null })}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default optimizedMemo(OptimizedTaskTable, null, 'OptimizedTaskTable');