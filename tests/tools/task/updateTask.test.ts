import { describe, it, expect, beforeEach, vi } from 'vitest';
import { updateTaskContent, updateTaskContentSchema } from '../../../src/tools/task/updateTask.js';
import { createTask } from '../../../src/models/taskModel.js';
import { TaskStatus } from '../../../src/types/index.js';
import { getTestDataDir, generateTestUUID } from '../../helpers/testUtils.js';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

describe('updateTaskContent Tool', () => {
  describe('updateTaskContentSchema', () => {
    it('should validate correct input with all fields', () => {
      const validInput = {
        taskId: generateTestUUID(),
        name: 'Updated Task',
        description: 'Updated Description',
        notes: 'Updated Notes',
        dependencies: [generateTestUUID()],
        relatedFiles: [{
          path: 'src/test.ts',
          type: 'TO_MODIFY',
          description: 'Test file'
        }],
        implementationGuide: 'Updated Guide',
        verificationCriteria: 'Updated Criteria'
      };
      const result = updateTaskContentSchema.safeParse(validInput);
      
      expect(result.success).toBe(true);
    });

    it('should validate input with only taskId', () => {
      const validInput = { taskId: generateTestUUID() };
      const result = updateTaskContentSchema.safeParse(validInput);

      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const invalidInput = { taskId: 'invalid-uuid' };
      const result = updateTaskContentSchema.safeParse(invalidInput);

      expect(result.success).toBe(false);
    });

    it('should reject missing taskId', () => {
      const invalidInput = { name: 'Test' };
      const result = updateTaskContentSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskContent Function', () => {
    it('should update task name', async () => {
      const task = await createTask('Original Task', 'Original Description');
      const result = await updateTaskContent({
        taskId: task.id,
        name: 'Updated Task'
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Update Result');
      expect(result.content[0].text).toContain('Updated Task');
    });

    it('should update task description', async () => {
      const task = await createTask('Test Task', 'Original Description');
      const result = await updateTaskContent({
        taskId: task.id,
        description: 'Updated Description'
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Update Result');
      expect(result.content[0].text).toContain('Updated Description');
    });

    it('should update task notes', async () => {
      const task = await createTask('Test Task', 'Description', 'Original Notes');
      const result = await updateTaskContent({
        taskId: task.id,
        notes: 'Updated Notes'
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Update Result');
    });

    it('should update task dependencies', async () => {
      const parentTask = await createTask('Parent Task', 'Parent Description');
      const childTask = await createTask('Child Task', 'Child Description');

      const result = await updateTaskContent({
        taskId: childTask.id,
        dependencies: [parentTask.id]
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Update Result');
    });

    it('should update task related files', async () => {
      const task = await createTask('Test Task', 'Description');
      const result = await updateTaskContent({
        taskId: task.id,
        relatedFiles: [{
          path: 'src/updated.ts',
          type: 'TO_MODIFY',
          description: 'Updated file'
        }]
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Update Result');
    });

    it('should handle non-existent task', async () => {
      const nonExistentId = generateTestUUID();
      const result = await updateTaskContent({
        taskId: nonExistentId,
        name: 'Updated Name'
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('System Error');
    });

    it('should update multiple fields at once', async () => {
      const task = await createTask('Original Task', 'Original Description');
      const result = await updateTaskContent({
        taskId: task.id,
        name: 'Updated Task',
        description: 'Updated Description',
        notes: 'Updated Notes'
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Update Result');
      expect(result.content[0].text).toContain('Updated Task');
      expect(result.content[0].text).toContain('Updated Description');
    });
  });
});
