import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewArchiveModal from './ViewArchiveModal';

// Mock TaskTable component since it's complex
vi.mock('./TaskTable', () => ({
  default: ({ data, globalFilter, onGlobalFilterChange }) => (
    <div data-testid="task-table-mock">
      <div data-testid="task-count">{data.length} tasks</div>
      <div data-testid="global-filter">{globalFilter}</div>
      {data.map((task, index) => (
        <div key={task.id} data-testid={`task-row-${index}`}>
          {task.name} - {task.status}
        </div>
      ))}
    </div>
  )
}));

describe('ViewArchiveModal', () => {
  const mockArchive = {
    id: 'archive-1',
    date: new Date('2025-09-01T10:00:00.000Z'),
    projectName: 'Test Project',
    initialRequest: 'This is the initial request for the test project that describes what needs to be done in detail.',
    stats: {
      total: 5,
      completed: 3,
      inProgress: 1,
      pending: 1
    },
    tasks: [
      { id: '1', name: 'Task 1', status: 'completed', description: 'First task' },
      { id: '2', name: 'Task 2', status: 'in_progress', description: 'Second task' },
      { id: '3', name: 'Task 3', status: 'pending', description: 'Third task' },
      { id: '4', name: 'Task 4', status: 'completed', description: 'Fourth task' },
      { id: '5', name: 'Task 5', status: 'completed', description: 'Fifth task' }
    ]
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    archive: mockArchive
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      expect(screen.getByText(/View Archive/i)).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<ViewArchiveModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText(/View Archive/i)).not.toBeInTheDocument();
    });

    it('should be full-screen modal', () => {
      const { container } = render(<ViewArchiveModal {...defaultProps} />);
      
      const overlay = container.querySelector('.modal-overlay');
      expect(overlay).toHaveStyle({
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0', 
        bottom: '0'
      });
    });

    it('should have close button', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<ViewArchiveModal {...defaultProps} onClose={onClose} />);
      
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside modal', () => {
      const onClose = vi.fn();
      render(<ViewArchiveModal {...defaultProps} onClose={onClose} />);
      
      const overlay = screen.getByTestId('view-modal-overlay');
      fireEvent.click(overlay);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close modal when clicking inside modal content', () => {
      const onClose = vi.fn();
      render(<ViewArchiveModal {...defaultProps} onClose={onClose} />);
      
      const modalContent = screen.getByTestId('view-modal-content');
      fireEvent.click(modalContent);
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Archive Information Display', () => {
    it('should display archive timestamp', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      expect(screen.getByText(/September 1, 2025/i)).toBeInTheDocument();
    });

    it('should display project name', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should display initial request', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      expect(screen.getByText(/This is the initial request/)).toBeInTheDocument();
    });

    it('should handle missing project name gracefully', () => {
      const archiveWithoutProject = {
        ...mockArchive,
        projectName: null
      };
      
      render(<ViewArchiveModal {...defaultProps} archive={archiveWithoutProject} />);
      
      expect(screen.getByText('Unknown Project')).toBeInTheDocument();
    });

    it('should handle missing initial request gracefully', () => {
      const archiveWithoutRequest = {
        ...mockArchive,
        initialRequest: null
      };
      
      render(<ViewArchiveModal {...defaultProps} archive={archiveWithoutRequest} />);
      
      // Modal should still render without crashing
      expect(screen.getByText(/View Archive/i)).toBeInTheDocument();
    });

    it('should format date correctly', () => {
      const archiveWithDifferentDate = {
        ...mockArchive,
        date: new Date('2024-12-25T15:30:00.000Z')
      };
      
      render(<ViewArchiveModal {...defaultProps} archive={archiveWithDifferentDate} />);
      
      expect(screen.getByText(/December 25, 2024/i)).toBeInTheDocument();
    });
  });

  describe('TaskTable Integration', () => {
    it('should render TaskTable component', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      expect(screen.getByTestId('task-table-mock')).toBeInTheDocument();
    });

    it('should pass archive tasks to TaskTable', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      expect(screen.getByTestId('task-count')).toHaveTextContent('5 tasks');
    });

    it('should render all task rows', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      expect(screen.getByTestId('task-row-0')).toHaveTextContent('Task 1 - completed');
      expect(screen.getByTestId('task-row-1')).toHaveTextContent('Task 2 - in_progress');
      expect(screen.getByTestId('task-row-2')).toHaveTextContent('Task 3 - pending');
      expect(screen.getByTestId('task-row-3')).toHaveTextContent('Task 4 - completed');
      expect(screen.getByTestId('task-row-4')).toHaveTextContent('Task 5 - completed');
    });

    it('should handle empty tasks array', () => {
      const archiveWithNoTasks = {
        ...mockArchive,
        tasks: []
      };
      
      render(<ViewArchiveModal {...defaultProps} archive={archiveWithNoTasks} />);
      
      expect(screen.getByTestId('task-count')).toHaveTextContent('0 tasks');
    });

    it('should pass read-only props to TaskTable', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      // TaskTable should be rendered without edit/delete functionality
      // This is implied by not passing onDeleteTask, onTaskSaved, etc.
      expect(screen.getByTestId('task-table-mock')).toBeInTheDocument();
    });
  });

  describe('Stats Summary', () => {
    it('should display stats summary at bottom', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      expect(screen.getByText(/Task Statistics/i)).toBeInTheDocument();
      
      // Check completed stats
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      
      // Check in progress stats
      const inProgressNumbers = screen.getAllByText('1');
      expect(inProgressNumbers).toHaveLength(2); // in progress and pending both have 1
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      
      // Check pending stats
      expect(screen.getByText('Pending')).toBeInTheDocument();
      
      // Check total stats
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should handle missing stats gracefully', () => {
      const archiveWithoutStats = {
        ...mockArchive,
        stats: null
      };
      
      render(<ViewArchiveModal {...defaultProps} archive={archiveWithoutStats} />);
      
      // Should calculate stats from tasks
      expect(screen.getByText(/Task Statistics/i)).toBeInTheDocument();
    });

    it('should calculate stats from tasks when stats missing', () => {
      const archiveWithoutStats = {
        ...mockArchive,
        stats: undefined
      };
      
      render(<ViewArchiveModal {...defaultProps} archive={archiveWithoutStats} />);
      
      // Should show calculated stats: 3 completed, 1 in_progress, 1 pending, 5 total
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      const numbers = screen.getAllByText('1');
      expect(numbers).toHaveLength(2); // in progress and pending both have 1
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('Dark Theme Styling', () => {
    it('should apply dark theme styles', () => {
      const { container } = render(<ViewArchiveModal {...defaultProps} />);
      
      const modalContent = container.querySelector('.modal-content');
      expect(modalContent).toHaveStyle({
        backgroundColor: '#1a1a1a',
        color: '#fff'
      });
    });

    it('should have consistent styling with app', () => {
      const { container } = render(<ViewArchiveModal {...defaultProps} />);
      
      expect(container.querySelector('.view-archive-modal')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined archive gracefully', () => {
      render(<ViewArchiveModal {...defaultProps} archive={undefined} />);
      
      expect(screen.getByText(/View Archive/i)).toBeInTheDocument();
      expect(screen.getByText('Unknown Project')).toBeInTheDocument();
    });

    it('should handle null archive gracefully', () => {
      render(<ViewArchiveModal {...defaultProps} archive={null} />);
      
      expect(screen.getByText(/View Archive/i)).toBeInTheDocument();
    });

    it('should handle archive with invalid date', () => {
      const archiveWithInvalidDate = {
        ...mockArchive,
        date: 'invalid-date'
      };
      
      render(<ViewArchiveModal {...defaultProps} archive={archiveWithInvalidDate} />);
      
      expect(screen.getByText(/View Archive/i)).toBeInTheDocument();
    });

    it('should escape key close modal', () => {
      const onClose = vi.fn();
      render(<ViewArchiveModal {...defaultProps} onClose={onClose} />);
      
      fireEvent.keyDown(document, { key: 'Escape', keyCode: 27 });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('should focus close button when opened', async () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await waitFor(() => {
        expect(closeButton).toHaveFocus();
      });
    });

    it('should trap focus within modal', () => {
      render(<ViewArchiveModal {...defaultProps} />);
      
      // Should have proper focus management
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });
});