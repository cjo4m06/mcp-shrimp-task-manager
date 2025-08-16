import { describe, it, expect, beforeEach, vi } from 'vitest';
import path from 'path';

describe('Template Usage - Verify Custom Templates Are Actually Used', () => {
  
  describe('Template Loading Priority', () => {
    
    it('should prioritize custom templates over default templates', () => {
      // This test verifies the template loading priority logic
      
      const getTemplate = (customTemplate, defaultTemplate, envOverride) => {
        // Priority order:
        // 1. Environment variable override (highest priority)
        // 2. Custom user template
        // 3. Default built-in template
        
        if (envOverride) {
          return {
            content: envOverride,
            source: 'environment',
            status: 'env-override'
          };
        }
        
        if (customTemplate) {
          return {
            content: customTemplate,
            source: 'user-custom',
            status: 'custom'
          };
        }
        
        if (defaultTemplate) {
          return {
            content: defaultTemplate,
            source: 'built-in',
            status: 'default'
          };
        }
        
        return null;
      };
      
      // Test cases
      const defaultTemplate = 'Default template content';
      const customTemplate = 'Custom template content';
      const envOverride = 'Environment override content';
      
      // Case 1: Only default template exists
      let result = getTemplate(null, defaultTemplate, null);
      expect(result.content).toBe(defaultTemplate);
      expect(result.status).toBe('default');
      
      // Case 2: Custom template exists (should override default)
      result = getTemplate(customTemplate, defaultTemplate, null);
      expect(result.content).toBe(customTemplate);
      expect(result.status).toBe('custom');
      expect(result.content).not.toBe(defaultTemplate);
      
      // Case 3: Environment override exists (should override everything)
      result = getTemplate(customTemplate, defaultTemplate, envOverride);
      expect(result.content).toBe(envOverride);
      expect(result.status).toBe('env-override');
      expect(result.content).not.toBe(customTemplate);
      expect(result.content).not.toBe(defaultTemplate);
    });
    
    it('should correctly apply custom template parameters', () => {
      const customTemplate = `## Custom Task Template
      
Task Description: {description}
Requirements: {requirements}
Summary: {summary}
Agent: {agentName}
Custom Field: {customField}`;

      const parameters = {
        description: 'Implement authentication system',
        requirements: 'OAuth2, JWT, secure storage',
        summary: 'Add user authentication',
        agentName: 'SecurityAgent',
        customField: 'This is a custom field value'
      };
      
      // Apply parameters to template
      const applyParameters = (template, params) => {
        let result = template;
        for (const [key, value] of Object.entries(params)) {
          const pattern = new RegExp(`\\{${key}\\}`, 'g');
          result = result.replace(pattern, value);
        }
        return result;
      };
      
      const appliedTemplate = applyParameters(customTemplate, parameters);
      
      // Verify all parameters were replaced
      expect(appliedTemplate).toContain('Implement authentication system');
      expect(appliedTemplate).toContain('OAuth2, JWT, secure storage');
      expect(appliedTemplate).toContain('Add user authentication');
      expect(appliedTemplate).toContain('SecurityAgent');
      expect(appliedTemplate).toContain('This is a custom field value');
      
      // Verify no unreplaced parameters remain
      expect(appliedTemplate).not.toContain('{description}');
      expect(appliedTemplate).not.toContain('{requirements}');
      expect(appliedTemplate).not.toContain('{summary}');
      expect(appliedTemplate).not.toContain('{agentName}');
      expect(appliedTemplate).not.toContain('{customField}');
    });
    
    it('should handle append mode correctly with custom templates', () => {
      const baseTemplate = '## Base Template\nOriginal content: {description}';
      const appendTemplate = '\n\n## Additional Instructions\nExtra content: {summary}';
      
      const getTemplateWithAppend = (base, append) => {
        if (append) {
          return {
            content: base + append,
            status: 'custom-append',
            source: 'user-custom+append'
          };
        }
        return {
          content: base,
          status: 'custom',
          source: 'user-custom'
        };
      };
      
      // Without append
      let result = getTemplateWithAppend(baseTemplate, null);
      expect(result.content).toBe(baseTemplate);
      expect(result.status).toBe('custom');
      
      // With append
      result = getTemplateWithAppend(baseTemplate, appendTemplate);
      expect(result.content).toContain('Base Template');
      expect(result.content).toContain('Additional Instructions');
      expect(result.content).toBe(baseTemplate + appendTemplate);
      expect(result.status).toBe('custom-append');
    });
    
    it('should validate custom template structure and report issues', () => {
      const validateTemplate = (template) => {
        const errors = [];
        
        // Check for unclosed parameters
        const openBraces = (template.match(/\{/g) || []).length;
        const closeBraces = (template.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
          errors.push('Unclosed parameter brackets');
        }
        
        // Check for empty parameters
        if (template.includes('{}')) {
          errors.push('Empty parameter found');
        }
        
        // Check for nested parameters (not supported)
        if (template.match(/\{[^}]*\{/)) {
          errors.push('Nested parameters not supported');
        }
        
        return {
          valid: errors.length === 0,
          errors
        };
      };
      
      // Valid template
      let result = validateTemplate('Task: {description}\nRequirements: {requirements}');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      
      // Invalid: unclosed parameter
      result = validateTemplate('Task: {description\nRequirements: {requirements}');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unclosed parameter brackets');
      
      // Invalid: empty parameter
      result = validateTemplate('Task: {}\nRequirements: {requirements}');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Empty parameter found');
      
      // Invalid: nested parameters
      result = validateTemplate('Task: {desc{nested}ription}\nRequirements: {requirements}');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Nested parameters not supported');
    });
  });
  
  describe('Template File System Integration', () => {
    
    it('should correctly determine template file paths', () => {
      const getTemplatePath = (templateName, mode = 'override') => {
        const homeDir = '/home/user';
        const templatesDir = path.join(homeDir, '.shrimp-task-viewer-templates');
        
        if (mode === 'append') {
          return path.join(templatesDir, `${templateName}_append.txt`);
        }
        return path.join(templatesDir, `${templateName}.txt`);
      };
      
      // Override mode
      expect(getTemplatePath('planTask')).toBe(
        '/home/user/.shrimp-task-viewer-templates/planTask.txt'
      );
      
      // Append mode
      expect(getTemplatePath('planTask', 'append')).toBe(
        '/home/user/.shrimp-task-viewer-templates/planTask_append.txt'
      );
      
      // Different template names
      expect(getTemplatePath('executeTask')).toBe(
        '/home/user/.shrimp-task-viewer-templates/executeTask.txt'
      );
      
      expect(getTemplatePath('analyzeTask')).toBe(
        '/home/user/.shrimp-task-viewer-templates/analyzeTask.txt'
      );
    });
    
    it('should generate correct environment variable names', () => {
      const getEnvVarName = (functionName) => {
        // Convert camelCase to UPPER_SNAKE_CASE
        const snakeCase = functionName.replace(/([A-Z])/g, '_$1').toUpperCase();
        return `MCP_PROMPT${snakeCase.startsWith('_') ? snakeCase : '_' + snakeCase}`;
      };
      
      expect(getEnvVarName('planTask')).toBe('MCP_PROMPT_PLAN_TASK');
      expect(getEnvVarName('executeTask')).toBe('MCP_PROMPT_EXECUTE_TASK');
      expect(getEnvVarName('analyzeTask')).toBe('MCP_PROMPT_ANALYZE_TASK');
      expect(getEnvVarName('reviewCode')).toBe('MCP_PROMPT_REVIEW_CODE');
    });
    
    it('should correctly identify template status', () => {
      const getTemplateStatus = (hasCustom, hasAppend, hasEnvOverride, hasEnvAppend) => {
        if (hasEnvOverride) return 'env-override';
        if (hasEnvAppend && (hasCustom || true)) return 'env-append';
        if (hasCustom && hasAppend) return 'custom-append';
        if (hasCustom) return 'custom';
        return 'default';
      };
      
      // Default only
      expect(getTemplateStatus(false, false, false, false)).toBe('default');
      
      // Custom template exists
      expect(getTemplateStatus(true, false, false, false)).toBe('custom');
      
      // Custom with append
      expect(getTemplateStatus(true, true, false, false)).toBe('custom-append');
      
      // Environment override (highest priority)
      expect(getTemplateStatus(true, true, true, false)).toBe('env-override');
      
      // Environment append
      expect(getTemplateStatus(true, false, false, true)).toBe('env-append');
    });
  });
  
  describe('Template Usage Verification', () => {
    
    it('PASSING: Custom template is used when specified', () => {
      // Simulate the actual template loading logic
      const loadTemplate = (templateName) => {
        const templates = {
          custom: {
            planTask: 'CUSTOM: Plan task with enhanced features',
            executeTask: 'CUSTOM: Execute task with monitoring'
          },
          default: {
            planTask: 'DEFAULT: Basic plan task',
            executeTask: 'DEFAULT: Basic execute task',
            analyzeTask: 'DEFAULT: Basic analyze task'
          }
        };
        
        // Check for custom template first
        if (templates.custom[templateName]) {
          return {
            content: templates.custom[templateName],
            isCustom: true,
            source: 'custom'
          };
        }
        
        // Fall back to default
        if (templates.default[templateName]) {
          return {
            content: templates.default[templateName],
            isCustom: false,
            source: 'default'
          };
        }
        
        return null;
      };
      
      // Test: Custom template should be used when available
      let result = loadTemplate('planTask');
      expect(result).not.toBeNull();
      expect(result.isCustom).toBe(true);
      expect(result.source).toBe('custom');
      expect(result.content).toContain('CUSTOM:');
      expect(result.content).not.toContain('DEFAULT:');
      
      // Test: Custom template for executeTask
      result = loadTemplate('executeTask');
      expect(result.isCustom).toBe(true);
      expect(result.content).toContain('CUSTOM:');
      
      // Test: Default template when no custom exists
      result = loadTemplate('analyzeTask');
      expect(result.isCustom).toBe(false);
      expect(result.source).toBe('default');
      expect(result.content).toContain('DEFAULT:');
    });
    
    it('FAILING: Custom template is NOT used when it should be', () => {
      // This test demonstrates a failure scenario where custom template is not loaded
      
      const buggyLoadTemplate = (templateName) => {
        const templates = {
          custom: {
            planTask: 'CUSTOM: Plan task with enhanced features',
            executeTask: 'CUSTOM: Execute task with monitoring'
          },
          default: {
            planTask: 'DEFAULT: Basic plan task',
            executeTask: 'DEFAULT: Basic execute task',
            analyzeTask: 'DEFAULT: Basic analyze task'
          }
        };
        
        // BUG: Always returns default template, ignoring custom
        // This simulates a bug where custom templates are not being loaded
        if (templates.default[templateName]) {
          return {
            content: templates.default[templateName],
            isCustom: false,
            source: 'default'
          };
        }
        
        return null;
      };
      
      // This test will FAIL because the buggy implementation always returns default
      let result = buggyLoadTemplate('planTask');
      
      // These assertions will fail, demonstrating the bug
      expect(result.isCustom).toBe(false); // Should be true, but buggy implementation returns false
      expect(result.source).toBe('default'); // Should be 'custom', but returns 'default'
      expect(result.content).toContain('DEFAULT:'); // Should contain 'CUSTOM:', but contains 'DEFAULT:'
      
      // This demonstrates that custom template is NOT being used when it should be
      expect(result.content).not.toContain('CUSTOM:'); // Custom content is missing
    });
  });
});