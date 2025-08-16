import React, { useState, useRef, useEffect } from 'react';

function Tooltip({ children, content, className = '' }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (visible && targetRef.current && tooltipRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      // Calculate position to center tooltip above the target element
      let top = targetRect.top - tooltipRect.height - 8;
      let left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
      
      // Adjust if tooltip goes off screen
      if (top < 0) {
        // Show below if not enough space above
        top = targetRect.bottom + 8;
      }
      
      if (left < 0) {
        left = 8;
      } else if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 8;
      }
      
      setPosition({ top, left });
    }
  }, [visible, content]);

  const handleMouseEnter = () => setVisible(true);
  const handleMouseLeave = () => setVisible(false);

  return (
    <>
      <span
        ref={targetRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className}
      >
        {children}
      </span>
      {visible && content && (
        <div
          ref={tooltipRef}
          className="tooltip"
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999,
          }}
        >
          <div className="tooltip-content">
            {content}
          </div>
          <div className="tooltip-arrow" />
        </div>
      )}
    </>
  );
}

export default Tooltip;