// Utility functions and color constants for the custom theme
// This file provides helper functions and constants for consistent color usage across the app

// Status colors for different task states
export const statusColors = {
  pending: '#fbbf24', // yellow-400
  in_progress: '#3b82f6', // blue-500  
  completed: '#10b981', // green-500
  error: '#ef4444', // red-500
  warning: '#f59e0b', // amber-500
  info: '#06b6d4', // cyan-500
};

// Priority colors
export const priorityColors = {
  low: '#6b7280', // gray-500
  medium: '#f59e0b', // amber-500
  high: '#ef4444', // red-500
  critical: '#dc2626', // red-600
};

// Theme color constants (matching the main theme)
export const themeColors = {
  primary: '#4fbdba',
  secondary: '#7b68ee', 
  background: '#0a0e27',
  panel: '#16213e',
  surface: '#1a1f3a',
  border: '#2c3e50',
  dark: '#0f1626',
  light: '#34495e',
};

// Utility function to get color based on theme mode
export const getColorForMode = (lightColor, darkColor, colorMode = 'dark') => {
  return colorMode === 'dark' ? darkColor : lightColor;
};

// Utility function to get status color with opacity
export const getStatusColorWithOpacity = (status, opacity = 1) => {
  const baseColor = statusColors[status] || statusColors.info;
  if (opacity === 1) return baseColor;
  
  // Convert hex to rgba
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Utility function to get priority color
export const getPriorityColor = (priority) => {
  return priorityColors[priority?.toLowerCase()] || priorityColors.medium;
};

// Utility function to determine text color based on background
export const getContrastTextColor = (backgroundColor) => {
  // Simple luminance calculation to determine if text should be light or dark
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);  
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export default {
  statusColors,
  priorityColors, 
  themeColors,
  getColorForMode,
  getStatusColorWithOpacity,
  getPriorityColor,
  getContrastTextColor,
};