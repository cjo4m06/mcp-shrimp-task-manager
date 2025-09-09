// Higher-order components and utilities for performance optimization
import React, { memo, forwardRef, Suspense, lazy } from 'react';
import { debugLog, performanceMonitor } from './debug';
import { usePerformanceMonitoring } from './optimizedHooks';

/**
 * Enhanced React.memo with performance debugging
 * @param {React.Component} Component - Component to memoize
 * @param {function} areEqual - Custom comparison function
 * @param {string} displayName - Component display name
 */
export const optimizedMemo = (Component, areEqual = null, displayName = null) => {
  const MemoizedComponent = memo(Component, (prevProps, nextProps) => {
    const componentName = displayName || Component.displayName || Component.name;
    
    // Default shallow comparison if no custom function provided
    const isEqual = areEqual ? areEqual(prevProps, nextProps) : shallowEqual(prevProps, nextProps);
    
    debugLog('OptimizedMemo', `${componentName} Comparison`, {
      isEqual,
      prevProps,
      nextProps,
      skippedRender: isEqual
    });
    
    return isEqual;
  });
  
  MemoizedComponent.displayName = `OptimizedMemo(${displayName || Component.displayName || Component.name})`;
  
  return MemoizedComponent;
};

/**
 * Shallow equality comparison
 * @param {object} objA - First object
 * @param {object} objB - Second object
 * @returns {boolean} Whether objects are shallowly equal
 */
const shallowEqual = (objA, objB) => {
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) {
    return false;
  }
  
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (objA[key] !== objB[key]) {
      return false;
    }
  }
  
  return true;
};

/**
 * Performance monitoring HOC
 * @param {React.Component} Component - Component to monitor
 * @param {string} componentName - Component name for logging
 */
export const withPerformanceMonitoring = (Component, componentName = null) => {
  const PerformanceMonitoredComponent = (props) => {
    const name = componentName || Component.displayName || Component.name;
    const performanceData = usePerformanceMonitoring(name, props);
    
    // Start performance timing
    React.useEffect(() => {
      performanceMonitor.startTiming(name);
      return () => {
        performanceMonitor.endTiming(name);
      };
    });
    
    return <Component {...props} />;
  };
  
  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;
  
  return PerformanceMonitoredComponent;
};

/**
 * Lazy loading wrapper with error boundary
 * @param {function} importFunc - Dynamic import function
 * @param {React.Component} fallback - Loading fallback component
 * @param {string} chunkName - Webpack chunk name
 */
export const createLazyComponent = (importFunc, fallback = null, chunkName = null) => {
  const LazyComponent = lazy(() => {
    debugLog('LazyComponent', 'Loading Component', { chunkName });
    
    const startTime = performance.now();
    
    return importFunc().then(module => {
      const endTime = performance.now();
      debugLog('LazyComponent', 'Component Loaded', {
        chunkName,
        loadTime: `${(endTime - startTime).toFixed(2)}ms`
      });
      return module;
    }).catch(error => {
      debugLog('LazyComponent', 'Load Error', { chunkName, error: error.message });
      throw error;
    });
  });
  
  LazyComponent.displayName = `LazyComponent(${chunkName || 'Unknown'})`;
  
  return (props) => (
    <Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Virtual list component for rendering large datasets
 * @param {object} props - Component props
 */
export const VirtualList = memo(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  getItemKey = (item, index) => index,
  overscan = 5,
  className = '',
  style = {}
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleRange = React.useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [items.length, itemHeight, containerHeight, scrollTop, overscan]);
  
  const visibleItems = React.useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);
  
  const handleScroll = React.useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;
  
  debugLog('VirtualList', 'Render', {
    totalItems: items.length,
    visibleItems: visibleItems.length,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex
  });
  
  return (
    <div
      className={`virtual-list ${className}`}
      style={{
        height: containerHeight,
        overflowY: 'auto',
        ...style
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          paddingTop: offsetY,
          boxSizing: 'border-box'
        }}
      >
        {visibleItems.map((item, index) => {
          const actualIndex = visibleRange.startIndex + index;
          return (
            <div
              key={getItemKey(item, actualIndex)}
              style={{ height: itemHeight }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

/**
 * Intersection observer component for lazy loading
 */
export const LazyLoadTrigger = memo(({
  children,
  onIntersect,
  threshold = 0.1,
  rootMargin = '100px',
  triggerOnce = true
}) => {
  const [hasIntersected, setHasIntersected] = React.useState(false);
  const elementRef = React.useRef();
  
  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasIntersected)) {
          debugLog('LazyLoadTrigger', 'Element Intersected', {
            target: element,
            intersectionRatio: entry.intersectionRatio
          });
          
          onIntersect();
          
          if (triggerOnce) {
            setHasIntersected(true);
            observer.unobserve(element);
          }
        }
      },
      { threshold, rootMargin }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [onIntersect, threshold, rootMargin, triggerOnce, hasIntersected]);
  
  return (
    <div ref={elementRef}>
      {children}
    </div>
  );
});

LazyLoadTrigger.displayName = 'LazyLoadTrigger';

/**
 * Debounced input component
 */
export const DebouncedInput = memo(forwardRef(({
  value,
  onChange,
  debounceMs = 300,
  ...props
}, ref) => {
  const [localValue, setLocalValue] = React.useState(value);
  const timeoutRef = React.useRef();
  
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  const handleChange = React.useCallback((event) => {
    const newValue = event.target.value;
    setLocalValue(newValue);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      debugLog('DebouncedInput', 'Value Changed', { value: newValue });
      onChange(newValue);
    }, debounceMs);
  }, [onChange, debounceMs]);
  
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return (
    <input
      {...props}
      ref={ref}
      value={localValue}
      onChange={handleChange}
    />
  );
}));

DebouncedInput.displayName = 'DebouncedInput';

/**
 * Optimized table row component with shallow comparison
 */
export const OptimizedTableRow = memo(({
  rowData,
  columns,
  onRowClick,
  className = '',
  style = {}
}) => {
  const handleRowClick = React.useCallback(() => {
    if (onRowClick) {
      onRowClick(rowData);
    }
  }, [onRowClick, rowData]);
  
  return (
    <tr
      className={className}
      style={style}
      onClick={handleRowClick}
    >
      {columns.map((column, index) => (
        <td key={column.key || index}>
          {typeof column.render === 'function' ? column.render(rowData) : rowData[column.key]}
        </td>
      ))}
    </tr>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for table row
  return (
    JSON.stringify(prevProps.rowData) === JSON.stringify(nextProps.rowData) &&
    prevProps.className === nextProps.className &&
    JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style) &&
    prevProps.columns === nextProps.columns &&
    prevProps.onRowClick === nextProps.onRowClick
  );
});

OptimizedTableRow.displayName = 'OptimizedTableRow';

/**
 * Error retry component for failed lazy loads
 */
export const ErrorRetry = ({ error, onRetry, className = '' }) => (
  <div className={`error-retry ${className}`} style={{
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #e74c3c',
    borderRadius: '8px',
    backgroundColor: '#fdf2f2',
    color: '#721c24'
  }}>
    <div style={{ marginBottom: '10px' }}>
      ⚠️ Failed to load component
    </div>
    <div style={{ fontSize: '12px', marginBottom: '15px', color: '#666' }}>
      {error?.message || 'Unknown error'}
    </div>
    <button
      onClick={onRetry}
      style={{
        padding: '8px 16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Retry
    </button>
  </div>
);

/**
 * Loading spinner component
 */
export const LoadingSpinner = memo(({ 
  size = 20, 
  color = '#3b82f6', 
  className = '' 
}) => (
  <div
    className={`loading-spinner ${className}`}
    style={{
      width: size,
      height: size,
      border: `2px solid ${color}33`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      display: 'inline-block'
    }}
  />
));

LoadingSpinner.displayName = 'LoadingSpinner';

// CSS for loading spinner animation (to be added to CSS file)
export const spinnerCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

export {
  shallowEqual
};