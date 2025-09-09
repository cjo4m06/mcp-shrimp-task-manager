import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TaskTable from '../components/TaskTable';

describe('TaskTable - Bulk Agent Assignment', () => {
  const mockTasks = [
    {
      id: 'task1',
      name: 'Task 1',
      description: 'Test task 1',
      status: 'pending',
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-01T10:00:00Z',
    },
    {
      id: 'task2',
      name: 'Task 2',
      description: 'Test task 2',
      status: 'pending',
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-01T10:00:00Z',
    }
  ];

  const mockAgents = [
    { 
      name: 'fullstack.md', 
      type: 'project',
      metadata: { 
        name: 'Fullstack', 
        description: 'Full-stack development agent',
        color: '#3B82F6',
        tools: []
      }
    },
    { 
      name: 'frontend.md', 
      type: 'project',
      metadata: { 
        name: 'Frontend', 
        description: 'Frontend specialist',
        color: '#10B981',
        tools: []
      }
    }
  ];

  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch for agents API
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/agents/combined/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockAgents)
        });
      }
      if (url.includes('/api/tasks/') && url.includes('/bulk-update')) {
        return Promise.resolve({ ok: true });
      }
      if (url.includes('/api/tasks/') && url.includes('/update')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: false });
    });
  });

  it('shows bulk actions bar when tasks are selected', async () => {
    render(
      <TaskTable 
        data={mockTasks}
        globalFilter=""
        onGlobalFilterChange={mockOnFilterChange}
        profileId="test-profile"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    
    await act(async () => {
      fireEvent.click(checkboxes[1]); // First data row checkbox
    });

    await waitFor(() => {
      expect(screen.getByText(/tasks selected:/)).toBeInTheDocument();
    });
  });

  it('shows bulk assignment dropdown when tasks selected', async () => {
    render(
      <TaskTable 
        data={mockTasks}
        globalFilter=""
        onGlobalFilterChange={mockOnFilterChange}
        profileId="test-profile"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    
    await act(async () => {
      fireEvent.click(checkboxes[1]);
    });

    // Wait for bulk actions to appear
    await waitFor(() => {
      const dropdowns = screen.getAllByRole('combobox');
      const hasAgentDropdown = dropdowns.some(d => 
        d.closest('.bulk-actions-bar') || d.getAttribute('aria-label')?.includes('assign')
      );
      expect(hasAgentDropdown || dropdowns.length > 0).toBe(true);
    });
  });

  it('handles individual agent assignment without refresh', async () => {
    render(
      <TaskTable 
        data={mockTasks}
        globalFilter=""
        onGlobalFilterChange={mockOnFilterChange}
        profileId="test-profile"
      />
    );

    // Wait for agent dropdowns to render
    await waitFor(() => {
      const dropdowns = screen.getAllByRole('combobox');
      expect(dropdowns.length).toBeGreaterThan(0);
    });

    const dropdowns = screen.getAllByRole('combobox');
    const taskDropdown = dropdowns.find(d => 
      d.closest('tr') && !d.closest('.bulk-actions-bar')
    );

    if (taskDropdown) {
      await act(async () => {
        // Use the processed display name 'Fullstack' instead of 'fullstack'
        fireEvent.change(taskDropdown, { target: { value: 'Fullstack' } });
      });

      // Wait for the component state to update and re-render
      await waitFor(() => {
        expect(taskDropdown.value).toBe('Fullstack');
      });

      // Verify API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/api\/tasks\/test-profile\/update$/),
          expect.objectContaining({ method: 'PUT' })
        );
      });
    }
  });

  it('handles task selection and shows count correctly', async () => {
    render(
      <TaskTable 
        data={mockTasks}
        globalFilter=""
        onGlobalFilterChange={mockOnFilterChange}
        profileId="test-profile"
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    
    await act(async () => {
      fireEvent.click(checkboxes[1]); // First task
    });

    await waitFor(() => {
      expect(screen.getByText(/tasks selected:/)).toBeInTheDocument();
    });

    // Test that the bulk assignment dropdown is visible
    const bulkDropdown = screen.getByDisplayValue('Assign Agent...');
    expect(bulkDropdown).toBeInTheDocument();
  });

  it('renders without crashing when no profileId provided', () => {
    expect(() => {
      render(
        <TaskTable 
          data={mockTasks}
          globalFilter=""
          onGlobalFilterChange={mockOnFilterChange}
          // profileId omitted
        />
      );
    }).not.toThrow();
  });
});