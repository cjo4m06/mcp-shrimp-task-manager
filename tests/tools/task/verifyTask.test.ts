import { describe, it, expect, beforeEach, vi } from 'vitest';
import { verifyTask, verifyTaskSchema } from '../../../src/tools/task/verifyTask.js';
import { TaskStatus } from '../../../src/types/index.js';
import { createMockTask, generateTestUUID, getTestDataDir } from '../../helpers/testUtils.js';
import * as taskModel from '../../../src/models/taskModel.js';
import * as promptsIndex from '../../../src/prompts/index.js';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

// Mock the task model functions
vi.mock('../../../src/models/taskModel.js', () => ({
  getTaskById: vi.fn(),
  updateTaskStatus: vi.fn(),
  updateTaskSummary: vi.fn(),
}));

// Mock the prompts
vi.mock('../../../src/prompts/index.js', () => ({
  getVerifyTaskPrompt: vi.fn(),
}));

describe('verifyTask Tool', () => {
  const mockGetTaskById = vi.mocked(taskModel.getTaskById);
  const mockUpdateTaskStatus = vi.mocked(taskModel.updateTaskStatus);
  const mockUpdateTaskSummary = vi.mocked(taskModel.updateTaskSummary);
  const mockGetVerifyTaskPrompt = vi.mocked(promptsIndex.getVerifyTaskPrompt);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockGetTaskById.mockResolvedValue(null);
    mockUpdateTaskStatus.mockResolvedValue(null);
    mockUpdateTaskSummary.mockResolvedValue(null);
    mockGetVerifyTaskPrompt.mockReturnValue('Mock verify prompt content');
  });

  describe('Schema Validation', () => {
    it('should validate correct input with all required fields', () => {
      const validInput = {
        taskId: generateTestUUID(),
        summary: 'This is a valid summary with more than 30 characters to meet the minimum requirement',
        score: 85,
      };

      const result = verifyTaskSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject input with invalid taskId format', () => {
      const invalidInput = {
        taskId: 'invalid-uuid',
        summary: 'This is a valid summary with more than 30 characters',
        score: 85,
      };

      const result = verifyTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('任務ID格式無效');
    });

    it('should reject input with short summary', () => {
      const invalidInput = {
        taskId: generateTestUUID(),
        summary: 'Short summary', // Less than 30 characters
        score: 85,
      };

      const result = verifyTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('最少30個字');
    });

    it('should reject input with score below 0', () => {
      const invalidInput = {
        taskId: generateTestUUID(),
        summary: 'This is a valid summary with more than 30 characters',
        score: -1,
      };

      const result = verifyTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('分數不能小於0');
    });

    it('should reject input with score above 100', () => {
      const invalidInput = {
        taskId: generateTestUUID(),
        summary: 'This is a valid summary with more than 30 characters',
        score: 101,
      };

      const result = verifyTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('分數不能大於100');
    });

    it('should accept score at boundary values', () => {
      const validInputs = [
        {
          taskId: generateTestUUID(),
          summary: 'This is a valid summary with more than 30 characters',
          score: 0,
        },
        {
          taskId: generateTestUUID(),
          summary: 'This is a valid summary with more than 30 characters',
          score: 100,
        },
        {
          taskId: generateTestUUID(),
          summary: 'This is a valid summary with more than 30 characters',
          score: 80, // Threshold value
        },
      ];

      validInputs.forEach((input) => {
        const result = verifyTaskSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Task Not Found', () => {
    it('should return error when task does not exist', async () => {
      const taskId = generateTestUUID();
      const input = {
        taskId,
        summary: 'This is a valid summary with more than 30 characters',
        score: 85,
      };

      mockGetTaskById.mockResolvedValue(null);

      const result = await verifyTask(input);

      expect(mockGetTaskById).toHaveBeenCalledWith(taskId);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('系統錯誤');
      expect(result.content[0].text).toContain(`找不到ID為 \`${taskId}\` 的任務`);
      expect(result.isError).toBe(true);
    });
  });

  describe('Task Status Validation', () => {
    it('should return error when task is not in progress', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        name: 'Test Task',
        status: TaskStatus.PENDING,
      });

      const input = {
        taskId,
        summary: 'This is a valid summary with more than 30 characters',
        score: 85,
      };

      mockGetTaskById.mockResolvedValue(mockTask);

      const result = await verifyTask(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].text).toContain('狀態錯誤');
      expect(result.content[0].text).toContain('不處於進行中狀態');
      expect(result.content[0].text).toContain('Test Task');
      expect(result.isError).toBe(true);
    });

    it('should return error when task is already completed', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        name: 'Completed Task',
        status: TaskStatus.COMPLETED,
      });

      const input = {
        taskId,
        summary: 'This is a valid summary with more than 30 characters',
        score: 85,
      };

      mockGetTaskById.mockResolvedValue(mockTask);

      const result = await verifyTask(input);

      expect(result.content[0].text).toContain('狀態錯誤');
      expect(result.content[0].text).toContain('Completed Task');
      expect(result.isError).toBe(true);
    });
  });

  describe('Score Threshold Logic', () => {
    it('should complete task when score is 80 or above', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        name: 'In Progress Task',
        status: TaskStatus.IN_PROGRESS,
      });

      const input = {
        taskId,
        summary: 'Task completed successfully with all requirements met and quality standards achieved',
        score: 80,
      };

      mockGetTaskById.mockResolvedValue(mockTask);
      mockUpdateTaskSummary.mockResolvedValue(mockTask);
      mockUpdateTaskStatus.mockResolvedValue(mockTask);

      const result = await verifyTask(input);

      expect(mockUpdateTaskSummary).toHaveBeenCalledWith(taskId, input.summary);
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(taskId, TaskStatus.COMPLETED);
      expect(mockGetVerifyTaskPrompt).toHaveBeenCalledWith({
        task: mockTask,
        score: 80,
        summary: input.summary,
      });
      expect(result.content[0].text).toBe('Mock verify prompt content');
      expect(result.isError).toBeUndefined();
    });

    it('should complete task when score is above 80', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
      });

      const input = {
        taskId,
        summary: 'Excellent implementation with outstanding quality and comprehensive testing coverage',
        score: 95,
      };

      mockGetTaskById.mockResolvedValue(mockTask);

      await verifyTask(input);

      expect(mockUpdateTaskSummary).toHaveBeenCalledWith(taskId, input.summary);
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(taskId, TaskStatus.COMPLETED);
    });

    it('should not complete task when score is below 80', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
      });

      const input = {
        taskId,
        summary: 'Task needs improvement in several areas including error handling and test coverage',
        score: 75,
      };

      mockGetTaskById.mockResolvedValue(mockTask);

      const result = await verifyTask(input);

      expect(mockUpdateTaskSummary).not.toHaveBeenCalled();
      expect(mockUpdateTaskStatus).not.toHaveBeenCalled();
      expect(mockGetVerifyTaskPrompt).toHaveBeenCalledWith({
        task: mockTask,
        score: 75,
        summary: input.summary,
      });
      expect(result.content[0].text).toBe('Mock verify prompt content');
    });

    it('should handle edge case with score exactly at threshold', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
      });

      const input = {
        taskId,
        summary: 'Task meets minimum requirements but could benefit from additional improvements',
        score: 79.99, // Just below threshold
      };

      mockGetTaskById.mockResolvedValue(mockTask);

      await verifyTask(input);

      expect(mockUpdateTaskSummary).not.toHaveBeenCalled();
      expect(mockUpdateTaskStatus).not.toHaveBeenCalled();
    });
  });

  describe('Prompt Generation', () => {
    it('should call getVerifyTaskPrompt with correct parameters for passing score', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        name: 'Test Task',
        description: 'Test description',
        status: TaskStatus.IN_PROGRESS,
        implementationGuide: 'Test implementation guide',
        verificationCriteria: 'Test verification criteria',
        analysisResult: 'Test analysis result',
      });

      const input = {
        taskId,
        summary: 'Comprehensive task completion with excellent quality and thorough testing',
        score: 90,
      };

      mockGetTaskById.mockResolvedValue(mockTask);
      mockGetVerifyTaskPrompt.mockReturnValue('Custom passing prompt');

      const result = await verifyTask(input);

      expect(mockGetVerifyTaskPrompt).toHaveBeenCalledWith({
        task: mockTask,
        score: 90,
        summary: input.summary,
      });
      expect(result.content[0].text).toBe('Custom passing prompt');
    });

    it('should call getVerifyTaskPrompt with correct parameters for failing score', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
      });

      const input = {
        taskId,
        summary: 'Task requires significant improvements in multiple areas before completion',
        score: 60,
      };

      mockGetTaskById.mockResolvedValue(mockTask);
      mockGetVerifyTaskPrompt.mockReturnValue('Custom failing prompt');

      const result = await verifyTask(input);

      expect(mockGetVerifyTaskPrompt).toHaveBeenCalledWith({
        task: mockTask,
        score: 60,
        summary: input.summary,
      });
      expect(result.content[0].text).toBe('Custom failing prompt');
    });

    it('should return content in correct format', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
      });

      const input = {
        taskId,
        summary: 'Task verification summary with detailed feedback and recommendations',
        score: 85,
      };

      mockGetTaskById.mockResolvedValue(mockTask);

      const result = await verifyTask(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(typeof result.content[0].text).toBe('string');
      expect(result.isError).toBeUndefined();
    });
  });

  describe('Task Update Operations', () => {
    it('should update task summary and status in correct order for passing score', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
      });

      const input = {
        taskId,
        summary: 'Task successfully completed with all objectives met and quality standards exceeded',
        score: 88,
      };

      mockGetTaskById.mockResolvedValue(mockTask);

      await verifyTask(input);

      // Verify the order of operations
      expect(mockUpdateTaskSummary).toHaveBeenCalledBefore(mockUpdateTaskStatus as any);
      expect(mockUpdateTaskSummary).toHaveBeenCalledWith(taskId, input.summary);
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(taskId, TaskStatus.COMPLETED);
    });

    it('should propagate task update failures', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
      });

      const input = {
        taskId,
        summary: 'Task completion summary that will fail during update',
        score: 85,
      };

      mockGetTaskById.mockResolvedValue(mockTask);
      mockUpdateTaskSummary.mockRejectedValue(new Error('Update failed'));

      // Should throw error since verifyTask doesn't handle update failures
      await expect(verifyTask(input)).rejects.toThrow('Update failed');

      expect(mockUpdateTaskSummary).toHaveBeenCalledWith(taskId, input.summary);
      expect(mockUpdateTaskStatus).not.toHaveBeenCalled(); // Should not reach this point
    });

    it('should propagate status update failures', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
      });

      const input = {
        taskId,
        summary: 'Task completion summary with status update failure',
        score: 85,
      };

      mockGetTaskById.mockResolvedValue(mockTask);
      mockUpdateTaskSummary.mockResolvedValue(mockTask);
      mockUpdateTaskStatus.mockRejectedValue(new Error('Status update failed'));

      // Should throw error since verifyTask doesn't handle status update failures
      await expect(verifyTask(input)).rejects.toThrow('Status update failed');

      expect(mockUpdateTaskSummary).toHaveBeenCalledWith(taskId, input.summary);
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(taskId, TaskStatus.COMPLETED);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle minimum valid summary length', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
      });

      const input = {
        taskId,
        summary: 'Exactly thirty characters here!', // Exactly 30 characters
        score: 85,
      };

      mockGetTaskById.mockResolvedValue(mockTask);

      const result = await verifyTask(input);

      expect(result.content[0].text).toBe('Mock verify prompt content');
      expect(mockUpdateTaskSummary).toHaveBeenCalledWith(taskId, input.summary);
    });

    it('should handle very long summary', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        status: TaskStatus.IN_PROGRESS,
      });

      const longSummary = 'A'.repeat(1000) + ' - very long summary with detailed explanation';
      const input = {
        taskId,
        summary: longSummary,
        score: 90,
      };

      mockGetTaskById.mockResolvedValue(mockTask);

      const result = await verifyTask(input);

      expect(mockGetVerifyTaskPrompt).toHaveBeenCalledWith({
        task: mockTask,
        score: 90,
        summary: longSummary,
      });
      expect(result.content[0].text).toBe('Mock verify prompt content');
    });

    it('should handle task with all optional fields populated', async () => {
      const taskId = generateTestUUID();
      const mockTask = createMockTask({
        id: taskId,
        name: 'Complex Task',
        description: 'Complex task description',
        status: TaskStatus.IN_PROGRESS,
        notes: 'Important notes',
        implementationGuide: 'Detailed implementation guide',
        verificationCriteria: 'Comprehensive verification criteria',
        analysisResult: 'Thorough analysis result',
      });

      const input = {
        taskId,
        summary: 'Comprehensive verification of complex task with all components validated',
        score: 92,
      };

      mockGetTaskById.mockResolvedValue(mockTask);

      const result = await verifyTask(input);

      expect(mockGetVerifyTaskPrompt).toHaveBeenCalledWith({
        task: mockTask,
        score: 92,
        summary: input.summary,
      });
      expect(result.content[0].text).toBe('Mock verify prompt content');
    });
  });
});
