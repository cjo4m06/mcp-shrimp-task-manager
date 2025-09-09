import React from 'react';
import { debugLog } from '../utils/debug';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    const errorId = Date.now().toString(36);
    
    // Enhanced error logging
    debugLog('ErrorBoundary', 'Error Caught', {
      error: error.toString(),
      errorInfo,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Unknown',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId
    });
    
    // Log to error reporting service if available
    if (window.errorReporter) {
      window.errorReporter.log({
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        errorBoundary: this.props.name || 'Unknown',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId,
        props: this.props.logProps ? this.props : undefined
      });
    }
    
    // Store error details in state
    this.setState({
      error,
      errorInfo,
      errorId
    });
  }
  
  handleReload = () => {
    window.location.reload();
  }
  
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  }
  
  handleReportError = () => {
    if (this.state.error && this.state.errorInfo) {
      const errorReport = {
        error: this.state.error.toString(),
        stack: this.state.error.stack,
        componentStack: this.state.errorInfo.componentStack,
        errorBoundary: this.props.name || 'Unknown',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId
      };
      
      // Copy to clipboard
      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => {
          alert('Error report copied to clipboard');
        })
        .catch(() => {
          console.log('Error report:', errorReport);
          alert('Error report logged to console');
        });
    }
  }
  
  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleReset);
      }
      
      return (
        <div className="error-boundary" style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #e74c3c',
          borderRadius: '8px',
          backgroundColor: '#fdf2f2',
          color: '#721c24',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            <span style={{ marginRight: '8px', fontSize: '24px' }}>⚠️</span>
            Something went wrong in {this.props.name || 'this component'}
          </div>
          
          <p style={{ marginBottom: '16px', fontSize: '14px' }}>
            An unexpected error occurred while rendering this component. 
            This could be due to a network issue, data inconsistency, or a bug in the application.
          </p>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Error Details (Development Mode)
              </summary>
              
              <div style={{ marginBottom: '12px' }}>
                <strong>Error:</strong>
                <pre style={{
                  backgroundColor: '#f3f4f6',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto',
                  marginTop: '4px'
                }}>
                  {this.state.error.toString()}
                </pre>
              </div>
              
              {this.state.error.stack && (
                <div style={{ marginBottom: '12px' }}>
                  <strong>Stack Trace:</strong>
                  <pre style={{
                    backgroundColor: '#f3f4f6',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    overflow: 'auto',
                    marginTop: '4px',
                    maxHeight: '200px'
                  }}>
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              
              {this.state.errorInfo?.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre style={{
                    backgroundColor: '#f3f4f6',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    overflow: 'auto',
                    marginTop: '4px',
                    maxHeight: '150px'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </details>
          )}
          
          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              Try Again
            </button>
            
            <button
              onClick={this.handleReload}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              Reload Application
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={this.handleReportError}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
              >
                Copy Error Report
              </button>
            )}
          </div>
          
          {this.state.errorId && (
            <div style={{
              marginTop: '16px',
              padding: '8px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              Error ID: {this.state.errorId}
            </div>
          )}
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;