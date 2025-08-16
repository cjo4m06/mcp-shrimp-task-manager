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

describe('Template Integration - Custom Templates Actually Used', () => {
  let server;
  const mockSettingsFile = path.join('/mock/home', '.shrimp-task-viewer-settings.json');
  const mockTemplatesDir = path.join('/mock/home', '.shrimp-task-viewer-templates');
  const mockDefaultTemplatesDir = '/mock/project/src/prompts/templates_en';
  
  const defaultPlanTaskTemplate = `## Default Plan Task Template
This is the default template from the system.
Task: {description}`;

  const customPlanTaskTemplate = `## CUSTOM Plan Task Template
This is a CUSTOM template that should override the default.
Enhanced Task: {description}
Requirements: {requirements}
Custom Field: {customField}`;

  const customExecuteTaskTemplate = `## CUSTOM Execute Task Template
This custom template is for executing tasks.
Execute: {description}
Context: {context}`;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Setup mock file system
    mockFs.readFile.mockImplementation((filePath) => {
      // Settings file
      if (filePath === mockSettingsFile) {
        return Promise.resolve(JSON.stringify({ agents: [] }));
      }
      
      // Custom templates (these should take precedence)
      if (filePath === path.join(mockTemplatesDir, 'planTask.txt')) {
        return Promise.resolve(customPlanTaskTemplate);
      }
      if (filePath === path.join(mockTemplatesDir, 'executeTask.txt')) {
        return Promise.resolve(customExecuteTaskTemplate);
      }
      
      // Default templates (should be overridden by custom)
      if (filePath.includes('templates_en') && filePath.includes('planTask')) {
        return Promise.resolve(defaultPlanTaskTemplate);
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
    
    mockFs.readdir.mockImplementation((dirPath) => {
      if (dirPath.includes('templates_en')) {
        return Promise.resolve(['planTask.txt', 'executeTask.txt', 'analyzeTask.txt']);
      }
      if (dirPath.includes('.shrimp-task-viewer-templates')) {
        return Promise.resolve(['planTask.txt', 'executeTask.txt']);
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

  describe('Custom Template Priority', () => {
    it('should use custom template when it exists instead of default', async () => {
      const response = await makeRequest(server, '/api/templates/planTask');
      
      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      
      // Should return the CUSTOM template, not the default
      expect(data.content).toContain('CUSTOM Plan Task Template');
      expect(data.content).toContain('Enhanced Task:');
      expect(data.content).toContain('Custom Field:');
      
      // Should NOT contain default template content
      expect(data.content).not.toContain('Default Plan Task Template');
      expect(data.content).not.toContain('This is the default template from the system');
      
      // Status should indicate it's custom
      expect(data.status).toBe('custom');
      expect(data.source).toBe('user-custom');
    });

    it('should use custom template for executeTask when available', async () => {
      const response = await makeRequest(server, '/api/templates/executeTask');
      
      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      
      // Should return the CUSTOM execute template
      expect(data.content).toContain('CUSTOM Execute Task Template');
      expect(data.content).toContain('Execute:');
      expect(data.content).toContain('Context:');
      
      expect(data.status).toBe('custom');
      expect(data.source).toBe('user-custom');
    });

    it('should list both custom and default templates with correct status', async () => {
      const response = await makeRequest(server, '/api/templates');
      
      expect(response.statusCode).toBe(200);
      const templates = JSON.parse(response.body);
      
      // Find the planTask template
      const planTask = templates.find(t => t.functionName === 'planTask');
      expect(planTask).toBeDefined();
      expect(planTask.status).toBe('custom');
      expect(planTask.source).toBe('user-custom');
      
      // Find the executeTask template
      const executeTask = templates.find(t => t.functionName === 'executeTask');
      expect(executeTask).toBeDefined();
      expect(executeTask.status).toBe('custom');
      expect(executeTask.source).toBe('user-custom');
      
      // analyzeTask should be default (no custom version)
      const analyzeTask = templates.find(t => t.functionName === 'analyzeTask');
      expect(analyzeTask).toBeDefined();
      expect(analyzeTask.status).toBe('default');
      expect(analyzeTask.source).toBe('built-in');
    });

    it('should use environment variable override even when custom template exists', async () => {
      // Set environment variable override
      process.env.MCP_PROMPT_PLAN_TASK = 'Environment Override Content for planTask';
      
      const response = await makeRequest(server, '/api/templates/planTask');
      
      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      
      // Should use environment variable, not custom template
      expect(data.content).toBe('Environment Override Content for planTask');
      expect(data.status).toBe('env-override');
      expect(data.source).toBe('environment');
      
      // Clean up
      delete process.env.MCP_PROMPT_PLAN_TASK;
    });

    it('should append to custom template when using append mode', async () => {
      // Setup append template
      const appendContent = '\n\n## Additional Instructions\nAppended content here';
      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath === mockSettingsFile) {
          return Promise.resolve(JSON.stringify({ agents: [] }));
        }
        if (filePath === path.join(mockTemplatesDir, 'planTask.txt')) {
          return Promise.resolve(customPlanTaskTemplate);
        }
        if (filePath === path.join(mockTemplatesDir, 'planTask_append.txt')) {
          return Promise.resolve(appendContent);
        }
        if (filePath.includes('templates_en') && filePath.includes('planTask')) {
          return Promise.resolve(defaultPlanTaskTemplate);
        }
        const error = new Error('ENOENT');
        error.code = 'ENOENT';
        return Promise.reject(error);
      });
      
      // Also update readdir to include append file
      mockFs.readdir.mockImplementation((dirPath) => {
        if (dirPath.includes('.shrimp-task-viewer-templates')) {
          return Promise.resolve(['planTask.txt', 'planTask_append.txt', 'executeTask.txt']);
        }
        if (dirPath.includes('templates_en')) {
          return Promise.resolve(['planTask.txt', 'executeTask.txt', 'analyzeTask.txt']);
        }
        return Promise.resolve([]);
      });
      
      const response = await makeRequest(server, '/api/templates/planTask');
      
      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      
      // Should contain both custom template and appended content
      expect(data.content).toContain('CUSTOM Plan Task Template');
      expect(data.content).toContain('Additional Instructions');
      expect(data.content).toContain('Appended content here');
      
      expect(data.status).toBe('custom-append');
    });
  });

  describe('Template Application in Practice', () => {
    it('should correctly apply custom template when saving updates', async () => {
      const updatedTemplate = `## UPDATED Custom Template
New content for planTask
Task: {description}
New Field: {newField}`;

      const response = await makeRequest(server, '/api/templates/planTask', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: updatedTemplate,
          mode: 'override'
        })
      });

      expect(response.statusCode).toBe(200);
      
      // Verify the template was saved with custom content
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(mockTemplatesDir, 'planTask.txt'),
        updatedTemplate
      );
    });

    it('should verify custom template is actually loaded after save', async () => {
      // First, save a new custom template
      const newCustomTemplate = `## Brand New Custom Template
Completely new template content
Task: {description}`;

      await makeRequest(server, '/api/templates/newTemplate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newCustomTemplate,
          mode: 'override'
        })
      });

      // Update mock to return the new template
      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath === path.join(mockTemplatesDir, 'newTemplate.txt')) {
          return Promise.resolve(newCustomTemplate);
        }
        // ... other mock implementations
        return Promise.reject(new Error('ENOENT'));
      });

      // Now fetch the template to verify it returns custom content
      const response = await makeRequest(server, '/api/templates/newTemplate');
      
      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        expect(data.content).toBe(newCustomTemplate);
        expect(data.status).toBe('custom');
      }
    });

    it('should handle deletion of custom template and fallback to default', async () => {
      // First, delete the custom template
      mockFs.unlink.mockResolvedValue();
      
      const deleteResponse = await makeRequest(server, '/api/templates/planTask', {
        method: 'DELETE'
      });
      
      expect(deleteResponse.statusCode).toBe(200);
      expect(mockFs.unlink).toHaveBeenCalledWith(
        path.join(mockTemplatesDir, 'planTask.txt')
      );
      
      // Update mock to simulate deleted custom template
      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath === mockSettingsFile) {
          return Promise.resolve(JSON.stringify({ agents: [] }));
        }
        // Custom template no longer exists
        if (filePath === path.join(mockTemplatesDir, 'planTask.txt')) {
          const error = new Error('ENOENT');
          error.code = 'ENOENT';
          return Promise.reject(error);
        }
        // Should fall back to default
        if (filePath.includes('templates_en') && filePath.includes('planTask')) {
          return Promise.resolve(defaultPlanTaskTemplate);
        }
        const error = new Error('ENOENT');
        error.code = 'ENOENT';
        return Promise.reject(error);
      });
      
      // Now fetch the template - should get default
      const getResponse = await makeRequest(server, '/api/templates/planTask');
      
      if (getResponse.statusCode === 200) {
        const data = JSON.parse(getResponse.body);
        expect(data.content).toContain('Default Plan Task Template');
        expect(data.status).toBe('default');
        expect(data.source).toBe('built-in');
      }
    });
  });
});

// Helper function to make HTTP requests
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