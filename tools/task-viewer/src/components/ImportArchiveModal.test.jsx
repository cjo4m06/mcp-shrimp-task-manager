import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportArchiveModal from './ImportArchiveModal';

describe('ImportArchiveModal', () => {
  const mockArchive = {
    id: 'archive-1',
    date: new Date('2025-09-01T10:00:00.000Z'),
    projectName: 'Test Project',
    tasks: [
      { id: '1', name: 'Task 1', status: 'completed' },
      { id: '2', name: 'Task 2', status: 'in_progress' },
      { id: '3', name: 'Task 3', status: 'pending' }
    ],
    initialRequest: 'This is the initial request for the test project that describes what needs to be done.'
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onImport: vi.fn(),
    archive: mockArchive,
    currentTaskCount: 5
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Modal Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      expect(screen.getByText(/Import Archive/i)).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<ImportArchiveModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText(/Import Archive/i)).not.toBeInTheDocument();
    });

    it('should display archive date', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      // Check for formatted date
      expect(screen.getByText(/September 1, 2025/i)).toBeInTheDocument();
    });

    it('should display task count from archive', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      expect(screen.getByText(/3 tasks/i)).toBeInTheDocument();
    });

    it('should display current task count for context', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      expect(screen.getByText(/Current tasks:/i)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display initial request preview', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      expect(screen.getByText(/This is the initial request/)).toBeInTheDocument();
    });

    it('should truncate long initial request', () => {
      const longRequest = 'a'.repeat(250);
      const archiveWithLongRequest = {
        ...mockArchive,
        initialRequest: longRequest
      };
      
      render(<ImportArchiveModal {...defaultProps} archive={archiveWithLongRequest} />);
      
      // Should show truncated text with ellipsis
      const requestElement = screen.getByText(/a{200}\.\.\./, { exact: false });
      expect(requestElement).toBeInTheDocument();
    });

    it('should handle missing initial request', () => {
      const archiveWithoutRequest = {
        ...mockArchive,
        initialRequest: null
      };
      
      render(<ImportArchiveModal {...defaultProps} archive={archiveWithoutRequest} />);
      
      // Should not crash and modal should still render
      expect(screen.getByText(/Import Archive/i)).toBeInTheDocument();
    });
  });

  describe('Radio Button Functionality', () => {
    it('should display import mode radio buttons', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      expect(screen.getByLabelText(/Append to current tasks/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Replace all current tasks/i)).toBeInTheDocument();
    });

    it('should have append mode selected by default', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      const appendRadio = screen.getByLabelText(/Append to current tasks/i);
      const replaceRadio = screen.getByLabelText(/Replace all current tasks/i);
      
      expect(appendRadio).toBeChecked();
      expect(replaceRadio).not.toBeChecked();
    });

    it('should allow selecting replace mode', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      const replaceRadio = screen.getByLabelText(/Replace all current tasks/i);
      fireEvent.click(replaceRadio);
      
      expect(replaceRadio).toBeChecked();
      expect(screen.getByLabelText(/Append to current tasks/i)).not.toBeChecked();
    });

    it('should allow switching back to append mode', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      const appendRadio = screen.getByLabelText(/Append to current tasks/i);
      const replaceRadio = screen.getByLabelText(/Replace all current tasks/i);
      
      // First select replace
      fireEvent.click(replaceRadio);
      expect(replaceRadio).toBeChecked();
      
      // Then switch back to append
      fireEvent.click(appendRadio);
      expect(appendRadio).toBeChecked();
      expect(replaceRadio).not.toBeChecked();
    });
  });

  describe('Warning Message', () => {
    it('should not show warning message when append mode is selected', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      expect(screen.queryByText(/Warning:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/This will permanently delete/i)).not.toBeInTheDocument();
    });

    it('should show warning message when replace mode is selected', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      const replaceRadio = screen.getByLabelText(/Replace all current tasks/i);
      fireEvent.click(replaceRadio);
      
      expect(screen.getByText(/Warning:/i)).toBeInTheDocument();
      expect(screen.getByText(/This will permanently delete all 5 current tasks/i)).toBeInTheDocument();
    });

    it('should display warning in red color', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      const replaceRadio = screen.getByLabelText(/Replace all current tasks/i);
      fireEvent.click(replaceRadio);
      
      const warningElement = screen.getByText(/Warning:/i).parentElement;
      // Check for red color in RGB format
      expect(warningElement).toHaveStyle({ color: 'rgb(239, 68, 68)' });
    });

    it('should hide warning when switching back to append mode', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      const appendRadio = screen.getByLabelText(/Append to current tasks/i);
      const replaceRadio = screen.getByLabelText(/Replace all current tasks/i);
      
      // Show warning
      fireEvent.click(replaceRadio);
      expect(screen.getByText(/Warning:/i)).toBeInTheDocument();
      
      // Hide warning
      fireEvent.click(appendRadio);
      expect(screen.queryByText(/Warning:/i)).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should have Cancel and Import buttons', () => {
      render(<ImportArchiveModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Import/i })).toBeInTheDocument();
    });

    it('should call onClose when Cancel button is clicked', () => {
      const onClose = vi.fn();
      render(<ImportArchiveModal {...defaultProps} onClose={onClose} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking outside modal', () => {
      const onClose = vi.fn();
      render(<ImportArchiveModal {...defaultProps} onClose={onClose} />);
      
      const overlay = screen.getByTestId('import-modal-overlay');
      fireEvent.click(overlay);
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not close modal when clicking inside modal content', () => {
      const onClose = vi.fn();
      render(<ImportArchiveModal {...defaultProps} onClose={onClose} />);
      
      const modalContent = screen.getByTestId('import-modal-content');
      fireEvent.click(modalContent);
      
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Import Callback', () => {
    it('should call onImport with append mode when Import is clicked', () => {
      const onImport = vi.fn();
      render(<ImportArchiveModal {...defaultProps} onImport={onImport} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Import/i }));
      
      expect(onImport).toHaveBeenCalledWith('append');
    });

    it('should call onImport with replace mode when selected', () => {
      const onImport = vi.fn();
      render(<ImportArchiveModal {...defaultProps} onImport={onImport} />);
      
      const replaceRadio = screen.getByLabelText(/Replace all current tasks/i);
      fireEvent.click(replaceRadio);
      
      fireEvent.click(screen.getByRole('button', { name: /Import/i }));
      
      expect(onImport).toHaveBeenCalledWith('replace');
    });

    it('should close modal after import', () => {
      const onClose = vi.fn();
      const onImport = vi.fn();
      render(<ImportArchiveModal {...defaultProps} onClose={onClose} onImport={onImport} />);
      
      fireEvent.click(screen.getByRole('button', { name: /Import/i }));
      
      expect(onImport).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty archive tasks', () => {
      const emptyArchive = {
        ...mockArchive,
        tasks: []
      };
      
      render(<ImportArchiveModal {...defaultProps} archive={emptyArchive} />);
      
      expect(screen.getByText(/0 tasks/i)).toBeInTheDocument();
    });

    it('should handle zero current tasks', () => {
      render(<ImportArchiveModal {...defaultProps} currentTaskCount={0} />);
      
      expect(screen.getByText(/Current tasks:/i)).toBeInTheDocument();
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display correct warning with zero current tasks', () => {
      render(<ImportArchiveModal {...defaultProps} currentTaskCount={0} />);
      
      const replaceRadio = screen.getByLabelText(/Replace all current tasks/i);
      fireEvent.click(replaceRadio);
      
      // Should still show warning even with 0 tasks
      expect(screen.getByText(/Warning:/i)).toBeInTheDocument();
    });

    it('should handle undefined archive gracefully', () => {
      render(<ImportArchiveModal {...defaultProps} archive={undefined} />);
      
      // Modal should still render with default values
      expect(screen.getByText(/Import Archive/i)).toBeInTheDocument();
    });
  });
});