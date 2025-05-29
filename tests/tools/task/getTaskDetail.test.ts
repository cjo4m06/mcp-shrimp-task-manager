import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getTaskDetail, getTaskDetailSchema } from '../../../src/tools/task/getTaskDetail.js';
import { createTask } from '../../../src/models/taskModel.js';
import { getTestDataDir, generateTestUUID } from '../../helpers/testUtils.js';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

describe('getTaskDetail Tool', () => {
  describe('getTaskDetailSchema', () => {
    it('should validate correct input', () => {
      const validInput = { taskId: generateTestUUID() };
      const result = getTaskDetailSchema.safeParse(validInput);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.taskId).toBeDefined();
      }
    });

    it('should reject empty taskId', () => {
      const invalidInput = { taskId: '' };
      const result = getTaskDetailSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });

    it('should reject missing taskId', () => {
      const invalidInput = {};
      const result = getTaskDetailSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });
  });

  describe('getTaskDetail Function', () => {
    it('should return task details for existing task', async () => {
      const task = await createTask('Test Task', 'Test Description', 'Test Notes');

      const result = await getTaskDetail({ taskId: task.id });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Test Task');
      expect(result.content[0].text).toContain('Test Description');
      expect(result.content[0].text).toContain('Complete Task Details');
    });

    it('should handle non-existent task', async () => {
      const nonExistentId = generateTestUUID();
      const result = await getTaskDetail({ taskId: nonExistentId });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('找不到ID為');
      expect(result.content[0].text).toContain(nonExistentId);
    });

    it('should show task with dependencies', async () => {
      const parentTask = await createTask('Parent Task', 'Parent Description');
      const childTask = await createTask('Child Task', 'Child Description', undefined, [parentTask.id]);

      const result = await getTaskDetail({ taskId: childTask.id });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Child Task');
      expect(result.content[0].text).toContain('Complete Task Details');
    });

    it('should show task with related files', async () => {
      const task = await createTask('Task with Files', 'Description', undefined, [], [
        {
          path: 'src/test.ts',
          type: 'TO_MODIFY',
          description: 'Test file'
        }
      ]);

      const result = await getTaskDetail({ taskId: task.id });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task with Files');
      expect(result.content[0].text).toContain('Complete Task Details');
    });
  });
});
