import React, { useState } from 'react';
import TaskTable from './TaskTable';
import MDEditor from '@uiw/react-md-editor';

const ArchiveDetailView = ({ 
  archive, 
  onBack,
  projectRoot = ''
}) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  
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
      day: 'numeric',
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

  return (
    <div className="archive-detail-view">
      {/* Header with Back Button */}
      <div style={{ 
        marginTop: '20px',
        marginBottom: '20px',
        marginLeft: '20px',
        marginRight: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={onBack}
          className="back-button"
          style={{
            backgroundColor: '#4fbdba',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#3da9a6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#4fbdba'}
        >
          ← Back to Archive List
        </button>
        
        <h2 style={{ 
          margin: 0, 
          color: '#8b5cf6',
          fontSize: '20px'
        }}>
          Archive from {formatDate(safeArchive.date || safeArchive.timestamp)}
        </h2>
      </div>

      {/* Archive Info */}
      <div style={{
        backgroundColor: '#2a2a2a',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        marginLeft: '20px',
        marginRight: '20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
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
              Total Tasks
            </div>
            <div style={{ color: '#fff', fontSize: '16px' }}>
              {stats.total}
            </div>
          </div>
          
          <div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
              Completed
            </div>
            <div style={{ color: '#4ade80', fontSize: '16px' }}>
              {stats.completed}
            </div>
          </div>
          
          <div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
              In Progress
            </div>
            <div style={{ color: '#facc15', fontSize: '16px' }}>
              {stats.inProgress}
            </div>
          </div>
          
          <div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>
              Pending
            </div>
            <div style={{ color: '#94a3b8', fontSize: '16px' }}>
              {stats.pending}
            </div>
          </div>
        </div>

        {/* Initial Request */}
        {safeArchive.initialRequest && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ 
              color: '#888', 
              fontSize: '12px', 
              marginBottom: '8px' 
            }}>
              Initial Request
            </div>
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '14px',
              color: '#e0e0e0',
              lineHeight: '1.5',
              maxHeight: '120px',
              overflowY: 'auto',
              border: '1px solid #333'
            }}>
              {safeArchive.initialRequest.replace(/\n要求:/g, '\nRequirements:').replace(/\n需求:/g, '\nRequirements:')}
            </div>
          </div>
        )}

        {/* Summary Section */}
        {safeArchive.summary && (
          <div style={{
            marginBottom: '20px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #333'
          }}>
            <div 
              onClick={() => setSummaryExpanded(!summaryExpanded)}
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#4fbdba',
                marginBottom: summaryExpanded ? '8px' : '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              Summary
              <span style={{ 
                fontSize: '12px', 
                color: '#888',
                transform: summaryExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s ease'
              }}>▼</span>
            </div>
            {summaryExpanded && (
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #333',
                borderRadius: '6px',
                animation: 'fadeIn 0.2s ease'
              }}>
                <MDEditor.Markdown 
                  source={safeArchive.summary}
                  style={{
                    backgroundColor: '#1a1a1a',
                    color: '#e0e0e0',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    padding: '12px'
                  }}
                  data-color-mode="dark"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ 
        marginBottom: '16px',
        marginLeft: '20px',
        marginRight: '20px'
      }}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px 12px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '6px',
            color: '#fff',
            fontSize: '14px'
          }}
        />
      </div>

      {/* Tasks Table */}
      <div className="archive-tasks-table" style={{
        marginLeft: '20px',
        marginRight: '20px'
      }}>
        <TaskTable
          data={safeArchive.tasks || []}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          // Read-only mode - no editing functions
          projectRoot={projectRoot}
          onDetailViewChange={() => {}}
          resetDetailView={0}
          profileId="archive"
          readOnly={true}
        />
      </div>
    </div>
  );
};

export default ArchiveDetailView;