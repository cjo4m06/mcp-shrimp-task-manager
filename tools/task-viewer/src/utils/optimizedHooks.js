// Performance optimization hooks for React components
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { debugLog, debounce, memoryLeakDetection } from './debug';

/**
 * Enhanced useMemo with debugging
 * @param {function} factory - Factory function
 * @param {Array} deps - Dependencies
 * @param {string} name - Debug name
 * @returns {*} Memoized value
 */
export const useDebugMemo = (factory, deps, name = 'Unknown') => {
  const result = useMemo(() => {
    debugLog('useDebugMemo', `Computing ${name}`, { deps });
    const startTime = performance.now();
    const value = factory();
    const endTime = performance.now();
    debugLog('useDebugMemo', `Computed ${name}`, { 
      computationTime: `${(endTime - startTime).toFixed(2)}ms`,
      value 
    });
    return value;
  }, deps);
  
  return result;
};

/**
 * Enhanced useCallback with debugging
 * @param {function} callback - Callback function
 * @param {Array} deps - Dependencies
 * @param {string} name - Debug name
 * @returns {function} Memoized callback
 */
export const useDebugCallback = (callback, deps, name = 'Unknown') => {
  return useCallback((...args) => {
    debugLog('useDebugCallback', `Calling ${name}`, { args, deps });
    return callback(...args);
  }, deps);
};

/**
 * Debounced state hook
 * @param {*} initialValue - Initial value
 * @param {number} delay - Debounce delay in ms
 * @returns {[value, debouncedValue, setValue]} State tuple
 */
export const useDebouncedState = (initialValue, delay = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  
  const debouncedSetter = useMemo(
    () => debounce((newValue) => {
      setDebouncedValue(newValue);
    }, delay),
    [delay]
  );
  
  useEffect(() => {
    debouncedSetter(value);
    return () => debouncedSetter.cancel();
  }, [value, debouncedSetter]);
  
  return [value, debouncedValue, setValue];
};

/**
 * Performance monitoring hook
 * @param {string} componentName - Component name for logging
 * @param {object} props - Component props
 */
export const usePerformanceMonitoring = (componentName, props = {}) => {
  const renderCount = useRef(0);
  const mountTime = useRef(null);
  
  useEffect(() => {
    mountTime.current = performance.now();
    debugLog('Performance', `${componentName} Mounted`, {
      props,
      mountTime: mountTime.current
    });
    
    return () => {
      const unmountTime = performance.now();
      debugLog('Performance', `${componentName} Unmounted`, {
        lifespan: `${(unmountTime - mountTime.current).toFixed(2)}ms`,
        renderCount: renderCount.current
      });
    };
  }, [componentName]);
  
  useEffect(() => {
    renderCount.current++;
    debugLog('Performance', `${componentName} Rendered`, {
      renderCount: renderCount.current,
      props
    });
  });
  
  return {
    renderCount: renderCount.current,
    getLifespan: () => mountTime.current ? performance.now() - mountTime.current : 0
  };
};

/**
 * Memory leak prevention hook for event listeners
 * @param {string} eventName - Event name
 * @param {function} handler - Event handler
 * @param {object} target - Event target (default: window)
 * @param {Array} deps - Dependencies for handler
 */
export const useEventListener = (eventName, handler, target = window, deps = []) => {
  const savedHandler = useRef();
  
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler, ...deps]);
  
  useEffect(() => {
    if (!target?.addEventListener) return;
    
    const eventListener = (event) => savedHandler.current(event);
    const cleanup = memoryLeakDetection.createEventListenerCleanup(
      eventName, 
      eventListener, 
      target
    );
    
    return cleanup;
  }, [eventName, target]);
};

/**
 * Memory leak prevention hook for timers
 * @param {function} callback - Timer callback
 * @param {number} delay - Timer delay
 * @param {boolean} isInterval - Whether it's an interval
 * @param {Array} deps - Dependencies
 */
export const useTimer = (callback, delay, isInterval = false, deps = []) => {
  const savedCallback = useRef();
  const timerRef = useRef();
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback, ...deps]);
  
  useEffect(() => {
    const tick = () => savedCallback.current();
    
    if (delay !== null) {
      const timer = memoryLeakDetection.createTimerCleanup(tick, delay, isInterval);
      timerRef.current = timer.timerId;
      return timer.cleanup;
    }
  }, [delay, isInterval]);
  
  return {
    clear: () => {
      if (timerRef.current) {
        if (isInterval) {
          clearInterval(timerRef.current);
        } else {
          clearTimeout(timerRef.current);
        }
        timerRef.current = null;
      }
    }
  };
};

/**
 * Fetch hook with abort controller for memory leak prevention
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {Array} deps - Dependencies for refetch
 */
export const useFetch = (url, options = {}, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef();
  
  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      // Abort previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const { fetchPromise, cleanup } = memoryLeakDetection.createFetchCleanup(url, options);
      abortControllerRef.current = { abort: cleanup };
      
      try {
        const response = await fetchPromise;
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
          debugLog('useFetch', 'Fetch Error', { url, error: err.message });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, ...deps]);
  
  return { data, loading, error };
};

/**
 * Virtual scrolling hook for large lists
 * @param {Array} items - List items
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Height of container
 * @param {number} overscan - Number of items to render outside visible area
 */
export const useVirtualScrolling = (items, itemHeight, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex).map((item, index) => ({
        ...item,
        virtualIndex: startIndex + index
      })),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);
  
  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);
  
  return {
    visibleItems,
    handleScroll,
    containerStyle: {
      height: containerHeight,
      overflowY: 'auto'
    },
    innerStyle: {
      height: visibleItems.totalHeight,
      paddingTop: visibleItems.offsetY
    }
  };
};

/**
 * Intersection observer hook for lazy loading
 * @param {object} options - Intersection observer options
 */
export const useIntersectionObserver = (options = {}) => {
  const [entries, setEntries] = useState([]);
  const observer = useRef();
  
  const observe = useCallback((element) => {
    if (observer.current) {
      observer.current.observe(element);
    }
  }, []);
  
  const unobserve = useCallback((element) => {
    if (observer.current) {
      observer.current.unobserve(element);
    }
  }, []);
  
  useEffect(() => {
    observer.current = new IntersectionObserver((observedEntries) => {
      setEntries(observedEntries);
    }, {
      threshold: 0.1,
      rootMargin: '100px',
      ...options
    });
    
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [options.threshold, options.rootMargin, options.root]);
  
  return { entries, observe, unobserve };
};

/**
 * Local storage hook with memory optimization
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      debugLog('useLocalStorage', 'Parse Error', { key, error: error.message });
      return initialValue;
    }
  });
  
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      debugLog('useLocalStorage', 'Storage Error', { key, error: error.message });
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue];
};

/**
 * Previous value hook for debugging
 * @param {*} value - Current value
 */
export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

/**
 * Component lifecycle debugger hook
 * @param {string} componentName - Name of the component
 * @param {object} props - Component props
 */
export const useLifecycleDebugger = (componentName, props) => {
  useEffect(() => {
    debugLog(componentName, 'Mount', { props });
    return () => {
      debugLog(componentName, 'Unmount', { props });
    };
  }, [componentName]);
  
  useEffect(() => {
    debugLog(componentName, 'Props Update', { props });
  }, [componentName, props]);
};