import fs from 'fs';
import path from 'path';
import os from 'os';
import { vi, beforeEach, afterAll } from 'vitest';

const testRootDir = path.resolve();

// Mock import.meta for ES modules in Vitest
(globalThis as any).importMeta = {
  url: 'file:///test-module.js'
};

// Mock environment variables
process.env.NODE_ENV = 'test';

// Use OS temp directory to avoid permission issues
// Add process ID and random number for better isolation
const testTempDir = path.join(os.tmpdir(), `vitest-mcp-shrimp-${process.pid}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
process.env.DATA_DIR = testTempDir;

// Create temp directory for tests
try {
  if (!fs.existsSync(testTempDir)) {
    fs.mkdirSync(testTempDir, { recursive: true });
  }
} catch (error) {
  console.warn('Failed to setup test directory:', error);
}

// Clean up temp directory before each test
beforeEach(() => {
  try {
    if (fs.existsSync(testTempDir)) {
      fs.rmSync(testTempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testTempDir, { recursive: true });
  } catch (error) {
    // Ignore cleanup errors in tests
  }
});

// Clean up after all tests
afterAll(() => {
  try {
    if (fs.existsSync(testTempDir)) {
      fs.rmSync(testTempDir, { recursive: true, force: true });
    }
  } catch (error) {
    // Ignore cleanup errors
  }
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
