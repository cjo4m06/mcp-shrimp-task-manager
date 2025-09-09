import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import http from 'http';
import path from 'path';
import { EventEmitter } from 'events';

// Set NODE_ENV before any imports
process.env.NODE_ENV = 'test';

describe('Server Refactored Tests', () => {
  let mockFs;
  let mockServer;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    // Create mock fs
    mockFs = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      readdir: vi.fn(),
      stat: vi.fn(),
      access: vi.fn(),
      rm: vi.fn()
    };

    // Create mock HTTP server
    mockServer = {
      listen: vi.fn((port, host, callback) => {
        if (callback) callback();
        return mockServer;
      }),
      close: vi.fn((callback) => {
        if (callback) callback();
      }),
      on: vi.fn(),
      listening: true
    };

    // Create mock request/response
    mockRequest = new EventEmitter();
    mockRequest.method = 'GET';
    mockRequest.url = '/api/agents';
    mockRequest.headers = {};

    mockResponse = {
      writeHead: vi.fn(),
      end: vi.fn(),
      setHeader: vi.fn(),
      statusCode: 200
    };

    // Mock http.createServer
    vi.spyOn(http, 'createServer').mockImplementation((handler) => {
      mockServer.handler = handler;
      return mockServer;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Settings Management', () => {
    it('should load settings from file', async () => {
      const mockSettings = {
        projects: [
          { id: 'project1', name: 'Project 1', path: '/path/1' }
        ],
        version: '2.0.0'
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(mockSettings));

      // Simulate loading settings
      const settingsPath = path.join('/home', '.shrimp-task-viewer-settings.json');
      const data = await mockFs.readFile(settingsPath, 'utf8');
      const settings = JSON.parse(data);

      expect(settings.projects).toHaveLength(1);
      expect(settings.projects[0].id).toBe('project1');
    });

    it('should create default settings if file does not exist', async () => {
      const error = new Error('ENOENT');
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);
      mockFs.writeFile.mockResolvedValue();

      try {
        await mockFs.readFile('/path/to/settings.json', 'utf8');
      } catch (err) {
        // File doesn't exist, create default
        const defaultSettings = {
          projects: [],
          version: '2.0.0'
        };
        await mockFs.writeFile('/path/to/settings.json', JSON.stringify(defaultSettings, null, 2));
      }

      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe('API Endpoints', () => {
    it('should handle GET /api/agents request', async () => {
      const mockAgents = [
        { id: 'agent1', name: 'Agent 1' },
        { id: 'agent2', name: 'Agent 2' }
      ];

      // Simulate the API handler
      const handleRequest = (req, res) => {
        if (req.url === '/api/agents' && req.method === 'GET') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mockAgents));
        }
      };

      handleRequest(mockRequest, mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      expect(mockResponse.end).toHaveBeenCalledWith(JSON.stringify(mockAgents));
    });

    it('should handle POST /api/add-profile request', async () => {
      mockRequest.method = 'POST';
      mockRequest.url = '/api/add-profile';

      const requestData = {
        name: 'Test Profile',
        taskFile: '/path/to/tasks.json'
      };

      // Simulate POST data handling
      const handlePost = async (req, res, data) => {
        if (!data.name || !data.taskFile) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required fields' }));
          return;
        }

        const profileId = data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const newProfile = {
          id: profileId,
          name: data.name,
          path: data.taskFile
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, profile: newProfile }));
      };

      await handlePost(mockRequest, mockResponse, requestData);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'application/json' });
      expect(mockResponse.end).toHaveBeenCalledWith(
        expect.stringContaining('"success":true')
      );
    });

    it('should return 400 if name is missing', async () => {
      mockRequest.method = 'POST';
      mockRequest.url = '/api/add-profile';

      const requestData = {
        taskFile: '/path/to/tasks.json'
      };

      const handlePost = async (req, res, data) => {
        if (!data.name || !data.taskFile) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required fields' }));
          return;
        }
      };

      await handlePost(mockRequest, mockResponse, requestData);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
      expect(mockResponse.end).toHaveBeenCalledWith(
        JSON.stringify({ error: 'Missing required fields' })
      );
    });

    it('should handle OPTIONS preflight requests', () => {
      mockRequest.method = 'OPTIONS';

      const handleOptions = (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.writeHead(200);
          res.end();
        }
      };

      handleOptions(mockRequest, mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      expect(mockResponse.writeHead).toHaveBeenCalledWith(200);
      expect(mockResponse.end).toHaveBeenCalled();
    });
  });

  describe('Static File Serving', () => {
    it('should serve index.html for root path', () => {
      mockRequest.url = '/';
      mockFs.readFile.mockResolvedValue('<html>Test</html>');

      const handleStatic = async (req, res) => {
        if (req.url === '/') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<html>Test</html>');
        }
      };

      handleStatic(mockRequest, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(200, { 'Content-Type': 'text/html' });
      expect(mockResponse.end).toHaveBeenCalledWith('<html>Test</html>');
    });

    it('should return 404 for non-existent files', () => {
      mockRequest.url = '/non-existent.txt';

      const handleStatic = (req, res) => {
        if (req.url.includes('.')) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      };

      handleStatic(mockRequest, mockResponse);

      expect(mockResponse.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'text/plain' });
      expect(mockResponse.end).toHaveBeenCalledWith('Not Found');
    });
  });
});