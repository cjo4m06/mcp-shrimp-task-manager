import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getCurrentModulePath, getCurrentModuleDir, getProjectRoot } from '../../src/utils/moduleResolver.js';
import path from 'path';

describe('moduleResolver', () => {
  beforeEach(() => {
    // Reset environment
    delete process.env.NODE_ENV;
  });

  describe('getCurrentModulePath', () => {
    it('should return test path in test environment', () => {
      process.env.NODE_ENV = 'test';
      const result = getCurrentModulePath();
      
      expect(result).toContain('taskModel.ts');
      expect(path.isAbsolute(result)).toBe(true);
    });

    it('should use import.meta.url when provided', () => {
      const testUrl = 'file:///C:/test/path/module.js';
      const result = getCurrentModulePath(testUrl);

      expect(result).toContain('module.js');
    });

    it('should fallback to process.cwd when no url provided', () => {
      process.env.NODE_ENV = 'production';
      const result = getCurrentModulePath();
      
      expect(result).toContain('taskModel.ts');
      expect(path.isAbsolute(result)).toBe(true);
    });
  });

  describe('getCurrentModuleDir', () => {
    it('should return directory of current module', () => {
      const result = getCurrentModuleDir();
      
      expect(path.isAbsolute(result)).toBe(true);
      expect(result).not.toContain('.ts');
    });

    it('should work with import.meta.url', () => {
      const testUrl = 'file:///C:/test/path/module.js';
      const result = getCurrentModuleDir(testUrl);

      expect(result).toContain('path');
      expect(result).not.toContain('module.js');
    });
  });

  describe('getProjectRoot', () => {
    it('should return project root directory', () => {
      const result = getProjectRoot();
      
      expect(path.isAbsolute(result)).toBe(true);
      // Should go up two levels from src/models
      expect(result).not.toContain('src');
    });

    it('should work with import.meta.url', () => {
      const testUrl = 'file:///C:/test/src/models/module.js';
      const result = getProjectRoot(testUrl);

      expect(result).toContain('test');
      expect(result).not.toContain('src');
    });
  });
});
