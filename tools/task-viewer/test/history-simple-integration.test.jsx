import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HistoryView from '../src/components/HistoryView';
import ArchiveDetailView from '../src/components/ArchiveDetailView';
import ImportArchiveModal from '../src/components/ImportArchiveModal';

describe('History and Archive Feature Integration', () => {
  const mockHistoryData = [
    {
      id: 'abc123456789',
      filename: 'tasks_memory_2024-01-15T10-30-00.json',
      timestamp: '2024-01-15T10:30:00',
      initialRequest: 'Build a user authentication system with OAuth2 support',
      taskCount: 5,
      stats: {
        total: 5,
        completed: 2,
        inProgress: 1,
        pending: 2
      }
    },
    {
      id: 'def987654321',
      filename: 'tasks_memory_2024-01-14T15-45-00.json',
      timestamp: '2024-01-14T15:45:00',
      initialRequest: 'Fix bug in payment processing system',
      taskCount: 3,
      stats: {
        total: 3,
        completed: 3,
        inProgress: 0,
        pending: 0
      }
    }
  ];

  const mockArchive = {
    id: 'archive-1',
    date: '2024-01-10T08:00:00Z',
    projectName: 'Test Project',
    tasks: [
      {
        id: 'task-1',
        name: 'Test Task 1',
        status: 'completed',
        summary: 'Task 1 completed'
      },
      {
        id: 'task-2',
        name: 'Test Task 2',
        status: 'pending'
      }
    ],
    initialRequest: 'Create a test archive',
    summary: 'This is a test summary for the archive. It contains detailed information about what was accomplished.',
    stats: {
      total: 2,
      completed: 1,
      inProgress: 0,
      pending: 1
    }
  };

  describe('HistoryView Component', () => {
    it('should render history table with new format', () => {
      const mockHandlers = {
        onViewTasks: vi.fn(),
        onDeleteHistory: vi.fn(),
        onImportHistory: vi.fn()
      };

      render(
        <HistoryView
          data={mockHistoryData}
          loading={false}
          error=""
          {...mockHandlers}
          profileId="test-project"
        />
      );

      // Check table headers
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('dateTime')).toBeInTheDocument();
      expect(screen.getByText('initialRequest')).toBeInTheDocument();
      expect(screen.getByText('statusSummary')).toBeInTheDocument();
      expect(screen.getByText('actions')).toBeInTheDocument();

      // Check data display
      expect(screen.getByText('abc12345')).toBeInTheDocument(); // Truncated ID
      expect(screen.getByText(/Build a user authentication/)).toBeInTheDocument();
      
      // Check status summary with colored badges
      const completedStats = screen.getAllByText(/completed/);
      expect(completedStats.length).toBeGreaterThan(0);
      
      const inProgressStats = screen.getAllByText(/inProgress/);
      expect(inProgressStats.length).toBeGreaterThan(0);
      
      const pendingStats = screen.getAllByText(/pending/);
      expect(pendingStats.length).toBeGreaterThan(0);
    });

    it('should handle view button click', () => {
      const onViewTasks = vi.fn();
      
      render(
        <HistoryView
          data={mockHistoryData}
          loading={false}
          error=""
          onViewTasks={onViewTasks}
          onDeleteHistory={vi.fn()}
          onImportHistory={vi.fn()}
          profileId="test-project"
        />
      );

      const viewButtons = screen.getAllByTitle('viewTasks');
      fireEvent.click(viewButtons[0]);

      expect(onViewTasks).toHaveBeenCalledWith(mockHistoryData[0]);
    });

    it('should handle delete button click', () => {
      const onDeleteHistory = vi.fn();
      
      render(
        <HistoryView
          data={mockHistoryData}
          loading={false}
          error=""
          onViewTasks={vi.fn()}
          onDeleteHistory={onDeleteHistory}
          onImportHistory={vi.fn()}
          profileId="test-project"
        />
      );

      const deleteButtons = screen.getAllByTitle('delete');
      fireEvent.click(deleteButtons[0]);

      expect(onDeleteHistory).toHaveBeenCalledWith(mockHistoryData[0]);
    });

    it('should handle import button click', () => {
      const onImportHistory = vi.fn();
      
      render(
        <HistoryView
          data={mockHistoryData}
          loading={false}
          error=""
          onViewTasks={vi.fn()}
          onDeleteHistory={vi.fn()}
          onImportHistory={onImportHistory}
          profileId="test-project"
        />
      );

      const importButtons = screen.getAllByTitle('import');
      fireEvent.click(importButtons[0]);

      expect(onImportHistory).toHaveBeenCalledWith(mockHistoryData[0]);
    });

    it('should not show delete/import buttons when handlers are not provided', () => {
      render(
        <HistoryView
          data={mockHistoryData}
          loading={false}
          error=""
          onViewTasks={vi.fn()}
          profileId="test-project"
        />
      );

      // View buttons should exist
      expect(screen.getAllByTitle('viewTasks')).toHaveLength(2);
      
      // Delete and import buttons should not exist
      expect(screen.queryByTitle('delete')).not.toBeInTheDocument();
      expect(screen.queryByTitle('import')).not.toBeInTheDocument();
    });
  });

  describe('ArchiveDetailView with Summary', () => {
    it('should display summary section when archive has summary', () => {
      render(
        <ArchiveDetailView
          archive={mockArchive}
          onBack={vi.fn()}
          projectRoot="/test"
        />
      );

      // Check for summary section
      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText(/This is a test summary for the archive/)).toBeInTheDocument();

      // Check for initial request
      expect(screen.getByText('Initial Request')).toBeInTheDocument();
      expect(screen.getByText('Create a test archive')).toBeInTheDocument();

      // Check for project info
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should not display summary section when archive has no summary', () => {
      const archiveWithoutSummary = {
        ...mockArchive,
        summary: null
      };

      render(
        <ArchiveDetailView
          archive={archiveWithoutSummary}
          onBack={vi.fn()}
          projectRoot="/test"
        />
      );

      // Summary section should not be present
      expect(screen.queryByText('Summary')).not.toBeInTheDocument();

      // But initial request should still be there
      expect(screen.getByText('Initial Request')).toBeInTheDocument();
      expect(screen.getByText('Create a test archive')).toBeInTheDocument();
    });

    it('should toggle summary collapse/expand', async () => {
      render(
        <ArchiveDetailView
          archive={mockArchive}
          onBack={vi.fn()}
          projectRoot="/test"
        />
      );

      // Summary should be expanded by default
      const summaryContent = screen.getByText(/This is a test summary for the archive/);
      expect(summaryContent).toBeVisible();

      // Click summary header to collapse
      const summaryHeader = screen.getByText('Summary');
      fireEvent.click(summaryHeader);

      // Wait for animation/state change
      await waitFor(() => {
        expect(screen.queryByText(/This is a test summary for the archive/)).not.toBeInTheDocument();
      });

      // Click again to expand
      fireEvent.click(summaryHeader);

      // Content should be visible again
      await waitFor(() => {
        expect(screen.getByText(/This is a test summary for the archive/)).toBeVisible();
      });
    });

    it('should handle back button navigation', () => {
      const onBack = vi.fn();
      
      render(
        <ArchiveDetailView
          archive={mockArchive}
          onBack={onBack}
          projectRoot="/test"
        />
      );

      const backButton = screen.getByText('← Back to Archive List');
      fireEvent.click(backButton);

      expect(onBack).toHaveBeenCalled();
    });

    it('should display task statistics correctly', () => {
      render(
        <ArchiveDetailView
          archive={mockArchive}
          onBack={vi.fn()}
          projectRoot="/test"
        />
      );

      // Check stats display
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  describe('ImportArchiveModal for History', () => {
    it('should display modal with history data', () => {
      const historyAsArchive = {
        id: mockHistoryData[0].filename,
        date: mockHistoryData[0].timestamp,
        projectName: 'test-project',
        tasks: [
          { id: '1', name: 'Task 1', status: 'completed' },
          { id: '2', name: 'Task 2', status: 'pending' }
        ],
        initialRequest: mockHistoryData[0].initialRequest,
        stats: mockHistoryData[0].stats
      };

      render(
        <ImportArchiveModal
          isOpen={true}
          onClose={vi.fn()}
          onImport={vi.fn()}
          archive={historyAsArchive}
          currentTaskCount={5}
        />
      );

      // Check modal is open
      expect(screen.getByTestId('import-modal-overlay')).toBeInTheDocument();

      // Check modal content
      expect(screen.getByText(/Import Archive/)).toBeInTheDocument();
      expect(screen.getByText(/Build a user authentication/)).toBeInTheDocument();

      // Check import options
      expect(screen.getByLabelText(/Append to existing tasks/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Replace all tasks/)).toBeInTheDocument();

      // Check task counts
      expect(screen.getByText(/2 tasks/)).toBeInTheDocument();
      expect(screen.getByText(/Currently have 5 tasks/)).toBeInTheDocument();
    });

    it('should handle import in append mode', () => {
      const onImport = vi.fn();
      const historyAsArchive = {
        id: 'test-id',
        date: new Date(),
        tasks: [],
        projectName: 'test'
      };

      render(
        <ImportArchiveModal
          isOpen={true}
          onClose={vi.fn()}
          onImport={onImport}
          archive={historyAsArchive}
          currentTaskCount={5}
        />
      );

      // Append should be selected by default
      const appendRadio = screen.getByLabelText(/Append to existing tasks/);
      expect(appendRadio).toBeChecked();

      // Click import
      const importButton = screen.getByRole('button', { name: /Import/i });
      fireEvent.click(importButton);

      expect(onImport).toHaveBeenCalledWith('append');
    });

    it('should handle import in replace mode', () => {
      const onImport = vi.fn();
      const historyAsArchive = {
        id: 'test-id',
        date: new Date(),
        tasks: [],
        projectName: 'test'
      };

      render(
        <ImportArchiveModal
          isOpen={true}
          onClose={vi.fn()}
          onImport={onImport}
          archive={historyAsArchive}
          currentTaskCount={5}
        />
      );

      // Select replace mode
      const replaceRadio = screen.getByLabelText(/Replace all tasks/);
      fireEvent.click(replaceRadio);
      expect(replaceRadio).toBeChecked();

      // Click import
      const importButton = screen.getByRole('button', { name: /Import/i });
      fireEvent.click(importButton);

      expect(onImport).toHaveBeenCalledWith('replace');
    });

    it('should close modal on cancel', () => {
      const onClose = vi.fn();
      
      render(
        <ImportArchiveModal
          isOpen={true}
          onClose={onClose}
          onImport={vi.fn()}
          archive={mockArchive}
          currentTaskCount={5}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should close modal on overlay click', () => {
      const onClose = vi.fn();
      
      render(
        <ImportArchiveModal
          isOpen={true}
          onClose={onClose}
          onImport={vi.fn()}
          archive={mockArchive}
          currentTaskCount={5}
        />
      );

      const overlay = screen.getByTestId('import-modal-overlay');
      fireEvent.click(overlay);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain consistent data structure across components', () => {
      // Test that history data can be transformed for import
      const historyEntry = mockHistoryData[0];
      const transformedForImport = {
        id: historyEntry.filename,
        date: historyEntry.timestamp,
        projectName: 'test-project',
        tasks: [], // Would be populated from API
        initialRequest: historyEntry.initialRequest,
        stats: historyEntry.stats
      };

      // Verify the structure matches what ImportArchiveModal expects
      expect(transformedForImport).toHaveProperty('id');
      expect(transformedForImport).toHaveProperty('date');
      expect(transformedForImport).toHaveProperty('tasks');
      expect(transformedForImport).toHaveProperty('stats');
    });

    it('should handle empty data gracefully', () => {
      // Test HistoryView with empty data
      render(
        <HistoryView
          data={[]}
          loading={false}
          error=""
          onViewTasks={vi.fn()}
          profileId="test-project"
        />
      );

      // Should show table headers but no data
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('dateTime')).toBeInTheDocument();
      
      // Should show empty state message
      expect(screen.getByText(/No history found/i)).toBeInTheDocument();
    });

    it('should handle loading states', () => {
      render(
        <HistoryView
          data={[]}
          loading={true}
          error=""
          onViewTasks={vi.fn()}
          profileId="test-project"
        />
      );

      expect(screen.getByText(/Loading history/i)).toBeInTheDocument();
    });

    it('should handle error states', () => {
      const errorMessage = 'Failed to load history';
      
      render(
        <HistoryView
          data={[]}
          loading={false}
          error={errorMessage}
          onViewTasks={vi.fn()}
          profileId="test-project"
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});