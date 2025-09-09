import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import {
  getInitialRequest,
  setInitialRequest,
  getTasksData,
  getAllTasks,
  createTask
} from './taskModel.js';
import { TasksData, TaskStatus } from '../types/index.js';

// Mock the paths module
vi.mock('../utils/paths.js', () => ({
  getDataDir: vi.fn(),
  getTasksFilePath: vi.fn(),
  getMemoryDir: vi.fn()
}));

describe('TaskModel Initial Request Feature', () => {
  let tempDir: string;
  let tasksFilePath: string;

  beforeEach(async () => {
    // Create a temporary directory for testing
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'task-model-test-'));
    tasksFilePath = path.join(tempDir, 'tasks.json');

    // Mock the path functions to return our temp paths
    const { getDataDir, getTasksFilePath } = await import('../utils/paths.js');
    vi.mocked(getDataDir).mockResolvedValue(tempDir);
    vi.mocked(getTasksFilePath).mockResolvedValue(tasksFilePath);
  });

  afterEach(async () => {
    // Clean up temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Initial Request Storage', () => {
    it('should save and retrieve initial request', async () => {
      const testRequest = 'Create a Hello World app with React and TypeScript';
      
      await setInitialRequest(testRequest);
      const retrieved = await getInitialRequest();
      
      expect(retrieved).toBe(testRequest);
    });

    it('should handle undefined initial request when file is empty', async () => {
      // Create empty tasks file
      await fs.writeFile(tasksFilePath, JSON.stringify({ tasks: [] }));
      
      const retrieved = await getInitialRequest();
      
      expect(retrieved).toBeUndefined();
    });

    it('should update initial request without affecting tasks', async () => {
      // Create a task first
      await createTask('Test Task', 'Test Description');
      
      // Set initial request
      const initialRequest = 'Build a web application';
      await setInitialRequest(initialRequest);
      
      // Verify both tasks and initial request are present
      const tasksData = await getTasksData();
      const tasks = await getAllTasks();
      
      expect(tasksData.initialRequest).toBe(initialRequest);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].name).toBe('Test Task');
    });
  });

  describe('Backward Compatibility', () => {
    it('should handle old format (array of tasks) correctly', async () => {
      // Write old format directly to file
      const oldFormatData = [
        {
          id: '123',
          name: 'Old Task',
          description: 'Task from old format',
          status: TaskStatus.PENDING,
          dependencies: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      await fs.writeFile(tasksFilePath, JSON.stringify(oldFormatData));
      
      // Should read correctly
      const tasksData = await getTasksData();
      
      expect(tasksData.tasks).toHaveLength(1);
      expect(tasksData.tasks[0].name).toBe('Old Task');
      expect(tasksData.initialRequest).toBeUndefined();
    });

    it('should handle new format with initial request', async () => {
      const newFormatData: TasksData = {
        initialRequest: 'Build an e-commerce site',
        createdAt: new Date(),
        updatedAt: new Date(),
        tasks: [
          {
            id: '456',
            name: 'New Task',
            description: 'Task from new format',
            status: TaskStatus.PENDING,
            dependencies: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };
      
      await fs.writeFile(tasksFilePath, JSON.stringify(newFormatData));
      
      const tasksData = await getTasksData();
      
      expect(tasksData.tasks).toHaveLength(1);
      expect(tasksData.tasks[0].name).toBe('New Task');
      expect(tasksData.initialRequest).toBe('Build an e-commerce site');
    });

    it('should preserve initial request when creating new tasks', async () => {
      // Set initial request first
      const initialRequest = 'Create a mobile app';
      await setInitialRequest(initialRequest);
      
      // Create a new task
      await createTask('Mobile App Task', 'Implement login screen');
      
      // Verify initial request is preserved
      const tasksData = await getTasksData();
      
      expect(tasksData.initialRequest).toBe(initialRequest);
      expect(tasksData.tasks).toHaveLength(1);
    });
  });

  describe('TasksData Structure', () => {
    it('should include metadata fields in TasksData', async () => {
      const testRequest = 'Test project requirements';
      await setInitialRequest(testRequest);
      
      const tasksData = await getTasksData();
      
      expect(tasksData).toHaveProperty('initialRequest', testRequest);
      expect(tasksData).toHaveProperty('tasks');
      expect(tasksData).toHaveProperty('createdAt');
      expect(tasksData).toHaveProperty('updatedAt');
      expect(tasksData.createdAt).toBeInstanceOf(Date);
      expect(tasksData.updatedAt).toBeInstanceOf(Date);
    });

    it('should update updatedAt timestamp when initial request changes', async () => {
      await setInitialRequest('First request');
      const firstData = await getTasksData();
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await setInitialRequest('Updated request');
      const updatedData = await getTasksData();
      
      expect(updatedData.initialRequest).toBe('Updated request');
      expect(updatedData.updatedAt?.getTime()).toBeGreaterThan(firstData.updatedAt?.getTime() ?? 0);
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      // Mock fs.writeFile to throw an error
      const originalWriteFile = fs.writeFile;
      vi.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error('Permission denied'));
      
      await expect(setInitialRequest('Test')).rejects.toThrow('Permission denied');
      
      // Restore original function
      vi.mocked(fs.writeFile).mockImplementation(originalWriteFile);
    });

    it('should handle corrupted JSON gracefully', async () => {
      // Write invalid JSON
      await fs.writeFile(tasksFilePath, 'invalid json {');
      
      await expect(getTasksData()).rejects.toThrow();
    });
  });
});