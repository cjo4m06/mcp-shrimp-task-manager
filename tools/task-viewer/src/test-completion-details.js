// Test file to verify CompletionDetailsView integration
// This can be used to test the component with sample data

const sampleTaskWithCompletionDetails = {
  id: "test-123",
  name: "Sample Task with Completion Details",
  description: "This is a test task to verify the CompletionDetailsView integration",
  status: "completed",
  summary: "Successfully completed the sample task with all requirements met.",
  completionDetails: {
    keyAccomplishments: [
      "✅ Implemented the main feature with full functionality",
      "📊 Achieved 95% test coverage across all components",
      "🚀 Optimized performance with React.memo and useMemo hooks"
    ],
    implementationDetails: [
      "Created a new React component using functional components and hooks",
      "Applied consistent dark theme styling with #b8c5d6 text color",
      "Used MDEditor.Markdown for rich text rendering",
      "Added smooth CSS animations for expand/collapse transitions"
    ],
    technicalChallenges: [
      "Resolved memoization issues by implementing custom comparison function",
      "Fixed rendering performance problems with large markdown content",
      "Handled edge cases for null and undefined data gracefully"
    ],
    verificationScore: 95,
    completedAt: new Date()
  },
  createdAt: new Date(Date.now() - 3600000),
  completedAt: new Date()
};

const sampleTaskWithoutCompletionDetails = {
  id: "test-456",
  name: "Legacy Task without Completion Details",
  description: "This is an older task that only has a summary",
  status: "completed",
  summary: "This task was completed before the CompletionDetails feature was added. It should display normally with just the summary section.",
  createdAt: new Date(Date.now() - 7200000),
  completedAt: new Date(Date.now() - 3600000)
};

const sampleTaskInProgress = {
  id: "test-789",
  name: "Task In Progress",
  description: "This task is currently in progress and has no completion details yet",
  status: "in_progress",
  createdAt: new Date(Date.now() - 1800000)
};

// Export for testing
export const testTasks = [
  sampleTaskWithCompletionDetails,
  sampleTaskWithoutCompletionDetails,
  sampleTaskInProgress
];

console.log("Test data created. You can import { testTasks } to test the CompletionDetailsView integration.");
console.log("Task 1: Has both summary and completionDetails");
console.log("Task 2: Has only summary (legacy task)");
console.log("Task 3: In progress (no completion data)");