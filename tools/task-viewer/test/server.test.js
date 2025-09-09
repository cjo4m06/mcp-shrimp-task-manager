import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import http from 'http';
import path from 'path';

// Set NODE_ENV to test to prevent server from auto-starting
process.env.NODE_ENV = 'test';

// Mock os module first
vi.mock('os', () => ({
  default: {
    homedir: () => '/mock/home',
    tmpdir: () => '/mock/tmp'
  }
}));

// Mock fs module - create promises interface that matches fs.promises
const mockFsPromises = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  access: vi.fn(),
  rm: vi.fn()
};

vi.mock('fs', () => {
  console.log('Setting up fs mock');
  
  return {
    default: {},
    promises: mockFsPromises
  };
});

// Import server after mocks are set up
const { startServer } = await import('../server.js');

describe('Server', () => {
  let server;
  const mockSettingsFile = path.join('/mock/home', '.shrimp-task-viewer-settings.json');
  const mockGlobalSettingsFile = path.join('/mock/home', '.shrimp-task-viewer-global-settings.json');
  const mockTempDir = '/mock/tmp/shrimp-task-viewer';
  
  beforeEach(() => {
    // Reset all mock functions and set up default implementations
    mockFsPromises.readFile.mockClear();
    mockFsPromises.writeFile.mockClear();
    mockFsPromises.mkdir.mockClear();
    mockFsPromises.readdir.mockClear();
    mockFsPromises.stat.mockClear();
    mockFsPromises.access.mockClear();
    mockFsPromises.rm.mockClear();

    // Set up default implementations
    mockFsPromises.readFile.mockImplementation((filePath, encoding) => {
      console.log('Mock fs.readFile called with:', filePath, encoding);
      if (filePath === mockSettingsFile) {
        return Promise.resolve(JSON.stringify({
          agents: [],
          projects: [],
          lastUpdated: new Date().toISOString(),
          version: '3.1.0'
        }));
      }
      if (filePath === mockGlobalSettingsFile) {
        return Promise.resolve(JSON.stringify({
          openAIKey: 'test-api-key',
          lastUpdated: new Date().toISOString()
        }));
      }
      const error = new Error('ENOENT: no such file or directory');
      error.code = 'ENOENT';
      return Promise.reject(error);
    });

    mockFsPromises.writeFile.mockImplementation((filePath, data) => {
      console.log('Mock fs.writeFile called with:', filePath);
      return Promise.resolve();
    });

    mockFsPromises.mkdir.mockImplementation(() => Promise.resolve());
    mockFsPromises.readdir.mockImplementation(() => Promise.resolve([]));
    mockFsPromises.stat.mockImplementation(() => Promise.resolve({ 
      isDirectory: () => false,
      isFile: () => true 
    }));
    mockFsPromises.access.mockImplementation(() => Promise.resolve());
    mockFsPromises.rm.mockImplementation(() => Promise.resolve());
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
      server = null;
    }
  });

  describe('Settings Management', () => {
    it('should load settings from file if exists', async () => {
      const mockAgents = [
        { id: 'agent1', name: 'Agent 1', path: '/path/to/agent1.json' },
        { id: 'agent2', name: 'Agent 2', path: '/path/to/agent2.json' }
      ];
      
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify({
        agents: mockAgents,
        lastUpdated: '2024-01-01T00:00:00.000Z',
        version: '2.0.0'
      }));

      // Start server to trigger loadSettings
      server = await startServer(0);
      
      expect(mockFsPromises.readFile).toHaveBeenCalledWith(mockSettingsFile, 'utf8');
    });

    it('should create default settings if file does not exist', async () => {
      const error = new Error('ENOENT: no such file or directory');
      error.code = 'ENOENT';
      mockFsPromises.readFile.mockRejectedValue(error);
      mockFsPromises.writeFile.mockResolvedValue();

      server = await startServer(0);

      expect(mockFsPromises.writeFile).toHaveBeenCalledWith(
        mockSettingsFile,
        expect.stringContaining('"agents": []')
      );
    });

    it('should save settings with proper format', async () => {
      const mockAgents = [
        { id: 'test-agent', name: 'Test Agent', path: '/test/path.json' }
      ];
      
      mockFsPromises.readFile.mockResolvedValue(JSON.stringify({ agents: [] }));
      mockFsPromises.writeFile.mockResolvedValue();
      mockFsPromises.mkdir.mockResolvedValue();

      server = await startServer(0);

      // Make request to add profile to trigger saveSettings
      const response = await makeRequest(server, '/api/add-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'name=Test+Agent&taskFile=' + encodeURIComponent('{"tasks":[]}')
      });

      expect(mockFsPromises.writeFile).toHaveBeenCalledWith(
        mockSettingsFile,
        expect.stringMatching(/"agents":\s*\[[\s\S]*\]/)
      );
    });
  });

  describe('API Endpoints', () => {
    beforeEach(async () => {
      mockFsPromises.readFile.mockImplementation((filePath) => {
        if (filePath === mockSettingsFile) {
          return Promise.resolve(JSON.stringify({
            agents: [
              { id: 'agent1', name: 'Agent 1', path: '/path/to/agent1.json' },
              { id: 'agent2', name: 'Agent 2', path: '/path/to/agent2.json' }
            ]
          }));
        } else if (filePath === '/path/to/agent1.json') {
          return Promise.resolve(JSON.stringify({
            tasks: [
              { id: '1', name: 'Task 1', status: 'pending' },
              { id: '2', name: 'Task 2', status: 'completed' }
            ]
          }));
        }
        return Promise.reject(new Error('File not found'));
      });
      
      mockFsPromises.writeFile.mockResolvedValue();
      mockFsPromises.mkdir.mockResolvedValue();
      
      server = await startServer(0);
    });

    describe('GET /api/agents', () => {
      it('should return list of agents', async () => {
        const response = await makeRequest(server, '/api/agents');
        const data = JSON.parse(response.body);

        expect(response.statusCode).toBe(200);
        expect(data).toHaveLength(2);
        expect(data[0]).toEqual({
          id: 'agent1',
          name: 'Agent 1',
          path: '/path/to/agent1.json'
        });
      });

      it('should include CORS headers', async () => {
        const response = await makeRequest(server, '/api/agents');
        
        expect(response.headers['access-control-allow-origin']).toBe('*');
        expect(response.headers['access-control-allow-methods']).toContain('GET');
      });
    });

    describe('POST /api/add-profile', () => {
      it('should add new profile with URL-encoded data', async () => {
        const response = await makeRequest(server, '/api/add-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'name=New+Agent&taskFile=' + encodeURIComponent('{"tasks":[]}')
        });

        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data).toMatchObject({
          id: 'new-agent',
          name: 'New Agent',
          path: expect.stringContaining('tasks.json')
        });

        expect(mockFsPromises.writeFile).toHaveBeenCalledWith(
          expect.stringContaining('tasks.json'),
          '{"tasks":[]}'
        );
      });

      it('should handle multipart form data', async () => {
        const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        const body = [
          `------${boundary}`,
          'Content-Disposition: form-data; name="name"',
          '',
          'Multipart Agent',
          `------${boundary}`,
          'Content-Disposition: form-data; name="taskFile"',
          '',
          '{"tasks":[{"id":"1","name":"Test"}]}',
          `------${boundary}--`
        ].join('\r\n');

        const response = await makeRequest(server, '/api/add-profile', {
          method: 'POST',
          headers: {
            'Content-Type': `multipart/form-data; boundary=----${boundary}`
          },
          body
        });

        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data.name).toBe('Multipart Agent');
      });

      it('should return 400 if name is missing', async () => {
        const response = await makeRequest(server, '/api/add-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'taskFile=' + encodeURIComponent('{"tasks":[]}')
        });

        expect(response.statusCode).toBe(400);
        expect(response.body).toBe('Missing name or taskFile');
      });

      it('should return 400 if taskFile is missing', async () => {
        const response = await makeRequest(server, '/api/add-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'name=Test+Agent'
        });

        expect(response.statusCode).toBe(400);
        expect(response.body).toBe('Missing name or taskFile');
      });

      it('should sanitize agent ID from name', async () => {
        const response = await makeRequest(server, '/api/add-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'name=Test+Agent+123!@%23&taskFile=' + encodeURIComponent('{"tasks":[]}')
        });

        const data = JSON.parse(response.body);
        expect(data.id).toBe('test-agent-123');
      });

      it('should update existing agent if ID matches', async () => {
        // First add an agent
        await makeRequest(server, '/api/add-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'name=Agent+1&taskFile=' + encodeURIComponent('{"tasks":[]}')
        });

        // Add again with same name (same ID)
        const response = await makeRequest(server, '/api/add-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'name=Agent+1&taskFile=' + encodeURIComponent('{"tasks":[{"id":"new"}]}')
        });

        expect(response.statusCode).toBe(200);
        // Should have updated, not added new
        expect(mockFsPromises.writeFile).toHaveBeenCalledWith(
          mockSettingsFile,
          expect.stringContaining('"agents": [')
        );
      });
    });

    describe('DELETE /api/remove-profile/:id', () => {
      it('should remove profile by ID', async () => {
        const response = await makeRequest(server, '/api/remove-profile/agent1', {
          method: 'DELETE'
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('Profile removed');
        
        expect(mockFsPromises.writeFile).toHaveBeenCalledWith(
          mockSettingsFile,
          expect.not.stringContaining('agent1')
        );
      });

      it('should handle non-existent profile gracefully', async () => {
        const response = await makeRequest(server, '/api/remove-profile/non-existent', {
          method: 'DELETE'
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toBe('Profile removed');
      });
    });

    describe('GET /api/tasks/:agentId', () => {
      it('should return tasks for valid agent', async () => {
        const response = await makeRequest(server, '/api/tasks/agent1');
        const data = JSON.parse(response.body);

        expect(response.statusCode).toBe(200);
        expect(data.tasks).toHaveLength(2);
        expect(data.tasks[0]).toEqual({
          id: '1',
          name: 'Task 1',
          status: 'pending'
        });
      });

      it('should return 404 for non-existent agent', async () => {
        const response = await makeRequest(server, '/api/tasks/non-existent');

        expect(response.statusCode).toBe(404);
        expect(response.body).toBe('Profile not found');
      });

      it('should include cache control headers', async () => {
        const response = await makeRequest(server, '/api/tasks/agent1');

        expect(response.headers['cache-control']).toBe('no-store, no-cache, must-revalidate');
        expect(response.headers['pragma']).toBe('no-cache');
        expect(response.headers['expires']).toBe('0');
      });

      it('should handle file read errors', async () => {
        mockFsPromises.readFile.mockImplementation((filePath) => {
          if (filePath === mockSettingsFile) {
            return Promise.resolve(JSON.stringify({
              agents: [{ id: 'agent-error', name: 'Error Agent', path: '/error/path.json' }]
            }));
          }
          return Promise.reject(new Error('File read error'));
        });

        const response = await makeRequest(server, '/api/tasks/agent-error');

        expect(response.statusCode).toBe(500);
        expect(response.body).toContain('Error reading task file');
      });
    });

    describe('OPTIONS requests', () => {
      it('should handle preflight requests', async () => {
        const response = await makeRequest(server, '/api/agents', {
          method: 'OPTIONS'
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers['access-control-allow-origin']).toBe('*');
        expect(response.headers['access-control-allow-methods']).toContain('GET');
        expect(response.headers['access-control-allow-methods']).toContain('POST');
        expect(response.headers['access-control-allow-methods']).toContain('DELETE');
      });
    });
  });

  describe('Static File Serving', () => {
    beforeEach(async () => {
      mockFsPromises.readFile.mockImplementation((filePath) => {
        if (filePath === mockSettingsFile) {
          return Promise.resolve(JSON.stringify({ agents: [] }));
        } else if (filePath.endsWith('index.html')) {
          return Promise.resolve('<html><body>React App</body></html>');
        } else if (filePath.endsWith('.js')) {
          return Promise.resolve('console.log("JS file");');
        } else if (filePath.endsWith('.css')) {
          return Promise.resolve('body { margin: 0; }');
        }
        const error = new Error('File not found');
        error.code = 'ENOENT';
        return Promise.reject(error);
      });
      
      server = await startServer(0);
    });

    it('should serve index.html for root path', async () => {
      const response = await makeRequest(server, '/');

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('text/html');
      expect(response.body).toContain('React App');
    });

    it('should serve static files with correct MIME types', async () => {
      const testCases = [
        { path: '/app.js', mimeType: 'application/javascript' },
        { path: '/styles.css', mimeType: 'text/css' },
        { path: '/index.html', mimeType: 'text/html' }
      ];

      for (const { path, mimeType } of testCases) {
        const response = await makeRequest(server, path);
        expect(response.headers['content-type']).toBe(mimeType);
      }
    });

    it('should set cache control headers for static assets', async () => {
      const response = await makeRequest(server, '/app.js');

      expect(response.headers['cache-control']).toBe('public, max-age=31536000');
    });

    it('should serve index.html for SPA routes', async () => {
      const response = await makeRequest(server, '/some/spa/route');

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('text/html');
      expect(response.body).toContain('React App');
    });

    it('should return 404 for non-existent files with extensions', async () => {
      const response = await makeRequest(server, '/non-existent.js');

      expect(response.statusCode).toBe(404);
      expect(response.body).toBe('File not found');
    });

    it('should handle missing dist directory', async () => {
      mockFsPromises.readFile.mockRejectedValue(new Error('ENOENT'));

      const response = await makeRequest(server, '/');

      expect(response.statusCode).toBe(404);
      expect(response.body).toBe('React app not built. Run: npm run build');
    });
  });

  describe('Error Handling', () => {
    it('should handle server startup errors', async () => {
      mockFsPromises.readFile.mockRejectedValue(new Error('Permission denied'));
      mockFsPromises.writeFile.mockRejectedValue(new Error('Permission denied'));

      await expect(startServer()).rejects.toThrow();
    });

    it('should handle malformed JSON in settings file', async () => {
      mockFsPromises.readFile.mockResolvedValue('{ invalid json }');
      mockFsPromises.writeFile.mockResolvedValue();

      server = await startServer(0);
      
      // Should create new settings file
      expect(mockFsPromises.writeFile).toHaveBeenCalledWith(
        mockSettingsFile,
        expect.stringContaining('"agents": []')
      );
    });
  });
});

// Helper function to make HTTP requests to the test server
function makeRequest(server, path, options = {}) {
  return new Promise((resolve) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk.toString());
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}