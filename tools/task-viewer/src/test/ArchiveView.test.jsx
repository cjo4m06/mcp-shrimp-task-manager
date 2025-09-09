import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArchiveView from '../components/ArchiveView';

describe('ArchiveView Component', () => {
  const mockArchiveData = [
    {
      id: 'arch-001',
      timestamp: '2025-01-15T10:30:00Z',
      initialRequest: 'Create a comprehensive e-commerce platform with user authentication, product catalog, shopping cart, checkout system, and admin panel for managing products and orders',
      stats: {
        completed: 12,
        inProgress: 3,
        pending: 5,
        total: 20
      },
      tasks: []
    },
    {
      id: 'arch-002',
      timestamp: '2025-01-14T14:20:00Z',
      initialRequest: 'Implement real-time chat system with WebSocket support',
      stats: {
        completed: 8,
        inProgress: 0,
        pending: 2,
        total: 10
      },
      tasks: []
    },
    {
      id: 'arch-003',
      timestamp: '2025-01-13T09:15:00Z',
      initialRequest: 'Migrate legacy database to PostgreSQL',
      stats: {
        completed: 5,
        inProgress: 1,
        pending: 0,
        total: 6
      },
      tasks: []
    }
  ];

  const mockOnViewArchive = vi.fn();
  const mockOnDeleteArchive = vi.fn();
  const mockOnImportArchive = vi.fn();

  const defaultProps = {
    archives: mockArchiveData,
    loading: false,
    error: '',
    onViewArchive: mockOnViewArchive,
    onDeleteArchive: mockOnDeleteArchive,
    onImportArchive: mockOnImportArchive,
    projectId: 'test-project'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(<ArchiveView {...defaultProps} {...props} />);
  };

  describe('Table Rendering', () => {
    it('renders table with correct columns', () => {
      renderComponent();

      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Date Archived')).toBeInTheDocument();
      expect(screen.getByText('Initial Request')).toBeInTheDocument();
      expect(screen.getByText('Task Statistics')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('displays archive data correctly', () => {
      renderComponent();

      // IDs are truncated to first 8 characters
      expect(screen.getByText('arch-001')).toBeInTheDocument();
      expect(screen.getByText('arch-002')).toBeInTheDocument();
      expect(screen.getByText('arch-003')).toBeInTheDocument();
    });

    it('truncates initial request to 100 characters', () => {
      renderComponent();

      const longRequest = screen.getByText(/Create a comprehensive e-commerce platform/);
      expect(longRequest.textContent.length).toBeLessThanOrEqual(103); // 100 chars + "..."
    });

    it('displays stats correctly', () => {
      renderComponent();

      // Check first archive stats
      const firstRow = screen.getByText('arch-001').closest('tr');
      expect(within(firstRow).getByText(/12 completed/i)).toBeInTheDocument();
      expect(within(firstRow).getByText(/3 in progress/i)).toBeInTheDocument();
      expect(within(firstRow).getByText(/5 pending/i)).toBeInTheDocument();
    });

    it('sorts by timestamp descending by default', () => {
      renderComponent();

      const rows = screen.getAllByRole('row');
      // Skip header row - should have 4 total (1 header + 3 data)
      expect(rows).toHaveLength(4);
      
      const dataRows = rows.slice(1);
      
      expect(within(dataRows[0]).getByText('arch-001')).toBeInTheDocument(); // Latest timestamp
      expect(within(dataRows[1]).getByText('arch-002')).toBeInTheDocument(); // Middle timestamp
      expect(within(dataRows[2]).getByText('arch-003')).toBeInTheDocument(); // Oldest timestamp
    });
  });

  describe('Empty State', () => {
    it('displays empty state message when no archives exist', () => {
      renderComponent({ archives: [] });

      expect(screen.getByText('No archived task lists found')).toBeInTheDocument();
    });

    it('displays empty state when archives array is empty', () => {
      renderComponent({ archives: [] });

      expect(screen.getByText('No archived task lists found')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('displays loading state', () => {
      renderComponent({ loading: true, archives: [] });

      expect(screen.getByText('Loading ⏳')).toBeInTheDocument();
    });

    it('displays error state', () => {
      renderComponent({ error: 'Failed to load archives', archives: [] });

      expect(screen.getByText('Failed to load archives')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('displays pagination controls', () => {
      const manyArchives = Array.from({ length: 20 }, (_, i) => ({
        id: `arch-${String(i + 1).padStart(3, '0')}`,
        timestamp: new Date(2025, 0, 20 - i).toISOString(),
        initialRequest: `Archive request ${i + 1}`,
        stats: {
          completed: i * 2,
          inProgress: i,
          pending: 20 - i,
          total: 20 + i
        },
        tasks: []
      }));
      
      renderComponent({ archives: manyArchives });

      expect(screen.getByText('<<')).toBeInTheDocument();
      expect(screen.getByText('<')).toBeInTheDocument();
      expect(screen.getByText('>')).toBeInTheDocument();
      expect(screen.getByText('>>')).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });

    it('shows 15 items per page', () => {
      const manyArchives = Array.from({ length: 20 }, (_, i) => ({
        id: `arch-${String(i + 1).padStart(3, '0')}`,
        timestamp: new Date(2025, 0, 20 - i).toISOString(),
        initialRequest: `Archive request ${i + 1}`,
        stats: {
          completed: i * 2,
          inProgress: i,
          pending: 20 - i,
          total: 20 + i
        },
        tasks: []
      }));
      
      renderComponent({ archives: manyArchives });

      const rows = screen.getAllByRole('row');
      // 1 header row + 15 data rows
      expect(rows).toHaveLength(16);
    });

    it('navigates between pages correctly', async () => {
      const manyArchives = Array.from({ length: 20 }, (_, i) => ({
        id: `arch-${String(i + 1).padStart(3, '0')}`,
        timestamp: new Date(2025, 0, 20 - i).toISOString(),
        initialRequest: `Archive request ${i + 1}`,
        stats: {
          completed: i * 2,
          inProgress: i,
          pending: 20 - i,
          total: 20 + i
        },
        tasks: []
      }));
      
      renderComponent({ archives: manyArchives });

      // Initially on page 1
      expect(screen.getByText('arch-001')).toBeInTheDocument();
      expect(screen.queryByText('arch-016')).not.toBeInTheDocument();

      // Go to next page
      fireEvent.click(screen.getByText('>'));
      
      await waitFor(() => {
        expect(screen.queryByText('arch-001')).not.toBeInTheDocument();
        expect(screen.getByText('arch-016')).toBeInTheDocument();
      });

      // Go back to first page
      fireEvent.click(screen.getByText('<<'));
      
      await waitFor(() => {
        expect(screen.getByText('arch-001')).toBeInTheDocument();
        expect(screen.queryByText('arch-016')).not.toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('renders action buttons for each archive', () => {
      renderComponent();

      const viewButtons = screen.getAllByTitle('View');
      const deleteButtons = screen.getAllByTitle('Delete');
      const importButtons = screen.getAllByTitle('Import');

      expect(viewButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
      expect(importButtons).toHaveLength(3);
    });

    it('calls onViewArchive when view button is clicked', async () => {
      renderComponent();

      const firstViewButton = screen.getAllByTitle('View')[0];
      fireEvent.click(firstViewButton);

      await waitFor(() => {
        expect(mockOnViewArchive).toHaveBeenCalledWith(mockArchiveData[0]);
      });
    });

    it('calls onDeleteArchive when delete button is clicked', async () => {
      renderComponent();

      const firstDeleteButton = screen.getAllByTitle('Delete')[0];
      fireEvent.click(firstDeleteButton);

      await waitFor(() => {
        expect(mockOnDeleteArchive).toHaveBeenCalledWith(mockArchiveData[0]);
      });
    });

    it('calls onImportArchive when import button is clicked', async () => {
      renderComponent();

      const firstImportButton = screen.getAllByTitle('Import')[0];
      fireEvent.click(firstImportButton);

      await waitFor(() => {
        expect(mockOnImportArchive).toHaveBeenCalledWith(mockArchiveData[0]);
      });
    });

    it('shows correct icons for action buttons', () => {
      renderComponent();

      expect(screen.getAllByText('👁️')).toHaveLength(3); // View icons
      expect(screen.getAllByText('🗑️')).toHaveLength(3); // Delete icons
      expect(screen.getAllByText('📥')).toHaveLength(3); // Import icons
    });
  });

  describe('Table Styling', () => {
    it('applies consistent styling matching HistoryView', () => {
      const { container } = renderComponent();

      expect(container.querySelector('.archive-view')).toBeInTheDocument();
      expect(container.querySelector('.table')).toBeInTheDocument();
      expect(container.querySelector('.pagination')).toBeInTheDocument();
      expect(container.querySelector('.pagination-controls')).toBeInTheDocument();
      expect(container.querySelector('.pagination-info')).toBeInTheDocument();
    });

    it('renders table with proper accessibility attributes', () => {
      renderComponent();

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(5);

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // Header + data rows
    });
  });
});