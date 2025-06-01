import { Task, TaskStatus, RelatedFileType } from '../../src/types/index.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Create a mock task for testing
 */
export function createMockTask(overrides: Partial<Task> = {}): Task {
  const now = new Date();
  return {
    id: uuidv4(),
    name: 'Test Task',
    description: 'This is a test task description',
    status: TaskStatus.PENDING,
    dependencies: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create multiple mock tasks with dependencies
 */
export function createMockTaskChain(count: number): Task[] {
  const tasks: Task[] = [];
  
  for (let i = 0; i < count; i++) {
    const task = createMockTask({
      name: `Task ${i + 1}`,
      description: `Description for task ${i + 1}`,
      dependencies: i > 0 ? [{ taskId: tasks[i - 1].id }] : [],
    });
    tasks.push(task);
  }
  
  return tasks;
}

/**
 * Create a mock task with related files
 */
export function createMockTaskWithFiles(): Task {
  return createMockTask({
    name: 'Task with Files',
    description: 'A task that has related files',
    relatedFiles: [
      {
        path: 'src/test.ts',
        type: RelatedFileType.TO_MODIFY,
        description: 'File to modify',
        lineStart: 1,
        lineEnd: 100,
      },
      {
        path: 'docs/readme.md',
        type: RelatedFileType.REFERENCE,
        description: 'Reference documentation',
      },
    ],
  });
}

/**
 * Create a completed task
 */
export function createCompletedTask(): Task {
  return createMockTask({
    name: 'Completed Task',
    description: 'This task is already completed',
    status: TaskStatus.COMPLETED,
    completedAt: new Date(),
    summary: 'Task completed successfully',
  });
}

/**
 * Wait for a specified amount of time (useful for async tests)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a valid UUID v4 for testing
 */
export function generateTestUUID(): string {
  return uuidv4();
}

/**
 * Create a mock file system structure for testing
 */
export function createMockFileStructure(): Record<string, string> {
  return {
    'package.json': JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
    }),
    'src/index.ts': 'export default function main() {}',
    'src/utils/helper.ts': 'export function helper() {}',
    'README.md': '# Test Project',
  };
}

/**
 * Validate task structure
 */
export function isValidTask(task: any): task is Task {
  return (
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    typeof task.name === 'string' &&
    typeof task.description === 'string' &&
    Object.values(TaskStatus).includes(task.status) &&
    Array.isArray(task.dependencies) &&
    task.createdAt instanceof Date &&
    task.updatedAt instanceof Date
  );
}

/**
 * Create test data directory path
 */
export function getTestDataDir(): string {
  return process.env.DATA_DIR || './tests/temp';
}
