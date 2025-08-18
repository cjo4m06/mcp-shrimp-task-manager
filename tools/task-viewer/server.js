#!/usr/bin/env node

import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Version information
const VERSION = '2.0.0';
const PORT = process.env.SHRIMP_VIEWER_PORT || 9998;
const SETTINGS_FILE = path.join(os.homedir(), '.shrimp-task-viewer-settings.json');

// Default agent data paths configuration
const defaultAgents = [];

let agents = [];

// Load or create settings file
async function loadSettings() {
    try {
        console.log('Loading settings from:', SETTINGS_FILE);
        const data = await fs.readFile(SETTINGS_FILE, 'utf8');
        const settings = JSON.parse(data);
        console.log('Loaded settings:', settings);
        return settings.agents || [];
    } catch (err) {
        console.error('Error loading settings:', err.message);
        await saveSettings(defaultAgents);
        return defaultAgents;
    }
}

// Save settings file
async function saveSettings(agentList) {
    const settings = {
        agents: agentList,
        lastUpdated: new Date().toISOString(),
        version: VERSION
    };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// Add new agent
async function addAgent(name, filePath, projectRoot = null) {
    const id = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    const newAgent = { id, name, path: filePath, projectRoot };
    
    const existingIndex = agents.findIndex(a => a.id === id);
    if (existingIndex >= 0) {
        agents[existingIndex] = newAgent;
    } else {
        agents.push(newAgent);
    }
    
    await saveSettings(agents);
    return newAgent;
}

// Remove agent
async function removeAgent(agentId) {
    agents = agents.filter(a => a.id !== agentId);
    await saveSettings(agents);
}

// Rename agent
async function renameAgent(agentId, newName) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
        throw new Error('Agent not found');
    }
    agent.name = newName;
    await saveSettings(agents);
    return agent;
}

async function updateAgent(agentId, updates) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
        throw new Error('Agent not found');
    }
    
    // Apply updates
    if (updates.name !== undefined) {
        agent.name = updates.name;
    }
    if (updates.projectRoot !== undefined) {
        agent.projectRoot = updates.projectRoot;
    }
    
    await saveSettings(agents);
    return agent;
}

// MIME type helper
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[ext] || 'text/plain';
}

// Serve static files from dist directory
async function serveStaticFile(req, res, filePath) {
    try {
        const fullPath = path.join(__dirname, 'dist', filePath);
        const data = await fs.readFile(fullPath);
        const mimeType = getMimeType(fullPath);
        
        res.writeHead(200, { 
            'Content-Type': mimeType,
            'Cache-Control': 'public, max-age=31536000' // 1 year cache for assets
        });
        res.end(data);
    } catch (err) {
        // If file not found, serve index.html for SPA routing
        if (err.code === 'ENOENT' && !filePath.includes('.')) {
            try {
                const indexPath = path.join(__dirname, 'dist', 'index.html');
                const indexData = await fs.readFile(indexPath);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(indexData);
            } catch (indexErr) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('React app not built. Run: npm run build');
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
        }
    }
}

// Initialize and start server
async function startServer() {
    agents = await loadSettings();
    
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        
        // API routes
        if (url.pathname === '/api/agents' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(agents));
            
        } else if (url.pathname === '/api/add-profile' && req.method === 'POST') {
            // Handle JSON or form data
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                try {
                    let name, taskFileContent, filePath, projectRoot;
                    
                    // Try to parse as JSON first
                    const contentType = req.headers['content-type'] || '';
                    if (contentType.includes('application/json')) {
                        const data = JSON.parse(body);
                        name = data.name;
                        taskFileContent = data.taskFile;
                        filePath = data.filePath;
                        projectRoot = data.projectRoot;
                    } else {
                        // Parse as URL-encoded form data
                        const formData = new URLSearchParams(body);
                        name = formData.get('name');
                        taskFileContent = formData.get('taskFile');
                        filePath = formData.get('filePath');
                        projectRoot = formData.get('projectRoot');
                    }
                    
                    if (!name) {
                        res.writeHead(400, { 'Content-Type': 'text/plain' });
                        res.end('Missing name');
                        return;
                    }
                    
                    // If a file path is provided, use it directly
                    if (filePath) {
                        const agent = await addAgent(name, filePath, projectRoot);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(agent));
                    } else if (taskFileContent) {
                        // Save the file content to a temporary location
                        const tempDir = path.join(os.tmpdir(), 'shrimp-task-viewer');
                        await fs.mkdir(tempDir, { recursive: true });
                        const tempFilePath = path.join(tempDir, `${Date.now()}-tasks.json`);
                        await fs.writeFile(tempFilePath, taskFileContent);
                        
                        const agent = await addAgent(name, tempFilePath, projectRoot);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(agent));
                    } else {
                        res.writeHead(400, { 'Content-Type': 'text/plain' });
                        res.end('Missing taskFile or filePath');
                    }
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal server error: ' + err.message);
                }
            });
            
        } else if (url.pathname.startsWith('/api/remove-profile/') && req.method === 'DELETE') {
            const agentId = url.pathname.split('/').pop();
            try {
                await removeAgent(agentId);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Profile removed');
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal server error: ' + err.message);
            }
            
        } else if (url.pathname.startsWith('/api/rename-profile/') && req.method === 'PUT') {
            const agentId = url.pathname.split('/').pop();
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                try {
                    const { name } = JSON.parse(body);
                    if (!name) {
                        res.writeHead(400, { 'Content-Type': 'text/plain' });
                        res.end('Missing name');
                        return;
                    }
                    const agent = await renameAgent(agentId, name);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(agent));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal server error: ' + err.message);
                }
            });
            
        } else if (url.pathname.startsWith('/api/update-profile/') && req.method === 'PUT') {
            const agentId = url.pathname.split('/').pop();
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', async () => {
                try {
                    const updates = JSON.parse(body);
                    const agent = await updateAgent(agentId, updates);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(agent));
                } catch (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal server error: ' + err.message);
                }
            });
            
        } else if (url.pathname.startsWith('/api/tasks/')) {
            const agentId = url.pathname.split('?')[0].split('/').pop();
            const agent = agents.find(a => a.id === agentId);
            
            if (!agent) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Profile not found');
                return;
            }
            
            try {
                console.log(`Reading tasks from: ${agent.path}`);
                const stats = await fs.stat(agent.path);
                console.log(`File last modified: ${stats.mtime}`);
                
                const data = await fs.readFile(agent.path, 'utf8');
                const tasksData = JSON.parse(data);
                
                // Log task status for debugging
                const task880f = tasksData.tasks?.find(t => t.id === '880f4dd8-a603-4bb9-8d4d-5033887d0e0f');
                if (task880f) {
                    console.log(`Task 880f4dd8 status: ${task880f.status}`);
                }
                
                // Add projectRoot to the response
                if (agent.projectRoot) {
                    tasksData.projectRoot = agent.projectRoot;
                }
                
                res.writeHead(200, { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                });
                res.end(JSON.stringify(tasksData));
            } catch (err) {
                console.error(`Error reading file ${agent.path}:`, err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error reading task file: ' + err.message);
            }
            
        } else if (url.pathname === '/api/readme' && req.method === 'GET') {
            // Serve README.md file
            try {
                const readmePath = path.join(__dirname, 'README.md');
                const data = await fs.readFile(readmePath, 'utf8');
                res.writeHead(200, { 
                    'Content-Type': 'text/markdown; charset=utf-8',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                });
                res.end(data);
            } catch (err) {
                console.error('Error reading README:', err);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('README not found');
            }
            
        } else if (url.pathname.startsWith('/releases/')) {
            // Serve release files (markdown and images)
            const fileName = url.pathname.split('/').pop();
            try {
                const releasePath = path.join(__dirname, 'releases', fileName);
                console.log('Attempting to read release file:', releasePath);
                
                if (fileName.endsWith('.md')) {
                    const data = await fs.readFile(releasePath, 'utf8');
                    res.writeHead(200, { 
                        'Content-Type': 'text/markdown; charset=utf-8',
                        'Cache-Control': 'no-cache, no-store, must-revalidate'
                    });
                    res.end(data);
                } else {
                    // Serve images and other files
                    const data = await fs.readFile(releasePath);
                    const mimeType = getMimeType(releasePath);
                    res.writeHead(200, { 
                        'Content-Type': mimeType,
                        'Cache-Control': 'public, max-age=31536000' // Cache images for 1 year
                    });
                    res.end(data);
                }
            } catch (err) {
                console.error('Error reading release file:', err);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Release file not found');
            }
            
        } else {
            // Serve static files (React app)
            const filePath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
            await serveStaticFile(req, res, filePath);
        }
    });

    server.listen(PORT, '127.0.0.1', () => {
        console.log(`\n🦐 Shrimp Task Manager Viewer Server v${VERSION}`);
        console.log('===============================================');
        console.log(`Server is running at: http://localhost:${PORT}`);
        console.log(`Also accessible at: http://127.0.0.1:${PORT}`);
        console.log(`\nSettings file: ${SETTINGS_FILE}`);
        console.log('    ');
        console.log('Available profiles:');
        if (agents.length === 0) {
            console.log('  - No profiles configured. Add profiles via the web interface.');
        } else {
            agents.forEach(agent => {
                console.log(`  - ${agent.name} (${agent.path})`);
            });
        }
        console.log('\n🎯 Features:');
        console.log('  • React-based UI with TanStack Table');
        console.log('  • Real-time search and filtering');
        console.log('  • Sortable columns with pagination');
        console.log('  • Auto-refresh functionality');
        console.log('  • Profile management via web interface');
        console.log('\nOpen your browser to view tasks!');
    });

    return server;
}

// Start the server
startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});

export { startServer };