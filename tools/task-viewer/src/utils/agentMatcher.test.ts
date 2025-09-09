import { describe, it, expect } from 'vitest';
import { matchAgentToTask } from './agentMatcher';

describe('AgentMatcher', () => {
  describe('should match data/ML tasks correctly', () => {
    it('should match data tasks with exact type', () => {
      const agents = [
        { name: 'GeneralAgent' },
        { name: 'DataAgent', type: 'data' },
        { name: 'FrontendAgent', type: 'frontend' }
      ];
      const task = {
        title: 'Analyze sales data',
        description: 'Process CSV files and generate reports'
      };
      
      const result = matchAgentToTask(agents, task);
      expect(result.name).toBe('DataAgent');
    });

    it('should match ML tasks with exact type', () => {
      const agents = [
        { name: 'GeneralAgent' },
        { name: 'MLAgent', type: 'data' },
        { name: 'BackendAgent', type: 'backend' }
      ];
      const task = {
        title: 'Train machine learning model',
        description: 'Implement neural network for classification'
      };
      
      const result = matchAgentToTask(agents, task);
      expect(result.name).toBe('MLAgent');
    });
  });

  describe('should match based on capabilities when available', () => {
    it('should match React tasks to UIAgent via capabilities', () => {
      const agents = [
        { name: 'GeneralAgent' },
        { name: 'UIAgent', capabilities: ['React', 'Vue', 'Angular'] },
        { name: 'BackendAgent', capabilities: ['Node.js', 'Python'] }
      ];
      const task = {
        title: 'Create React component',
        description: 'Build a new dashboard component using React hooks'
      };
      
      const result = matchAgentToTask(agents, task);
      expect(result.name).toBe('UIAgent');
    });

    it('should match API tasks to BackendAgent via capabilities', () => {
      const agents = [
        { name: 'GeneralAgent' },
        { name: 'FrontendAgent', capabilities: ['HTML', 'CSS'] },
        { name: 'BackendAgent', capabilities: ['API', 'REST', 'GraphQL'] }
      ];
      const task = {
        title: 'Implement REST API',
        description: 'Create endpoints for user management'
      };
      
      const result = matchAgentToTask(agents, task);
      expect(result.name).toBe('BackendAgent');
    });

    it('should match based on multiple capability matches', () => {
      const agents = [
        { name: 'GeneralAgent' },
        { name: 'PartialMatch', capabilities: ['React'] },
        { name: 'BestMatch', capabilities: ['React', 'TypeScript', 'Testing'] }
      ];
      const task = {
        title: 'React TypeScript Testing',
        description: 'Write tests for React components using TypeScript'
      };
      
      const result = matchAgentToTask(agents, task);
      expect(result.name).toBe('BestMatch');
    });
  });

  describe('should prefer exact type matches over name matches', () => {
    it('should prefer type match over partial name match', () => {
      const agents = [
        { name: 'DataProcessor' }, // partial name match
        { name: 'SpecializedAgent', type: 'data' } // exact type match
      ];
      const task = {
        title: 'Process data files',
        description: 'Analyze CSV and JSON data'
      };
      
      const result = matchAgentToTask(agents, task);
      expect(result.name).toBe('SpecializedAgent');
    });

    it('should prefer type match over capabilities when both exist', () => {
      const agents = [
        { name: 'Agent1', capabilities: ['frontend', 'React'] },
        { name: 'Agent2', type: 'frontend', capabilities: ['Vue'] }
      ];
      const task = {
        title: 'Build frontend interface',
        description: 'Create user interface with React'
      };
      
      const result = matchAgentToTask(agents, task);
      expect(result.name).toBe('Agent2'); // type match wins
    });
  });

  describe('backward compatibility', () => {
    it('should work with agents that have no type or capabilities', () => {
      const agents = [
        { name: 'DataAgent' },
        { name: 'FrontendAgent' },
        { name: 'BackendAgent' }
      ];
      const task = {
        title: 'Work with data',
        description: 'Process information'
      };
      
      const result = matchAgentToTask(agents, task);
      expect(result.name).toBe('DataAgent');
    });

    it('should handle empty agents array', () => {
      const agents = [];
      const task = {
        title: 'Any task',
        description: 'Some description'
      };
      
      const result = matchAgentToTask(agents, task);
      expect(result).toBeNull();
    });

    it('should handle null/undefined inputs', () => {
      expect(matchAgentToTask(null, {})).toBeNull();
      expect(matchAgentToTask(undefined, {})).toBeNull();
      expect(matchAgentToTask([], null)).toBeNull();
      expect(matchAgentToTask([], undefined)).toBeNull();
    });
  });

  describe('task type detection', () => {
    it('should detect frontend tasks', () => {
      const agents = [
        { name: 'GeneralAgent' },
        { name: 'FrontendAgent', type: 'frontend' }
      ];
      const task = {
        title: 'Update UI components',
        description: 'Modify React components and CSS styles'
      };
      
      const result = matchAgentToTask(agents, task);
      expect(result.name).toBe('FrontendAgent');
    });

    it('should detect backend tasks', () => {
      const agents = [
        { name: 'GeneralAgent' },
        { name: 'BackendAgent', type: 'backend' }
      ];
      const task = {
        title: 'Create API endpoints',
        description: 'Implement database queries and server logic'
      };
      
      const result = matchAgentToTask(agents, task);
      expect(result.name).toBe('BackendAgent');
    });
  });
});