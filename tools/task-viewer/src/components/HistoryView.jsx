import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

function HistoryView({ 
  data = [], 
  loading = false, 
  error = '',
  onViewTasks,
  onBack,
  profileId
}) {
  const { t } = useTranslation();
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [savedNotes, setSavedNotes] = useState({});
  const [savingNote, setSavingNote] = useState(false);

  // Load notes from localStorage on mount
  React.useEffect(() => {
    if (!profileId) return;
    
    const storageKey = `history-notes-${profileId}`;
    const storedNotes = localStorage.getItem(storageKey);
    if (storedNotes) {
      try {
        setSavedNotes(JSON.parse(storedNotes));
      } catch (e) {
        console.error('Failed to parse stored notes:', e);
      }
    }
  }, [profileId]);

  // Save notes to localStorage whenever they change
  React.useEffect(() => {
    if (!profileId) return;
    
    const storageKey = `history-notes-${profileId}`;
    localStorage.setItem(storageKey, JSON.stringify(savedNotes));
  }, [savedNotes, profileId]);

  const columns = useMemo(() => [
    {
      accessorKey: 'timestamp',
      header: t('dateTime'),
      cell: ({ getValue }) => {
        const timestamp = getValue();
        // Convert to local time using the user's timezone
        const date = new Date(timestamp);
        return date.toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
      },
      size: 200,
    },
    {
      accessorKey: 'notes',
      header: t('notes'),
      cell: ({ row }) => {
        const noteKey = `${row.original.timestamp}`;
        const noteText = savedNotes[noteKey];
        const hasNote = !!noteText;
        
        return (
          <div 
            className="notes-cell"
            onClick={(e) => {
              e.stopPropagation();
              setEditingEntry(row.original);
              setNotesText(savedNotes[noteKey] || '');
              setShowNotesModal(true);
            }}
            style={{ cursor: 'pointer' }}
          >
            {hasNote ? (
              <div 
                className="notes-preview"
                title={noteText}
              >
                {noteText.slice(0, 150)}{noteText.length > 150 ? '...' : ''}
              </div>
            ) : (
              <button
                className="edit-notes-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingEntry(row.original);
                  setNotesText('');
                  setShowNotesModal(true);
                }}
                title={t('addNote')}
              >
                ✏️
              </button>
            )}
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: 'taskCount',
      header: t('taskCount'),
      cell: ({ getValue }) => (
        <div className="task-count">{getValue()}</div>
      ),
      size: 100,
    },
    {
      accessorKey: 'stats',
      header: t('statusSummary'),  
      cell: ({ getValue }) => {
        const stats = getValue();
        return (
          <div className="status-summary">
            <span className="status-item completed" title={t('completed')}>
              <span className="status-count">{stats.completed}</span> {t('completed')}
            </span>
            <span className="status-divider">•</span>
            <span className="status-item in-progress" title={t('inProgress')}>
              <span className="status-count">{stats.inProgress}</span> {t('inProgress')}
            </span>
            <span className="status-divider">•</span>
            <span className="status-item pending" title={t('pending')}>
              <span className="status-count">{stats.pending}</span> {t('pending')}
            </span>
          </div>
        );
      },
      size: 300,
    },
    {
      accessorKey: 'actions',
      header: t('actions'),
      cell: ({ row }) => (
        <div className="actions-cell">
          <button
            className="action-button view-button"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewTasks) {
                onViewTasks(row.original);
              }
            }}
            title={t('viewTasks')}
            disabled={row.original.taskCount === 0}
          >
            👁️
          </button>
        </div>
      ),
      size: 100,
    },
  ], [onViewTasks, t]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: 15 },
      sorting: [{ id: 'timestamp', desc: true }]
    },
  });

  if (loading) {
    return (
      <div className="loading">
        {t('loading')} ⏳
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="loading">
        {t('noHistoryFound')}
      </div>
    );
  }

  return (
    <div className="history-view">
      <div className="history-view-header">
        <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2>📚 {t('projectHistory')}</h2>
          {onBack && (
            <button 
              className="back-button" 
              onClick={onBack} 
              title={t('backToTasks')}
              style={{ 
                backgroundColor: '#8b5cf6', 
                color: 'white', 
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
            >
              ← {t('backToTasks')}
            </button>
          )}
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
              className="clickable-row history-row"
              onClick={() => {
                if (onViewTasks && row.original.taskCount > 0) {
                  onViewTasks(row.original);
                }
              }}
              style={{ cursor: row.original.taskCount > 0 ? 'pointer' : 'default' }}
              title={row.original.taskCount > 0 ? t('clickToViewTasks') : t('noTasksAvailable')}
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
          {t('showing')} {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} {t('to')}{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          {t('of')} {table.getFilteredRowModel().rows.length} {t('historyEntries')}
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
            {t('page')} {table.getState().pagination.pageIndex + 1} {t('of')}{' '}
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

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="modal-overlay" onClick={() => setShowNotesModal(false)}>
          <div className="modal-content notes-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('editNote')}</h3>
            <p className="modal-subtitle">
              {editingEntry && new Date(editingEntry.timestamp).toLocaleString(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
              })}
            </p>
            <textarea
              className="notes-textarea"
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder={t('enterNoteHere')}
              rows={6}
              autoFocus
            />
            <div className="modal-actions">
              <button
                className="primary-btn"
                onClick={() => {
                  if (editingEntry) {
                    const noteKey = `${editingEntry.timestamp}`;
                    setSavedNotes(prev => ({
                      ...prev,
                      [noteKey]: notesText
                    }));
                  }
                  setShowNotesModal(false);
                }}
              >
                {t('save')}
              </button>
              <button
                className="secondary-btn"
                onClick={() => setShowNotesModal(false)}
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryView;