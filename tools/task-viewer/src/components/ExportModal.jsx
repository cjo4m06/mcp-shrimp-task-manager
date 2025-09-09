import React, { useState, useMemo } from 'react';
import { filterTasksByStatus } from '../utils/exportUtils';
import { exportCompletionReports } from '../utils/exportCompletions';

const ExportModal = ({ isOpen, onClose, onExport, tasks = [] }) => {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedStatuses, setSelectedStatuses] = useState(['completed', 'in_progress', 'pending']);

  // Filter tasks based on selected statuses
  const filteredTasks = useMemo(() => {
    return filterTasksByStatus(tasks, selectedStatuses);
  }, [tasks, selectedStatuses]);

  const handleStatusChange = (status) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleExport = async () => {
    // Handle completion report exports
    if (selectedFormat === 'completion-markdown' || selectedFormat === 'completion-json') {
      const format = selectedFormat === 'completion-markdown' ? 'markdown' : 'json';
      const options = {
        includeIncomplete: selectedStatuses.includes('pending') || selectedStatuses.includes('in_progress'),
        groupByAgent: false,
        groupByDate: true,
        includeDetails: true
      };
      
      try {
        exportCompletionReports(filteredTasks, format, options);
        onClose();
        return;
      } catch (error) {
        console.error('Export failed:', error);
        return;
      }
    }
    
    // Handle existing export formats
    const success = await onExport({
      format: selectedFormat,
      selectedStatuses,
      filteredTasks
    });

    // Close modal only if export was successful
    if (success) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="modal-overlay" 
      data-testid="modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        className="modal-content"
        data-testid="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '24px',
          minWidth: '400px',
          maxWidth: '500px',
          color: '#fff'
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '16px', color: '#4fbdba' }}>
          Export Tasks
        </h2>

        {/* Description */}
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px', 
          backgroundColor: '#0f1419', 
          borderRadius: '6px',
          border: '1px solid #2a3441',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#a0b0c0'
        }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: '500', color: '#4fbdba' }}>
            📋 Export your task data for backup, sharing, or analysis
          </p>
          <p style={{ margin: 0 }}>
            Save your carefully planned tasks for later review, share project progress with team members, 
            or import into other tools. Perfect for creating project documentation, progress reports, 
            or maintaining an archive of completed work.
          </p>
        </div>

        {/* File Format Selection */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>File Format</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="format"
                value="csv"
                checked={selectedFormat === 'csv'}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
              <div>
                <div>CSV</div>
                <div style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}>
                  Basic task info for spreadsheets
                </div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="format"
                value="markdown"
                checked={selectedFormat === 'markdown'}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
              <div>
                <div>Markdown</div>
                <div style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}>
                  Complete details including notes, files, dependencies
                </div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="format"
                value="completion-markdown"
                checked={selectedFormat === 'completion-markdown'}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
              <div>
                <div>Completion Report (Markdown)</div>
                <div style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}>
                  Detailed completion summaries for documentation
                </div>
              </div>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="format"
                value="completion-json"
                checked={selectedFormat === 'completion-json'}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
              <div>
                <div>Completion Report (JSON)</div>
                <div style={{ fontSize: '12px', color: '#888', fontWeight: 'normal' }}>
                  Structured completion data for analysis/reimport
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Status Filter */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Filter by Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedStatuses.includes('completed')}
                onChange={() => handleStatusChange('completed')}
              />
              Completed
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedStatuses.includes('in_progress')}
                onChange={() => handleStatusChange('in_progress')}
              />
              In Progress
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedStatuses.includes('pending')}
                onChange={() => handleStatusChange('pending')}
              />
              Pending
            </label>
          </div>
        </div>

        {/* Task Count Preview */}
        <div 
          style={{ 
            marginBottom: '24px', 
            padding: '12px', 
            backgroundColor: '#2a2a2a', 
            borderRadius: '4px',
            fontSize: '14px',
            color: '#ccc'
          }}
        >
          {filteredTasks.length} tasks selected for export
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #555',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={filteredTasks.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: filteredTasks.length > 0 ? '#4fbdba' : '#555',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: filteredTasks.length > 0 ? 'pointer' : 'not-allowed',
              opacity: filteredTasks.length > 0 ? 1 : 0.5
            }}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;