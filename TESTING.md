# Testing Guide

This document describes the testing setup and practices for the MCP Shrimp Task Manager project.

## Overview

The project uses **Vitest** as the testing framework with native TypeScript and ES modules support. Tests are organized to cover:

- **Core Models**: Task management, CRUD operations, dependencies
- **Tools**: Task planning, execution, and management tools  
- **Utilities**: Project detection, regex validation, file operations
- **Types**: Type definitions and schema validation

## Test Structure

```
tests/
├── setup.ts                    # Test configuration and global setup
├── helpers/
│   └── testUtils.ts            # Test utilities and mock helpers
├── models/
│   └── taskModel.test.ts       # Core task model tests
├── tools/
│   └── task/
│       ├── planTask.test.ts    # Task planning tool tests
│       └── executeTask.test.ts # Task execution tool tests
├── utils/
│   ├── projectDetector.test.ts # Project detection tests
│   └── regex.test.ts           # Regex validation tests
└── types/
    └── index.test.ts           # Type definition tests
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (interactive)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI interface
npm run test:ui

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

### Running Specific Tests

```bash
# Run tests for a specific file
npm test -- tests/models/taskModel.test.ts

# Run tests matching a pattern
npm test -- --reporter=verbose --run

# Run tests for a specific directory
npm test -- tests/utils/
```

## Test Coverage

The project maintains a minimum test coverage threshold of 50%. Coverage reports are generated in the `coverage/` directory.

### Coverage Thresholds

- **Lines**: 50% minimum
- **Functions**: 50% minimum
- **Branches**: 50% minimum
- **Statements**: 50% minimum

### Viewing Coverage Reports

After running `npm run test:coverage`, open `coverage/lcov-report/index.html` in your browser to view detailed coverage reports.

## Vitest Features

### Why Vitest?

We migrated from Jest to Vitest for several advantages:

- **Native ES Modules Support**: No configuration needed for ES modules and `import.meta.url`
- **Faster Execution**: Built on Vite's fast build system
- **Better TypeScript Integration**: Out-of-the-box TypeScript support
- **Modern Testing Features**: Built-in watch mode, UI interface, and coverage
- **Simplified Configuration**: Less configuration overhead compared to Jest

### Key Features Used

- **Sequential Execution**: Tests run sequentially to avoid file system race conditions
- **V8 Coverage Provider**: Fast and accurate coverage reporting
- **Global Test APIs**: `describe`, `it`, `expect` available globally
- **Mock Functions**: Using `vi.mock()` and `vi.fn()` for mocking
- **Setup Files**: Global test setup in `tests/setup.ts`

### Configuration

The project uses `vitest.config.ts` for configuration:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true }
    },
    testTimeout: 10000
  }
});
```

## CI/CD Pipeline

### GitHub Actions Workflows

The project includes two main workflows:

#### 1. CI Workflow (`.github/workflows/ci.yml`)

Runs on push to `main` and `develop` branches, and on pull requests:

- **Test Matrix**: Node.js 18.x and 20.x
- **Type Checking**: TypeScript compilation validation
- **Unit Tests**: Full test suite execution
- **Build Verification**: Ensures project builds successfully
- **Security Audit**: npm audit for vulnerabilities
- **Code Quality**: Basic linting and formatting checks

#### 2. PR Checks (`.github/workflows/pr-checks.yml`)

Specialized workflow for pull request validation:

- **Comprehensive Testing**: Full test suite with coverage
- **Coverage Validation**: Ensures 70% minimum coverage
- **Breaking Change Detection**: Analyzes API changes
- **Bundle Size Analysis**: Tracks build size impact
- **Documentation Validation**: Checks README completeness
- **Coverage Comments**: Automatic PR comments with coverage reports

### Coverage Reporting

- **Codecov Integration**: Automatic coverage uploads
- **PR Comments**: Coverage reports posted as PR comments
- **Threshold Enforcement**: Builds fail if coverage drops below 50%

## Writing Tests

### Test Utilities

Use the provided test utilities in `tests/helpers/testUtils.ts`:

```typescript
import { createMockTask, createMockTaskChain, getTestDataDir } from '../helpers/testUtils.js';

// Create a mock task
const task = createMockTask({ name: 'Test Task' });

// Create a chain of dependent tasks
const tasks = createMockTaskChain(3);

// Get test data directory
const dataDir = getTestDataDir();
```

### Mocking Guidelines

- **Project Detector**: Always mock `getProjectDataDir` to return test directory
- **File System**: Use test-specific directories to avoid conflicts
- **External Dependencies**: Mock external services and APIs
- **Console Output**: Console methods are mocked by default to reduce noise

### Test Patterns

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Clean setup for each test
  });

  describe('Specific Functionality', () => {
    it('should perform expected behavior', async () => {
      // Arrange
      const input = createMockData();
      
      // Act
      const result = await functionUnderTest(input);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.property).toBe(expectedValue);
    });
  });
});
```

## Best Practices

### Test Organization

- **Group Related Tests**: Use nested `describe` blocks
- **Clear Test Names**: Use descriptive test names that explain the expected behavior
- **Arrange-Act-Assert**: Follow the AAA pattern for test structure
- **Independent Tests**: Each test should be independent and not rely on others

### Mocking Strategy

- **Mock External Dependencies**: Always mock file system, network calls, and external services
- **Use Test Doubles**: Prefer mocks over real implementations for unit tests
- **Clean Mocks**: Reset mocks between tests to avoid interference

### Coverage Goals

- **Focus on Critical Paths**: Ensure high coverage for core business logic
- **Edge Cases**: Test error conditions and edge cases
- **Integration Points**: Test interfaces between modules
- **Type Safety**: Validate TypeScript types and schemas

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure `.js` extensions in imports for ES modules
2. **Mock Issues**: Verify mock paths match actual module paths
3. **Async Tests**: Use `async/await` for asynchronous operations
4. **File System**: Use test-specific directories to avoid conflicts

### Debug Tips

```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run a single test file with debugging
npm test -- tests/specific.test.ts --reporter=verbose

# Check Vitest configuration
npx vitest --config
```

## Contributing

When adding new features:

1. **Write Tests First**: Follow TDD practices when possible
2. **Maintain Coverage**: Ensure new code has adequate test coverage
3. **Update Documentation**: Update this guide if adding new testing patterns
4. **Run Full Suite**: Verify all tests pass before submitting PR

The CI pipeline will automatically validate your changes and provide feedback on test coverage and quality.
