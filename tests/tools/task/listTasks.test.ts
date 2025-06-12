import { describe, it, expect, beforeEach, vi } from 'vitest';
import { listTasks, listTasksSchema } from '../../../src/tools/task/listTasks.js';
import { createTask } from '../../../src/models/taskModel.js';
import { TaskStatus } from '../../../src/types/index.js';
import { getTestDataDir } from '../../helpers/testUtils.js';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

describe('listTasks Tool', () => {
  describe('listTasksSchema', () => {
    it('should validate correct input', () => {
      const validInput = { status: 'all' };
      const result = listTasksSchema.safeParse(validInput);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('all');
      }
    });

    it('should validate specific status', () => {
      const validInput = { status: 'pending' };
      const result = listTasksSchema.safeParse(validInput);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('pending');
      }
    });

    it('should reject invalid status', () => {
      const invalidInput = { status: 'invalid' };
      const result = listTasksSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });
  });

  describe('listTasks Function', () => {
    it('should list all tasks when status is "all"', async () => {
      // Create test tasks
      const task1 = await createTask('Task 1', 'Description 1');
      const task2 = await createTask('Task 2', 'Description 2');

      const result = await listTasks({ status: 'all' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task 1');
      expect(result.content[0].text).toContain('Task 2');
    });

    it('should list only pending tasks', async () => {
      // Create test tasks
      const task1 = await createTask('Pending Task', 'Description');
      const task2 = await createTask('Completed Task', 'Description');
      
      // Mark one as completed
      const { updateTask } = await import('../../../src/models/taskModel.js');
      await updateTask(task2.id, { status: TaskStatus.COMPLETED });

      const result = await listTasks({ status: 'pending' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Pending Task');
      expect(result.content[0].text).not.toContain('Completed Task');
    });

    it('should list only completed tasks', async () => {
      // Create test tasks
      const task1 = await createTask('Pending Task', 'Description');
      const task2 = await createTask('Completed Task', 'Description');
      
      // Mark one as completed
      const { updateTask } = await import('../../../src/models/taskModel.js');
      await updateTask(task2.id, { status: TaskStatus.COMPLETED });

      const result = await listTasks({ status: 'completed' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Completed Task');
      expect(result.content[0].text).not.toContain('Pending Task');
    });

    it('should list only in-progress tasks', async () => {
      // Create test tasks
      const task1 = await createTask('Pending Task', 'Description');
      const task2 = await createTask('In Progress Task', 'Description');
      
      // Mark one as in progress
      const { updateTask } = await import('../../../src/models/taskModel.js');
      await updateTask(task2.id, { status: TaskStatus.IN_PROGRESS });

      const result = await listTasks({ status: 'in_progress' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('In Progress Task');
      expect(result.content[0].text).not.toContain('Pending Task');
    });

    it('should handle empty task list', async () => {
      const result = await listTasks({ status: 'all' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('沒有任何任務');
    });
  });
});
