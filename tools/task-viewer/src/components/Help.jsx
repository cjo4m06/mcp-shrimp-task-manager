import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

function Help() {
  const [readmeContent, setReadmeContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReadmeContent();
  }, []);

  const loadReadmeContent = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/readme');
      
      if (response.ok) {
        const content = await response.text();
        setReadmeContent(content);
      } else {
        setReadmeContent('# Help\n\nREADME not found.');
      }
    } catch (error) {
      console.error('Error loading README:', error);
      setReadmeContent('# Help\n\nError loading README.');
    } finally {
      setLoading(false);
    }
  };

  // Parse inline markdown (bold, italic, code, links)
  const parseInlineMarkdown = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Check for links [text](url)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch && linkMatch.index !== undefined) {
        // Add text before the match
        if (linkMatch.index > 0) {
          parts.push(remaining.substring(0, linkMatch.index));
        }
        // Add link
        parts.push(
          <a
            key={`link-${key++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'underline' }}
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.substring(linkMatch.index + linkMatch[0].length);
        continue;
      }

      // Check for bold text **text**
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        // Add text before the match
        if (boldMatch.index > 0) {
          parts.push(remaining.substring(0, boldMatch.index));
        }
        // Add bold text
        parts.push(
          <strong key={`bold-${key++}`}>
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // Check for code `text`
      const codeMatch = remaining.match(/`([^`]+)`/);
      if (codeMatch && codeMatch.index !== undefined) {
        // Add text before the match
        if (codeMatch.index > 0) {
          parts.push(remaining.substring(0, codeMatch.index));
        }
        // Add code text
        parts.push(
          <code
            className="inline-code"
            key={`code-${key++}`}
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.substring(codeMatch.index + codeMatch[0].length);
        continue;
      }

      // Check for italic text *text* or _text_
      const italicMatch = remaining.match(/[*_]([^*_]+)[*_]/);
      if (italicMatch && italicMatch.index !== undefined) {
        // Add text before the match
        if (italicMatch.index > 0) {
          parts.push(remaining.substring(0, italicMatch.index));
        }
        // Add italic text
        parts.push(
          <em key={`italic-${key++}`}>
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
        continue;
      }

      // No more markdown found, add the rest as plain text
      parts.push(remaining);
      break;
    }

    return parts;
  };

  const renderMarkdown = (content) => {
    if (!content) return null;
    
    const lines = content.split('\n');
    const elements = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="release-h1">
            {parseInlineMarkdown(line.substring(2))}
          </h1>
        );
        i++;
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="release-h2">
            {parseInlineMarkdown(line.substring(3))}
          </h2>
        );
        i++;
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="release-h3">
            {parseInlineMarkdown(line.substring(4))}
          </h3>
        );
        i++;
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={i} className="release-h4">
            {parseInlineMarkdown(line.substring(5))}
          </h4>
        );
        i++;
      } else if (line.match(/^\s*```/)) {
        // Handle code blocks (including indented ones)
        const indent = line.match(/^(\s*)/)[1].length;
        const language = line.trim().substring(3).trim() || 'text';
        const codeLines = [];
        i++; // Move past the opening ```
        
        while (i < lines.length && !lines[i].match(/^\s*```/)) {
          // Remove the base indentation from code lines
          if (indent > 0 && lines[i].startsWith(' '.repeat(indent))) {
            codeLines.push(lines[i].substring(indent));
          } else {
            codeLines.push(lines[i]);
          }
          i++;
        }
        
        const codeContent = codeLines.join('\n');
        elements.push(
          <div key={`code-${i}`} className="code-block-wrapper" style={{ position: 'relative' }}>
            <button
              className="code-copy-button"
              onClick={() => {
                navigator.clipboard.writeText(codeContent);
                // Optional: Add visual feedback
                const button = event.target;
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                button.classList.add('copied');
                setTimeout(() => {
                  button.textContent = originalText;
                  button.classList.remove('copied');
                }, 2000);
              }}
              title="Copy code to clipboard"
            >
              Copy
            </button>
            <SyntaxHighlighter
              language={language}
              style={dark}
            >
              {codeContent}
            </SyntaxHighlighter>
          </div>
        );
        i++; // Skip the closing ```
      } else if (line.match(/^\d+\.\s/)) {
        // Handle numbered lists
        const match = line.match(/^\d+\.\s(.*)$/);
        if (match) {
          elements.push(
            <div key={i} className="release-list-item numbered">
              {line.substring(0, line.indexOf('.') + 1)} {parseInlineMarkdown(match[1])}
            </div>
          );
        }
        i++;
      } else if (line.startsWith('- ')) {
        elements.push(
          <div key={i} className="release-list-item">
            • {parseInlineMarkdown(line.substring(2))}
          </div>
        );
        i++;
      } else if (line.match(/^\s+- /)) {
        // Handle nested bullets
        const indent = line.match(/^(\s+)/)[1].length;
        elements.push(
          <div key={i} className="release-list-item nested" style={{ marginLeft: `${indent * 10}px` }}>
            ◦ {parseInlineMarkdown(line.trim().substring(2))}
          </div>
        );
        i++;
      } else if (line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)) {
        // Handle images
        const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) {
          const altText = imgMatch[1];
          const imgUrl = imgMatch[2];
          elements.push(
            <div key={i} className="release-image">
              <img 
                src={imgUrl} 
                alt={altText} 
                style={{ maxWidth: '80%', height: 'auto', margin: '1rem 0' }}
              />
            </div>
          );
        }
        i++;
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="release-spacer" />);
        i++;
      } else if (line.trim() === '---') {
        elements.push(<hr key={i} className="release-divider" />);
        i++;
      } else {
        elements.push(
          <p key={i} className="release-text">
            {parseInlineMarkdown(line)}
          </p>
        );
        i++;
      }
    }
    
    return elements;
  };

  return (
    <div className="release-notes-tab-content">
      <div className="release-notes-inner">
        <div className="release-notes-header">
          <h2>ℹ️ Help & Documentation</h2>
        </div>
        
        <div className="release-notes-content" style={{ maxWidth: '100%' }}>
          <div className="release-details" style={{ maxWidth: '100%' }}>
            {loading ? (
              <div className="release-loading">Loading documentation...</div>
            ) : (
              <div className="release-markdown-content">
                {renderMarkdown(readmeContent)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;