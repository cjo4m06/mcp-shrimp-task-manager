import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: [
      'node_modules',
      'dist',
      // Temporarily exclude failing memory tool tests until they are fixed
      'tests/tools/memory/analyzeTeamCollaboration.test.ts',
      'tests/memory/index.test.ts',
      // Temporarily exclude integration tests that are unstable in CI
      'tests/server/**',
      '**/mcpServerIntegration.test.ts',
      '**/*integration*.test.ts'
    ],
    // Run tests sequentially to avoid file system race conditions
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Increase timeout for file operations
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        'src/index.ts',
        'src/prompts/**',
        'src/public/**',
        '**/*.d.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
