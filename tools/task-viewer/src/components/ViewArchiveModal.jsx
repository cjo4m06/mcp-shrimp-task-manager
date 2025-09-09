import React, { useEffect, useState } from 'react';
import TaskTable from './TaskTable';

const ViewArchiveModal = ({ isOpen, onClose, archive }) => {
  const [globalFilter, setGlobalFilter] = useState('');

  // Handle undefined or null archive
  const safeArchive = archive || {
    date: new Date(),
    projectName: null,
    tasks: [],
    initialRequest: '',
    stats: null
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate stats from tasks if not provided
  const calculateStats = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) {
      return { total: 0, completed: 0, inProgress: 0, pending: 0 };
    }
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length
    };
  };

  const stats = safeArchive.stats || calculateStats(safeArchive.tasks);

  // Handle escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Focus close button for accessibility
      setTimeout(() => {
        const closeButton = document.querySelector('[data-testid="close-button"]');
        if (closeButton) {
          closeButton.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

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
      className="modal-overlay view-archive-modal" 
      data-testid="view-modal-overlay"
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div 
        className="modal-content"
        data-testid="view-modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-modal-title"
        style={{
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          width: '95vw',
          height: '90vh',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '20px 24px 16px 24px',
          borderBottom: '1px solid #333',
          flexShrink: 0
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '16px'
          }}>
            <h2 id="archive-modal-title" style={{ 
              margin: 0, 
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              👁️ View Archive
            </h2>
            <button
              data-testid="close-button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid #555',
                borderRadius: '6px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '8px 12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#777';
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#555';
                e.target.style.backgroundColor = 'transparent';
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Archive Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            backgroundColor: '#2a2a2a',
            borderRadius: '6px',
            padding: '16px'
          }}>
            <div>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                Project
              </div>
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>
                {safeArchive.projectName || 'Unknown Project'}
              </div>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
                Archived Date
              </div>
              <div style={{ color: '#fff', fontSize: '16px' }}>
                {formatDate(safeArchive.date)}
                {formatTime(safeArchive.date) && (
                  <div style={{ fontSize: '14px', color: '#aaa', marginTop: '2px' }}>
                    at {formatTime(safeArchive.date)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Initial Request */}
          {safeArchive.initialRequest && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ 
                color: '#888', 
                fontSize: '12px', 
                marginBottom: '8px' 
              }}>
                Initial Request
              </div>
              <div style={{
                backgroundColor: '#2a2a2a',
                borderRadius: '6px',
                padding: '12px',
                fontSize: '14px',
                color: '#e0e0e0',
                lineHeight: '1.5',
                maxHeight: '80px',
                overflowY: 'auto',
                border: '1px solid #333'
              }}>
                {safeArchive.initialRequest.replace(/\n要求:/g, '\nRequirements:').replace(/\n需求:/g, '\nRequirements:')}
              </div>
            </div>
          )}
        </div>

        {/* Task Table Container */}
        <div style={{ 
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: '16px 24px 8px 24px',
            borderBottom: '1px solid #333',
            flexShrink: 0
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              color: '#4fbdba', 
              fontSize: '16px' 
            }}>
              Tasks ({safeArchive.tasks ? safeArchive.tasks.length : 0})
            </h3>
            <input
              type="text"
              placeholder="Filter tasks..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '300px',
                padding: '8px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '0 24px'
          }}>
            <TaskTable
              data={safeArchive.tasks || []}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              // Read-only mode - no editing functions
              projectRoot=""
              onDetailViewChange={() => {}}
              resetDetailView={0}
              profileId="archive"
              onTaskSaved={() => {}}
              onDeleteTask={() => {}}
              showToast={() => {}}
            />
          </div>
        </div>

        {/* Footer with Stats */}
        <div style={{ 
          padding: '16px 24px',
          borderTop: '1px solid #333',
          flexShrink: 0
        }}>
          <div style={{ 
            color: '#4fbdba', 
            fontSize: '16px', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Task Statistics
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>
                {stats.completed}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                Completed
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#facc15' }}>
                {stats.inProgress}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                In Progress
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#94a3b8' }}>
                {stats.pending}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                Pending
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                Total
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewArchiveModal;