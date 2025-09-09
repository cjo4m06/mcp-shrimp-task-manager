import { describe, it, expect } from 'vitest';
import { parseCompletionSummary, parseFlexibleSummary } from './completionSummaryParser';

describe('completionSummaryParser', () => {
  describe('parseCompletionSummary', () => {
    it('should parse a well-formatted summary with all sections', () => {
      const summary = `
## Key Accomplishments
- Implemented user authentication
- Added database migrations
- Created API endpoints

## Implementation Details
- Used JWT for authentication
- PostgreSQL for data storage
- RESTful API design

## Technical Challenges
- Resolved CORS issues
- Fixed memory leak in connection pool
      `;

      const result = parseCompletionSummary(summary);
      
      expect(result.keyAccomplishments).toHaveLength(3);
      expect(result.keyAccomplishments).toContain('Implemented user authentication');
      expect(result.keyAccomplishments).toContain('Added database migrations');
      expect(result.keyAccomplishments).toContain('Created API endpoints');
      
      expect(result.implementationDetails).toHaveLength(3);
      expect(result.implementationDetails).toContain('Used JWT for authentication');
      expect(result.implementationDetails).toContain('PostgreSQL for data storage');
      expect(result.implementationDetails).toContain('RESTful API design');
      
      expect(result.technicalChallenges).toHaveLength(2);
      expect(result.technicalChallenges).toContain('Resolved CORS issues');
      expect(result.technicalChallenges).toContain('Fixed memory leak in connection pool');
    });

    it('should handle single # headers', () => {
      const summary = `
# Accomplishments
* Built frontend components
* Integrated with backend

# Implementation
* React with TypeScript
* Tailwind CSS

# Challenges
* Browser compatibility issues
      `;

      const result = parseCompletionSummary(summary);
      
      expect(result.keyAccomplishments).toHaveLength(2);
      expect(result.keyAccomplishments).toContain('Built frontend components');
      
      expect(result.implementationDetails).toHaveLength(2);
      expect(result.implementationDetails).toContain('React with TypeScript');
      
      expect(result.technicalChallenges).toHaveLength(1);
      expect(result.technicalChallenges).toContain('Browser compatibility issues');
    });

    it('should handle numbered lists', () => {
      const summary = `
## Key Achievements
1. Deployed to production
2. Achieved 99.9% uptime
3. Reduced latency by 50%

## Implementation Notes
1) Kubernetes orchestration
2) Redis caching layer
3) CDN integration
      `;

      const result = parseCompletionSummary(summary);
      
      expect(result.keyAccomplishments).toHaveLength(3);
      expect(result.keyAccomplishments).toContain('Deployed to production');
      expect(result.keyAccomplishments).toContain('Achieved 99.9% uptime');
      
      expect(result.implementationDetails).toHaveLength(3);
      expect(result.implementationDetails).toContain('Kubernetes orchestration');
      expect(result.implementationDetails).toContain('CDN integration');
    });

    it('should extract verification score', () => {
      const summary1 = `
## Summary
Task completed successfully
Verification Score: 95
      `;
      
      const summary2 = `
## Results
Completed with 85/100 points
      `;
      
      const summary3 = `
## Status
Verified at 100%
      `;

      expect(parseCompletionSummary(summary1).verificationScore).toBe(95);
      expect(parseCompletionSummary(summary2).verificationScore).toBe(85);
      expect(parseCompletionSummary(summary3).verificationScore).toBe(100);
    });

    it('should extract completion date', () => {
      const summary1 = `
## Task Details
Completed: 2024-01-15
      `;
      
      const summary2 = `
## Summary
Date: 2024-02-20
      `;
      
      const summary3 = `
Timestamp: 2024-03-25T10:30:00Z
      `;

      const result1 = parseCompletionSummary(summary1);
      expect(result1.completedAt).toBeInstanceOf(Date);
      expect(result1.completedAt.toISOString().startsWith('2024-01-15')).toBe(true);
      
      const result2 = parseCompletionSummary(summary2);
      expect(result2.completedAt.toISOString().startsWith('2024-02-20')).toBe(true);
      
      const result3 = parseCompletionSummary(summary3);
      expect(result3.completedAt.toISOString()).toContain('2024-03-25T10:30:00');
    });

    it('should handle empty or invalid input', () => {
      expect(parseCompletionSummary('')).toEqual({
        keyAccomplishments: [],
        implementationDetails: [],
        technicalChallenges: [],
        completedAt: expect.any(Date),
        verificationScore: 0
      });
      
      expect(parseCompletionSummary(null as any)).toEqual({
        keyAccomplishments: [],
        implementationDetails: [],
        technicalChallenges: [],
        completedAt: expect.any(Date),
        verificationScore: 0
      });
      
      expect(parseCompletionSummary(undefined as any)).toEqual({
        keyAccomplishments: [],
        implementationDetails: [],
        technicalChallenges: [],
        completedAt: expect.any(Date),
        verificationScore: 0
      });
    });

    it('should handle missing sections gracefully', () => {
      const summary = `
## Key Accomplishments
- Completed task successfully
      `;

      const result = parseCompletionSummary(summary);
      
      expect(result.keyAccomplishments).toHaveLength(1);
      expect(result.implementationDetails).toHaveLength(0);
      expect(result.technicalChallenges).toHaveLength(0);
    });

    it('should remove markdown formatting from items', () => {
      const summary = `
## Accomplishments
- **Bold achievement**
- *Italic achievement*
- \`Code achievement\`
- [Link achievement](https://example.com)
- __Another bold__
- _Another italic_
      `;

      const result = parseCompletionSummary(summary);
      
      expect(result.keyAccomplishments).toContain('Bold achievement');
      expect(result.keyAccomplishments).toContain('Italic achievement');
      expect(result.keyAccomplishments).toContain('Code achievement');
      expect(result.keyAccomplishments).toContain('Link achievement');
      expect(result.keyAccomplishments).toContain('Another bold');
      expect(result.keyAccomplishments).toContain('Another italic');
    });

    it('should deduplicate items', () => {
      const summary = `
## Accomplishments
- Same item
- Same item
* Same item
1. Same item
      `;

      const result = parseCompletionSummary(summary);
      
      expect(result.keyAccomplishments).toHaveLength(1);
      expect(result.keyAccomplishments).toContain('Same item');
    });

    it('should handle mixed bullet styles', () => {
      const summary = `
## Key Accomplishments
- Dash bullet
* Asterisk bullet
+ Plus bullet
      `;

      const result = parseCompletionSummary(summary);
      
      expect(result.keyAccomplishments).toHaveLength(3);
      expect(result.keyAccomplishments).toContain('Dash bullet');
      expect(result.keyAccomplishments).toContain('Asterisk bullet');
      expect(result.keyAccomplishments).toContain('Plus bullet');
    });
  });

  describe('parseFlexibleSummary', () => {
    it('should parse alternative section headers', () => {
      const summary = `
## What was done
- Created new feature
- Fixed bugs

## How it was implemented
- Used design patterns
- Applied SOLID principles

## Problems solved
- Memory optimization
- Performance improvement
      `;

      const result = parseFlexibleSummary(summary);
      
      expect(result.keyAccomplishments).toHaveLength(2);
      expect(result.keyAccomplishments).toContain('Created new feature');
      
      expect(result.implementationDetails).toHaveLength(2);
      expect(result.implementationDetails).toContain('Used design patterns');
      
      expect(result.technicalChallenges).toHaveLength(2);
      expect(result.technicalChallenges).toContain('Memory optimization');
    });

    it('should extract from unstructured lists when no sections found', () => {
      const summary = `
Here's what was accomplished:
- Implemented new authentication system
- Added API endpoint for user management
- Resolved database connection issues
- Fixed challenging memory leak problem
      `;

      const result = parseFlexibleSummary(summary);
      
      expect(result.keyAccomplishments.length + 
             result.implementationDetails.length + 
             result.technicalChallenges.length).toBeGreaterThan(0);
      
      // Should categorize based on keywords
      const hasChallengeItem = result.technicalChallenges.some(item => 
        item.toLowerCase().includes('challenging') || 
        item.toLowerCase().includes('issues')
      );
      expect(hasChallengeItem).toBe(true);
    });

    it('should handle Summary/Overview sections', () => {
      const summary = `
## Summary
- Successfully migrated database
- Improved query performance
- Documented all changes

## Technical Notes
- PostgreSQL 14 upgrade
- Index optimization
      `;

      const result = parseFlexibleSummary(summary);
      
      expect(result.keyAccomplishments).toHaveLength(3);
      expect(result.implementationDetails).toHaveLength(2);
    });

    it('should categorize items by keywords when no sections exist', () => {
      const summary = `
- Implemented REST API
- Resolved authentication challenge
- Database schema implementation
- Fixed difficult CORS problem
- Achieved project goals
      `;

      const result = parseFlexibleSummary(summary);
      
      // Items with "challenge" or "problem" should go to challenges
      expect(result.technicalChallenges.some(item => 
        item.includes('authentication challenge') || 
        item.includes('CORS problem')
      )).toBe(true);
      
      // Items with "implement" should go to implementation details
      expect(result.implementationDetails.some(item => 
        item.includes('API') || 
        item.includes('database')
      )).toBe(true);
    });

    it('should handle edge cases', () => {
      // Test with only whitespace
      const result1 = parseFlexibleSummary('   \n   \t   ');
      expect(result1.keyAccomplishments).toHaveLength(0);
      expect(result1.implementationDetails).toHaveLength(0);
      expect(result1.technicalChallenges).toHaveLength(0);
      
      // Test with no lists or sections
      const result2 = parseFlexibleSummary('Just plain text without any structure');
      expect(result2.keyAccomplishments).toHaveLength(0);
      expect(result2.implementationDetails).toHaveLength(0);
      expect(result2.technicalChallenges).toHaveLength(0);
    });

    it('should handle complex nested markdown', () => {
      const summary = `
## Accomplishments
- Main task with **bold** and *italic* text
  - Nested item (should be ignored)
- Another \`inline code\` task
- Task with [link](url) included

## Technical Details
1. First **important** step
2. Second step with \`code\`
3. Third step with _emphasis_
      `;

      const result = parseFlexibleSummary(summary);
      
      // Should clean markdown but not include nested items
      expect(result.keyAccomplishments).toContain('Main task with bold and italic text');
      expect(result.keyAccomplishments).toContain('Another inline code task');
      expect(result.keyAccomplishments).toContain('Task with link included');
      
      expect(result.implementationDetails).toContain('First important step');
      expect(result.implementationDetails).toContain('Second step with code');
      expect(result.implementationDetails).toContain('Third step with emphasis');
    });

    it('should preserve case-insensitive section matching', () => {
      const summary = `
## KEY ACCOMPLISHMENTS
- Upper case section

## implementation details
- Lower case section

## Technical Challenges
- Mixed case section
      `;

      const result = parseFlexibleSummary(summary);
      
      expect(result.keyAccomplishments).toHaveLength(1);
      expect(result.implementationDetails).toHaveLength(1);
      expect(result.technicalChallenges).toHaveLength(1);
    });
  });
});