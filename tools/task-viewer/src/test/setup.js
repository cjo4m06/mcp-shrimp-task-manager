import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, vi } from 'vitest';
import i18n from '../i18n/i18n.js';

// Initialize i18n for tests
beforeAll(async () => {
  // Initialize i18n with test-specific configuration
  await i18n.init({
    lng: 'en', // Use English for tests
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    // Use comprehensive test resources with all required translations
    resources: {
      en: {
        translation: {
          // Basic test translations
          appTitle: 'Test App',
          loading: 'Loading...',
          error: 'Error',
          save: 'Save',
          cancel: 'Cancel',
          // Profile related
          noProfilesClickAddTab: 'No profiles configured',
          noProfilesAvailable: 'No profiles available',
          'Failed to load profiles': 'Failed to load profiles',
          // Other common translations
          projectSettings: 'Project Settings',
          version: 'Version',
          releaseNotes: 'Release Notes',
          help: 'Help',
          templates: 'Templates',
          // TemplateManagement component translations
          function: 'Function',
          description: 'Description',
          status: 'Status',
          language: 'Language',
          actions: 'Actions',
          templateManagement: 'Template Management',
          templateManagementDesc: 'Manage and customize your prompt templates',
          // Status translations
          statusDefault: 'Default',
          statusCustom: 'Custom',
          statusCustomAppend: 'Custom Append',
          statusEnvOverride: 'Environment Override',
          statusEnvAppend: 'Environment Append',
          // Action button translations
          edit: 'Edit',
          preview: 'Preview',
          duplicate: 'Duplicate',
          resetToDefault: 'Reset to Default',
          activateTemplate: 'Activate',
          defaultTemplateAlreadyActive: 'Default template is already active',
          confirmResetTemplate: 'Are you sure you want to reset {{name}} template to default?',
          noTemplatesFound: 'No templates found',
          templates: 'templates',
          // Pagination translations
          showing: 'Showing',
          to: 'to',
          of: 'of',
          page: 'Page',
          Templates: 'Templates',
          // Task related (for consistency)
          tasks: 'tasks',
          empty: {
            noTasksFound: 'No tasks found',
          },
          noTasksMessage: 'No tasks available',
          filteredFrom: 'filtered from',
          total: 'total',
          // TemplateEditor specific translations
          saving: 'Saving...',
          saveTemplate: '💾 Save Template',
          // TaskDetailView specific translations
          description: 'Description',
          noDescriptionProvided: '—',
        },
      },
    },
  });
});

// Mock PerformanceObserver for jsdom environment
global.PerformanceObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}));

// Mock ResizeObserver for jsdom environment
global.ResizeObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver for jsdom environment
global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.confirm for tests
global.confirm = vi.fn(() => true);

// Mock window.alert for tests
global.alert = vi.fn();

// Mock window.scrollTo for tests
global.scrollTo = vi.fn();

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: vi.fn(),
    assign: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
});

// Mock URL constructor for tests
global.URL = global.URL || class URL {
  constructor(url, base) {
    this.href = url;
    this.origin = base || 'http://localhost:3000';
    this.protocol = 'http:';
    this.host = 'localhost:3000';
    this.hostname = 'localhost';
    this.port = '3000';
    this.pathname = url.startsWith('/') ? url : '/';
    this.search = '';
    this.hash = '';
  }
};

// Mock URLSearchParams
global.URLSearchParams = global.URLSearchParams || class URLSearchParams {
  constructor(params = '') {
    this.params = new Map();
    if (typeof params === 'string') {
      params.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
      });
    }
  }
  
  get(key) { return this.params.get(key); }
  set(key, value) { this.params.set(key, value); }
  has(key) { return this.params.has(key); }
  delete(key) { this.params.delete(key); }
  toString() {
    return Array.from(this.params.entries())
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
  }
};

// Mock localStorage with sensible default responses
const localStorageMock = {
  getItem: vi.fn((key) => {
    // Return null by default (real localStorage behavior)
    // But provide some sensible defaults for common keys to prevent parse errors
    const defaults = {
      'chatAgentsExpanded': 'true',
      'shrimpTaskViewerLanguage': 'en',
      'shrimpTaskManagerTheme': 'light',
    };
    
    // Handle pattern-based keys
    if (key && key.startsWith('chatAgentSelections_')) {
      return '{"openai": true}';
    }
    
    return defaults[key] || null;
  }),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch with comprehensive API endpoint responses
const createMockResponse = (data, status = 200, ok = true) => ({
  ok,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  headers: new Headers({
    'content-type': 'application/json',
  }),
  clone: vi.fn(),
});

// Default mock responses for all API endpoints
const mockApiResponses = {
  '/api/agents': () => createMockResponse([
    {
      id: 'agent-1',
      name: 'Test Agent 1',
      description: 'Test agent description',
      isActive: true,
    },
    {
      id: 'agent-2',
      name: 'Test Agent 2',
      description: 'Another test agent',
      isActive: false,
    },
  ]),
  '/api/agents/combined': () => createMockResponse([
    {
      name: 'test-agent-1.md',
      type: 'project',
      metadata: {
        name: 'Test Agent 1',
        description: 'Test agent description',
        color: '#3B82F6',
        tools: ['browser', 'text_editor']
      }
    },
    {
      name: 'test-agent-2.yaml',
      type: 'global', 
      metadata: {
        name: 'Test Agent 2',
        description: 'Another test agent',
        color: '#10B981',
        tools: ['file_manager']
      }
    },
  ]),
  '/api/tasks': () => createMockResponse([
    {
      id: 'task-1',
      uuid: 'test-uuid-1',
      name: 'Test Task 1',
      status: 'pending',
      assignedAgent: 'agent-1',
      dependencies: [],
      description: 'Test task description',
    },
    {
      id: 'task-2',
      uuid: 'test-uuid-2',
      name: 'Test Task 2',
      status: 'completed',
      assignedAgent: 'agent-2',
      dependencies: ['task-1'],
      description: 'Another test task',
    },
  ]),
  '/api/settings': () => createMockResponse({
    theme: 'light',
    language: 'en',
    autoRefresh: true,
    refreshInterval: 5000,
  }),
  '/api/global-settings': () => createMockResponse({
    openaiApiKey: '',
    maxTokens: 4000,
    temperature: 0.7,
  }),
  '/api/openai-key': () => createMockResponse({
    hasKey: false,
    keyPreview: '',
  }),
  '/api/chat-agents': () => createMockResponse([
    {
      id: 'chat-agent-1',
      name: 'Chat Assistant',
      type: 'openai',
      isActive: true,
    },
  ]),
  '/api/profiles': () => createMockResponse([
    {
      id: 'profile-1',
      name: 'Test Profile',
      taskFolderPath: '/test/tasks',
      projectRootPath: '/test/project',
      isActive: true,
    },
    {
      id: 'profile-2',
      name: 'Another Profile',
      taskFolderPath: '/test/other',
      projectRootPath: '/test/other-project',
      isActive: false,
    },
  ]),
  '/api/agents': () => createMockResponse([
    {
      id: 'profile-1',
      name: 'Test Profile',
      taskFolderPath: '/test/tasks',
      projectRootPath: '/test/project',
      path: '/test/tasks/tasks.json',
      projectRoot: '/test/project',
      isActive: true,
    },
    {
      id: 'profile-2',
      name: 'Another Profile',
      taskFolderPath: '/test/other',
      projectRootPath: '/test/other-project',
      path: '/test/other/tasks.json',
      projectRoot: '/test/other-project',
      isActive: false,
    },
  ]),
};

// Set up fetch mock
global.fetch = vi.fn().mockImplementation((url, options) => {
  const method = options?.method || 'GET';
  const urlString = typeof url === 'string' ? url : url.toString();
  
  // Handle specific endpoint patterns
  if (urlString.includes('/api/agents/combined/')) {
    // Handle combined agents request for any profile ID
    return Promise.resolve(mockApiResponses['/api/agents/combined']());
  }
  
  // Handle /api/tasks/{profileId} pattern
  if (urlString.match(/\/api\/tasks\/[^/]+(\?|$)/)) {
    return Promise.resolve(mockApiResponses['/api/tasks']());
  }
  
  if (urlString.includes('/api/profiles/')) {
    // Handle profile-specific requests
    if (method === 'GET' && urlString.includes('/tasks')) {
      return Promise.resolve(mockApiResponses['/api/tasks']());
    }
    if (method === 'GET' && urlString.includes('/agents')) {
      return Promise.resolve(mockApiResponses['/api/agents']());
    }
    // Default profile response
    return Promise.resolve(createMockResponse({
      id: 'profile-1',
      name: 'Test Profile',
      taskFolderPath: '/test/path',
      projectRootPath: '/test/root'
    }));
  }
  
  // Find matching endpoint
  for (const [endpoint, responseFactory] of Object.entries(mockApiResponses)) {
    if (urlString.includes(endpoint)) {
      return Promise.resolve(responseFactory());
    }
  }
  
  // Default response for unmocked endpoints
  return Promise.resolve(createMockResponse({ message: 'Not found' }, 404, false));
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset fetch mock
  global.fetch.mockClear();
  
  // Reset storage mocks
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // Reset window mocks
  global.confirm.mockClear();
  global.alert.mockClear();
  global.scrollTo.mockClear();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global test utilities
global.testUtils = {
  // Helper to mock fetch response for specific endpoint
  mockFetchResponse: (endpoint, data, status = 200) => {
    global.fetch.mockImplementationOnce((url) => {
      if (typeof url === 'string' && url.includes(endpoint)) {
        return Promise.resolve(createMockResponse(data, status, status < 400));
      }
      return Promise.reject(new Error(`Unmocked fetch call to ${url}`));
    });
  },
  
  // Helper to mock localStorage
  mockLocalStorage: (key, value) => {
    localStorageMock.getItem.mockImplementation((k) => (k === key ? value : null));
  },
  
  // Helper to create test task data
  createTestTask: (overrides = {}) => ({
    id: 'test-task-id',
    uuid: 'test-task-uuid',
    name: 'Test Task',
    status: 'pending',
    description: 'Test task description',
    assignedAgent: null,
    dependencies: [],
    ...overrides,
  }),
  
  // Helper to create test agent data
  createTestAgent: (overrides = {}) => ({
    id: 'test-agent-id',
    name: 'Test Agent',
    description: 'Test agent description',
    isActive: true,
    ...overrides,
  }),
};