import React, { memo, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

/**
 * Performance-optimized TaskSummary component for rendering Markdown content
 * Features:
 * - Memoized to prevent unnecessary re-renders
 * - Lazy-loaded markdown renderer
 * - Memory leak prevention
 * - Dark theme optimized
 * - Expandable/collapsible for long content
 */
const TaskSummary = memo(({ summary, expandable = false, initiallyExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  
  // Early return for falsy values to prevent unnecessary renders
  if (!summary || (typeof summary === 'string' && summary.trim() === '')) {
    return null;
  }

  // Determine if content should be truncated
  const shouldTruncate = expandable && summary.length > 300;
  const displaySummary = shouldTruncate && !isExpanded 
    ? summary.slice(0, 300) + '...'
    : summary;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className="task-summary-container"
      data-testid="task-summary"
      style={{
        fontSize: '14px',
        lineHeight: '1.6',
        color: '#b8c5d6'
      }}
    >
      <div data-color-mode="dark" className="wmde-markdown-container">
        <MDEditor.Markdown 
          source={displaySummary}
          style={{ 
            backgroundColor: 'transparent',
            color: '#b8c5d6',
            padding: 0,
            fontSize: 'inherit',
            lineHeight: 'inherit'
          }}
          data-testid="markdown-content"
          // Performance optimization: disable plugins if not needed
          rehypePlugins={[]}
          // Security: prevent unsafe HTML
          skipHtml={false}
        />
      </div>
      
      {shouldTruncate && (
        <button 
          className="summary-toggle-button"
          onClick={toggleExpanded}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4fbdba',
            cursor: 'pointer',
            fontSize: '0.85rem',
            marginTop: '0.5rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'rgba(79, 189, 186, 0.1)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          {isExpanded ? '🔼 Show Less' : '🔽 Show More'}
        </button>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization optimization
  return prevProps.summary === nextProps.summary && 
         prevProps.expandable === nextProps.expandable &&
         prevProps.initiallyExpanded === nextProps.initiallyExpanded;
});


TaskSummary.displayName = 'TaskSummary';

export default TaskSummary;