import React, { useMemo, useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import TaskDetailView from './TaskDetailView';

function TaskTable({ data, globalFilter, onGlobalFilterChange, projectRoot, onDetailViewChange, resetDetailView }) {
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Reset selected task when parent requests it
  useEffect(() => {
    console.log('TaskTable: resetDetailView changed to:', resetDetailView);
    if (resetDetailView && resetDetailView > 0) {
      console.log('TaskTable: Resetting selected task to null');
      setSelectedTask(null);
    }
  }, [resetDetailView]);
  
  // Notify parent when detail view changes
  useEffect(() => {
    if (onDetailViewChange) {
      onDetailViewChange(!!selectedTask);
    }
  }, [selectedTask, onDetailViewChange]);
  // Define table columns configuration with custom cell renderers
  const columns = useMemo(() => [
    {
      accessorKey: 'taskNumber',
      header: '#',
      cell: ({ row }) => (
        <span 
          className="task-number clickable"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(row.original.id);
            const element = e.target;
            element.classList.add('copied');
            setTimeout(() => {
              element.classList.remove('copied');
            }, 2000);
          }}
          title={`Click to copy UUID to clipboard: ${row.original.id}`}
        >
          TASK {row.index + 1}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'name',
      header: 'Task Name',
      cell: ({ row }) => (
        <div>
          <div className="task-name">{row.original.name}</div>
          <div className="task-meta">
            <span 
              className="task-id task-id-clickable"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(row.original.id);
                const element = e.target;
                element.classList.add('copied');
                setTimeout(() => {
                  element.classList.remove('copied');
                }, 2000);
              }}
              title="Click to copy UUID to clipboard"
            >
              ID: {row.original.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      ),
      size: 300,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ getValue }) => (
        <div className="task-description">
          {getValue()?.slice(0, 150)}
          {getValue()?.length > 150 ? '...' : ''}
        </div>
      ),
      size: 300,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <span className={`status-badge status-${getValue()}`}>
          {getValue()?.replace('_', ' ')}
        </span>
      ),
      size: 120,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return (
          <div className="task-meta">
            {date.toLocaleDateString()}<br />
            {date.toLocaleTimeString()}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated',
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return (
          <div className="task-meta">
            {date.toLocaleDateString()}<br />
            {date.toLocaleTimeString()}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: 'dependencies',
      header: 'Dependencies',
      cell: ({ row }) => {
        const dependencies = row.original.dependencies;
        if (!dependencies || !Array.isArray(dependencies) || dependencies.length === 0) {
          return <span style={{ color: '#666' }}>—</span>;
        }
        return (
          <div className="dependencies-list">
            {dependencies.map((dep, index) => {
              // Handle both string IDs and object dependencies
              let depId;
              if (typeof dep === 'string') {
                depId = dep;
              } else if (dep && typeof dep === 'object' && dep.id) {
                depId = dep.id;
              } else if (dep && typeof dep === 'object' && dep.taskId) {
                depId = dep.taskId;
              } else {
                // Skip invalid dependencies
                return null;
              }
              
              return (
                <span key={depId}>
                  <a
                    href="#"
                    className="dependency-link"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Find the task with this ID
                      const depTask = data.find(t => t.id === depId);
                      if (depTask) {
                        setSelectedTask(depTask);
                      }
                    }}
                    title={`View task: ${depId}`}
                  >
                    {depId.slice(0, 8)}...
                  </a>
                  {index < dependencies.length - 1 && ', '}
                </span>
              );
            }).filter(Boolean)}
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="actions-cell">
          <button
            className="copy-button action-button"
            onClick={(e) => {
              e.stopPropagation();
              const instruction = `Use task manager to complete this shrimp task: ${row.original.id}`;
              navigator.clipboard.writeText(instruction);
              const button = e.target;
              button.textContent = '✓';
              setTimeout(() => {
                button.textContent = '🤖';
              }, 2000);
            }}
            title={`Copy the following to the clipboard: Use task manager to complete this shrimp task: ${row.original.id}`}
          >
            🤖
          </button>
        </div>
      ),
      size: 100,
    },
  ], [data, setSelectedTask]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },
  });

  if (data.length === 0) {
    return (
      <div className="loading">
        No tasks found in this profile
      </div>
    );
  }

  // If a task is selected, show the detail view
  if (selectedTask) {
    return (
      <TaskDetailView 
        task={selectedTask} 
        onBack={() => setSelectedTask(null)}
        projectRoot={projectRoot}
        onNavigateToTask={(taskId) => {
          const targetTask = data.find(t => t.id === taskId);
          if (targetTask) {
            setSelectedTask(targetTask);
          }
        }}
        taskIndex={data.findIndex(t => t.id === selectedTask.id)}
        allTasks={data}
      />
    );
  }

  // Otherwise, show the table
  return (
    <>
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
              className="clickable-row"
              onClick={() => setSelectedTask(row.original)}
              title="Click to view task details"
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
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} tasks
          {globalFilter && ` (filtered from ${data.length} total)`}
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
            Page {table.getState().pagination.pageIndex + 1} of{' '}
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
    </>
  );
}

export default TaskTable;