import { describe, it, expect, vi } from 'vitest';
import { analyzeTask, analyzeTaskSchema } from '../../../src/tools/task/analyzeTask.js';
import { getTestDataDir } from '../../helpers/testUtils.js';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

// Note: We don't mock the prompt loader to test real functionality

describe('analyzeTask Tool', () => {

  describe('Schema Validation', () => {
    it('should validate correct input', () => {
      const validInput = {
        summary: 'Create a comprehensive task management system',
        initialConcept: 'Build a TypeScript-based task management system using Node.js, Express, and SQLite. The system should support task creation, dependency tracking, and status management with a clean REST API interface.',
        previousAnalysis: 'Previous analysis showed need for better error handling',
      };

      const result = analyzeTaskSchema.safeParse(validInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.summary).toBe(validInput.summary);
        expect(result.data.initialConcept).toBe(validInput.initialConcept);
        expect(result.data.previousAnalysis).toBe(validInput.previousAnalysis);
      }
    });

    it('should validate minimal required input', () => {
      const minimalInput = {
        summary: 'Valid task summary with enough characters',
        initialConcept: 'This is a valid initial concept with more than fifty characters to meet the minimum requirement for detailed technical analysis.',
      };

      const result = analyzeTaskSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.previousAnalysis).toBeUndefined();
      }
    });

    it('should reject input with short summary', () => {
      const invalidInput = {
        summary: 'Short', // Less than 10 characters
        initialConcept: 'This is a valid initial concept with more than fifty characters to meet the minimum requirement.',
      };

      const result = analyzeTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('不能少於10個字符');
    });

    it('should reject input with short initialConcept', () => {
      const invalidInput = {
        summary: 'Valid task summary with enough characters',
        initialConcept: 'Too short', // Less than 50 characters
      };

      const result = analyzeTaskSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('不能少於50個字符');
    });

    it('should accept empty previousAnalysis', () => {
      const inputWithEmptyPrevious = {
        summary: 'Valid task summary with enough characters',
        initialConcept: 'This is a valid initial concept with more than fifty characters to meet the minimum requirement for analysis.',
        previousAnalysis: '',
      };

      const result = analyzeTaskSchema.safeParse(inputWithEmptyPrevious);
      expect(result.success).toBe(true);
    });

    it('should reject missing required fields', () => {
      const incompleteInputs = [
        { summary: 'Valid summary' }, // Missing initialConcept
        { initialConcept: 'Valid initial concept with more than fifty characters' }, // Missing summary
        {}, // Missing both
      ];

      incompleteInputs.forEach(input => {
        const result = analyzeTaskSchema.safeParse(input);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('analyzeTask Function', () => {
    it('should return correct format for valid input', async () => {
      const input = {
        summary: 'Implement user authentication system',
        initialConcept: 'Create a secure authentication system using JWT tokens, bcrypt for password hashing, and role-based access control. The system should include login, logout, and password reset functionality.',
      };

      const result = await analyzeTask(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(typeof result.content[0].text).toBe('string');
      expect(result.content[0].text.length).toBeGreaterThan(0);
    });

    it('should return consistent template content', async () => {
      const input = {
        summary: 'Build a REST API for task management',
        initialConcept: 'Design and implement a RESTful API using Express.js and TypeScript. The API should support CRUD operations for tasks, user authentication, and proper error handling with standardized response formats.',
        previousAnalysis: 'Previous iteration identified need for better validation and error handling',
      };

      const result = await analyzeTask(input);
      const outputText = result.content[0].text;

      // analyzeTask returns a fixed template for code analysis guidance
      expect(outputText).toContain('Codebase Analysis');
      expect(outputText).toContain('Structural Integrity Check');
      expect(outputText).toContain('reflect_task');
    });

    it('should handle input without previousAnalysis', async () => {
      const input = {
        summary: 'Create database schema for task management',
        initialConcept: 'Design a normalized database schema using SQLite with tables for users, tasks, dependencies, and audit logs. Include proper indexing and foreign key constraints.',
      };

      const result = await analyzeTask(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(typeof result.content[0].text).toBe('string');
    });

    it('should generate different outputs for different inputs', async () => {
      const input1 = {
        summary: 'First task summary',
        initialConcept: 'First initial concept with sufficient length to meet the minimum character requirement for detailed analysis.',
      };

      const input2 = {
        summary: 'Second task summary',
        initialConcept: 'Second initial concept with sufficient length to meet the minimum character requirement for detailed analysis.',
      };

      const result1 = await analyzeTask(input1);
      const result2 = await analyzeTask(input2);

      // analyzeTask uses templates that include the input parameters
      // so different inputs should produce different outputs
      expect(result1.content[0].text).not.toBe(result2.content[0].text);
      expect(result1.content[0].text).toContain('First task summary');
      expect(result2.content[0].text).toContain('Second task summary');
    });

    it('should maintain consistent return structure', async () => {
      const input = {
        summary: 'Test consistent return structure',
        initialConcept: 'This test verifies that the analyzeTask function always returns the same structure regardless of input content.',
      };

      const result = await analyzeTask(input);

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
        initialConcept: '12345678901234567890123456789012345678901234567890', // Exactly 50 characters
      };

      const schemaResult = analyzeTaskSchema.safeParse(input);
      expect(schemaResult.success).toBe(true);

      const functionResult = await analyzeTask(input);
      expect(functionResult.content).toHaveLength(1);
      expect(functionResult.content[0].type).toBe('text');
    });

    it('should handle very long inputs', async () => {
      const longSummary = 'A'.repeat(1000);
      const longConcept = 'B'.repeat(2000);
      const longPrevious = 'C'.repeat(1500);

      const input = {
        summary: longSummary,
        initialConcept: longConcept,
        previousAnalysis: longPrevious,
      };

      const result = await analyzeTask(input);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });

    it('should handle special characters in input', async () => {
      const input = {
        summary: 'Task with special chars: @#$%^&*()_+-=[]{}|;:,.<>?',
        initialConcept: 'Initial concept with unicode: 中文字符, émojis 🚀, and symbols ∑∆∏∫',
      };

      const result = await analyzeTask(input);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
    });
  });
});
