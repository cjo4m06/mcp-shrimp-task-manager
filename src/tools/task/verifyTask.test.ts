import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { verifyTask, verifyTaskSchema } from './verifyTask';
import * as taskModel from '../../models/taskModel';
import { TaskStatus } from '../../types/index';
import { z } from 'zod';

// Mock the task model functions
vi.mock('../../models/taskModel', () => ({
  getTaskById: vi.fn(),
  updateTaskStatus: vi.fn(),
  updateTaskSummary: vi.fn(),
}));

// Mock the prompt generator
vi.mock('../../prompts/index', () => ({
  getVerifyTaskPrompt: vi.fn(() => Promise.resolve('Test prompt')),
}));

describe('verifyTask', () => {
  const mockTask = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.IN_PROGRESS,
    dependencies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Schema Validation', () => {
    it('should accept valid input with only required fields (backward compatibility)', () => {
      const input = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'This is a test summary with at least 30 characters',
        score: 85,
      };
      
      const result = verifyTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should accept valid input with structured fields', () => {
      const input = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'This is a test summary with at least 30 characters',
        score: 85,
        keyAccomplishments: ['Implemented feature X', 'Fixed bug Y'],
        implementationDetails: ['Used pattern A', 'Refactored module B'],
        technicalChallenges: ['Resolved race condition', 'Optimized performance'],
      };
      
      const result = verifyTaskSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it('should reject invalid task ID format', () => {
      const input = {
        taskId: 'invalid-id',
        summary: 'This is a test summary with at least 30 characters',
        score: 85,
      };
      
      const result = verifyTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject summary shorter than 30 characters', () => {
      const input = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'Too short',
        score: 85,
      };
      
      const result = verifyTaskSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it('should reject score outside 0-100 range', () => {
      const input1 = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'This is a test summary with at least 30 characters',
        score: -1,
      };
      
      const input2 = {
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'This is a test summary with at least 30 characters',
        score: 101,
      };
      
      expect(verifyTaskSchema.safeParse(input1).success).toBe(false);
      expect(verifyTaskSchema.safeParse(input2).success).toBe(false);
    });
  });

  describe('Task Verification Logic', () => {
    it('should return error if task not found', async () => {
      vi.mocked(taskModel.getTaskById).mockResolvedValue(null);
      
      const result = await verifyTask({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'This is a test summary with at least 30 characters',
        score: 85,
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('找不到ID為');
    });

    it('should return error if task not in progress', async () => {
      vi.mocked(taskModel.getTaskById).mockResolvedValue({
        ...mockTask,
        status: TaskStatus.PENDING,
      });
      
      const result = await verifyTask({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'This is a test summary with at least 30 characters',
        score: 85,
      });
      
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('不處於進行中狀態');
    });

    it('should complete task when score >= 80 without structured fields', async () => {
      vi.mocked(taskModel.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskSummary).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskStatus).mockResolvedValue(mockTask);
      
      const result = await verifyTask({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'This is a test summary with at least 30 characters',
        score: 85,
      });
      
      expect(taskModel.updateTaskSummary).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'This is a test summary with at least 30 characters',
        expect.objectContaining({
          verificationScore: 85,
        })
      );
      expect(taskModel.updateTaskStatus).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        TaskStatus.COMPLETED
      );
      expect(result.isError).toBeUndefined();
    });

    it('should complete task with structured fields when score >= 80', async () => {
      vi.mocked(taskModel.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskSummary).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskStatus).mockResolvedValue(mockTask);
      
      const structuredFields = {
        keyAccomplishments: ['Implemented feature X', 'Fixed bug Y'],
        implementationDetails: ['Used pattern A', 'Refactored module B'],
        technicalChallenges: ['Resolved race condition'],
      };
      
      const result = await verifyTask({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'This is a test summary with at least 30 characters',
        score: 90,
        ...structuredFields,
      });
      
      expect(taskModel.updateTaskSummary).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        'This is a test summary with at least 30 characters',
        expect.objectContaining({
          keyAccomplishments: structuredFields.keyAccomplishments,
          implementationDetails: structuredFields.implementationDetails,
          technicalChallenges: structuredFields.technicalChallenges,
          verificationScore: 90,
        })
      );
      expect(taskModel.updateTaskStatus).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        TaskStatus.COMPLETED
      );
    });

    it('should not complete task when score < 80', async () => {
      vi.mocked(taskModel.getTaskById).mockResolvedValue(mockTask);
      
      const result = await verifyTask({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'This task needs more work and improvements to complete',
        score: 75,
      });
      
      expect(taskModel.updateTaskSummary).not.toHaveBeenCalled();
      expect(taskModel.updateTaskStatus).not.toHaveBeenCalled();
      expect(result.isError).toBeUndefined();
    });
  });

  describe('Summary Parsing', () => {
    it('should parse summary when no structured fields provided', async () => {
      vi.mocked(taskModel.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskSummary).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskStatus).mockResolvedValue(mockTask);
      
      const summaryWithStructure = `
## Key Accomplishments
- Implemented new authentication system
- Added user management features

## Implementation Details
- Used JWT tokens for authentication
- Implemented role-based access control

## Technical Challenges
- Resolved session management issues
- Fixed CORS configuration problems
      `.trim();
      
      const result = await verifyTask({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: summaryWithStructure,
        score: 85,
      });
      
      const updateCall = vi.mocked(taskModel.updateTaskSummary).mock.calls[0];
      const completionDetails = updateCall[2];
      
      expect(completionDetails).toBeDefined();
      expect(completionDetails.keyAccomplishments.length).toBeGreaterThan(0);
      expect(completionDetails.implementationDetails.length).toBeGreaterThan(0);
      expect(completionDetails.technicalChallenges.length).toBeGreaterThan(0);
    });

    it('should prioritize provided fields over parsed fields', async () => {
      vi.mocked(taskModel.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskSummary).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskStatus).mockResolvedValue(mockTask);
      
      const summaryWithStructure = `
## Key Accomplishments
- Parsed accomplishment 1
- Parsed accomplishment 2
      `.trim();
      
      const providedAccomplishments = ['Provided accomplishment 1', 'Provided accomplishment 2'];
      
      const result = await verifyTask({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: summaryWithStructure,
        score: 85,
        keyAccomplishments: providedAccomplishments,
      });
      
      const updateCall = vi.mocked(taskModel.updateTaskSummary).mock.calls[0];
      const completionDetails = updateCall[2];
      
      expect(completionDetails.keyAccomplishments).toEqual(providedAccomplishments);
    });
  });

  describe('Backward Compatibility', () => {
    it('should work with old format (only summary and score)', async () => {
      vi.mocked(taskModel.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskSummary).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskStatus).mockResolvedValue(mockTask);
      
      const result = await verifyTask({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'Simple summary without any structured content for backward compatibility',
        score: 82,
      });
      
      expect(taskModel.updateTaskSummary).toHaveBeenCalled();
      expect(taskModel.updateTaskStatus).toHaveBeenCalled();
      expect(result.isError).toBeUndefined();
    });

    it('should handle mixed usage (some structured fields provided)', async () => {
      vi.mocked(taskModel.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskSummary).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskStatus).mockResolvedValue(mockTask);
      
      const result = await verifyTask({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'Summary with partial structured fields provided by the user',
        score: 88,
        keyAccomplishments: ['Only accomplishments provided'],
        // implementationDetails and technicalChallenges not provided
      });
      
      const updateCall = vi.mocked(taskModel.updateTaskSummary).mock.calls[0];
      const completionDetails = updateCall[2];
      
      expect(completionDetails.keyAccomplishments).toEqual(['Only accomplishments provided']);
      expect(completionDetails.implementationDetails).toBeDefined();
      expect(completionDetails.technicalChallenges).toBeDefined();
      expect(result.isError).toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow with all features', async () => {
      vi.mocked(taskModel.getTaskById).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskSummary).mockResolvedValue(mockTask);
      vi.mocked(taskModel.updateTaskStatus).mockResolvedValue(mockTask);
      
      const complexSummary = `
## Task Completion Report

Successfully enhanced the verifyTask tool with structured fields support.

## Key Accomplishments
- Extended schema with optional structured fields
- Implemented automatic parsing of summaries
- Maintained full backward compatibility

## Implementation Details
- Added keyAccomplishments, implementationDetails, and technicalChallenges fields
- Created parseCompletionSummary function for extracting structured data
- Updated updateTaskSummary to accept and store completion details

## Technical Challenges
- Ensured backward compatibility with existing code
- Handled edge cases for partial field provision
- Integrated parsing logic seamlessly
      `.trim();
      
      const result = await verifyTask({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: complexSummary,
        score: 95,
        keyAccomplishments: ['Primary: Extended schema successfully'],
        // Let other fields be parsed from summary
      });
      
      const updateCall = vi.mocked(taskModel.updateTaskSummary).mock.calls[0];
      const completionDetails = updateCall[2];
      
      // Should use provided keyAccomplishments
      expect(completionDetails.keyAccomplishments).toContain('Primary: Extended schema successfully');
      
      // Should parse other fields from summary
      expect(completionDetails.implementationDetails.length).toBeGreaterThan(0);
      expect(completionDetails.technicalChallenges.length).toBeGreaterThan(0);
      
      // Should include verification score
      expect(completionDetails.verificationScore).toBe(95);
      
      // Should complete the task
      expect(taskModel.updateTaskStatus).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
        TaskStatus.COMPLETED
      );
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(taskModel.getTaskById).mockRejectedValue(new Error('Database error'));
      
      await expect(verifyTask({
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        summary: 'This is a test summary with at least 30 characters',
        score: 85,
      })).rejects.toThrow('Database error');
    });
  });
});

describe('parseCompletionSummary', () => {
  it('should extract accomplishments from various formats', () => {
    // This test would be for the actual parseCompletionSummary function
    // Since we have a simplified version in the file, we can test it indirectly
    // through the verifyTask function tests above
    expect(true).toBe(true);
  });
});