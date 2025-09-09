import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, test, expect, vi } from 'vitest';
import CompletionAnalytics from './CompletionAnalytics';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn() }
  })
}));

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Line: () => null,
  Bar: () => null,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null
}));

describe('CompletionAnalytics Component', () => {
  const mockTasks = [
    {
      id: '1',
      name: 'Task 1',
      status: 'completed',
      summary: `
        **Key Accomplishments**
        - Successfully implemented user authentication
        - Added OAuth integration
        
        **Implementation Details**
        - Used Passport.js for authentication
        
        **Technical Challenges**
        - Challenge: Performance optimization needed
          Solution: Implemented caching
      `,
      completedAt: new Date().toISOString(),
      executedBy: 'agent-1',
      score: 95
    },
    {
      id: '2',
      name: 'Task 2',
      status: 'completed',
      summary: `
        **Key Accomplishments**
        - Fixed critical security vulnerability
        - Updated dependencies
        
        **Technical Challenges**
        - Challenge: Compatibility issues with older browsers
          Solution: Added polyfills
      `,
      completedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      executedBy: 'agent-2',
      score: 88
    },
    {
      id: '3',
      name: 'Task 3',
      status: 'pending',
      summary: null
    }
  ];

  test('renders without crashing', () => {
    render(<CompletionAnalytics tasks={[]} />);
    expect(screen.getByText(/Completion Analytics Dashboard/)).toBeInTheDocument();
  });

  test('displays correct total completed tasks', () => {
    render(<CompletionAnalytics tasks={mockTasks} />);
    // Use more specific selector to find the total completed count
    const totalCompletedSection = screen.getByText('Total Completed').closest('div');
    expect(totalCompletedSection).toHaveTextContent('2');
  });

  test('shows filters for date range and agent', () => {
    render(<CompletionAnalytics tasks={mockTasks} />);
    
    // Check date range filter
    const dateFilter = screen.getByDisplayValue('All Time');
    expect(dateFilter).toBeInTheDocument();
    
    // Check agent filter
    const agentFilter = screen.getByDisplayValue('All Agents');
    expect(agentFilter).toBeInTheDocument();
  });

  test('filters work correctly', () => {
    render(<CompletionAnalytics tasks={mockTasks} />);
    
    // Change date filter to today
    const dateFilter = screen.getByDisplayValue('All Time');
    fireEvent.change(dateFilter, { target: { value: 'today' } });
    
    // Should still show 1 task (today's task) in the total completed section
    const totalCompletedSection = screen.getByText('Total Completed').closest('div');
    expect(totalCompletedSection).toHaveTextContent('1');
  });

  test('displays no data message when no tasks match filters', () => {
    render(<CompletionAnalytics tasks={[]} />);
    expect(screen.getByText(/No completed tasks found/)).toBeInTheDocument();
  });

  test('handles tasks without summary gracefully', () => {
    const tasksWithoutSummary = [
      { id: '1', status: 'completed', summary: null },
      { id: '2', status: 'completed', summary: '' }
    ];
    
    render(<CompletionAnalytics tasks={tasksWithoutSummary} />);
    // Should show 0 in the total completed section since tasks without summary are filtered out
    const totalCompletedSection = screen.getByText('Total Completed').closest('div');
    expect(totalCompletedSection).toHaveTextContent('0');
  });

  test('calculates average completion per day', () => {
    render(<CompletionAnalytics tasks={mockTasks} />);
    
    // Should show average (2 tasks / number of days with data)
    const avgElement = screen.getByText(/Avg Completion\/Day/);
    expect(avgElement).toBeInTheDocument();
  });

  test('extracts unique agents from tasks', () => {
    render(<CompletionAnalytics tasks={mockTasks} />);
    
    const agentFilter = screen.getByDisplayValue('All Agents');
    fireEvent.click(agentFilter);
    
    // Should have options for agent-1 and agent-2
    const options = agentFilter.querySelectorAll('option');
    expect(options.length).toBeGreaterThan(1); // At least "All Agents" + actual agents
  });
});