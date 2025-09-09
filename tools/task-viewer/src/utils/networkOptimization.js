// Network optimization utilities for API calls
import { debugLog, debounce, requestCache, requestQueue, batchRequests } from './debug';

/**
 * Enhanced fetch with caching, retry, and performance monitoring
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {object} config - Optimization config
 */
export const optimizedFetch = async (url, options = {}, config = {}) => {
  const {
    cache = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    retry = 3,
    retryDelay = 1000,
    timeout = 10000,
    useQueue = false
  } = config;
  
  const startTime = performance.now();
  
  const fetchFunction = async () => {
    // Add timeout to request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const fetchOptions = {
        ...options,
        signal: controller.signal
      };
      
      debugLog('OptimizedFetch', 'Starting Request', { url, options: fetchOptions });
      
      let response;
      
      if (cache && options.method === 'GET') {
        // Use cached version if available
        try {
          const cachedData = await requestCache.fetchWithCache(url, fetchOptions, cacheTTL);
          const endTime = performance.now();
          debugLog('OptimizedFetch', 'Cache Hit', {
            url,
            duration: `${(endTime - startTime).toFixed(2)}ms`
          });
          return cachedData;
        } catch (error) {
          if (error.name === 'AbortError') {
            throw error;
          }
          // Continue with regular fetch if cache fails
          debugLog('OptimizedFetch', 'Cache Failed, Falling Back', { url, error: error.message });
        }
      }
      
      response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const endTime = performance.now();
      
      debugLog('OptimizedFetch', 'Request Completed', {
        url,
        status: response.status,
        duration: `${(endTime - startTime).toFixed(2)}ms`
      });
      
      return data;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        debugLog('OptimizedFetch', 'Request Timeout', { url, timeout });
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      throw error;
    }
  };
  
  // Retry logic
  let lastError;
  for (let attempt = 1; attempt <= retry; attempt++) {
    try {
      if (useQueue) {
        return await requestQueue.add(fetchFunction);
      } else {
        return await fetchFunction();
      }
    } catch (error) {
      lastError = error;
      
      debugLog('OptimizedFetch', `Attempt ${attempt} Failed`, {
        url,
        error: error.message,
        willRetry: attempt < retry
      });
      
      if (attempt < retry) {
        // Wait before retrying with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  debugLog('OptimizedFetch', 'All Attempts Failed', { url, error: lastError.message });
  throw lastError;
};

/**
 * Debounced search function
 * @param {function} searchFunction - Original search function
 * @param {number} delay - Debounce delay
 */
export const createDebouncedSearch = (searchFunction, delay = 300) => {
  return debounce(async (query) => {
    if (!query || query.length < 2) {
      return [];
    }
    
    debugLog('DebouncedSearch', 'Executing Search', { query, delay });
    
    try {
      return await searchFunction(query);
    } catch (error) {
      debugLog('DebouncedSearch', 'Search Error', { query, error: error.message });
      throw error;
    }
  }, delay);
};

/**
 * Batch API requests for multiple resources
 * @param {Array} requests - Array of request objects
 * @param {number} batchSize - Maximum batch size
 */
export const batchApiRequests = async (requests, batchSize = 10) => {
  if (!Array.isArray(requests) || requests.length === 0) {
    return [];
  }
  
  debugLog('BatchApiRequests', 'Starting Batch', {
    totalRequests: requests.length,
    batchSize
  });
  
  const results = [];
  const batches = [];
  
  // Split requests into batches
  for (let i = 0; i < requests.length; i += batchSize) {
    batches.push(requests.slice(i, i + batchSize));
  }
  
  // Process batches sequentially to avoid overwhelming the server
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    debugLog('BatchApiRequests', `Processing Batch ${i + 1}`, {
      batchNumber: i + 1,
      batchSize: batch.length,
      totalBatches: batches.length
    });
    
    try {
      // Execute all requests in the current batch concurrently
      const batchPromises = batch.map(async (request) => {
        try {
          return await optimizedFetch(request.url, request.options, request.config);
        } catch (error) {
          debugLog('BatchApiRequests', 'Request Failed in Batch', {
            url: request.url,
            error: error.message
          });
          return { error: error.message, url: request.url };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to be nice to the server
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      debugLog('BatchApiRequests', 'Batch Failed', {
        batchNumber: i + 1,
        error: error.message
      });
      
      // Add error results for this batch
      batch.forEach(request => {
        results.push({ error: error.message, url: request.url });
      });
    }
  }
  
  debugLog('BatchApiRequests', 'Batch Processing Complete', {
    totalResults: results.length,
    successfulResults: results.filter(r => !r.error).length,
    failedResults: results.filter(r => r.error).length
  });
  
  return results;
};

/**
 * API call analytics and monitoring
 */
export class ApiAnalytics {
  constructor() {
    this.calls = new Map();
    this.performance = new Map();
  }
  
  /**
   * Record an API call
   * @param {string} endpoint - API endpoint
   * @param {number} duration - Request duration in ms
   * @param {boolean} success - Whether the call was successful
   */
  recordCall(endpoint, duration, success) {
    if (!this.calls.has(endpoint)) {
      this.calls.set(endpoint, {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalDuration: 0,
        averageDuration: 0
      });
    }
    
    const stats = this.calls.get(endpoint);
    stats.totalCalls++;
    stats.totalDuration += duration;
    stats.averageDuration = stats.totalDuration / stats.totalCalls;
    
    if (success) {
      stats.successfulCalls++;
    } else {
      stats.failedCalls++;
    }
    
    debugLog('ApiAnalytics', 'Call Recorded', {
      endpoint,
      duration: `${duration.toFixed(2)}ms`,
      success,
      stats
    });
  }
  
  /**
   * Get analytics for an endpoint
   * @param {string} endpoint - API endpoint
   */
  getStats(endpoint) {
    return this.calls.get(endpoint) || null;
  }
  
  /**
   * Get all analytics
   */
  getAllStats() {
    const stats = {};
    for (const [endpoint, data] of this.calls) {
      stats[endpoint] = { ...data };
    }
    return stats;
  }
  
  /**
   * Get performance insights
   */
  getInsights() {
    const insights = {
      slowestEndpoints: [],
      mostUsedEndpoints: [],
      leastReliableEndpoints: []
    };
    
    const endpointStats = Array.from(this.calls.entries());
    
    // Slowest endpoints
    insights.slowestEndpoints = endpointStats
      .sort(([, a], [, b]) => b.averageDuration - a.averageDuration)
      .slice(0, 5)
      .map(([endpoint, stats]) => ({
        endpoint,
        averageDuration: stats.averageDuration
      }));
    
    // Most used endpoints
    insights.mostUsedEndpoints = endpointStats
      .sort(([, a], [, b]) => b.totalCalls - a.totalCalls)
      .slice(0, 5)
      .map(([endpoint, stats]) => ({
        endpoint,
        totalCalls: stats.totalCalls
      }));
    
    // Least reliable endpoints
    insights.leastReliableEndpoints = endpointStats
      .filter(([, stats]) => stats.totalCalls >= 5) // Only consider endpoints with enough calls
      .sort(([, a], [, b]) => {
        const reliabilityA = a.successfulCalls / a.totalCalls;
        const reliabilityB = b.successfulCalls / b.totalCalls;
        return reliabilityA - reliabilityB;
      })
      .slice(0, 5)
      .map(([endpoint, stats]) => ({
        endpoint,
        reliability: (stats.successfulCalls / stats.totalCalls * 100).toFixed(1) + '%'
      }));
    
    return insights;
  }
  
  /**
   * Clear all analytics
   */
  clear() {
    this.calls.clear();
    this.performance.clear();
    debugLog('ApiAnalytics', 'Analytics Cleared', {});
  }
}

// Global API analytics instance
export const apiAnalytics = new ApiAnalytics();

/**
 * Enhanced fetch wrapper with analytics
 * @param {string} url - Request URL
 * @param {object} options - Fetch options
 * @param {object} config - Optimization config
 */
export const fetchWithAnalytics = async (url, options = {}, config = {}) => {
  const startTime = performance.now();
  let success = false;
  
  try {
    const result = await optimizedFetch(url, options, config);
    success = true;
    return result;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = performance.now() - startTime;
    apiAnalytics.recordCall(url, duration, success);
  }
};

// Expose to window for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.networkOptimization = {
    optimizedFetch,
    createDebouncedSearch,
    batchApiRequests,
    apiAnalytics,
    fetchWithAnalytics
  };
}