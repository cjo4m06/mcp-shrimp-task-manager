/**
 * Parses a free-form Markdown summary into structured TaskCompletionDetails
 * Extracts sections like Key Accomplishments, Implementation Details, and Technical Challenges
 * @param summary - The Markdown formatted summary text
 * @returns Structured TaskCompletionDetails object
 */
export function parseCompletionSummary(summary) {
  // Default structure with empty arrays
  const result = {
    keyAccomplishments: [],
    implementationDetails: [],
    technicalChallenges: [],
    completedAt: new Date(),
    verificationScore: 0
  };

  if (!summary || typeof summary !== 'string') {
    return result;
  }

  // Extract sections using regex patterns
  result.keyAccomplishments = extractSection(summary, 
    /##?\s*(Key\s*Accomplishments?|Accomplishments?|Achievements?|Key\s*Achievements?)/i
  );
  
  result.implementationDetails = extractSection(summary,
    /##?\s*(Implementation\s*Details?|Implementation|Technical\s*Implementation|Implementation\s*Notes?)/i
  );
  
  result.technicalChallenges = extractSection(summary,
    /##?\s*(Technical\s*Challenges?|Challenges?|Issues?\s*Resolved|Problems?\s*Solved)/i
  );

  // Try to extract verification score if present
  result.verificationScore = extractVerificationScore(summary);

  // Try to extract completion date if present
  const extractedDate = extractCompletionDate(summary);
  if (extractedDate) {
    result.completedAt = extractedDate;
  }

  return result;
}

/**
 * Extracts content from a specific section in the Markdown text
 * @param text - The full text to search
 * @param sectionPattern - Regex pattern to match the section header
 * @returns Array of extracted items
 */
function extractSection(text, sectionPattern) {
  const items = [];
  
  // Find the section start
  const sectionMatch = text.match(sectionPattern);
  if (!sectionMatch) {
    return items;
  }

  const sectionStart = sectionMatch.index + sectionMatch[0].length;
  
  // Find the next section or end of text
  const nextSectionPattern = /\n##?\s/;
  const remainingText = text.slice(sectionStart);
  const nextSectionMatch = remainingText.match(nextSectionPattern);
  const sectionEnd = nextSectionMatch ? sectionStart + nextSectionMatch.index : text.length;
  
  const sectionContent = text.slice(sectionStart, sectionEnd);

  // Extract bullet points and numbered lists
  const bulletPoints = extractBulletPoints(sectionContent);
  const numberedItems = extractNumberedList(sectionContent);
  
  // Combine and deduplicate
  const allItems = [...bulletPoints, ...numberedItems];
  const uniqueItems = Array.from(new Set(allItems.map(item => item.trim())))
    .filter(item => item.length > 0);

  return uniqueItems;
}

/**
 * Extracts bullet points from text
 * Supports -, *, and + as bullet markers
 */
function extractBulletPoints(text) {
  const items = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Match various bullet point styles
    const bulletMatch = line.match(/^\s*[-*+]\s+(.+)$/);
    if (bulletMatch) {
      const content = cleanListItem(bulletMatch[1]);
      if (content) {
        items.push(content);
      }
    }
  }
  
  return items;
}

/**
 * Extracts numbered list items from text
 * Supports 1., 1), and plain numbers
 */
function extractNumberedList(text) {
  const items = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Match various numbered list styles
    const numberMatch = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (numberMatch) {
      const content = cleanListItem(numberMatch[1]);
      if (content) {
        items.push(content);
      }
    }
  }
  
  return items;
}

/**
 * Cleans and normalizes a list item
 * Removes markdown formatting and extra whitespace
 */
function cleanListItem(item) {
  // Remove inline code blocks
  let cleaned = item.replace(/`([^`]+)`/g, '$1');
  
  // Remove bold/italic markers
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  
  // Remove links but keep the text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  
  // Remove extra whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
}

/**
 * Attempts to extract a verification score from the summary
 */
function extractVerificationScore(text) {
  // Look for patterns like "Score: 95", "Verification: 100%", "Score: 95/100"
  const scorePatterns = [
    /\b(?:verification\s*)?score\s*[:=]\s*(\d+)(?:\/100)?%?\b/i,
    /\b(?:completed\s*with\s*)?(\d+)(?:\/100)?\s*(?:points?)\b/i,
    /\bverified?\s*(?:at|with)?\s*(\d+)%?\b/i
  ];

  for (const pattern of scorePatterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseInt(match[1], 10);
      // Normalize to 0-100 range
      if (score <= 100) {
        return score;
      }
    }
  }

  return 0;
}

/**
 * Attempts to extract a completion date from the summary
 */
function extractCompletionDate(text) {
  // Try to parse ISO dates first (most specific)
  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)\b/);
  if (isoMatch) {
    const date = new Date(isoMatch[1]);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Look for patterns like "Completed: 2024-01-15", "Date: Jan 15, 2024"
  const datePatterns = [
    /\b(?:completed?|finished?|done)\s*(?:on|at|:)?\s*(\d{4}-\d{2}-\d{2})/i,
    /\b(?:date|timestamp)\s*[:=]\s*(\d{4}-\d{2}-\d{2})/i,
    /\b(\d{4}-\d{2}-\d{2})\s*(?:completion|completed)/i
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const date = new Date(match[1]);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

/**
 * Parses a summary with multiple sections and formats
 * This is a more flexible version that can handle various AI response formats
 */
export function parseFlexibleSummary(summary) {
  const result = parseCompletionSummary(summary);
  
  // If standard parsing didn't find much, try alternative patterns
  if (result.keyAccomplishments.length === 0) {
    // Try to find any section about what was done/completed/achieved
    const alternativePatterns = [
      /##?\s*(What\s*was\s*(?:done|completed|achieved))/i,
      /##?\s*(Summary|Overview|Results?)/i,
      /##?\s*(Completed\s*(?:tasks?|items?|work))/i
    ];
    
    for (const pattern of alternativePatterns) {
      const items = extractSection(summary, pattern);
      if (items.length > 0) {
        result.keyAccomplishments = items;
        break;
      }
    }
  }
  
  if (result.implementationDetails.length === 0) {
    // Try to find any section about how it was done
    const alternativePatterns = [
      /##?\s*(How\s*it\s*was\s*(?:done|implemented|built))/i,
      /##?\s*(Technical\s*(?:details?|notes?))/i,
      /##?\s*(Method(?:ology)?|Approach)/i
    ];
    
    for (const pattern of alternativePatterns) {
      const items = extractSection(summary, pattern);
      if (items.length > 0) {
        result.implementationDetails = items;
        break;
      }
    }
  }
  
  // If still no content found, try to extract any lists from the entire text
  if (result.keyAccomplishments.length === 0 && 
      result.implementationDetails.length === 0 && 
      result.technicalChallenges.length === 0) {
    
    const allBullets = extractBulletPoints(summary);
    const allNumbers = extractNumberedList(summary);
    const allItems = [...allBullets, ...allNumbers];
    
    if (allItems.length > 0) {
      // Distribute items based on keywords
      for (const item of allItems) {
        const itemLower = item.toLowerCase();
        
        if (itemLower.includes('challenge') || 
            itemLower.includes('issue') || 
            itemLower.includes('problem') ||
            itemLower.includes('difficult')) {
          result.technicalChallenges.push(item);
        } else if (itemLower.includes('implement') || 
                   itemLower.includes('code') || 
                   itemLower.includes('technical') ||
                   itemLower.includes('api') ||
                   itemLower.includes('database')) {
          result.implementationDetails.push(item);
        } else {
          result.keyAccomplishments.push(item);
        }
      }
    }
  }
  
  return result;
}