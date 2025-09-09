import React, { useState, useEffect } from 'react';

function FinalSummary({ 
  tasks = [], 
  projectId, 
  onSummaryGenerated, 
  existingSummary = null 
}) {
  const [summary, setSummary] = useState(existingSummary);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('finalSummaryExpanded');
    return saved !== null ? saved === 'true' : false;
  });

  // Save expand state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('finalSummaryExpanded', isExpanded.toString());
  }, [isExpanded]);

  const handleGenerateSummary = async () => {
    console.log('Generate button clicked');
    console.log('Tasks:', tasks);
    console.log('ProjectId:', projectId);
    
    setIsGenerating(true);
    setError(null);

    try {
      // Filter tasks that have summaries (treat having a summary as being completed)
      // Some tasks may not have explicit status field but having a summary indicates completion
      const completedTasks = tasks.filter(task => 
        (task.status === 'completed' || task.summary) && task.summary
      ).map(task => ({
        id: task.id,
        name: task.name,
        summary: task.summary
      }));
      
      // Get incomplete tasks for warning section
      const incompleteTasks = tasks.filter(task => 
        task.status !== 'completed' && !task.summary
      ).map(task => ({
        id: task.id,
        name: task.name,
        status: task.status || 'pending'
      }));
      
      console.log('Completed tasks with summaries:', completedTasks);
      console.log('Task statuses:', tasks.map(t => ({ name: t.name, status: t.status, hasSummary: !!t.summary })));
      
      if (completedTasks.length === 0) {
        setError('No tasks with summaries found. Please ensure tasks have summaries.');
        setIsGenerating(false);
        return;
      }

      const response = await fetch(`/api/tasks/${projectId}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedTasks,
          totalTasks: tasks.length,
          incompleteTasks
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data.summary);
      
      if (onSummaryGenerated) {
        onSummaryGenerated(data.summary);
      }
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  // Format the summary with colors, bold, and emojis
  const formatSummary = (text) => {
    if (!text) return null;
    
    // Split by lines and process each
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Check for markdown bold headings (e.g., **Project Status:**)
      if (line.trim().startsWith('**') && line.trim().includes(':**')) {
        const cleanLine = line.replace(/\*\*/g, '');
        const isWarningSection = cleanLine.includes('⚠️') || cleanLine.includes('Remaining Tasks');
        return (
          <div key={index} style={{ 
            color: isWarningSection ? '#e74c3c' : '#f39c12',
            fontWeight: 'bold',
            marginTop: index === 0 ? 0 : '12px',
            marginBottom: '8px',
            fontSize: '15px'
          }}>
            {cleanLine}
          </div>
        );
      }
      // Check for bullet points (already includes emojis from OpenAI)
      else if (line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+\./.test(line.trim())) {
        const isWarningItem = line.includes('❌');
        return (
          <div key={index} style={{ 
            color: isWarningItem ? '#e74c3c' : '#b8c5d6',
            marginLeft: '16px',
            marginBottom: '4px',
            lineHeight: '1.6'
          }}>
            {line}
          </div>
        );
      }
      // Regular text (might be part of status or impact description)
      else if (line.trim()) {
        return (
          <div key={index} style={{ 
            color: '#b8c5d6',
            marginBottom: '8px',
            lineHeight: '1.6'
          }}>
            {line}
          </div>
        );
      }
      // Empty lines
      return <div key={index} style={{ height: '8px' }} />;
    });
  };

  return (
    <div 
      style={{
        backgroundColor: '#16213e',
        border: '1px solid #2c3e50',
        borderRadius: '8px',
        marginBottom: '20px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflow: 'hidden'
      }}
      data-testid="summarize-section"
    >
      <div 
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#4fbdba',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid #2c3e50' : 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? 'Click to collapse' : 'Click to expand'}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>📝</span>
          Summarize
        </div>
        <span style={{
          fontSize: '16px',
          transition: 'transform 0.2s ease',
          transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
        }}>
          ▼
        </span>
      </div>
      
      {isExpanded && (
        <div style={{
          padding: '16px',
          transition: 'all 0.3s ease'
        }}>
          {summary ? (
            <div style={{
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {formatSummary(summary)}
            </div>
          ) : (
            <div style={{
              fontSize: '14px',
              color: '#7f8c8d',
              fontStyle: 'italic',
              marginBottom: '12px'
            }}>
              📌 Click Generate to create an overall summary of all completed tasks.
            </div>
          )}
          
          {error && (
            <div style={{ 
              color: '#e74c3c', 
              marginTop: '10px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <div style={{ marginTop: '16px' }}>
            <button
              style={{
                backgroundColor: isGenerating ? '#2c3e50' : '#4fbdba',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isGenerating ? 0.7 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.target.style.backgroundColor = '#3498db';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGenerating) {
                  e.target.style.backgroundColor = '#4fbdba';
                }
              }}
            >
              {isGenerating ? (
                <>⏳ Generating...</>
              ) : summary ? (
                <>🔄 Regenerate</>
              ) : (
                <>✨ Generate</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinalSummary;