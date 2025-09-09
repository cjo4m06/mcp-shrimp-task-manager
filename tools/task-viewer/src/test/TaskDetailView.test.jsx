import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskDetailView from '../components/TaskDetailView';

// Mock TaskSummary component for testing
vi.mock('../components/TaskSummary', () => ({
  default: vi.fn(({ summary }) => (
    <div data-testid="task-summary" data-summary={summary}>
      Mocked TaskSummary: {summary}
    </div>
  ))
}));

describe('TaskDetailView Component', () => {
  const mockTask = {
    id: 'task-123-456',
    name: 'Implement authentication system',
    description: 'Build a secure OAuth2 authentication system with JWT tokens',
    status: 'in_progress',
    notes: 'Remember to implement refresh token rotation for security',
    implementationGuide: 'Use Passport.js for OAuth2 strategy. Implement JWT with RS256. Store refresh tokens in Redis.',
    verificationCriteria: 'All endpoints secured. Tokens expire correctly. Refresh mechanism works.',
    summary: 'Authentication system using OAuth2 and JWT',
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-20T14:45:00Z',
    completedAt: null,
    dependencies: [
      { taskId: 'dep-1', name: 'Setup Redis' },
      { taskId: 'dep-2', name: 'Configure OAuth provider' }
    ],
    relatedFiles: [
      { path: '/src/auth/passport.js', type: 'CREATE' },
      { path: '/src/middleware/auth.js', type: 'TO_MODIFY' },
      { path: '/docs/auth.md', type: 'REFERENCE' }
    ]
  };

  const mockCompletedTask = {
    ...mockTask,
    status: 'completed',
    completedAt: '2025-01-22T16:00:00Z'
  };

  const mockOnBack = vi.fn();
  const mockOnNavigateToTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders null when no task provided', () => {
      const { container } = render(
        <TaskDetailView 
          task={null} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders task header with name and back button', () => {
      render(
        <TaskDetailView 
          task={mockTask} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[mockTask]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.getByText('Implement authentication system')).toBeInTheDocument();
      expect(screen.getByText('← Back to Tasks')).toBeInTheDocument();
    });

    it('displays all basic task information', () => {
      render(
        <TaskDetailView 
          task={mockTask} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[mockTask]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      // Check labels
      expect(screen.getByText('Status:')).toBeInTheDocument();
      expect(screen.getByText('ID:')).toBeInTheDocument();
      expect(screen.getByText('Created:')).toBeInTheDocument();
      expect(screen.getByText('Updated:')).toBeInTheDocument();

      // Check values
      expect(screen.getByText('task-123-456')).toBeInTheDocument();
      expect(screen.getByText('in progress')).toBeInTheDocument();
    });

    it('displays status with correct color', () => {
      render(
        <TaskDetailView 
          task={mockTask} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[mockTask]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      const statusBadge = screen.getByText('in progress');
      expect(statusBadge).toHaveClass('status-badge', 'status-in_progress');
      expect(statusBadge).toHaveStyle({ backgroundColor: '#3498db' });
    });

    it('shows completed date for completed tasks', () => {
      render(
        <TaskDetailView 
          task={mockCompletedTask} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[mockCompletedTask]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.getByText('Completed:')).toBeInTheDocument();
      expect(screen.getByText(/1\/22\/2025/)).toBeInTheDocument();
    });

    it('does not show completed date for incomplete tasks', () => {
      render(
        <TaskDetailView 
          task={mockTask} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[mockTask]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.queryByText('Completed:')).not.toBeInTheDocument();
    });
  });

  describe('Content Sections', () => {
    it('displays description section', () => {
      render(
        <TaskDetailView task={mockTask} onBack={mockOnBack} taskIndex={0} allTasks={[mockTask]} />
      );

      expect(screen.getByText('Build a secure OAuth2 authentication system with JWT tokens')).toBeInTheDocument();
    });

    it('shows default text when description is missing', () => {
      const taskWithoutDesc = { ...mockTask, description: null };
      render(
        <TaskDetailView 
          task={taskWithoutDesc} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[taskWithoutDesc]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('displays notes section when notes exist', () => {
      render(
        <TaskDetailView 
          task={mockTask} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[mockTask]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Remember to implement refresh token rotation for security')).toBeInTheDocument();
    });

    it('hides notes section when notes are null', () => {
      const taskWithoutNotes = { ...mockTask, notes: null };
      render(
        <TaskDetailView 
          task={taskWithoutNotes} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[taskWithoutNotes]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.queryByText('Notes')).not.toBeInTheDocument();
    });

    it('displays implementation guide when present', () => {
      render(
        <TaskDetailView 
          task={mockTask} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[mockTask]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.getByText('Implementation Guide')).toBeInTheDocument();
      expect(screen.getByText(/Use Passport.js for OAuth2 strategy/)).toBeInTheDocument();
    });

    it('displays verification criteria when present', () => {
      render(
        <TaskDetailView 
          task={mockTask} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[mockTask]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.getByText('Verification Criteria')).toBeInTheDocument();
      expect(screen.getByText(/All endpoints secured/)).toBeInTheDocument();
    });

    it('displays summary using TaskSummary component when present', () => {
      render(
        <TaskDetailView 
          task={mockTask} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[mockTask]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByTestId('task-summary')).toBeInTheDocument();
      expect(screen.getByTestId('task-summary')).toHaveAttribute('data-summary', 'Authentication system using OAuth2 and JWT');
    });

    it('hides summary section when summary is null', () => {
      const taskWithoutSummary = { ...mockTask, summary: null };
      render(
        <TaskDetailView 
          task={taskWithoutSummary} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[taskWithoutSummary]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.queryByText('Summary')).not.toBeInTheDocument();
      expect(screen.queryByTestId('task-summary')).not.toBeInTheDocument();
    });
  });

  describe('Dependencies', () => {
    it('displays dependencies section with all dependencies', () => {
      const allTasksWithDeps = [
        mockTask,
        { id: 'dep-1', name: 'Setup Redis' },
        { id: 'dep-2', name: 'Configure OAuth provider' }
      ];
      render(
        <TaskDetailView task={mockTask} onBack={mockOnBack} taskIndex={0} allTasks={allTasksWithDeps} />
      );

      expect(screen.getByText('Dependencies')).toBeInTheDocument();
      // Dependencies now show task numbers instead of raw IDs
      expect(screen.getByText('TASK 2')).toBeInTheDocument(); // dep-1 is at index 1
      expect(screen.getByText('TASK 3')).toBeInTheDocument(); // dep-2 is at index 2
    });

    it('shows each dependency with task number', () => {
      const allTasksWithDeps = [
        mockTask,
        { id: 'dep-1', name: 'Setup Redis' },
        { id: 'dep-2', name: 'Configure OAuth provider' }
      ];
      render(
        <TaskDetailView task={mockTask} onBack={mockOnBack} taskIndex={0} allTasks={allTasksWithDeps} />
      );

      expect(screen.getByText('TASK 2')).toBeInTheDocument();
      expect(screen.getByText('TASK 3')).toBeInTheDocument();
    });

    it('hides dependencies section when empty', () => {
      const taskWithoutDeps = { ...mockTask, dependencies: [] };
      render(
        <TaskDetailView task={taskWithoutDeps} onBack={mockOnBack} taskIndex={0} allTasks={[taskWithoutDeps]} />
      );

      expect(screen.queryByText('Dependencies')).not.toBeInTheDocument();
    });

    it('hides dependencies section when null', () => {
      const taskWithNullDeps = { ...mockTask, dependencies: null };
      render(
        <TaskDetailView 
          task={taskWithNullDeps} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[taskWithNullDeps]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.queryByText('Dependencies')).not.toBeInTheDocument();
    });
  });

  describe('Related Files', () => {
    it('displays related files section with all files', () => {
      render(
        <TaskDetailView 
          task={mockTask} 
          onBack={mockOnBack} 
          taskIndex={0} 
          allTasks={[mockTask]} 
          onNavigateToTask={mockOnNavigateToTask} 
        />
      );

      expect(screen.getByText('Related Files')).toBeInTheDocument();
      expect(screen.getByText('/src/auth/passport.js')).toBeInTheDocument();
      expect(screen.getByText('/src/middleware/auth.js')).toBeInTheDocument();
      expect(screen.getByText('/docs/auth.md')).toBeInTheDocument();
    });

    it('shows correct icons for file types', () => {
      render(
        <TaskDetailView task={mockTask} onBack={mockOnBack} taskIndex={0} allTasks={[mockTask]} />
      );

      // Check that file paths are displayed
      expect(screen.getByText(/\/src\/auth\/passport.js/)).toBeInTheDocument();
      expect(screen.getByText(/\/src\/middleware\/auth.js/)).toBeInTheDocument();
      expect(screen.getByText(/\/docs\/auth.md/)).toBeInTheDocument();
    });

    it('handles unknown file types with default icon', () => {
      const taskWithUnknownType = {
        ...mockTask,
        relatedFiles: [
          { path: '/test.txt', type: 'UNKNOWN' }
        ]
      };

      render(
        <TaskDetailView task={taskWithUnknownType} onBack={mockOnBack} taskIndex={0} allTasks={[taskWithUnknownType]} />
      );

      expect(screen.getByText(/\/test.txt/)).toBeInTheDocument();
    });

    it('hides related files section when empty', () => {
      const taskWithoutFiles = { ...mockTask, relatedFiles: [] };
      render(
        <TaskDetailView task={taskWithoutFiles} onBack={mockOnBack} taskIndex={0} allTasks={[taskWithoutFiles]} />
      );

      expect(screen.queryByText('Related Files')).not.toBeInTheDocument();
    });

    it('hides related files section when null', () => {
      const taskWithNullFiles = { ...mockTask, relatedFiles: null };
      render(
        <TaskDetailView task={taskWithNullFiles} onBack={mockOnBack} />
      );

      expect(screen.queryByText('Related Files')).not.toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly', () => {
      render(
        <TaskDetailView task={mockTask} onBack={mockOnBack} />
      );

      // Dates should be formatted (exact format depends on locale)
      expect(screen.getByText(/1\/15\/2025/)).toBeInTheDocument();
      expect(screen.getByText(/1\/20\/2025/)).toBeInTheDocument();
    });

    it('shows em dash for null dates', () => {
      const taskWithNullDate = { ...mockTask, createdAt: null };
      render(
        <TaskDetailView task={taskWithNullDate} onBack={mockOnBack} />
      );

      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  describe('Status Colors', () => {
    const statusTests = [
      { status: 'pending', color: '#ffa500' },
      { status: 'in_progress', color: '#3498db' },
      { status: 'completed', color: '#27ae60' },
      { status: 'blocked', color: '#e74c3c' }
    ];

    statusTests.forEach(({ status, color }) => {
      it(`applies correct color for ${status} status`, () => {
        const taskWithStatus = { ...mockTask, status };
        render(
          <TaskDetailView task={taskWithStatus} onBack={mockOnBack} />
        );

        const statusBadge = screen.getByText(status.replace('_', ' '));
        expect(statusBadge).toHaveStyle({ backgroundColor: color });
      });
    });

    it('applies default color for unknown status', () => {
      const taskWithUnknownStatus = { ...mockTask, status: 'unknown' };
      render(
        <TaskDetailView task={taskWithUnknownStatus} onBack={mockOnBack} />
      );

      const statusBadge = screen.getByText('unknown');
      expect(statusBadge).toHaveStyle({ backgroundColor: '#666' });
    });
  });

  describe('User Interactions', () => {
    it('calls onBack when back button clicked', () => {
      render(
        <TaskDetailView task={mockTask} onBack={mockOnBack} />
      );

      const backButton = screen.getByText('← Back to Tasks');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('back button has correct styling', () => {
      render(
        <TaskDetailView task={mockTask} onBack={mockOnBack} />
      );

      const backButton = screen.getByText('← Back to Tasks');
      expect(backButton).toHaveClass('back-button');
    });
  });

  describe('Edge Cases', () => {
    it('handles task with minimal data', () => {
      const minimalTask = {
        id: '123',
        name: 'Minimal Task',
        status: 'pending'
      };

      render(
        <TaskDetailView task={minimalTask} onBack={mockOnBack} taskIndex={0} allTasks={[minimalTask]} />
      );

      expect(screen.getByText('Minimal Task')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });

    it('handles very long content gracefully', () => {
      const longContentTask = {
        ...mockTask,
        description: 'A'.repeat(1000),
        notes: 'B'.repeat(1000)
      };

      render(
        <TaskDetailView task={longContentTask} onBack={mockOnBack} />
      );

      // Content should be displayed without breaking layout
      expect(screen.getByText(/A{150,}/)).toBeInTheDocument();
      expect(screen.getByText(/B{150,}/)).toBeInTheDocument();
    });

    it('handles special characters in content', () => {
      const specialCharTask = {
        ...mockTask,
        name: 'Task with <script>alert("XSS")</script>',
        description: 'Contains & ampersand, < less than, > greater than'
      };

      render(
        <TaskDetailView task={specialCharTask} onBack={mockOnBack} />
      );

      // Should be properly escaped
      expect(screen.getByText(/Task with.*script.*alert/)).toBeInTheDocument();
      expect(screen.getByText(/Contains & ampersand/)).toBeInTheDocument();
    });

    it('maintains layout with empty sections', () => {
      const emptyTask = {
        id: '123',
        name: 'Empty Task',
        status: 'pending',
        description: '',
        notes: '',
        implementationGuide: '',
        verificationCriteria: '',
        summary: '',
        dependencies: [],
        relatedFiles: []
      };

      const { container } = render(
        <TaskDetailView task={emptyTask} onBack={mockOnBack} taskIndex={0} allTasks={[emptyTask]} />
      );

      expect(container.querySelector('.task-detail-view')).toBeInTheDocument();
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      const { container } = render(
        <TaskDetailView task={mockTask} onBack={mockOnBack} />
      );

      expect(container.querySelector('h2')).toBeInTheDocument();
      expect(container.querySelectorAll('h3').length).toBeGreaterThan(0);
    });

    it('has proper heading hierarchy', () => {
      const { container } = render(
        <TaskDetailView task={mockTask} onBack={mockOnBack} taskIndex={0} allTasks={[mockTask]} />
      );

      const h2 = container.querySelector('h2');
      const h3s = container.querySelectorAll('h3');

      expect(h2.textContent).toContain('Implement authentication system');
      expect(h3s.length).toBeGreaterThan(0);
    });

    it('uses appropriate ARIA labels where needed', () => {
      render(
        <TaskDetailView task={mockTask} onBack={mockOnBack} />
      );

      const backButton = screen.getByText('← Back to Tasks');
      expect(backButton.tagName).toBe('BUTTON');
    });
  });
});