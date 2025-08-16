import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import http from 'http';
import path from 'path';

// Mock os module first
vi.mock('os', () => ({
  default: {
    homedir: () => '/mock/home',
    tmpdir: () => '/mock/tmp'
  }
}));

// Mock fs module
const mockFs = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  unlink: vi.fn()
};

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    promises: mockFs,
    default: actual
  };
});

// Mock glob module
vi.mock('glob', () => ({
  glob: vi.fn()
}));

// Import server after mocks are set up
const { startServer } = await import('../server.js');

describe('Template API Endpoints', () => {
  let server;
  const mockSettingsFile = path.join('/mock/home', '.shrimp-task-viewer-settings.json');
  const mockTemplatesDir = path.join('/mock/home', '.shrimp-task-viewer-templates');
  const mockDefaultTemplatesDir = '/mock/project/src/prompts/templates_en';
  
  const mockDefaultTemplate = `## Task Analysis

You must analyze the following task:

{description}

Requirements: {requirements}`;

  const mockCustomTemplate = `## Custom Task Analysis

Custom implementation for:

{description}

With requirements: {requirements}

Additional context: {summary}`;

  beforeEach(async () => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Default settings
    mockFs.readFile.mockImplementation((filePath) => {
      if (filePath === mockSettingsFile) {
        return Promise.resolve(JSON.stringify({ agents: [] }));
      }
      
      // Default template files
      if (filePath.includes('planTask.txt')) {
        return Promise.resolve(mockDefaultTemplate);
      }
      
      // Custom template files
      if (filePath === path.join(mockTemplatesDir, 'planTask.txt')) {
        return Promise.resolve(mockCustomTemplate);
      }
      
      const error = new Error('ENOENT: no such file or directory');
      error.code = 'ENOENT';
      return Promise.reject(error);
    });
    
    mockFs.writeFile.mockResolvedValue();
    mockFs.mkdir.mockResolvedValue();
    mockFs.stat.mockImplementation((filePath) => {
      if (filePath.includes('templates_en') || filePath.includes('.shrimp-task-viewer-templates')) {
        return Promise.resolve({ isDirectory: () => true });
      }
      const error = new Error('ENOENT');
      error.code = 'ENOENT';
      return Promise.reject(error);
    });
    
    // Mock directory scanning
    mockFs.readdir.mockImplementation((dirPath) => {
      if (dirPath.includes('templates_en')) {
        return Promise.resolve(['planTask.txt', 'executeTask.txt', 'analyzeTask.txt']);
      }
      if (dirPath.includes('.shrimp-task-viewer-templates')) {
        return Promise.resolve(['planTask.txt']);
      }
      return Promise.resolve([]);
    });
    
    server = await startServer();
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
      server = null;
    }
  });

  describe('GET /api/templates', () => {
    it('should return list of all templates with status information', async () => {
      // Mock environment variables
      process.env.MCP_PROMPT_EXECUTE_TASK = 'Environment override content';
      
      const response = await makeRequest(server, '/api/templates');

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      
      // Check template structure
      const template = data.find(t => t.functionName === 'planTask');
      expect(template).toMatchObject({
        functionName: 'planTask',
        name: 'planTask',
        status: 'custom',
        source: 'user-custom',
        contentLength: expect.any(Number),
        category: expect.any(String)
      });
    });

    it('should detect environment overrides correctly', async () => {
      process.env.MCP_PROMPT_PLAN_TASK = 'Environment content';
      
      const response = await makeRequest(server, '/api/templates');
      const data = JSON.parse(response.body);
      
      const planTaskTemplate = data.find(t => t.functionName === 'planTask');
      expect(planTaskTemplate.status).toBe('env-override');
      expect(planTaskTemplate.source).toBe('environment');
    });

    it('should detect append mode from environment', async () => {
      process.env.MCP_PROMPT_APPEND_PLAN_TASK = 'Append content';
      
      const response = await makeRequest(server, '/api/templates');
      const data = JSON.parse(response.body);
      
      const planTaskTemplate = data.find(t => t.functionName === 'planTask');
      expect(planTaskTemplate.status).toBe('env-append');
      expect(planTaskTemplate.source).toBe('environment+built-in');
    });

    it('should handle empty template directories', async () => {
      mockFs.readdir.mockResolvedValue([]);
      
      const response = await makeRequest(server, '/api/templates');

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should handle directory read errors', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Permission denied'));
      
      const response = await makeRequest(server, '/api/templates');

      expect(response.statusCode).toBe(500);
      expect(response.body).toContain('Error loading templates');
    });
  });

  describe('GET /api/templates/:functionName', () => {
    it('should return specific template content', async () => {
      const response = await makeRequest(server, '/api/templates/planTask');

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      
      expect(data).toMatchObject({
        functionName: 'planTask',
        name: 'planTask',
        content: expect.stringContaining('Custom Task Analysis'),
        status: 'custom',
        source: 'user-custom'
      });
    });

    it('should return default template when no custom version exists', async () => {
      const response = await makeRequest(server, '/api/templates/executeTask');

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      
      expect(data.status).toBe('default');
      expect(data.source).toBe('built-in');
    });

    it('should return environment override when available', async () => {
      process.env.MCP_PROMPT_EXECUTE_TASK = 'Environment override content';
      
      const response = await makeRequest(server, '/api/templates/executeTask');
      const data = JSON.parse(response.body);
      
      expect(data.content).toBe('Environment override content');
      expect(data.status).toBe('env-override');
      expect(data.source).toBe('environment');
    });

    it('should return 404 for non-existent template', async () => {
      const response = await makeRequest(server, '/api/templates/nonExistentTemplate');

      expect(response.statusCode).toBe(404);
      expect(response.body).toBe('Template not found');
    });

    it('should handle file read errors', async () => {
      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath === mockSettingsFile) {
          return Promise.resolve(JSON.stringify({ agents: [] }));
        }
        return Promise.reject(new Error('File read error'));
      });
      
      const response = await makeRequest(server, '/api/templates/planTask');

      expect(response.statusCode).toBe(500);
      expect(response.body).toContain('Error loading template');
    });
  });

  describe('PUT /api/templates/:functionName', () => {
    it('should save template with override mode', async () => {
      const templateData = {
        content: '## Updated Template\n\n{description}',
        mode: 'override'
      };

      const response = await makeRequest(server, '/api/templates/planTask', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      expect(response.statusCode).toBe(200);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(mockTemplatesDir, 'planTask.txt'),
        templateData.content
      );
      
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });

    it('should save template with append mode', async () => {
      const templateData = {
        content: 'Additional content',
        mode: 'append'
      };

      const response = await makeRequest(server, '/api/templates/planTask', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      expect(response.statusCode).toBe(200);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(mockTemplatesDir, 'planTask_append.txt'),
        templateData.content
      );
    });

    it('should create templates directory if it does not exist', async () => {
      mockFs.stat.mockRejectedValue(new Error('ENOENT'));
      
      const templateData = {
        content: 'New template content',
        mode: 'override'
      };

      const response = await makeRequest(server, '/api/templates/newTemplate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      expect(response.statusCode).toBe(200);
      expect(mockFs.mkdir).toHaveBeenCalledWith(mockTemplatesDir, { recursive: true });
    });

    it('should validate required fields', async () => {
      const response = await makeRequest(server, '/api/templates/planTask', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing content and mode
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toContain('Content and mode are required');
    });

    it('should handle file write errors', async () => {
      mockFs.writeFile.mockRejectedValue(new Error('Permission denied'));
      
      const templateData = {
        content: 'Template content',
        mode: 'override'
      };

      const response = await makeRequest(server, '/api/templates/planTask', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      expect(response.statusCode).toBe(500);
      expect(response.body).toContain('Error saving template');
    });
  });

  describe('POST /api/templates/:functionName/duplicate', () => {
    it('should create duplicate template with new name', async () => {
      const duplicateData = {
        newName: 'planTaskCopy'
      };

      const response = await makeRequest(server, '/api/templates/planTask/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });

      expect(response.statusCode).toBe(200);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(mockTemplatesDir, 'planTaskCopy.txt'),
        mockCustomTemplate
      );

      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.newTemplate.functionName).toBe('planTaskCopy');
    });

    it('should validate new name', async () => {
      const response = await makeRequest(server, '/api/templates/planTask/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Missing newName
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toContain('New name is required');
    });

    it('should handle source template not found', async () => {
      const duplicateData = {
        newName: 'newTemplate'
      };

      const response = await makeRequest(server, '/api/templates/nonExistentTemplate/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });

      expect(response.statusCode).toBe(404);
      expect(response.body).toContain('Source template not found');
    });
  });

  describe('DELETE /api/templates/:functionName', () => {
    it('should delete custom template', async () => {
      mockFs.unlink.mockResolvedValue();
      
      const response = await makeRequest(server, '/api/templates/planTask', {
        method: 'DELETE'
      });

      expect(response.statusCode).toBe(200);
      expect(mockFs.unlink).toHaveBeenCalledWith(
        path.join(mockTemplatesDir, 'planTask.txt')
      );

      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
    });

    it('should delete append template', async () => {
      mockFs.unlink.mockResolvedValue();
      
      const response = await makeRequest(server, '/api/templates/planTask?mode=append', {
        method: 'DELETE'
      });

      expect(response.statusCode).toBe(200);
      expect(mockFs.unlink).toHaveBeenCalledWith(
        path.join(mockTemplatesDir, 'planTask_append.txt')
      );
    });

    it('should handle file not found during delete', async () => {
      const error = new Error('ENOENT');
      error.code = 'ENOENT';
      mockFs.unlink.mockRejectedValue(error);
      
      const response = await makeRequest(server, '/api/templates/planTask', {
        method: 'DELETE'
      });

      expect(response.statusCode).toBe(404);
      expect(response.body).toContain('Template file not found');
    });

    it('should handle delete errors', async () => {
      mockFs.unlink.mockRejectedValue(new Error('Permission denied'));
      
      const response = await makeRequest(server, '/api/templates/planTask', {
        method: 'DELETE'
      });

      expect(response.statusCode).toBe(500);
      expect(response.body).toContain('Error deleting template');
    });
  });

  describe('POST /api/templates/export', () => {
    beforeEach(() => {
      // Mock templates for export
      mockFs.readdir.mockImplementation((dirPath) => {
        if (dirPath.includes('templates_en')) {
          return Promise.resolve(['planTask.txt', 'executeTask.txt']);
        }
        if (dirPath.includes('.shrimp-task-viewer-templates')) {
          return Promise.resolve(['planTask.txt']);
        }
        return Promise.resolve([]);
      });
    });

    it('should export templates in .env format', async () => {
      const exportData = {
        format: 'env',
        customOnly: false,
        preview: true
      };

      const response = await makeRequest(server, '/api/templates/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      
      expect(data.content).toContain('MCP_PROMPT_PLAN_TASK=');
      expect(data.content).toContain('MCP_PROMPT_EXECUTE_TASK=');
      expect(data.filename).toBe('templates.env');
    });

    it('should export templates in mcp.json format', async () => {
      const exportData = {
        format: 'mcp.json',
        customOnly: false,
        preview: true
      };

      const response = await makeRequest(server, '/api/templates/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      
      const jsonContent = JSON.parse(data.content);
      expect(jsonContent).toHaveProperty('mcpServers');
      expect(jsonContent.mcpServers).toHaveProperty('shrimp-task-manager');
      expect(data.filename).toBe('mcp.json');
    });

    it('should export only custom templates when customOnly is true', async () => {
      const exportData = {
        format: 'env',
        customOnly: true,
        preview: true
      };

      const response = await makeRequest(server, '/api/templates/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      
      // Should only contain custom templates
      expect(data.content).toContain('MCP_PROMPT_PLAN_TASK=');
      expect(data.content).not.toContain('MCP_PROMPT_EXECUTE_TASK=');
    });

    it('should validate export format', async () => {
      const exportData = {
        format: 'invalid',
        customOnly: false,
        preview: true
      };

      const response = await makeRequest(server, '/api/templates/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toContain('Invalid export format');
    });

    it('should handle export errors', async () => {
      mockFs.readdir.mockRejectedValue(new Error('Permission denied'));
      
      const exportData = {
        format: 'env',
        customOnly: false,
        preview: true
      };

      const response = await makeRequest(server, '/api/templates/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportData)
      });

      expect(response.statusCode).toBe(500);
      expect(response.body).toContain('Error exporting templates');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON in requests', async () => {
      const response = await makeRequest(server, '/api/templates/planTask', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }'
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toContain('Invalid JSON');
    });

    it('should handle missing Content-Type header', async () => {
      const response = await makeRequest(server, '/api/templates/planTask', {
        method: 'PUT',
        body: JSON.stringify({ content: 'test', mode: 'override' })
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toContain('Content-Type must be application/json');
    });

    it('should handle very large template content', async () => {
      const largeContent = 'x'.repeat(100000);
      const templateData = {
        content: largeContent,
        mode: 'override'
      };

      const response = await makeRequest(server, '/api/templates/planTask', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      expect(response.statusCode).toBe(200);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        largeContent
      );
    });

    it('should sanitize template function names', async () => {
      const templateData = {
        content: 'Template content',
        mode: 'override'
      };

      const response = await makeRequest(server, '/api/templates/../../../etc/passwd', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      // Should sanitize the path and not create files outside templates directory
      expect(response.statusCode).toBe(200);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(mockTemplatesDir),
        templateData.content
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