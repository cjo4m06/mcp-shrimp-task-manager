import { describe, it, expect } from 'vitest';
import { exportToCSV, exportToMarkdown, filterTasksByStatus } from './exportUtils';

describe('exportUtils', () => {
  const mockTasks = [
    {
      id: '1',
      name: 'Complete project setup',
      description: 'Set up the initial project structure',
      status: 'completed',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-02T00:00:00.000Z'
    },
    {
      id: '2', 
      name: 'Implement user authentication',
      description: 'Add login and registration functionality',
      status: 'in_progress',
      createdAt: '2024-01-03T00:00:00.000Z',
      updatedAt: '2024-01-04T00:00:00.000Z'
    },
    {
      id: '3',
      name: 'Design homepage layout',
      description: 'Create wireframes and mockups for the homepage',
      status: 'pending',
      createdAt: '2024-01-05T00:00:00.000Z',
      updatedAt: '2024-01-05T00:00:00.000Z'
    }
  ];

  describe('filterTasksByStatus', () => {
    it('should return all tasks when all statuses are selected', () => {
      const selectedStatuses = ['pending', 'in_progress', 'completed'];
      const result = filterTasksByStatus(mockTasks, selectedStatuses);
      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(3);
    });

    it('should return only completed tasks when completed is selected', () => {
      const selectedStatuses = ['completed'];
      const result = filterTasksByStatus(mockTasks, selectedStatuses);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('completed');
      expect(result[0].name).toBe('Complete project setup');
    });

    it('should return only in_progress tasks when in_progress is selected', () => {
      const selectedStatuses = ['in_progress'];
      const result = filterTasksByStatus(mockTasks, selectedStatuses);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('in_progress');
      expect(result[0].name).toBe('Implement user authentication');
    });

    it('should return multiple status tasks when multiple statuses are selected', () => {
      const selectedStatuses = ['pending', 'completed'];
      const result = filterTasksByStatus(mockTasks, selectedStatuses);
      expect(result).toHaveLength(2);
      expect(result.map(task => task.status)).toEqual(['completed', 'pending']);
    });

    it('should return empty array when no statuses are selected', () => {
      const selectedStatuses = [];
      const result = filterTasksByStatus(mockTasks, selectedStatuses);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty tasks list', () => {
      const selectedStatuses = ['completed'];
      const result = filterTasksByStatus([], selectedStatuses);
      expect(result).toEqual([]);
    });
  });

  describe('exportToCSV', () => {
    it('should generate correct CSV format with headers', () => {
      const result = exportToCSV(mockTasks);
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('ID,Name,Description,Status,Created At,Updated At');
      expect(lines).toHaveLength(4); // header + 3 tasks
    });

    it('should properly escape CSV values with commas and quotes', () => {
      const tasksWithSpecialChars = [
        {
          id: '1',
          name: 'Task with, comma',
          description: 'Description with "quotes" and, comma',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];
      
      const result = exportToCSV(tasksWithSpecialChars);
      const lines = result.split('\n');
      
      expect(lines[1]).toContain('"Task with, comma"');
      expect(lines[1]).toContain('"Description with ""quotes"" and, comma"');
    });

    it('should format dates in ISO format', () => {
      const result = exportToCSV(mockTasks);
      const lines = result.split('\n');
      
      expect(lines[1]).toContain('2024-01-01T00:00:00.000Z');
      expect(lines[1]).toContain('2024-01-02T00:00:00.000Z');
    });

    it('should handle empty tasks array', () => {
      const result = exportToCSV([]);
      expect(result).toBe('ID,Name,Description,Status,Created At,Updated At');
    });
  });

  describe('exportToMarkdown', () => {
    it('should generate correct markdown format with headers', () => {
      const result = exportToMarkdown(mockTasks);
      
      expect(result).toContain('# Tasks Export');
      expect(result).toContain('Total tasks: 3');
      expect(result).toContain('## Task 1: Complete project setup');
      expect(result).toContain('## Task 2: Implement user authentication');
      expect(result).toContain('## Task 3: Design homepage layout');
    });

    it('should group tasks by status', () => {
      const result = exportToMarkdown(mockTasks);
      
      expect(result).toContain('### Status: Completed');
      expect(result).toContain('### Status: In Progress');
      expect(result).toContain('### Status: Pending');
    });

    it('should include task descriptions and metadata', () => {
      const result = exportToMarkdown(mockTasks);
      
      expect(result).toContain('**Description:**');
      expect(result).toContain('- **Created:** 2024-01-01');
      expect(result).toContain('- **Updated:** 2024-01-02');
      expect(result).toContain('- **ID:** 1');
    });

    it('should handle tasks with no description', () => {
      const tasksWithoutDescription = [
        {
          id: '1',
          name: 'Task without description',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ];
      
      const result = exportToMarkdown(tasksWithoutDescription);
      expect(result).toContain('Task without description');
      expect(result).not.toContain('undefined');
    });

    it('should handle empty tasks array', () => {
      const result = exportToMarkdown([]);
      expect(result).toContain('# Tasks Export');
      expect(result).toContain('Total tasks: 0');
      expect(result).toContain('No tasks to export.');
    });

    it('should generate summary statistics', () => {
      const result = exportToMarkdown(mockTasks);
      
      expect(result).toContain('- **Completed:** 1');
      expect(result).toContain('- **In Progress:** 1');
      expect(result).toContain('- **Pending:** 1');
    });

    it('should include initial request when provided', () => {
      const initialRequest = 'Create a web application with user authentication and task management';
      const result = exportToMarkdown(mockTasks, initialRequest);
      
      expect(result).toContain('## Initial Request');
      expect(result).toContain(initialRequest);
    });

    it('should include task numbering in headers', () => {
      const result = exportToMarkdown(mockTasks);
      
      expect(result).toContain('## Task 1: Complete project setup');
      expect(result).toContain('## Task 2: Implement user authentication');
      expect(result).toContain('## Task 3: Design homepage layout');
    });

    it('should include initial request in empty export', () => {
      const initialRequest = 'Test initial request for empty tasks';
      const result = exportToMarkdown([], initialRequest);
      
      expect(result).toContain('## Initial Request');
      expect(result).toContain(initialRequest);
      expect(result).toContain('No tasks to export');
    });
  });
});