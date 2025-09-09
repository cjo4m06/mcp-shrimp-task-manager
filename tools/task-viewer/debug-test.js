import { truncateText, truncateMarkdown } from './src/utils/textUtils.js';

const originalText = 'Use `console.log()` for debugging purposes';
console.log('Original:', originalText);
console.log('Original length:', originalText.length);

// Simulate the cleaning process
let cleanText = originalText.replace(/`([^`]*)`/g, '$1');
console.log('After cleaning:', cleanText);
console.log('After cleaning length:', cleanText.length);

const result = truncateMarkdown(originalText, 20);
console.log('Final result:', result);
console.log('Final length:', result.length);

// The cleaned text should be "Use console.log() for debugging purposes" (40 chars)
// Truncated to 20 should be "Use console.log()..."