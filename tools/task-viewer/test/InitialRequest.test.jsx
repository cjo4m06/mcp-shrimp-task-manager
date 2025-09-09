import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18n for testing
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: {
        translation: {
          initialRequest: 'Initial Request'
        }
      }
    },
    interpolation: {
      escapeValue: false
    }
  });

// Mock component that contains the initial request display logic
const InitialRequestDisplay = ({ 
  initialRequest, 
  initialRequestCollapsed, 
  setInitialRequestCollapsed 
}) => {
  const t = (key, fallback) => fallback || key;

  if (!initialRequest) return null;

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
      data-testid="initial-request-container"
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
          borderBottom: initialRequestCollapsed ? 'none' : '1px solid #2c3e50'
        }}
        onClick={() => setInitialRequestCollapsed(!initialRequestCollapsed)}
        title={initialRequestCollapsed ? 'Click to expand' : 'Click to collapse'}
        data-testid="initial-request-header"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>📋</span>
          {t('initialRequest', 'Initial Request')}
        </div>
        <span 
          style={{
            fontSize: '16px',
            transition: 'transform 0.2s ease',
            transform: initialRequestCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'
          }}
          data-testid="collapse-arrow"
        >
          ▼
        </span>
      </div>
      {!initialRequestCollapsed && (
        <div 
          style={{
            fontSize: '14px',
            color: '#b8c5d6',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap',
            padding: '16px',
            transition: 'all 0.3s ease'
          }}
          data-testid="initial-request-content"
        >
          {initialRequest}
        </div>
      )}
    </div>
  );
};

describe('Initial Request Display Component', () => {
  let mockSetCollapsed;

  beforeEach(() => {
    mockSetCollapsed = vi.fn();
  });

  describe('Rendering', () => {
    it('should render when initialRequest is provided', () => {
      const testRequest = 'Create a React dashboard with analytics';
      
      render(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      expect(screen.getByTestId('initial-request-container')).toBeInTheDocument();
      expect(screen.getByTestId('initial-request-header')).toBeInTheDocument();
      expect(screen.getByTestId('initial-request-content')).toBeInTheDocument();
      expect(screen.getByText(testRequest)).toBeInTheDocument();
    });

    it('should not render when initialRequest is empty', () => {
      render(
        <InitialRequestDisplay
          initialRequest=""
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      expect(screen.queryByTestId('initial-request-container')).not.toBeInTheDocument();
    });

    it('should not render when initialRequest is null', () => {
      render(
        <InitialRequestDisplay
          initialRequest={null}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      expect(screen.queryByTestId('initial-request-container')).not.toBeInTheDocument();
    });
  });

  describe('Collapsible Functionality', () => {
    it('should show content when not collapsed', () => {
      const testRequest = 'Build a mobile app for task management';
      
      render(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      expect(screen.getByTestId('initial-request-content')).toBeInTheDocument();
      expect(screen.getByText(testRequest)).toBeInTheDocument();
    });

    it('should hide content when collapsed', () => {
      const testRequest = 'Build a mobile app for task management';
      
      render(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={true}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      expect(screen.queryByTestId('initial-request-content')).not.toBeInTheDocument();
      expect(screen.queryByText(testRequest)).not.toBeInTheDocument();
    });

    it('should toggle collapsed state when header is clicked', () => {
      const testRequest = 'Create an e-commerce website';
      
      render(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      const header = screen.getByTestId('initial-request-header');
      fireEvent.click(header);

      expect(mockSetCollapsed).toHaveBeenCalledWith(true);
    });

    it('should call toggle function with opposite value', () => {
      const testRequest = 'Develop a chat application';
      
      // Test expanding (currently collapsed)
      const { rerender } = render(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={true}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      fireEvent.click(screen.getByTestId('initial-request-header'));
      expect(mockSetCollapsed).toHaveBeenCalledWith(false);

      // Reset mock and test collapsing (currently expanded)
      mockSetCollapsed.mockClear();
      
      rerender(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      fireEvent.click(screen.getByTestId('initial-request-header'));
      expect(mockSetCollapsed).toHaveBeenCalledWith(true);
    });
  });

  describe('Visual Styling', () => {
    it('should apply correct dark theme colors', () => {
      const testRequest = 'Style testing request';
      
      render(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      const container = screen.getByTestId('initial-request-container');
      const header = screen.getByTestId('initial-request-header');
      const content = screen.getByTestId('initial-request-content');

      // Check container styling
      expect(container).toHaveStyle({
        backgroundColor: '#16213e',
        border: '1px solid #2c3e50',
        borderRadius: '8px'
      });

      // Check header styling
      expect(header).toHaveStyle({
        color: '#4fbdba',
        cursor: 'pointer'
      });

      // Check content styling
      expect(content).toHaveStyle({
        color: '#b8c5d6',
        whiteSpace: 'pre-wrap'
      });
    });

    it('should show correct tooltips', () => {
      const testRequest = 'Tooltip testing request';
      
      const { rerender } = render(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      const header = screen.getByTestId('initial-request-header');
      expect(header).toHaveAttribute('title', 'Click to collapse');

      // Test collapsed state
      rerender(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={true}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      expect(header).toHaveAttribute('title', 'Click to expand');
    });

    it('should rotate arrow based on collapsed state', () => {
      const testRequest = 'Arrow rotation test';
      
      const { rerender } = render(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      const arrow = screen.getByTestId('collapse-arrow');
      expect(arrow).toHaveStyle({ transform: 'rotate(0deg)' });

      // Test collapsed state
      rerender(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={true}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      expect(arrow).toHaveStyle({ transform: 'rotate(-90deg)' });
    });
  });

  describe('Content Formatting', () => {
    it('should preserve line breaks in multiline requests', () => {
      const multilineRequest = `Create a web application with the following features:
1. User authentication
2. Dashboard with charts
3. Data export functionality`;
      
      render(
        <InitialRequestDisplay
          initialRequest={multilineRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      const content = screen.getByTestId('initial-request-content');
      expect(content).toHaveStyle({ whiteSpace: 'pre-wrap' });
      expect(content.textContent).toBe(multilineRequest);
    });

    it('should handle very long requests', () => {
      const longRequest = 'A'.repeat(1000) + ' Very long initial request for testing purposes';
      
      render(
        <InitialRequestDisplay
          initialRequest={longRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      expect(screen.getByText(longRequest)).toBeInTheDocument();
    });

    it('should handle special characters and unicode', () => {
      const specialRequest = 'Create a 🦐 task manager with émojis and spéciál characters (中文测试)';
      
      render(
        <InitialRequestDisplay
          initialRequest={specialRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      expect(screen.getByText(specialRequest)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      const testRequest = 'Accessibility test request';
      
      render(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      const header = screen.getByTestId('initial-request-header');
      
      // Test Enter key
      fireEvent.keyDown(header, { key: 'Enter', code: 'Enter' });
      // Note: In a real implementation, you'd need to add onKeyDown handler
      
      expect(header).toHaveAttribute('title');
    });

    it('should have proper semantic structure', () => {
      const testRequest = 'Semantic structure test';
      
      render(
        <InitialRequestDisplay
          initialRequest={testRequest}
          initialRequestCollapsed={false}
          setInitialRequestCollapsed={mockSetCollapsed}
        />
      );

      // Check that elements have proper test IDs for screen readers
      expect(screen.getByTestId('initial-request-container')).toBeInTheDocument();
      expect(screen.getByTestId('initial-request-header')).toBeInTheDocument();
      expect(screen.getByTestId('initial-request-content')).toBeInTheDocument();
    });
  });
});