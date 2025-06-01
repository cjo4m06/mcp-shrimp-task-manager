import { describe, it, expect } from 'vitest';
import { loadTaskRelatedFiles } from '../../src/utils/fileLoader.js';
import { RelatedFileType } from '../../src/types/index.js';

describe('fileLoader', () => {
  describe('loadTaskRelatedFiles', () => {
    it('should return empty content for empty file list', async () => {
      const result = await loadTaskRelatedFiles([]);

      expect(result.content).toBe('');
      expect(result.summary).toBe('無相關文件');
    });

    it('should return empty content for null/undefined file list', async () => {
      const result = await loadTaskRelatedFiles(null as any);

      expect(result.content).toBe('');
      expect(result.summary).toBe('無相關文件');
    });

    it('should generate content for single file', async () => {
      const files = [
        {
          path: 'src/test.ts',
          type: RelatedFileType.TO_MODIFY,
          description: 'Test file to modify'
        }
      ];

      const result = await loadTaskRelatedFiles(files);

      expect(result.content).toContain('TO_MODIFY: src/test.ts');
      expect(result.content).toContain('Test file to modify');
      expect(result.content).toContain('檔案: src/test.ts');
      expect(result.content).toContain('類型: TO_MODIFY');
      expect(result.summary).toContain('相關文件內容摘要 (共 1 個文件)');
      expect(result.summary).toContain('src/test.ts');
    });

    it('should generate content for multiple files', async () => {
      const files = [
        {
          path: 'src/component.ts',
          type: RelatedFileType.TO_MODIFY,
          description: 'Component to modify'
        },
        {
          path: 'docs/readme.md',
          type: RelatedFileType.REFERENCE,
          description: 'Reference documentation'
        }
      ];

      const result = await loadTaskRelatedFiles(files);

      expect(result.content).toContain('TO_MODIFY: src/component.ts');
      expect(result.content).toContain('REFERENCE: docs/readme.md');
      expect(result.summary).toContain('相關文件內容摘要 (共 2 個文件)');
      expect(result.summary).toContain('src/component.ts');
      expect(result.summary).toContain('docs/readme.md');
    });

    it('should handle files with line ranges', async () => {
      const files = [
        {
          path: 'src/utils.ts',
          type: RelatedFileType.TO_MODIFY,
          description: 'Utility functions',
          lineStart: 10,
          lineEnd: 50
        }
      ];

      const result = await loadTaskRelatedFiles(files);

      expect(result.content).toContain('(行 10-50)');
      expect(result.content).toContain('行範圍: 10-50');
    });

    it('should handle files without description', async () => {
      const files = [
        {
          path: 'src/index.ts',
          type: RelatedFileType.CREATE
        }
      ];

      const result = await loadTaskRelatedFiles(files);

      expect(result.content).toContain('CREATE: src/index.ts');
      expect(result.content).toContain('檔案: src/index.ts');
      expect(result.content).toContain('類型: CREATE');
      expect(result.content).not.toContain('描述:');
    });

    it('should sort files by priority', async () => {
      const files = [
        {
          path: 'other.txt',
          type: RelatedFileType.OTHER
        },
        {
          path: 'modify.ts',
          type: RelatedFileType.TO_MODIFY
        },
        {
          path: 'reference.md',
          type: RelatedFileType.REFERENCE
        }
      ];

      const result = await loadTaskRelatedFiles(files);

      // TO_MODIFY should come first, then REFERENCE, then OTHER
      const modifyIndex = result.content.indexOf('TO_MODIFY: modify.ts');
      const referenceIndex = result.content.indexOf('REFERENCE: reference.md');
      const otherIndex = result.content.indexOf('OTHER: other.txt');

      expect(modifyIndex).toBeLessThan(referenceIndex);
      expect(referenceIndex).toBeLessThan(otherIndex);
    });

    it('should respect max total length limit', async () => {
      const files = Array.from({ length: 10 }, (_, i) => ({
        path: `file${i}.ts`,
        type: RelatedFileType.TO_MODIFY,
        description: `File ${i} description`
      }));

      const result = await loadTaskRelatedFiles(files, 500); // Small limit

      expect(result.content.length).toBeLessThan(1000); // Should be limited
      expect(result.summary).toContain('已達到上下文長度限制');
    });

    it('should handle all file types', async () => {
      const files = [
        { path: 'modify.ts', type: RelatedFileType.TO_MODIFY },
        { path: 'reference.md', type: RelatedFileType.REFERENCE },
        { path: 'create.js', type: RelatedFileType.CREATE },
        { path: 'dependency.json', type: RelatedFileType.DEPENDENCY },
        { path: 'other.txt', type: RelatedFileType.OTHER }
      ];

      const result = await loadTaskRelatedFiles(files);

      expect(result.content).toContain('TO_MODIFY: modify.ts');
      expect(result.content).toContain('REFERENCE: reference.md');
      expect(result.content).toContain('CREATE: create.js');
      expect(result.content).toContain('DEPENDENCY: dependency.json');
      expect(result.content).toContain('OTHER: other.txt');
    });

    it('should include file viewing instructions', async () => {
      const files = [
        {
          path: 'src/example.ts',
          type: RelatedFileType.TO_MODIFY
        }
      ];

      const result = await loadTaskRelatedFiles(files);

      expect(result.content).toContain('若需查看實際內容，請直接查看檔案: src/example.ts');
    });
  });
});
