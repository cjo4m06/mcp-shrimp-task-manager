import { Task } from '../types/index.js';
import { Agent } from './agentLoader.js';

interface KeywordMapping {
  keywords: string[];
  weight: number;
}

interface AgentKeywordMap {
  [agentType: string]: KeywordMapping;
}

// Define keyword mappings for common agent types
const AGENT_KEYWORD_MAPPINGS: AgentKeywordMap = {
  frontend: {
    keywords: [
      'frontend', 'front-end', 'ui', 'ux', 'user interface', 'react', 'vue', 
      'angular', 'svelte', 'css', 'html', 'javascript', 'typescript', 'jsx', 
      'tsx', 'component', 'styling', 'layout', 'responsive', 'design', 'dom',
      'browser', 'client-side', 'webpack', 'vite', 'sass', 'scss', 'tailwind',
      'material-ui', 'bootstrap', 'animation', 'accessibility', 'a11y'
    ],
    weight: 1.0
  },
  backend: {
    keywords: [
      'backend', 'back-end', 'server', 'api', 'rest', 'graphql', 'node', 
      'nodejs', 'express', 'fastify', 'koa', 'python', 'django', 'flask',
      'java', 'spring', 'ruby', 'rails', 'php', 'laravel', 'golang', 'go',
      'rust', 'microservice', 'authentication', 'authorization', 'jwt',
      'oauth', 'middleware', 'routing', 'controller', 'service', 'repository'
    ],
    weight: 1.0
  },
  database: {
    keywords: [
      'database', 'db', 'sql', 'nosql', 'mysql', 'postgresql', 'postgres',
      'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'sqlite',
      'oracle', 'mssql', 'schema', 'table', 'query', 'index', 'migration',
      'orm', 'sequelize', 'typeorm', 'mongoose', 'prisma', 'knex', 'join',
      'transaction', 'stored procedure', 'trigger', 'view', 'normalization'
    ],
    weight: 1.0
  },
  fullstack: {
    keywords: [
      'fullstack', 'full-stack', 'full stack', 'end-to-end', 'e2e',
      'mern', 'mean', 'lamp', 'integration', 'architecture', 'system design',
      'deployment', 'devops', 'docker', 'kubernetes', 'k8s', 'ci/cd',
      'pipeline', 'aws', 'azure', 'gcp', 'cloud', 'serverless', 'lambda'
    ],
    weight: 1.2 // Slightly higher weight for fullstack as it's more comprehensive
  },
  mobile: {
    keywords: [
      'mobile', 'ios', 'android', 'react native', 'flutter', 'swift',
      'kotlin', 'objective-c', 'java', 'xamarin', 'ionic', 'cordova',
      'native', 'hybrid', 'pwa', 'progressive web app', 'responsive',
      'touch', 'gesture', 'notification', 'offline', 'app store', 'play store'
    ],
    weight: 1.0
  },
  testing: {
    keywords: [
      'test', 'testing', 'qa', 'quality assurance', 'unit test', 'integration test',
      'e2e test', 'end-to-end test', 'jest', 'mocha', 'chai', 'cypress', 'selenium',
      'playwright', 'puppeteer', 'tdd', 'bdd', 'coverage', 'mock', 'stub', 'spy',
      'assertion', 'test suite', 'test case', 'regression', 'smoke test', 'load test'
    ],
    weight: 1.0
  },
  security: {
    keywords: [
      'security', 'secure', 'vulnerability', 'penetration', 'pentest', 'owasp',
      'xss', 'csrf', 'sql injection', 'authentication', 'authorization', 'encryption',
      'ssl', 'tls', 'https', 'certificate', 'token', 'session', 'cookie', 'cors',
      'firewall', 'waf', 'ids', 'ips', 'audit', 'compliance', 'gdpr', 'pci'
    ],
    weight: 1.1 // Slightly higher weight for security as it's critical
  },
  data: {
    keywords: [
      'data', 'analytics', 'analysis', 'ml', 'machine learning', 'ai', 'artificial intelligence',
      'deep learning', 'neural network', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas',
      'numpy', 'jupyter', 'notebook', 'visualization', 'chart', 'graph', 'd3', 'plotly',
      'tableau', 'powerbi', 'etl', 'pipeline', 'transformation', 'mining', 'science'
    ],
    weight: 1.0
  }
};

/**
 * Calculate the relevance score for a given text against a set of keywords
 */
function calculateKeywordScore(text: string, keywords: string[], weight: number, agentType?: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;
  let matchCount = 0;
  
  for (const keyword of keywords) {
    const lowerKeyword = keyword.toLowerCase();
    // Check for whole word matches (with word boundaries)
    // Escape special regex characters in the keyword
    const escapedKeyword = lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
    const matches = lowerText.match(regex);
    
    if (matches) {
      matchCount += matches.length;
      // Give higher score for exact matches vs partial matches
      let keywordScore = matches.length * weight;
      
      // Special bonus for primary keywords that strongly indicate the agent type
      if (agentType === 'testing') {
        // Check for testing-specific keywords and phrases
        if (['test', 'testing', 'unit test', 'unit tests', 'jest', 'mocha', 'qa', 'test suite'].includes(lowerKeyword)) {
          keywordScore *= 3; // Triple score for primary testing keywords
        }
        // Additional boost if the text contains "write" or "create" with "test"
        if (lowerText.includes('write') || lowerText.includes('create')) {
          keywordScore *= 1.5;
        }
      } else if (agentType === 'fullstack' && ['fullstack', 'full-stack', 'full stack'].includes(lowerKeyword)) {
        keywordScore *= 2; // Double score for primary fullstack keywords
      }
      
      score += keywordScore;
    }
  }
  
  // Bonus for multiple different keywords matched
  const uniqueMatchedKeywords = keywords.filter(keyword => {
    const escapedKeyword = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escapedKeyword}\\b`, 'i').test(lowerText);
  }).length;
  
  if (uniqueMatchedKeywords > 1) {
    score += (uniqueMatchedKeywords - 1) * 0.5 * weight;
  }
  
  return score;
}

/**
 * Find the best matching agent type based on task content
 */
function findBestAgentType(task: Task): { type: string; score: number } | undefined {
  const combinedText = `${task.name} ${task.description || ''} ${task.notes || ''} ${task.implementationGuide || ''}`;
  
  if (!combinedText.trim()) {
    return undefined;
  }
  
  const scores: Array<{ type: string; score: number }> = [];
  
  for (const [agentType, mapping] of Object.entries(AGENT_KEYWORD_MAPPINGS)) {
    const score = calculateKeywordScore(combinedText, mapping.keywords, mapping.weight, agentType);
    if (score > 0) {
      scores.push({ type: agentType, score });
    }
  }
  
  if (scores.length === 0) {
    return undefined;
  }
  
  // Sort by score descending and return the best match
  scores.sort((a, b) => b.score - a.score);
  
  // Only return if the score is significant enough (threshold)
  const bestMatch = scores[0];
  if (bestMatch.score >= 1.0) {
    return bestMatch;
  }
  
  return undefined;
}

/**
 * Match a task to the most suitable agent from available agents
 */
export function matchAgentToTask(task: Task, availableAgents: Agent[]): string | undefined {
  // Handle edge cases
  if (!task || !availableAgents || availableAgents.length === 0) {
    return undefined;
  }
  
  // Find the best agent type for this task
  const bestAgentType = findBestAgentType(task);
  
  if (!bestAgentType) {
    return undefined;
  }
  
  // First priority: Try to find an agent with exact type match
  let matchedAgent = availableAgents.find(agent => 
    agent.type && agent.type.toLowerCase() === bestAgentType.type.toLowerCase()
  );
  
  if (matchedAgent) {
    return matchedAgent.name;
  }
  
  // Second priority: Check capabilities if available
  const taskText = `${task.name} ${task.description || ''} ${task.implementationGuide || ''}`.toLowerCase();
  let bestCapabilityMatch: { agent: Agent; score: number } | null = null;
  
  for (const agent of availableAgents) {
    if (agent.capabilities && agent.capabilities.length > 0) {
      let capabilityScore = 0;
      for (const capability of agent.capabilities) {
        if (taskText.includes(capability.toLowerCase())) {
          capabilityScore += 2;
        }
      }
      if (capabilityScore > 0 && (!bestCapabilityMatch || capabilityScore > bestCapabilityMatch.score)) {
        bestCapabilityMatch = { agent, score: capabilityScore };
      }
    }
  }
  
  if (bestCapabilityMatch) {
    return bestCapabilityMatch.agent.name;
  }
  
  // Third priority: Look for agents with the type keyword in their name
  matchedAgent = availableAgents.find(agent => 
    agent.name.toLowerCase().includes(bestAgentType.type.toLowerCase())
  );
  
  if (matchedAgent) {
    return matchedAgent.name;
  }
  
  // If no exact type match, look for agents with matching keywords in their name
  const typeKeywords = AGENT_KEYWORD_MAPPINGS[bestAgentType.type]?.keywords || [];
  
  // Score all agents based on keyword matches in their names
  const agentScores = availableAgents.map(agent => {
    const agentNameLower = agent.name.toLowerCase();
    let agentScore = 0;
    
    // Check each keyword against agent name
    for (const keyword of typeKeywords) {
      const escapedKeyword = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      if (regex.test(agentNameLower)) {
        agentScore += 2; // Higher weight for name matches
      }
    }
    
    return { agent, score: agentScore };
  }).filter(item => item.score > 0);
  
  // Sort by score and return the best match
  if (agentScores.length > 0) {
    agentScores.sort((a, b) => b.score - a.score);
    return agentScores[0].agent.name;
  }
  
  // Check description if no name matches
  for (const agent of availableAgents) {
    
    // Check description if available
    if (agent.description) {
      const descriptionLower = agent.description.toLowerCase();
      for (const keyword of typeKeywords) {
        const escapedKeyword = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
        if (regex.test(descriptionLower)) {
          return agent.name;
        }
      }
    }
  }
  
  // If still no match but we have a general-purpose agent, use it
  const generalAgent = availableAgents.find(agent => 
    agent.name.toLowerCase().includes('general')
  );
  
  if (generalAgent && bestAgentType.score >= 2.0) {
    // Only use general agent if the task has a strong match to some domain
    return generalAgent.name;
  }
  
  return undefined;
}

/**
 * Get suggested agent type for a task (for UI display)
 */
export function getSuggestedAgentType(task: Task): string | undefined {
  const bestMatch = findBestAgentType(task);
  return bestMatch?.type;
}

/**
 * Get keyword match details for debugging/UI
 */
export function getKeywordMatchDetails(task: Task): Array<{ type: string; score: number; matchedKeywords: string[] }> {
  const combinedText = `${task.name} ${task.description || ''} ${task.notes || ''} ${task.implementationGuide || ''}`.toLowerCase();
  const results = [];
  
  for (const [agentType, mapping] of Object.entries(AGENT_KEYWORD_MAPPINGS)) {
    const matchedKeywords = mapping.keywords.filter(keyword => {
      const escapedKeyword = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`\\b${escapedKeyword}\\b`, 'i').test(combinedText);
    });
    
    if (matchedKeywords.length > 0) {
      const score = calculateKeywordScore(combinedText, mapping.keywords, mapping.weight, agentType);
      results.push({
        type: agentType,
        score,
        matchedKeywords
      });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}