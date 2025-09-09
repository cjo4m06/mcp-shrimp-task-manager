// Test setup file for initial request feature tests
import { vi } from 'vitest';

// Mock DOM environment for React tests
import '@testing-library/jest-dom';

// Global test configuration
globalThis.fetch = vi.fn();

// Mock console methods to reduce test noise
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});