import { describe, it, expect, beforeEach } from 'vitest';
import { truncateText, shouldShowExpansion, truncateMarkdown } from './textUtils.js';

describe('textUtils', () => {
  describe('truncateText', () => {
    describe('basic functionality', () => {
      it('should return original text when shorter than maxLength', () => {
        const text = 'Short text';
        const result = truncateText(text, 20);
        expect(result).toBe('Short text');
      });

      it('should truncate text when longer than maxLength', () => {
        const text = 'This is a very long text that needs to be truncated';
        const result = truncateText(text, 20);
        expect(result).toBe('This is a very...');
        expect(result.length).toBeLessThanOrEqual(20);
      });

      it('should use default maxLength of 100 when not specified', () => {
        const text = 'A'.repeat(150);
        const result = truncateText(text);
        expect(result.length).toBe(100);
        expect(result.endsWith('...')).toBe(true);
      });
    });

    describe('word boundary handling', () => {
      it('should respect word boundaries by default', () => {
        const text = 'This is a test sentence with multiple words';
        const result = truncateText(text, 25, true);
        // Should break at word boundary, not mid-word
        expect(result).toBe('This is a test...');
        expect(result.length).toBeLessThanOrEqual(25);
      });

      it('should ignore word boundaries when wordBoundary is false', () => {
        const text = 'This is a test sentence with multiple words';
        const result = truncateText(text, 25, false);
        expect(result).toBe('This is a test sentenc...');
        expect(result.length).toBe(25);
      });

      it('should handle text with no spaces when wordBoundary is true', () => {
        const text = 'Supercalifragilisticexpialidocious';
        const result = truncateText(text, 20, true);
        expect(result).toBe('Supercalifragilis...');
        expect(result.length).toBe(20);
      });

      it('should find the last word boundary within maxLength', () => {
        const text = 'The quick brown fox jumps over the lazy dog';
        const result = truncateText(text, 30, true);
        // Should break at last word boundary within 27 characters
        expect(result).toBe('The quick brown fox jumps...');
      });
    });

    describe('edge cases and error handling', () => {
      it('should handle null input', () => {
        const result = truncateText(null, 10);
        expect(result).toBe('');
      });

      it('should handle undefined input', () => {
        const result = truncateText(undefined, 10);
        expect(result).toBe('');
      });

      it('should handle empty string', () => {
        const result = truncateText('', 10);
        expect(result).toBe('');
      });

      it('should handle maxLength of 0', () => {
        const text = 'Some text';
        const result = truncateText(text, 0);
        expect(result).toBe('');
      });

      it('should handle negative maxLength', () => {
        const text = 'Some text';
        const result = truncateText(text, -5);
        expect(result).toBe('');
      });

      it('should handle maxLength less than ellipsis length', () => {
        const text = 'Some text';
        const result = truncateText(text, 2);
        expect(result).toBe('...');
      });

      it('should handle non-string input by converting to string', () => {
        const result = truncateText(12345, 3);
        expect(result).toBe('...');
      });

      it('should handle boolean input', () => {
        const result = truncateText(true, 3);
        expect(result).toBe('...');
      });
    });

    describe('Unicode and special characters', () => {
      it('should handle Unicode characters correctly', () => {
        const text = 'Hello 世界 🌍 Düsseldorf café';
        const result = truncateText(text, 15);
        expect(result.length).toBeLessThanOrEqual(15);
      });

      it('should handle emoji characters', () => {
        const text = '🚀🌟⭐🎯🔥💡⚡🌈🦄🎨';
        const result = truncateText(text, 8);
        expect(result.length).toBeLessThanOrEqual(8);
      });

      it('should handle mixed Unicode content', () => {
        const text = 'Testing with émojis 🎉 and ñiño characters';
        const result = truncateText(text, 25, true);
        expect(result.length).toBeLessThanOrEqual(25);
        expect(result.endsWith('...')).toBe(true);
      });

      it('should handle newlines and tabs', () => {
        const text = 'Line 1\nLine 2\tTabbed content';
        const result = truncateText(text, 15);
        expect(result.length).toBeLessThanOrEqual(15);
      });
    });

    describe('whitespace handling', () => {
      it('should handle leading and trailing whitespace', () => {
        const text = '   Some text with spaces   ';
        const result = truncateText(text, 15);
        expect(result).toBe('   Some...');
      });

      it('should handle multiple consecutive spaces', () => {
        const text = 'Text    with    multiple    spaces';
        const result = truncateText(text, 20, true);
        expect(result.length).toBeLessThanOrEqual(20);
      });
    });

    describe('custom ellipsis', () => {
      it('should use custom ellipsis when provided', () => {
        const text = 'This is a long text that needs truncation';
        const result = truncateText(text, 20, true, ' [...]');
        expect(result.endsWith(' [...]')).toBe(true);
        expect(result.length).toBeLessThanOrEqual(20);
      });

      it('should handle empty ellipsis', () => {
        const text = 'This is a long text';
        const result = truncateText(text, 10, false, '');
        expect(result).toBe('This is a ');
        expect(result.length).toBe(10);
      });
    });
  });

  describe('shouldShowExpansion', () => {
    it('should return true when text is longer than maxLength', () => {
      const text = 'This is a very long text that exceeds the maximum length';
      expect(shouldShowExpansion(text, 20)).toBe(true);
    });

    it('should return false when text is shorter than maxLength', () => {
      const text = 'Short text';
      expect(shouldShowExpansion(text, 20)).toBe(false);
    });

    it('should return false when text equals maxLength', () => {
      const text = 'Exactly twenty chars';
      expect(shouldShowExpansion(text, 20)).toBe(false);
    });

    it('should handle null input', () => {
      expect(shouldShowExpansion(null, 10)).toBe(false);
    });

    it('should handle undefined input', () => {
      expect(shouldShowExpansion(undefined, 10)).toBe(false);
    });

    it('should handle empty string', () => {
      expect(shouldShowExpansion('', 10)).toBe(false);
    });

    it('should use default maxLength of 100', () => {
      const text = 'A'.repeat(150);
      expect(shouldShowExpansion(text)).toBe(true);
    });

    it('should handle non-string input by converting to string', () => {
      expect(shouldShowExpansion(12345, 3)).toBe(true);
    });
  });

  describe('truncateMarkdown', () => {
    it('should strip Markdown formatting before truncating', () => {
      const text = '**Bold text** and *italic text* with [links](http://example.com)';
      const result = truncateMarkdown(text, 30);
      // Should be: "Bold text and italic text with links"
      expect(result).not.toContain('**');
      expect(result).not.toContain('*');
      expect(result).not.toContain('[');
      expect(result).not.toContain(']');
      expect(result).not.toContain('(http://example.com)');
    });

    it('should handle headers and preserve content', () => {
      const text = '# Main Title\n## Subtitle\nSome content here';
      const result = truncateMarkdown(text, 25);
      expect(result).not.toContain('#');
      expect(result).toContain('Main Title');
    });

    it('should handle code blocks', () => {
      const text = '```javascript\nconst x = 1;\n```\nRegular text here';
      const result = truncateMarkdown(text, 20);
      expect(result).not.toContain('```');
      expect(result).not.toContain('javascript');
    });

    it('should handle inline code', () => {
      const text = 'Use `console.log()` for debugging purposes';
      const result = truncateMarkdown(text, 20);
      expect(result).not.toContain('`');
      expect(result).toBe('Use...');
    });

    it('should handle lists', () => {
      const text = '- Item 1\n- Item 2\n* Item 3\n1. Numbered item';
      const result = truncateMarkdown(text, 25);
      expect(result).not.toMatch(/^-/);
      expect(result).not.toMatch(/^\*/);
      expect(result).not.toMatch(/^1\./);
    });

    it('should handle blockquotes', () => {
      const text = '> This is a blockquote\n> with multiple lines';
      const result = truncateMarkdown(text, 20);
      expect(result).not.toContain('>');
      expect(result).toBe('This is a...');
    });

    it('should preserve word boundaries after Markdown stripping', () => {
      const text = '**This is bold** and this is regular text';
      const result = truncateMarkdown(text, 25, true);
      expect(result.length).toBeLessThanOrEqual(25);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should handle complex nested Markdown', () => {
      const text = '## Header with **bold** and *italic*\n\n- List item with [link](url)\n- Another item\n\n`code snippet`';
      const result = truncateMarkdown(text, 40, true);
      expect(result).not.toContain('##');
      expect(result).not.toContain('**');
      expect(result).not.toContain('*');
      expect(result).not.toContain('[');
      expect(result).not.toContain('`');
    });

    it('should handle malformed Markdown gracefully', () => {
      const text = '**Unclosed bold *mixed with italic** and some text';
      const result = truncateMarkdown(text, 30);
      expect(result.length).toBeLessThanOrEqual(30);
    });
  });

  describe('performance tests', () => {
    it('should handle very large text efficiently', () => {
      const largeText = 'A'.repeat(100000);
      const startTime = performance.now();
      const result = truncateText(largeText, 100);
      const endTime = performance.now();
      
      expect(result.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle many repeated calls efficiently', () => {
      const text = 'This is a test string that will be truncated multiple times';
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        truncateText(text, 30);
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle complex Unicode text efficiently', () => {
      const complexText = '🌍🚀⭐'.repeat(1000) + ' Regular text content';
      const startTime = performance.now();
      const result = truncateText(complexText, 50);
      const endTime = performance.now();
      
      expect(result.length).toBeLessThanOrEqual(50);
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('integration scenarios', () => {
    it('should work with table cell content', () => {
      const initialRequest = 'Create a comprehensive task management system with user authentication';
      const result = truncateText(initialRequest, 100, true);
      expect(result.length).toBeLessThanOrEqual(100);
    });

    it('should work with task descriptions', () => {
      const description = 'Implement user authentication with JWT tokens, password hashing, and session management. Include proper validation and error handling.';
      const result = truncateText(description, 100, true);
      expect(result.length).toBeLessThanOrEqual(100);
      expect(shouldShowExpansion(description, 100)).toBe(true);
    });

    it('should work with Markdown task content', () => {
      const markdownContent = '## Task Details\n\n**Requirements:**\n- Feature A\n- Feature B\n\n`Code example here`';
      const result = truncateMarkdown(markdownContent, 50, true);
      expect(result.length).toBeLessThanOrEqual(50);
    });
  });

  describe('accessibility considerations', () => {
    it('should provide meaningful truncated text for screen readers', () => {
      const text = 'Important accessibility information for users with disabilities';
      const result = truncateText(text, 30, true);
      expect(result).toContain('Important accessibility');
      expect(result.endsWith('...')).toBe(true);
    });

    it('should handle right-to-left text', () => {
      const rtlText = 'مرحبا بك في هذا النص الطويل باللغة العربية';
      const result = truncateText(rtlText, 20);
      expect(result.length).toBeLessThanOrEqual(20);
    });
  });
});