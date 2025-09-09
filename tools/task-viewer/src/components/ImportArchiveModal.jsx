import React, { useState } from 'react';

const ImportArchiveModal = ({ 
  isOpen, 
  onClose, 
  onImport, 
  archive, 
  currentTaskCount = 0 
}) => {
  const [importMode, setImportMode] = useState('append');

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImport = () => {
    onImport(importMode);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  // Handle undefined or null archive
  const safeArchive = archive || {
    date: new Date(),
    projectName: 'Unknown',
    tasks: [],
    initialRequest: ''
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Truncate initial request for display
  const truncatedRequest = safeArchive.initialRequest && safeArchive.initialRequest.length > 200 
    ? safeArchive.initialRequest.substring(0, 200) + '...' 
    : safeArchive.initialRequest;

  const taskCount = safeArchive.tasks ? safeArchive.tasks.length : 0;

  return (
    <div 
      className="modal-overlay" 
      data-testid="import-modal-overlay"
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
        data-testid="import-modal-content"
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
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '16px', 
          color: '#8b5cf6',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📥 Import Archive
        </h2>

        {/* Archive Details */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            marginBottom: '12px', 
            fontSize: '16px',
            color: '#4fbdba' 
          }}>
            Archive Details
          </h3>
          
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '14px'
          }}>
            <div style={{ 
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#888' }}>Date:</span>
              <span style={{ color: '#fff' }}>
                {formatDate(safeArchive.date)}
              </span>
            </div>

            <div style={{ 
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#888' }}>Project:</span>
              <span style={{ color: '#fff' }}>
                {safeArchive.projectName || 'Unknown'}
              </span>
            </div>

            <div style={{ 
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#888' }}>Archive Tasks:</span>
              <span style={{ color: '#fff' }}>
                {taskCount} tasks
              </span>
            </div>

            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#888' }}>Current tasks:</span>
              <span style={{ color: '#4fbdba', fontWeight: '500' }}>
                {currentTaskCount}
              </span>
            </div>
          </div>
        </div>

        {/* Initial Request Preview */}
        {truncatedRequest && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              marginBottom: '12px', 
              fontSize: '16px',
              color: '#4fbdba' 
            }}>
              Initial Request
            </h3>
            <div style={{
              backgroundColor: '#2a2a2a',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '13px',
              color: '#a0b0c0',
              lineHeight: '1.5',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {truncatedRequest}
            </div>
          </div>
        )}

        {/* Import Mode Selection */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            marginBottom: '12px', 
            fontSize: '16px',
            color: '#4fbdba' 
          }}>
            Import Mode
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px', 
              cursor: 'pointer',
              padding: '12px',
              backgroundColor: importMode === 'append' ? '#2a2a2a' : 'transparent',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: importMode === 'append' ? '#8b5cf6' : '#333',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name="importMode"
                value="append"
                checked={importMode === 'append'}
                onChange={(e) => setImportMode(e.target.value)}
                style={{ marginTop: '2px' }}
              />
              <div>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                  Append to current tasks
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Add archived tasks to your existing task list
                </div>
              </div>
            </label>

            <label style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px', 
              cursor: 'pointer',
              padding: '12px',
              backgroundColor: importMode === 'replace' ? '#2a2a2a' : 'transparent',
              borderRadius: '6px',
              border: '1px solid',
              borderColor: importMode === 'replace' ? '#8b5cf6' : '#333',
              transition: 'all 0.2s'
            }}>
              <input
                type="radio"
                name="importMode"
                value="replace"
                checked={importMode === 'replace'}
                onChange={(e) => setImportMode(e.target.value)}
                style={{ marginTop: '2px' }}
              />
              <div>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                  Replace all current tasks
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Remove all existing tasks and import only the archived ones
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Warning Message */}
        {importMode === 'replace' && (
          <div style={{ 
            marginBottom: '24px', 
            padding: '12px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '6px',
            color: '#ef4444'
          }}>
            <strong>Warning:</strong> This will permanently delete all {currentTaskCount} current tasks and replace them with the {taskCount} archived tasks.
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #555',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#777';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#555';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            style={{
              padding: '8px 16px',
              backgroundColor: '#8b5cf6',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#7c3aed';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#8b5cf6';
            }}
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportArchiveModal;