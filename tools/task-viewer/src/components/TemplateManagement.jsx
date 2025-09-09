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

function TemplateManagement({ 
  data = [], 
  globalFilter, 
  onGlobalFilterChange, 
  loading = false, 
  error = '',
  onEditTemplate,
  onResetTemplate,
  onDuplicateTemplate,
  onPreviewTemplate,
  onActivateTemplate
}) {
  const { t } = useTranslation();

  
  // Define table columns configuration with custom cell renderers
  const columns = useMemo(() => [
    {
      accessorKey: 'functionName',
      header: () => t('function'),
      cell: ({ row }) => (
        <div>
          <div className="task-name">
            <span className="template-icon">🎨</span>
            {row.original.functionName}
          </div>
          <div className="task-meta">
            <span className="task-id">
              {row.original.category || 'General'}
            </span>
          </div>
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: 'description',
      header: () => t('description'),
      cell: ({ getValue }) => (
        <div className="task-description">
          {getValue()?.slice(0, 120)}
          {getValue()?.length > 120 ? '...' : ''}
        </div>
      ),
      size: 300,
    },
    {
      accessorKey: 'status',
      header: () => t('status'),
      cell: ({ getValue }) => {
        const status = getValue() || 'default';
        let statusText = status;
        let statusClass = `status-badge status-${status.toLowerCase()}`;
        
        switch (status.toLowerCase()) {
          case 'custom':
            statusText = t('statusCustom');
            statusClass = 'status-badge status-custom';
            break;
          case 'custom+append':
            statusText = t('statusCustomAppend');
            statusClass = 'status-badge status-custom-append';
            break;
          case 'env-override':
            statusText = t('statusEnvOverride');
            statusClass = 'status-badge status-env-override';
            break;
          case 'env-append':
            statusText = t('statusEnvAppend');
            statusClass = 'status-badge status-env-append';
            break;
          case 'default':
          default:
            statusText = t('statusDefault');
            statusClass = 'status-badge status-default';
            break;
        }
        
        return (
          <span className={statusClass}>
            {statusText}
          </span>
        );
      },
      size: 140,
    },
    {
      accessorKey: 'language',
      header: () => t('language'),
      cell: ({ getValue }) => {
        const language = getValue() || 'en';
        const languageMap = {
          'en': '🇺🇸 English',
          'zh': '🇹🇼 中文',
          'custom': '⚙️ Custom'
        };
        
        return (
          <div className="task-meta">
            {languageMap[language] || `🌐 ${language}`}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: 'actions',
      header: () => t('actions'),
      cell: ({ row }) => (
        <div className="actions-cell">
          <button
            className="action-button edit-button"
            onClick={(e) => {
              e.stopPropagation();
              if (onEditTemplate) {
                onEditTemplate(row.original);
              }
            }}
            title={t('edit')}
          >
            ✏️
          </button>
          <button
            className="action-button preview-button"
            onClick={(e) => {
              e.stopPropagation();
              if (onPreviewTemplate) {
                onPreviewTemplate(row.original);
              }
            }}
            title={t('preview')}
          >
            👁️
          </button>
          <button
            className="action-button duplicate-button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDuplicateTemplate) {
                onDuplicateTemplate(row.original);
              }
            }}
            title={t('duplicate')}
          >
            📋
          </button>
          <button
            className={`action-button activate-button ${row.original.status === 'default' ? 'disabled' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (row.original.status !== 'default' && onActivateTemplate) {
                onActivateTemplate(row.original);
              }
            }}
            disabled={row.original.status === 'default'}
            title={row.original.status === 'default' 
              ? t('defaultTemplateAlreadyActive') 
              : t('activateTemplate')}
          >
            🚀
          </button>
          <button
            className="action-button reset-button"
            onClick={(e) => {
              e.stopPropagation();
              if (onResetTemplate) {
                if (window.confirm(t('confirmResetTemplate', { name: row.original.functionName }))) {
                  onResetTemplate(row.original);
                }
              }
            }}
            title={t('resetToDefault')}
            disabled={row.original.status === 'default'}
          >
            🔄
          </button>
        </div>
      ),
      size: 180,
    },
  ], [onEditTemplate, onResetTemplate, onDuplicateTemplate, onPreviewTemplate, onActivateTemplate]);

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
        pageSize: 15,
      },
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
        {t('noTemplatesFound')}
      </div>
    );
  }

  return (
    <>
      <div className="template-management-header">
        <div className="header-content">
          <div className="header-text">
            <h2>{t('templateManagement')}</h2>
            <p>{t('templateManagementDesc')}</p>
          </div>
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
              title="Template row - use action buttons to manage"
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
          {t('of')} {table.getFilteredRowModel().rows.length} {t('templates')}
          {globalFilter && ` (${t('filteredFrom')} ${data.length} ${t('total')})`}
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

    </>
  );
}

export default TemplateManagement;