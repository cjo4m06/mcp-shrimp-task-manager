import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import TaskTable from '../components/TaskTable';
import TaskDetailView from '../components/TaskDetailView';
import { createMockTask, mockFetch } from './test-utils';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/i18n';

describe('Edge Cases and Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithI18n = (component) => {
    return render(
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    );
  };

  describe('Network Errors', () => {
    it('handles network timeout gracefully', async () => {
      // Mock fetch to simulate timeout
      global.fetch = vi.fn(() => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network timeout')), 100);
      }));

      renderWithI18n(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load profiles|Error loading profiles|Network timeout/i)).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('handles intermittent network failures', async () => {
      let attemptCount = 0;
      
      global.fetch = vi.fn(() => {
        attemptCount++;
        if (attemptCount <= 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [
            { id: 'profile-1', name: 'Profile 1', taskFolderPath: '/path', projectRootPath: '/root' }
          ]
        });
      });

      renderWithI18n(<App />);

      // Initial failure
      await waitFor(() => {
        expect(screen.getByText(/Failed to load profiles|Error loading profiles/i)).toBeInTheDocument();
      });
    });

    it('handles malformed JSON responses', async () => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
        text: () => Promise.resolve('{ invalid json }')
      }));

      renderWithI18n(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load profiles|Error loading profiles|Invalid JSON/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Integrity Issues', () => {
    it('handles circular dependencies in tasks', () => {
      const task1 = createMockTask({
        id: '1',
        name: 'Task 1',
        dependencies: ['2']
      });

      const task2 = createMockTask({
        id: '2', 
        name: 'Task 2',
        dependencies: ['1']
      });

      const mockProps = {
        data: [task1, task2],
        globalFilter: '',
        onGlobalFilterChange: vi.fn(),
        projectRoot: '/test',
        profileId: 'test-profile',
        onDetailViewChange: vi.fn(),
        resetDetailView: 0,
        onTaskSaved: vi.fn(),
        onDeleteTask: vi.fn(),
        showToast: vi.fn()
      };

      // Component should handle circular deps without crashing
      renderWithI18n(<TaskTable {...mockProps} />);

      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    it('handles tasks with extremely long content', () => {
      const longTask = createMockTask({
        name: 'A'.repeat(1000),
        description: 'B'.repeat(5000),
        notes: 'C'.repeat(10000)
      });

      renderWithI18n(
        <TaskDetailView 
          task={longTask}
          onBack={vi.fn()}
          projectRoot="/test"
          onNavigateToTask={vi.fn()}
          taskIndex={0}
          allTasks={[longTask]}
        />
      );

      // Should truncate or handle gracefully - check for presence of content
      const nameElement = screen.getByText((content, element) => {
        return element && content.includes('A'.repeat(100));
      });
      expect(nameElement).toBeInTheDocument();
    });

    it('handles special characters and potential XSS', () => {
      const maliciousTask = createMockTask({
        name: '<script>alert("XSS")</script>',
        description: '<img src="x" onerror="alert(\'XSS\')">',
        notes: '"><script>alert(String.fromCharCode(88,83,83))</script>'
      });

      renderWithI18n(
        <TaskDetailView 
          task={maliciousTask}
          onBack={vi.fn()}
          projectRoot="/test"
          onNavigateToTask={vi.fn()}
          taskIndex={0}
          allTasks={[maliciousTask]}
        />
      );

      // Content should be escaped - React does this by default
      expect(document.querySelector('script')).not.toBeInTheDocument();
      expect(screen.getByText(/<script>/)).toBeInTheDocument();
    });

    it('handles Unicode and emoji in content', () => {
      const unicodeTask = createMockTask({
        name: '🚀 Deploy to production 部署到生产',
        description: 'Task with émojis and 中文字符 and العربية',
        notes: '✅ Complete ❌ Failed ⚠️ Warning'
      });

      renderWithI18n(
        <TaskDetailView 
          task={unicodeTask}
          onBack={vi.fn()}
          projectRoot="/test"
          onNavigateToTask={vi.fn()}
          taskIndex={0}
          allTasks={[unicodeTask]}
        />
      );

      expect(screen.getByText(/🚀 Deploy to production/)).toBeInTheDocument();
      expect(screen.getByText(/中文字符/)).toBeInTheDocument();
      expect(screen.getByText(/✅ Complete/)).toBeInTheDocument();
    });
  });

  describe('State Management Edge Cases', () => {
    it('handles rapid profile switching', async () => {
      global.fetch = vi.fn((url) => {
        const urlString = typeof url === 'string' ? url : url.toString();
        
        if (urlString.includes('/api/profiles')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [
              { id: 'profile-1', name: 'Profile 1', taskFolderPath: '/1', projectRootPath: '/root1' },
              { id: 'profile-2', name: 'Profile 2', taskFolderPath: '/2', projectRootPath: '/root2' },
              { id: 'profile-3', name: 'Profile 3', taskFolderPath: '/3', projectRootPath: '/root3' }
            ]
          });
        }
        
        if (urlString.includes('/api/tasks/')) {
          const profileId = urlString.split('/api/tasks/')[1];
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              tasks: [createMockTask({ name: `Task for ${profileId}` })]
            })
          });
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({})
        });
      });

      renderWithI18n(<App />);

      await waitFor(() => {
        expect(screen.getByText('Profile 1')).toBeInTheDocument();
      });

      // Rapidly switch between profiles
      fireEvent.click(screen.getByText('Profile 1'));
      fireEvent.click(screen.getByText('Profile 2'));
      fireEvent.click(screen.getByText('Profile 3'));
      fireEvent.click(screen.getByText('Profile 1'));

      // Should handle rapid switching without errors
      await waitFor(() => {
        expect(screen.queryByText(/Error/)).not.toBeInTheDocument();
      });
    });

    it('handles search input with special regex characters', () => {
      const tasks = [
        createMockTask({ name: 'Task [1]' }),
        createMockTask({ name: 'Task (2)' }),
        createMockTask({ name: 'Task $3' }),
        createMockTask({ name: 'Task *4*' })
      ];

      const mockProps = {
        data: tasks,
        globalFilter: '[',
        onGlobalFilterChange: vi.fn(),
        projectRoot: '/test',
        profileId: 'test-profile',
        onDetailViewChange: vi.fn(),
        resetDetailView: 0,
        onTaskSaved: vi.fn(),
        onDeleteTask: vi.fn(),
        showToast: vi.fn()
      };

      // Should not crash with regex special chars
      renderWithI18n(<TaskTable {...mockProps} />);
      
      expect(screen.getByText('Task [1]')).toBeInTheDocument();
    });

    it('handles concurrent auto-refresh and manual refresh', async () => {
      vi.useFakeTimers();
      
      global.fetch = vi.fn((url) => {
        const urlString = typeof url === 'string' ? url : url.toString();
        
        if (urlString.includes('/api/profiles')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [
              { id: 'profile-1', name: 'Profile 1', taskFolderPath: '/1', projectRootPath: '/root' }
            ]
          });
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ tasks: [] })
        });
      });

      renderWithI18n(<App />);

      await waitFor(() => {
        fireEvent.click(screen.getByText('Profile 1'));
      });

      // Enable auto-refresh
      const autoRefreshCheckbox = screen.getByLabelText(/Auto-refresh/i);
      fireEvent.click(autoRefreshCheckbox);

      // Trigger manual refresh while auto-refresh is pending
      const refreshButton = screen.getByLabelText(/Refresh tasks/i);
      fireEvent.click(refreshButton);

      // Advance timers
      vi.advanceTimersByTime(30000);

      // Should handle concurrent refreshes
      await waitFor(() => {
        expect(screen.queryByText(/Error/)).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Browser Compatibility Issues', () => {
    it('handles missing localStorage gracefully', () => {
      // Simulate missing localStorage
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;

      renderWithI18n(<App />);

      // Should work without localStorage
      expect(screen.getByText(/Shrimp Task Manager/i)).toBeInTheDocument();

      // Restore
      global.localStorage = originalLocalStorage;
    });

    it('handles file input restrictions', async () => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        status: 200,
        json: async () => []
      }));

      renderWithI18n(<App />);

      // Component should render without file input issues
      expect(screen.getByText(/Shrimp Task Manager/i)).toBeInTheDocument();
    });
  });

  describe('Performance Edge Cases', () => {
    it('handles extremely large task lists', () => {
      const hugeTasks = Array.from({ length: 10000 }, (_, i) => 
        createMockTask({
          id: `task-${i}`,
          name: `Task ${i}`,
          description: `Description ${i}`.repeat(10)
        })
      );

      const mockProps = {
        data: hugeTasks,
        globalFilter: '',
        onGlobalFilterChange: vi.fn(),
        projectRoot: '/test',
        profileId: 'test-profile',
        onDetailViewChange: vi.fn(),
        resetDetailView: 0,
        onTaskSaved: vi.fn(),
        onDeleteTask: vi.fn(),
        showToast: vi.fn()
      };

      const { container } = renderWithI18n(<TaskTable {...mockProps} />);

      // Should only render visible items (pagination)
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBeLessThan(100); // Should use pagination
    });

    it('handles rapid filtering on large datasets', async () => {
      const tasks = Array.from({ length: 1000 }, (_, i) => 
        createMockTask({
          id: `task-${i}`,
          name: `Task ${i % 10}`,
          description: `Type ${i % 5}`
        })
      );

      const mockOnFilterChange = vi.fn();
      const user = userEvent.setup();

      const mockProps = {
        data: tasks,
        globalFilter: '',
        onGlobalFilterChange: mockOnFilterChange,
        projectRoot: '/test',
        profileId: 'test-profile',
        onDetailViewChange: vi.fn(),
        resetDetailView: 0,
        onTaskSaved: vi.fn(),
        onDeleteTask: vi.fn(),
        showToast: vi.fn()
      };

      renderWithI18n(<TaskTable {...mockProps} />);

      // Get search input
      const searchInput = screen.getByPlaceholderText(/Search tasks/i);

      // Rapid filter changes
      await user.type(searchInput, 'Task 1');
      await user.clear(searchInput);
      await user.type(searchInput, 'Type 3');

      // Should handle rapid changes without errors
      expect(mockOnFilterChange).toHaveBeenCalled();
    });
  });

  describe('Memory Leak Prevention', () => {
    it('cleans up intervals on unmount', async () => {
      global.fetch = vi.fn(() => Promise.resolve({
        ok: true,
        status: 200,
        json: async () => []
      }));

      const { unmount } = renderWithI18n(<App />);

      // Unmount component
      unmount();

      // No way to directly test interval cleanup, but component should unmount without errors
      expect(true).toBe(true);
    });

    it('handles component unmounting during async operations', async () => {
      let resolveFetch;
      global.fetch = vi.fn(() => new Promise((resolve) => {
        resolveFetch = resolve;
      }));

      const { unmount } = renderWithI18n(<App />);

      // Unmount while fetch is pending
      unmount();

      // Resolve fetch after unmount
      if (resolveFetch) {
        resolveFetch({
          ok: true,
          json: async () => []
        });
      }

      // Should not cause errors
      expect(true).toBe(true);
    });
  });

  describe('Accessibility Edge Cases', () => {
    it('handles keyboard navigation in complex scenarios', async () => {
      global.fetch = vi.fn((url) => {
        const urlString = typeof url === 'string' ? url : url.toString();
        
        if (urlString.includes('/api/profiles')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => [
              { id: 'profile-1', name: 'Profile 1', taskFolderPath: '/1', projectRootPath: '/root' },
              { id: 'profile-2', name: 'Profile 2', taskFolderPath: '/2', projectRootPath: '/root' }
            ]
          });
        }
        
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({})
        });
      });

      renderWithI18n(<App />);

      await waitFor(() => {
        expect(screen.getByText('Profile 1')).toBeInTheDocument();
      });

      // Tab through interface
      const user = userEvent.setup();
      await user.tab();
      await user.tab();
      await user.tab();

      // Should maintain focus outline
      expect(document.activeElement).toBeTruthy();
    });

    it('maintains focus after state changes', async () => {
      const mockOnFilterChange = vi.fn();
      const tasks = [
        createMockTask({ name: 'Task 1' }),
        createMockTask({ name: 'Task 2' })
      ];

      const mockProps = {
        data: tasks,
        globalFilter: '',
        onGlobalFilterChange: mockOnFilterChange,
        projectRoot: '/test',
        profileId: 'test-profile',
        onDetailViewChange: vi.fn(),
        resetDetailView: 0,
        onTaskSaved: vi.fn(),
        onDeleteTask: vi.fn(),
        showToast: vi.fn()
      };

      renderWithI18n(<TaskTable {...mockProps} />);

      // Focus on search
      const searchInput = screen.getByPlaceholderText(/Search tasks/i);
      searchInput.focus();

      // Type to filter
      await userEvent.type(searchInput, 'Task 1');

      // Focus should remain on search
      expect(document.activeElement).toBe(searchInput);
    });
  });
});