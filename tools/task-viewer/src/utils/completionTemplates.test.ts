import {
  createUITaskTemplate,
  createBackendTaskTemplate,
  createDevOpsTemplate,
  createGenericTemplate,
  detectTaskType,
  selectCompletionTemplate,
  getTemplateInfo,
  getAllTemplates,
  Task
} from './completionTemplates';

describe('Completion Templates', () => {
  const mockDate = new Date('2024-01-15T10:30:00');
  
  const baseTask: Task = {
    id: 'test-task-123',
    name: 'Test Task',
    description: 'Test task description',
    summary: 'Task completed successfully',
    status: 'completed',
    completedAt: mockDate,
    notes: 'Additional notes for testing'
  };

  describe('createUITaskTemplate', () => {
    it('should create a UI/Frontend template with all required sections', () => {
      const uiTask: Task = {
        ...baseTask,
        name: 'Create React Component',
        agent: 'frontend-specialist',
        dependencies: ['React', 'CSS Modules']
      };
      
      const template = createUITaskTemplate(uiTask);
      
      expect(template).toContain('# UI/Frontend Task Completion Report');
      expect(template).toContain('Create React Component');
      expect(template).toContain('frontend-specialist');
      expect(template).toContain('🎨 Component Implementation');
      expect(template).toContain('🎯 User Experience Enhancements');
      expect(template).toContain('♿ Accessibility Features');
      expect(template).toContain('🔧 Technical Implementation');
      expect(template).toContain('🧪 Testing Coverage');
      expect(template).toContain('React');
      expect(template).toContain('CSS Modules');
    });

    it('should handle tasks without optional fields', () => {
      const minimalTask: Task = {
        id: 'minimal-ui',
        name: 'UI Task',
        status: 'completed'
      };
      
      const template = createUITaskTemplate(minimalTask);
      
      expect(template).toContain('UI Task');
      expect(template).not.toContain('Assigned Agent:');
      expect(template).toContain('No external dependencies');
    });
  });

  describe('createBackendTaskTemplate', () => {
    it('should create a Backend/API template with all required sections', () => {
      const backendTask: Task = {
        ...baseTask,
        name: 'Create REST API Endpoint',
        agent: 'backend-specialist',
        summary: '- POST /api/users - Create new user\n- GET /api/users/:id - Get user by ID',
        dependencies: ['Express', 'MongoDB']
      };
      
      const template = createBackendTaskTemplate(backendTask);
      
      expect(template).toContain('# Backend/API Task Completion Report');
      expect(template).toContain('Create REST API Endpoint');
      expect(template).toContain('🚀 API Implementation');
      expect(template).toContain('🗄️ Database Operations');
      expect(template).toContain('🔐 Security Implementation');
      expect(template).toContain('⚡ Performance & Scalability');
      expect(template).toContain('POST /api/users');
      expect(template).toContain('Express');
      expect(template).toContain('MongoDB');
    });
  });

  describe('createDevOpsTemplate', () => {
    it('should create a DevOps/Infrastructure template with all required sections', () => {
      const devopsTask: Task = {
        ...baseTask,
        name: 'Setup CI/CD Pipeline',
        agent: 'devops-engineer',
        summary: '- Configured GitHub Actions workflow\n- Added automated testing stage',
        dependencies: ['Docker', 'GitHub Actions']
      };
      
      const template = createDevOpsTemplate(devopsTask);
      
      expect(template).toContain('# DevOps/Infrastructure Task Completion Report');
      expect(template).toContain('Setup CI/CD Pipeline');
      expect(template).toContain('🏗️ Infrastructure Changes');
      expect(template).toContain('🔧 Automation & CI/CD');
      expect(template).toContain('📊 Monitoring & Observability');
      expect(template).toContain('🔒 Security & Compliance');
      expect(template).toContain('💰 Cost Optimization');
      expect(template).toContain('🚀 Deployment Details');
      expect(template).toContain('GitHub Actions');
      expect(template).toContain('Docker');
    });
  });

  describe('createGenericTemplate', () => {
    it('should create a generic template for general tasks', () => {
      const genericTask: Task = {
        ...baseTask,
        name: 'Documentation Update',
        description: 'Update project documentation',
        summary: 'Updated README and API docs'
      };
      
      const template = createGenericTemplate(genericTask);
      
      expect(template).toContain('# Task Completion Report');
      expect(template).toContain('Documentation Update');
      expect(template).toContain('Update project documentation');
      expect(template).toContain('📝 Task Description');
      expect(template).toContain('✨ Summary of Work Completed');
      expect(template).toContain('🔍 Implementation Details');
      expect(template).toContain('🎯 Success Criteria Met');
      expect(template).toContain('Updated README and API docs');
    });
  });

  describe('detectTaskType', () => {
    it('should detect UI/Frontend tasks', () => {
      const uiTasks = [
        { id: '1', name: 'Create React Component', status: 'completed' as const },
        { id: '2', name: 'Fix CSS styling', status: 'completed' as const },
        { id: '3', name: 'Improve UX design', status: 'completed' as const },
        { id: '4', name: 'Add accessibility features', status: 'completed' as const }
      ];
      
      uiTasks.forEach(task => {
        expect(detectTaskType(task)).toBe('ui');
      });
    });

    it('should detect Backend/API tasks', () => {
      const backendTasks = [
        { id: '1', name: 'Create REST API', status: 'completed' as const },
        { id: '2', name: 'Setup database schema', status: 'completed' as const },
        { id: '3', name: 'Implement authentication', status: 'completed' as const },
        { id: '4', name: 'Optimize SQL queries', status: 'completed' as const }
      ];
      
      backendTasks.forEach(task => {
        expect(detectTaskType(task)).toBe('backend');
      });
    });

    it('should detect DevOps tasks', () => {
      const devopsTasks = [
        { id: '1', name: 'Setup Docker container', status: 'completed' as const },
        { id: '2', name: 'Configure CI/CD pipeline', status: 'completed' as const },
        { id: '3', name: 'Deploy to Kubernetes', status: 'completed' as const },
        { id: '4', name: 'Setup monitoring with Prometheus', status: 'completed' as const }
      ];
      
      devopsTasks.forEach(task => {
        expect(detectTaskType(task)).toBe('devops');
      });
    });

    it('should return generic for unmatched tasks', () => {
      const genericTasks = [
        { id: '1', name: 'Write documentation', status: 'completed' as const },
        { id: '2', name: 'Review code', status: 'completed' as const },
        { id: '3', name: 'Plan sprint', status: 'completed' as const }
      ];
      
      genericTasks.forEach(task => {
        expect(detectTaskType(task)).toBe('generic');
      });
    });

    it('should use agent field for type detection', () => {
      const task: Task = {
        id: '1',
        name: 'Generic Task',
        status: 'completed',
        agent: 'frontend-developer'
      };
      
      expect(detectTaskType(task)).toBe('ui');
    });
  });

  describe('selectCompletionTemplate', () => {
    it('should select UI template for frontend tasks', () => {
      const task: Task = {
        id: '1',
        name: 'Build React Dashboard',
        status: 'completed'
      };
      
      const template = selectCompletionTemplate(task);
      expect(template).toContain('UI/Frontend Task Completion Report');
    });

    it('should select Backend template for API tasks', () => {
      const task: Task = {
        id: '1',
        name: 'Create GraphQL API',
        status: 'completed'
      };
      
      const template = selectCompletionTemplate(task);
      expect(template).toContain('Backend/API Task Completion Report');
    });

    it('should select DevOps template for infrastructure tasks', () => {
      const task: Task = {
        id: '1',
        name: 'Setup AWS Infrastructure',
        status: 'completed'
      };
      
      const template = selectCompletionTemplate(task);
      expect(template).toContain('DevOps/Infrastructure Task Completion Report');
    });

    it('should select Generic template for general tasks', () => {
      const task: Task = {
        id: '1',
        name: 'Project Planning',
        status: 'completed'
      };
      
      const template = selectCompletionTemplate(task);
      expect(template).toContain('Task Completion Report');
      expect(template).not.toContain('UI/Frontend');
      expect(template).not.toContain('Backend/API');
      expect(template).not.toContain('DevOps/Infrastructure');
    });
  });

  describe('getTemplateInfo', () => {
    it('should return correct template info for UI type', () => {
      const info = getTemplateInfo('ui');
      expect(info.name).toBe('UI/Frontend Template');
      expect(info.type).toBe('ui');
      expect(info.description).toContain('frontend and UI tasks');
    });

    it('should return correct template info for Backend type', () => {
      const info = getTemplateInfo('backend');
      expect(info.name).toBe('Backend/API Template');
      expect(info.type).toBe('backend');
      expect(info.description).toContain('backend and API tasks');
    });

    it('should return correct template info for DevOps type', () => {
      const info = getTemplateInfo('devops');
      expect(info.name).toBe('DevOps/Infrastructure Template');
      expect(info.type).toBe('devops');
      expect(info.description).toContain('infrastructure and DevOps tasks');
    });

    it('should return correct template info for Generic type', () => {
      const info = getTemplateInfo('generic');
      expect(info.name).toBe('Generic Task Template');
      expect(info.type).toBe('generic');
      expect(info.description).toContain('general tasks');
    });
  });

  describe('getAllTemplates', () => {
    it('should return all four template types', () => {
      const templates = getAllTemplates();
      
      expect(templates).toHaveLength(4);
      expect(templates.map(t => t.type)).toEqual(['ui', 'backend', 'devops', 'generic']);
      
      templates.forEach(template => {
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('type');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('template');
      });
    });
  });

  describe('Template Formatting', () => {
    it('should maintain consistent markdown formatting across all templates', () => {
      const task: Task = {
        id: 'test',
        name: 'Test Task',
        status: 'completed',
        summary: 'Test summary'
      };
      
      const templates = [
        createUITaskTemplate(task),
        createBackendTaskTemplate(task),
        createDevOpsTemplate(task),
        createGenericTemplate(task)
      ];
      
      templates.forEach(template => {
        expect(template).toMatch(/^# .*Task Completion Report/);
        expect(template).toContain('## 📋 Task Overview');
        expect(template).toContain('**Task:** Test Task');
        expect(template).toContain('**Status:** ✅ Completed');
        expect(template).toContain('## 📝 Additional Notes');
        expect(template).toContain('## 🔗 Dependencies');
        expect(template).toMatch(/---\n\*This completion report was generated for .*task tracking\*$/);
      });
    });

    it('should properly format multi-line summaries', () => {
      const task: Task = {
        id: 'test',
        name: 'Test Task',
        status: 'completed',
        summary: 'Line 1\nLine 2\n\nLine 3'
      };
      
      const template = createUITaskTemplate(task);
      expect(template).toContain('- Line 1\n- Line 2\n- Line 3');
    });
  });
});