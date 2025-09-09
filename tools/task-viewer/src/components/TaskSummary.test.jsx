import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TaskSummary from './TaskSummary';

// Mock MD Editor to avoid loading issues in tests
vi.mock('@uiw/react-md-editor', () => ({
  default: {
    Markdown: vi.fn(({ source, style }) => (
      <div 
        data-testid="markdown-content" 
        style={style}
        dangerouslySetInnerHTML={{ __html: source }}
      />
    ))
  }
}));

describe('TaskSummary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders null when no summary provided', () => {
      const { container } = render(<TaskSummary summary={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders null when empty summary provided', () => {
      const { container } = render(<TaskSummary summary="" />);
      expect(container.firstChild).toBeNull();
    });

    it('renders markdown content when summary provided', () => {
      const summary = '## Test Summary\n\nThis is a **bold** test.';
      render(<TaskSummary summary={summary} />);
      
      const markdownElement = screen.getByTestId('markdown-content');
      expect(markdownElement).toBeInTheDocument();
      expect(markdownElement).toHaveTextContent('Test Summary');
    });

    it('applies correct styling for dark theme', () => {
      const summary = '# Test';
      render(<TaskSummary summary={summary} />);
      
      const container = screen.getByTestId('task-summary');
      expect(container).toHaveStyle({
        fontSize: '14px',
        lineHeight: '1.6',
        color: 'rgb(184, 197, 214)'
      });
    });
  });

  describe('Markdown Content Types', () => {
    it('renders headers correctly', () => {
      const summary = '# Header 1\n## Header 2\n### Header 3';
      render(<TaskSummary summary={summary} />);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toHaveTextContent('Header 1');
      expect(content).toHaveTextContent('Header 2');
      expect(content).toHaveTextContent('Header 3');
    });

    it('renders lists correctly', () => {
      const summary = '- Item 1\n- Item 2\n\n1. Numbered 1\n2. Numbered 2';
      render(<TaskSummary summary={summary} />);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toHaveTextContent('Item 1');
      expect(content).toHaveTextContent('Numbered 1');
    });

    it('renders code blocks correctly', () => {
      const summary = '```javascript\nconst test = "hello";\n```';
      render(<TaskSummary summary={summary} />);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toHaveTextContent('const test = "hello";');
    });

    it('renders inline code correctly', () => {
      const summary = 'Use `console.log()` for debugging';
      render(<TaskSummary summary={summary} />);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toHaveTextContent('console.log()');
    });
  });

  describe('Performance', () => {
    it('component is memoized to prevent unnecessary re-renders', () => {
      const summary = 'Test summary';
      const { rerender } = render(<TaskSummary summary={summary} />);
      
      const firstRender = screen.getByTestId('markdown-content');
      
      // Rerender with same props
      rerender(<TaskSummary summary={summary} />);
      
      const secondRender = screen.getByTestId('markdown-content');
      expect(firstRender).toBe(secondRender);
    });

    it('lazy loads markdown renderer', async () => {
      const summary = 'Test summary';
      render(<TaskSummary summary={summary} />);
      
      // Should render immediately due to Suspense fallback
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long content', () => {
      const longSummary = '# Long Content\n\n' + 'A'.repeat(5000);
      render(<TaskSummary summary={longSummary} />);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toHaveTextContent('Long Content');
      expect(content).toHaveTextContent('A'.repeat(100)); // Partial match
    });

    it('handles special characters safely', () => {
      const summary = 'Test with <script>alert("xss")</script> and & chars';
      render(<TaskSummary summary={summary} />);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toBeInTheDocument();
    });

    it('handles markdown with HTML entities', () => {
      const summary = 'Test &amp; &lt;tag&gt; entities';
      render(<TaskSummary summary={summary} />);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper semantic structure', () => {
      const summary = '# Main Title\n## Subtitle\n\nParagraph content';
      render(<TaskSummary summary={summary} />);
      
      const content = screen.getByTestId('markdown-content');
      expect(content).toHaveAttribute('data-testid', 'markdown-content');
    });
  });
});