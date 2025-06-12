import { describe, it, expect, beforeEach, vi } from 'vitest';
import { processThought, processThoughtSchema } from '../../../src/tools/thought/processThought.js';
import { getTestDataDir } from '../../helpers/testUtils.js';
import * as promptsIndex from '../../../src/prompts/generators/processThought.js';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(() => Promise.resolve(getTestDataDir())),
}));

// Mock the prompts
vi.mock('../../../src/prompts/generators/processThought.js', () => ({
  getProcessThoughtPrompt: vi.fn(),
}));

describe('processThought Tool', () => {
  const mockGetProcessThoughtPrompt = vi.mocked(promptsIndex.getProcessThoughtPrompt);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockGetProcessThoughtPrompt.mockReturnValue('Mock formatted thought content');
  });

  describe('Schema Validation', () => {
    it('should validate correct input with all required fields', () => {
      const validInput = {
        thought: 'This is a valid thought content',
        thought_number: 1,
        total_thoughts: 5,
        next_thought_needed: true,
        stage: 'Problem Definition',
        tags: ['analysis', 'planning'],
        axioms_used: ['SOLID principles', 'DRY principle'],
        assumptions_challenged: ['User always provides valid input'],
      };

      const result = processThoughtSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate minimal valid input with only required fields', () => {
      const minimalInput = {
        thought: 'Minimal thought content',
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: false,
        stage: 'Analysis',
      };

      const result = processThoughtSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
    });

    it('should reject input with empty thought content', () => {
      const invalidInput = {
        thought: '', // Empty thought
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: true,
        stage: 'Analysis',
      };

      const result = processThoughtSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('思維內容不能為空');
    });

    it('should reject input with non-positive thought_number', () => {
      const invalidInput = {
        thought: 'Valid thought content',
        thought_number: 0, // Non-positive number
        total_thoughts: 3,
        next_thought_needed: true,
        stage: 'Analysis',
      };

      const result = processThoughtSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('思維編號必須是正整數');
    });

    it('should reject input with non-positive total_thoughts', () => {
      const invalidInput = {
        thought: 'Valid thought content',
        thought_number: 1,
        total_thoughts: -1, // Negative number
        next_thought_needed: true,
        stage: 'Analysis',
      };

      const result = processThoughtSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('總思維數必須是正整數');
    });

    it('should reject input with empty stage', () => {
      const invalidInput = {
        thought: 'Valid thought content',
        thought_number: 1,
        total_thoughts: 3,
        next_thought_needed: true,
        stage: '', // Empty stage
      };

      const result = processThoughtSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('思維階段不能為空');
    });

    it('should reject input with non-integer thought_number', () => {
      const invalidInput = {
        thought: 'Valid thought content',
        thought_number: 1.5, // Non-integer
        total_thoughts: 3,
        next_thought_needed: true,
        stage: 'Analysis',
      };

      const result = processThoughtSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject input with non-integer total_thoughts', () => {
      const invalidInput = {
        thought: 'Valid thought content',
        thought_number: 1,
        total_thoughts: 3.7, // Non-integer
        next_thought_needed: true,
        stage: 'Analysis',
      };

      const result = processThoughtSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should accept valid stage values', () => {
      const validStages = [
        'Problem Definition',
        'Information Gathering',
        'Research',
        'Analysis',
        'Synthesis',
        'Conclusion',
        'Critical Questioning',
        'Planning',
      ];

      validStages.forEach((stage) => {
        const input = {
          thought: 'Valid thought content',
          thought_number: 1,
          total_thoughts: 3,
          next_thought_needed: true,
          stage,
        };

        const result = processThoughtSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Thought Number Auto-adjustment Logic', () => {
    it('should auto-adjust total_thoughts when thought_number exceeds it', async () => {
      const input = {
        thought: 'This thought exceeds the total count',
        thought_number: 5,
        total_thoughts: 3, // Less than thought_number
        next_thought_needed: true,
        stage: 'Analysis',
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith({
        thought: input.thought,
        thoughtNumber: 5,
        totalThoughts: 5, // Should be adjusted to match thought_number
        nextThoughtNeeded: true,
        stage: input.stage,
        tags: [],
        axioms_used: [],
        assumptions_challenged: [],
      });
    });

    it('should not adjust total_thoughts when thought_number is within range', async () => {
      const input = {
        thought: 'This thought is within range',
        thought_number: 2,
        total_thoughts: 5, // Greater than thought_number
        next_thought_needed: false,
        stage: 'Synthesis',
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith({
        thought: input.thought,
        thoughtNumber: 2,
        totalThoughts: 5, // Should remain unchanged
        nextThoughtNeeded: false,
        stage: input.stage,
        tags: [],
        axioms_used: [],
        assumptions_challenged: [],
      });
    });

    it('should handle edge case when thought_number equals total_thoughts', async () => {
      const input = {
        thought: 'Final thought',
        thought_number: 3,
        total_thoughts: 3, // Equal to thought_number
        next_thought_needed: false,
        stage: 'Conclusion',
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith({
        thought: input.thought,
        thoughtNumber: 3,
        totalThoughts: 3, // Should remain unchanged
        nextThoughtNeeded: false,
        stage: input.stage,
        tags: [],
        axioms_used: [],
        assumptions_challenged: [],
      });
    });
  });

  describe('Data Transformation', () => {
    it('should transform input parameters to ProcessThoughtPromptParams correctly', async () => {
      const input = {
        thought: 'Complex thought with all parameters',
        thought_number: 2,
        total_thoughts: 4,
        next_thought_needed: true,
        stage: 'Critical Questioning',
        tags: ['review', 'validation'],
        axioms_used: ['Single Responsibility', 'Open/Closed Principle'],
        assumptions_challenged: ['All inputs are valid', 'Network is always available'],
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith({
        thought: 'Complex thought with all parameters',
        thoughtNumber: 2,
        totalThoughts: 4,
        nextThoughtNeeded: true,
        stage: 'Critical Questioning',
        tags: ['review', 'validation'],
        axioms_used: ['Single Responsibility', 'Open/Closed Principle'],
        assumptions_challenged: ['All inputs are valid', 'Network is always available'],
      });
    });

    it('should handle undefined optional arrays by converting to empty arrays', async () => {
      const input = {
        thought: 'Thought without optional arrays',
        thought_number: 1,
        total_thoughts: 2,
        next_thought_needed: true,
        stage: 'Information Gathering',
        // tags, axioms_used, assumptions_challenged are undefined
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith({
        thought: 'Thought without optional arrays',
        thoughtNumber: 1,
        totalThoughts: 2,
        nextThoughtNeeded: true,
        stage: 'Information Gathering',
        tags: [], // Should be empty array
        axioms_used: [], // Should be empty array
        assumptions_challenged: [], // Should be empty array
      });
    });

    it('should handle empty optional arrays correctly', async () => {
      const input = {
        thought: 'Thought with empty arrays',
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false,
        stage: 'Planning',
        tags: [],
        axioms_used: [],
        assumptions_challenged: [],
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith({
        thought: 'Thought with empty arrays',
        thoughtNumber: 1,
        totalThoughts: 1,
        nextThoughtNeeded: false,
        stage: 'Planning',
        tags: [],
        axioms_used: [],
        assumptions_challenged: [],
      });
    });
  });

  describe('Prompt Generation', () => {
    it('should call getProcessThoughtPrompt with correct parameters', async () => {
      const input = {
        thought: 'Test thought for prompt generation',
        thought_number: 3,
        total_thoughts: 5,
        next_thought_needed: true,
        stage: 'Research',
        tags: ['testing', 'validation'],
        axioms_used: ['Test-driven development'],
        assumptions_challenged: ['Code is always correct'],
      };

      mockGetProcessThoughtPrompt.mockReturnValue('Custom formatted prompt');

      const result = await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith({
        thought: 'Test thought for prompt generation',
        thoughtNumber: 3,
        totalThoughts: 5,
        nextThoughtNeeded: true,
        stage: 'Research',
        tags: ['testing', 'validation'],
        axioms_used: ['Test-driven development'],
        assumptions_challenged: ['Code is always correct'],
      });

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toBe('Custom formatted prompt');
    });

    it('should return content in correct format', async () => {
      const input = {
        thought: 'Simple thought',
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false,
        stage: 'Conclusion',
      };

      const result = await processThought(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({
        type: 'text',
        text: 'Mock formatted thought content',
      });
    });

    it('should handle different prompt content correctly', async () => {
      const input = {
        thought: 'Another test thought',
        thought_number: 2,
        total_thoughts: 3,
        next_thought_needed: true,
        stage: 'Analysis',
      };

      mockGetProcessThoughtPrompt.mockReturnValue('Different prompt content with special characters: @#$%');

      const result = await processThought(input);

      expect(result.content[0].text).toBe('Different prompt content with special characters: @#$%');
    });
  });

  describe('Error Handling', () => {
    it('should handle errors from getProcessThoughtPrompt gracefully', async () => {
      const input = {
        thought: 'Thought that will cause error',
        thought_number: 1,
        total_thoughts: 2,
        next_thought_needed: true,
        stage: 'Problem Definition',
      };

      mockGetProcessThoughtPrompt.mockImplementation(() => {
        throw new Error('Prompt generation failed');
      });

      const result = await processThought(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('處理思維時發生錯誤');
      expect(result.content[0].text).toContain('Prompt generation failed');
    });

    it('should handle non-Error exceptions', async () => {
      const input = {
        thought: 'Thought that will cause string error',
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false,
        stage: 'Analysis',
      };

      mockGetProcessThoughtPrompt.mockImplementation(() => {
        throw 'String error message';
      });

      const result = await processThought(input);

      expect(result.content[0].text).toContain('處理思維時發生錯誤');
      expect(result.content[0].text).toContain('未知錯誤'); // Non-Error exceptions are treated as unknown errors
    });

    it('should handle unknown error types', async () => {
      const input = {
        thought: 'Thought that will cause unknown error',
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false,
        stage: 'Synthesis',
      };

      mockGetProcessThoughtPrompt.mockImplementation(() => {
        throw null; // Unusual error type
      });

      const result = await processThought(input);

      expect(result.content[0].text).toContain('處理思維時發生錯誤');
      expect(result.content[0].text).toContain('未知錯誤');
    });

    it('should handle errors during parameter transformation', async () => {
      const input = {
        thought: 'Valid thought',
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false,
        stage: 'Planning',
      };

      // Mock an error that occurs before getProcessThoughtPrompt is called
      const originalProcessThought = processThought;

      // This test verifies the try-catch structure works for any error
      mockGetProcessThoughtPrompt.mockImplementation(() => {
        throw new Error('Parameter transformation error');
      });

      const result = await processThought(input);

      expect(result.content[0].text).toContain('處理思維時發生錯誤');
      expect(result.content[0].text).toContain('Parameter transformation error');
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle very large thought numbers', async () => {
      const input = {
        thought: 'Thought with large number',
        thought_number: 999999,
        total_thoughts: 1000000,
        next_thought_needed: true,
        stage: 'Analysis',
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          thoughtNumber: 999999,
          totalThoughts: 1000000,
        })
      );
    });

    it('should handle very long thought content', async () => {
      const longThought = 'A'.repeat(10000) + ' - very long thought content';
      const input = {
        thought: longThought,
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false,
        stage: 'Information Gathering',
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          thought: longThought,
        })
      );
    });

    it('should handle arrays with many elements', async () => {
      const manyTags = Array.from({ length: 100 }, (_, i) => `tag${i}`);
      const manyAxioms = Array.from({ length: 50 }, (_, i) => `axiom${i}`);
      const manyAssumptions = Array.from({ length: 30 }, (_, i) => `assumption${i}`);

      const input = {
        thought: 'Thought with many array elements',
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false,
        stage: 'Critical Questioning',
        tags: manyTags,
        axioms_used: manyAxioms,
        assumptions_challenged: manyAssumptions,
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: manyTags,
          axioms_used: manyAxioms,
          assumptions_challenged: manyAssumptions,
        })
      );
    });

    it('should handle special characters in all string fields', async () => {
      const input = {
        thought: 'Thought with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: true,
        stage: 'Problem Definition with special chars: !@#',
        tags: ['tag with spaces', 'tag-with-dashes', 'tag_with_underscores'],
        axioms_used: ['Axiom: "quoted text"', "Axiom with 'single quotes'"],
        assumptions_challenged: ['Assumption with newline\ncharacter', 'Assumption with tab\tcharacter'],
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          thought: 'Thought with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
          stage: 'Problem Definition with special chars: !@#',
          tags: ['tag with spaces', 'tag-with-dashes', 'tag_with_underscores'],
          axioms_used: ['Axiom: "quoted text"', "Axiom with 'single quotes'"],
          assumptions_challenged: ['Assumption with newline\ncharacter', 'Assumption with tab\tcharacter'],
        })
      );
    });

    it('should handle maximum auto-adjustment scenario', async () => {
      const input = {
        thought: 'Thought requiring maximum adjustment',
        thought_number: Number.MAX_SAFE_INTEGER,
        total_thoughts: 1,
        next_thought_needed: false,
        stage: 'Conclusion',
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          thoughtNumber: Number.MAX_SAFE_INTEGER,
          totalThoughts: Number.MAX_SAFE_INTEGER, // Should be adjusted
        })
      );
    });

    it('should handle unicode characters in content', async () => {
      const input = {
        thought: '思維內容包含中文字符 🤔💭 and emojis',
        thought_number: 1,
        total_thoughts: 1,
        next_thought_needed: false,
        stage: '分析階段 Analysis',
        tags: ['中文標籤', 'English tag', '🏷️'],
        axioms_used: ['原則一', 'Principle Two'],
        assumptions_challenged: ['假設一', 'Assumption Two'],
      };

      await processThought(input);

      expect(mockGetProcessThoughtPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          thought: '思維內容包含中文字符 🤔💭 and emojis',
          stage: '分析階段 Analysis',
          tags: ['中文標籤', 'English tag', '🏷️'],
          axioms_used: ['原則一', 'Principle Two'],
          assumptions_challenged: ['假設一', 'Assumption Two'],
        })
      );
    });
  });
});
