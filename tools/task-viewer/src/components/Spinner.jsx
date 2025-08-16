import React from 'react';

function Spinner({ size = 'md', color = '#4fbdba' }) {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg'
  };

  return (
    <div className={`spinner ${sizeClasses[size]}`}>
      <div className="spinner-circle" style={{ borderTopColor: color }}></div>
    </div>
  );
}

export default Spinner;