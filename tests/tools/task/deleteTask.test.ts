import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deleteTask, deleteTaskSchema } from '../../../src/tools/task/deleteTask.js';
import { createTask } from '../../../src/models/taskModel.js';
import { TaskStatus } from '../../../src/types/index.js';
import { getTestDataDir, generateTestUUID } from '../../helpers/testUtils.js';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

describe('deleteTask Tool', () => {
  describe('deleteTaskSchema', () => {
    it('should validate correct input', () => {
      const validInput = { taskId: generateTestUUID() };
      const result = deleteTaskSchema.safeParse(validInput);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.taskId).toBeDefined();
      }
    });

    it('should reject invalid UUID', () => {
      const invalidInput = { taskId: 'invalid-uuid' };
      const result = deleteTaskSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });

    it('should reject missing taskId', () => {
      const invalidInput = {};
      const result = deleteTaskSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });
  });

  describe('deleteTask Function', () => {
    it('should delete existing pending task', async () => {
      const task = await createTask('To Delete', 'Description');
      const result = await deleteTask({ taskId: task.id });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Deletion Result');
    });

    it('should not delete completed task', async () => {
      const task = await createTask('Completed Task', 'Description');
      
      // Mark as completed
      const { updateTask } = await import('../../../src/models/taskModel.js');
      await updateTask(task.id, { status: TaskStatus.COMPLETED });

      const result = await deleteTask({ taskId: task.id });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Operation Denied');
    });

    it('should handle non-existent task', async () => {
      const nonExistentId = generateTestUUID();
      const result = await deleteTask({ taskId: nonExistentId });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('System Error');
    });

    it('should delete in-progress task', async () => {
      const task = await createTask('In Progress Task', 'Description');
      
      // Mark as in progress
      const { updateTask } = await import('../../../src/models/taskModel.js');
      await updateTask(task.id, { status: TaskStatus.IN_PROGRESS });

      const result = await deleteTask({ taskId: task.id });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Deletion Result');
    });
  });
});
