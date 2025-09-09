// Enhanced debugging utilities for the Shrimp Task Viewer
// Based on the debugging agent specification

/**
 * Enhanced console logging with component context, data, and stack trace
 * @param {string} component - Component name
 * @param {string} action - Action description
 * @param {*} data - Data to log
 */
export const debugLog = (component, action, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`[${component}] ${action}`);
    console.log('Data:', data);
    console.log('Timestamp:', new Date().toISOString());
    console.trace('Stack trace');
    console.groupEnd();
  }
};

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measurements = new Map();
    this.observer = null;
    
    if (typeof window !== 'undefined') {
      this.initPerformanceObserver();
    }
  }
  
  initPerformanceObserver() {
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          debugLog('PerformanceMonitor', 'Performance Entry', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            entryType: entry.entryType
          });
        }
      });
      
      this.observer.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error);
    }
  }
  
  /**
   * Start timing a component or operation
   * @param {string} name - Name of the operation
   */
  startTiming(name) {
    if (typeof performance !== 'undefined') {
      const markName = `${name}-start`;
      performance.mark(markName);
      this.marks.set(name, markName);
    }
  }
  
  /**
   * End timing and measure duration
   * @param {string} name - Name of the operation
   */
  endTiming(name) {
    if (typeof performance !== 'undefined' && this.marks.has(name)) {
      const startMark = this.marks.get(name);
      const endMark = `${name}-end`;
      
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);
      
      // Store measurement
      const measure = performance.getEntriesByName(name, 'measure')[0];
      if (measure) {
        this.measurements.set(name, measure.duration);
      }
      
      this.marks.delete(name);
    }
  }
  
  /**
   * Get measurement by name
   * @param {string} name - Name of the measurement
   * @returns {number} Duration in milliseconds
   */
  getMeasurement(name) {
    return this.measurements.get(name);
  }
  
  /**
   * Get all measurements
   * @returns {Map} All measurements
   */
  getAllMeasurements() {
    return new Map(this.measurements);
  }
  
  /**
   * Clear all measurements
   */
  clearMeasurements() {
    this.measurements.clear();
    if (typeof performance !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

/**
 * Memory profiling utilities
 */
export const memoryProfiler = {
  /**
   * Profile current memory usage
   * @returns {object} Memory usage statistics
   */
  profile() {
    if (typeof performance !== 'undefined' && performance.memory) {
      const memory = {
        usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
        totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
        jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)
      };
      
      debugLog('MemoryProfiler', 'Memory Usage', memory);
      return memory;
    }
    
    console.warn('Memory API not available');
    return null;
  },
  
  /**
   * Log memory usage to console table
   */
  logMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      console.table({
        'Used JS Heap': `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        'Total JS Heap': `${(performance.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        'Limit': `${(performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  }
};

/**
 * Request Queue for managing concurrent API calls
 */
export class RequestQueue {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
  }
  
  async add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { request, resolve, reject } = this.queue.shift();
    
    try {
      debugLog('RequestQueue', 'Processing Request', {
        queueLength: this.queue.length,
        running: this.running
      });
      
      const result = await request();
      resolve(result);
    } catch (error) {
      debugLog('RequestQueue', 'Request Error', error);
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

/**
 * Request caching utility with TTL support
 */
export class RequestCache {
  constructor() {
    this.cache = new Map();
  }
  
  /**
   * Fetch with cache support
   * @param {string} url - Request URL
   * @param {object} options - Fetch options
   * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
   * @returns {Promise} Fetch response
   */
  async fetchWithCache(url, options = {}, ttl = 5 * 60 * 1000) {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < ttl) {
        debugLog('RequestCache', 'Cache Hit', { url, cacheKey });
        return cached.data;
      } else {
        debugLog('RequestCache', 'Cache Expired', { url, cacheKey });
        this.cache.delete(cacheKey);
      }
    }
    
    debugLog('RequestCache', 'Cache Miss - Fetching', { url, options });
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      // Cache the data
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      // Clear cache after TTL
      setTimeout(() => {
        if (this.cache.has(cacheKey)) {
          debugLog('RequestCache', 'Cache TTL Expired', { url, cacheKey });
          this.cache.delete(cacheKey);
        }
      }, ttl);
      
      return data;
    } catch (error) {
      debugLog('RequestCache', 'Fetch Error', { url, error: error.message });
      throw error;
    }
  }
  
  /**
   * Clear entire cache
   */
  clearCache() {
    this.cache.clear();
    debugLog('RequestCache', 'Cache Cleared', {});
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * Debounce utility for expensive operations
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
  let timeout;
  let result;
  
  const debounced = function(...args) {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
      }
    };
    
    const callNow = immediate && !timeout;
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      result = func.apply(context, args);
    }
    
    return result;
  };
  
  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  };
  
  return debounced;
}

/**
 * Batch requests utility
 * @param {Array} ids - Array of IDs to batch
 * @param {string} endpoint - API endpoint
 * @returns {Promise} Batch response
 */
export const batchRequests = async (ids, endpoint = '/api/batch') => {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }
  
  debugLog('BatchRequests', 'Batching Requests', { ids, endpoint });
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids })
    });
    
    if (!response.ok) {
      throw new Error(`Batch request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    debugLog('BatchRequests', 'Batch Error', error);
    throw error;
  }
};


/**
 * Memory leak detection utilities
 */
export const memoryLeakDetection = {
  /**
   * Create cleanup function for event listeners
   * @param {string} event - Event name
   * @param {function} handler - Event handler
   * @param {object} target - Event target (default: window)
   * @returns {function} Cleanup function
   */
  createEventListenerCleanup(event, handler, target = window) {
    target.addEventListener(event, handler);
    
    return () => {
      debugLog('MemoryLeakDetection', 'Cleaning Event Listener', { event, target });
      target.removeEventListener(event, handler);
    };
  },
  
  /**
   * Create cleanup function for timers
   * @param {function} callback - Timer callback
   * @param {number} delay - Timer delay
   * @param {boolean} isInterval - Whether it's an interval (default: false for timeout)
   * @returns {object} Timer ID and cleanup function
   */
  createTimerCleanup(callback, delay, isInterval = false) {
    const timerId = isInterval ? setInterval(callback, delay) : setTimeout(callback, delay);
    
    return {
      timerId,
      cleanup: () => {
        debugLog('MemoryLeakDetection', 'Cleaning Timer', { timerId, isInterval });
        if (isInterval) {
          clearInterval(timerId);
        } else {
          clearTimeout(timerId);
        }
      }
    };
  },
  
  /**
   * Create cleanup function for fetch requests
   * @param {string} url - Request URL
   * @param {object} options - Fetch options
   * @returns {object} Abort controller and cleanup function
   */
  createFetchCleanup(url, options = {}) {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchPromise = fetch(url, { ...options, signal });
    
    return {
      fetchPromise,
      cleanup: () => {
        debugLog('MemoryLeakDetection', 'Aborting Fetch', { url });
        controller.abort();
      }
    };
  }
};

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Global request cache instance
export const requestCache = new RequestCache();

// Global request queue instance
export const requestQueue = new RequestQueue(3);

// Expose utilities to window for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.debugUtils = {
    debugLog,
    performanceMonitor,
    memoryProfiler,
    requestCache,
    requestQueue,
    debounce,
    batchRequests,
    memoryLeakDetection
  };
  
  // Add memory profiling shortcut
  window.profileMemory = memoryProfiler.logMemoryUsage;
}