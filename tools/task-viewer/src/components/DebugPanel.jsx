import React, { useState, useEffect, useRef } from 'react';
import { 
  debugLog, 
  performanceMonitor, 
  memoryProfiler, 
  requestCache,
  requestQueue
} from '../utils/debug';

const DebugPanel = ({ appState = {}, onStateUpdate }) => {
  const [show, setShow] = useState(false);
  const [activeTab, setActiveTab] = useState('memory');
  const [memoryStats, setMemoryStats] = useState(null);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShow(prev => !prev);
        debugLog('DebugPanel', 'Toggle Debug Panel', { show: !show });
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [show]);
  
  // Auto-refresh stats
  useEffect(() => {
    if (autoRefresh && show) {
      intervalRef.current = setInterval(refreshStats, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, show]);
  
  // Refresh stats when panel opens
  useEffect(() => {
    if (show) {
      refreshStats();
    }
  }, [show]);
  
  const refreshStats = () => {
    // Memory stats
    const memory = memoryProfiler.profile();
    setMemoryStats(memory);
    
    // Performance stats
    const perfStats = {
      measurements: Array.from(performanceMonitor.getAllMeasurements()),
      navigationTiming: performance.getEntriesByType('navigation')[0] || null
    };
    setPerformanceStats(perfStats);
    
    // Cache stats
    setCacheStats(requestCache.getCacheStats());
  };
  
  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    debugLog('DebugPanel', 'Storage Cleared', {});
    alert('Storage cleared successfully');
  };
  
  const clearCache = () => {
    requestCache.clearCache();
    debugLog('DebugPanel', 'Request Cache Cleared', {});
    setCacheStats(requestCache.getCacheStats());
  };
  
  const clearPerformanceData = () => {
    performanceMonitor.clearMeasurements();
    setPerformanceStats(null);
    debugLog('DebugPanel', 'Performance Data Cleared', {});
  };
  
  const exportState = () => {
    const state = {
      appState,
      memoryStats,
      performanceStats,
      cacheStats,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-state-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const forceReRender = () => {
    if (onStateUpdate) {
      onStateUpdate({ forceRerender: Date.now() });
    } else {
      // Force a re-render by updating a dummy state
      window.dispatchEvent(new Event('debug-rerender'));
    }
    debugLog('DebugPanel', 'Force Re-render Triggered', {});
  };
  
  const simulateError = () => {
    debugLog('DebugPanel', 'Simulating Error', {});
    throw new Error('Debug Panel: Simulated error for testing Error Boundary');
  };
  
  if (!show) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#1f2937',
        color: '#f3f4f6',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace',
        cursor: 'pointer',
        border: '1px solid #374151',
        zIndex: 10000
      }} onClick={() => setShow(true)}>
        🐛 Debug (Ctrl+Shift+D)
      </div>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      backgroundColor: '#1f2937',
      color: '#f3f4f6',
      fontFamily: 'Inter, monospace',
      fontSize: '12px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.3)',
      borderLeft: '1px solid #374151'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #374151',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🐛</span>
          <strong>Debug Panel</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ margin: 0 }}
            />
            Auto
          </label>
          <button
            onClick={() => setShow(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f3f4f6',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #374151'
      }}>
        {['memory', 'performance', 'network', 'state', 'actions'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: activeTab === tab ? '#374151' : 'transparent',
              border: 'none',
              color: '#f3f4f6',
              cursor: 'pointer',
              fontSize: '11px',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
        {activeTab === 'memory' && (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Memory Usage</h3>
            {memoryStats ? (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Used JS Heap:</strong> {memoryStats.usedJSHeapSize} MB
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Total JS Heap:</strong> {memoryStats.totalJSHeapSize} MB
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Heap Limit:</strong> {memoryStats.jsHeapSizeLimit} MB
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#374151',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${(parseFloat(memoryStats.usedJSHeapSize) / parseFloat(memoryStats.jsHeapSizeLimit)) * 100}%`,
                    height: '100%',
                    backgroundColor: '#10b981',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ) : (
              <div>Memory API not available</div>
            )}
            
            <button
              onClick={() => memoryProfiler.logMemoryUsage()}
              style={{
                padding: '6px 12px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Log to Console
            </button>
          </div>
        )}
        
        {activeTab === 'performance' && (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Performance</h3>
            {performanceStats?.measurements.length > 0 ? (
              <div style={{ marginBottom: '16px' }}>
                <strong>Measurements:</strong>
                {performanceStats.measurements.map(([name, duration]) => (
                  <div key={name} style={{ marginLeft: '8px', marginBottom: '4px' }}>
                    {name}: {duration.toFixed(2)}ms
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>No performance measurements available</div>
            )}
            
            {performanceStats?.navigationTiming && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Navigation Timing:</strong>
                <div style={{ marginLeft: '8px' }}>
                  <div>DOM Load: {performanceStats.navigationTiming.domContentLoadedEventEnd}ms</div>
                  <div>Page Load: {performanceStats.navigationTiming.loadEventEnd}ms</div>
                </div>
              </div>
            )}
            
            <button
              onClick={clearPerformanceData}
              style={{
                padding: '6px 12px',
                backgroundColor: '#ef4444',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Clear Data
            </button>
          </div>
        )}
        
        {activeTab === 'network' && (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Network & Cache</h3>
            {cacheStats && (
              <div style={{ marginBottom: '16px' }}>
                <div><strong>Cache Size:</strong> {cacheStats.size} entries</div>
                {cacheStats.keys.length > 0 && (
                  <details style={{ marginTop: '8px' }}>
                    <summary style={{ cursor: 'pointer' }}>Cached URLs</summary>
                    <div style={{ marginLeft: '8px', maxHeight: '150px', overflow: 'auto' }}>
                      {cacheStats.keys.map((key, index) => (
                        <div key={index} style={{ 
                          fontSize: '10px', 
                          marginBottom: '2px',
                          wordBreak: 'break-all'
                        }}>
                          {key}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={clearCache}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Clear Cache
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'state' && (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Application State</h3>
            <div style={{
              backgroundColor: '#374151',
              padding: '8px',
              borderRadius: '4px',
              maxHeight: '300px',
              overflow: 'auto'
            }}>
              <pre style={{ 
                margin: 0, 
                fontSize: '10px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(appState, null, 2)}
              </pre>
            </div>
            
            <button
              onClick={exportState}
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Export State
            </button>
          </div>
        )}
        
        {activeTab === 'actions' && (
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>Debug Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={clearStorage}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Clear Storage
              </button>
              
              <button
                onClick={() => console.clear()}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#6b7280',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Clear Console
              </button>
              
              <button
                onClick={forceReRender}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#8b5cf6',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Force Re-render
              </button>
              
              <button
                onClick={simulateError}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f59e0b',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Simulate Error
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Keyboard Shortcut Hint */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid #374151',
        fontSize: '10px',
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        Press Ctrl+Shift+D to toggle
      </div>
    </div>
  );
};

export default DebugPanel;