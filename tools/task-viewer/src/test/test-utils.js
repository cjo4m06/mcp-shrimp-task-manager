import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Mock task data generator
export function createMockTask(overrides = {}) {
  return {
    id: `task-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Mock Task',
    description: 'Mock task description',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: null,
    implementationGuide: null,
    verificationCriteria: null,
    summary: null,
    completedAt: null,
    dependencies: [],
    relatedFiles: [],
    ...overrides
  };
}

// Mock profile data generator
export function createMockProfile(overrides = {}) {
  return {
    id: `agent-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Mock Agent',
    path: '/mock/path/tasks.json',
    ...overrides
  };
}

// Generate multiple mock tasks
export function createMockTasks(count, overrides = {}) {
  return Array.from({ length: count }, (_, i) => 
    createMockTask({
      id: `task-${i}`,
      name: `Task ${i}`,
      description: `Description for task ${i}`,
      ...overrides
    })
  );
}

// Custom render with common providers
export function renderWithProviders(ui, options = {}) {
  return render(ui, {
    ...options
  });
}

// Mock fetch helper
export function mockFetch(responses = {}) {
  global.fetch = vi.fn((url) => {
    const response = responses[url] || responses.default || {
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' })
    };

    return Promise.resolve({
      ok: response.ok !== false,
      status: response.status || 200,
      json: async () => response.json || response.data,
      text: async () => response.text || JSON.stringify(response.data || response.json || ''),
      ...response
    });
  });

  return global.fetch;
}

// Wait for async operations helper
export async function waitForAsync(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock file system helper
export function mockFileSystem(files = {}) {
  return {
    readFile: vi.fn((path) => {
      if (files[path]) {
        return Promise.resolve(
          typeof files[path] === 'string' 
            ? files[path] 
            : JSON.stringify(files[path])
        );
      }
      const error = new Error('File not found');
      error.code = 'ENOENT';
      return Promise.reject(error);
    }),
    writeFile: vi.fn(() => Promise.resolve()),
    mkdir: vi.fn(() => Promise.resolve()),
    unlink: vi.fn(() => Promise.resolve()),
    access: vi.fn((path) => {
      if (files[path]) {
        return Promise.resolve();
      }
      const error = new Error('File not found');
      error.code = 'ENOENT';
      return Promise.reject(error);
    })
  };
}

// Test data fixtures
export const fixtures = {
  tasks: {
    authentication: createMockTask({
      id: 'auth-task',
      name: 'Implement authentication',
      description: 'OAuth2 authentication system',
      status: 'in_progress',
      dependencies: [
        { taskId: 'redis-setup', name: 'Setup Redis' }
      ],
      relatedFiles: [
        { path: '/src/auth/index.js', type: 'CREATE' }
      ]
    }),
    database: createMockTask({
      id: 'db-task',
      name: 'Setup database',
      description: 'PostgreSQL database configuration',
      status: 'completed',
      completedAt: new Date().toISOString()
    }),
    testing: createMockTask({
      id: 'test-task',
      name: 'Write tests',
      description: 'Unit and integration tests',
      status: 'pending',
      notes: 'Use Vitest for testing framework'
    })
  },
  profiles: {
    development: createMockProfile({
      id: 'dev-agent',
      name: 'Development',
      path: '/dev/tasks.json'
    }),
    production: createMockProfile({
      id: 'prod-agent',
      name: 'Production',
      path: '/prod/tasks.json'
    })
  }
};

// Assert helpers
export const assertTask = {
  hasStatus: (task, status) => {
    expect(task.status).toBe(status);
  },
  isComplete: (task) => {
    expect(task.status).toBe('completed');
    expect(task.completedAt).toBeTruthy();
  },
  hasDependencies: (task) => {
    expect(task.dependencies).toBeDefined();
    expect(task.dependencies.length).toBeGreaterThan(0);
  },
  hasRelatedFiles: (task) => {
    expect(task.relatedFiles).toBeDefined();
    expect(task.relatedFiles.length).toBeGreaterThan(0);
  }
};

// Screen query helpers
export const queries = {
  getTaskRow: (screen, taskName) => {
    return screen.getByText(taskName).closest('tr');
  },
  getStatusBadge: (screen, status) => {
    return screen.getByText(status.replace('_', ' '));
  },
  getPaginationInfo: (screen) => {
    return screen.getByText(/Showing \d+ to \d+ of \d+ tasks/);
  }
};

// Event helpers
export const events = {
  selectProfile: (screen, profileName) => {
    const profileTab = screen.getByText(profileName);
    fireEvent.click(profileTab);
  },
  searchTasks: async (screen, searchTerm, user) => {
    const searchInput = screen.getByPlaceholderText(/Search tasks/);
    await user.clear(searchInput);
    await user.type(searchInput, searchTerm);
  },
  clickTask: (screen, taskName) => {
    const taskRow = queries.getTaskRow(screen, taskName);
    fireEvent.click(taskRow);
  }
};

// Validation helpers
export const validate = {
  taskInTable: (screen, task) => {
    expect(screen.getByText(task.name)).toBeInTheDocument();
    if (task.description) {
      expect(screen.getByText(new RegExp(task.description.substring(0, 50)))).toBeInTheDocument();
    }
    if (task.status) {
      expect(queries.getStatusBadge(screen, task.status)).toBeInTheDocument();
    }
  },
  taskNotInTable: (screen, task) => {
    expect(screen.queryByText(task.name)).not.toBeInTheDocument();
  },
  profilesLoaded: (screen, profiles) => {
    profiles.forEach(profile => {
      expect(screen.getByText(profile.name)).toBeInTheDocument();
    });
  }
};

// Mock server response builders
export const responseBuilders = {
  success: (data) => ({
    ok: true,
    status: 200,
    json: data
  }),
  error: (message, status = 500) => ({
    ok: false,
    status,
    json: { error: message }
  }),
  profiles: (profiles = []) => ({
    ok: true,
    status: 200,
    json: profiles
  }),
  tasks: (tasks = []) => ({
    ok: true,
    status: 200,
    json: { tasks }
  })
};