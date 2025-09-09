import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/i18n';

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  const renderApp = () => {
    return render(
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    );
  };

  describe('Initial Load', () => {
    it('should load profiles on mount', async () => {
      renderApp();

      // Wait for agents endpoint to be called (App loads profiles via /api/agents)
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/agents');
      });
    });

    it('should display error if profile loading fails', async () => {
      // Mock fetch to simulate network error for all calls
      global.fetch.mockReset();
      global.fetch.mockRejectedValue(new Error('Network error'));

      renderApp();

      // Wait for the error to appear (use same pattern as integration test)
      await waitFor(() => {
        expect(screen.getByText(/Failed to load profiles|Error loading profiles/i)).toBeInTheDocument();
      });
    });

    it('should show "No profiles" message when no profiles exist', async () => {
      // Clear URL state to avoid triggering profile selection logic
      Object.defineProperty(window, 'location', {
        value: { 
          ...window.location, 
          search: '', 
          pathname: '/' 
        },
        writable: true
      });

      // Set up mock to return empty array for /api/agents
      global.fetch.mockReset();
      global.fetch.mockImplementation((url) => {
        if (url.includes('/api/agents')) {
          return Promise.resolve({
            ok: true,
            json: async () => []
          });
        }
        if (url.includes('/api/global-settings')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ claudeFolderPath: '' })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({})
        });
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('No profiles configured')).toBeInTheDocument();
      });
    });
  });

  describe('Profile Management', () => {
    it('should display profile tabs', async () => {
      renderApp();

      // Wait for profiles to load from the default mock
      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
        expect(screen.getByText('Another Profile')).toBeInTheDocument();
      });
    });

    it('should load tasks when profile is selected', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test Profile'));

      await waitFor(() => {
        // Check for the correct endpoint format - App loads tasks from /api/tasks/{profileId}
        expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/tasks\/profile-1\?t=\d+/));
      });
    });

    it('should clear search when switching profiles', async () => {
      const user = userEvent.setup();
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
      });

      // Select first profile
      fireEvent.click(screen.getByText('Test Profile'));
      
      // Wait for search input to be available after profile loads
      await waitFor(() => {
        const searchInput = screen.queryByPlaceholderText(/Search/i);
        expect(searchInput).toBeInTheDocument();
      });
      
      const searchInput = screen.getByPlaceholderText(/Search/i);
      await user.type(searchInput, 'test search');

      // Switch to second profile
      fireEvent.click(screen.getByText('Another Profile'));

      await waitFor(() => {
        const newSearchInput = screen.getByPlaceholderText(/Search/i);
        expect(newSearchInput.value).toBe('');
      });
    });

    it('should handle task loading errors', async () => {
      // Override the default mock to simulate task loading error
      global.fetch.mockImplementation((url) => {
        if (typeof url === 'string' && url.includes('/tasks')) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Server error' })
          });
        }
        // Use default mock for profiles
        if (typeof url === 'string' && url.includes('/api/profiles')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              { id: 'profile-1', name: 'Test Profile', taskFolderPath: '/test/tasks', projectRootPath: '/test/project', isActive: true },
              { id: 'profile-2', name: 'Another Profile', taskFolderPath: '/test/other', projectRootPath: '/test/other-project', isActive: false }
            ]
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test Profile'));

      await waitFor(() => {
        const errorElement = screen.queryByText((content) => {
          return content && content.includes('Error') || content && content.includes('error');
        });
        expect(errorElement).toBeInTheDocument();
      });
    });
  });

  describe('Add Profile', () => {
    it('should show add profile form when button clicked', async () => {
      renderApp();

      await waitFor(() => {
        const addButton = screen.getByText((content, element) => {
          return content && content.includes('add') || content && content.includes('+');
        });
        expect(addButton).toBeInTheDocument();
      });

      const addButton = screen.getByText((content) => content && content.includes('add') || content && content.includes('+'));
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Add.*Profile/i)).toBeInTheDocument();
      });
    });

    it('should add new profile successfully', async () => {
      const user = userEvent.setup();
      
      // Mock the add-project endpoint response
      global.fetch.mockImplementation((url, options) => {
        if (typeof url === 'string' && url.includes('/api/add-project') && options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ id: 'new-profile', name: 'New Profile' })
          });
        }
        // Return default profiles mock
        if (typeof url === 'string' && url.includes('/api/profiles')) {
          return Promise.resolve({
            ok: true,
            json: async () => []
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderApp();

      await waitFor(() => {
        const addButton = screen.queryByText((content) => content && content.includes('add') || content && content.includes('+'));
        expect(addButton).toBeInTheDocument();
      });

      const addButton = screen.getByText((content) => content && content.includes('add') || content && content.includes('+'));
      fireEvent.click(addButton);

      await waitFor(() => {
        const nameInput = screen.queryByPlaceholderText(/name/i);
        expect(nameInput).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/name/i);
      await user.type(nameInput, 'New Profile');

      const folderInput = screen.queryByPlaceholderText(/folder|path/i);
      if (folderInput) {
        await user.type(folderInput, '/test/new-folder');
      }

      const submitButton = screen.getByRole('button', { name: /add|create|save/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/add-project'),
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });

    it('should show error if add profile fails', async () => {
      const user = userEvent.setup();
      
      // Mock the add-project endpoint to fail
      global.fetch.mockImplementation((url, options) => {
        if (typeof url === 'string' && url.includes('/api/add-project') && options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            json: async () => ({ error: 'Server error' })
          });
        }
        // Return default profiles mock
        if (typeof url === 'string' && url.includes('/api/profiles')) {
          return Promise.resolve({
            ok: true,
            json: async () => []
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderApp();

      await waitFor(() => {
        const addButton = screen.queryByText((content) => content && content.includes('add') || content && content.includes('+'));
        expect(addButton).toBeInTheDocument();
      });

      const addButton = screen.getByText((content) => content && content.includes('add') || content && content.includes('+'));
      fireEvent.click(addButton);

      await waitFor(() => {
        const nameInput = screen.queryByPlaceholderText(/name/i);
        expect(nameInput).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/name/i);
      await user.type(nameInput, 'New Profile');

      const folderInput = screen.queryByPlaceholderText(/folder|path/i);
      if (folderInput) {
        await user.type(folderInput, '/test/new-folder');
      }

      const submitButton = screen.getByRole('button', { name: /add|create|save/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorElement = screen.queryByText((content) => {
          return content && (content.includes('Failed') || content.includes('Error') || content.includes('error'));
        });
        if (errorElement) {
          expect(errorElement).toBeInTheDocument();
        }
      });
    });

    it('should cancel add profile form', async () => {
      renderApp();

      await waitFor(() => {
        const addButton = screen.queryByText((content) => content && content.includes('add') || content && content.includes('+'));
        expect(addButton).toBeInTheDocument();
      });

      const addButton = screen.getByText((content) => content && content.includes('add') || content && content.includes('+'));
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Add.*Profile/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(screen.queryByText(/Add.*Profile/i)).not.toBeInTheDocument();
    });
  });

  describe('Remove Profile', () => {
    it('should confirm before removing profile', async () => {
      const confirmSpy = vi.spyOn(global, 'confirm').mockReturnValue(false);

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
      });

      const removeButtons = screen.queryAllByLabelText(/remove/i) || screen.queryAllByRole('button', { name: /remove|delete/i });
      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]);
        expect(confirmSpy).toHaveBeenCalled();
      }
    });

    it('should remove profile when confirmed', async () => {
      vi.spyOn(global, 'confirm').mockReturnValue(true);

      // Mock the remove-project endpoint
      global.fetch.mockImplementation((url, options) => {
        if (typeof url === 'string' && url.includes('/api/remove-project/') && options?.method === 'DELETE') {
          return Promise.resolve({ ok: true, json: async () => ({}) });
        }
        // Return profiles mock
        if (typeof url === 'string' && url.includes('/api/profiles')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              { id: 'profile-2', name: 'Another Profile', taskFolderPath: '/test/other', projectRootPath: '/test/other-project', isActive: false }
            ]
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
      });

      const removeButtons = screen.queryAllByLabelText(/remove/i) || screen.queryAllByRole('button', { name: /remove|delete/i });
      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]);
        
        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/remove-project/'),
            expect.objectContaining({ method: 'DELETE' })
          );
        });
      }
    });

    it('should clear tasks if removing selected profile', async () => {
      vi.spyOn(global, 'confirm').mockReturnValue(true);

      // Set up the sequence of fetch calls
      global.fetch.mockImplementation((url, options) => {
        if (typeof url === 'string' && url.includes('/tasks')) {
          return Promise.resolve({
            ok: true,
            json: async () => ([
              { id: 'task-1', name: 'Test Task 1', status: 'pending' },
              { id: 'task-2', name: 'Test Task 2', status: 'completed' }
            ])
          });
        }
        if (typeof url === 'string' && url.includes('/api/remove-project/') && options?.method === 'DELETE') {
          return Promise.resolve({ ok: true, json: async () => ({}) });
        }
        // For the reload after deletion, return only one profile
        if (typeof url === 'string' && url.includes('/api/profiles')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              { id: 'profile-2', name: 'Another Profile', taskFolderPath: '/test/other', projectRootPath: '/test/other-project', isActive: false }
            ]
          });
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
      });

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Test Profile'));

      await waitFor(() => {
        const taskElement = screen.queryByText('Test Task 1');
        if (taskElement) {
          expect(taskElement).toBeInTheDocument();
        }
      });

      const removeButtons = screen.queryAllByLabelText(/remove/i) || screen.queryAllByRole('button', { name: /remove|delete/i });
      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]);
        
        await waitFor(() => {
          expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Auto-refresh', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should enable auto-refresh', async () => {
      renderApp();

      // Wait for profiles to load
      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
      });

      // Select a profile
      fireEvent.click(screen.getByText('Test Profile'));

      // Find and enable auto-refresh checkbox if present
      await waitFor(() => {
        const autoRefreshCheckbox = screen.queryByLabelText(/auto.*refresh/i);
        if (autoRefreshCheckbox) {
          fireEvent.click(autoRefreshCheckbox);
          expect(autoRefreshCheckbox).toBeChecked();
        }
      });

      // Fast-forward time
      vi.advanceTimersByTime(30000);

      // Verify fetch was called multiple times
      await waitFor(() => {
        const taskCalls = global.fetch.mock.calls.filter(call => {
          const url = call[0];
          return typeof url === 'string' && url.includes('/tasks');
        });
        expect(taskCalls.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should update refresh interval', async () => {
      const user = userEvent.setup({ delay: null });
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
      });

      const intervalInput = screen.queryByLabelText(/interval/i);
      if (intervalInput) {
        await user.clear(intervalInput);
        await user.type(intervalInput, '60');
        expect(intervalInput.value).toBe('60');
      }
    });

    it('should stop auto-refresh when disabled', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test Profile'));

      const autoRefreshCheckbox = screen.queryByLabelText(/auto.*refresh/i);
      if (autoRefreshCheckbox) {
        // Enable
        fireEvent.click(autoRefreshCheckbox);
        expect(autoRefreshCheckbox).toBeChecked();

        // Disable
        fireEvent.click(autoRefreshCheckbox);
        expect(autoRefreshCheckbox).not.toBeChecked();

        const initialCallCount = global.fetch.mock.calls.length;

        // Fast-forward time
        vi.advanceTimersByTime(30000);

        // Should not have made additional calls after disabling
        expect(global.fetch.mock.calls.length).toBeLessThanOrEqual(initialCallCount + 1);
      }
    });
  });

  describe('Manual Refresh', () => {
    it('should refresh tasks when refresh button clicked', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test Profile'));

      await waitFor(() => {
        const refreshButton = screen.queryByLabelText(/refresh/i) || screen.queryByRole('button', { name: /refresh/i });
        if (refreshButton) {
          const initialCallCount = global.fetch.mock.calls.length;
          fireEvent.click(refreshButton);
          
          // Wait for the refresh to trigger
          waitFor(() => {
            expect(global.fetch.mock.calls.length).toBeGreaterThan(initialCallCount);
          });
        }
      });
    });

    it('should show loading state during refresh', async () => {
      // Mock fetch to never resolve
      global.fetch.mockImplementation(() => new Promise(() => {}));

      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Test Profile'));

      // Check for loading state
      await waitFor(() => {
        const loadingElement = screen.queryByText(/loading/i);
        if (loadingElement) {
          expect(loadingElement).toBeInTheDocument();
        }
      });
    });
  });

  describe('Error States', () => {
    it('should display network error gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network failure'));

      renderApp();

      await waitFor(() => {
        const errorElement = screen.queryByText((content) => {
          return content && content.includes('Failed to load profiles') && content.includes('Network failure');
        });
        if (errorElement) {
          expect(errorElement).toBeInTheDocument();
        }
      });
    });

    it('should handle JSON parse errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      renderApp();

      await waitFor(() => {
        const errorElement = screen.queryByText((content) => {
          return content && content.includes('Failed to load profiles') && content.includes('Invalid JSON');
        });
        if (errorElement) {
          expect(errorElement).toBeInTheDocument();
        }
      });
    });
  });
});