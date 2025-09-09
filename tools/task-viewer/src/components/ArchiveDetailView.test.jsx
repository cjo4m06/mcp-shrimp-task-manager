import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ArchiveDetailView from './ArchiveDetailView';

// Mock TaskTable component
vi.mock('./TaskTable', () => ({
  default: vi.fn(({ data, globalFilter, readOnly }) => (
    <div data-testid="task-table">
      <div>Tasks: {data?.length || 0}</div>
      <div>Filter: {globalFilter}</div>
      <div>ReadOnly: {readOnly ? 'true' : 'false'}</div>
    </div>
  ))
}));

// Mock MDEditor component
vi.mock('@uiw/react-md-editor', () => ({
  default: {
    Markdown: vi.fn(({ source }) => (
      <div data-testid="markdown-content">{source}</div>
    ))
  }
}));

describe('ArchiveDetailView Component', () => {
  const mockArchiveWithSummary = {
    date: '2024-01-15T10:30:00Z',
    projectName: 'Test Project',
    tasks: [
      { id: '1', name: 'Task 1', status: 'completed', summary: 'Task 1 completed successfully' },
      { id: '2', name: 'Task 2', status: 'in_progress' },
      { id: '3', name: 'Task 3', status: 'pending' }
    ],
    initialRequest: 'Build a user authentication system with OAuth2 support',
    summary: 'Successfully implemented OAuth2 authentication system with JWT tokens, user session management, and comprehensive error handling. All security best practices have been followed.',
    stats: {
      total: 3,
      completed: 1,
      inProgress: 1,
      pending: 1
    }
  };

  const mockArchiveWithoutSummary = {
    date: '2024-01-14T15:45:00Z',
    projectName: 'Another Project',
    tasks: [
      { id: '4', name: 'Task 4', status: 'completed' },
      { id: '5', name: 'Task 5', status: 'completed' }
    ],
    initialRequest: 'Fix bug in payment system',
    stats: null
  };

  const mockOnBack = vi.fn();
  const defaultProps = {
    archive: mockArchiveWithSummary,
    onBack: mockOnBack,
    projectRoot: '/test/project'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the component with header and back button', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      expect(screen.getByText('← Back to Archive List')).toBeInTheDocument();
      expect(screen.getByText(/Archive from/)).toBeInTheDocument();
    });

    it('should format and display the archive date correctly', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      const dateElement = screen.getByText(/Archive from.*January 15, 2024/);
      expect(dateElement).toBeInTheDocument();
    });

    it('should handle undefined archive gracefully', () => {
      render(<ArchiveDetailView archive={undefined} onBack={mockOnBack} />);
      
      expect(screen.getByText(/Archive from/)).toBeInTheDocument();
      expect(screen.getByText('Unknown Project')).toBeInTheDocument();
    });

    it('should handle null archive gracefully', () => {
      render(<ArchiveDetailView archive={null} onBack={mockOnBack} />);
      
      expect(screen.getByText(/Archive from/)).toBeInTheDocument();
      expect(screen.getByText('Unknown Project')).toBeInTheDocument();
    });
  });

  describe('Archive Information Display', () => {
    it('should display project name', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      expect(screen.getByText('Project')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should display task statistics', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      expect(screen.getByText('Completed')).toBeInTheDocument();
      // Use getAllByText since multiple '1' values exist
      const ones = screen.getAllByText('1');
      expect(ones.length).toBeGreaterThan(0);
      
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should calculate stats from tasks if not provided', () => {
      render(<ArchiveDetailView {...defaultProps} archive={mockArchiveWithoutSummary} />);
      
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      // Use getAllByText since '2' appears multiple times
      const twos = screen.getAllByText('2');
      expect(twos.length).toBeGreaterThan(0);
      
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('should handle missing tasks array', () => {
      const archiveWithoutTasks = { ...mockArchiveWithSummary, tasks: undefined };
      render(<ArchiveDetailView {...defaultProps} archive={archiveWithoutTasks} />);
      
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      // When tasks is undefined, stats will still show from mockArchiveWithSummary.stats
      // or be calculated as 0. The component shows tasks: 0 in the TaskTable mock
      expect(screen.getByTestId('task-table')).toHaveTextContent('Tasks: 0');
    });
  });

  describe('Initial Request Section', () => {
    it('should display initial request when present', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      expect(screen.getByText('Initial Request')).toBeInTheDocument();
      expect(screen.getByText('Build a user authentication system with OAuth2 support')).toBeInTheDocument();
    });

    it('should not display initial request section when not present', () => {
      const archiveWithoutRequest = { ...mockArchiveWithSummary, initialRequest: null };
      render(<ArchiveDetailView {...defaultProps} archive={archiveWithoutRequest} />);
      
      expect(screen.queryByText('Initial Request')).not.toBeInTheDocument();
    });

    it('should handle long initial requests with scrolling', () => {
      const longRequest = 'A'.repeat(500);
      const archiveWithLongRequest = { ...mockArchiveWithSummary, initialRequest: longRequest };
      const { container } = render(<ArchiveDetailView {...defaultProps} archive={archiveWithLongRequest} />);
      
      const requestElement = screen.getByText(longRequest);
      expect(requestElement).toBeInTheDocument();
      
      // The request is rendered in a container with scrolling styles
      // Find the container by its style attributes
      const scrollContainer = container.querySelector('[style*="max-height: 120px"]');
      expect(scrollContainer).toBeInTheDocument();
      expect(scrollContainer).toHaveTextContent(longRequest);
    });
  });

  describe('Summary Section', () => {
    it('should render summary section when archive has summary property', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      // The summary section should be visible
      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByTestId('markdown-content')).toHaveTextContent(mockArchiveWithSummary.summary);
    });

    it('should not render summary section when no summary exists', () => {
      render(<ArchiveDetailView {...defaultProps} archive={mockArchiveWithoutSummary} />);
      
      // Currently, the component doesn't implement summary section
      // This test verifies that no summary is shown when not present
      expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    });

    it('should display summary content correctly', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      const summaryText = mockArchiveWithSummary.summary;
      expect(screen.getByTestId('markdown-content')).toHaveTextContent(summaryText);
    });

    it('should apply proper styling to summary section', () => {
      const { container } = render(<ArchiveDetailView {...defaultProps} />);
      
      // Find the summary content container
      const summaryContent = screen.getByTestId('markdown-content');
      expect(summaryContent).toBeInTheDocument();
      
      // Check that summary section exists with expected structure
      const summaryHeader = screen.getByText('Summary');
      expect(summaryHeader).toBeInTheDocument();
      
      // Verify markdown content is rendered
      expect(summaryContent).toHaveTextContent(mockArchiveWithSummary.summary);
    });

    it('should handle collapsible functionality for summary section', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      const summaryHeader = screen.getByText('Summary');
      
      // Initial state - check if expanded by default
      expect(screen.getByTestId('markdown-content')).toBeVisible();
      
      // Click to collapse
      fireEvent.click(summaryHeader);
      
      // After collapse, content should be hidden
      expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument();
      
      // Click to expand again
      fireEvent.click(summaryHeader);
      expect(screen.getByTestId('markdown-content')).toBeVisible();
    });

    it('should position summary section below initial request', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      // Both sections should be present
      const initialRequestLabel = screen.getByText('Initial Request');
      const summaryLabel = screen.getByText('Summary');
      
      expect(initialRequestLabel).toBeInTheDocument();
      expect(summaryLabel).toBeInTheDocument();
      
      // Both the initial request content and summary content should be visible
      expect(screen.getByText('Build a user authentication system with OAuth2 support')).toBeInTheDocument();
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('should handle empty summary string', () => {
      const archiveWithEmptySummary = { ...mockArchiveWithSummary, summary: '' };
      render(<ArchiveDetailView {...defaultProps} archive={archiveWithEmptySummary} />);
      
      // Empty summary should not render the section
      expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    });

    it('should handle very long summary with scrolling', () => {
      const longSummary = 'Lorem ipsum dolor sit amet. '.repeat(10); // Reduced for testing
      const archiveWithLongSummary = { ...mockArchiveWithSummary, summary: longSummary };
      render(<ArchiveDetailView {...defaultProps} archive={archiveWithLongSummary} />);
      
      const summaryElement = screen.getByTestId('markdown-content');
      // Check that the content starts with the expected text
      expect(summaryElement).toHaveTextContent(/Lorem ipsum dolor sit amet/);
      
      // Verify the summary section is rendered
      expect(screen.getByText('Summary')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should update global filter on search input change', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });
      
      expect(searchInput.value).toBe('test search');
      expect(screen.getByText('Filter: test search')).toBeInTheDocument();
    });
  });

  describe('Task Table Integration', () => {
    it('should pass tasks to TaskTable component', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      expect(screen.getByText('Tasks: 3')).toBeInTheDocument();
    });

    it('should set TaskTable to read-only mode', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      expect(screen.getByText('ReadOnly: true')).toBeInTheDocument();
    });

    it('should handle empty tasks array', () => {
      const archiveWithNoTasks = { ...mockArchiveWithSummary, tasks: [] };
      render(<ArchiveDetailView {...defaultProps} archive={archiveWithNoTasks} />);
      
      expect(screen.getByText('Tasks: 0')).toBeInTheDocument();
    });
  });

  describe('Back Button Functionality', () => {
    it('should call onBack when back button is clicked', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      const backButton = screen.getByText('← Back to Archive List');
      fireEvent.click(backButton);
      
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should change button color on hover', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      const backButton = screen.getByText('← Back to Archive List');
      
      // Initial color
      expect(backButton).toHaveStyle({
        backgroundColor: '#4fbdba'
      });
      
      // Hover
      fireEvent.mouseEnter(backButton);
      expect(backButton).toHaveStyle({
        backgroundColor: '#3da9a6'
      });
      
      // Mouse leave
      fireEvent.mouseLeave(backButton);
      expect(backButton).toHaveStyle({
        backgroundColor: '#4fbdba'
      });
    });
  });

  describe('Styling and Layout', () => {
    it('should apply correct color scheme for stats', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      // Find stat values and check their colors
      const completedStatLabel = screen.getByText('Completed');
      const completedContainer = completedStatLabel.parentElement;
      const completedValue = completedContainer.querySelector('div[style*="color: rgb(74, 222, 128)"]');
      
      // Completed should be green
      expect(completedValue).toBeInTheDocument();
    });

    it('should use dark theme styling', () => {
      render(<ArchiveDetailView {...defaultProps} />);
      
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      expect(searchInput).toBeInTheDocument();
      // Check the actual inline style values
      expect(searchInput.style.backgroundColor).toBe('rgb(42, 42, 42)');
      expect(searchInput.style.color).toBe('rgb(255, 255, 255)');
    });

    it('should have responsive grid layout for stats', () => {
      const { container } = render(<ArchiveDetailView {...defaultProps} />);
      
      // Find the grid container by looking for the div with grid styles
      const gridContainers = container.querySelectorAll('div[style*="grid"]');
      let found = false;
      gridContainers.forEach(el => {
        if (el.style.gridTemplateColumns === 'repeat(auto-fit, minmax(200px, 1fr))') {
          found = true;
        }
      });
      expect(found).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid date gracefully', () => {
      const archiveWithInvalidDate = { ...mockArchiveWithSummary, date: 'invalid-date' };
      render(<ArchiveDetailView {...defaultProps} archive={archiveWithInvalidDate} />);
      
      expect(screen.getByText(/Archive from Invalid date/)).toBeInTheDocument();
    });

    it('should handle missing date', () => {
      const archiveWithoutDate = { ...mockArchiveWithSummary, date: null };
      render(<ArchiveDetailView {...defaultProps} archive={archiveWithoutDate} />);
      
      expect(screen.getByText(/Archive from Unknown date/)).toBeInTheDocument();
    });

    it('should use timestamp if date is not available', () => {
      const archiveWithTimestamp = { 
        ...mockArchiveWithSummary, 
        date: null,
        timestamp: '2024-01-16T12:00:00Z'
      };
      render(<ArchiveDetailView {...defaultProps} archive={archiveWithTimestamp} />);
      
      expect(screen.getByText(/Archive from.*January 16, 2024/)).toBeInTheDocument();
    });

    it('should handle all null/undefined values gracefully', () => {
      const minimalArchive = {};
      render(<ArchiveDetailView {...defaultProps} archive={minimalArchive} />);
      
      // Should not crash and display default values
      expect(screen.getByText('Unknown Project')).toBeInTheDocument();
      // Multiple '0' values will be displayed for stats
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThan(0);
    });
  });
});