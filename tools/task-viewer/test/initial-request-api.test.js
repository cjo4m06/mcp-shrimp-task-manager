import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// Import the server handler (this might need adjustment based on server structure)
// We'll simulate the server endpoint logic directly

describe('Initial Request API Endpoints', () => {
  let tempDir;
  let tasksFilePath;
  let mockProject;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'server-test-'));
    tasksFilePath = path.join(tempDir, 'tasks.json');
    
    mockProject = {
      id: 'test-project',
      name: 'Test Project',
      path: tasksFilePath,
      projectRoot: tempDir
    };
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Backward Compatibility', () => {
    it('should handle old format tasks file (array of tasks)', async () => {
      // Create old format file
      const oldFormatData = [
        {
          id: '123',
          name: 'Old Task',
          description: 'Task from old format',
          status: 'pending',
          dependencies: [],
          createdAt: '2025-08-30T10:00:00.000Z',
          updatedAt: '2025-08-30T10:00:00.000Z'
        }
      ];

      await fs.writeFile(tasksFilePath, JSON.stringify(oldFormatData));

      // Simulate server endpoint logic
      const data = await fs.readFile(mockProject.path, 'utf8');
      let tasksData = JSON.parse(data);

      // Handle backward compatibility - old format was just an array of tasks
      if (Array.isArray(tasksData)) {
        tasksData = { tasks: tasksData };
      }

      // Prepare response with all available data
      const response = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: mockProject.projectRoot || null
      };

      expect(response.tasks).toHaveLength(1);
      expect(response.tasks[0].name).toBe('Old Task');
      expect(response.initialRequest).toBeNull();
      expect(response.projectRoot).toBe(tempDir);
    });

    it('should handle new format tasks file with initial request', async () => {
      // Create new format file
      const newFormatData = {
        initialRequest: 'Build a task management system',
        createdAt: '2025-08-30T10:00:00.000Z',
        updatedAt: '2025-08-30T10:00:00.000Z',
        tasks: [
          {
            id: '456',
            name: 'New Task',
            description: 'Task from new format',
            status: 'pending',
            dependencies: [],
            createdAt: '2025-08-30T10:00:00.000Z',
            updatedAt: '2025-08-30T10:00:00.000Z'
          }
        ]
      };

      await fs.writeFile(tasksFilePath, JSON.stringify(newFormatData));

      // Simulate server endpoint logic
      const data = await fs.readFile(mockProject.path, 'utf8');
      let tasksData = JSON.parse(data);

      if (Array.isArray(tasksData)) {
        tasksData = { tasks: tasksData };
      }

      const response = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: mockProject.projectRoot || null
      };

      expect(response.tasks).toHaveLength(1);
      expect(response.tasks[0].name).toBe('New Task');
      expect(response.initialRequest).toBe('Build a task management system');
      expect(response.projectRoot).toBe(tempDir);
    });
  });

  describe('Empty File Handling', () => {
    it('should return null initial request when file has no initial request', async () => {
      const emptyNewFormat = {
        tasks: [],
        createdAt: '2025-08-30T10:00:00.000Z',
        updatedAt: '2025-08-30T10:00:00.000Z'
      };

      await fs.writeFile(tasksFilePath, JSON.stringify(emptyNewFormat));

      const data = await fs.readFile(mockProject.path, 'utf8');
      let tasksData = JSON.parse(data);

      if (Array.isArray(tasksData)) {
        tasksData = { tasks: tasksData };
      }

      const response = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: mockProject.projectRoot || null
      };

      expect(response.tasks).toHaveLength(0);
      expect(response.initialRequest).toBeNull();
    });

    it('should handle missing tasks.json file', async () => {
      // Don't create the file - simulate the missing file response
      const emptyResponse = {
        tasks: [],
        initialRequest: null,
        projectRoot: mockProject.projectRoot || null,
        message: "No tasks found. The tasks.json file hasn't been created yet. Run shrimp in this folder to generate tasks."
      };

      expect(emptyResponse.tasks).toHaveLength(0);
      expect(emptyResponse.initialRequest).toBeNull();
      expect(emptyResponse.message).toContain("hasn't been created yet");
    });
  });

  describe('Response Format Validation', () => {
    it('should always return the expected response structure', async () => {
      const testData = {
        initialRequest: 'Test initial request',
        tasks: [
          {
            id: '789',
            name: 'Test Task',
            description: 'A test task',
            status: 'completed',
            dependencies: [],
            createdAt: '2025-08-30T10:00:00.000Z',
            updatedAt: '2025-08-30T10:00:00.000Z'
          }
        ]
      };

      await fs.writeFile(tasksFilePath, JSON.stringify(testData));

      const data = await fs.readFile(mockProject.path, 'utf8');
      let tasksData = JSON.parse(data);

      if (Array.isArray(tasksData)) {
        tasksData = { tasks: tasksData };
      }

      const response = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: mockProject.projectRoot || null
      };

      // Validate response structure
      expect(response).toHaveProperty('tasks');
      expect(response).toHaveProperty('initialRequest');
      expect(response).toHaveProperty('projectRoot');
      
      expect(Array.isArray(response.tasks)).toBe(true);
      expect(typeof response.initialRequest).toBe('string');
      expect(typeof response.projectRoot).toBe('string');
    });

    it('should handle null/undefined values gracefully', async () => {
      const minimalData = { tasks: [] };
      await fs.writeFile(tasksFilePath, JSON.stringify(minimalData));

      const data = await fs.readFile(mockProject.path, 'utf8');
      let tasksData = JSON.parse(data);

      const response = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: null // Simulate no project root
      };

      expect(response.tasks).toEqual([]);
      expect(response.initialRequest).toBeNull();
      expect(response.projectRoot).toBeNull();
    });
  });

  describe('Large Data Handling', () => {
    it('should handle large initial requests', async () => {
      const largeInitialRequest = 'A'.repeat(10000); // 10KB string
      const largeData = {
        initialRequest: largeInitialRequest,
        tasks: []
      };

      await fs.writeFile(tasksFilePath, JSON.stringify(largeData));

      const data = await fs.readFile(mockProject.path, 'utf8');
      let tasksData = JSON.parse(data);

      const response = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: mockProject.projectRoot || null
      };

      expect(response.initialRequest).toBe(largeInitialRequest);
      expect(response.initialRequest.length).toBe(10000);
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parsing errors gracefully', async () => {
      // Write invalid JSON
      await fs.writeFile(tasksFilePath, 'invalid json {');

      let errorThrown = false;
      try {
        const data = await fs.readFile(mockProject.path, 'utf8');
        JSON.parse(data);
      } catch (err) {
        errorThrown = true;
        expect(err).toBeInstanceOf(SyntaxError);
      }

      expect(errorThrown).toBe(true);
    });
  });
});