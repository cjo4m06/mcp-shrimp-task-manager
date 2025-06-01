import { describe, it, expect, beforeEach, vi } from 'vitest';
import { queryTask, queryTaskSchema } from '../../../src/tools/task/queryTask.js';
import { createTask } from '../../../src/models/taskModel.js';
import { getTestDataDir } from '../../helpers/testUtils.js';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

describe('queryTask Tool', () => {
  describe('queryTaskSchema', () => {
    it('should validate correct input with default values', () => {
      const validInput = { query: 'test' };
      const result = queryTaskSchema.safeParse(validInput);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe('test');
        expect(result.data.isId).toBe(false);
        expect(result.data.page).toBe(1);
        expect(result.data.pageSize).toBe(5);
      }
    });

    it('should validate input with all fields', () => {
      const validInput = {
        query: 'test query',
        isId: true,
        page: 2,
        pageSize: 10
      };
      const result = queryTaskSchema.safeParse(validInput);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.query).toBe('test query');
        expect(result.data.isId).toBe(true);
        expect(result.data.page).toBe(2);
        expect(result.data.pageSize).toBe(10);
      }
    });

    it('should reject empty query', () => {
      const invalidInput = { query: '' };
      const result = queryTaskSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });

    it('should reject missing query', () => {
      const invalidInput = {};
      const result = queryTaskSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });

    it('should reject invalid page size', () => {
      const invalidInput = { query: 'test', pageSize: 25 };
      const result = queryTaskSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });

    it('should reject zero page', () => {
      const invalidInput = { query: 'test', page: 0 };
      const result = queryTaskSchema.safeParse(invalidInput);
      
      expect(result.success).toBe(false);
    });
  });

  describe('queryTask Function', () => {
    it('should find tasks by name keyword', async () => {
      await createTask('Test Task One', 'Description 1');
      await createTask('Test Task Two', 'Description 2');
      await createTask('Different Task', 'Description 3');

      const result = await queryTask({ query: 'Test' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Query Results');
      expect(result.content[0].text).toContain('Test Task One');
      expect(result.content[0].text).toContain('Test Task Two');
      expect(result.content[0].text).not.toContain('Different Task');
    });

    it('should find tasks by description keyword', async () => {
      await createTask('Task One', 'Special description');
      await createTask('Task Two', 'Normal description');
      await createTask('Task Three', 'Another special description');

      const result = await queryTask({ query: 'special' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Query Results');
      expect(result.content[0].text).toContain('Task One');
      expect(result.content[0].text).toContain('Task Three');
      expect(result.content[0].text).not.toContain('Task Two');
    });

    it('should find task by ID when isId is true', async () => {
      const task = await createTask('Specific Task', 'Description');

      const result = await queryTask({
        query: task.id,
        isId: true
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Query Results');
      expect(result.content[0].text).toContain('Specific Task');
    });

    it('should handle pagination', async () => {
      // Create many tasks
      for (let i = 1; i <= 10; i++) {
        await createTask(`Task ${i}`, `Description ${i}`);
      }

      const result = await queryTask({
        query: 'Task',
        page: 1,
        pageSize: 3
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Query Results');
      expect(result.content[0].text).toContain('Current page: 1');
    });

    it('should handle no results', async () => {
      await createTask('Task One', 'Description');

      const result = await queryTask({ query: 'nonexistent' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('No Matching Results');
    });

    it('should handle multiple keywords', async () => {
      await createTask('Important Task', 'Urgent description');
      await createTask('Normal Task', 'Regular description');
      await createTask('Important Work', 'Urgent work');

      const result = await queryTask({ query: 'Important Urgent' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Query Results');
    });

    it('should handle case insensitive search', async () => {
      await createTask('UPPERCASE TASK', 'lowercase description');

      const result = await queryTask({ query: 'uppercase' });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Task Query Results');
      expect(result.content[0].text).toContain('UPPERCASE TASK');
    });
  });
});
