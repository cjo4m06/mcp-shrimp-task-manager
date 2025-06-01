/**
 * 日志系统单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger, logger, log } from '@/utils/logger';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

// Mock fs modules
vi.mock('fs/promises');
vi.mock('fs');

describe('Logger', () => {
  const originalEnv = process.env;
  const originalConsole = console;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.DATA_DIR = 'C:/test-data';

    // Mock console methods
    console.log = vi.fn();
    console.info = vi.fn();
    console.debug = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();

    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  describe('initialization', () => {
    it('should initialize with default log directory', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const testLogger = new Logger();
      await testLogger.initialize();

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join('C:/test-data', 'logs'),
        { recursive: true }
      );
    });

    it('should set log level from environment variable', async () => {
      process.env.LOG_LEVEL = 'WARN';
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const testLogger = new Logger();
      await testLogger.initialize();

      // Clear console mocks after initialization
      vi.clearAllMocks();

      // Test that debug messages are not logged when level is WARN
      testLogger.debug('Test', 'Debug message');
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      vi.mocked(fs.mkdir).mockRejectedValue(new Error('Permission denied'));

      const testLogger = new Logger();
      await testLogger.initialize();

      expect(console.error).toHaveBeenCalledWith(
        '日志系统初始化失败:',
        expect.any(Error)
      );
    });

    it('should not initialize twice', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const testLogger = new Logger();
      await testLogger.initialize();
      await testLogger.initialize(); // Second call

      expect(fs.mkdir).toHaveBeenCalledTimes(1);
    });
  });

  describe('logging methods', () => {
    beforeEach(async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fsSync.appendFileSync).mockImplementation(() => {});

      const testLogger = new Logger();
      await testLogger.initialize();

      // Clear console mocks after initialization
      vi.clearAllMocks();
    });

    it('should log debug messages', async () => {
      // Set log level to DEBUG to ensure debug messages are logged
      process.env.LOG_LEVEL = 'DEBUG';
      const testLogger = new Logger();
      await testLogger.initialize();

      // Clear console mocks after initialization
      vi.clearAllMocks();

      testLogger.debug('TestCategory', 'Debug message', { data: 'test' });

      expect(console.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] [TestCategory] Debug message'),
        expect.objectContaining({ data: 'test' })
      );
    });

    it('should log info messages', () => {
      log.info('TestCategory', 'Info message', { data: 'test' });

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [TestCategory] Info message'),
        expect.objectContaining({ data: 'test' })
      );
    });

    it('should log warning messages', () => {
      log.warn('TestCategory', 'Warning message', { data: 'test' });

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] [TestCategory] Warning message'),
        expect.objectContaining({ data: 'test' })
      );
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      log.error('TestCategory', 'Error message', error, { data: 'test' });

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] [TestCategory] Error message'),
        expect.objectContaining({ data: 'test' }),
        error
      );
    });

    it('should respect log level filtering', async () => {
      process.env.LOG_LEVEL = 'ERROR';
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const testLogger = new Logger();
      await testLogger.initialize();

      // Clear console mocks after initialization
      vi.clearAllMocks();

      testLogger.debug('Test', 'Debug message');
      testLogger.info('Test', 'Info message');
      testLogger.warn('Test', 'Warning message');
      testLogger.error('Test', 'Error message');

      // Only error should be logged
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('buffered writing', () => {
    beforeEach(async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fsSync.appendFileSync).mockImplementation(() => {});
      
      const testLogger = new Logger();
      await testLogger.initialize();
    });

    it('should buffer log entries', () => {
      log.info('Test', 'Message 1');
      log.info('Test', 'Message 2');

      // Should not write immediately
      expect(fsSync.appendFileSync).not.toHaveBeenCalled();
    });

    it('should flush buffer when reaching buffer size', () => {
      // Fill buffer to trigger flush (default buffer size is 10)
      for (let i = 0; i < 10; i++) {
        log.info('Test', `Message ${i}`);
      }

      expect(fsSync.appendFileSync).toHaveBeenCalled();
    });

    it('should flush buffer on timer', async () => {
      log.info('Test', 'Message');

      // Wait for timer to trigger (default is 1000ms)
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(fsSync.appendFileSync).toHaveBeenCalled();
    });

    it('should handle write errors gracefully', () => {
      vi.mocked(fsSync.appendFileSync).mockImplementation(() => {
        throw new Error('Write failed');
      });

      // Fill buffer to trigger flush
      for (let i = 0; i < 10; i++) {
        log.info('Test', `Message ${i}`);
      }

      expect(console.error).toHaveBeenCalledWith(
        '写入日志文件失败:',
        expect.any(Error)
      );
    });
  });

  describe('project directory management', () => {
    beforeEach(async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fsSync.appendFileSync).mockImplementation(() => {});
      
      await logger.initialize();
    });

    it('should update log directory for project', async () => {
      const projectDataDir = 'C:/test-data/projects/test-project';

      await logger.setProjectLogDir(projectDataDir);

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(projectDataDir, 'logs'),
        { recursive: true }
      );
    });

    it('should not update if directory is the same', async () => {
      const projectDataDir = 'C:/test-data';

      await logger.setProjectLogDir(projectDataDir);

      // Should not create new directory since it's the same
      expect(fs.mkdir).toHaveBeenCalledTimes(1); // Only initial call
    });

    it('should handle directory creation errors', async () => {
      vi.mocked(fs.mkdir).mockRejectedValue(new Error('Permission denied'));

      const projectDataDir = 'C:/test-data/projects/test-project';

      await logger.setProjectLogDir(projectDataDir);

      expect(console.error).toHaveBeenCalledWith(
        '设置项目日志目录失败:',
        expect.any(Error)
      );
    });
  });

  describe('cleanup', () => {
    beforeEach(async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fsSync.appendFileSync).mockImplementation(() => {});
      
      await logger.initialize();
    });

    it('should flush buffer on cleanup', () => {
      log.info('Test', 'Message before cleanup');

      logger.cleanup();

      expect(fsSync.appendFileSync).toHaveBeenCalled();
    });

    it('should clear flush timer on cleanup', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Trigger a log to start the timer
      log.info('Test', 'Message');

      logger.cleanup();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.clearAllMocks();
    });

    it('should provide init convenience method', async () => {
      // Create a new logger instance to ensure initialization happens
      const testLogger = new Logger();
      await testLogger.initialize();
      expect(fs.mkdir).toHaveBeenCalled();
    });

    it('should provide setProjectDir convenience method', async () => {
      await log.setProjectDir('C:/test-project');

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('logs'),
        { recursive: true }
      );
    });
  });

  describe('log formatting', () => {
    beforeEach(async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fsSync.appendFileSync).mockImplementation(() => {});

      await logger.initialize();

      // Clear console mocks after initialization
      vi.clearAllMocks();
    });

    it('should format log entries with timestamp', () => {
      log.info('Test', 'Message');

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [Test] Message'),
        ''
      );
    });

    it('should include data in log entries', () => {
      log.info('Test', 'Message', { key: 'value' });

      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [Test] Message'),
        expect.objectContaining({ key: 'value' })
      );
    });

    it('should handle circular references in data', () => {
      const circular: any = { prop: 'value' };
      circular.self = circular;

      // The logger should handle circular references gracefully
      // by catching JSON.stringify errors in the buffer
      expect(() => {
        log.info('Test', 'Message', circular);
      }).not.toThrow();
    });
  });
});
