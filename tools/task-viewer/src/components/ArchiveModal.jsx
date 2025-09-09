import React from 'react';

const ArchiveModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  projectName, 
  tasks = [], 
  initialRequest 
}) => {
  // Calculate task statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  // Truncate initial request for display
  const truncatedRequest = initialRequest && initialRequest.length > 200 
    ? initialRequest.substring(0, 200) + '...' 
    : initialRequest;

  return (
    <div 
      className="modal-overlay" 
      data-testid="archive-modal-overlay"
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
        data-testid="archive-modal-content"
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
          📦 Archive Current Tasks
        </h2>

        {/* Archive Description */}
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
          <p style={{ margin: '0 0 12px 0' }}>
            This will archive all current tasks for this project. Archived task lists can be viewed, 
            imported, or deleted from the Archive tab.
          </p>
          <p style={{ margin: 0, color: '#7f8c8d', fontSize: '13px' }}>
            Archives are stored locally and will persist across sessions.
          </p>
        </div>

        {/* Project Information */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            marginBottom: '12px', 
            fontSize: '16px',
            color: '#4fbdba' 
          }}>
            Project Details
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
              <span style={{ color: '#888' }}>Project:</span>
              <span style={{ color: '#fff', fontWeight: '500' }}>
                {projectName || 'Unnamed Project'}
              </span>
            </div>

            <div style={{ 
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#888' }}>Total Tasks:</span>
              <span style={{ color: '#fff', fontWeight: '500' }}>
                {stats.total}
              </span>
            </div>

            {/* Task Status Breakdown */}
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #333'
            }}>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}>
                <span style={{ color: '#888' }}>✅ Completed:</span>
                <span style={{ color: '#4ade80' }}>{stats.completed}</span>
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px'
              }}>
                <span style={{ color: '#888' }}>🔄 In Progress:</span>
                <span style={{ color: '#facc15' }}>{stats.inProgress}</span>
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span style={{ color: '#888' }}>⏳ Pending:</span>
                <span style={{ color: '#94a3b8' }}>{stats.pending}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Initial Request Preview */}
        {initialRequest && (
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
            onClick={handleConfirm}
            disabled={stats.total === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: stats.total > 0 ? '#8b5cf6' : '#555',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              cursor: stats.total > 0 ? 'pointer' : 'not-allowed',
              opacity: stats.total > 0 ? 1 : 0.5,
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (stats.total > 0) {
                e.target.style.backgroundColor = '#7c3aed';
              }
            }}
            onMouseLeave={(e) => {
              if (stats.total > 0) {
                e.target.style.backgroundColor = '#8b5cf6';
              }
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;