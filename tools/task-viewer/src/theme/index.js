import { extendTheme } from '@chakra-ui/react';

// Color tokens matching the existing dark theme
const colors = {
  brand: {
    primary: '#4fbdba',    // Accent color
    secondary: '#7b68ee',  // Secondary accent
    background: '#0a0e27', // Main background
    panel: '#16213e',      // Panel background
    surface: '#1a1f3a',    // Surface background
    border: '#2c3e50',     // Border color
    dark: '#0f1626',       // Darker background
    light: '#34495e',      // Lighter surface
  },
  gray: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
};

// Semantic tokens for consistent theming
const semanticTokens = {
  colors: {
    // Background colors
    'bg.canvas': {
      default: 'white',
      _dark: 'brand.background',
    },
    'bg.surface': {
      default: 'gray.50',
      _dark: 'brand.panel',
    },
    'bg.subtle': {
      default: 'gray.100',
      _dark: 'brand.surface',
    },
    'bg.muted': {
      default: 'gray.200',
      _dark: 'brand.dark',
    },
    
    // Text colors
    'text.default': {
      default: 'gray.900',
      _dark: 'white',
    },
    'text.muted': {
      default: 'gray.600',
      _dark: 'gray.400',
    },
    'text.subtle': {
      default: 'gray.500',
      _dark: 'gray.500',
    },
    'text.accent': {
      default: 'blue.600',
      _dark: 'brand.primary',
    },
    
    // Border colors
    'border.default': {
      default: 'gray.200',
      _dark: 'brand.border',
    },
    'border.muted': {
      default: 'gray.100',
      _dark: 'brand.border',
    },
  },
};

// Component style overrides
const components = {
  // Global styles
  Text: {
    baseStyle: {
      color: 'text.default',
    },
  },
  
  // Button component
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: {
        bg: 'brand.primary',
        color: 'white',
        _hover: {
          bg: 'brand.secondary',
        },
        _active: {
          bg: 'brand.secondary',
        },
      },
      outline: {
        borderColor: 'border.default',
        color: 'text.default',
        _hover: {
          bg: 'bg.subtle',
        },
      },
      ghost: {
        color: 'text.default',
        _hover: {
          bg: 'bg.subtle',
        },
      },
    },
  },
  
  // Card component
  Card: {
    baseStyle: {
      container: {
        bg: 'bg.surface',
        borderColor: 'border.default',
        borderWidth: '1px',
        borderRadius: 'lg',
        boxShadow: 'sm',
      },
    },
  },
  
  // Modal component
  Modal: {
    baseStyle: {
      dialog: {
        bg: 'bg.surface',
        borderColor: 'border.default',
      },
      overlay: {
        bg: 'blackAlpha.600',
      },
    },
  },
  
  // Input component
  Input: {
    variants: {
      outline: {
        field: {
          borderColor: 'border.default',
          bg: 'bg.canvas',
          color: 'text.default',
          _hover: {
            borderColor: 'border.muted',
          },
          _focus: {
            borderColor: 'brand.primary',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-primary)',
          },
        },
      },
    },
  },
  
  // Table component
  Table: {
    variants: {
      simple: {
        th: {
          borderColor: 'border.default',
          color: 'text.muted',
          fontSize: 'sm',
          fontWeight: 'semibold',
          textTransform: 'uppercase',
          letterSpacing: 'wider',
        },
        td: {
          borderColor: 'border.default',
          color: 'text.default',
        },
      },
    },
  },
  
  // Tabs component
  Tabs: {
    variants: {
      line: {
        tablist: {
          borderColor: 'border.default',
        },
        tab: {
          color: 'text.muted',
          _selected: {
            color: 'text.accent',
            borderColor: 'brand.primary',
          },
        },
      },
    },
  },
  
  // Menu component
  Menu: {
    baseStyle: {
      list: {
        bg: 'bg.surface',
        borderColor: 'border.default',
        borderWidth: '1px',
        boxShadow: 'lg',
      },
      item: {
        bg: 'transparent',
        color: 'text.default',
        _hover: {
          bg: 'bg.subtle',
        },
        _focus: {
          bg: 'bg.subtle',
        },
      },
    },
  },
  
  // Tooltip component
  Tooltip: {
    baseStyle: {
      bg: 'bg.surface',
      color: 'text.default',
      borderColor: 'border.default',
      borderWidth: '1px',
      boxShadow: 'lg',
    },
  },
  
  // Badge component
  Badge: {
    variants: {
      solid: {
        bg: 'brand.primary',
        color: 'white',
      },
      outline: {
        borderColor: 'border.default',
        color: 'text.default',
      },
      subtle: {
        bg: 'bg.subtle',
        color: 'text.default',
      },
    },
  },
};

// Global styles
const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'brand.background' : 'white',
      color: props.colorMode === 'dark' ? 'white' : 'gray.900',
    },
    '*::placeholder': {
      color: props.colorMode === 'dark' ? 'gray.400' : 'gray.400',
    },
    '*, *::before, &::after': {
      borderColor: props.colorMode === 'dark' ? 'brand.border' : 'gray.200',
    },
  }),
};

// Theme configuration
const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

// Typography
const fonts = {
  heading: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  body: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  mono: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
};

// Breakpoints
const breakpoints = {
  base: '0px',
  sm: '480px',
  md: '768px',
  lg: '992px',
  xl: '1280px',
  '2xl': '1536px',
};

// Spacing
const space = {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

// Border radius
const radii = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Shadows
const shadows = {
  xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  outline: '0 0 0 3px rgba(66, 153, 225, 0.6)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
  'dark-lg': 'rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 5px 10px, rgba(0, 0, 0, 0.4) 0px 15px 40px',
};

// Create and export the custom theme
const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  components,
  styles,
  fonts,
  breakpoints,
  space,
  radii,
  shadows,
});

// Export theme utilities for development/debugging
export { default as colorUtils } from './colors.js';
export { validateTheme, logThemeStatus } from './validate.js';

export default theme;