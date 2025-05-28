// Task status enum: defines the current stage of a task in the workflow
export enum TaskStatus {
  PENDING = "PENDING", // Task has been created but not yet started
  IN_PROGRESS = "IN_PROGRESS", // Task is currently in progress
  COMPLETED = "COMPLETED", // Task has been successfully completed and verified
  BLOCKED = "BLOCKED", // Task is temporarily blocked due to dependencies
}

// Task dependency: defines prerequisite relationships between tasks
export interface TaskDependency {
  taskId: string; // Unique identifier of the prerequisite task, must be completed before the current task can be executed
}

// Related file type: defines the type of relationship between a file and a task
export enum RelatedFileType {
  TO_MODIFY = "TO_MODIFY", // File to be modified in the task
  REFERENCE = "REFERENCE", // Reference material or related document for the task
  CREATE = "CREATE", // File to be created in the task
  DEPENDENCY = "DEPENDENCY", // Component or library file that the task depends on
  OTHER = "OTHER", // Other types of related files
}

// Related file: defines information about files related to a task
export interface RelatedFile {
  path: string; // File path, can be relative to the project root directory or absolute path
  type: RelatedFileType; // Type of relationship between the file and the task
  description?: string; // Supplementary description of the file, explaining its specific relationship or use with the task
  lineStart?: number; // Start line of the related code block (optional)
  lineEnd?: number; // End line of the related code block (optional)
}

// Task interface: defines the complete data structure of a task
export interface Task {
  id: string; // Unique identifier of the task
  name: string; // Concise and clear task name
  description: string; // Detailed task description, including implementation points and acceptance criteria
  notes?: string; // Supplementary instructions, special handling requirements, or implementation suggestions (optional)
  status: TaskStatus; // Current execution status of the task
  dependencies: TaskDependency[]; // List of prerequisite dependencies for the task
  createdAt: Date; // Timestamp when the task was created
  updatedAt: Date; // Timestamp when the task was last updated
  completedAt?: Date; // Timestamp when the task was completed (only for completed tasks)
  summary?: string; // Task completion summary, briefly describing implementation results and important decisions (only for completed tasks)
  relatedFiles?: RelatedFile[]; // List of files related to the task (optional)

  // New field: save the complete technical analysis result
  analysisResult?: string; // Complete analysis result from analyze_task and reflect_task stages

  // New field: save the specific implementation guide
  implementationGuide?: string; // Specific implementation methods, steps, and suggestions

  // New field: save the verification criteria and inspection methods
  verificationCriteria?: string; // Clear verification criteria, test points, and acceptance conditions
}

// Task complexity level: defines the classification of task complexity
export enum TaskComplexityLevel {
  LOW = "LOW", // Simple and straightforward tasks, usually do not require special handling
  MEDIUM = "MEDIUM", // Tasks with some complexity but still manageable
  HIGH = "HIGH", // Complex and time-consuming tasks that require special attention
  VERY_HIGH = "VERY_HIGH", // Extremely complex tasks, recommended to be split
}

// Task complexity thresholds: defines reference standards for task complexity assessment
export const TaskComplexityThresholds = {
  DESCRIPTION_LENGTH: {
    MEDIUM: 500, // Above this number of characters is considered medium complexity
    HIGH: 1000, // Above this number of characters is considered high complexity
    VERY_HIGH: 2000, // Above this number of characters is considered very high complexity
  },
  DEPENDENCIES_COUNT: {
    MEDIUM: 2, // More than this number of dependencies is considered medium complexity
    HIGH: 5, // More than this number of dependencies is considered high complexity
    VERY_HIGH: 10, // More than this number of dependencies is considered very high complexity
  },
  NOTES_LENGTH: {
    MEDIUM: 200, // Above this number of characters is considered medium complexity
    HIGH: 500, // Above this number of characters is considered high complexity
    VERY_HIGH: 1000, // Above this number of characters is considered very high complexity
  },
};

// Task complexity assessment result: records detailed results of task complexity analysis
export interface TaskComplexityAssessment {
  level: TaskComplexityLevel; // Overall complexity level
  metrics: {
    // Detailed data for each assessment indicator
    descriptionLength: number; // Description length
    dependenciesCount: number; // Number of dependencies
    notesLength: number; // Notes length
    hasNotes: boolean; // Whether there are notes
  };
  recommendations: string[]; // List of handling suggestions
}
