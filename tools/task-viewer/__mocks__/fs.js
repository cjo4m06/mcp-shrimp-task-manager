import { vi } from 'vitest';

export const promises = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
  stat: vi.fn(),
  access: vi.fn(),
  rm: vi.fn()
};

export default {
  promises
};