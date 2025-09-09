import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportModal from './ExportModal';

describe('ExportModal', () => {
  const mockTasks = [
    {
      id: '1',
      name: 'Task 1',
      description: 'Description 1',
      status: 'completed',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    },
    {
      id: '2',
      name: 'Task 2', 
      description: 'Description 2',
      status: 'in_progress',
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-04T00:00:00.000Z'
    },
    {
      id: '3',
      name: 'Task 3',
      description: 'Description 3',
      status: 'pending',
      createdAt: '2024-01-05T00:00:00.000Z',
      updatedAt: '2024-01-05T00:00:00.000Z'
    }
  ];

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onExport: vi.fn(),
    tasks: mockTasks
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    render(<ExportModal {...defaultProps} />);
    
    expect(screen.getByText('Export Tasks')).toBeInTheDocument();
    expect(screen.getByText('File Format')).toBeInTheDocument();
    expect(screen.getByText('Filter by Status')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(<ExportModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Export Tasks')).not.toBeInTheDocument();
  });

  it('should have CSV and Markdown format options', () => {
    render(<ExportModal {...defaultProps} />);
    
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('Markdown')).toBeInTheDocument();
    expect(screen.getByText('Basic task info for spreadsheets')).toBeInTheDocument();
    expect(screen.getByText('Complete details including notes, files, dependencies')).toBeInTheDocument();
  });

  it('should have CSV selected by default', () => {
    render(<ExportModal {...defaultProps} />);
    
    const csvRadio = screen.getByDisplayValue('csv');
    const markdownRadio = screen.getByDisplayValue('markdown');
    
    expect(csvRadio).toBeChecked();
    expect(markdownRadio).not.toBeChecked();
  });

  it('should allow selecting Markdown format', () => {
    render(<ExportModal {...defaultProps} />);
    
    const markdownRadio = screen.getByDisplayValue('markdown');
    fireEvent.click(markdownRadio);
    
    expect(markdownRadio).toBeChecked();
    expect(screen.getByDisplayValue('csv')).not.toBeChecked();
  });

  it('should have status filter checkboxes', () => {
    render(<ExportModal {...defaultProps} />);
    
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
    expect(screen.getByLabelText('In Progress')).toBeInTheDocument();
    expect(screen.getByLabelText('Pending')).toBeInTheDocument();
  });

  it('should have all status checkboxes selected by default', () => {
    render(<ExportModal {...defaultProps} />);
    
    expect(screen.getByLabelText('Completed')).toBeChecked();
    expect(screen.getByLabelText('In Progress')).toBeChecked();
    expect(screen.getByLabelText('Pending')).toBeChecked();
  });

  it('should allow toggling status checkboxes', () => {
    render(<ExportModal {...defaultProps} />);
    
    const completedCheckbox = screen.getByLabelText('Completed');
    fireEvent.click(completedCheckbox);
    
    expect(completedCheckbox).not.toBeChecked();
    expect(screen.getByLabelText('In Progress')).toBeChecked();
    expect(screen.getByLabelText('Pending')).toBeChecked();
  });

  it('should display task count preview', () => {
    render(<ExportModal {...defaultProps} />);
    
    expect(screen.getByText('3 tasks selected for export')).toBeInTheDocument();
  });

  it('should update task count when filters change', () => {
    render(<ExportModal {...defaultProps} />);
    
    // Initially shows all 3 tasks
    expect(screen.getByText('3 tasks selected for export')).toBeInTheDocument();
    
    // Uncheck 'completed' status
    const completedCheckbox = screen.getByLabelText('Completed');
    fireEvent.click(completedCheckbox);
    
    // Should now show 2 tasks (in_progress + pending)
    expect(screen.getByText('2 tasks selected for export')).toBeInTheDocument();
  });

  it('should show 0 tasks when no statuses are selected', () => {
    render(<ExportModal {...defaultProps} />);
    
    // Uncheck all status filters
    fireEvent.click(screen.getByLabelText('Completed'));
    fireEvent.click(screen.getByLabelText('In Progress'));
    fireEvent.click(screen.getByLabelText('Pending'));
    
    expect(screen.getByText('0 tasks selected for export')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<ExportModal {...defaultProps} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when clicking outside modal', () => {
    const onClose = vi.fn();
    render(<ExportModal {...defaultProps} onClose={onClose} />);
    
    // Click on the modal overlay (outside the modal content)
    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close modal when clicking inside modal content', () => {
    const onClose = vi.fn();
    render(<ExportModal {...defaultProps} onClose={onClose} />);
    
    const modalContent = screen.getByTestId('modal-content');
    fireEvent.click(modalContent);
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should call onExport with correct parameters when export button is clicked', () => {
    const onExport = vi.fn();
    render(<ExportModal {...defaultProps} onExport={onExport} />);
    
    fireEvent.click(screen.getByText('Export'));
    
    expect(onExport).toHaveBeenCalledWith({
      format: 'csv',
      selectedStatuses: ['completed', 'in_progress', 'pending'],
      filteredTasks: mockTasks
    });
  });

  it('should call onExport with markdown format when selected', () => {
    const onExport = vi.fn();
    render(<ExportModal {...defaultProps} onExport={onExport} />);
    
    // Select Markdown format
    fireEvent.click(screen.getByDisplayValue('markdown'));
    fireEvent.click(screen.getByText('Export'));
    
    expect(onExport).toHaveBeenCalledWith({
      format: 'markdown',
      selectedStatuses: ['completed', 'in_progress', 'pending'],
      filteredTasks: mockTasks
    });
  });

  it('should call onExport with filtered tasks when status filters are applied', () => {
    const onExport = vi.fn();
    render(<ExportModal {...defaultProps} onExport={onExport} />);
    
    // Uncheck 'completed' status
    fireEvent.click(screen.getByLabelText('Completed'));
    fireEvent.click(screen.getByText('Export'));
    
    const expectedFilteredTasks = mockTasks.filter(task => 
      task.status === 'in_progress' || task.status === 'pending'
    );
    
    expect(onExport).toHaveBeenCalledWith({
      format: 'csv',
      selectedStatuses: ['in_progress', 'pending'],
      filteredTasks: expectedFilteredTasks
    });
  });

  it('should disable export button when no tasks are selected', () => {
    render(<ExportModal {...defaultProps} />);
    
    // Uncheck all status filters
    fireEvent.click(screen.getByLabelText('Completed'));
    fireEvent.click(screen.getByLabelText('In Progress'));
    fireEvent.click(screen.getByLabelText('Pending'));
    
    const exportButton = screen.getByText('Export');
    expect(exportButton).toBeDisabled();
  });

  it('should close modal after successful export', async () => {
    const onClose = vi.fn();
    const onExport = vi.fn().mockResolvedValue(true);
    
    render(<ExportModal {...defaultProps} onClose={onClose} onExport={onExport} />);
    
    fireEvent.click(screen.getByText('Export'));
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should not close modal if export fails', async () => {
    const onClose = vi.fn();
    const onExport = vi.fn().mockResolvedValue(false);
    
    render(<ExportModal {...defaultProps} onClose={onClose} onExport={onExport} />);
    
    fireEvent.click(screen.getByText('Export'));
    
    await waitFor(() => {
      expect(onExport).toHaveBeenCalled();
    });
    
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should handle empty tasks array', () => {
    render(<ExportModal {...defaultProps} tasks={[]} />);
    
    expect(screen.getByText('0 tasks selected for export')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeDisabled();
  });
});