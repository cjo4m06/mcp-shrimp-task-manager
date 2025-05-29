import { describe, it, expect, beforeEach, vi } from 'vitest';
import { planTask, planTaskSchema } from '../../../src/tools/task/planTask.js';
import { createTask } from '../../../src/models/taskModel.js';
import { getTestDataDir } from '../../helpers/testUtils.js';
import fs from 'fs';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

// Note: We don't mock the prompt loader to test real functionality

describe('planTask Tool', () => {

  describe('Schema Validation', () => {
    it('should validate correct input', () => {
      const validInput = {
        description: 'Create a new feature for user authentication',
        requirements: 'Must use JWT tokens and bcrypt for password hashing',
        existingTasksReference: false,
      };

      const result = planTaskSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject input with short description', () => {
      const invalidInput = {
        description: 'Short', // Less than 10 characters
      };

      const result = planTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('不能少於10個字符');
    });

    it('should accept optional fields', () => {
      const minimalInput = {
        description: 'This is a valid description with enough characters',
      };

      const result = planTaskSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.existingTasksReference).toBe(false); // Default value
      }
    });
  });

  describe('planTask Function', () => {
    it('should return planning guidance for new project', async () => {
      const input = {
        description: 'Build a task management system with TypeScript',
        requirements: 'Use Node.js, Express, and SQLite database',
        existingTasksReference: false,
      };

      const result = await planTask(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Analysis');
      expect(result.content[0].text).toContain('Build a task management system with TypeScript');
    });

    it('should include existing tasks when reference is enabled', async () => {
      // Create some existing tasks
      await createTask('Existing Task 1', 'First existing task');
      await createTask('Existing Task 2', 'Second existing task');

      const input = {
        description: 'Extend the existing system with new features',
        existingTasksReference: true,
      };

      const result = await planTask(input);

      expect(result.content[0].text).toContain('Existing Task References');
      expect(result.content[0].text).toContain('Existing Task 1');
      expect(result.content[0].text).toContain('Existing Task 2');
    });

    it('should handle empty task list gracefully', async () => {
      const input = {
        description: 'Start a completely new project from scratch',
        existingTasksReference: true,
      };

      const result = await planTask(input);

      expect(result.content[0].text).toContain('Task Analysis');
    });

    it('should include requirements in the output', async () => {
      const input = {
        description: 'Create a web application',
        requirements: 'Must be responsive and accessible',
        existingTasksReference: false,
      };

      const result = await planTask(input);

      expect(result.content[0].text).toContain('Must be responsive and accessible');
    });

    it('should format task information correctly', async () => {
      await createTask('Test Task', 'Test description', 'Test notes');

      const input = {
        description: 'Plan based on existing work',
        existingTasksReference: true,
      };

      const result = await planTask(input);
      const output = result.content[0].text;

      expect(output).toContain('Test Task');
      expect(output).toContain('Test description');
      // Note: notes are not included in the current prompt format
    });
  });

  describe('Error Handling', () => {
    it('should handle file system errors gracefully', async () => {
      // Mock fs to throw an error
      const originalReadFile = fs.promises.readFile;
      vi.spyOn(fs.promises, 'readFile').mockRejectedValueOnce(new Error('File system error'));

      const input = {
        description: 'Test error handling in plan task',
        existingTasksReference: true,
      };

      const result = await planTask(input);

      // Should still return a result, just without existing tasks
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');

      // Restore original function
      fs.promises.readFile = originalReadFile;
    });
  });
});
