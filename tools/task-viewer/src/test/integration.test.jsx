import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/i18n';

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch for profiles API
    global.fetch = vi.fn((url) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      
      // Mock agents endpoint (changed from profiles to agents to match App.jsx)
      if (urlString.includes('/api/agents')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [
            {
              id: 'profile-1',
              name: 'Test Profile 1',
              taskFolderPath: '/path/to/tasks1',
              projectRootPath: '/project1',
              isActive: true
            },
            {
              id: 'profile-2',
              name: 'Test Profile 2',
              taskFolderPath: '/path/to/tasks2',
              projectRootPath: '/project2',
              isActive: false
            }
          ]
        });
      }
      
      // Mock tasks endpoint
      if (urlString.includes('/api/tasks/')) {
        const pathPart = urlString.split('/api/tasks/')[1];
        const profileId = pathPart.split('?')[0]; // Remove query parameters
        if (profileId === 'profile-1') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              tasks: [
                {
                  id: 'task-1',
                  name: 'Integration Test Task 1',
                  description: 'Test task for integration testing',
                  status: 'pending',
                  createdAt: '2025-01-01T00:00:00Z',
                  updatedAt: '2025-01-01T00:00:00Z',
                  notes: 'Important notes for testing',
                  dependencies: ['dep-1'],
                  relatedFiles: [{ path: '/test.js', type: 'CREATE' }],
                  agent: 'test-agent'
                },
                {
                  id: 'task-2',
                  name: 'Integration Test Task 2',
                  description: 'Another test task',
                  status: 'completed',
                  createdAt: '2025-01-02T00:00:00Z',
                  updatedAt: '2025-01-02T00:00:00Z',
                  completedAt: '2025-01-02T12:00:00Z',
                  agent: null
                }
              ]
            })
          });
        } else if (profileId === 'profile-2') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ tasks: [] })
          });
        }
      }
      
      // Mock agents endpoint
      if (urlString.includes('/api/agents/combined/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [
            {
              name: 'test-agent.md',
              type: 'project',
              metadata: {
                name: 'test-agent',
                description: 'Test agent',
                color: '#3B82F6',
                tools: ['Task']
              }
            }
          ]
        });
      }
      
      // Mock global settings
      if (urlString.includes('/api/global-settings')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            openaiApiKey: '',
            maxTokens: 4000,
            temperature: 0.7
          })
        });
      }
      
      // Default 404 response
      return Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' })
      });
    });
  });

  afterEach(() => {
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
        expect(screen.getByText('Test Profile 1')).toBeInTheDocument();
        expect(screen.getByText('Test Profile 2')).toBeInTheDocument();
      });

      // Click on Test Profile 1
      // Click on the profile tab (not the dropdown option)
      fireEvent.click(screen.getByRole('tab', { name: /Test Profile 1/ }));

      // Wait for tasks to load
      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
        expect(screen.getByText('Integration Test Task 2')).toBeInTheDocument();
      });

      // Verify task details are displayed
      expect(screen.getByText(/Test task for integration testing/)).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });

    it('allows viewing task details and navigating back', async () => {
      renderApp();

      // Load profile and tasks
      await waitFor(() => {
        expect(screen.getByText('Test Profile 1')).toBeInTheDocument();
      });
      
      // Click on the profile tab (not the dropdown option)
      fireEvent.click(screen.getByRole('tab', { name: /Test Profile 1/ }));
      
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
      renderApp();

      // Load tasks
      await waitFor(() => {
        expect(screen.getByText('Test Profile 1')).toBeInTheDocument();
      });
      
      // Click on the profile tab (not the dropdown option)
      fireEvent.click(screen.getByRole('tab', { name: /Test Profile 1/ }));

      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
        expect(screen.getByText('Integration Test Task 2')).toBeInTheDocument();
      });

      // Search for specific task
      const searchInput = screen.getByPlaceholderText(/Search tasks/i);
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
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile 1')).toBeInTheDocument();
      });

      // Load Profile 1 tasks
      // Click on the profile tab (not the dropdown option)
      fireEvent.click(screen.getByRole('tab', { name: /Test Profile 1/ }));
      
      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
      });

      // Switch to Profile 2
      fireEvent.click(screen.getByText('Test Profile 2'));

      // Should show no tasks message
      await waitFor(() => {
        expect(screen.getByText(/No tasks to display|No tasks found/i)).toBeInTheDocument();
        expect(screen.queryByText('Integration Test Task 1')).not.toBeInTheDocument();
      });

      // Switch back to Profile 1
      // Click on the profile tab (not the dropdown option)
      fireEvent.click(screen.getByRole('tab', { name: /Test Profile 1/ }));

      // Tasks should be visible again
      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
      });
    });

    it('displays agent assignments correctly', async () => {
      renderApp();

      await waitFor(() => {
        expect(screen.getByText('Test Profile 1')).toBeInTheDocument();
      });

      // Click on the profile tab (not the dropdown option)
      fireEvent.click(screen.getByRole('tab', { name: /Test Profile 1/ }));

      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
      });

      // Check that agent is displayed in the table
      const agentSelects = screen.getAllByRole('combobox');
      expect(agentSelects.length).toBeGreaterThan(0);
      
      // First task should have test-agent selected
      expect(agentSelects[0].value).toBe('test-agent');
      
      // Second task should have no agent
      expect(agentSelects[1].value).toBe('');
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
      let taskCallCount = 0;
      
      // Mock changing task data
      global.fetch = vi.fn((url) => {
        const urlString = typeof url === 'string' ? url : url.toString();
        
        if (urlString.includes('/api/profiles')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [{
              id: 'profile-1',
              name: 'Test Profile 1',
              taskFolderPath: '/path/to/tasks1',
              projectRootPath: '/project1',
              isActive: true
            }]
          });
        }
        
        if (urlString.includes('/api/tasks/profile-1')) {
          taskCallCount++;
          const baseTasks = [
            {
              id: 'task-1',
              name: 'Integration Test Task 1',
              description: 'Test task',
              status: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          
          if (taskCallCount > 1) {
            baseTasks.push({
              id: 'task-3',
              name: 'New Task After Refresh',
              status: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
          
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ tasks: baseTasks })
          });
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({})
        });
      });

      renderApp();

      // Select profile and enable auto-refresh
      await waitFor(() => {
        // Click on the profile tab (not the dropdown option)
      fireEvent.click(screen.getByRole('tab', { name: /Test Profile 1/ }));
      });

      await waitFor(() => {
        expect(screen.getByText('Integration Test Task 1')).toBeInTheDocument();
      });

      const autoRefreshCheckbox = screen.getByLabelText(/Auto-refresh/i);
      fireEvent.click(autoRefreshCheckbox);

      // Fast-forward time
      vi.advanceTimersByTime(30000);

      // Wait for new task to appear
      await waitFor(() => {
        expect(screen.getByText('New Task After Refresh')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('Error Handling Integration', () => {
    it('displays error when server is unavailable', async () => {
      // Mock fetch to simulate network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      renderApp();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load profiles|Error loading profiles/i)).toBeInTheDocument();
      });
    });

    it('handles corrupted task data gracefully', async () => {
      global.fetch = vi.fn((url) => {
        const urlString = typeof url === 'string' ? url : url.toString();
        
        if (urlString.includes('/api/profiles')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [{
              id: 'profile-1',
              name: 'Test Profile 1',
              taskFolderPath: '/path/to/tasks1',
              projectRootPath: '/project1'
            }]
          });
        }
        
        if (urlString.includes('/api/tasks/')) {
          // Return invalid JSON structure
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => { throw new Error('Invalid JSON'); }
          });
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({})
        });
      });

      renderApp();

      await waitFor(() => {
        // Click on the profile tab (not the dropdown option)
      fireEvent.click(screen.getByRole('tab', { name: /Test Profile 1/ }));
      });

      await waitFor(() => {
        expect(screen.getByText(/Error loading tasks|Failed to load tasks/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Large Data Sets', () => {
    it('handles large number of tasks efficiently', async () => {
      // Generate 1000 tasks
      const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        name: `Task ${i}`,
        description: `Description for task ${i}`,
        status: i % 2 === 0 ? 'pending' : 'completed',
        createdAt: new Date(2025, 0, 1 + (i % 30)).toISOString(),
        updatedAt: new Date(2025, 0, 1 + (i % 30)).toISOString()
      }));

      global.fetch = vi.fn((url) => {
        const urlString = typeof url === 'string' ? url : url.toString();
        
        if (urlString.includes('/api/profiles')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [{
              id: 'profile-1',
              name: 'Test Profile 1',
              taskFolderPath: '/path/to/tasks1',
              projectRootPath: '/project1'
            }]
          });
        }
        
        if (urlString.includes('/api/tasks/')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ tasks: largeTasks })
          });
        }
        
        if (urlString.includes('/api/agents/')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => []
          });
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({})
        });
      });

      renderApp();

      await waitFor(() => {
        // Click on the profile tab (not the dropdown option)
      fireEvent.click(screen.getByRole('tab', { name: /Test Profile 1/ }));
      });

      // Should show first page of tasks with pagination
      await waitFor(() => {
        expect(screen.getByText('Task 0')).toBeInTheDocument();
        // Check for pagination - default page size is 20
        expect(screen.getByText(/Showing 1 to 20 of 1000 tasks/i)).toBeInTheDocument();
      });
    });
  });
});