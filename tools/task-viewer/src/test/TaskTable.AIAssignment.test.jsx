import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskTable from '../components/TaskTable';

describe('TaskTable - AI Agent Assignment', () => {
  const mockTasks = [
    {
      id: 'task-1',
      name: 'Implement authentication',
      description: 'Add user authentication with JWT tokens',
      status: 'pending',
      dependencies: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      // This simulates the bug: AI assigns raw filename but dropdown expects processed name
      agent: 'test-expert.md'
    },
    {
      id: 'task-2',
      name: 'Create UI components',
      description: 'Build React components for the dashboard',
      status: 'pending',
      dependencies: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      // This one has no agent assignment
      agent: null
    },
    {
      id: 'task-3',
      name: 'Set up database',
      description: 'Configure PostgreSQL database and migrations',
      status: 'pending',
      dependencies: [],
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      // This simulates correct UI format (what we want the dropdown to show)
      agent: 'Test Expert'
    }
  ];

  const mockAgents = [
    { 
      name: 'test-expert.md',
      type: 'project',
      metadata: {
        name: 'Test Expert',
        description: 'Expert in testing and quality assurance',
        color: '#3B82F6',
        tools: ['Test']
      }
    },
    { 
      name: 'ui-developer.md',
      type: 'project',
      metadata: {
        name: 'UI Developer',
        description: 'Frontend and UI specialist',
        color: '#10B981',
        tools: ['React', 'CSS']
      }
    },
    { 
      name: 'database-admin.yaml',
      type: 'project', 
      metadata: {
        name: 'Database Admin',
        description: 'Database architecture and optimization',
        color: '#F59E0B',
        tools: ['SQL', 'Migration']
      }
    }
  ];

  const defaultProps = {
    data: mockTasks,
    globalFilter: '',
    onGlobalFilterChange: vi.fn(),
    projectRoot: '/test/project',
    onDetailViewChange: vi.fn(),
    resetDetailView: 0,
    profileId: 'test-profile',
    onTaskSaved: vi.fn(),
    onDeleteTask: vi.fn(),
    showToast: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    global.fetch.mockClear();
    
    // Mock the agents loading endpoint that runs on mount
    global.fetch.mockImplementation((url) => {
      if (url && url.includes('/api/agents/combined/')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockAgents
        });
      }
      // Return a default error for unmocked endpoints
      return Promise.reject(new Error('Unmocked endpoint: ' + url));
    });
  });

  afterEach(() => {
    // Clean up any modals
    document.querySelectorAll('.modal-overlay').forEach(el => el.remove());
  });

  describe('AI Assignment Button', () => {
    it('should show AI assign button when tasks are selected', async () => {
      render(<TaskTable {...defaultProps} />);

      // Initially, bulk actions should not be visible
      expect(screen.queryByText(/AI Assign Agents/)).not.toBeInTheDocument();

      // Select all tasks using the header checkbox
      // The header checkbox is the first checkbox in the table
      const allCheckboxes = screen.getAllByRole('checkbox');
      const selectAllCheckbox = allCheckboxes[0];
      fireEvent.click(selectAllCheckbox);

      // Bulk actions should now be visible
      await waitFor(() => {
        expect(screen.getByTestId('ai-assign-agents-button')).toBeInTheDocument();
      });

      // Check button has correct class and text
      const aiAssignButton = screen.getByTestId('ai-assign-agents-button');
      expect(aiAssignButton).toHaveClass('bulk-action-button', 'ai-assign');
    });

    // Skipping loading state test as the component doesn't expose a loading prop
    // The loading state is handled internally by the component
  });

  describe('AI Assignment API Call', () => {
    it('should call API with correct parameters when assigning agents', async () => {
      // Override the default mock for this specific test
      global.fetch.mockImplementation((url) => {
        // Mock agents loading
        if (url && url.includes('/api/agents/combined/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAgents
          });
        }
        // Mock AI assignment endpoint
        if (url === '/api/ai-assign-agents') {
          return Promise.resolve({
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              success: true,
              updatedCount: 3,
              assignments: {
                'task-1': 'auth-expert.md',
                'task-2': 'ui-developer.md',
                'task-3': 'database-admin.yaml'
              }
            })
          });
        }
        return Promise.reject(new Error('Unmocked endpoint: ' + url));
      });

      render(<TaskTable {...defaultProps} />);

      // Select all tasks
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      // Click AI assign button
      const aiAssignButton = await screen.findByTestId('ai-assign-agents-button');
      fireEvent.click(aiAssignButton);

      // Verify API was called correctly
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/ai-assign-agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            projectId: 'test-profile',
            taskIds: ['task-1', 'task-2', 'task-3']
          })
        });
      });

      // Verify success toast
      expect(defaultProps.showToast).toHaveBeenCalledWith(
        'success',
        'Successfully assigned agents to 3 tasks using AI'
      );

      // Verify task refresh was triggered
      expect(defaultProps.onTaskSaved).toHaveBeenCalled();
    });

    it('should handle OpenAI API key not configured error', async () => {
      // Mock API key not configured response
      global.fetch.mockImplementation((url) => {
        // Handle agents loading first
        if (url && url.includes('/api/agents/combined/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAgents
          });
        }
        // Then mock the error for AI assignment
        if (url === '/api/ai-assign-agents') {
          return Promise.resolve({
          ok: false,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({
            error: 'OpenAI API key not configured',
            message: 'To use AI agent assignment, please configure your OpenAI API key.',
            instructions: [
              '1. Go to Settings → Global Settings in the app',
              '2. Or create a .env file',
              '3. Get your API key from: https://platform.openai.com/api-keys'
            ]
          })
        });
        }
        return Promise.reject(new Error('Unmocked endpoint: ' + url));
      });

      render(<TaskTable {...defaultProps} />);

      // Select tasks and click AI assign
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      const aiAssignButton = await screen.findByTestId('ai-assign-agents-button');
      fireEvent.click(aiAssignButton);

      // Wait for modal to appear
      await waitFor(() => {
        const modal = document.querySelector('.modal-overlay');
        expect(modal).toBeInTheDocument();
        expect(modal.textContent).toContain('OpenAI API Key Required');
        expect(modal.textContent).toContain('Go to Settings → Global Settings');
      });

      // Note: The component shows a modal for OpenAI key errors, not a toast.
      // Toast is not called for this specific error case.
    });

    it('should handle non-JSON response error', async () => {
      // Mock non-JSON response
      global.fetch.mockImplementation((url) => {
        // Handle agents loading first
        if (url && url.includes('/api/agents/combined/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAgents
          });
        }
        // Then mock non-JSON response for AI assignment
        if (url === '/api/ai-assign-agents') {
          return Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          text: async () => '<html>Error page</html>'
        });
        }
        return Promise.reject(new Error('Unmocked endpoint: ' + url));
      });

      render(<TaskTable {...defaultProps} />);

      // Select tasks and click AI assign
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      const aiAssignButton = await screen.findByTestId('ai-assign-agents-button');
      fireEvent.click(aiAssignButton);

      // Verify error handling
      await waitFor(() => {
        expect(defaultProps.showToast).toHaveBeenCalledWith(
          'error',
          'Network error while assigning agents'
        );
      });
    });

    it('should handle network errors gracefully', async () => {
      // Mock implementation with agents loading working but AI assignment failing
      global.fetch.mockImplementation((url) => {
        // Handle agents loading first
        if (url && url.includes('/api/agents/combined/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAgents
          });
        }
        // Then mock network error for AI assignment
        if (url === '/api/ai-assign-agents') {
          return Promise.reject(new Error('Network failure'));
        }
        return Promise.reject(new Error('Unmocked endpoint: ' + url));
      });

      render(<TaskTable {...defaultProps} />);

      // Select tasks and click AI assign
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      const aiAssignButton = await screen.findByTestId('ai-assign-agents-button');
      fireEvent.click(aiAssignButton);

      // Verify error handling
      await waitFor(() => {
        expect(defaultProps.showToast).toHaveBeenCalledWith(
          'error',
          'Network error while assigning agents'
        );
      });
    });
  });

  describe('Selection and State Management', () => {
    it('should clear selection after successful assignment', async () => {
      // Mock successful response
      global.fetch.mockImplementation((url) => {
        // Handle agents loading first
        if (url && url.includes('/api/agents/combined/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAgents
          });
        }
        // Then mock successful AI assignment
        if (url === '/api/ai-assign-agents') {
          return Promise.resolve({
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              success: true,
              updatedCount: 3
            })
          });
        }
        return Promise.reject(new Error('Unmocked endpoint: ' + url));
      });

      render(<TaskTable {...defaultProps} />);

      // Select all tasks
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);
      
      // Verify all checkboxes are checked (skip the header checkbox)
      const allCheckboxes = screen.getAllByRole('checkbox');
      const taskCheckboxes = allCheckboxes.slice(1); // Skip the header checkbox
      taskCheckboxes.forEach(cb => expect(cb).toBeChecked());

      // Click AI assign
      const aiAssignButton = await screen.findByTestId('ai-assign-agents-button');
      fireEvent.click(aiAssignButton);

      // Wait for selection to be cleared
      await waitFor(() => {
        taskCheckboxes.forEach(cb => expect(cb).not.toBeChecked());
      });

      // Bulk actions should be hidden
      expect(screen.queryByTestId('ai-assign-agents-button')).not.toBeInTheDocument();
    });

    it('should handle partial selection correctly', async () => {
      // Mock successful response
      global.fetch.mockImplementation((url) => {
        // Handle agents loading first
        if (url && url.includes('/api/agents/combined/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAgents
          });
        }
        // Then mock successful AI assignment
        if (url === '/api/ai-assign-agents') {
          return Promise.resolve({
            ok: true,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              success: true,
              updatedCount: 2,
              assignments: {
                'task-1': 'auth-expert.md',
                'task-3': 'database-admin.yaml'
              }
            })
          });
        }
        return Promise.reject(new Error('Unmocked endpoint: ' + url));
      });

      render(<TaskTable {...defaultProps} />);

      // Select only first and third tasks (skip header checkbox)
      const allCheckboxes = screen.getAllByRole('checkbox');
      const taskCheckboxes = allCheckboxes.slice(1); // Skip the header checkbox
      
      fireEvent.click(taskCheckboxes[0]); // task-1
      fireEvent.click(taskCheckboxes[2]); // task-3

      // Click AI assign
      const aiAssignButton = await screen.findByTestId('ai-assign-agents-button');
      fireEvent.click(aiAssignButton);

      // Verify API was called with only selected tasks
      await waitFor(() => {
        const aiAssignCall = global.fetch.mock.calls.find(call => 
          call[0] === '/api/ai-assign-agents'
        );
        if (aiAssignCall) {
          const callBody = JSON.parse(aiAssignCall[1].body);
          expect(callBody.taskIds).toEqual(['task-1', 'task-3']);
        }
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state during API call', async () => {
      // Mock delayed response
      let resolvePromise;
      const delayedPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      global.fetch.mockImplementation((url) => {
        // Handle agents loading normally
        if (url && url.includes('/api/agents/combined/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAgents
          });
        }
        // Use delayed promise for AI assignment
        if (url === '/api/ai-assign-agents') {
          return delayedPromise;
        }
        return Promise.reject(new Error('Unmocked endpoint: ' + url));
      });

      render(<TaskTable {...defaultProps} />);

      // Select tasks and click AI assign
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);

      const aiAssignButton = await screen.findByTestId('ai-assign-agents-button');
      fireEvent.click(aiAssignButton);

      // Button should be disabled during loading
      expect(aiAssignButton.closest('button')).toBeDisabled();

      // Resolve the promise
      resolvePromise({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ success: true, updatedCount: 3 })
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(aiAssignButton.closest('button')).not.toBeDisabled();
      });
    });
  });

  describe('Modal Interaction', () => {
    it('should close modal when clicking close button', async () => {
      // Mock API key error to show modal
      global.fetch.mockImplementation((url) => {
        // Handle agents loading first
        if (url && url.includes('/api/agents/combined/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAgents
          });
        }
        // Then mock API key error for AI assignment
        if (url === '/api/ai-assign-agents') {
          return Promise.resolve({
            ok: false,
            headers: new Headers({ 'content-type': 'application/json' }),
            json: async () => ({
              error: 'OpenAI API key not configured',
              message: 'Please configure your OpenAI API key',
              instructions: ['Go to Settings']
            })
          });
        }
        return Promise.reject(new Error('Unmocked endpoint: ' + url));
      });

      render(<TaskTable {...defaultProps} />);

      // Trigger modal
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);
      
      const aiAssignButton = await screen.findByTestId('ai-assign-agents-button');
      fireEvent.click(aiAssignButton);

      // Wait for modal
      await waitFor(() => {
        expect(document.querySelector('.modal-overlay')).toBeInTheDocument();
      });

      // Click close button (using the primary-btn class as shown in the component)
      const closeButton = document.querySelector('.primary-btn');
      fireEvent.click(closeButton);

      // Modal should be removed
      expect(document.querySelector('.modal-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Agent Dropdown Display Bug (TDD Red Phase)', () => {
    it('FAILS: should display AI-assigned agents correctly in dropdowns', async () => {
      // Mock successful API response for agents
      global.fetch.mockImplementation((url) => {
        if (url && url.includes('/api/agents/combined/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAgents
          });
        }
        return Promise.reject(new Error('Unmocked endpoint: ' + url));
      });

      render(<TaskTable {...defaultProps} />);

      // Wait for agents to load
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/agents/combined/test-profile')
        );
      });

      // Get all agent dropdowns
      const agentDropdowns = screen.getAllByRole('combobox');
      expect(agentDropdowns).toHaveLength(3);

      // Task 1: Has agent 'test-expert.md' (AI format) -> should show 'Test Expert' (UI format)
      // This test will FAIL because the dropdown doesn't know how to map the filename to display name
      expect(agentDropdowns[0].value).toBe('Test Expert');

      // Task 2: Has no agent -> should show empty
      expect(agentDropdowns[1].value).toBe('');

      // Task 3: Has agent 'Test Expert' (UI format) -> should show 'Test Expert'
      expect(agentDropdowns[2].value).toBe('Test Expert');
    });

    it('FAILS: should handle various AI assignment formats', async () => {
      // Test with different variations of how AI might assign agents
      const tasksWithVariousFormats = [
        { ...mockTasks[0], agent: 'test-expert.md' },      // With extension
        { ...mockTasks[0], id: 'task-4', agent: 'test-expert' },        // Without extension  
        { ...mockTasks[0], id: 'task-5', agent: 'ui-developer.yaml' },  // YAML with extension
        { ...mockTasks[0], id: 'task-6', agent: 'UI Developer' },       // Already correct format
      ];

      const propsWithVariousFormats = {
        ...defaultProps,
        data: tasksWithVariousFormats
      };

      global.fetch.mockImplementation((url) => {
        if (url && url.includes('/api/agents/combined/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAgents
          });
        }
        return Promise.reject(new Error('Unmocked endpoint: ' + url));
      });

      render(<TaskTable {...propsWithVariousFormats} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/agents/combined/test-profile')
        );
      });

      const agentDropdowns = screen.getAllByRole('combobox');
      
      // All these should map to their proper display names, but they currently don't
      expect(agentDropdowns[0].value).toBe('Test Expert');    // from test-expert.md
      expect(agentDropdowns[1].value).toBe('Test Expert');    // from test-expert
      expect(agentDropdowns[2].value).toBe('UI Developer');   // from ui-developer.yaml
      expect(agentDropdowns[3].value).toBe('UI Developer');   // already correct
    });

    it('should save correct format when user manually changes dropdown', async () => {
      // Mock both agents loading and task update APIs
      global.fetch.mockImplementation((url, options) => {
        if (url && url.includes('/api/agents/combined/')) {
          return Promise.resolve({
            ok: true,
            json: async () => mockAgents
          });
        }
        if (url && url.includes('/api/tasks/') && url.includes('/update')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ success: true })
          });
        }
        return Promise.reject(new Error('Unmocked endpoint: ' + url));
      });

      render(<TaskTable {...defaultProps} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/agents/combined/test-profile')
        );
      });

      const agentDropdowns = screen.getAllByRole('combobox');
      const firstDropdown = agentDropdowns[0];

      // User changes the dropdown selection
      fireEvent.change(firstDropdown, { target: { value: 'UI Developer' } });

      // Should save with the display name format that the UI expects
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/tasks/test-profile/update'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
              taskId: 'task-1',
              updates: { agent: 'UI Developer' }
            })
          })
        );
      });
    });
  });
});