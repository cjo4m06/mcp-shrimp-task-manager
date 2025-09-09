import React, { memo, useState, useCallback, useMemo } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const CompletionDetailsView = memo(({ completionDetails }) => {
  const [expandedSections, setExpandedSections] = useState({
    keyAccomplishments: true,
    implementationDetails: true,
    technicalChallenges: true
  });
  
  const [allExpanded, setAllExpanded] = useState(true);

  // Early return if no completion details
  if (!completionDetails) {
    return null;
  }

  const { keyAccomplishments = [], implementationDetails = [], technicalChallenges = [] } = completionDetails;

  // Check if all sections are empty
  const hasContent = keyAccomplishments.length > 0 || 
                    implementationDetails.length > 0 || 
                    technicalChallenges.length > 0;
  
  if (!hasContent) {
    return null;
  }

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const toggleAllSections = useCallback(() => {
    const newState = !allExpanded;
    setAllExpanded(newState);
    setExpandedSections({
      keyAccomplishments: newState,
      implementationDetails: newState,
      technicalChallenges: newState
    });
  }, [allExpanded]);

  const sections = useMemo(() => [
    {
      id: 'keyAccomplishments',
      title: 'Key Accomplishments',
      icon: '🏆',
      items: keyAccomplishments,
      color: '#4fbdba'
    },
    {
      id: 'implementationDetails',
      title: 'Implementation Details',
      icon: '💻',
      items: implementationDetails,
      color: '#7ec8ca'
    },
    {
      id: 'technicalChallenges',
      title: 'Technical Challenges',
      icon: '⚠️',
      items: technicalChallenges,
      color: '#ffd700'
    }
  ], [keyAccomplishments, implementationDetails, technicalChallenges]);

  const renderSection = useCallback((section) => {
    if (!section.items || section.items.length === 0) {
      return null;
    }

    const isExpanded = expandedSections[section.id];

    return (
      <div 
        key={section.id}
        className="completion-section"
        style={{
          marginBottom: '1.5rem',
          borderRadius: '8px',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(126, 200, 202, 0.2)',
          overflow: 'hidden'
        }}
      >
        <button
          onClick={() => toggleSection(section.id)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            background: 'rgba(30, 41, 59, 0.8)',
            border: 'none',
            color: '#b8c5d6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.95rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
            <span>{section.title}</span>
            <span style={{ 
              fontSize: '0.8rem', 
              color: 'rgba(184, 197, 214, 0.6)',
              marginLeft: '0.5rem'
            }}>
              ({section.items.length})
            </span>
          </div>
          <span style={{ 
            fontSize: '0.9rem',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </button>

        {isExpanded && (
          <div 
            style={{
              padding: '1rem',
              animation: 'fadeIn 0.3s ease'
            }}
          >
            {section.items.map((item, index) => (
              <div 
                key={index}
                style={{
                  marginBottom: index < section.items.length - 1 ? '0.75rem' : 0,
                  paddingLeft: '1.5rem',
                  position: 'relative'
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '0.5rem',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: section.color,
                    opacity: 0.7
                  }}
                />
                <div 
                  data-color-mode="dark" 
                  className="wmde-markdown-container"
                  style={{
                    fontSize: '0.9rem',
                    lineHeight: '1.6'
                  }}
                >
                  <MDEditor.Markdown 
                    source={item}
                    style={{ 
                      backgroundColor: 'transparent',
                      color: '#b8c5d6',
                      padding: 0,
                      fontSize: 'inherit',
                      lineHeight: 'inherit'
                    }}
                    rehypePlugins={[]}
                    skipHtml={false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [expandedSections, toggleSection]);

  return (
    <div className="completion-details-view">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ 
          margin: 0,
          color: '#b8c5d6',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          Completion Details
        </h3>
        
        {sections.some(s => s.items.length > 0) && (
          <button
            onClick={toggleAllSections}
            style={{
              padding: '0.25rem 0.75rem',
              background: 'transparent',
              border: '1px solid rgba(79, 189, 186, 0.3)',
              borderRadius: '4px',
              color: '#4fbdba',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(79, 189, 186, 0.1)';
              e.target.style.borderColor = 'rgba(79, 189, 186, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'rgba(79, 189, 186, 0.3)';
            }}
          >
            {allExpanded ? '▼ Collapse All' : '▶ Expand All'}
          </button>
        )}
      </div>

      <div>
        {sections.map(renderSection)}
      </div>

      {completionDetails.verificationScore !== undefined && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(30, 41, 59, 0.5)',
          borderRadius: '6px',
          border: '1px solid rgba(126, 200, 202, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ color: '#b8c5d6', fontSize: '0.9rem' }}>
            Verification Score:
          </span>
          <span style={{
            color: completionDetails.verificationScore >= 80 ? '#4fbdba' : '#ffd700',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}>
            {completionDetails.verificationScore}%
          </span>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memoization
  return prevProps.completionDetails === nextProps.completionDetails;
});

CompletionDetailsView.displayName = 'CompletionDetailsView';

export default CompletionDetailsView;