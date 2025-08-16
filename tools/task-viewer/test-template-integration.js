#!/usr/bin/env node

/**
 * Test script to verify custom template integration between viewer and MCP server
 * 
 * This script tests:
 * 1. Whether custom templates saved by the viewer are accessible
 * 2. How to properly configure environment variables for MCP to use custom templates
 * 3. Whether the MCP server needs to be restarted to pick up changes
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const VIEWER_TEMPLATES_DIR = path.join(os.homedir(), '.shrimp-task-viewer-templates');
const MCP_ENV_PREFIX = 'MCP_PROMPT_';

async function checkCustomTemplates() {
  console.log('=== Custom Template Integration Test ===\n');
  
  // 1. Check if custom templates exist
  console.log('1. Checking custom templates directory...');
  try {
    const customTemplates = await fs.readdir(VIEWER_TEMPLATES_DIR);
    console.log(`   Found ${customTemplates.length} custom templates:`, customTemplates);
    
    // Read each custom template
    for (const templateName of customTemplates) {
      const templatePath = path.join(VIEWER_TEMPLATES_DIR, templateName, 'index.md');
      try {
        const content = await fs.readFile(templatePath, 'utf8');
        console.log(`\n   Template: ${templateName}`);
        console.log(`   First 100 chars: ${content.substring(0, 100)}...`);
        
        // Check for Context7 reference
        if (content.includes('Context7') || content.includes('context7')) {
          console.log(`   ✓ Contains Context7 reference!`);
        }
      } catch (err) {
        console.log(`   ✗ Error reading template: ${err.message}`);
      }
    }
  } catch (err) {
    console.log(`   ✗ Custom templates directory not found: ${err.message}`);
  }
  
  // 2. Check current environment variables
  console.log('\n2. Checking MCP_PROMPT environment variables...');
  const mcpEnvVars = Object.entries(process.env)
    .filter(([key]) => key.startsWith(MCP_ENV_PREFIX))
    .map(([key, value]) => ({ key, value: value.substring(0, 50) + '...' }));
  
  if (mcpEnvVars.length > 0) {
    console.log(`   Found ${mcpEnvVars.length} MCP_PROMPT variables:`);
    mcpEnvVars.forEach(({ key, value }) => {
      console.log(`   - ${key}: ${value}`);
    });
  } else {
    console.log('   ✗ No MCP_PROMPT environment variables found');
  }
  
  // 3. Generate export commands
  console.log('\n3. How to export custom templates for MCP server:');
  console.log('   Option A: Set environment variables in your shell:');
  
  try {
    const customTemplates = await fs.readdir(VIEWER_TEMPLATES_DIR);
    for (const templateName of customTemplates) {
      const templatePath = path.join(VIEWER_TEMPLATES_DIR, templateName, 'index.md');
      try {
        const content = await fs.readFile(templatePath, 'utf8');
        const envVarName = `${MCP_ENV_PREFIX}${templateName.replace(/([A-Z])/g, '_$1').toUpperCase()}`;
        console.log(`\n   export ${envVarName}="${content.substring(0, 50).replace(/"/g, '\\"')}..."`);
      } catch (err) {
        // Skip if can't read
      }
    }
  } catch (err) {
    console.log('   ✗ Unable to generate export commands');
  }
  
  console.log('\n   Option B: Use .env file in your project root');
  console.log('   Option C: Configure in MCP settings (Claude Desktop)');
  
  // 4. Check MCP server configuration
  console.log('\n4. Important notes:');
  console.log('   - MCP servers are started when Claude starts');
  console.log('   - Environment variables are read at MCP server startup');
  console.log('   - You need to restart Claude to pick up new env variables');
  console.log('   - Custom templates in ~/.shrimp-task-viewer-templates are NOT automatically used by MCP');
  console.log('   - You must explicitly set MCP_PROMPT_* environment variables');
  
  // 5. Generate a test configuration
  console.log('\n5. Test configuration for your modified analyzeTask template:');
  try {
    const analyzeTaskPath = path.join(VIEWER_TEMPLATES_DIR, 'analyzeTask', 'index.md');
    const content = await fs.readFile(analyzeTaskPath, 'utf8');
    
    // Create a test .env file
    const envContent = `# Shrimp Task Manager Custom Templates
# Add this to your .env file or export in your shell

MCP_PROMPT_ANALYZE_TASK="${content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"
`;
    
    const envPath = path.join(process.cwd(), 'test-template.env');
    await fs.writeFile(envPath, envContent);
    console.log(`   ✓ Created test-template.env with your custom analyzeTask template`);
    console.log('   To use: export $(cat test-template.env | xargs)');
  } catch (err) {
    console.log(`   ✗ Could not create test configuration: ${err.message}`);
  }
}

// Run the test
checkCustomTemplates().catch(console.error);