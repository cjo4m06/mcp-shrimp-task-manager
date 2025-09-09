import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n/i18n';

// Mock data for testing
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
    initialRequest: 'Fix bug in payment processing system and add error logging',
    taskCount: 3,
    stats: {
      total: 3,
      completed: 3,
      inProgress: 0,
      pending: 0
    }
  }
];

const mockHistoryTasks = {
  tasks: [
    {
      id: 'task-1',
      name: 'Setup OAuth2 authentication',
      status: 'completed',
      summary: 'Implemented OAuth2 with JWT tokens',
      description: 'Full OAuth2 implementation with Google and GitHub providers'
    },
    {
      id: 'task-2',
      name: 'Create user session management',
      status: 'completed',
      summary: 'Built session management with Redis',
      description: 'Session management with Redis for scalability'
    },
    {
      id: 'task-3',
      name: 'Add password reset functionality',
      status: 'in_progress',
      description: 'Password reset via email'
    },
    {
      id: 'task-4',
      name: 'Implement 2FA',
      status: 'pending',
      description: 'Two-factor authentication'
    },
    {
      id: 'task-5',
      name: 'Security audit',
      status: 'pending',
      description: 'Complete security audit of auth system'
    }
  ],
  initialRequest: 'Build a user authentication system with OAuth2 support',
  summary: 'Successfully implemented OAuth2 authentication system with JWT tokens, user session management, and comprehensive error handling. All security best practices have been followed.'
};

const mockArchiveData = [
  {
    id: 'archive-1',
    date: '2024-01-10T08:00:00Z',
    projectName: 'Test Project',
    tasks: [
      {
        id: 'arch-task-1',
        name: 'Archive Task 1',
        status: 'completed',
        summary: 'Archive task completed'
      },
      {
        id: 'arch-task-2',
        name: 'Archive Task 2',
        status: 'completed',
        summary: 'Another archive task completed'
      }
    ],
    initialRequest: 'Create a test archive',
    summary: 'Archive summary: All tasks completed successfully with full test coverage.',
    stats: {
      total: 2,
      completed: 2,
      inProgress: 0,
      pending: 0
    }
  }
];

describe('History Feature Integration Tests', () => {
  let originalFetch;
  let originalLocalStorage;
  let mockDeletedFiles = new Set();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockDeletedFiles.clear();
    
    // Save original fetch
    originalFetch = global.fetch;
    
    // Save and mock localStorage
    originalLocalStorage = global.localStorage;
    const localStorageData = {
      'selectedProfile': 'test-project',
      'task-archives-test-project': JSON.stringify(mockArchiveData)
    };
    
    global.localStorage = {
      getItem: vi.fn((key) => localStorageData[key] || null),
      setItem: vi.fn((key, value) => {
        localStorageData[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete localStorageData[key];
      }),
      clear: vi.fn(() => {
        Object.keys(localStorageData).forEach(key => delete localStorageData[key]);
      })
    };

    // Mock fetch API
    global.fetch = vi.fn((url, options = {}) => {
      // Parse URL
      const urlPath = typeof url === 'string' ? url : url.pathname;
      
      // Handle different endpoints
      if (urlPath === '/api/profiles') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            agents: [
              { id: 'test-project', name: 'Test Project', path: '/test/project.json' }
            ]
          })
        });
      }
      
      if (urlPath.includes('/api/tasks/test-project')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              tasks: [],
              initialRequest: '',
              summary: ''
            }
          })
        });
      }
      
      if (urlPath === '/api/history/test-project') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            history: mockHistoryData
          })
        });
      }
      
      if (urlPath === '/api/archives/test-project' || urlPath.includes('/archives')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            archives: mockArchiveData
          })
        });
      }
      
      if (urlPath.match(/\/api\/history\/test-project\/tasks_memory_.*\.json$/)) {
        const filename = urlPath.split('/').pop();
        
        // Handle DELETE request
        if (options.method === 'DELETE') {
          if (!mockDeletedFiles.has(filename)) {
            mockDeletedFiles.add(filename);
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve({ 
                success: true, 
                message: 'History entry deleted successfully' 
              })
            });
          }
          return Promise.resolve({
            ok: false,
            status: 404
          });
        }
        
        // Handle GET request
        if (filename === 'tasks_memory_2024-01-15T10-30-00.json') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockHistoryTasks)
          });
        }
      }
      
      // Default response
      return Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' })
      });
    });

    // Mock window.confirm for delete confirmations
    global.confirm = vi.fn(() => true);
  });

  afterEach(() => {
    // Restore original fetch and localStorage
    global.fetch = originalFetch;
    global.localStorage = originalLocalStorage;
    delete global.confirm;
    vi.clearAllMocks();
  });

  describe('History Table Display', () => {
    it('should render history view with new table format', async () => {
      const { container } = render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Wait for initial load and project selection
      await waitFor(() => {
        expect(screen.queryByText(/Loading profiles/i)).not.toBeInTheDocument();
      });

      // The test project should be auto-selected from localStorage mock
      // Wait for project tabs to load
      await waitFor(() => {
        // Look for the inner tabs that appear when a project is selected
        const tasksTab = screen.queryByText('📋 Tasks');
        if (tasksTab) {
          return true;
        }
        // Otherwise look for the history text in any form
        const historyElements = screen.queryAllByText((content, element) => {
          return content && content.includes('History');
        });
        return historyElements.length > 0;
      }, { timeout: 3000 });

      // Navigate to history tab (inner tab) - try different selectors
      let historyTab = screen.queryByText('📜 History');
      if (!historyTab) {
        historyTab = screen.queryByText(/History/i);
      }
      if (historyTab) {
        fireEvent.click(historyTab);
      }

      // Wait for history data to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/history/test-project'),
          expect.any(Object)
        );
      });

      // Verify table columns
      await waitFor(() => {
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('dateTime')).toBeInTheDocument();
        expect(screen.getByText('initialRequest')).toBeInTheDocument();
        expect(screen.getByText('statusSummary')).toBeInTheDocument();
        expect(screen.getByText('actions')).toBeInTheDocument();
      });

      // Verify data is displayed
      expect(screen.getByText('abc12345')).toBeInTheDocument(); // Truncated ID
      expect(screen.getByText(/Build a user authentication/)).toBeInTheDocument();
      expect(screen.getByText(/2.*completed/)).toBeInTheDocument();
      expect(screen.getByText(/1.*inProgress/)).toBeInTheDocument();
      expect(screen.getByText(/2.*pending/)).toBeInTheDocument();
    });

    it('should display task statistics with colored badges', async () => {
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Navigate to history
      await waitFor(() => {
        const historyTab = screen.getByText('📜 History');
        fireEvent.click(historyTab);
      });

      // Wait for data load
      await waitFor(() => {
        expect(screen.getByText(/2.*completed/)).toBeInTheDocument();
      });

      // Check for colored statistics (inline styles)
      const completedStat = screen.getByText(/2.*completed/);
      expect(completedStat).toHaveStyle({ color: 'rgb(74, 222, 128)' });

      const inProgressStat = screen.getByText(/1.*inProgress/);
      expect(inProgressStat).toHaveStyle({ color: 'rgb(250, 204, 21)' });

      const pendingStat = screen.getByText(/2.*pending/);
      expect(pendingStat).toHaveStyle({ color: 'rgb(148, 163, 184)' });
    });
  });

  describe('History Delete Functionality', () => {
    it('should delete history entry when delete button is clicked', async () => {
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Navigate to history
      const historyTab = screen.getByText('📜 History');
      fireEvent.click(historyTab);

      // Wait for history to load
      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      // Find and click delete button
      const deleteButtons = screen.getAllByTitle('delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
      
      fireEvent.click(deleteButtons[0]);

      // Verify confirmation dialog was called
      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Are you sure you want to delete this history entry')
      );

      // Wait for delete API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/history/test-project/tasks_memory_2024-01-15T10-30-00.json',
          expect.objectContaining({ method: 'DELETE' })
        );
      });

      // Verify success toast would appear (toast component testing)
      await waitFor(() => {
        expect(screen.getByText(/History entry deleted successfully/i)).toBeInTheDocument();
      });
    });

    it('should not delete when user cancels confirmation', async () => {
      global.confirm = vi.fn(() => false);

      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Navigate to history
      const historyTab = screen.getByText('📜 History');
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('delete');
      fireEvent.click(deleteButtons[0]);

      // Verify no delete API call was made
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/history/test-project/tasks_memory'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('History Import Functionality', () => {
    it('should open import modal when import button is clicked', async () => {
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Navigate to history
      const historyTab = screen.getByText('📜 History');
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      // Click import button
      const importButtons = screen.getAllByTitle('import');
      fireEvent.click(importButtons[0]);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByTestId('import-modal-overlay')).toBeInTheDocument();
      });

      // Verify modal content
      expect(screen.getByText(/Import Archive/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Append to existing tasks/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Replace all tasks/i)).toBeInTheDocument();
    });

    it('should import history tasks in append mode', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Navigate to history
      const historyTab = screen.getByText('📜 History');
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      // Click import button
      const importButtons = screen.getAllByTitle('import');
      fireEvent.click(importButtons[0]);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByTestId('import-modal-overlay')).toBeInTheDocument();
      });

      // Select append mode (should be default)
      const appendRadio = screen.getByLabelText(/Append to existing tasks/i);
      expect(appendRadio).toBeChecked();

      // Click import button in modal
      const importButton = screen.getByRole('button', { name: /Import/i });
      await user.click(importButton);

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/Appended.*tasks from history/i)).toBeInTheDocument();
      });

      // Verify modal is closed
      expect(screen.queryByTestId('import-modal-overlay')).not.toBeInTheDocument();
    });

    it('should import history tasks in replace mode', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Navigate to history
      const historyTab = screen.getByText('📜 History');
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      // Click import button
      const importButtons = screen.getAllByTitle('import');
      fireEvent.click(importButtons[0]);

      // Wait for modal
      await waitFor(() => {
        expect(screen.getByTestId('import-modal-overlay')).toBeInTheDocument();
      });

      // Select replace mode
      const replaceRadio = screen.getByLabelText(/Replace all tasks/i);
      await user.click(replaceRadio);

      // Click import button in modal
      const importButton = screen.getByRole('button', { name: /Import/i });
      await user.click(importButton);

      // Verify success message
      await waitFor(() => {
        expect(screen.getByText(/Replaced.*tasks with.*history tasks/i)).toBeInTheDocument();
      });
    });
  });

  describe('History Tasks View with Summary', () => {
    it('should navigate to history tasks view and display summary', async () => {
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Navigate to history
      const historyTab = screen.getByText('📜 History');
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      // Click view button to see history details
      const viewButtons = screen.getAllByTitle('viewTasks');
      fireEvent.click(viewButtons[0]);

      // Wait for history tasks to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/history/test-project/tasks_memory_2024-01-15T10-30-00.json'),
          expect.any(Object)
        );
      });

      // Verify history tasks view is displayed
      await waitFor(() => {
        expect(screen.getByText('Setup OAuth2 authentication')).toBeInTheDocument();
        expect(screen.getByText('Create user session management')).toBeInTheDocument();
      });

      // Verify initial request is displayed
      expect(screen.getByText('Build a user authentication system with OAuth2 support')).toBeInTheDocument();

      // Verify summary is displayed
      expect(screen.getByText(/Successfully implemented OAuth2 authentication system/)).toBeInTheDocument();
    });

    it('should handle back navigation from history tasks view', async () => {
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Navigate to history
      const historyTab = screen.getByText('📜 History');
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      // Go to history details
      const viewButtons = screen.getAllByTitle('viewTasks');
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Setup OAuth2 authentication')).toBeInTheDocument();
      });

      // Click back button
      const backButton = screen.getByRole('button', { name: /Back to History/i });
      fireEvent.click(backButton);

      // Should return to history list
      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
        expect(screen.getByText('dateTime')).toBeInTheDocument();
      });
    });
  });

  describe('Archive View Summary Display', () => {
    it('should display summary in archive detail view', async () => {
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Navigate to archive tab
      const archiveTab = screen.getByText('📦 Archive');
      fireEvent.click(archiveTab);

      // Wait for archives to load
      await waitFor(() => {
        expect(screen.getByText(/Test Project/)).toBeInTheDocument();
      });

      // Click view button on archive
      const viewButtons = screen.getAllByTitle(/view/i);
      fireEvent.click(viewButtons[0]);

      // Wait for archive detail view
      await waitFor(() => {
        expect(screen.getByText('Archive Task 1')).toBeInTheDocument();
      });

      // Verify summary section is displayed
      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText(/Archive summary: All tasks completed successfully/)).toBeInTheDocument();

      // Verify initial request is displayed
      expect(screen.getByText('Initial Request')).toBeInTheDocument();
      expect(screen.getByText('Create a test archive')).toBeInTheDocument();
    });

    it('should toggle summary section collapse/expand', async () => {
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Navigate to archive detail view
      const archiveTab = screen.getByRole('button', { name: /archive/i });
      fireEvent.click(archiveTab);

      await waitFor(() => {
        const viewButtons = screen.getAllByTitle(/view/i);
        fireEvent.click(viewButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Summary')).toBeInTheDocument();
      });

      // Summary should be expanded by default
      const summaryContent = screen.getByText(/Archive summary: All tasks completed successfully/);
      expect(summaryContent).toBeVisible();

      // Click summary header to collapse
      const summaryHeader = screen.getByText('Summary');
      fireEvent.click(summaryHeader);

      // Summary content should be hidden
      await waitFor(() => {
        expect(screen.queryByText(/Archive summary: All tasks completed successfully/)).not.toBeInTheDocument();
      });

      // Click again to expand
      fireEvent.click(summaryHeader);

      // Summary content should be visible again
      await waitFor(() => {
        expect(screen.getByText(/Archive summary: All tasks completed successfully/)).toBeVisible();
      });
    });
  });

  describe('End-to-End User Workflow', () => {
    it('should complete full workflow: view history -> import tasks -> delete old entry', async () => {
      const user = userEvent.setup();
      
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Step 1: Navigate to history
      const historyTab = screen.getByRole('button', { name: /history/i });
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      // Step 2: View history details
      const viewButtons = screen.getAllByTitle('viewTasks');
      fireEvent.click(viewButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Setup OAuth2 authentication')).toBeInTheDocument();
      });

      // Step 3: Go back to history list
      const backButton = screen.getByRole('button', { name: /Back to History/i });
      fireEvent.click(backButton);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      // Step 4: Import history tasks
      const importButtons = screen.getAllByTitle('import');
      fireEvent.click(importButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('import-modal-overlay')).toBeInTheDocument();
      });

      const importButton = screen.getByRole('button', { name: /Import/i });
      await user.click(importButton);

      await waitFor(() => {
        expect(screen.getByText(/Appended.*tasks from history/i)).toBeInTheDocument();
      });

      // Step 5: Delete the imported history entry
      const deleteButtons = screen.getAllByTitle('delete');
      fireEvent.click(deleteButtons[0]);

      expect(global.confirm).toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.getByText(/History entry deleted successfully/i)).toBeInTheDocument();
      });
    });

    it('should maintain data consistency across views', async () => {
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      // Check history view
      const historyTab = screen.getByRole('button', { name: /history/i });
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      // Switch to archive view
      const archiveTab = screen.getByRole('button', { name: /archive/i });
      fireEvent.click(archiveTab);

      await waitFor(() => {
        expect(screen.getByText(/Test Project/)).toBeInTheDocument();
      });

      // Switch back to history - data should still be there
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
        expect(screen.getByText(/Build a user authentication/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle delete errors gracefully', async () => {
      // Mock fetch to return error for delete
      global.fetch = vi.fn((url, options = {}) => {
        if (options.method === 'DELETE') {
          return Promise.resolve({
            ok: false,
            status: 500
          });
        }
        // Return normal responses for other requests
        if (url === '/api/profiles') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              agents: [{ id: 'test-project', name: 'Test Project', path: '/test/project.json' }]
            })
          });
        }
        if (url === '/api/history/test-project') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ history: mockHistoryData })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      const historyTab = screen.getByRole('button', { name: /history/i });
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('delete');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Failed to delete history/i)).toBeInTheDocument();
      });

      // Entry should still be in the list
      expect(screen.getByText('abc12345')).toBeInTheDocument();
    });

    it('should handle import with no tasks gracefully', async () => {
      // Mock empty history tasks
      global.fetch = vi.fn((url) => {
        if (url.includes('tasks_memory')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ tasks: [], initialRequest: '', summary: '' })
          });
        }
        // Default responses
        if (url === '/api/profiles') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              agents: [{ id: 'test-project', name: 'Test Project', path: '/test/project.json' }]
            })
          });
        }
        if (url === '/api/history/test-project') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ history: mockHistoryData })
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      const user = userEvent.setup();
      
      render(
        <I18nextProvider i18n={i18n}>
          <App />
        </I18nextProvider>
      );

      const historyTab = screen.getByRole('button', { name: /history/i });
      fireEvent.click(historyTab);

      await waitFor(() => {
        expect(screen.getByText('abc12345')).toBeInTheDocument();
      });

      const importButtons = screen.getAllByTitle('import');
      fireEvent.click(importButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('import-modal-overlay')).toBeInTheDocument();
      });

      const importButton = screen.getByRole('button', { name: /Import/i });
      await user.click(importButton);

      // Should show appropriate message for empty import
      await waitFor(() => {
        expect(screen.getByTestId('import-modal-overlay')).toBeInTheDocument();
      });
    });
  });
});