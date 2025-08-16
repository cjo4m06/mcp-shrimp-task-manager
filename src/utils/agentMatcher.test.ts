import { describe, it, expect } from 'vitest';
import { matchAgentToTask, getSuggestedAgentType, getKeywordMatchDetails } from './agentMatcher.js';
import { Task, TaskStatus } from '../types/index.js';

// Helper function to create a test task
function createTestTask(name: string, description?: string, notes?: string): Task {
  return {
    id: 'test-id',
    name,
    description: description || '',
    notes,
    status: TaskStatus.PENDING,
    dependencies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Helper function to create test agents
function createTestAgents() {
  return [
    { name: 'Frontend Developer', type: 'frontend' },
    { name: 'Backend Engineer', type: 'backend' },
    { name: 'Database Admin', type: 'database' },
    { name: 'Full Stack Developer', type: 'fullstack' },
    { name: 'Mobile Developer', type: 'mobile' },
    { name: 'QA Engineer', type: 'testing' },
    { name: 'Security Expert', type: 'security' },
    { name: 'Data Scientist', type: 'data' },
    { name: 'General Purpose Agent' },
  ];
}

describe('agentMatcher', () => {
  describe('matchAgentToTask', () => {
    const agents = createTestAgents();

    it('should match frontend tasks correctly', () => {
      const task = createTestTask(
        'Update React component',
        'Need to update the UserProfile component to use new CSS styles and improve responsive design'
      );
      expect(matchAgentToTask(task, agents)).toBe('Frontend Developer');
    });

    it('should match backend tasks correctly', () => {
      const task = createTestTask(
        'Create REST API endpoint',
        'Implement a new Express.js endpoint for user authentication using JWT tokens'
      );
      expect(matchAgentToTask(task, agents)).toBe('Backend Engineer');
    });

    it('should match database tasks correctly', () => {
      const task = createTestTask(
        'Optimize database queries',
        'Need to add indexes to PostgreSQL tables and optimize slow SQL queries'
      );
      expect(matchAgentToTask(task, agents)).toBe('Database Admin');
    });

    it('should match fullstack tasks correctly', () => {
      const task = createTestTask(
        'Deploy application to AWS',
        'Set up CI/CD pipeline with Docker and Kubernetes for the MERN stack application'
      );
      expect(matchAgentToTask(task, agents)).toBe('Full Stack Developer');
    });

    it('should match mobile tasks correctly', () => {
      const task = createTestTask(
        'Fix iOS app crash',
        'Debug and fix React Native app crash on iOS devices when using camera'
      );
      expect(matchAgentToTask(task, agents)).toBe('Mobile Developer');
    });

    it('should match testing tasks correctly', () => {
      const task = createTestTask(
        'Write unit tests',
        'Create Jest unit tests for the new authentication service with mocking'
      );
      expect(matchAgentToTask(task, agents)).toBe('QA Engineer');
    });

    it('should match security tasks correctly', () => {
      const task = createTestTask(
        'Security audit',
        'Perform OWASP security audit and fix XSS vulnerabilities in the application'
      );
      expect(matchAgentToTask(task, agents)).toBe('Security Expert');
    });

    it('should match data/ML tasks correctly', () => {
      const task = createTestTask(
        'Implement ML model',
        'Create a machine learning model using TensorFlow for data analysis and visualization'
      );
      expect(matchAgentToTask(task, agents)).toBe('Data Scientist');
    });

    it('should return undefined for empty task descriptions', () => {
      const task = createTestTask('', '');
      expect(matchAgentToTask(task, agents)).toBeUndefined();
    });

    it('should return undefined when no agents are available', () => {
      const task = createTestTask('Update React component');
      expect(matchAgentToTask(task, [])).toBeUndefined();
    });

    it('should return undefined for tasks with no matching keywords', () => {
      const task = createTestTask(
        'Generic task',
        'This is a task about something completely unrelated to programming'
      );
      expect(matchAgentToTask(task, agents)).toBeUndefined();
    });

    it('should handle null/undefined task gracefully', () => {
      expect(matchAgentToTask(null as any, agents)).toBeUndefined();
      expect(matchAgentToTask(undefined as any, agents)).toBeUndefined();
    });

    it('should match based on agent name when type is not available', () => {
      const agentsWithoutTypes = [
        { name: 'React Specialist' },
        { name: 'Node.js Developer' },
      ];
      const task = createTestTask('Fix React hooks issue');
      expect(matchAgentToTask(task, agentsWithoutTypes)).toBe('React Specialist');
    });

    it('should match based on capabilities when available', () => {
      const agentsWithCapabilities = [
        { 
          name: 'Agent 1', 
          capabilities: ['python', 'machine learning', 'data analysis'] 
        },
        { 
          name: 'Agent 2', 
          capabilities: ['javascript', 'react', 'frontend'] 
        },
      ];
      const task = createTestTask('Build ML pipeline', 'Create a data pipeline for machine learning');
      expect(matchAgentToTask(task, agentsWithCapabilities)).toBe('Agent 1');
    });

    it('should prefer exact type matches over name matches', () => {
      const mixedAgents = [
        { name: 'Backend Specialist', type: 'frontend' }, // Misleading name
        { name: 'Frontend Expert', type: 'backend' }, // Misleading name
      ];
      const task = createTestTask('Update React UI', 'Modify React components and CSS');
      expect(matchAgentToTask(task, mixedAgents)).toBe('Backend Specialist'); // Has frontend type
    });

    it('should handle multiple keyword matches correctly', () => {
      const task = createTestTask(
        'Full stack development',
        'Build React frontend with Node.js backend API and MongoDB database integration'
      );
      expect(matchAgentToTask(task, agents)).toBe('Full Stack Developer');
    });
  });

  describe('getSuggestedAgentType', () => {
    it('should suggest frontend for UI tasks', () => {
      const task = createTestTask('Style navigation bar', 'Update CSS and React components');
      expect(getSuggestedAgentType(task)).toBe('frontend');
    });

    it('should suggest backend for API tasks', () => {
      const task = createTestTask('Create user endpoint', 'Build REST API with Express.js');
      expect(getSuggestedAgentType(task)).toBe('backend');
    });

    it('should return undefined for unclear tasks', () => {
      const task = createTestTask('Do something', 'Generic task description');
      expect(getSuggestedAgentType(task)).toBeUndefined();
    });
  });

  describe('getKeywordMatchDetails', () => {
    it('should return detailed keyword matches', () => {
      const task = createTestTask(
        'React and Node.js task',
        'Build a React frontend with Node.js backend'
      );
      const details = getKeywordMatchDetails(task);
      
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].matchedKeywords).toContain('react');
      expect(details.find((d: any) => d.type === 'backend')?.matchedKeywords).toContain('node');
    });

    it('should sort by score descending', () => {
      const task = createTestTask(
        'Database optimization',
        'Optimize PostgreSQL queries and add indexes to tables'
      );
      const details = getKeywordMatchDetails(task);
      
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].type).toBe('database');
      for (let i = 1; i < details.length; i++) {
        expect(details[i].score).toBeLessThanOrEqual(details[i - 1].score);
      }
    });

    it('should return empty array for no matches', () => {
      const task = createTestTask('Random task', 'No programming keywords here');
      const details = getKeywordMatchDetails(task);
      expect(details).toEqual([]);
    });

    it('should include implementation guide in matching', () => {
      const task: Task = {
        ...createTestTask('Task', 'Description'),
        implementationGuide: 'Use TensorFlow for machine learning implementation'
      };
      const details = getKeywordMatchDetails(task);
      
      const dataMatch = details.find((d: any) => d.type === 'data');
      expect(dataMatch).toBeDefined();
      expect(dataMatch?.matchedKeywords).toContain('tensorflow');
      expect(dataMatch?.matchedKeywords).toContain('machine learning');
    });
  });

  describe('keyword scoring', () => {
    it('should give higher scores for multiple keyword matches', () => {
      const agents = createTestAgents();
      const task1 = createTestTask('React task', 'Simple React component update');
      const task2 = createTestTask(
        'Complex React task',
        'Update React components with TypeScript, add CSS animations, and improve responsive design'
      );
      
      const details1 = getKeywordMatchDetails(task1);
      const details2 = getKeywordMatchDetails(task2);
      
      const frontend1 = details1.find((d: any) => d.type === 'frontend');
      const frontend2 = details2.find((d: any) => d.type === 'frontend');
      
      expect(frontend2?.score).toBeGreaterThan(frontend1?.score || 0);
    });

    it('should handle case-insensitive matching', () => {
      const task = createTestTask('REACT COMPONENT', 'update the JAVASCRIPT and CSS');
      expect(getSuggestedAgentType(task)).toBe('frontend');
    });

    it('should match whole words only', () => {
      const task = createTestTask(
        'Database optimization', 
        'This is about database, not about databasesystem'
      );
      const details = getKeywordMatchDetails(task);
      const databaseMatch = details.find((d: any) => d.type === 'database');
      
      // Should match 'database' as a whole word
      expect(databaseMatch?.matchedKeywords).toContain('database');
      
      // Test that partial matches don't count
      const task2 = createTestTask(
        'Preact component',
        'This is about Preact component'
      );
      const details2 = getKeywordMatchDetails(task2);
      const frontendMatch = details2.find((d: any) => d.type === 'frontend');
      
      // Should match 'component' but not 'react' (which is inside 'preact')
      expect(frontendMatch?.matchedKeywords).toContain('component');
      expect(frontendMatch?.matchedKeywords).not.toContain('react');
    });
  });
});