/**
 * Text utilities for truncation and expansion logic
 * @fileoverview Provides reusable text processing functions for consistent text handling across components
 */

/**
 * Truncates text to a specified maximum length with optional word boundary respect
 * @param {string|null|undefined} text - The text to truncate
 * @param {number} [maxLength=100] - Maximum length of the truncated text (including ellipsis)
 * @param {boolean} [wordBoundary=true] - Whether to respect word boundaries when truncating
 * @param {string} [ellipsis='...'] - String to append when text is truncated
 * @returns {string} The truncated text with ellipsis if needed
 * 
 * @example
 * truncateText('This is a long text', 10) // 'This is...'
 * truncateText('This is a long text', 10, false) // 'This is a...'
 * truncateText('Short', 10) // 'Short'
 */
export function truncateText(text, maxLength = 100, wordBoundary = true, ellipsis = '...') {
  // Handle null, undefined, or non-string inputs
  if (text == null) {
    return '';
  }

  // Convert non-string inputs to string
  const stringText = String(text);

  // Handle edge cases for maxLength
  if (maxLength <= 0) {
    return '';
  }

  // If text is already short enough, return as-is
  if (stringText.length <= maxLength) {
    return stringText;
  }

  // If maxLength is smaller than ellipsis length, we need special handling
  if (maxLength <= ellipsis.length) {
    return ellipsis;
  }

  // Calculate available space for actual content
  const availableLength = maxLength - ellipsis.length;

  if (!wordBoundary) {
    // Simple character-based truncation
    return stringText.substring(0, availableLength) + ellipsis;
  }

  // Word boundary truncation
  // Look for word boundary within the available space
  const testSubstring = stringText.substring(0, availableLength);
  
  // Find the last space within the available length
  const lastSpaceIndex = testSubstring.lastIndexOf(' ');

  if (lastSpaceIndex === -1) {
    // No spaces found, fall back to character truncation
    return stringText.substring(0, availableLength) + ellipsis;
  }

  // Truncate at the last word boundary
  return stringText.substring(0, lastSpaceIndex) + ellipsis;
}

/**
 * Determines whether an expand/collapse UI should be shown for the given text
 * @param {string|null|undefined} text - The text to check
 * @param {number} [maxLength=100] - Maximum length before expansion is needed
 * @returns {boolean} True if text is longer than maxLength and expansion UI should be shown
 * 
 * @example
 * shouldShowExpansion('Short text', 100) // false
 * shouldShowExpansion('Very long text...', 10) // true
 */
export function shouldShowExpansion(text, maxLength = 100) {
  // Handle null, undefined, or non-string inputs
  if (text == null) {
    return false;
  }

  // Convert non-string inputs to string
  const stringText = String(text);

  return stringText.length > maxLength;
}

/**
 * Removes common Markdown formatting before truncating text
 * Handles headers, bold, italic, links, code blocks, lists, and blockquotes
 * @param {string|null|undefined} text - The Markdown text to process
 * @param {number} [maxLength=100] - Maximum length after Markdown removal
 * @param {boolean} [wordBoundary=true] - Whether to respect word boundaries
 * @param {string} [ellipsis='...'] - String to append when text is truncated
 * @returns {string} The processed and truncated text
 * 
 * @example
 * truncateMarkdown('**Bold** and *italic* text', 15) // 'Bold and italic...'
 * truncateMarkdown('# Header\nContent here', 10) // 'Header...'
 */
export function truncateMarkdown(text, maxLength = 100, wordBoundary = true, ellipsis = '...') {
  // Handle null, undefined, or non-string inputs
  if (text == null) {
    return '';
  }

  let cleanText = String(text);

  // Remove Markdown formatting patterns
  // Headers (# ## ###)
  cleanText = cleanText.replace(/^#{1,6}\s+/gm, '');
  
  // Bold (**text** or __text__)
  cleanText = cleanText.replace(/(\*\*|__)(.*?)\1/g, '$2');
  
  // Italic (*text* or _text_) - be careful not to match unmatched asterisks
  cleanText = cleanText.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // Links ([text](url))
  cleanText = cleanText.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  
  // Images (![alt](url))
  cleanText = cleanText.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1');
  
  // Code blocks (```language\ncode\n```)
  cleanText = cleanText.replace(/```[\s\S]*?```/g, '');
  
  // Inline code (`code`)
  cleanText = cleanText.replace(/`([^`]*)`/g, '$1');
  
  // Unordered lists (- item or * item)
  cleanText = cleanText.replace(/^[\s]*[-*]\s+/gm, '');
  
  // Ordered lists (1. item)
  cleanText = cleanText.replace(/^[\s]*\d+\.\s+/gm, '');
  
  // Blockquotes (> text)
  cleanText = cleanText.replace(/^>\s*/gm, '');
  
  // Clean up extra whitespace and newlines
  cleanText = cleanText.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

  // Now truncate the cleaned text
  return truncateText(cleanText, maxLength, wordBoundary, ellipsis);
}

/**
 * Creates a text preview suitable for table cells or cards
 * Combines Markdown stripping and truncation with consistent formatting
 * @param {string|null|undefined} text - The text to preview
 * @param {number} [maxLength=100] - Maximum length of the preview
 * @param {boolean} [stripMarkdown=true] - Whether to remove Markdown formatting
 * @returns {string} Formatted text preview
 * 
 * @example
 * createTextPreview('## Long title\nWith content...', 50) // 'Long title With content...'
 */
export function createTextPreview(text, maxLength = 100, stripMarkdown = true) {
  if (stripMarkdown) {
    return truncateMarkdown(text, maxLength, true);
  }
  return truncateText(text, maxLength, true);
}

/**
 * Calculates reading time estimate for text content
 * Assumes average reading speed of 200 words per minute
 * @param {string|null|undefined} text - The text to analyze
 * @param {number} [wordsPerMinute=200] - Average reading speed
 * @returns {number} Estimated reading time in minutes
 * 
 * @example
 * getReadingTime('Short text') // 1
 * getReadingTime('Very long article...') // 5
 */
export function getReadingTime(text, wordsPerMinute = 200) {
  if (text == null) {
    return 0;
  }

  const stringText = String(text);
  const wordCount = stringText.trim().split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // Minimum 1 minute
}

/**
 * Safely extracts the first sentence from text for use as a preview
 * Handles multiple sentence endings and edge cases
 * @param {string|null|undefined} text - The text to extract from
 * @param {number} [maxLength=100] - Maximum length of the first sentence
 * @returns {string} The first sentence or truncated text
 * 
 * @example
 * getFirstSentence('Hello world. How are you?') // 'Hello world.'
 * getFirstSentence('No punctuation here') // 'No punctuation here'
 */
export function getFirstSentence(text, maxLength = 100) {
  if (text == null) {
    return '';
  }

  const stringText = String(text).trim();
  
  // Find first sentence ending
  const sentenceEnd = stringText.search(/[.!?]/);
  
  if (sentenceEnd === -1) {
    // No sentence ending found, return truncated text
    return truncateText(stringText, maxLength, true);
  }

  const firstSentence = stringText.substring(0, sentenceEnd + 1);
  
  // If first sentence is too long, truncate it
  if (firstSentence.length > maxLength) {
    return truncateText(firstSentence, maxLength, true);
  }

  return firstSentence;
}

// Default export with all utilities
export default {
  truncateText,
  shouldShowExpansion,
  truncateMarkdown,
  createTextPreview,
  getReadingTime,
  getFirstSentence
};