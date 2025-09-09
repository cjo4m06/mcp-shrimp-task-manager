// Example component demonstrating memory leak prevention techniques
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  useEventListener, 
  useTimer, 
  useFetch,
  useLifecycleDebugger 
} from '../utils/optimizedHooks';
import { debugLog, memoryLeakDetection } from '../utils/debug';
import { optimizedMemo } from '../utils/optimizedComponents';

const MemoryLeakPreventionExample = ({ 
  profileId, 
  autoRefreshInterval = 30000,
  enableWebSocket = false 
}) => {
  const [data, setData] = useState(null);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // WebSocket reference with cleanup
  const webSocketRef = useRef(null);
  const intervalRef = useRef(null);
  const subscriptionRef = useRef(null);
  
  // Performance and lifecycle debugging
  useLifecycleDebugger('MemoryLeakPreventionExample', { 
    profileId, 
    autoRefreshInterval,
    enableWebSocket 
  });
  
  // 1. Event listener cleanup using custom hook
  const handleResize = useCallback(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);
  
  useEventListener('resize', handleResize, window, []);
  
  // 2. Mouse tracking with cleanup
  const handleMouseMove = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);
  
  useEventListener('mousemove', handleMouseMove, document, []);
  
  // 3. Timer cleanup using custom hook
  useTimer(() => {
    debugLog('MemoryLeakPreventionExample', 'Auto Refresh Timer', {
      profileId,
      timestamp: new Date().toISOString()
    });
    
    // Fetch new data if needed
    if (profileId) {
      fetchData();
    }
  }, autoRefreshInterval, true, [profileId]);
  
  // 4. Fetch with abort controller cleanup
  const { data: fetchedData, loading, error } = useFetch(
    profileId ? `/api/tasks/${profileId}` : null,
    {},
    [profileId]
  );
  
  useEffect(() => {
    if (fetchedData) {
      setData(fetchedData);
    }
  }, [fetchedData]);
  
  // 5. Manual fetch function with cleanup
  const fetchData = useCallback(async () => {
    if (!profileId) return;
    
    const { fetchPromise, cleanup } = memoryLeakDetection.createFetchCleanup(
      `/api/tasks/${profileId}`,
      { 
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    try {
      const response = await fetchPromise;
      const data = await response.json();
      setData(data);
      
      debugLog('MemoryLeakPreventionExample', 'Manual Fetch Completed', {
        profileId,
        dataLength: data?.tasks?.length || 0
      });
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        debugLog('MemoryLeakPreventionExample', 'Fetch Error', {
          profileId,
          error: error.message
        });
      }
    }
    
    // Store cleanup function for component unmount
    return cleanup;
  }, [profileId]);
  
  // 6. WebSocket connection with cleanup
  useEffect(() => {
    if (!enableWebSocket) return;
    
    const connectWebSocket = () => {
      try {
        const wsUrl = `ws://localhost:8080/ws/${profileId}`;
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setConnectionStatus('connected');
          debugLog('MemoryLeakPreventionExample', 'WebSocket Connected', { profileId });
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setData(prevData => ({ ...prevData, ...data }));
            debugLog('MemoryLeakPreventionExample', 'WebSocket Message', { data });
          } catch (error) {
            debugLog('MemoryLeakPreventionExample', 'WebSocket Parse Error', { 
              error: error.message 
            });
          }
        };
        
        ws.onerror = (error) => {
          setConnectionStatus('error');
          debugLog('MemoryLeakPreventionExample', 'WebSocket Error', { error });
        };
        
        ws.onclose = () => {
          setConnectionStatus('disconnected');
          debugLog('MemoryLeakPreventionExample', 'WebSocket Disconnected', { profileId });
        };
        
        webSocketRef.current = ws;
        
      } catch (error) {
        debugLog('MemoryLeakPreventionExample', 'WebSocket Connection Error', {
          error: error.message
        });
      }
    };
    
    if (profileId) {
      connectWebSocket();
    }
    
    // Cleanup function
    return () => {
      if (webSocketRef.current) {
        debugLog('MemoryLeakPreventionExample', 'Cleaning WebSocket Connection', {});
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
    };
  }, [profileId, enableWebSocket]);
  
  // 7. Subscription cleanup example (for external libraries)
  useEffect(() => {
    // Simulate a subscription to an external service
    const subscription = {
      unsubscribe: () => {
        debugLog('MemoryLeakPreventionExample', 'Subscription Unsubscribed', {});
      }
    };
    
    subscriptionRef.current = subscription;
    
    // Simulate subscription setup
    debugLog('MemoryLeakPreventionExample', 'Subscription Created', { profileId });
    
    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [profileId]);
  
  // 8. Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Final cleanup log
      debugLog('MemoryLeakPreventionExample', 'Component Unmounting - Final Cleanup', {
        profileId,
        hadWebSocket: !!webSocketRef.current,
        hadSubscription: !!subscriptionRef.current
      });
      
      // Force cleanup of any remaining resources
      if (webSocketRef.current) {
        webSocketRef.current.close();
        webSocketRef.current = null;
      }
      
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []); // Empty dependency array for unmount cleanup only
  
  if (loading) {
    return (
      <div className="memory-leak-example loading">
        <div>Loading data for profile {profileId}...</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Window: {windowSize.width}x{windowSize.height} | 
          Mouse: ({mousePosition.x}, {mousePosition.y}) |
          WS: {connectionStatus}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="memory-leak-example error">
        <div>Error loading data: {error.message}</div>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }
  
  return (
    <div className="memory-leak-example">
      <h3>Memory Leak Prevention Example</h3>
      
      <div className="example-stats">
        <div>Profile ID: {profileId}</div>
        <div>Data Items: {data?.tasks?.length || 0}</div>
        <div>Window Size: {windowSize.width}x{windowSize.height}</div>
        <div>Mouse Position: ({mousePosition.x}, {mousePosition.y})</div>
        <div>WebSocket Status: {connectionStatus}</div>
        <div>Auto Refresh: {autoRefreshInterval / 1000}s</div>
      </div>
      
      <div className="example-actions">
        <button onClick={fetchData}>Manual Refresh</button>
        <button onClick={() => {
          if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
            webSocketRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }}>
          Send WebSocket Ping
        </button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info" style={{
          marginTop: '16px',
          padding: '8px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <div><strong>Memory Leak Prevention Techniques Demonstrated:</strong></div>
          <ul>
            <li>✅ Event listener cleanup (resize, mousemove)</li>
            <li>✅ Timer cleanup (auto-refresh interval)</li>
            <li>✅ Fetch abort controller cleanup</li>
            <li>✅ WebSocket connection cleanup</li>
            <li>✅ External subscription cleanup</li>
            <li>✅ Component unmount cleanup</li>
            <li>✅ Performance monitoring and debugging</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default optimizedMemo(MemoryLeakPreventionExample, null, 'MemoryLeakPreventionExample');