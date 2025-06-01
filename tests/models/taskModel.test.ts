import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getAllTasks,
  canExecuteTask,
  assessTaskComplexity,
  batchCreateOrUpdateTasks,
} from '../../src/models/taskModel.js';
import { TaskStatus, TaskComplexityLevel } from '../../src/types/index.js';
import {
  createMockTask,
  createMockTaskChain,
  createCompletedTask,
  getTestDataDir,
  isValidTask,
} from '../helpers/testUtils.js';

// Mock the project detector to return test directory
vi.mock('../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

describe('TaskModel', () => {
  beforeEach(() => {
    // Ensure clean state for each test
    const dataDir = getTestDataDir();
    if (fs.existsSync(dataDir)) {
      fs.rmSync(dataDir, { recursive: true, force: true });
    }
    fs.mkdirSync(dataDir, { recursive: true });
  });

  describe('Basic CRUD Operations', () => {
    it('should create a new task', async () => {
      const task = await createTask(
        'Test Task',
        'This is a test task',
        'Some notes'
      );

      expect(isValidTask(task)).toBe(true);
      expect(task.name).toBe('Test Task');
      expect(task.description).toBe('This is a test task');
      expect(task.notes).toBe('Some notes');
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.dependencies).toEqual([]);
    });

    it('should create task with dependencies', async () => {
      const parentTask = await createTask('Parent Task', 'Parent description');
      const childTask = await createTask(
        'Child Task',
        'Child description',
        undefined,
        [parentTask.id]
      );

      expect(childTask.dependencies).toHaveLength(1);
      expect(childTask.dependencies[0].taskId).toBe(parentTask.id);
    });

    it('should create and retrieve multiple tasks', async () => {
      const task1 = await createTask('Task 1', 'Description 1');
      const task2 = await createTask('Task 2', 'Description 2');

      const tasks = await getAllTasks();

      expect(tasks).toHaveLength(2);
      expect(tasks.find((t: any) => t.name === 'Task 1')).toBeDefined();
      expect(tasks.find((t: any) => t.name === 'Task 2')).toBeDefined();
    });

    it('should get task by ID', async () => {
      const originalTask = await createTask('Find Me', 'Description');
      const foundTask = await getTaskById(originalTask.id);

      expect(foundTask).toBeDefined();
      expect(foundTask?.id).toBe(originalTask.id);
      expect(foundTask?.name).toBe('Find Me');
    });

    it('should return null for non-existent task ID', async () => {
      const task = await getTaskById('non-existent-id');
      expect(task).toBeNull();
    });

    it('should get all tasks', async () => {
      await createTask('Task 1', 'Description 1');
      await createTask('Task 2', 'Description 2');

      const tasks = await getAllTasks();
      expect(tasks).toHaveLength(2);
    });
  });

  describe('Task Updates', () => {
    it('should update task properties', async () => {
      const task = await createTask('Original', 'Original description');
      const updatedTask = await updateTask(task.id, {
        name: 'Updated',
        description: 'Updated description',
        notes: 'New notes',
      });

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.name).toBe('Updated');
      expect(updatedTask?.description).toBe('Updated description');
      expect(updatedTask?.notes).toBe('New notes');
      expect(updatedTask?.updatedAt.getTime()).toBeGreaterThanOrEqual(task.updatedAt.getTime());
    });

    it('should not update completed task except allowed fields', async () => {
      const task = await createTask('Test', 'Description');
      await updateTask(task.id, { status: TaskStatus.COMPLETED });

      // Try to update name (should fail)
      const result = await updateTask(task.id, { name: 'New Name' });
      expect(result).toBeNull();

      // Update summary (should succeed)
      const summaryUpdate = await updateTask(task.id, { summary: 'Task summary' });
      expect(summaryUpdate).toBeDefined();
      expect(summaryUpdate?.summary).toBe('Task summary');
    });

    it('should return null when updating non-existent task', async () => {
      const result = await updateTask('non-existent', { name: 'New Name' });
      expect(result).toBeNull();
    });
  });

  describe('Task Deletion', () => {
    it('should delete existing task', async () => {
      const task = await createTask('To Delete', 'Description');
      const deleted = await deleteTask(task.id);

      expect(deleted.success).toBe(true);
      expect(deleted.message).toBe('任務刪除成功');

      const foundTask = await getTaskById(task.id);
      expect(foundTask).toBeNull();
    });

    it('should not delete completed task', async () => {
      const task = await createTask('Completed', 'Description');
      await updateTask(task.id, { status: TaskStatus.COMPLETED });

      const deleted = await deleteTask(task.id);
      expect(deleted.success).toBe(false);
      expect(deleted.message).toBe('無法刪除已完成的任務');

      const foundTask = await getTaskById(task.id);
      expect(foundTask).toBeDefined();
    });

    it('should return false for non-existent task', async () => {
      const deleted = await deleteTask('non-existent');
      expect(deleted.success).toBe(false);
      expect(deleted.message).toBe('找不到指定任務');
    });
  });

  describe('Task Dependencies', () => {
    it('should check if task can be executed with no dependencies', async () => {
      const task = await createTask('Independent', 'No dependencies');
      const result = await canExecuteTask(task.id);

      expect(result.canExecute).toBe(true);
      expect(result.blockedBy).toBeUndefined();
    });

    it('should check if task can be executed with completed dependencies', async () => {
      const parentTask = await createTask('Parent', 'Parent task');
      await updateTask(parentTask.id, { status: TaskStatus.COMPLETED });

      const childTask = await createTask('Child', 'Child task', undefined, [parentTask.id]);
      const result = await canExecuteTask(childTask.id);

      expect(result.canExecute).toBe(true);
    });

    it('should block task execution with incomplete dependencies', async () => {
      const parentTask = await createTask('Parent', 'Parent task');
      const childTask = await createTask('Child', 'Child task', undefined, [parentTask.id]);

      const result = await canExecuteTask(childTask.id);

      expect(result.canExecute).toBe(false);
      expect(result.blockedBy).toContain(parentTask.id);
    });

    it('should return false for completed task execution check', async () => {
      const task = await createTask('Completed', 'Already done');
      await updateTask(task.id, { status: TaskStatus.COMPLETED });

      const result = await canExecuteTask(task.id);
      expect(result.canExecute).toBe(false);
    });
  });

  describe('Task Complexity Assessment', () => {
    it('should assess low complexity task', async () => {
      const task = await createTask('Simple', 'Short description');
      const complexity = await assessTaskComplexity(task.id);

      expect(complexity).toBeDefined();
      expect(complexity?.level).toBe(TaskComplexityLevel.LOW);
    });

    it('should assess high complexity task', async () => {
      const longDescription = 'A'.repeat(1500); // Very long description
      const task = await createTask('Complex', longDescription, 'B'.repeat(600));
      const complexity = await assessTaskComplexity(task.id);

      expect(complexity).toBeDefined();
      expect(complexity?.level).toBe(TaskComplexityLevel.HIGH);
    });

    it('should return null for non-existent task complexity', async () => {
      const complexity = await assessTaskComplexity('non-existent');
      expect(complexity).toBeNull();
    });
  });

  describe('Batch Operations', () => {
    it('should create multiple tasks in batch', async () => {
      const taskData = [
        { name: 'Task 1', description: 'Description 1' },
        { name: 'Task 2', description: 'Description 2' },
        { name: 'Task 3', description: 'Description 3' },
      ];

      const tasks = await batchCreateOrUpdateTasks(taskData, 'clearAllTasks');

      expect(tasks).toHaveLength(3);
      expect(tasks.every(isValidTask)).toBe(true);
      expect(tasks.map(t => t.name)).toEqual(['Task 1', 'Task 2', 'Task 3']);
    });

    it('should handle batch operations with dependencies', async () => {
      const taskData = [
        { name: 'Parent', description: 'Parent task' },
        { name: 'Child', description: 'Child task', dependencies: ['Parent'] },
      ];

      const tasks = await batchCreateOrUpdateTasks(taskData, 'clearAllTasks');

      expect(tasks).toHaveLength(2);
      const childTask = tasks.find(t => t.name === 'Child');
      expect(childTask?.dependencies).toHaveLength(1);
    });

    it('should append tasks in append mode', async () => {
      await createTask('Existing', 'Existing task');

      const taskData = [
        { name: 'New Task', description: 'New description' },
      ];

      const tasks = await batchCreateOrUpdateTasks(taskData, 'append');
      const allTasks = await getAllTasks();

      expect(allTasks).toHaveLength(2);
      expect(allTasks.find(t => t.name === 'Existing')).toBeDefined();
      expect(allTasks.find(t => t.name === 'New Task')).toBeDefined();
    });
  });
});
