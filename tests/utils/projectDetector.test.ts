import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { getProjectDataDir, clearProjectCache } from '../../src/utils/projectDetector.js';

describe('ProjectDetector', () => {
  const originalCwd = process.cwd();
  // Use system temp directory to avoid Git detection
  const testDir = path.join(os.tmpdir(), 'test-project-' + Date.now());

  beforeEach(() => {
    // Clear project cache before each test
    clearProjectCache();

    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Restore original working directory
    process.chdir(originalCwd);
    
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('getProjectDataDir', () => {
    it('should use baseDataDir when PROJECT_AUTO_DETECT is explicitly disabled', async () => {
      const originalAutoDetect = process.env.PROJECT_AUTO_DETECT;
      process.env.PROJECT_AUTO_DETECT = 'false';

      const baseDir = '/custom/data/dir';
      const result = await getProjectDataDir(baseDir);
      expect(result).toBe(baseDir);

      // Restore original value
      if (originalAutoDetect) {
        process.env.PROJECT_AUTO_DETECT = originalAutoDetect;
      } else {
        delete process.env.PROJECT_AUTO_DETECT;
      }
    });

    it('should detect project name from package.json when auto-detect is enabled', async () => {
      // Enable auto-detection
      const originalAutoDetect = process.env.PROJECT_AUTO_DETECT;
      const originalProjectName = process.env.PROJECT_NAME;
      process.env.PROJECT_AUTO_DETECT = 'true';

      // Clear any existing PROJECT_NAME to ensure package.json detection
      delete process.env.PROJECT_NAME;

      // Create a package.json file
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
      };

      fs.writeFileSync(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const baseDir = '/base/data/dir';
      // Pass testDir as workingDir to avoid Git detection from current repo
      const result = await getProjectDataDir(baseDir, testDir);

      // Should include project name in path when auto-detect is enabled
      expect(result).toContain('test-project');

      // Clean up
      if (originalAutoDetect) {
        process.env.PROJECT_AUTO_DETECT = originalAutoDetect;
      } else {
        delete process.env.PROJECT_AUTO_DETECT;
      }

      if (originalProjectName) {
        process.env.PROJECT_NAME = originalProjectName;
      }
    });

    it('should handle missing package.json gracefully', async () => {
      // Disable auto-detection for this test
      const originalAutoDetect = process.env.PROJECT_AUTO_DETECT;
      process.env.PROJECT_AUTO_DETECT = 'false';

      // Change to test directory without package.json
      process.chdir(testDir);

      const baseDir = '/base/data/dir';
      const result = await getProjectDataDir(baseDir, testDir);

      // Should return base directory when auto-detect is disabled
      expect(typeof result).toBe('string');
      expect(result).toBe(baseDir);

      // Restore original value
      if (originalAutoDetect) {
        process.env.PROJECT_AUTO_DETECT = originalAutoDetect;
      } else {
        delete process.env.PROJECT_AUTO_DETECT;
      }
    });

    it('should handle auto-detect disabled mode', async () => {
      const originalAutoDetect = process.env.PROJECT_AUTO_DETECT;
      process.env.PROJECT_AUTO_DETECT = 'false';

      const baseDir = '/test/data/dir';
      const result = await getProjectDataDir(baseDir);

      // Should return base directory when auto-detect is disabled
      expect(result).toBe(baseDir);

      // Restore original value
      if (originalAutoDetect) {
        process.env.PROJECT_AUTO_DETECT = originalAutoDetect;
      } else {
        delete process.env.PROJECT_AUTO_DETECT;
      }
    });
  });
});
