import { describe, it, expect, beforeEach, vi } from 'vitest';
import { splitTasks, splitTasksSchema } from '../../../src/tools/task/splitTasks.js';
import { RelatedFileType, TaskStatus } from '../../../src/types/index.js';
import { createMockTask, getTestDataDir } from '../../helpers/testUtils.js';
import * as taskModel from '../../../src/models/taskModel.js';
import * as promptsIndex from '../../../src/prompts/index.js';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

// Mock the task model functions
vi.mock('../../../src/models/taskModel.js', () => ({
  getAllTasks: vi.fn(),
  batchCreateOrUpdateTasks: vi.fn(),
  clearAllTasks: vi.fn(),
}));

// Mock the prompts
vi.mock('../../../src/prompts/index.js', () => ({
  getSplitTasksPrompt: vi.fn(),
}));

describe('splitTasks Tool', () => {
  const mockGetAllTasks = vi.mocked(taskModel.getAllTasks);
  const mockBatchCreateOrUpdateTasks = vi.mocked(taskModel.batchCreateOrUpdateTasks);
  const mockClearAllTasks = vi.mocked(taskModel.clearAllTasks);
  const mockGetSplitTasksPrompt = vi.mocked(promptsIndex.getSplitTasksPrompt);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockGetAllTasks.mockResolvedValue([]);
    mockBatchCreateOrUpdateTasks.mockResolvedValue([]);
    mockClearAllTasks.mockResolvedValue({
      success: true,
      message: 'Tasks cleared successfully',
      backupFile: 'backup-test.json',
    });
    mockGetSplitTasksPrompt.mockReturnValue('Mock prompt content');
  });

  describe('Schema Validation', () => {
    it('should validate correct input with all required fields', () => {
      const validInput = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'This is a valid task description with enough characters',
            implementationGuide: 'Step 1: Do something\nStep 2: Do something else',
            dependencies: ['task-1'],
            notes: 'Some notes',
            relatedFiles: [
              {
                path: 'src/test.ts',
                type: RelatedFileType.TO_MODIFY,
                description: 'File to modify',
                lineStart: 1,
                lineEnd: 100,
              },
            ],
            verificationCriteria: 'Task should pass all tests',
          },
        ],
        globalAnalysisResult: 'Global analysis result',
      };

      const result = splitTasksSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate minimal valid input', () => {
      const minimalInput = {
        updateMode: 'clearAllTasks' as const,
        tasks: [
          {
            name: 'Minimal Task',
            description: 'This is a minimal but valid task description',
            implementationGuide: 'Basic implementation guide',
          },
        ],
      };

      const result = splitTasksSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
    });

    it('should reject input with invalid updateMode', () => {
      const invalidInput = {
        updateMode: 'invalid' as any,
        tasks: [
          {
            name: 'Test Task',
            description: 'Valid description',
            implementationGuide: 'Valid guide',
          },
        ],
      };

      const result = splitTasksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject input with empty tasks array', () => {
      const invalidInput = {
        updateMode: 'append' as const,
        tasks: [],
      };

      const result = splitTasksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('請至少提供一個任務');
    });

    it('should reject task with short description', () => {
      const invalidInput = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Short', // Less than 10 characters
            implementationGuide: 'Valid guide',
          },
        ],
      };

      const result = splitTasksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('任務描述過短');
    });

    it('should reject task with long name', () => {
      const invalidInput = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'A'.repeat(101), // More than 100 characters
            description: 'Valid description with enough characters',
            implementationGuide: 'Valid guide',
          },
        ],
      };

      const result = splitTasksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('任務名稱過長');
    });

    it('should reject related file with empty path', () => {
      const invalidInput = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Valid description',
            implementationGuide: 'Valid guide',
            relatedFiles: [
              {
                path: '', // Empty path
                type: RelatedFileType.TO_MODIFY,
                description: 'File description',
              },
            ],
          },
        ],
      };

      const result = splitTasksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('文件路徑不能為空');
    });

    it('should reject related file with empty description', () => {
      const invalidInput = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Valid description',
            implementationGuide: 'Valid guide',
            relatedFiles: [
              {
                path: 'src/test.ts',
                type: RelatedFileType.TO_MODIFY,
                description: '', // Empty description
              },
            ],
          },
        ],
      };

      const result = splitTasksSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('文件描述不能為空');
    });
  });

  describe('Task Name Duplication Detection', () => {
    it('should detect duplicate task names', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Duplicate Task',
            description: 'First task description',
            implementationGuide: 'First implementation',
          },
          {
            name: 'Duplicate Task', // Same name
            description: 'Second task description',
            implementationGuide: 'Second implementation',
          },
        ],
      };

      const result = await splitTasks(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('重複的任務名稱');
      expect(mockBatchCreateOrUpdateTasks).not.toHaveBeenCalled();
    });

    it('should allow unique task names', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Task One',
            description: 'First task description',
            implementationGuide: 'First implementation',
          },
          {
            name: 'Task Two',
            description: 'Second task description',
            implementationGuide: 'Second implementation',
          },
        ],
      };

      const mockTasks = [
        createMockTask({ name: 'Task One' }),
        createMockTask({ name: 'Task Two' }),
      ];
      mockBatchCreateOrUpdateTasks.mockResolvedValue(mockTasks);

      const result = await splitTasks(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe('Mock prompt content');
      expect(mockBatchCreateOrUpdateTasks).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Task One' }),
          expect.objectContaining({ name: 'Task Two' }),
        ]),
        'append',
        undefined
      );
    });
  });

  describe('UpdateMode Processing', () => {
    describe('clearAllTasks mode', () => {
      it('should clear all tasks and create new ones successfully', async () => {
        const input = {
          updateMode: 'clearAllTasks' as const,
          tasks: [
            {
              name: 'New Task',
              description: 'Task after clearing all',
              implementationGuide: 'Implementation guide',
            },
          ],
          globalAnalysisResult: 'Global analysis',
        };

        const mockCreatedTasks = [createMockTask({ name: 'New Task' })];
        mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);

        const result = await splitTasks(input);

        expect(mockClearAllTasks).toHaveBeenCalled();
        expect(mockBatchCreateOrUpdateTasks).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'New Task' }),
          ]),
          'append',
          'Global analysis'
        );
        expect(result.content[0].text).toBe('Mock prompt content');
        expect(result.ephemeral?.taskCreationResult?.success).toBe(true);
      });

      it('should handle clearAllTasks failure', async () => {
        const input = {
          updateMode: 'clearAllTasks' as const,
          tasks: [
            {
              name: 'New Task',
              description: 'Task after clearing all',
              implementationGuide: 'Implementation guide',
            },
          ],
        };

        mockClearAllTasks.mockResolvedValue({
          success: false,
          message: 'Failed to clear tasks',
          backupFile: null,
        });

        const result = await splitTasks(input);

        expect(mockClearAllTasks).toHaveBeenCalled();
        expect(mockBatchCreateOrUpdateTasks).not.toHaveBeenCalled();
        expect(result.ephemeral?.taskCreationResult?.success).toBe(false);
        expect(result.ephemeral?.taskCreationResult?.message).toContain('Failed to clear tasks');
      });

      it('should handle task creation failure after clearing', async () => {
        const input = {
          updateMode: 'clearAllTasks' as const,
          tasks: [
            {
              name: 'New Task',
              description: 'Task after clearing all',
              implementationGuide: 'Implementation guide',
            },
          ],
        };

        mockBatchCreateOrUpdateTasks.mockRejectedValue(new Error('Creation failed'));

        const result = await splitTasks(input);

        expect(mockClearAllTasks).toHaveBeenCalled();
        expect(mockBatchCreateOrUpdateTasks).toHaveBeenCalled();
        expect(result.ephemeral?.taskCreationResult?.success).toBe(false);
        expect(result.ephemeral?.taskCreationResult?.message).toContain('創建新任務時發生錯誤');
      });
    });

    describe('append mode', () => {
      it('should append new tasks successfully', async () => {
        const input = {
          updateMode: 'append' as const,
          tasks: [
            {
              name: 'Appended Task',
              description: 'Task to be appended',
              implementationGuide: 'Implementation guide',
            },
          ],
        };

        const mockCreatedTasks = [createMockTask({ name: 'Appended Task' })];
        mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);

        const result = await splitTasks(input);

        expect(mockClearAllTasks).not.toHaveBeenCalled();
        expect(mockBatchCreateOrUpdateTasks).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Appended Task' }),
          ]),
          'append',
          undefined
        );
        expect(result.ephemeral?.taskCreationResult?.message).toContain('成功追加了 1 個新任務');
      });
    });

    describe('overwrite mode', () => {
      it('should overwrite incomplete tasks successfully', async () => {
        const input = {
          updateMode: 'overwrite' as const,
          tasks: [
            {
              name: 'Overwrite Task',
              description: 'Task to overwrite with',
              implementationGuide: 'Implementation guide',
            },
          ],
        };

        const mockCreatedTasks = [createMockTask({ name: 'Overwrite Task' })];
        mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);

        const result = await splitTasks(input);

        expect(mockBatchCreateOrUpdateTasks).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Overwrite Task' }),
          ]),
          'overwrite',
          undefined
        );
        expect(result.ephemeral?.taskCreationResult?.message).toContain('成功清除未完成任務並創建了 1 個新任務');
      });
    });

    describe('selective mode', () => {
      it('should selectively update tasks successfully', async () => {
        const input = {
          updateMode: 'selective' as const,
          tasks: [
            {
              name: 'Selective Task',
              description: 'Task to be selectively updated',
              implementationGuide: 'Implementation guide',
            },
          ],
        };

        const mockCreatedTasks = [createMockTask({ name: 'Selective Task' })];
        mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);

        const result = await splitTasks(input);

        expect(mockBatchCreateOrUpdateTasks).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Selective Task' }),
          ]),
          'selective',
          undefined
        );
        expect(result.ephemeral?.taskCreationResult?.message).toContain('成功選擇性更新/創建了 1 個任務');
      });
    });

    it('should handle batchCreateOrUpdateTasks failure', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Failed Task',
            description: 'Task that will fail to create',
            implementationGuide: 'Implementation guide',
          },
        ],
      };

      mockBatchCreateOrUpdateTasks.mockRejectedValue(new Error('Database error'));

      const result = await splitTasks(input);

      expect(result.ephemeral?.taskCreationResult?.success).toBe(false);
      expect(result.ephemeral?.taskCreationResult?.message).toContain('任務創建失敗：Database error');
    });
  });

  describe('Task Data Conversion', () => {
    it('should convert task data correctly with all fields', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Complex Task',
            description: 'Task with all possible fields',
            implementationGuide: 'Detailed implementation guide',
            dependencies: ['dep-1', 'dep-2'],
            notes: 'Important notes',
            relatedFiles: [
              {
                path: 'src/main.ts',
                type: RelatedFileType.TO_MODIFY,
                description: 'Main file to modify',
                lineStart: 10,
                lineEnd: 50,
              },
              {
                path: 'docs/api.md',
                type: RelatedFileType.REFERENCE,
                description: 'API documentation',
              },
            ],
            verificationCriteria: 'All tests must pass',
          },
        ],
        globalAnalysisResult: 'Global analysis result',
      };

      const mockCreatedTasks = [createMockTask({ name: 'Complex Task' })];
      mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);

      await splitTasks(input);

      expect(mockBatchCreateOrUpdateTasks).toHaveBeenCalledWith(
        [
          {
            name: 'Complex Task',
            description: 'Task with all possible fields',
            notes: 'Important notes',
            dependencies: ['dep-1', 'dep-2'],
            implementationGuide: 'Detailed implementation guide',
            verificationCriteria: 'All tests must pass',
            relatedFiles: [
              {
                path: 'src/main.ts',
                type: RelatedFileType.TO_MODIFY,
                description: 'Main file to modify',
                lineStart: 10,
                lineEnd: 50,
              },
              {
                path: 'docs/api.md',
                type: RelatedFileType.REFERENCE,
                description: 'API documentation',
                lineStart: undefined,
                lineEnd: undefined,
              },
            ],
          },
        ],
        'append',
        'Global analysis result'
      );
    });

    it('should handle tasks with minimal fields', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Minimal Task',
            description: 'Task with only required fields',
            implementationGuide: 'Basic guide',
          },
        ],
      };

      const mockCreatedTasks = [createMockTask({ name: 'Minimal Task' })];
      mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);

      await splitTasks(input);

      expect(mockBatchCreateOrUpdateTasks).toHaveBeenCalledWith(
        [
          {
            name: 'Minimal Task',
            description: 'Task with only required fields',
            notes: undefined,
            dependencies: undefined,
            implementationGuide: 'Basic guide',
            verificationCriteria: undefined,
            relatedFiles: undefined,
          },
        ],
        'append',
        undefined
      );
    });
  });

  describe('Prompt Generation', () => {
    it('should call getSplitTasksPrompt with correct parameters', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Test description',
            implementationGuide: 'Test guide',
          },
        ],
      };

      const mockCreatedTasks = [createMockTask({ name: 'Test Task' })];
      const mockAllTasks = [
        createMockTask({ name: 'Existing Task 1' }),
        createMockTask({ name: 'Existing Task 2' }),
        ...mockCreatedTasks,
      ];

      mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);
      mockGetAllTasks.mockResolvedValue(mockAllTasks);

      await splitTasks(input);

      expect(mockGetSplitTasksPrompt).toHaveBeenCalledWith({
        updateMode: 'append',
        createdTasks: mockCreatedTasks,
        allTasks: mockAllTasks,
      });
    });

    it('should handle getAllTasks failure gracefully', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Test description',
            implementationGuide: 'Test guide',
          },
        ],
      };

      const mockCreatedTasks = [createMockTask({ name: 'Test Task' })];
      mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);
      mockGetAllTasks.mockRejectedValue(new Error('Failed to get tasks'));

      const result = await splitTasks(input);

      // Should still call prompt generator with created tasks only
      expect(mockGetSplitTasksPrompt).toHaveBeenCalledWith({
        updateMode: 'append',
        createdTasks: mockCreatedTasks,
        allTasks: mockCreatedTasks, // Falls back to created tasks
      });
      expect(result.content[0].text).toBe('Mock prompt content');
    });

    it('should return prompt content in correct format', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Test description',
            implementationGuide: 'Test guide',
          },
        ],
      };

      const mockCreatedTasks = [createMockTask({ name: 'Test Task' })];
      mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);
      mockGetSplitTasksPrompt.mockReturnValue('Custom prompt content');

      const result = await splitTasks(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('Custom prompt content');
    });
  });

  describe('Error Handling', () => {
    it('should handle batchCreateOrUpdateTasks errors in append mode', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Test description',
            implementationGuide: 'Test guide',
          },
        ],
      };

      // Mock an error in batchCreateOrUpdateTasks
      mockBatchCreateOrUpdateTasks.mockRejectedValue(new Error('Database error'));

      const result = await splitTasks(input);

      // The function should still return a prompt, but with error in ephemeral data
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('Mock prompt content');
      expect(result.ephemeral?.taskCreationResult?.success).toBe(false);
      expect(result.ephemeral?.taskCreationResult?.message).toContain('任務創建失敗：Database error');
    });

    it('should handle errors in getSplitTasksPrompt', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Test description',
            implementationGuide: 'Test guide',
          },
        ],
      };

      const mockCreatedTasks = [createMockTask({ name: 'Test Task' })];
      mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);

      // Mock an error in prompt generation to trigger outer catch
      mockGetSplitTasksPrompt.mockImplementation(() => {
        throw new Error('Prompt generation error');
      });

      const result = await splitTasks(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('執行任務拆分時發生錯誤');
      expect(result.content[0].text).toContain('Prompt generation error');
    });

    it('should handle non-Error exceptions in outer catch', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Test description',
            implementationGuide: 'Test guide',
          },
        ],
      };

      const mockCreatedTasks = [createMockTask({ name: 'Test Task' })];
      mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);

      // Mock a non-Error exception in prompt generation
      mockGetSplitTasksPrompt.mockImplementation(() => {
        throw 'String error in prompt';
      });

      const result = await splitTasks(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('執行任務拆分時發生錯誤');
      expect(result.content[0].text).toContain('String error in prompt');
    });

    it('should handle clearAllTasks creation errors', async () => {
      const input = {
        updateMode: 'clearAllTasks' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Test description',
            implementationGuide: 'Test guide',
          },
        ],
      };

      // Mock successful clear but failed task creation
      mockBatchCreateOrUpdateTasks.mockRejectedValue(new Error('Creation failed after clear'));

      const result = await splitTasks(input);

      // Should still return prompt but with error in ephemeral data
      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toBe('Mock prompt content');
      expect(result.ephemeral?.taskCreationResult?.success).toBe(false);
      expect(result.ephemeral?.taskCreationResult?.message).toContain('創建新任務時發生錯誤');
      expect(result.ephemeral?.taskCreationResult?.message).toContain('Creation failed after clear');
    });
  });

  describe('Ephemeral Data', () => {
    it('should include correct ephemeral data for successful operations', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Test description',
            implementationGuide: 'Test guide',
          },
        ],
      };

      const mockCreatedTasks = [createMockTask({ name: 'Test Task' })];
      mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);

      const result = await splitTasks(input);

      expect(result.ephemeral).toBeDefined();
      expect(result.ephemeral?.taskCreationResult).toEqual({
        success: true,
        message: '成功追加了 1 個新任務。',
        backupFilePath: null,
      });
    });

    it('should include backup file path for clearAllTasks mode', async () => {
      const input = {
        updateMode: 'clearAllTasks' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Test description',
            implementationGuide: 'Test guide',
          },
        ],
      };

      const mockCreatedTasks = [createMockTask({ name: 'Test Task' })];
      mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);

      const result = await splitTasks(input);

      expect(result.ephemeral?.taskCreationResult?.backupFilePath).toBe('backup-test.json');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty created tasks array', async () => {
      const input = {
        updateMode: 'append' as const,
        tasks: [
          {
            name: 'Test Task',
            description: 'Test description',
            implementationGuide: 'Test guide',
          },
        ],
      };

      mockBatchCreateOrUpdateTasks.mockResolvedValue([]);

      const result = await splitTasks(input);

      expect(result.ephemeral?.taskCreationResult?.message).toContain('成功追加了 0 個新任務');
    });

    it('should handle multiple tasks with various configurations', async () => {
      const input = {
        updateMode: 'selective' as const,
        tasks: [
          {
            name: 'Task 1',
            description: 'First task description',
            implementationGuide: 'First implementation',
            dependencies: ['existing-task'],
            notes: 'First notes',
          },
          {
            name: 'Task 2',
            description: 'Second task description',
            implementationGuide: 'Second implementation',
            verificationCriteria: 'Second criteria',
          },
          {
            name: 'Task 3',
            description: 'Third task description',
            implementationGuide: 'Third implementation',
            relatedFiles: [
              {
                path: 'src/file.ts',
                type: RelatedFileType.CREATE,
                description: 'File to create',
              },
            ],
          },
        ],
        globalAnalysisResult: 'Comprehensive analysis',
      };

      const mockCreatedTasks = [
        createMockTask({ name: 'Task 1' }),
        createMockTask({ name: 'Task 2' }),
        createMockTask({ name: 'Task 3' }),
      ];
      mockBatchCreateOrUpdateTasks.mockResolvedValue(mockCreatedTasks);

      const result = await splitTasks(input);

      expect(mockBatchCreateOrUpdateTasks).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Task 1',
            dependencies: ['existing-task'],
            notes: 'First notes',
          }),
          expect.objectContaining({
            name: 'Task 2',
            verificationCriteria: 'Second criteria',
          }),
          expect.objectContaining({
            name: 'Task 3',
            relatedFiles: expect.arrayContaining([
              expect.objectContaining({
                path: 'src/file.ts',
                type: RelatedFileType.CREATE,
              }),
            ]),
          }),
        ]),
        'selective',
        'Comprehensive analysis'
      );
      expect(result.ephemeral?.taskCreationResult?.success).toBe(true);
    });
  });
});
