import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Custom hook for scroll spy and sidebar auto-scroll functionality
 * 
 * @param {Object} options Configuration options
 * @param {string} options.contentContainerId - ID of the scrollable content container
 * @param {string} options.sidebarClass - Class name of the sidebar element (default: 'release-sidebar')
 * @param {string} options.tocItemClass - Class name for TOC items (default: 'help-toc-item')
 * @param {string} options.scrollElementAttribute - Attribute for scroll target elements (default: 'data-scroll-element')
 * @param {number} options.scrollOffset - Offset when scrolling to sections (default: 50)
 * @param {number} options.activationThreshold - Distance from top to activate section (default: 100)
 * @param {boolean} options.enabled - Enable/disable the hook (default: true)
 * 
 * @returns {Object} { activeSection, setActiveSection, scrollToSection, sidebarRef }
 */
export function useScrollSpy(options = {}) {
  const {
    contentContainerId,
    sidebarClass = 'release-sidebar',
    tocItemClass = 'help-toc-item',
    scrollElementAttribute = 'data-scroll-element',
    scrollOffset = 50,
    activationThreshold = 100,
    enabled = true
  } = options;

  const [activeSection, setActiveSection] = useState('');
  const sidebarRef = useRef(null);
  const contentRef = useRef(null);

  // Set up scroll spy for content container
  useEffect(() => {
    if (!enabled || !contentContainerId) return;

    const container = document.getElementById(contentContainerId);
    if (!container) return;

    contentRef.current = container;

    const handleScroll = () => {
      // Get all scroll target elements
      const elements = container.querySelectorAll(`[${scrollElementAttribute}]`);
      if (!elements.length) return;

      const containerRect = container.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const containerTop = containerRect.top;

      let activeElement = null;
      let minDistance = Infinity;

      // Find the element closest to the top of the viewport (with a bias toward visible elements)
      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const relativeTop = rect.top - containerTop;

        // Element is in the viewport or just above it
        if (relativeTop >= -50 && relativeTop <= containerHeight / 3) {
          // Calculate distance from the ideal position (slightly below top)
          const distance = Math.abs(relativeTop - scrollOffset);

          if (distance < minDistance) {
            minDistance = distance;
            activeElement = element;
          }
        }
      });

      // If no element is in the ideal range, find the last element that's above the viewport
      if (!activeElement) {
        for (let i = elements.length - 1; i >= 0; i--) {
          const element = elements[i];
          const rect = element.getBoundingClientRect();
          const relativeTop = rect.top - containerTop;

          if (relativeTop <= scrollOffset) {
            activeElement = element;
            break;
          }
        }
      }

      if (activeElement) {
        const activeId = activeElement.getAttribute(scrollElementAttribute) || activeElement.id;
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
  }, [activeSection, contentContainerId, scrollElementAttribute, scrollOffset, enabled]);

  // Auto-scroll sidebar to keep active item centered in viewport
  useEffect(() => {
    if (!enabled || !activeSection || !sidebarRef.current) return;

    const activeItem = document.querySelector(`.${tocItemClass}[data-id="${activeSection}"]`);

    if (activeItem && sidebarRef.current) {
      const sidebar = sidebarRef.current;

      // Get bounding rectangles for accurate positioning
      const sidebarRect = sidebar.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();

      // Calculate the item's position relative to the sidebar's scrollable area
      const itemPositionInSidebar = itemRect.top - sidebarRect.top + sidebar.scrollTop;

      const itemHeight = activeItem.offsetHeight;
      const sidebarHeight = sidebar.clientHeight;

      // Calculate the scroll position to center the active item in the sidebar viewport
      const targetScrollTop = itemPositionInSidebar - (sidebarHeight / 2) + (itemHeight / 2);

      // Ensure we don't scroll beyond the bounds
      const maxScroll = sidebar.scrollHeight - sidebarHeight;
      const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScroll));

      // Smoothly scroll to the calculated position
      sidebar.scrollTo({
        top: finalScrollTop,
        behavior: 'smooth'
      });
    }
  }, [activeSection, tocItemClass, enabled]);

  // Function to programmatically scroll to a section
  const scrollToSection = useCallback((sectionId, options = {}) => {
    const {
      duration = 500,
      offset = -scrollOffset,
      smooth = 'easeInOutQuart'
    } = options;

    if (!contentContainerId) return;

    const element = document.querySelector(`[${scrollElementAttribute}="${sectionId}"], #${sectionId}`);
    const container = document.getElementById(contentContainerId);

    if (element && container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop = element.offsetTop + offset;

      // For browsers that support smooth scrolling
      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });

      // Optionally set active section immediately
      setActiveSection(sectionId);
    }
  }, [contentContainerId, scrollElementAttribute, scrollOffset]);

  return {
    activeSection,
    setActiveSection,
    scrollToSection,
    sidebarRef
  };
}

/**
 * Component wrapper for rendering TOC items with scroll spy
 * 
 * @param {Object} props
 * @param {Object} props.item - TOC item object with id, text, level, children
 * @param {string} props.activeSection - Currently active section ID
 * @param {Function} props.onItemClick - Callback when item is clicked
 * @param {string} props.itemKey - Unique key for the item
 * @param {boolean} props.isExpanded - Whether the item is expanded
 * @param {Function} props.onToggleExpand - Callback to toggle expansion
 * @param {Function} props.getItemColor - Function to get item color
 * @param {Function} props.getItemHoverColor - Function to get item hover color
 */
export function TocItem({
  item,
  activeSection,
  onItemClick,
  itemKey,
  isExpanded,
  onToggleExpand,
  getItemColor = () => '#4fbdba',
  getItemHoverColor = () => '#6fcfcc',
  children
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.id === activeSection;

  return (
    <div key={itemKey} style={{ marginBottom: '0.25rem' }}>
      <div
        className={`help-toc-item ${isActive ? 'active' : ''}`}
        data-id={item.id}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(itemKey);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: getItemColor(item),
              cursor: 'pointer',
              padding: '0 4px',
              fontSize: '0.9rem',
              marginRight: '2px'
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        )}
        <div
          className="help-toc-text"
          onClick={() => onItemClick(item.id)}
          style={{
            display: 'block',
            color: isActive ? '#FFFFFF' : getItemColor(item),
            textDecoration: 'none',
            fontSize: item.level === 4 ? '0.85rem' : item.level === 3 ? '0.9rem' : item.level === 2 ? '0.95rem' : '1rem',
            marginLeft: hasChildren ? '0' : (item.level === 3 ? '1.5rem' : item.level === 2 ? '0.75rem' : item.level === 1 ? '0' : '1rem'),
            padding: '0.3rem 0.5rem',
            borderRadius: '4px',
            transition: 'all 0.2s ease',
            fontWeight: isActive ? 'bold' : (item.level === 1 ? 'bold' : item.level === 2 ? '600' : 'normal'),
            backgroundColor: isActive ? 'rgba(79, 189, 186, 0.6)' : 'transparent',
            borderLeft: isActive ? '3px solid #4fbdba' : '3px solid transparent',
            flex: 1,
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.target.style.backgroundColor = 'rgba(79, 189, 186, 0.1)';
              e.target.style.color = getItemHoverColor(item);
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = getItemColor(item);
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
          {children}
        </div>
      )}
    </div>
  );
}