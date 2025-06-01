import { describe, it, expect } from 'vitest';
import {
  TaskStatus,
  RelatedFileType,
  TaskComplexityLevel,
  TaskComplexityThresholds,
  Task,
  TaskDependency,
  RelatedFile,
} from '../../src/types/index.js';
import { createMockTask, createMockTaskWithFiles } from '../helpers/testUtils.js';

describe('Types and Enums', () => {
  describe('TaskStatus Enum', () => {
    it('should have correct values', () => {
      expect(TaskStatus.PENDING).toBe('pending');
      expect(TaskStatus.IN_PROGRESS).toBe('in_progress');
      expect(TaskStatus.COMPLETED).toBe('completed');
      expect(TaskStatus.BLOCKED).toBe('blocked');
    });

    it('should contain all expected statuses', () => {
      const statuses = Object.values(TaskStatus);
      expect(statuses).toHaveLength(4);
      expect(statuses).toContain('pending');
      expect(statuses).toContain('in_progress');
      expect(statuses).toContain('completed');
      expect(statuses).toContain('blocked');
    });
  });

  describe('RelatedFileType Enum', () => {
    it('should have correct values', () => {
      expect(RelatedFileType.TO_MODIFY).toBe('TO_MODIFY');
      expect(RelatedFileType.REFERENCE).toBe('REFERENCE');
      expect(RelatedFileType.CREATE).toBe('CREATE');
      expect(RelatedFileType.DEPENDENCY).toBe('DEPENDENCY');
      expect(RelatedFileType.OTHER).toBe('OTHER');
    });

    it('should contain all expected file types', () => {
      const fileTypes = Object.values(RelatedFileType);
      expect(fileTypes).toHaveLength(5);
      expect(fileTypes).toContain('TO_MODIFY');
      expect(fileTypes).toContain('REFERENCE');
      expect(fileTypes).toContain('CREATE');
      expect(fileTypes).toContain('DEPENDENCY');
      expect(fileTypes).toContain('OTHER');
    });
  });

  describe('TaskComplexityLevel Enum', () => {
    it('should have correct Chinese values', () => {
      expect(TaskComplexityLevel.LOW).toBe('低複雜度');
      expect(TaskComplexityLevel.MEDIUM).toBe('中等複雜度');
      expect(TaskComplexityLevel.HIGH).toBe('高複雜度');
      expect(TaskComplexityLevel.VERY_HIGH).toBe('極高複雜度');
    });

    it('should contain all complexity levels', () => {
      const levels = Object.values(TaskComplexityLevel);
      expect(levels).toHaveLength(4);
      expect(levels).toContain('低複雜度');
      expect(levels).toContain('中等複雜度');
      expect(levels).toContain('高複雜度');
      expect(levels).toContain('極高複雜度');
    });
  });

  describe('TaskComplexityThresholds', () => {
    it('should have correct description length thresholds', () => {
      expect(TaskComplexityThresholds.DESCRIPTION_LENGTH.MEDIUM).toBe(500);
      expect(TaskComplexityThresholds.DESCRIPTION_LENGTH.HIGH).toBe(1000);
      expect(TaskComplexityThresholds.DESCRIPTION_LENGTH.VERY_HIGH).toBe(2000);
    });

    it('should have correct dependencies count thresholds', () => {
      expect(TaskComplexityThresholds.DEPENDENCIES_COUNT.MEDIUM).toBe(2);
      expect(TaskComplexityThresholds.DEPENDENCIES_COUNT.HIGH).toBe(5);
      expect(TaskComplexityThresholds.DEPENDENCIES_COUNT.VERY_HIGH).toBe(10);
    });

    it('should have correct notes length thresholds', () => {
      expect(TaskComplexityThresholds.NOTES_LENGTH.MEDIUM).toBe(200);
      expect(TaskComplexityThresholds.NOTES_LENGTH.HIGH).toBe(500);
      expect(TaskComplexityThresholds.NOTES_LENGTH.VERY_HIGH).toBe(1000);
    });

    it('should have ascending threshold values', () => {
      // Description length thresholds should be in ascending order
      expect(TaskComplexityThresholds.DESCRIPTION_LENGTH.MEDIUM)
        .toBeLessThan(TaskComplexityThresholds.DESCRIPTION_LENGTH.HIGH);
      expect(TaskComplexityThresholds.DESCRIPTION_LENGTH.HIGH)
        .toBeLessThan(TaskComplexityThresholds.DESCRIPTION_LENGTH.VERY_HIGH);

      // Dependencies count thresholds should be in ascending order
      expect(TaskComplexityThresholds.DEPENDENCIES_COUNT.MEDIUM)
        .toBeLessThan(TaskComplexityThresholds.DEPENDENCIES_COUNT.HIGH);
      expect(TaskComplexityThresholds.DEPENDENCIES_COUNT.HIGH)
        .toBeLessThan(TaskComplexityThresholds.DEPENDENCIES_COUNT.VERY_HIGH);

      // Notes length thresholds should be in ascending order
      expect(TaskComplexityThresholds.NOTES_LENGTH.MEDIUM)
        .toBeLessThan(TaskComplexityThresholds.NOTES_LENGTH.HIGH);
      expect(TaskComplexityThresholds.NOTES_LENGTH.HIGH)
        .toBeLessThan(TaskComplexityThresholds.NOTES_LENGTH.VERY_HIGH);
    });
  });

  describe('Task Interface', () => {
    it('should create valid task with required fields', () => {
      const task = createMockTask();

      expect(typeof task.id).toBe('string');
      expect(typeof task.name).toBe('string');
      expect(typeof task.description).toBe('string');
      expect(Object.values(TaskStatus)).toContain(task.status);
      expect(Array.isArray(task.dependencies)).toBe(true);
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle optional fields correctly', () => {
      const taskWithOptionals = createMockTask({
        notes: 'Test notes',
        completedAt: new Date(),
        summary: 'Task summary',
        analysisResult: 'Analysis result',
        implementationGuide: 'Implementation guide',
        verificationCriteria: 'Verification criteria',
      });

      expect(taskWithOptionals.notes).toBe('Test notes');
      expect(taskWithOptionals.completedAt).toBeInstanceOf(Date);
      expect(taskWithOptionals.summary).toBe('Task summary');
      expect(taskWithOptionals.analysisResult).toBe('Analysis result');
      expect(taskWithOptionals.implementationGuide).toBe('Implementation guide');
      expect(taskWithOptionals.verificationCriteria).toBe('Verification criteria');
    });

    it('should handle related files correctly', () => {
      const taskWithFiles = createMockTaskWithFiles();

      expect(Array.isArray(taskWithFiles.relatedFiles)).toBe(true);
      expect(taskWithFiles.relatedFiles).toHaveLength(2);

      const modifyFile = taskWithFiles.relatedFiles![0];
      expect(modifyFile.path).toBe('src/test.ts');
      expect(modifyFile.type).toBe(RelatedFileType.TO_MODIFY);
      expect(modifyFile.description).toBe('File to modify');
      expect(modifyFile.lineStart).toBe(1);
      expect(modifyFile.lineEnd).toBe(100);

      const referenceFile = taskWithFiles.relatedFiles![1];
      expect(referenceFile.path).toBe('docs/readme.md');
      expect(referenceFile.type).toBe(RelatedFileType.REFERENCE);
      expect(referenceFile.description).toBe('Reference documentation');
    });
  });

  describe('TaskDependency Interface', () => {
    it('should have correct structure', () => {
      const dependency: TaskDependency = {
        taskId: 'test-task-id',
      };

      expect(typeof dependency.taskId).toBe('string');
      expect(dependency.taskId).toBe('test-task-id');
    });
  });

  describe('RelatedFile Interface', () => {
    it('should handle all file types', () => {
      const fileTypes = Object.values(RelatedFileType);
      
      fileTypes.forEach(type => {
        const file: RelatedFile = {
          path: `test/file.${type.toLowerCase()}`,
          type: type,
          description: `Test file for ${type}`,
        };

        expect(file.path).toContain('test/file');
        expect(file.type).toBe(type);
        expect(file.description).toContain(type);
      });
    });

    it('should handle optional line numbers', () => {
      const fileWithLines: RelatedFile = {
        path: 'src/component.ts',
        type: RelatedFileType.TO_MODIFY,
        description: 'Component to modify',
        lineStart: 10,
        lineEnd: 50,
      };

      expect(fileWithLines.lineStart).toBe(10);
      expect(fileWithLines.lineEnd).toBe(50);

      const fileWithoutLines: RelatedFile = {
        path: 'docs/readme.md',
        type: RelatedFileType.REFERENCE,
        description: 'Reference document',
      };

      expect(fileWithoutLines.lineStart).toBeUndefined();
      expect(fileWithoutLines.lineEnd).toBeUndefined();
    });
  });
});
