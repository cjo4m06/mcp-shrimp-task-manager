# Chakra UI Theme Configuration

This directory contains the custom Chakra UI theme configuration for the Shrimp Task Viewer application.

## Files Structure

```
theme/
├── index.js      # Main theme configuration
├── colors.js     # Color utilities and constants  
├── validate.js   # Theme validation and testing utilities
└── README.md     # This documentation file
```

## Theme Overview

The custom theme provides:

- **Dark-first design** matching the existing application color scheme
- **Comprehensive semantic tokens** for consistent theming
- **Component style overrides** for all major Chakra UI components
- **Utility functions** for color management and validation
- **TypeScript-friendly** color constants and helpers

## Color Palette

### Brand Colors
- **Primary**: `#4fbdba` - Main accent color (teal)
- **Secondary**: `#7b68ee` - Secondary accent (purple)
- **Background**: `#0a0e27` - Main application background
- **Panel**: `#16213e` - Panel/card backgrounds
- **Surface**: `#1a1f3a` - Surface elements
- **Border**: `#2c3e50` - Border color
- **Dark**: `#0f1626` - Darker backgrounds
- **Light**: `#34495e` - Lighter surfaces

### Status Colors
- **Pending**: `#fbbf24` (yellow)
- **In Progress**: `#3b82f6` (blue)
- **Completed**: `#10b981` (green)
- **Error**: `#ef4444` (red)
- **Warning**: `#f59e0b` (amber)
- **Info**: `#06b6d4` (cyan)

### Priority Colors
- **Low**: `#6b7280` (gray)
- **Medium**: `#f59e0b` (amber)
- **High**: `#ef4444` (red)
- **Critical**: `#dc2626` (dark red)

## Usage Examples

### Using Theme Colors in Components

```jsx
import { Box, Text, Button } from '@chakra-ui/react';

function MyComponent() {
  return (
    <Box bg="bg.surface" borderColor="border.default" borderWidth="1px">
      <Text color="text.default">Content here</Text>
      <Button colorScheme="brand">Action Button</Button>
    </Box>
  );
}
```

### Using Color Utilities

```jsx
import { getStatusColorWithOpacity, getPriorityColor } from '../theme/colors';

function TaskBadge({ status, priority }) {
  return (
    <Badge 
      bg={getStatusColorWithOpacity(status, 0.2)}
      color={getPriorityColor(priority)}
    >
      {status}
    </Badge>
  );
}
```

### Theme Validation (Development)

```jsx
import { logThemeStatus } from '../theme';

// In development, log theme status
if (process.env.NODE_ENV === 'development') {
  logThemeStatus();
}
```

## Semantic Tokens

The theme uses semantic tokens for consistent theming across color modes:

### Background Tokens
- `bg.canvas` - Main application background
- `bg.surface` - Card/panel backgrounds  
- `bg.subtle` - Subtle backgrounds
- `bg.muted` - Muted backgrounds

### Text Tokens
- `text.default` - Primary text color
- `text.muted` - Secondary text color
- `text.subtle` - Subtle text color
- `text.accent` - Accent text color

### Border Tokens
- `border.default` - Standard border color
- `border.muted` - Subtle border color

## Component Overrides

The theme provides customized styles for all major Chakra UI components:

- **Button** - Custom variants and colors
- **Card** - Dark theme styling
- **Modal** - Overlay and dialog styling
- **Input** - Form field styling
- **Table** - Data table styling
- **Tabs** - Navigation tabs styling
- **Menu** - Dropdown menu styling
- **Tooltip** - Tooltip styling
- **Badge** - Status badge styling

## Development Guidelines

### Adding New Colors
1. Add colors to the `colors` object in `index.js`
2. Update semantic tokens if needed
3. Add utility functions in `colors.js`
4. Update validation tests in `validate.js`

### Modifying Component Styles
1. Update the component override in the `components` object
2. Test across different color modes
3. Ensure accessibility compliance
4. Update documentation

### Testing Theme Changes
```jsx
import { validateTheme, logThemeStatus } from '../theme';

// Validate theme structure
const validation = validateTheme();
console.log('Theme valid:', validation.isValid);

// Full theme status report
logThemeStatus();
```

## Accessibility

The theme is designed with accessibility in mind:

- High contrast ratios for text/background combinations
- Focus indicators for interactive elements
- Consistent color coding for status and priority
- Support for reduced motion preferences
- Screen reader friendly semantic tokens

## Migration Notes

When migrating from the previous CSS-based theming:

1. **Color Variables**: Replace CSS custom properties with Chakra semantic tokens
2. **Component Styling**: Use Chakra's styling props instead of CSS classes
3. **Responsive Design**: Use Chakra's responsive array syntax
4. **Dark Mode**: Leverage semantic tokens for automatic dark mode support

## Performance Considerations

- Theme object is created once at build time
- Semantic tokens provide efficient runtime color resolution
- Component overrides are optimized for minimal runtime overhead
- Color utilities use simple calculations for performance

## Browser Support

Compatible with all modern browsers that support:
- CSS Custom Properties
- ES6 Modules  
- Emotion/Styled Components

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+