/**
 * Task Numbering System Utilities
 * Generates and manages user-friendly task numbers for display
 */

/**
 * Generate task numbers based on creation date
 * Earlier tasks get lower numbers for consistency
 * @param {Array} tasks - Array of task objects
 * @returns {Object} Map of UUID to task number
 */
export function generateTaskNumbers(tasks) {
  if (!tasks || !Array.isArray(tasks)) {
    return {};
  }

  // Sort tasks by creation date (earliest first)
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateA - dateB;
  });

  // Create mapping of UUID to task number
  const taskNumberMap = {};
  sortedTasks.forEach((task, index) => {
    if (task.id) {
      taskNumberMap[task.id] = index + 1;
    }
  });

  return taskNumberMap;
}

/**
 * Get task number for a given UUID
 * @param {string} uuid - Task UUID
 * @param {Object} taskNumberMap - Map of UUID to task number
 * @returns {string} Task number or 'Unknown' if not found
 */
export function getTaskNumber(uuid, taskNumberMap) {
  if (!uuid || !taskNumberMap) {
    return 'Unknown';
  }
  return taskNumberMap[uuid] ? `#${taskNumberMap[uuid]}` : 'Unknown';
}

/**
 * Convert array of dependency UUIDs to task numbers
 * @param {Array} dependencies - Array of UUID strings
 * @param {Object} taskNumberMap - Map of UUID to task number
 * @returns {Array} Array of task number strings
 */
export function convertDependenciesToNumbers(dependencies, taskNumberMap) {
  if (!dependencies || !Array.isArray(dependencies)) {
    return [];
  }
  
  return dependencies.map(uuid => getTaskNumber(uuid, taskNumberMap));
}

/**
 * Get task by number
 * @param {number} taskNumber - The task number to look up
 * @param {Array} tasks - Array of task objects
 * @param {Object} taskNumberMap - Map of UUID to task number
 * @returns {Object|null} Task object or null if not found
 */
export function getTaskByNumber(taskNumber, tasks, taskNumberMap) {
  if (!taskNumber || !tasks || !taskNumberMap) {
    return null;
  }

  // Find UUID with this task number
  const uuid = Object.keys(taskNumberMap).find(
    key => taskNumberMap[key] === taskNumber
  );

  if (!uuid) {
    return null;
  }

  // Find and return the task
  return tasks.find(task => task.id === uuid) || null;
}

/**
 * Create a reverse mapping from task number to UUID
 * @param {Object} taskNumberMap - Map of UUID to task number
 * @returns {Object} Map of task number to UUID
 */
export function createReverseMapping(taskNumberMap) {
  const reverseMap = {};
  Object.entries(taskNumberMap).forEach(([uuid, number]) => {
    reverseMap[number] = uuid;
  });
  return reverseMap;
}

/**
 * Format task number for display
 * @param {number} number - Task number
 * @returns {string} Formatted task number
 */
export function formatTaskNumber(number) {
  if (!number || typeof number !== 'number') {
    return 'Unknown';
  }
  return `#${number}`;
}