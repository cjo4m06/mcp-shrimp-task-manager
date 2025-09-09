// Agent matching utility for task assignment
export interface Agent {
  name: string;
  type?: string;
  capabilities?: string[];
}

export interface Task {
  title: string;
  description?: string;
}

/**
 * Detects the type of task based on keywords in title and description
 */
function detectTaskType(task: Task): string {
  const text = `${task.title} ${task.description || ''}`.toLowerCase();
  
  // Data/ML related keywords
  if (text.match(/\b(data|dataset|machine learning|ml|ai|artificial intelligence|analytics|visualization|chart|graph|pandas|numpy|sklearn|tensorflow|pytorch)\b/)) {
    return 'data';
  }
  
  // Frontend related keywords
  if (text.match(/\b(frontend|ui|ux|react|vue|angular|html|css|javascript|typescript|component|styling)\b/)) {
    return 'frontend';
  }
  
  // Backend related keywords
  if (text.match(/\b(backend|api|server|database|sql|rest|graphql|microservice|authentication|auth)\b/)) {
    return 'backend';
  }
  
  // DevOps related keywords
  if (text.match(/\b(devops|deployment|docker|kubernetes|ci\/cd|pipeline|infrastructure|monitoring)\b/)) {
    return 'devops';
  }
  
  return 'general';
}

/**
 * Matches an agent to a task based on capabilities, type, and name
 * Priority order: 1) Type matching, 2) Capabilities matching, 3) Name matching
 */
export function matchAgentToTask(agents: Agent[], task: Task): Agent | null {
  if (!agents || agents.length === 0 || !task) {
    return null;
  }
  
  const detectedTaskType = detectTaskType(task);
  const taskKeywords = `${task.title} ${task.description || ''}`.toLowerCase().split(/\s+/);
  
  let bestMatch: Agent | null = null;
  let bestScore = 0;
  let bestMatchType: 'type' | 'capabilities' | 'name' = 'name';
  
  for (const agent of agents) {
    let score = 0;
    let matchType: 'type' | 'capabilities' | 'name' = 'name';
    
    // 1. Check exact type match (highest priority)
    if (agent.type && agent.type.toLowerCase() === detectedTaskType.toLowerCase()) {
      score = 100; // Highest score for exact type match
      matchType = 'type';
    }
    // 2. Check capabilities matching (second priority)
    else if (agent.capabilities && agent.capabilities.length > 0) {
      let capabilityMatches = 0;
      for (const capability of agent.capabilities) {
        const capabilityLower = capability.toLowerCase();
        if (taskKeywords.some(keyword => 
          keyword.includes(capabilityLower) || capabilityLower.includes(keyword)
        )) {
          capabilityMatches++;
        }
      }
      if (capabilityMatches > 0) {
        score = 50 + (capabilityMatches * 10); // Base score + bonus for multiple matches
        matchType = 'capabilities';
      }
    }
    
    // 3. Fall back to name matching (lowest priority)
    if (score === 0) {
      const agentNameLower = agent.name.toLowerCase();
      const nameMatches = taskKeywords.filter(keyword => 
        agentNameLower.includes(keyword) || keyword.includes(agentNameLower)
      ).length;
      
      if (nameMatches > 0) {
        score = nameMatches * 5; // Lower base score for name matches
        matchType = 'name';
      }
    }
    
    // Update best match if this agent scores higher, or has higher priority match type
    if (score > bestScore || 
        (score === bestScore && getPriorityScore(matchType) > getPriorityScore(bestMatchType))) {
      bestMatch = agent;
      bestScore = score;
      bestMatchType = matchType;
    }
  }
  
  return bestMatch;
}

function getPriorityScore(matchType: 'type' | 'capabilities' | 'name'): number {
  switch (matchType) {
    case 'type': return 3;
    case 'capabilities': return 2;
    case 'name': return 1;
    default: return 0;
  }
}