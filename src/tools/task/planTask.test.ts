import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { planTask } from './planTask.js';
import { getInitialRequest, getTasksData } from '../../models/taskModel.js';

// Mock the paths module
vi.mock('../../utils/paths.js', () => ({
  getDataDir: vi.fn(),
  getTasksFilePath: vi.fn(),
  getMemoryDir: vi.fn()
}));

// Mock the prompts module
vi.mock('../../prompts/index.js', () => ({
  getPlanTaskPrompt: vi.fn().mockResolvedValue('Mock prompt response')
}));

describe('PlanTask Initial Request Saving', () => {
  let tempDir: string;
  let tasksFilePath: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'plan-task-test-'));
    tasksFilePath = path.join(tempDir, 'tasks.json');

    // Mock the path functions
    const { getDataDir, getTasksFilePath, getMemoryDir } = await import('../../utils/paths.js');
    vi.mocked(getDataDir).mockResolvedValue(tempDir);
    vi.mocked(getTasksFilePath).mockResolvedValue(tasksFilePath);
    vi.mocked(getMemoryDir).mockResolvedValue(path.join(tempDir, 'memory'));
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('New Task Planning (existingTasksReference = false)', () => {
    it('should save initial request for new task planning', async () => {
      const description = 'Create a React dashboard with charts and analytics';
      const requirements = 'Use TypeScript, React Query, and Chakra UI';

      await planTask({
        description,
        requirements,
        existingTasksReference: false
      });

      const savedRequest = await getInitialRequest();
      const expectedRequest = `${description}\n\n要求: ${requirements}`;
      
      expect(savedRequest).toBe(expectedRequest);
    });

    it('should save initial request without requirements', async () => {
      const description = 'Build a simple blog website';

      await planTask({
        description,
        existingTasksReference: false
      });

      const savedRequest = await getInitialRequest();
      
      expect(savedRequest).toBe(description);
    });

    it('should save initial request even if task file does not exist', async () => {
      const description = 'Create a mobile app for task management';

      await planTask({
        description,
        existingTasksReference: false
      });

      const savedRequest = await getInitialRequest();
      
      expect(savedRequest).toBe(description);
    });
  });

  describe('Existing Task Reference (existingTasksReference = true)', () => {
    it('should NOT save initial request when referencing existing tasks', async () => {
      // First, set an initial request
      const originalRequest = 'Original task planning request';
      await fs.writeFile(tasksFilePath, JSON.stringify({
        initialRequest: originalRequest,
        tasks: []
      }));

      const description = 'Update the existing dashboard component';
      
      await planTask({
        description,
        existingTasksReference: true
      });

      const savedRequest = await getInitialRequest();
      
      // Should still have the original request, not the new description
      expect(savedRequest).toBe(originalRequest);
    });

    it('should preserve existing tasks when existingTasksReference is true', async () => {
      const existingTasksData = {
        initialRequest: 'Build a web app',
        tasks: [
          {
            id: '1',
            name: 'Existing Task',
            description: 'Pre-existing task',
            status: 'completed',
            dependencies: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };

      await fs.writeFile(tasksFilePath, JSON.stringify(existingTasksData));

      await planTask({
        description: 'Add new feature',
        existingTasksReference: true
      });

      const tasksData = await getTasksData();
      
      expect(tasksData.initialRequest).toBe('Build a web app');
      expect(tasksData.tasks).toHaveLength(1);
    });
  });

  describe('Error Handling', () => {
    it('should continue planning even if initial request saving fails', async () => {
      // Mock setInitialRequest to throw an error
      vi.doMock('../../models/taskModel.js', () => ({
        ...vi.importActual('../../models/taskModel.js'),
        setInitialRequest: vi.fn().mockRejectedValue(new Error('Save failed'))
      }));

      const description = 'Create a failing test scenario';
      
      // Should not throw error
      const result = await planTask({
        description,
        existingTasksReference: false
      });

      // Should still return prompt content
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('Request Formatting', () => {
    it('should format request with requirements correctly', async () => {
      const description = 'Build an API';
      const requirements = 'Use Node.js and Express, implement JWT auth';

      await planTask({
        description,
        requirements,
        existingTasksReference: false
      });

      const savedRequest = await getInitialRequest();
      
      expect(savedRequest).toContain(description);
      expect(savedRequest).toContain('要求: ');
      expect(savedRequest).toContain(requirements);
    });

    it('should handle empty requirements', async () => {
      const description = 'Simple task';

      await planTask({
        description,
        requirements: '',
        existingTasksReference: false
      });

      const savedRequest = await getInitialRequest();
      
      expect(savedRequest).toBe(description);
      expect(savedRequest).not.toContain('要求:');
    });

    it('should handle undefined requirements', async () => {
      const description = 'Another simple task';

      await planTask({
        description,
        existingTasksReference: false
      });

      const savedRequest = await getInitialRequest();
      
      expect(savedRequest).toBe(description);
    });
  });
});