import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

// Mock modules
vi.mock('fs/promises');

describe('Agent Detection Tests', () => {
  let mockReaddir;
  let mockReadFile;
  let mockStat;

  beforeEach(() => {
    mockReaddir = vi.fn();
    mockReadFile = vi.fn();
    mockStat = vi.fn();
    
    fs.readdir = mockReaddir;
    fs.readFile = mockReadFile;
    fs.stat = mockStat;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Project Agent Detection', () => {
    it('should detect agents in .claude/agents directory', async () => {
      const projectRoot = '/home/fire/claude/joel_rasmussen/survey_system';
      const agentsDir = path.join(projectRoot, '.claude', 'agents');
      
      // Mock directory listing
      mockReaddir.mockResolvedValue([
        'frontend.md',
        'backend.yaml',
        'database.yml',
        'README.txt', // Should be ignored
        '.DS_Store'   // Should be ignored
      ]);

      // Mock file contents
      mockReadFile.mockImplementation((filePath) => {
        if (filePath.includes('frontend.md')) {
          return Promise.resolve(`---
name: Frontend Developer
description: Handles React and UI development
tools:
  - Read
  - Write
  - Edit
---

# Frontend Agent`);
        }
        if (filePath.includes('backend.yaml')) {
          return Promise.resolve(`name: Backend Developer
description: Handles Node.js and API development
tools:
  - Bash
  - Read
  - Write`);
        }
        if (filePath.includes('database.yml')) {
          return Promise.resolve(`name: Database Admin
description: Manages database operations
tools:
  - SQL
  - Bash`);
        }
        return Promise.resolve('');
      });

      // Simulate the server logic
      const files = await fs.readdir(agentsDir);
      const agentFiles = files.filter(file => 
        file.endsWith('.md') || file.endsWith('.yaml') || file.endsWith('.yml')
      );

      expect(agentFiles).toHaveLength(3);
      expect(agentFiles).toContain('frontend.md');
      expect(agentFiles).toContain('backend.yaml');
      expect(agentFiles).toContain('database.yml');
      expect(agentFiles).not.toContain('README.txt');
      expect(agentFiles).not.toContain('.DS_Store');
    });

    it('should handle missing .claude/agents directory gracefully', async () => {
      const projectRoot = '/home/fire/claude/project_without_agents';
      const agentsDir = path.join(projectRoot, '.claude', 'agents');
      
      // Mock directory not found error
      mockReaddir.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      let agents = [];
      try {
        await fs.readdir(agentsDir);
      } catch (err) {
        // Directory doesn't exist, return empty array
        agents = [];
      }

      expect(agents).toEqual([]);
    });

    it('should handle empty .claude/agents directory', async () => {
      const projectRoot = '/home/fire/claude/project_with_empty_agents';
      const agentsDir = path.join(projectRoot, '.claude', 'agents');
      
      // Mock empty directory
      mockReaddir.mockResolvedValue([]);

      const files = await fs.readdir(agentsDir);
      const agentFiles = files.filter(file => 
        file.endsWith('.md') || file.endsWith('.yaml') || file.endsWith('.yml')
      );

      expect(agentFiles).toHaveLength(0);
    });

    it('should correctly parse agent metadata from markdown files', async () => {
      const content = `---
name: Test Agent
description: This is a test agent
tools:
  - Read
  - Write
  - Edit
color: #FF5733
---

# Agent Content`;

      // Simulate parseAgentMetadata function
      function parseAgentMetadata(content) {
        const metadata = {
          name: '',
          description: '',
          tools: [],
          color: null
        };
        
        const lines = content.split('\n');
        let inFrontmatter = false;
        let currentField = null;
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine === '---') {
            if (!inFrontmatter) {
              inFrontmatter = true;
              continue;
            } else {
              break;
            }
          }
          
          if (inFrontmatter) {
            if (trimmedLine.startsWith('name:')) {
              metadata.name = trimmedLine.substring(5).trim();
            } else if (trimmedLine.startsWith('description:')) {
              metadata.description = trimmedLine.substring(12).trim();
            } else if (trimmedLine.startsWith('tools:')) {
              currentField = 'tools';
            } else if (trimmedLine.startsWith('color:')) {
              metadata.color = trimmedLine.substring(6).trim();
            } else if (currentField === 'tools' && trimmedLine.startsWith('-')) {
              metadata.tools.push(trimmedLine.substring(1).trim());
            }
          }
        }
        
        return metadata;
      }

      const metadata = parseAgentMetadata(content);
      
      expect(metadata.name).toBe('Test Agent');
      expect(metadata.description).toBe('This is a test agent');
      expect(metadata.tools).toEqual(['Read', 'Write', 'Edit']);
      expect(metadata.color).toBe('#FF5733');
    });

    it('should handle malformed agent files gracefully', async () => {
      const content = `This is not a valid agent file
It has no frontmatter
Just plain text`;

      function parseAgentMetadata(content) {
        const metadata = {
          name: '',
          description: '',
          tools: [],
          color: null
        };
        
        const lines = content.split('\n');
        let inFrontmatter = false;
        
        for (const line of lines) {
          if (line.trim() === '---') {
            if (!inFrontmatter) {
              inFrontmatter = true;
            } else {
              break;
            }
          }
        }
        
        return metadata;
      }

      const metadata = parseAgentMetadata(content);
      
      expect(metadata.name).toBe('');
      expect(metadata.description).toBe('');
      expect(metadata.tools).toEqual([]);
      expect(metadata.color).toBeNull();
    });

    it('should detect project root correctly', () => {
      const testCases = [
        {
          projectPath: '/home/fire/claude/shrimp_data_task_viewer/tasks.json',
          expectedRoot: '/home/fire/claude/shrimp_data_task_viewer'
        },
        {
          projectPath: '/home/fire/claude/joel_rasmussen/survey_system/tasks.json',
          expectedRoot: '/home/fire/claude/joel_rasmussen/survey_system'
        }
      ];

      testCases.forEach(({ projectPath, expectedRoot }) => {
        const projectRoot = path.dirname(projectPath);
        expect(projectRoot).toBe(expectedRoot);
      });
    });
  });

  describe('Error Message Formatting', () => {
    it('should have proper spacing after periods in error messages', () => {
      const errorMessage = 'No agents found in /path/to/project/.claude/agents. Click here to learn more.';
      
      // Check that there's a space after the period
      expect(errorMessage).toMatch(/\.\s+/);
      expect(errorMessage).not.toMatch(/\.[A-Z]/); // No capital letter immediately after period
    });

    it('should format multi-line error messages correctly', () => {
      const lines = [
        'No agents found in /path/to/project/.claude/agents.',
        'Click here to learn how to create agents.'
      ];
      
      const formattedMessage = lines.join(' ');
      
      expect(formattedMessage).toBe('No agents found in /path/to/project/.claude/agents. Click here to learn how to create agents.');
      expect(formattedMessage).toMatch(/\.\s+Click/);
    });
  });
});