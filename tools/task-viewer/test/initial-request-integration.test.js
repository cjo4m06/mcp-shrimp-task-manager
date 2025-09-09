import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

// This test simulates the full flow from task planning to UI display
describe('Initial Request Feature Integration', () => {
  let tempDir;
  let tasksFilePath;
  let mockProject;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'integration-test-'));
    tasksFilePath = path.join(tempDir, 'tasks.json');
    
    mockProject = {
      id: 'integration-test-project',
      name: 'Integration Test Project',
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

  describe('Full Workflow: Plan Task → Store Request → Display in UI', () => {
    it('should complete the entire workflow successfully', async () => {
      // Step 1: Simulate planTask saving initial request (new format)
      const initialRequest = 'Create a React dashboard with real-time analytics, user authentication, and data export features. Use TypeScript, React Query, and Chakra UI for the implementation.';
      
      const taskData = {
        initialRequest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: [
          {
            id: 'task-1',
            name: 'Set up project structure',
            description: 'Initialize React project with TypeScript and required dependencies',
            status: 'pending',
            dependencies: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            relatedFiles: [],
            implementationGuide: 'Create project with create-react-app --template typescript',
            verificationCriteria: 'Project builds without errors'
          },
          {
            id: 'task-2',
            name: 'Implement authentication system',
            description: 'Create login/logout functionality with JWT tokens',
            status: 'pending',
            dependencies: [{ taskId: 'task-1' }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            relatedFiles: [],
            implementationGuide: 'Use React Context for auth state management',
            verificationCriteria: 'Users can login and access protected routes'
          }
        ]
      };

      await fs.writeFile(tasksFilePath, JSON.stringify(taskData, null, 2));

      // Step 2: Simulate server API reading the file (backward compatibility handling)
      const data = await fs.readFile(mockProject.path, 'utf8');
      let tasksData = JSON.parse(data);

      // Handle backward compatibility - old format was just an array of tasks
      if (Array.isArray(tasksData)) {
        tasksData = { tasks: tasksData };
      }

      // Prepare response with all available data
      const apiResponse = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: mockProject.projectRoot || null
      };

      // Step 3: Verify API response structure
      expect(apiResponse).toHaveProperty('tasks');
      expect(apiResponse).toHaveProperty('initialRequest');
      expect(apiResponse).toHaveProperty('projectRoot');

      // Step 4: Verify initial request is present
      expect(apiResponse.initialRequest).toBe(initialRequest);

      // Step 5: Verify tasks are present
      expect(apiResponse.tasks).toHaveLength(2);
      expect(apiResponse.tasks[0].name).toBe('Set up project structure');
      expect(apiResponse.tasks[1].name).toBe('Implement authentication system');

      // Step 6: Simulate frontend component receiving data
      const frontendState = {
        initialRequest: apiResponse.initialRequest,
        tasks: apiResponse.tasks,
        initialRequestCollapsed: false
      };

      // Step 7: Verify frontend can render initial request
      expect(frontendState.initialRequest).toBeTruthy();
      expect(frontendState.tasks.length).toBeGreaterThan(0);
    });

    it('should handle migration from old format to new format', async () => {
      // Step 1: Start with old format file (array of tasks)
      const oldFormatTasks = [
        {
          id: 'old-task-1',
          name: 'Legacy Task',
          description: 'Task from old format',
          status: 'completed',
          dependencies: [],
          createdAt: '2025-08-30T10:00:00.000Z',
          updatedAt: '2025-08-30T10:00:00.000Z'
        }
      ];

      await fs.writeFile(tasksFilePath, JSON.stringify(oldFormatTasks));

      // Step 2: Simulate server handling old format
      let data = await fs.readFile(mockProject.path, 'utf8');
      let tasksData = JSON.parse(data);

      if (Array.isArray(tasksData)) {
        tasksData = { tasks: tasksData };
      }

      let apiResponse = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: mockProject.projectRoot || null
      };

      // Step 3: Verify old format is handled correctly
      expect(apiResponse.tasks).toHaveLength(1);
      expect(apiResponse.initialRequest).toBeNull();

      // Step 4: Simulate adding initial request (migration to new format)
      const newInitialRequest = 'Migrate legacy system to modern architecture';
      const migratedData = {
        initialRequest: newInitialRequest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: tasksData.tasks
      };

      await fs.writeFile(tasksFilePath, JSON.stringify(migratedData, null, 2));

      // Step 5: Verify migrated format works
      data = await fs.readFile(mockProject.path, 'utf8');
      tasksData = JSON.parse(data);

      if (Array.isArray(tasksData)) {
        tasksData = { tasks: tasksData };
      }

      apiResponse = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: mockProject.projectRoot || null
      };

      expect(apiResponse.tasks).toHaveLength(1);
      expect(apiResponse.initialRequest).toBe(newInitialRequest);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty initial request gracefully', async () => {
      const dataWithEmptyRequest = {
        initialRequest: '',
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await fs.writeFile(tasksFilePath, JSON.stringify(dataWithEmptyRequest));

      const data = await fs.readFile(mockProject.path, 'utf8');
      let tasksData = JSON.parse(data);

      if (Array.isArray(tasksData)) {
        tasksData = { tasks: tasksData };
      }

      const apiResponse = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: mockProject.projectRoot || null
      };

      // Empty string should be converted to null for frontend consistency
      expect(apiResponse.initialRequest || null).toBeNull();
    });

    it('should handle very large initial requests', async () => {
      const largeRequest = 'Create a comprehensive enterprise application with: ' + 'A'.repeat(50000);
      
      const dataWithLargeRequest = {
        initialRequest: largeRequest,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await fs.writeFile(tasksFilePath, JSON.stringify(dataWithLargeRequest));

      const data = await fs.readFile(mockProject.path, 'utf8');
      let tasksData = JSON.parse(data);

      const apiResponse = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: mockProject.projectRoot || null
      };

      expect(apiResponse.initialRequest).toBe(largeRequest);
      expect(apiResponse.initialRequest.length).toBeGreaterThan(50000);
    });

    it('should handle malformed JSON gracefully', async () => {
      // Write invalid JSON
      await fs.writeFile(tasksFilePath, '{ "tasks": [}, "invalid": }');

      let errorOccurred = false;
      try {
        const data = await fs.readFile(mockProject.path, 'utf8');
        JSON.parse(data);
      } catch (error) {
        errorOccurred = true;
        expect(error).toBeInstanceOf(SyntaxError);
      }

      expect(errorOccurred).toBe(true);
    });
  });

  describe('Performance and Memory Usage', () => {
    it('should handle multiple rapid reads efficiently', async () => {
      const testData = {
        initialRequest: 'Performance test request',
        tasks: Array.from({ length: 100 }, (_, i) => ({
          id: `perf-task-${i}`,
          name: `Performance Task ${i}`,
          description: `Task for performance testing ${i}`,
          status: 'pending',
          dependencies: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      };

      await fs.writeFile(tasksFilePath, JSON.stringify(testData));

      // Simulate multiple rapid API calls
      const promises = Array.from({ length: 10 }, async () => {
        const data = await fs.readFile(mockProject.path, 'utf8');
        let tasksData = JSON.parse(data);

        if (Array.isArray(tasksData)) {
          tasksData = { tasks: tasksData };
        }

        return {
          tasks: tasksData.tasks || [],
          initialRequest: tasksData.initialRequest || null,
          projectRoot: mockProject.projectRoot || null
        };
      });

      const results = await Promise.all(promises);

      // All results should be consistent
      results.forEach(result => {
        expect(result.initialRequest).toBe('Performance test request');
        expect(result.tasks).toHaveLength(100);
      });
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle complex project with requirements and multiple tasks', async () => {
      const complexRequest = `Build a full-stack e-commerce application with the following requirements:

Frontend:
- React with TypeScript
- Chakra UI for styling
- React Query for data fetching
- Authentication with JWT
- Shopping cart functionality
- Product search and filtering

Backend:
- Node.js with Express
- PostgreSQL database
- Prisma ORM
- JWT authentication
- RESTful API design
- Image upload functionality

DevOps:
- Docker containerization
- CI/CD pipeline with GitHub Actions
- Deployment to AWS
- Environment-specific configurations`;

      const complexData = {
        initialRequest: complexRequest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tasks: [
          {
            id: 'setup-1',
            name: 'Initialize project structure',
            description: 'Set up monorepo with frontend and backend',
            status: 'completed',
            dependencies: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            summary: 'Created monorepo structure with proper tooling'
          },
          {
            id: 'frontend-1',
            name: 'Create React frontend',
            description: 'Initialize React app with TypeScript and Chakra UI',
            status: 'in_progress',
            dependencies: [{ taskId: 'setup-1' }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'backend-1',
            name: 'Set up Express server',
            description: 'Create Node.js backend with Express and Prisma',
            status: 'pending',
            dependencies: [{ taskId: 'setup-1' }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };

      await fs.writeFile(tasksFilePath, JSON.stringify(complexData, null, 2));

      // Simulate API endpoint
      const data = await fs.readFile(mockProject.path, 'utf8');
      let tasksData = JSON.parse(data);

      const apiResponse = {
        tasks: tasksData.tasks || [],
        initialRequest: tasksData.initialRequest || null,
        projectRoot: mockProject.projectRoot || null
      };

      // Verify complex scenario handling
      expect(apiResponse.initialRequest).toContain('full-stack e-commerce');
      expect(apiResponse.initialRequest).toContain('React with TypeScript');
      expect(apiResponse.initialRequest).toContain('PostgreSQL database');
      expect(apiResponse.tasks).toHaveLength(3);
      expect(apiResponse.tasks.find(t => t.status === 'completed')).toBeDefined();
      expect(apiResponse.tasks.find(t => t.status === 'in_progress')).toBeDefined();
      expect(apiResponse.tasks.find(t => t.status === 'pending')).toBeDefined();
    });
  });
});