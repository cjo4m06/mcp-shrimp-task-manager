import React, { useState, useEffect, useRef } from 'react';
import { releaseMetadata, getReleaseFile } from '../data/releases';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useTranslation } from 'react-i18next';
import { getUIStrings, getReleaseContent } from '../i18n/documentation/index.js';
import ImageLightbox, { useLightbox } from './ImageLightbox';
import { Link as ScrollLink, Element as ScrollElement, Events, scrollSpy, scroller } from 'react-scroll';
import { useScrollSpy } from '../hooks/useScrollSpy.jsx';

function ReleaseNotes() {
  const [selectedVersion, setSelectedVersion] = useState(releaseMetadata[0]?.version || '');
  const [releaseContent, setReleaseContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedVersions, setExpandedVersions] = useState({});
  const [tableOfContents, setTableOfContents] = useState({});
  const [expandedTocSections, setExpandedTocSections] = useState({});
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const uiStrings = getUIStrings('releaseNotes', currentLanguage);
  const lightbox = useLightbox();
  const [releaseImages, setReleaseImages] = useState([]);
  const contentRef = useRef(null);

  // Use the ScrollSpy hook for sidebar auto-scroll and active section tracking
  const {
    activeSection,
    setActiveSection,
    scrollToSection,
    sidebarRef
  } = useScrollSpy({
    contentContainerId: 'release-content-container',
    sidebarClass: 'release-sidebar',
    tocItemClass: 'release-toc-item',
    scrollElementAttribute: 'data-scroll-element',
    scrollOffset: 50,
    enabled: true
  });

  // Centralized ID generation function to ensure consistency
  const generateUniqueId = (text, parentPath) => {
    const cleanPath = [...parentPath, text].map(part => 
      part.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    ).filter(part => part.length > 0);
    return cleanPath.join('-');
  };

  useEffect(() => {
    if (selectedVersion) {
      loadReleaseContent(selectedVersion);
      // Auto-expand the selected version to show TOC
      setExpandedVersions(prev => ({ ...prev, [selectedVersion]: true }));
    }
  }, [selectedVersion, currentLanguage]);
  
  // Load TOC for all versions on mount
  useEffect(() => {
    const loadAllTOCs = async () => {
      for (const release of releaseMetadata) {
        if (!tableOfContents[release.version]) {
          try {
            let releaseFile = getReleaseFile(release.version);
            const response = await fetch(releaseFile);
            if (response.ok) {
              const content = await response.text();
              const toc = extractTableOfContents(content);
              setTableOfContents(prev => ({ ...prev, [release.version]: toc }));
              
              // Initialize expanded state for this version's TOC
              if (toc && toc.length > 0) {
                const initialExpanded = {};
                const initExpanded = (items, parentKey = '') => {
                  items.forEach((item, index) => {
                    const itemKey = parentKey ? `${parentKey}-${index}` : `item-${index}`;
                    const fullKey = `${release.version}-${itemKey}`;
                    if (item.children && item.children.length > 0) {
                      initialExpanded[fullKey] = true; // Start expanded
                      initExpanded(item.children, itemKey);
                    }
                  });
                };
                initExpanded(toc);
                setExpandedTocSections(prev => ({ ...prev, ...initialExpanded }));
              }
            }
          } catch (error) {
            console.error(`Error loading TOC for ${release.version}:`, error);
          }
        }
      }
    };
    loadAllTOCs();
  }, []);

  // React-scroll based scroll spy for container
  useEffect(() => {
    if (!contentRef.current || !tableOfContents[selectedVersion]) return;
    
    const container = contentRef.current;
    
    const handleScroll = () => {
      // Find which section is currently in view
      const scrollTop = container.scrollTop;
      const containerTop = container.getBoundingClientRect().top;
      
      // Get all ScrollElement targets
      const elements = container.querySelectorAll('[data-scroll-element]');
      let activeElement = null;
      
      // Find the element that's most visible in the viewport
      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];
        const rect = element.getBoundingClientRect();
        const relativeTop = rect.top - containerTop;
        
        if (relativeTop <= 100) { // 100px threshold
          activeElement = element;
          break;
        }
      }
      
      if (activeElement) {
        const activeId = activeElement.getAttribute('data-scroll-element');
        if (activeId && activeId !== activeSection) {
          setActiveSection(activeId);
        }
      }
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [activeSection, tableOfContents, selectedVersion]);

  const loadReleaseContent = async (version) => {
    setLoading(true);
    setReleaseContent('');
    
    try {
      // First check if we have translated content in the language files
      const translatedContent = getReleaseContent(version, currentLanguage);
      let content = '';
      
      if (translatedContent && translatedContent.content) {
        content = translatedContent.content;
        setReleaseContent(content);
      } else {
        // Try to load language-specific markdown file
        let releaseFile;
        if (currentLanguage !== 'en') {
          // Check for language-specific file first (e.g., v3.0.0-zh.md)
          releaseFile = `/releases/${version}-${currentLanguage}.md`;
          const response = await fetch(releaseFile);
          
          if (response.ok) {
            content = await response.text();
            // Verify we got markdown content, not HTML
            if (content.trim().startsWith('#') || content.includes('##')) {
              setReleaseContent(content);
            } else {
              throw new Error('Invalid content type - expected markdown');
            }
          } else {
            // Fallback to English version
            releaseFile = getReleaseFile(version);
            const resp = await fetch(releaseFile);
            
            if (resp.ok) {
              content = await resp.text();
              // Verify we got markdown content, not HTML
              if (content.trim().startsWith('#') || content.includes('##')) {
                setReleaseContent(content);
              } else {
                console.warn('English fallback returned invalid content, using error message');
                content = `# ${version}\n\n${uiStrings.notFound}`;
                setReleaseContent(content);
              }
            } else {
              content = `# ${version}\n\n${uiStrings.notFound}`;
              setReleaseContent(content);
            }
          }
        } else {
          // Load English version
          releaseFile = getReleaseFile(version);
          const response = await fetch(releaseFile);
          
          if (response.ok) {
            content = await response.text();
            // Verify we got markdown content, not HTML
            if (content.trim().startsWith('#') || content.includes('##')) {
              setReleaseContent(content);
            } else {
              console.warn('English version returned invalid content, using error message');
              content = `# ${version}\n\n${uiStrings.notFound}`;
              setReleaseContent(content);
            }
          } else {
            content = `# ${version}\n\n${uiStrings.notFound}`;
            setReleaseContent(content);
          }
        }
      }
      
      // Generate TOC for this version
      const toc = extractTableOfContents(content);
      setTableOfContents(prev => ({ ...prev, [version]: toc }));
      
      // Extract and set images for lightbox
      const images = extractImagesFromContent(content);
      setReleaseImages(images);
      
    } catch (error) {
      console.error('Error loading release content:', error);
      console.error('Attempted to load:', releaseFile || 'unknown file');
      console.error('Current language:', currentLanguage);
      const errorContent = `# ${version}\n\nError loading release notes. Please check the console for details.\n\nTried to load: ${releaseFile || 'unknown file'}`;
      setReleaseContent(errorContent);
      setTableOfContents(prev => ({ ...prev, [version]: [] }));
    } finally {
      setLoading(false);
    }
  };

  const extractImagesFromContent = (content) => {
    if (!content) return [];
    
    const lines = content.split('\n');
    const images = [];
    
    lines.forEach((line) => {
      const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        const altText = imgMatch[1];
        let imgUrl = imgMatch[2];
        
        // Resolve relative image paths to /releases/ directory
        if (imgUrl.startsWith('./')) {
          imgUrl = `/releases/${imgUrl.substring(2)}`;
        } else if (!imgUrl.startsWith('http') && !imgUrl.startsWith('/')) {
          imgUrl = `/releases/${imgUrl}`;
        }
        
        images.push({
          src: imgUrl,
          title: altText || `Image ${images.length + 1}`,
          description: altText
        });
      }
    });
    
    return images;
  };

  const extractTableOfContents = (content) => {
    if (!content) return [];
    
    const lines = content.split('\n');
    const tocItems = [];
    let currentH2 = null;
    let currentH3 = null;
    const parentPath = []; // Track parent sections for unique ID generation
    
    lines.forEach((line) => {
      // Track H1 for parent path (but don't include in TOC)
      if (line.startsWith('# ')) {
        const text = line.substring(2);
        parentPath.length = 0;
        parentPath.push(text); // Set H1 as root parent
      } else if (line.startsWith('## ') && !line.includes('Table of Contents')) {
        const text = line.substring(3);
        parentPath.length = Math.min(1, parentPath.length); // Keep H1 parent if present
        const id = generateUniqueId(text, parentPath);
        parentPath.push(text);
        currentH2 = { level: 2, text, id, children: [] };
        currentH3 = null;
        tocItems.push(currentH2);
      } else if (line.startsWith('### ')) {
        const text = line.substring(4);
        parentPath.length = Math.min(2, parentPath.length); // Keep H1 and H2 parents
        const id = generateUniqueId(text, parentPath);
        parentPath.push(text);
        currentH3 = { level: 3, text, id, children: [] };
        if (currentH2) {
          currentH2.children.push(currentH3);
        } else {
          tocItems.push(currentH3);
        }
      } else if (line.startsWith('#### ')) {
        const text = line.substring(5);
        parentPath.length = Math.min(3, parentPath.length); // Keep H1, H2 and H3 parents
        const id = generateUniqueId(text, parentPath);
        parentPath.push(text);
        const h4Item = { level: 4, text, id, children: [] };
        if (currentH3) {
          currentH3.children.push(h4Item);
        } else if (currentH2) {
          currentH2.children.push(h4Item);
        } else {
          tocItems.push(h4Item);
        }
      }
    });
    
    return tocItems;
  };
  
  const toggleTocSection = (version, sectionKey) => {
    const key = `${version}-${sectionKey}`;
    setExpandedTocSections(prev => {
      // If not in state or true, set to false; if false, set to true
      const currentState = prev[key];
      return {
        ...prev,
        [key]: currentState === false ? true : false
      };
    });
  };

  const expandAllToc = (version) => {
    const versionToUse = version || selectedVersion;
    if (!versionToUse || !tableOfContents[versionToUse]) return;
    
    const expanded = {};
    const setAllExpanded = (items, parentKey = '') => {
      items.forEach((item, index) => {
        const itemKey = parentKey ? `${parentKey}-${index}` : `item-${index}`;
        const fullKey = `${versionToUse}-${itemKey}`;
        if (item.children && item.children.length > 0) {
          expanded[fullKey] = true;
          setAllExpanded(item.children, itemKey);
        }
      });
    };
    setAllExpanded(tableOfContents[versionToUse]);
    setExpandedTocSections(prev => ({ ...prev, ...expanded }));
  };

  const collapseAllToc = (version) => {
    const versionToUse = version || selectedVersion;
    if (!versionToUse || !tableOfContents[versionToUse]) return;
    
    const collapsed = {};
    const setAllCollapsed = (items, parentKey = '', level = 1) => {
      items.forEach((item, index) => {
        const itemKey = parentKey ? `${parentKey}-${index}` : `item-${index}`;
        const fullKey = `${versionToUse}-${itemKey}`;
        if (item.children && item.children.length > 0) {
          // Keep level 1 expanded, collapse level 2+ items
          collapsed[fullKey] = level === 1;
          setAllCollapsed(item.children, itemKey, level + 1);
        }
      });
    };
    setAllCollapsed(tableOfContents[versionToUse]);
    setExpandedTocSections(prev => {
      // Keep states for other versions, update only this version
      const newState = { ...prev };
      // Remove all keys for this version first
      Object.keys(newState).forEach(key => {
        if (key.startsWith(`${versionToUse}-`)) {
          delete newState[key];
        }
      });
      // Add the new collapsed state
      return { ...newState, ...collapsed };
    });
  };

  const renderTocItem = (item, index, version, parentKey = '') => {
    const itemKey = parentKey ? `${parentKey}-${index}` : `item-${index}`;
    const fullKey = `${version}-${itemKey}`;
    const hasChildren = item.children && item.children.length > 0;
    // Default to true if not explicitly set to false
    const isExpanded = hasChildren ? (expandedTocSections[fullKey] === true) : true;
    const isActive = item.id === activeSection;
    
    // Determine color based on level
    const getItemColor = () => {
      if (item.level === 2) return '#FFA500'; // Orange for h2
      if (item.level === 3) return '#FFD700'; // Gold for h3
      if (item.level === 4) return '#87CEEB'; // Sky Blue for h4
      return '#87CEEB';
    };
    
    const getHoverColor = () => {
      if (item.level === 2) return '#FFB84D'; // Lighter orange
      if (item.level === 3) return '#FFE55C'; // Lighter gold
      if (item.level === 4) return '#ADD8E6'; // Lighter sky blue
      return '#ADD8E6';
    };
    
    const itemColor = getItemColor();
    const hoverColor = getHoverColor();
    
    return (
      <div key={itemKey} style={{ marginBottom: '0.25rem' }}>
        <div 
          className={`release-toc-item ${isActive ? 'active' : ''}`}
          data-id={item.id}
          style={{ display: 'flex', alignItems: 'center' }}>
          {hasChildren && (
            <button
              onClick={() => toggleTocSection(version, itemKey)}
              style={{
                background: 'none',
                border: 'none',
                color: itemColor,
                cursor: 'pointer',
                padding: '0 4px',
                fontSize: '0.9rem',
                marginRight: '2px',
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              ▶
            </button>
          )}
          <div
            className="release-toc-text"
            onClick={() => {
              scroller.scrollTo(item.id, {
                duration: 500,
                delay: 0,
                smooth: 'easeInOutQuart',
                containerId: 'release-content-container',
                offset: -20
              });
            }}
            style={{
              display: 'block',
              color: isActive ? '#FFFFFF' : itemColor,
              textDecoration: 'none',
              fontSize: item.level === 4 ? '0.8rem' : item.level === 3 ? '0.85rem' : '0.9rem',
              fontWeight: isActive ? 'bold' : (item.level === 2 ? 'bold' : item.level === 3 ? '600' : 'normal'),
              marginLeft: hasChildren ? '0' : (item.level === 4 ? '1.5rem' : item.level === 3 ? '1rem' : '0'),
              padding: '0.3rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: isActive ? 'rgba(79, 189, 186, 0.6)' : 'transparent',
              borderLeft: isActive ? '3px solid #4fbdba' : '3px solid transparent',
              transition: 'all 0.2s ease',
              flex: 1,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.target.style.backgroundColor = 'rgba(79, 189, 186, 0.1)';
                e.target.style.color = hoverColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = itemColor;
              } else {
                e.target.style.backgroundColor = 'rgba(79, 189, 186, 0.6)';
                e.target.style.color = '#FFFFFF';
              }
            }}
          >
            {item.text}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div style={{ marginLeft: '1rem' }}>
            {item.children.map((child, childIndex) => renderTocItem(child, childIndex, version, itemKey))}
          </div>
        )}
      </div>
    );
  };

  const toggleVersionExpanded = async (version) => {
    setExpandedVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
    
    // Load TOC if not already loaded
    if (!tableOfContents[version]) {
      try {
        let releaseFile = getReleaseFile(version);
        const response = await fetch(releaseFile);
        if (response.ok) {
          const content = await response.text();
          const toc = extractTableOfContents(content);
          setTableOfContents(prev => ({ ...prev, [version]: toc }));
        }
      } catch (error) {
        console.error(`Error loading TOC for ${version}:`, error);
      }
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
        const href = linkMatch[2];
        const isAnchor = href.startsWith('#');
        
        parts.push(
          <a
            key={`link-${key++}`}
            href={href}
            target={isAnchor ? undefined : "_blank"}
            rel={isAnchor ? undefined : "noopener noreferrer"}
            style={{ color: '#ffff00', textDecoration: 'underline' }}
            onClick={isAnchor ? (e) => {
              e.preventDefault();
              const targetId = href.substring(1);
              scroller.scrollTo(targetId, {
                duration: 500,
                delay: 0,
                smooth: 'easeInOutQuart',
                containerId: 'release-content-container',
                offset: -20
              });
            } : undefined}
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
          <span
            className="inline-code"
            key={`code-${key++}`}
          >
            {codeMatch[1]}
          </span>
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
    let imageIndex = 0; // Track current image index for click handlers
    const parentPath = []; // Track parent sections for unique ID generation
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      if (line.startsWith('# ')) {
        const text = line.substring(2);
        parentPath.length = 0; // Reset for h1
        const id = generateUniqueId(text, parentPath);
        parentPath.push(text);
        elements.push(
          <ScrollElement key={i} name={id}>
            <h1 id={id} className="release-h1" data-scroll-element={id} style={{
              color: '#ff69b4',
              fontSize: '2.5rem'
            }}>
              {parseInlineMarkdown(text)}
            </h1>
          </ScrollElement>
        );
        i++;
      } else if (line.startsWith('## ')) {
        const text = line.substring(3);
        parentPath.length = Math.min(1, parentPath.length);
        const id = generateUniqueId(text, parentPath);
        parentPath.push(text);
        // Check if it's "New Features" or "Bug Fixes" to apply different colors
        const isNewFeatures = text.includes('New Features');
        const isBugFixes = text.includes('Bug Fixes');
        let color = '#ff69b4'; // default pink
        if (isNewFeatures) color = '#ffffff'; // white for New Features
        if (isBugFixes) color = '#ffa500'; // orange for Bug Fixes
        elements.push(
          <ScrollElement key={i} name={id}>
            <h2 id={id} className="release-h2" data-scroll-element={id} style={{
              color: color,
              fontSize: '2rem'
            }}>
              {parseInlineMarkdown(text)}
            </h2>
          </ScrollElement>
        );
        i++;
      } else if (line.startsWith('### ')) {
        const text = line.substring(4);
        parentPath.length = Math.min(2, parentPath.length);
        const id = generateUniqueId(text, parentPath);
        parentPath.push(text);
        elements.push(
          <ScrollElement key={i} name={id}>
            <h3 id={id} className="release-h3" data-scroll-element={id} style={{
              color: '#ff69b4',
              fontSize: '1.5rem'
            }}>
              {parseInlineMarkdown(text)}
            </h3>
          </ScrollElement>
        );
        i++;
      } else if (line.startsWith('##### ')) {
        const text = line.substring(6);
        parentPath.length = Math.min(4, parentPath.length);
        const id = generateUniqueId(text, parentPath);
        parentPath.push(text);
        elements.push(
          <ScrollElement key={i} name={id}>
            <h5 id={id} className="release-h5" data-scroll-element={id} style={{
              color: '#87CEEB',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              marginTop: '1rem',
              marginBottom: '0.5rem'
            }}>
              {parseInlineMarkdown(text)}
            </h5>
          </ScrollElement>
        );
        i++;
      } else if (line.startsWith('#### ')) {
        const text = line.substring(5);
        parentPath.length = Math.min(3, parentPath.length);
        const id = generateUniqueId(text, parentPath);
        parentPath.push(text);
        // Apply light blue for Overview and Key Highlights
        const isOverviewOrHighlights = text.includes('Overview') || text.includes('Key Highlights') || text.includes('Key Features') || text.includes('Key Improvements');
        elements.push(
          <ScrollElement key={i} name={id}>
            <h4 id={id} className="release-h4" data-scroll-element={id} style={{
              color: isOverviewOrHighlights ? '#87CEEB' : '#ff69b4',
              fontSize: '1.25rem'
            }}>
              {parseInlineMarkdown(text)}
            </h4>
          </ScrollElement>
        );
        i++;
      } else if (line.startsWith('```')) {
        // Handle code blocks
        const language = line.substring(3).trim() || 'text';
        const codeLines = [];
        i++; // Move past the opening ```
        
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
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
                button.textContent = uiStrings.copied;
                button.classList.add('copied');
                setTimeout(() => {
                  button.textContent = originalText;
                  button.classList.remove('copied');
                }, 2000);
              }}
              title="Copy code to clipboard"
            >
              {uiStrings.copy}
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
          let imgUrl = imgMatch[2];
          
          // Resolve relative image paths to /releases/ directory
          if (imgUrl.startsWith('./')) {
            imgUrl = `/releases/${imgUrl.substring(2)}`;
          } else if (!imgUrl.startsWith('http') && !imgUrl.startsWith('/')) {
            imgUrl = `/releases/${imgUrl}`;
          }
          
          const currentImageIndex = imageIndex;
          imageIndex++; // Increment for next image
          
          elements.push(
            <div key={i} className="release-image">
              <img 
                src={imgUrl} 
                alt={altText} 
                style={{ maxWidth: '75%', height: 'auto', margin: '1rem 0', cursor: 'pointer' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (releaseImages && releaseImages.length > currentImageIndex) {
                    lightbox.openLightbox(releaseImages, currentImageIndex);
                  }
                }}
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
      } else if (line.match(/^\*[^*]+\*$/)) {
        // Italic line
        elements.push(
          <p key={i} className="release-text italic">
            {parseInlineMarkdown(line)}
          </p>
        );
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
    <div className="release-notes-tab-content" style={{
      height: 'calc(100vh - 140px)',
      maxHeight: '900px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="release-notes-inner" style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div className="release-notes-header" style={{
          flexShrink: 0
        }}>
          <h2>{uiStrings.header}</h2>
        </div>
        
        <div className="release-notes-content" style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          height: '100%'
        }}>
          <div className="release-sidebar" ref={sidebarRef} style={{
            width: '300px',
            minWidth: '300px',
            overflowY: 'scroll',
            borderRight: '1px solid rgba(79, 189, 186, 0.2)',
            paddingRight: '1rem'
          }}>
            <h3>{uiStrings.versions}</h3>
            <ul className="version-list" style={{ listStyle: 'none', padding: 0 }}>
              {releaseMetadata.map((release) => (
                <li key={release.version} style={{ marginBottom: '0.5rem' }}>
                  <div>
                    <button
                      className={`version-button ${selectedVersion === release.version ? 'active' : ''}`}
                      onClick={() => setSelectedVersion(release.version)}
                      title={release.summary}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div>
                          <span className="version-number">{release.version}</span>
                          <span className="version-date" style={{ marginLeft: '0.5rem' }}>{release.date}</span>
                        </div>
                        {release.title && (
                          <span className="version-title" style={{ fontSize: '0.9em', opacity: 0.8 }}>{release.title}</span>
                        )}
                      </div>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleVersionExpanded(release.version);
                        }}
                        style={{
                          display: 'inline-block',
                          color: selectedVersion === release.version ? '#ffffff' : '#ffa500',
                          cursor: 'pointer',
                          padding: '0 0.5rem',
                          fontSize: '1rem',
                          transform: expandedVersions[release.version] ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease, color 0.3s ease',
                          filter: 'drop-shadow(0 0 2px rgba(255, 165, 0, 0.5))'
                        }}
                      >▶</span>
                    </button>
                    
                    {expandedVersions[release.version] && tableOfContents[release.version] && (
                      <div style={{
                        marginLeft: '1rem',
                        marginTop: '0.5rem',
                        paddingLeft: '0.5rem',
                        borderLeft: '2px solid rgba(79, 189, 186, 0.2)'
                      }}>
                        {selectedVersion === release.version && (
                          <div style={{ 
                            display: 'flex', 
                            gap: '0.5rem', 
                            marginBottom: '0.5rem',
                            paddingBottom: '0.5rem',
                            borderBottom: '1px solid rgba(79, 189, 186, 0.2)'
                          }}>
                            <button
                              onClick={() => expandAllToc(release.version)}
                              style={{
                                padding: '2px 6px',
                                fontSize: '0.75rem',
                                backgroundColor: 'transparent',
                                color: '#4fbdba',
                                border: '1px solid #4fbdba',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(79, 189, 186, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                              }}
                            >
                              Expand All
                            </button>
                            <button
                              onClick={() => collapseAllToc(release.version)}
                              style={{
                                padding: '2px 6px',
                                fontSize: '0.75rem',
                                backgroundColor: 'transparent',
                                color: '#4fbdba',
                                border: '1px solid #4fbdba',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(79, 189, 186, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                              }}
                            >
                              Collapse All
                            </button>
                          </div>
                        )}
                        {tableOfContents[release.version].map((item, index) => 
                          renderTocItem(item, index, release.version)
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div id="release-content-container" className="release-details" ref={contentRef} style={{
            flex: 1,
            overflowY: 'scroll',
            overflowX: 'hidden',
            paddingLeft: '2rem',
            paddingRight: '2rem',
            minWidth: 0,
            minHeight: 0,
            maxHeight: '100%',
            position: 'relative'
          }}>
            {loading ? (
              <div className="release-loading">{uiStrings.loading}</div>
            ) : (
              <div className="release-markdown-content" style={{ paddingBottom: '2rem' }}>
                {renderMarkdown(releaseContent)}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {lightbox.isOpen && (
        <ImageLightbox
          isOpen={lightbox.isOpen}
          onClose={lightbox.closeLightbox}
          images={lightbox.images}
          currentIndex={lightbox.currentIndex}
        />
      )}
    </div>
  );
}

export default ReleaseNotes;