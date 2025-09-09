import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// Agent interface
export interface Agent {
  name: string;
  description?: string;
  path?: string;
  content?: string;
  type?: string;
  capabilities?: string[];
}

/**
 * Load global agents from the Claude folder agents directory
 * @returns Array of available global agents
 */
export async function loadGlobalAgents(): Promise<Agent[]> {
  try {
    // Try to load global settings to get Claude folder path
    const globalSettingsPath = path.join(PROJECT_ROOT, "tools", "task-viewer", "data", "global-settings.json");
    
    let claudeFolderPath = "";
    try {
      const settingsContent = await fs.readFile(globalSettingsPath, "utf-8");
      const settings = JSON.parse(settingsContent);
      claudeFolderPath = settings.claudeFolderPath || "";
    } catch (error) {
      // Global settings file doesn't exist or can't be read
      return [];
    }

    if (!claudeFolderPath) {
      return [];
    }

    const agentsDir = path.join(claudeFolderPath, "agents");
    
    try {
      const files = await fs.readdir(agentsDir);
      const agentFiles = files.filter(file => 
        file.endsWith(".md") || file.endsWith(".yaml") || file.endsWith(".yml")
      );

      const agents: Agent[] = await Promise.all(agentFiles.map(async (filename) => {
        try {
          const filePath = path.join(agentsDir, filename);
          const content = await fs.readFile(filePath, "utf-8");
          
          // Extract agent name from filename (remove extension)
          const name = filename.replace(/\.(md|yaml|yml)$/, "");
          
          // Try to extract description from content (first line or title)
          let description = "";
          const lines = content.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
              description = trimmed.substring(0, 100);
              break;
            } else if (trimmed.startsWith("# ")) {
              description = trimmed.substring(2).trim();
              break;
            }
          }

          return {
            name,
            description,
            path: filePath,
            content
          };
        } catch (err) {
          // Error reading individual agent file
          return {
            name: filename.replace(/\.(md|yaml|yml)$/, ""),
            description: "Error loading agent"
          };
        }
      }));

      return agents;
    } catch (err) {
      // Agents directory doesn't exist
      return [];
    }
  } catch (error) {
    // Error in the process
    return [];
  }
}

/**
 * Load project-specific agents from .claude/agents directory
 * @param projectRoot Root directory of the project
 * @returns Array of available project agents
 */
export async function loadProjectAgents(projectRoot: string): Promise<Agent[]> {
  try {
    const agentsDir = path.join(projectRoot, ".claude", "agents");
    
    try {
      const files = await fs.readdir(agentsDir);
      const agentFiles = files.filter(file => 
        file.endsWith(".md") || file.endsWith(".yaml") || file.endsWith(".yml")
      );

      const agents: Agent[] = await Promise.all(agentFiles.map(async (filename) => {
        try {
          const filePath = path.join(agentsDir, filename);
          const content = await fs.readFile(filePath, "utf-8");
          
          // Extract agent name from filename (remove extension)
          const name = filename.replace(/\.(md|yaml|yml)$/, "");
          
          // Try to extract description from content
          let description = "";
          const lines = content.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
              description = trimmed.substring(0, 100);
              break;
            } else if (trimmed.startsWith("# ")) {
              description = trimmed.substring(2).trim();
              break;
            }
          }

          return {
            name,
            description,
            path: filePath,
            content
          };
        } catch (err) {
          // Error reading individual agent file
          return {
            name: filename.replace(/\.(md|yaml|yml)$/, ""),
            description: "Error loading agent"
          };
        }
      }));

      return agents;
    } catch (err) {
      // Agents directory doesn't exist
      return [];
    }
  } catch (error) {
    // Error in the process
    return [];
  }
}

/**
 * Get all available agents (both global and project-specific)
 * @param projectRoot Optional project root for loading project agents
 * @returns Combined array of all available agents
 */
export async function getAllAvailableAgents(projectRoot?: string): Promise<Agent[]> {
  const globalAgents = await loadGlobalAgents();
  const projectAgents = projectRoot ? await loadProjectAgents(projectRoot) : [];
  
  // Combine agents and remove duplicates (project agents override global ones)
  const agentMap = new Map<string, Agent>();
  
  // Add global agents first
  globalAgents.forEach(agent => {
    agentMap.set(agent.name, agent);
  });
  
  // Add project agents (will override global ones with same name)
  projectAgents.forEach(agent => {
    agentMap.set(agent.name, agent);
  });
  
  return Array.from(agentMap.values());
}

/**
 * Get an agent by name
 * @param agentName Name of the agent to retrieve
 * @param projectRoot Optional project root for loading project agents
 * @returns Agent object or undefined if not found
 */
export async function getAgentByName(agentName: string, projectRoot?: string): Promise<Agent | undefined> {
  const agents = await getAllAvailableAgents(projectRoot);
  return agents.find(agent => agent.name === agentName);
}