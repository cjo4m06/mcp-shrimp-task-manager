import { describe, it, expect, beforeEach, vi } from 'vitest';
import { researchMode, researchModeSchema } from '../../../src/tools/research/researchMode.js';
import { getTestDataDir } from '../../helpers/testUtils.js';
import * as promptsIndex from '../../../src/prompts/index.js';
import * as projectDetector from '../../../src/utils/projectDetector.js';
import path from 'path';

// Mock the project detector
vi.mock('../../../src/utils/projectDetector.js', () => ({
  getProjectDataDir: vi.fn(),
}));

// Mock the prompts
vi.mock('../../../src/prompts/index.js', () => ({
  getResearchModePrompt: vi.fn(),
}));

describe('researchMode Tool', () => {
  const mockGetProjectDataDir = vi.mocked(projectDetector.getProjectDataDir);
  const mockGetResearchModePrompt = vi.mocked(promptsIndex.getResearchModePrompt);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockGetProjectDataDir.mockResolvedValue(getTestDataDir());
    mockGetResearchModePrompt.mockReturnValue('Mock research mode prompt content');
  });

  describe('Schema Validation', () => {
    it('should validate correct input with all required fields', () => {
      const validInput = {
        topic: 'React hooks best practices',
        previousState: 'Previous research on React hooks',
        currentState: 'Analyzing useEffect optimization patterns',
        nextSteps: 'Research custom hooks implementation',
      };

      const result = researchModeSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should validate minimal valid input with only required fields', () => {
      const minimalInput = {
        topic: 'TypeScript generics',
        currentState: 'Researching generic constraints',
        nextSteps: 'Study advanced generic patterns',
      };

      const result = researchModeSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
    });

    it('should reject input with short topic', () => {
      const invalidInput = {
        topic: 'JS', // Less than 5 characters
        currentState: 'Researching JavaScript',
        nextSteps: 'Study ES6 features',
      };

      const result = researchModeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('研究主題不能少於5個字符');
    });

    it('should reject input with empty topic', () => {
      const invalidInput = {
        topic: '', // Empty topic
        currentState: 'Researching something',
        nextSteps: 'Continue research',
      };

      const result = researchModeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toContain('研究主題不能少於5個字符');
    });

    it('should reject input with missing currentState', () => {
      const invalidInput = {
        topic: 'Valid topic',
        nextSteps: 'Continue research',
        // currentState is missing
      };

      const result = researchModeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should reject input with missing nextSteps', () => {
      const invalidInput = {
        topic: 'Valid topic',
        currentState: 'Researching something',
        // nextSteps is missing
      };

      const result = researchModeSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('should handle previousState default value', () => {
      const input = {
        topic: 'Valid topic',
        currentState: 'Researching something',
        nextSteps: 'Continue research',
        // previousState is not provided
      };

      const result = researchModeSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.previousState).toBe('');
      }
    });

    it('should accept valid topic at minimum length', () => {
      const input = {
        topic: '12345', // Exactly 5 characters
        currentState: 'Researching',
        nextSteps: 'Next steps',
      };

      const result = researchModeSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe('Data Directory Management', () => {
    it('should call getProjectDataDir with base directory', async () => {
      const input = {
        topic: 'Testing data directory',
        currentState: 'Testing directory resolution',
        nextSteps: 'Verify directory structure',
      };

      await researchMode(input);

      // Verify that getProjectDataDir was called with some directory path
      expect(mockGetProjectDataDir).toHaveBeenCalledWith(
        expect.any(String)
      );
      expect(mockGetProjectDataDir).toHaveBeenCalledTimes(1);
    });

    it('should handle custom DATA_DIR environment variable', async () => {
      const originalDataDir = process.env.DATA_DIR;
      process.env.DATA_DIR = '/custom/data/dir';

      const input = {
        topic: 'Testing custom data dir',
        currentState: 'Testing custom directory',
        nextSteps: 'Verify custom path',
      };

      await researchMode(input);

      expect(mockGetProjectDataDir).toHaveBeenCalledWith('/custom/data/dir');

      // Restore original environment
      if (originalDataDir !== undefined) {
        process.env.DATA_DIR = originalDataDir;
      } else {
        delete process.env.DATA_DIR;
      }
    });

    it('should use default data directory when DATA_DIR is not set', async () => {
      const originalDataDir = process.env.DATA_DIR;
      delete process.env.DATA_DIR;

      const input = {
        topic: 'Testing default data dir',
        currentState: 'Testing default directory',
        nextSteps: 'Verify default path',
      };

      await researchMode(input);

      expect(mockGetProjectDataDir).toHaveBeenCalledWith(
        expect.stringMatching(/.*[/\\]data$/)
      );

      // Restore original environment
      if (originalDataDir !== undefined) {
        process.env.DATA_DIR = originalDataDir;
      }
    });

    it('should handle getProjectDataDir errors gracefully', async () => {
      const input = {
        topic: 'Testing directory error',
        currentState: 'Testing error handling',
        nextSteps: 'Handle errors',
      };

      mockGetProjectDataDir.mockRejectedValue(new Error('Directory access failed'));

      await expect(researchMode(input)).rejects.toThrow('Directory access failed');
    });
  });

  describe('Prompt Generation', () => {
    it('should call getResearchModePrompt with correct parameters', async () => {
      const input = {
        topic: 'Advanced TypeScript patterns',
        previousState: 'Studied basic TypeScript features',
        currentState: 'Researching advanced generic patterns',
        nextSteps: 'Explore conditional types and mapped types',
      };

      const testDataDir = getTestDataDir();
      mockGetProjectDataDir.mockResolvedValue(testDataDir);

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith({
        topic: 'Advanced TypeScript patterns',
        previousState: 'Studied basic TypeScript features',
        currentState: 'Researching advanced generic patterns',
        nextSteps: 'Explore conditional types and mapped types',
        memoryDir: path.join(testDataDir, 'memory'),
      });
    });

    it('should handle empty previousState correctly', async () => {
      const input = {
        topic: 'React performance optimization',
        currentState: 'Analyzing React.memo usage',
        nextSteps: 'Study useMemo and useCallback',
      };

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith({
        topic: 'React performance optimization',
        previousState: '', // Should default to empty string
        currentState: 'Analyzing React.memo usage',
        nextSteps: 'Study useMemo and useCallback',
        memoryDir: expect.stringContaining('memory'),
      });
    });

    it('should handle explicit empty previousState', async () => {
      const input = {
        topic: 'Node.js best practices',
        previousState: '',
        currentState: 'Researching Express.js patterns',
        nextSteps: 'Study middleware implementation',
      };

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          previousState: '',
        })
      );
    });

    it('should return content in correct format', async () => {
      const input = {
        topic: 'Testing prompt format',
        currentState: 'Testing response format',
        nextSteps: 'Verify format correctness',
      };

      mockGetResearchModePrompt.mockReturnValue('Custom research prompt content');

      const result = await researchMode(input);

      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual({
        type: 'text',
        text: 'Custom research prompt content',
      });
    });

    it('should handle different prompt content correctly', async () => {
      const input = {
        topic: 'Testing different content',
        currentState: 'Testing content variations',
        nextSteps: 'Verify content handling',
      };

      const customPrompt = 'Research prompt with special characters: !@#$%^&*()';
      mockGetResearchModePrompt.mockReturnValue(customPrompt);

      const result = await researchMode(input);

      expect(result.content[0].text).toBe(customPrompt);
    });
  });

  describe('Parameter Processing', () => {
    it('should handle all parameters correctly', async () => {
      const input = {
        topic: 'Comprehensive research topic',
        previousState: 'Detailed previous research state',
        currentState: 'Current research activities',
        nextSteps: 'Future research directions',
      };

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'Comprehensive research topic',
          previousState: 'Detailed previous research state',
          currentState: 'Current research activities',
          nextSteps: 'Future research directions',
        })
      );
    });

    it('should handle long text content correctly', async () => {
      const longTopic = 'A'.repeat(1000) + ' - very long research topic';
      const longPreviousState = 'B'.repeat(2000) + ' - very long previous state';
      const longCurrentState = 'C'.repeat(1500) + ' - very long current state';
      const longNextSteps = 'D'.repeat(1200) + ' - very long next steps';

      const input = {
        topic: longTopic,
        previousState: longPreviousState,
        currentState: longCurrentState,
        nextSteps: longNextSteps,
      };

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: longTopic,
          previousState: longPreviousState,
          currentState: longCurrentState,
          nextSteps: longNextSteps,
        })
      );
    });

    it('should handle special characters in all fields', async () => {
      const input = {
        topic: 'Topic with special chars: !@#$%^&*()',
        previousState: 'Previous state with "quotes" and \'apostrophes\'',
        currentState: 'Current state with newlines\nand tabs\t',
        nextSteps: 'Next steps with unicode: 中文 🚀 emoji',
      };

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'Topic with special chars: !@#$%^&*()',
          previousState: 'Previous state with "quotes" and \'apostrophes\'',
          currentState: 'Current state with newlines\nand tabs\t',
          nextSteps: 'Next steps with unicode: 中文 🚀 emoji',
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle getResearchModePrompt errors gracefully', async () => {
      const input = {
        topic: 'Testing prompt error',
        currentState: 'Testing error handling',
        nextSteps: 'Handle prompt errors',
      };

      mockGetResearchModePrompt.mockImplementation(() => {
        throw new Error('Prompt generation failed');
      });

      await expect(researchMode(input)).rejects.toThrow('Prompt generation failed');
    });

    it('should handle non-Error exceptions in prompt generation', async () => {
      const input = {
        topic: 'Testing string error',
        currentState: 'Testing string exception',
        nextSteps: 'Handle string errors',
      };

      mockGetResearchModePrompt.mockImplementation(() => {
        throw 'String error in prompt generation';
      });

      await expect(researchMode(input)).rejects.toThrow('String error in prompt generation');
    });

    it('should propagate directory resolution errors', async () => {
      const input = {
        topic: 'Testing directory error propagation',
        currentState: 'Testing error propagation',
        nextSteps: 'Verify error handling',
      };

      mockGetProjectDataDir.mockRejectedValue(new Error('Project detection failed'));

      await expect(researchMode(input)).rejects.toThrow('Project detection failed');
      expect(mockGetResearchModePrompt).not.toHaveBeenCalled();
    });
  });

  describe('Memory Directory Path Construction', () => {
    it('should construct correct memory directory path', async () => {
      const input = {
        topic: 'Testing memory path',
        currentState: 'Testing path construction',
        nextSteps: 'Verify path correctness',
      };

      const testDataDir = '/test/project/data';
      mockGetProjectDataDir.mockResolvedValue(testDataDir);

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          memoryDir: path.join(testDataDir, 'memory'),
        })
      );
    });

    it('should handle different data directory formats', async () => {
      const testCases = [
        '/unix/style/path',
        'C:\\Windows\\Style\\Path',
        './relative/path',
        '../parent/relative/path',
      ];

      for (const testDataDir of testCases) {
        const input = {
          topic: `Testing path format: ${testDataDir}`,
          currentState: 'Testing different path formats',
          nextSteps: 'Verify path handling',
        };

        mockGetProjectDataDir.mockResolvedValue(testDataDir);

        await researchMode(input);

        expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
          expect.objectContaining({
            memoryDir: path.join(testDataDir, 'memory'),
          })
        );

        vi.clearAllMocks();
        mockGetProjectDataDir.mockResolvedValue(getTestDataDir());
        mockGetResearchModePrompt.mockReturnValue('Mock research mode prompt content');
      }
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle topic at exact minimum length', async () => {
      const input = {
        topic: 'abcde', // Exactly 5 characters
        currentState: 'Testing minimum length',
        nextSteps: 'Verify minimum handling',
      };

      const result = await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'abcde',
        })
      );
      expect(result.content[0].text).toBe('Mock research mode prompt content');
    });

    it('should handle very long topic', async () => {
      const longTopic = 'Research topic: ' + 'A'.repeat(5000);
      const input = {
        topic: longTopic,
        currentState: 'Testing very long topic',
        nextSteps: 'Handle long content',
      };

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: longTopic,
        })
      );
    });

    it('should handle empty strings for optional fields', async () => {
      const input = {
        topic: 'Valid topic',
        previousState: '', // Explicitly empty
        currentState: 'Testing empty previous state',
        nextSteps: 'Verify empty handling',
      };

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          previousState: '',
        })
      );
    });

    it('should handle whitespace-only content', async () => {
      const input = {
        topic: '     Valid topic with spaces     ',
        previousState: '   \t\n   ',
        currentState: '  Current state with whitespace  ',
        nextSteps: '\t\nNext steps with tabs and newlines\n\t',
      };

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: '     Valid topic with spaces     ',
          previousState: '   \t\n   ',
          currentState: '  Current state with whitespace  ',
          nextSteps: '\t\nNext steps with tabs and newlines\n\t',
        })
      );
    });

    it('should handle unicode and emoji content', async () => {
      const input = {
        topic: '研究主題：TypeScript 🚀',
        previousState: '之前的研究狀態 📚',
        currentState: '當前執行狀態 💻',
        nextSteps: '後續計劃 🎯',
      };

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: '研究主題：TypeScript 🚀',
          previousState: '之前的研究狀態 📚',
          currentState: '當前執行狀態 💻',
          nextSteps: '後續計劃 🎯',
        })
      );
    });

    it('should handle JSON-like content in fields', async () => {
      const input = {
        topic: 'Research JSON: {"key": "value"}',
        previousState: '{"previous": "state", "data": [1, 2, 3]}',
        currentState: 'Analyzing {"current": {"nested": "object"}}',
        nextSteps: 'Process [{"next": "steps"}, {"more": "data"}]',
      };

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'Research JSON: {"key": "value"}',
          previousState: '{"previous": "state", "data": [1, 2, 3]}',
          currentState: 'Analyzing {"current": {"nested": "object"}}',
          nextSteps: 'Process [{"next": "steps"}, {"more": "data"}]',
        })
      );
    });

    it('should handle markdown-like content', async () => {
      const input = {
        topic: '# Research Topic\n## Subtitle',
        previousState: '- Previous item 1\n- Previous item 2\n\n**Bold text**',
        currentState: '```javascript\nconst code = "example";\n```',
        nextSteps: '1. First step\n2. Second step\n\n> Quote block',
      };

      await researchMode(input);

      expect(mockGetResearchModePrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: '# Research Topic\n## Subtitle',
          previousState: '- Previous item 1\n- Previous item 2\n\n**Bold text**',
          currentState: '```javascript\nconst code = "example";\n```',
          nextSteps: '1. First step\n2. Second step\n\n> Quote block',
        })
      );
    });

    it('should handle concurrent calls correctly', async () => {
      const inputs = [
        {
          topic: 'Concurrent topic 1',
          currentState: 'Concurrent state 1',
          nextSteps: 'Concurrent steps 1',
        },
        {
          topic: 'Concurrent topic 2',
          currentState: 'Concurrent state 2',
          nextSteps: 'Concurrent steps 2',
        },
        {
          topic: 'Concurrent topic 3',
          currentState: 'Concurrent state 3',
          nextSteps: 'Concurrent steps 3',
        },
      ];

      const promises = inputs.map(input => researchMode(input));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe('text');
        expect(result.content[0].text).toBe('Mock research mode prompt content');
      });

      expect(mockGetProjectDataDir).toHaveBeenCalledTimes(3);
      expect(mockGetResearchModePrompt).toHaveBeenCalledTimes(3);
    });
  });
});
