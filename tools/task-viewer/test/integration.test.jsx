import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import http from 'http';
import path from 'path';
import os from 'os';
import App from '../src/App';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n/i18n';

// Mock os module first
vi.mock('os', () => ({
  default: {
    homedir: () => '/mock/home',
    tmpdir: () => '/mock/tmp'
  }
}));

// Mock fs module with default export
const mockFs = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn()
};

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: actual,
    promises: mockFs
  };
});

// Import server after mocks are set up
const { startServer } = await import('../server.js');

describe('Integration Tests', () => {
  let server;
  let serverPort;
  
  const mockProfiles = [
    { id: 'agent1', name: 'Agent 1', path: '/path/agent1.json' },
    { id: 'agent2', name: 'Agent 2', path: '/path/agent2.json' }
  ];

  const mockTasks = {
    tasks: [
      {
        id: '1',
        name: 'Integration Test Task 1',
        description: 'Test task for integration testing',
        status: 'pending',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        notes: 'Important notes for testing',
        dependencies: [{ taskId: 'dep1', name: 'Dependency 1' }],
        relatedFiles: [{ path: '/test.js', type: 'CREATE' }]
      },
      {
        id: '2',
        name: 'Integration Test Task 2',
        description: 'Another test task',
        status: 'completed',
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
        completedAt: '2025-01-02T12:00:00Z'
      }
    ]
  };

  beforeEach(async () => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup file system mocks
    
    mockFs.readFile.mockImplementation((filePath) => {
      if (filePath.includes('.shrimp-task-viewer-settings.json')) {
        return Promise.resolve(JSON.stringify({ agents: mockProfiles }));
      } else if (filePath.includes('agent1.json')) {
        return Promise.resolve(JSON.stringify(mockTasks));
      } else if (filePath.includes('agent2.json')) {
        return Promise.resolve(JSON.stringify({ tasks: [] }));
      } else if (filePath.includes('index.html')) {
        return Promise.resolve('<html><body>React App</body></html>');
      }
      const error = new Error('File not found');
      error.code = 'ENOENT';
      return Promise.reject(error);
    });
    
    mockFs.writeFile.mockResolvedValue();
    mockFs.mkdir.mockResolvedValue();
    
    // Start test server
    server = await startServer();
    serverPort = server.address().port;
    
    // Mock fetch to use test server
    global.fetch = vi.fn(async (url, options) => {
      const response = await makeRealRequest(url, options);
      return {
        ok: response.statusCode >= 200 && response.statusCode < 300,
        status: response.statusCode,
        json: async () => JSON.parse(response.body),
        text: async () => response.body
      };
    });
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    vi.restoreAllMocks();
  });

  const renderApp = () => {
    return render(
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    );
  };

  describe('Full Application Flow', () => {
    it('loads profiles and displays tasks when profile selected', async () => {
      renderApp();

      // Wait for profiles to load
      await waitFor(() => {
        expect(screen.getByText('Agent 1')).toBeInTheDocument();
        expect(screen.getByText('Agent 2')).toBeInTheDocument();
      });

      // Click on Agent 1
      fireEvent.click(screen.getByText('Agent 1'));

      // Wait for tasks to load
      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
        expect(screen.getByText('Integration Test Task 2')).toBeInTheDocument();
      });

      // Verify task details are displayed
      expect(screen.getByText('Test task for integration testing')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });

    it('allows viewing task details and navigating back', async () => {
      render(<App />);

      // Load profile and tasks
      await waitFor(() => {
        expect(screen.getByText('Agent 1')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Agent 1'));
      
      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
      });

      // Click on task to view details
      const taskRow = screen.getByText('Integration Test Task 1').closest('tr');
      fireEvent.click(taskRow);

      // Verify task detail view
      await waitFor(() => {
        expect(screen.getByText('← Back to Tasks')).toBeInTheDocument();
        expect(screen.getByText('Important notes for testing')).toBeInTheDocument();
        expect(screen.getByText('Dependency 1')).toBeInTheDocument();
        expect(screen.getByText('/test.js')).toBeInTheDocument();
      });

      // Navigate back
      fireEvent.click(screen.getByText('← Back to Tasks'));

      // Verify we're back to task list
      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
        expect(screen.queryByText('← Back to Tasks')).not.toBeInTheDocument();
      });
    });

    it('supports searching and filtering tasks', async () => {
      render(<App />);

      // Load tasks
      await waitFor(() => {
        fireEvent.click(screen.getByText('Agent 1'));
      });

      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
        expect(screen.getByText('Integration Test Task 2')).toBeInTheDocument();
      });

      // Search for specific task
      const searchInput = screen.getByPlaceholderText(/Search tasks/);
      await userEvent.type(searchInput, 'Task 1');

      // Verify filtering
      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
        expect(screen.queryByText('Integration Test Task 2')).not.toBeInTheDocument();
      });

      // Clear search
      await userEvent.clear(searchInput);

      // Both tasks should be visible again
      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
        expect(screen.getByText('Integration Test Task 2')).toBeInTheDocument();
      });
    });

    it('handles profile switching correctly', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agent 1')).toBeInTheDocument();
      });

      // Load Agent 1 tasks
      fireEvent.click(screen.getByText('Agent 1'));
      
      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
      });

      // Switch to Agent 2
      fireEvent.click(screen.getByText('Agent 2'));

      // Should show no tasks message
      await waitFor(() => {
        expect(screen.getByText('No tasks to display')).toBeInTheDocument();
        expect(screen.queryByText('Integration Test Task 1')).not.toBeInTheDocument();
      });

      // Switch back to Agent 1
      fireEvent.click(screen.getByText('Agent 1'));

      // Tasks should be visible again
      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
      });
    });

    it('supports adding a new profile', async () => {
      const fs = await import('fs/promises');
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('+ Add Profile')).toBeInTheDocument();
      });

      // Open add profile modal
      fireEvent.click(screen.getByText('+ Add Profile'));

      expect(screen.getByText('Add New Profile')).toBeInTheDocument();

      // Fill in profile details
      const nameInput = screen.getByPlaceholderText('Profile Name');
      await userEvent.type(nameInput, 'New Test Agent');

      // Create and upload file
      const file = new File(['{"tasks":[{"id":"new1","name":"New Task"}]}'], 'tasks.json', {
        type: 'application/json'
      });
      const fileInput = screen.getByLabelText(/JSON file/);
      await userEvent.upload(fileInput, file);

      // Mock the server response for add profile
      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('.shrimp-task-viewer-settings.json')) {
          return Promise.resolve(JSON.stringify({
            agents: [...mockProfiles, { id: 'new-test-agent', name: 'New Test Agent', path: '/mock/tmp/new.json' }]
          }));
        } else if (filePath.includes('new.json')) {
          return Promise.resolve('{"tasks":[{"id":"new1","name":"New Task"}]}');
        }
        return Promise.reject(new Error('File not found'));
      });

      // Submit form
      fireEvent.click(screen.getByText('Add Profile'));

      // Verify new profile appears
      await waitFor(() => {
        expect(screen.getByText('New Test Agent')).toBeInTheDocument();
      });
    });

    it('supports removing a profile', async () => {
      const fs = await import('fs/promises');
      
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Agent 1')).toBeInTheDocument();
      });

      // Mock updated profiles after removal
      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('.shrimp-task-viewer-settings.json')) {
          return Promise.resolve(JSON.stringify({
            agents: [mockProfiles[1]] // Only Agent 2 remains
          }));
        }
        return Promise.reject(new Error('File not found'));
      });

      // Remove Agent 1
      const removeButtons = screen.getAllByLabelText(/Remove profile/);
      fireEvent.click(removeButtons[0]);

      // Verify removal
      await waitFor(() => {
        expect(screen.queryByText('Agent 1')).not.toBeInTheDocument();
        expect(screen.getByText('Agent 2')).toBeInTheDocument();
      });
    });
  });

  describe('Auto-refresh Integration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('automatically refreshes tasks at specified interval', async () => {
      const fs = await import('fs/promises');
      let taskCallCount = 0;
      
      // Mock changing task data
      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('agent1.json')) {
          taskCallCount++;
          if (taskCallCount === 1) {
            return Promise.resolve(JSON.stringify(mockTasks));
          } else {
            // Return updated tasks on refresh
            return Promise.resolve(JSON.stringify({
              tasks: [
                ...mockTasks.tasks,
                {
                  id: '3',
                  name: 'New Task After Refresh',
                  status: 'pending',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ]
            }));
          }
        } else if (filePath.includes('.shrimp-task-viewer-settings.json')) {
          return Promise.resolve(JSON.stringify({ agents: mockProfiles }));
        }
        return Promise.reject(new Error('File not found'));
      });

      render(<App />);

      // Select profile and enable auto-refresh
      await waitFor(() => {
        fireEvent.click(screen.getByText('Agent 1'));
      });

      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
      });

      const autoRefreshCheckbox = screen.getByLabelText(/Auto-refresh/);
      fireEvent.click(autoRefreshCheckbox);

      // Fast-forward time
      vi.advanceTimersByTime(30000);

      // Wait for new task to appear
      await waitFor(() => {
        expect(screen.getByText('New Task After Refresh')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('displays error when server is unavailable', async () => {
      // Close server to simulate error
      await new Promise((resolve) => server.close(resolve));
      server = null;

      // Mock fetch to simulate network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load profiles/)).toBeInTheDocument();
      });
    });

    it('handles corrupted task data gracefully', async () => {
      const fs = await import('fs/promises');
      
      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('agent1.json')) {
          return Promise.resolve('{ invalid json }');
        } else if (filePath.includes('.shrimp-task-viewer-settings.json')) {
          return Promise.resolve(JSON.stringify({ agents: mockProfiles }));
        }
        return Promise.reject(new Error('File not found'));
      });

      render(<App />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Agent 1'));
      });

      await waitFor(() => {
        expect(screen.getByText(/Error loading tasks/)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Large Data Sets', () => {
    it('handles large number of tasks efficiently', async () => {
      const fs = await import('fs/promises');
      
      // Generate 1000 tasks
      const largeTasks = {
        tasks: Array.from({ length: 1000 }, (_, i) => ({
          id: `task-${i}`,
          name: `Task ${i}`,
          description: `Description for task ${i}`,
          status: i % 2 === 0 ? 'pending' : 'completed',
          createdAt: new Date(2025, 0, 1 + (i % 30)).toISOString(),
          updatedAt: new Date(2025, 0, 1 + (i % 30)).toISOString()
        }))
      };

      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath.includes('agent1.json')) {
          return Promise.resolve(JSON.stringify(largeTasks));
        } else if (filePath.includes('.shrimp-task-viewer-settings.json')) {
          return Promise.resolve(JSON.stringify({ agents: mockProfiles }));
        }
        return Promise.reject(new Error('File not found'));
      });

      render(<App />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Agent 1'));
      });

      // Should show first page of tasks (10 by default)
      await waitFor(() => {
        expect(screen.getByText('Task 0')).toBeInTheDocument();
        expect(screen.getByText('Task 9')).toBeInTheDocument();
        expect(screen.queryByText('Task 10')).not.toBeInTheDocument();
      });

      // Verify pagination info
      expect(screen.getByText(/Showing 1 to 10 of 1000 tasks/)).toBeInTheDocument();
    });
  });
});

// Helper function to make real HTTP requests to test server
function makeRealRequest(url, options = {}) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk.toString());
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    if (options.body) {
      if (options.body instanceof FormData) {
        // Handle FormData - simplified for testing
        req.write('name=Test&taskFile=' + encodeURIComponent('{"tasks":[]}'));
      } else {
        req.write(options.body);
      }
    }

    req.end();
  });
}