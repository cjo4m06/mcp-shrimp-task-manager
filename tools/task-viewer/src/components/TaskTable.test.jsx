import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import TaskTable from './TaskTable';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('TaskTable', () => {
  const mockData = [
    {
      id: 'task-123',
      name: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      agent: 'test-expert.md',
      dependencies: [],
    },
    {
      id: 'task-456',
      name: 'Task Manager Task',
      description: 'Uses task manager',
      status: 'pending',
      agent: 'task manager',
      dependencies: [],
    },
    {
      id: 'task-789',
      name: 'No Agent Task',
      description: 'No agent specified',
      status: 'pending',
      agent: null,
      dependencies: [],
    },
  ];

  const defaultProps = {
    data: mockData,
    globalFilter: '',
    onGlobalFilterChange: vi.fn(),
    projectRoot: '/home/fire/claude/mcp-shrimp-task-manager/tools/task-viewer',
    onDetailViewChange: vi.fn(),
    resetDetailView: vi.fn(),
    profileId: 'test-profile',
    onTaskSaved: vi.fn(),
    onDeleteTask: vi.fn(),
    showToast: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Robot emoji click handler', () => {
    it('should generate correct instruction for task manager agent', async () => {
      render(<TaskTable {...defaultProps} />);
      
      // Find the robot button for the task manager task using data-testid
      const taskManagerButton = screen.getByTestId('copy-agent-instruction-task-456');
      
      fireEvent.click(taskManagerButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'Use task manager to complete this shrimp task: task-456 please when u start working mark the shrimp task as in progress'
        );
      });
    });

    it('should generate correct instruction with full path for built-in agent', async () => {
      render(<TaskTable {...defaultProps} />);
      
      // Find the robot button for the test-expert.md task using data-testid
      const testExpertButton = screen.getByTestId('copy-agent-instruction-task-123');
      
      fireEvent.click(testExpertButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'use the built in subagent located in /home/fire/claude/mcp-shrimp-task-manager/tools/task-viewer/.claude/agents/test-expert.md to complete this shrimp task: task-123 please when u start working mark the shrimp task as in progress'
        );
      });
    });

    it('should handle null agent as task manager', async () => {
      render(<TaskTable {...defaultProps} />);
      
      // Find the robot button for the no-agent task using data-testid
      const noAgentButton = screen.getByTestId('copy-agent-instruction-task-789');
      
      fireEvent.click(noAgentButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'Use task manager to complete this shrimp task: task-789 please when u start working mark the shrimp task as in progress'
        );
      });
    });

    it('should show correct tooltip with full path for built-in agent', () => {
      render(<TaskTable {...defaultProps} />);
      
      const testExpertButton = screen.getByTestId('copy-agent-instruction-task-123');
      
      expect(testExpertButton.title).toBe(
        'use the built in subagent located in /home/fire/claude/mcp-shrimp-task-manager/tools/task-viewer/.claude/agents/test-expert.md to complete this shrimp task: task-123 please when u start working mark the shrimp task as in progress'
      );
    });

    it('should handle missing projectRoot gracefully', async () => {
      const propsWithoutRoot = { ...defaultProps, projectRoot: undefined };
      render(<TaskTable {...propsWithoutRoot} />);
      
      const testExpertButton = screen.getByTestId('copy-agent-instruction-task-123');
      
      fireEvent.click(testExpertButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'use the built in subagent located in ./.claude/agents/test-expert.md to complete this shrimp task: task-123 please when u start working mark the shrimp task as in progress'
        );
      });
    });

    it('should handle empty projectRoot string', async () => {
      const propsWithEmptyRoot = { ...defaultProps, projectRoot: '' };
      render(<TaskTable {...propsWithEmptyRoot} />);
      
      const testExpertButton = screen.getByTestId('copy-agent-instruction-task-123');
      
      fireEvent.click(testExpertButton);
      
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
          'use the built in subagent located in ./.claude/agents/test-expert.md to complete this shrimp task: task-123 please when u start working mark the shrimp task as in progress'
        );
      });
    });

    it('should provide visual feedback after copying', async () => {
      render(<TaskTable {...defaultProps} />);
      
      const button = screen.getByTestId('copy-agent-instruction-task-123');
      
      fireEvent.click(button);
      
      // Should temporarily show checkmark
      await waitFor(() => {
        expect(button.textContent).toBe('✓');
      });
      
      // Should revert back to robot emoji after timeout
      await waitFor(() => {
        expect(button.textContent).toBe('🤖');
      }, { timeout: 3000 });
    });
  });
});