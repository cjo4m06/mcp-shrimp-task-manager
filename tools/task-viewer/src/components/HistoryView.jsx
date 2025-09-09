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
  onDeleteHistory,
  onImportHistory,
  profileId
}) {
  const { t } = useTranslation();

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ getValue }) => {
        const id = getValue();
        // Show shortened ID (first 8 chars)
        return id ? id.substring(0, 8) : '-';
      },
      size: 100,
    },
    {
      accessorKey: 'timestamp',
      header: t('dateTime'),
      cell: ({ getValue }) => {
        const timestamp = getValue();
        if (!timestamp) return '-';
        const date = new Date(timestamp);
        return date.toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      },
      size: 180,
    },
    {
      accessorKey: 'initialRequest',
      header: t('initialRequest'),
      cell: ({ getValue }) => {
        const request = getValue();
        if (!request) return '-';
        // Truncate to 100 characters to match ArchiveView
        const truncated = request.length > 100 
          ? request.substring(0, 100) + '...' 
          : request;
        return (
          <div 
            title={request}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '300px'
            }}
          >
            {truncated}
          </div>
        );
      },
      size: 300,
    },
    {
      accessorKey: 'stats',
      header: t('statusSummary'),
      cell: ({ getValue }) => {
        const stats = getValue();
        return (
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            fontSize: '13px'
          }}>
            <span style={{ color: '#4ade80' }}>
              {stats.completed} {t('completed')}
            </span>
            <span style={{ color: '#facc15' }}>
              {stats.inProgress} {t('inProgress')}
            </span>
            <span style={{ color: '#94a3b8' }}>
              {stats.pending} {t('pending')}
            </span>
          </div>
        );
      },
      size: 250,
    },
    {
      accessorKey: 'actions',
      header: t('actions'),
      cell: ({ row }) => (
        <div className="actions-cell" style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onViewTasks) {
                onViewTasks(row.original);
              }
            }}
            title={t('viewTasks')}
            disabled={row.original.taskCount === 0}
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: '1px solid #555',
              borderRadius: '4px',
              color: row.original.taskCount === 0 ? '#555' : '#fff',
              cursor: row.original.taskCount === 0 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (row.original.taskCount > 0) {
                e.target.style.borderColor = '#4fbdba';
                e.target.style.backgroundColor = 'rgba(79, 189, 186, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#555';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            👁️
          </button>
          {onDeleteHistory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteHistory(row.original);
              }}
              title={t('delete')}
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: '1px solid #555',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#ef4444';
                e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#555';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              🗑️
            </button>
          )}
          {onImportHistory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onImportHistory(row.original);
              }}
              title={t('import')}
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: '1px solid #555',
                borderRadius: '4px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#8b5cf6';
                e.target.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#555';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              📥
            </button>
          )}
        </div>
      ),
      size: 150,
    },
  ], [onViewTasks, onDeleteHistory, onImportHistory, t]);

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
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#7f8c8d'
      }}>
        {t('loading')} ⏳
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#e74c3c'
      }}>
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        color: '#7f8c8d'
      }}>
        {t('noHistoryFound')}
      </div>
    );
  }

  return (
    <div className="history-view" style={{ 
      padding: '20px',
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(233, 213, 255, 0.05))'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2 style={{ 
            margin: 0,
            color: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📚 {t('projectHistory')}
          </h2>
          {onBack && (
            <button 
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

      <table 
        role="table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333'
        }}
      >
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id}
                  role="columnheader"
                  style={{ 
                    width: header.getSize(),
                    padding: '12px',
                    textAlign: 'left',
                    backgroundColor: '#2a2a2a',
                    borderBottom: '1px solid #444',
                    color: '#8b5cf6',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: header.column.getCanSort() ? 'pointer' : 'default'
                  }}
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
              role="row"
              style={{
                borderBottom: '1px solid #333'
              }}
            >
              {row.getVisibleCells().map(cell => (
                <td 
                  key={cell.id}
                  style={{
                    padding: '12px',
                    fontSize: '14px',
                    color: '#b8c5d6'
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          color: '#7f8c8d',
          fontSize: '14px'
        }}>
          {t('showing')} {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} {t('to')}{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          {t('of')} {table.getFilteredRowModel().rows.length} {t('historyEntries')}
        </div>
        
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            style={{
              padding: '4px 8px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: table.getCanPreviousPage() ? '#fff' : '#555',
              cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed'
            }}
          >
            {'<<'}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            style={{
              padding: '4px 8px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: table.getCanPreviousPage() ? '#fff' : '#555',
              cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed'
            }}
          >
            {'<'}
          </button>
          <span style={{ color: '#b8c5d6', fontSize: '14px' }}>
            {t('page')} {table.getState().pagination.pageIndex + 1} {t('of')}{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            style={{
              padding: '4px 8px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: table.getCanNextPage() ? '#fff' : '#555',
              cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed'
            }}
          >
            {'>'}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            style={{
              padding: '4px 8px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              color: table.getCanNextPage() ? '#fff' : '#555',
              cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed'
            }}
          >
            {'>>'}
          </button>
        </div>
      </div>

    </div>
  );
}

export default HistoryView;