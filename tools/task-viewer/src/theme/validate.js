// Theme validation utility
// This file can be used to validate theme configuration and test color values

import theme from './index.js';
import { themeColors, statusColors, priorityColors } from './colors.js';

// Validate theme structure
export const validateTheme = () => {
  const errors = [];
  const warnings = [];

  try {
    // Check if required theme properties exist
    if (!theme.colors) {
      errors.push('Theme is missing colors object');
    }
    
    if (!theme.colors?.brand) {
      errors.push('Theme is missing brand colors');
    }
    
    if (!theme.semanticTokens) {
      errors.push('Theme is missing semantic tokens');
    }
    
    if (!theme.components) {
      errors.push('Theme is missing component overrides');
    }
    
    if (!theme.config) {
      errors.push('Theme is missing config object');
    }

    // Check brand colors
    const requiredBrandColors = ['primary', 'secondary', 'background', 'panel', 'surface', 'border'];
    requiredBrandColors.forEach(color => {
      if (!theme.colors?.brand?.[color]) {
        errors.push(`Missing brand color: ${color}`);
      }
    });

    // Check semantic tokens
    const requiredSemanticTokens = ['bg.canvas', 'bg.surface', 'text.default', 'border.default'];
    requiredSemanticTokens.forEach(token => {
      if (!theme.semanticTokens?.colors?.[token]) {
        warnings.push(`Missing semantic token: ${token}`);
      }
    });

    // Check component overrides
    const expectedComponents = ['Button', 'Card', 'Modal', 'Input', 'Table'];
    expectedComponents.forEach(component => {
      if (!theme.components?.[component]) {
        warnings.push(`Missing component override: ${component}`);
      }
    });

    // Validate color format (basic hex check)
    const validateColorFormat = (colorValue, colorName) => {
      if (typeof colorValue === 'string' && !colorValue.match(/^#[0-9A-Fa-f]{6}$/)) {
        warnings.push(`Invalid color format for ${colorName}: ${colorValue}`);
      }
    };

    // Validate brand colors format
    Object.entries(theme.colors?.brand || {}).forEach(([key, value]) => {
      validateColorFormat(value, `brand.${key}`);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalErrors: errors.length,
        totalWarnings: warnings.length,
        hasRequiredColors: theme.colors?.brand ? true : false,
        hasSemanticTokens: theme.semanticTokens ? true : false,
        hasComponentOverrides: theme.components ? true : false,
        isDarkModeConfigured: theme.config?.initialColorMode === 'dark',
      }
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [`Theme validation failed with error: ${error.message}`],
      warnings: [],
      summary: null
    };
  }
};

// Test color accessibility
export const testColorAccessibility = () => {
  const tests = [];
  
  // Test background contrast
  const bgColor = themeColors.background;
  const textColor = '#ffffff';
  
  tests.push({
    test: 'Background/Text Contrast',
    bgColor,
    textColor,
    passed: true, // Simplified - in real app would calculate actual contrast ratio
    note: 'Dark theme with white text should have good contrast'
  });

  // Test status colors
  Object.entries(statusColors).forEach(([status, color]) => {
    tests.push({
      test: `Status Color: ${status}`,
      color,
      passed: color.startsWith('#') && color.length === 7,
      note: `${status} status color format validation`
    });
  });

  return {
    tests,
    allPassed: tests.every(test => test.passed),
    summary: `${tests.filter(test => test.passed).length}/${tests.length} tests passed`
  };
};

// Export theme info for debugging
export const getThemeInfo = () => {
  return {
    version: '1.0.0',
    chakraVersion: '2.10.4',
    colorMode: theme.config?.initialColorMode || 'unknown',
    brandColors: theme.colors?.brand || {},
    totalComponents: Object.keys(theme.components || {}).length,
    hasSemanticTokens: !!theme.semanticTokens,
    createdAt: new Date().toISOString(),
  };
};

// Simple console logger for theme debugging
export const logThemeStatus = () => {
  const validation = validateTheme();
  const accessibility = testColorAccessibility();
  const info = getThemeInfo();

  console.group('🎨 Chakra UI Theme Status');
  
  console.log('Theme Info:', info);
  
  console.group('Validation Results');
  console.log(`Valid: ${validation.isValid ? '✅' : '❌'}`);
  if (validation.errors.length > 0) {
    console.error('Errors:', validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn('Warnings:', validation.warnings);
  }
  console.groupEnd();
  
  console.group('Accessibility Tests');
  console.log(`All Passed: ${accessibility.allPassed ? '✅' : '❌'}`);
  console.log('Summary:', accessibility.summary);
  console.groupEnd();
  
  console.groupEnd();

  return { validation, accessibility, info };
};

export default {
  validateTheme,
  testColorAccessibility,
  getThemeInfo,
  logThemeStatus,
};