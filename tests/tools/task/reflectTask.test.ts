import { describe, it, expect, vi } from 'vitest';
import { reflectTask, reflectTaskSchema } from '../../../src/tools/task/reflectTask.js';
import { getTestDataDir } from '../../helpers/testUtils.js';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

// Note: We don't mock the prompt loader to test real functionality

describe('reflectTask Tool', () => {

  describe('Schema Validation', () => {
    it('should validate correct input', () => {
      const validInput = {
        summary: 'Create a comprehensive task management system',
        analysis: 'Complete technical analysis including architecture design, database schema, API endpoints, authentication system, and deployment strategy. The system uses TypeScript, Node.js, Express, and SQLite with proper error handling and validation.',
      };

      const result = reflectTaskSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.summary).toBe(validInput.summary);
        expect(result.data.analysis).toBe(validInput.analysis);
      }
    });

    it('should validate minimal required input', () => {
      const minimalInput = {
        summary: 'Valid task summary with enough characters',
        analysis: 'This is a valid technical analysis with more than one hundred characters to meet the minimum requirement for detailed technical analysis and implementation details.',
      };

      const result = reflectTaskSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
    });

    it('should reject input with short summary', () => {
      const invalidInput = {
        summary: 'Short', // Less than 10 characters
        analysis: 'This is a valid technical analysis with more than one hundred characters to meet the minimum requirement for detailed analysis.',
      };

      const result = reflectTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('不能少於10個字符');
    });

    it('should reject input with short analysis', () => {
      const invalidInput = {
        summary: 'Valid task summary with enough characters',
        analysis: 'Too short', // Less than 100 characters
      };

      const result = reflectTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('技術分析內容不夠詳盡');
    });

    it('should reject missing required fields', () => {
      const incompleteInputs = [
        { summary: 'Valid summary' }, // Missing analysis
        { analysis: 'Valid technical analysis with more than one hundred characters to meet the minimum requirement for detailed analysis.' }, // Missing summary
        {}, // Missing both
      ];

      incompleteInputs.forEach(input => {
        const result = reflectTaskSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('reflectTask Function', () => {
    it('should return correct format for valid input', async () => {
      const input = {
        summary: 'Implement user authentication system',
        analysis: 'Complete technical analysis: The authentication system will use JWT tokens for session management, bcrypt for password hashing with salt rounds of 12, and role-based access control (RBAC) with user roles stored in database. Implementation includes login endpoint with rate limiting, logout with token blacklisting, password reset with email verification, and middleware for route protection.',
      };

      const result = await reflectTask(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(typeof result.content[0].text).toBe('string');
      expect(result.content[0].text.length).toBeGreaterThan(0);
    });

    it('should return consistent template content', async () => {
      const input = {
        summary: 'Build a REST API for task management',
        analysis: 'Detailed technical analysis: The REST API will be built using Express.js with TypeScript, featuring CRUD operations for tasks, user authentication middleware, input validation using Zod schemas, error handling with custom error classes, standardized JSON responses, and comprehensive logging. Database operations will use SQLite with proper transaction handling.',
      };

      const result = await reflectTask(input);
      const outputText = result.content[0].text;

      // reflectTask should return a template for solution evaluation
      expect(outputText).toContain('solution');
      expect(typeof outputText).toBe('string');
      expect(outputText.length).toBeGreaterThan(0);
    });

    it('should generate different outputs for different inputs', async () => {
      const input1 = {
        summary: 'First task summary',
        analysis: 'First technical analysis with sufficient detail including architecture patterns, implementation strategies, technology choices, and deployment considerations for the first task.',
      };

      const input2 = {
        summary: 'Second task summary', 
        analysis: 'Second technical analysis with sufficient detail including different architecture patterns, alternative implementation strategies, different technology choices, and alternative deployment considerations for the second task.',
      };

      const result1 = await reflectTask(input1);
      const result2 = await reflectTask(input2);

      // reflectTask uses templates that include the input parameters
      // so different inputs should produce different outputs
      expect(result1.content[0].text).not.toBe(result2.content[0].text);
      expect(result1.content[0].text).toContain('First task summary');
      expect(result2.content[0].text).toContain('Second task summary');
    });

    it('should maintain consistent return structure', async () => {
      const input = {
        summary: 'Test consistent return structure',
        analysis: 'This test verifies that the reflectTask function always returns the same structure regardless of input content. The analysis includes technical details and implementation considerations.',
      };

      const result = await reflectTask(input);

      expect(result).toHaveProperty('content');
      expect(Array.isArray(result.content)).toBe(true);
      expect(result.content[0]).toHaveProperty('type');
      expect(result.content[0]).toHaveProperty('text');
      expect(result.content[0].type).toBe('text');
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary length inputs', async () => {
      const input = {
        summary: '1234567890', // Exactly 10 characters
        analysis: '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890', // Exactly 100 characters
      };

      const schemaResult = reflectTaskSchema.safeParse(input);
      expect(schemaResult.success).toBe(true);

      const functionResult = await reflectTask(input);
      expect(functionResult.content).toHaveLength(1);
      expect(functionResult.content[0].type).toBe('text');
    });

    it('should handle very long inputs', async () => {
      const longSummary = 'A'.repeat(1000);
      const longAnalysis = 'B'.repeat(2000);

      const input = {
        summary: longSummary,
        analysis: longAnalysis,
      };

      const result = await reflectTask(input);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });

    it('should handle special characters in input', async () => {
      const input = {
        summary: 'Task with special chars: @#$%^&*()_+-=[]{}|;:,.<>?',
        analysis: 'Technical analysis with unicode: 中文字符, émojis 🚀, symbols ∑∆∏∫, and detailed implementation considerations including error handling and validation.',
      };

      const result = await reflectTask(input);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });
  });
});
