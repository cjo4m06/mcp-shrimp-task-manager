import { describe, it, expect, beforeEach, vi } from 'vitest';
import { executeTask, executeTaskSchema } from '../../../src/tools/task/executeTask.js';
import { createTask, updateTask } from '../../../src/models/taskModel.js';
import { TaskStatus } from '../../../src/types/index.js';
import { getTestDataDir, generateTestUUID } from '../../helpers/testUtils.js';
import fs from 'fs';

// Mock dependencies
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

// Note: We don't mock prompts and file loader to test real functionality

describe('executeTask Tool', () => {

  describe('Schema Validation', () => {
    it('should validate correct UUID v4 format', () => {
      const validUUID = generateTestUUID();
      const result = executeTaskSchema.safeParse({ taskId: validUUID });
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const invalidInputs = [
        { taskId: 'not-a-uuid' },
        { taskId: '123' },
        { taskId: 'invalid-uuid-format' },
        { taskId: '' },
      ];

      invalidInputs.forEach(input => {
        const result = executeTaskSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });

    it('should reject missing taskId', () => {
      const result = executeTaskSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('executeTask Function', () => {
    it('should execute a pending task successfully', async () => {
      const task = await createTask('Execute Me', 'Task to be executed');
      
      const result = await executeTask({ taskId: task.id });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Execution');
      expect(result.content[0].text).toContain('Execute Me');
    });

    it('should handle task with dependencies', async () => {
      const parentTask = await createTask('Parent Task', 'Must be completed first');
      const childTask = await createTask('Child Task', 'Depends on parent', undefined, [parentTask.id]);

      const result = await executeTask({ taskId: childTask.id });

      expect(result.content[0].text).toContain('依賴任務');
      // Note: Parent task name is not shown in blocked message, only ID
    });

    it('should show task can be executed when dependencies are completed', async () => {
      const parentTask = await createTask('Parent Task', 'Completed dependency');
      await updateTask(parentTask.id, { status: TaskStatus.COMPLETED });
      
      const childTask = await createTask('Child Task', 'Ready to execute', undefined, [parentTask.id]);

      const result = await executeTask({ taskId: childTask.id });

      expect(result.content[0].text).toContain('Task Execution');
    });

    it('should include task complexity assessment', async () => {
      const complexDescription = 'A'.repeat(1500); // High complexity
      const task = await createTask('Complex Task', complexDescription);

      const result = await executeTask({ taskId: task.id });

      expect(result.content[0].text).toContain('複雜度');
    });

    it('should include implementation guide if available', async () => {
      const task = await createTask('Task with Guide', 'Description');
      await updateTask(task.id, { 
        implementationGuide: 'Step 1: Do this\nStep 2: Do that' 
      });

      const result = await executeTask({ taskId: task.id });

      expect(result.content[0].text).toContain('Implementation Guide');
      expect(result.content[0].text).toContain('Step 1: Do this');
    });

    it('should include verification criteria if available', async () => {
      const task = await createTask('Task with Criteria', 'Description');
      await updateTask(task.id, { 
        verificationCriteria: 'Test 1: Check this\nTest 2: Verify that' 
      });

      const result = await executeTask({ taskId: task.id });

      expect(result.content[0].text).toContain('Verification Criteria');
      expect(result.content[0].text).toContain('Test 1: Check this');
    });

    it('should include related files information', async () => {
      const task = await createTask('Task with Files', 'Description', undefined, [], [
        {
          path: 'src/test.ts',
          type: 'TO_MODIFY' as any,
          description: 'File to modify',
          lineStart: 1,
          lineEnd: 100,
        }
      ]);

      const result = await executeTask({ taskId: task.id });

      expect(result.content[0].text).toContain('Related Files');
      expect(result.content[0].text).toContain('src/test.ts');
    });

    it('should provide execution guidance', async () => {
      const task = await createTask('Status Update Test', 'Test status change');

      const result = await executeTask({ taskId: task.id });

      // Check if execution guidance is provided
      expect(result.content[0].text).toContain('Execution Steps');
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent task ID', async () => {
      const nonExistentId = generateTestUUID();
      
      const result = await executeTask({ taskId: nonExistentId });

      expect(result.content[0].text).toContain('找不到ID為');
    });

    it('should handle already completed task', async () => {
      const task = await createTask('Completed Task', 'Already done');
      await updateTask(task.id, { status: TaskStatus.COMPLETED });

      const result = await executeTask({ taskId: task.id });

      expect(result.content[0].text).toContain('無法執行');
    });

    it('should handle blocked task gracefully', async () => {
      const parentTask = await createTask('Blocking Task', 'Not completed');
      const blockedTask = await createTask('Blocked Task', 'Cannot execute', undefined, [parentTask.id]);

      const result = await executeTask({ taskId: blockedTask.id });

      expect(result.content[0].text).toContain('阻擋');
    });
  });
});
