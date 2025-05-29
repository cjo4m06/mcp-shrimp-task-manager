import { describe, it, expect, beforeEach, vi } from 'vitest';
import { clearAllTasks, clearAllTasksSchema } from '../../../src/tools/task/clearAllTasks.js';
import { createTask, getAllTasks } from '../../../src/models/taskModel.js';
import { getTestDataDir } from '../../helpers/testUtils.js';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

describe('clearAllTasks Tool', () => {
  describe('clearAllTasksSchema', () => {
    it('should validate correct input with confirm true', () => {
      const validInput = { confirm: true };
      const result = clearAllTasksSchema.safeParse(validInput);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.confirm).toBe(true);
      }
    });

    it('should reject input with confirm false', () => {
      const invalidInput = { confirm: false };
      const result = clearAllTasksSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it('should reject missing confirm field', () => {
      const invalidInput = {};
      const result = clearAllTasksSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });

    it('should reject non-boolean confirm field', () => {
      const invalidInput = { confirm: 'yes' };
      const result = clearAllTasksSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });
  });

  describe('clearAllTasks Function', () => {
    it('should clear all tasks when confirm is true', async () => {
      // Create some test tasks
      await createTask('Task 1', 'Description 1');
      await createTask('Task 2', 'Description 2');
      
      // Verify tasks exist
      const tasksBefore = await getAllTasks();
      expect(tasksBefore.length).toBe(2);

      const result = await clearAllTasks({ confirm: true });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Clear All Tasks Result');

      // Verify tasks are cleared
      const tasksAfter = await getAllTasks();
      expect(tasksAfter.length).toBe(0);
    });

    it('should not clear tasks when confirm is false', async () => {
      // Create some test tasks
      await createTask('Task 1', 'Description 1');
      await createTask('Task 2', 'Description 2');
      
      // Verify tasks exist
      const tasksBefore = await getAllTasks();
      expect(tasksBefore.length).toBe(2);

      const result = await clearAllTasks({ confirm: false });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Operation Cancelled');

      // Verify tasks still exist
      const tasksAfter = await getAllTasks();
      expect(tasksAfter.length).toBe(2);
    });

    it('should handle empty task list', async () => {
      // Ensure no tasks exist
      const tasksBefore = await getAllTasks();
      expect(tasksBefore.length).toBe(0);

      const result = await clearAllTasks({ confirm: true });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Clear All Tasks Result');
    });
  });
});
