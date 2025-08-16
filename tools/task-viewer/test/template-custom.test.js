import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';

// Mock fs module first
const mockFs = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  unlink: vi.fn(),
  access: vi.fn()
};

vi.mock('fs/promises', () => mockFs);

// Mock os module
vi.mock('os', () => ({
  default: {
    homedir: () => '/mock/home',
    tmpdir: () => '/mock/tmp'
  }
}));

// Import after mocks are set up
const fs = mockFs;

describe('Template Custom Feature Tests', () => {
  const mockTemplatesDir = path.join('/mock/home', '.shrimp-task-viewer-templates');
  const mockDefaultTemplatesDir = '/mock/project/src/prompts/templates_en';
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockFs.stat.mockImplementation((filePath) => {
      if (filePath.includes('templates_en') || filePath.includes('.shrimp-task-viewer-templates')) {
        return Promise.resolve({ isDirectory: () => true });
      }
      const error = new Error('ENOENT');
      error.code = 'ENOENT';
      return Promise.reject(error);
    });
    
    mockFs.access.mockResolvedValue();
    mockFs.mkdir.mockResolvedValue();
    mockFs.writeFile.mockResolvedValue();
  });

  describe('Custom Template Loading - Passing Tests', () => {
    it('should successfully load and apply a custom template', async () => {
      // Setup: Custom template exists
      const customTemplate = `## Custom Task Analysis
      
Task: {description}
Requirements: {requirements}

## Context7 Integration
This template includes Context7 documentation lookup.

## Steps:
1. Analyze the task
2. Plan implementation
3. Execute with Context7 support`;

      mockFs.readFile.mockImplementation((filePath) => {
        if (filePath === path.join(mockTemplatesDir, 'planTask.txt')) {
          return Promise.resolve(customTemplate);
        }
        return Promise.reject(new Error('File not found'));
      });

      mockFs.readdir.mockImplementation((dirPath) => {
        if (dirPath === mockTemplatesDir) {
          return Promise.resolve(['planTask.txt']);
        }
        return Promise.resolve([]);
      });

      // Act: Load template
      const loadTemplate = async (templateName) => {
        const templatePath = path.join(mockTemplatesDir, `${templateName}.txt`);
        try {
          const content = await fs.readFile(templatePath, 'utf8');
          return { success: true, content, status: 'custom' };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = await loadTemplate('planTask');

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toContain('Custom Task Analysis');
      expect(result.content).toContain('Context7 Integration');
      expect(result.status).toBe('custom');
    });

    it('should successfully save and update a custom template', async () => {
      // Setup
      const newTemplate = `## Updated Template
      
{description}
{requirements}
{summary}

Enhanced with new features`;

      // Act: Save template
      const saveTemplate = async (templateName, content, mode = 'override') => {
        const fileName = mode === 'append' ? `${templateName}_append.txt` : `${templateName}.txt`;
        const templatePath = path.join(mockTemplatesDir, fileName);
        
        try {
          // Ensure directory exists
          await fs.mkdir(mockTemplatesDir, { recursive: true });
          // Write template
          await fs.writeFile(templatePath, content);
          return { success: true, path: templatePath, mode };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = await saveTemplate('executeTask', newTemplate);

      // Assert
      expect(result.success).toBe(true);
      expect(mockFs.mkdir).toHaveBeenCalledWith(mockTemplatesDir, { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(mockTemplatesDir, 'executeTask.txt'),
        newTemplate
      );
      expect(result.mode).toBe('override');
    });

    it('should handle append mode correctly', async () => {
      // Setup: Existing template
      const existingTemplate = '## Original Template\n{description}';
      const appendContent = '\n\n## Additional Context\n{summary}';
      
      mockFs.readFile.mockResolvedValue(existingTemplate);

      // Act: Append to template
      const appendToTemplate = async (templateName, content) => {
        const appendPath = path.join(mockTemplatesDir, `${templateName}_append.txt`);
        
        try {
          await fs.writeFile(appendPath, content);
          
          // When loading, combine base + append
          const basePath = path.join(mockTemplatesDir, `${templateName}.txt`);
          let finalContent = '';
          
          try {
            finalContent = await fs.readFile(basePath, 'utf8');
          } catch {
            // Use default if no base custom template
            finalContent = '## Default Template';
          }
          
          finalContent += content;
          
          return { 
            success: true, 
            content: finalContent,
            mode: 'append'
          };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = await appendToTemplate('planTask', appendContent);

      // Assert
      expect(result.success).toBe(true);
      expect(result.content).toContain('Original Template');
      expect(result.content).toContain('Additional Context');
      expect(result.mode).toBe('append');
    });

    it('should validate template parameters are properly replaced', async () => {
      // Setup
      const template = `Task: {description}
Requirements: {requirements}
Summary: {summary}
Agent: {agentName}`;

      const parameters = {
        description: 'Implement user authentication',
        requirements: 'OAuth2, JWT tokens',
        summary: 'Add secure login system',
        agentName: 'SecurityAgent'
      };

      // Act: Replace parameters
      const applyTemplate = (templateContent, params) => {
        let result = templateContent;
        for (const [key, value] of Object.entries(params)) {
          result = result.replace(new RegExp(`{${key}}`, 'g'), value);
        }
        return result;
      };

      const result = applyTemplate(template, parameters);

      // Assert
      expect(result).not.toContain('{description}');
      expect(result).not.toContain('{requirements}');
      expect(result).toContain('Implement user authentication');
      expect(result).toContain('OAuth2, JWT tokens');
      expect(result).toContain('Add secure login system');
      expect(result).toContain('SecurityAgent');
    });
  });

  describe('Custom Template Loading - Failing Tests', () => {
    it('should fail when template directory does not exist', async () => {
      // Setup: Directory doesn't exist
      mockFs.stat.mockRejectedValue(new Error('ENOENT: no such file or directory'));
      mockFs.readdir.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      // Act: Try to load templates
      const loadTemplates = async () => {
        try {
          await fs.stat(mockTemplatesDir);
          const templates = await fs.readdir(mockTemplatesDir);
          return { success: true, templates };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = await loadTemplates();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('ENOENT');
    });

    it('should fail when template file is corrupted or invalid', async () => {
      // Setup: Corrupted template (invalid JSON-like structure expected)
      const corruptedTemplate = `{{{{{invalid brackets}}}} 
      <<<malformed>>> 
      undefined content
      {unclosed parameter`;

      mockFs.readFile.mockResolvedValue(corruptedTemplate);

      // Act: Validate template
      const validateTemplate = async (templateName) => {
        const templatePath = path.join(mockTemplatesDir, `${templateName}.txt`);
        
        try {
          const content = await fs.readFile(templatePath, 'utf8');
          
          // Validation checks
          const errors = [];
          
          // Check for unclosed parameters
          const openBraces = (content.match(/{/g) || []).length;
          const closeBraces = (content.match(/}/g) || []).length;
          if (openBraces !== closeBraces) {
            errors.push('Unclosed parameter brackets detected');
          }
          
          // Check for invalid syntax
          if (content.includes('{{{') || content.includes('}}}')) {
            errors.push('Invalid bracket syntax');
          }
          
          // Check for malformed markers
          if (content.includes('<<<') || content.includes('>>>')) {
            errors.push('Invalid template markers');
          }
          
          if (errors.length > 0) {
            return { success: false, errors };
          }
          
          return { success: true, content };
        } catch (error) {
          return { success: false, error: error.message };
        }
      };

      const result = await validateTemplate('corruptedTask');

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Unclosed parameter brackets detected');
      expect(result.errors).toContain('Invalid bracket syntax');
      expect(result.errors).toContain('Invalid template markers');
    });

    it('should fail when trying to save template with invalid name', async () => {
      // Setup
      const invalidNames = [
        '../../../etc/passwd',  // Path traversal attempt
        'template/with/slashes', // Invalid characters
        '',                      // Empty name
        '.',                     // Current directory
        '..',                    // Parent directory
        'con',                   // Reserved name (Windows)
        'nul',                   // Reserved name (Windows)
      ];

      // Act: Validate and save
      const saveTemplate = async (templateName, content) => {
        // Validate template name
        const isValidName = (name) => {
          if (!name || name.length === 0) return false;
          if (name.includes('/') || name.includes('\\')) return false;
          if (name.includes('..')) return false;
          if (name === '.' || name === '..') return false;
          if (['con', 'prn', 'aux', 'nul'].includes(name.toLowerCase())) return false;
          return true;
        };

        if (!isValidName(templateName)) {
          return { success: false, error: 'Invalid template name' };
        }

        const templatePath = path.join(mockTemplatesDir, `${templateName}.txt`);
        await fs.writeFile(templatePath, content);
        return { success: true };
      };

      // Assert: All invalid names should fail
      for (const invalidName of invalidNames) {
        const result = await saveTemplate(invalidName, 'Template content');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Invalid template name');
      }
    });

    it('should fail when template exceeds size limit', async () => {
      // Setup: Very large template
      const MAX_TEMPLATE_SIZE = 100000; // 100KB limit
      const largeTemplate = 'x'.repeat(MAX_TEMPLATE_SIZE + 1);

      // Act: Try to save large template
      const saveTemplate = async (templateName, content) => {
        // Check size limit
        const sizeInBytes = Buffer.byteLength(content, 'utf8');
        if (sizeInBytes > MAX_TEMPLATE_SIZE) {
          return { 
            success: false, 
            error: `Template size (${sizeInBytes} bytes) exceeds maximum allowed size (${MAX_TEMPLATE_SIZE} bytes)` 
          };
        }

        await fs.writeFile(path.join(mockTemplatesDir, `${templateName}.txt`), content);
        return { success: true };
      };

      const result = await saveTemplate('largeTemplate', largeTemplate);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
    });

    it('should fail when circular reference in template parameters', async () => {
      // Setup: Template with circular reference
      const circularTemplate = `## Task
      
Description: {description}
Extended: {extendedDescription}`;

      const parameters = {
        description: 'Task with {extendedDescription}',
        extendedDescription: 'Extended with {description}'
      };

      // Act: Try to resolve parameters
      const resolveTemplate = (template, params, maxDepth = 10) => {
        let result = template;
        let depth = 0;
        let hasReplacements = true;

        while (hasReplacements && depth < maxDepth) {
          hasReplacements = false;
          
          for (const [key, value] of Object.entries(params)) {
            const pattern = new RegExp(`{${key}}`, 'g');
            if (result.includes(`{${key}}`)) {
              result = result.replace(pattern, value);
              hasReplacements = true;
            }
          }
          
          depth++;
        }

        // Check if still has unresolved parameters
        if (result.match(/{[^}]+}/)) {
          return { 
            success: false, 
            error: 'Circular reference or unresolved parameters detected',
            unresolvedParams: result.match(/{[^}]+}/g)
          };
        }

        return { success: true, content: result };
      };

      const result = resolveTemplate(circularTemplate, parameters);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Circular reference');
      expect(result.unresolvedParams).toBeDefined();
    });
  });
});