import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parseCompletionSummary } from '../../tools/task-viewer/src/utils/completionSummaryParser';

interface Task {
  id: string;
  name: string;
  status: string;
  summary?: string;
  completionDetails?: any;
  completedAt?: string;
  [key: string]: any;
}

interface TasksData {
  tasks: Task[];
}

/**
 * Migration script to add completionDetails to existing completed tasks
 * Parses existing summaries to extract structured completion data
 */
export async function migrateCompletionDetails(
  tasksFilePath?: string,
  options: { dryRun?: boolean; backup?: boolean } = {}
): Promise<{ processed: number; updated: number; errors: number }> {
  const { dryRun = false, backup = true } = options;
  
  // Default path to tasks.json
  const filePath = tasksFilePath || path.join(process.cwd(), 'shrimp_data_task_viewer', 'tasks.json');
  
  console.log(`🔄 Starting migration for: ${filePath}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`Tasks file not found: ${filePath}`);
  }
  
  // Read tasks file
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const tasksData: TasksData = JSON.parse(fileContent);
  
  // Create backup if requested and not in dry-run mode
  if (backup && !dryRun) {
    const backupPath = filePath.replace('.json', `.backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, fileContent);
    console.log(`✅ Backup created: ${backupPath}`);
  }
  
  let processed = 0;
  let updated = 0;
  let errors = 0;
  
  // Process each task
  for (const task of tasksData.tasks) {
    processed++;
    
    // Skip if not completed or already has completionDetails
    if (task.status !== 'completed') {
      console.log(`⏭️  Skipping ${task.id} - not completed`);
      continue;
    }
    
    if (task.completionDetails) {
      console.log(`⏭️  Skipping ${task.id} - already has completionDetails`);
      continue;
    }
    
    if (!task.summary) {
      console.log(`⏭️  Skipping ${task.id} - no summary to parse`);
      continue;
    }
    
    try {
      // Parse the summary
      console.log(`📝 Processing task: ${task.name}`);
      const completionDetails = parseCompletionSummary(task.summary);
      
      // Add completedAt if missing
      if (!task.completedAt) {
        completionDetails.completedAt = new Date().toISOString();
      } else {
        completionDetails.completedAt = task.completedAt;
      }
      
      // Add default verification score if not present
      if (!completionDetails.verificationScore) {
        completionDetails.verificationScore = 80; // Default score for completed tasks
      }
      
      // Update task with parsed details
      if (!dryRun) {
        task.completionDetails = completionDetails;
      }
      
      updated++;
      console.log(`✅ Updated task ${task.id} with structured completion details`);
      
      // Log parsed details in dry-run mode
      if (dryRun) {
        console.log('Parsed details:', JSON.stringify(completionDetails, null, 2));
      }
    } catch (error) {
      errors++;
      console.error(`❌ Error processing task ${task.id}:`, error);
    }
  }
  
  // Write updated data back to file (if not dry-run)
  if (!dryRun && updated > 0) {
    fs.writeFileSync(filePath, JSON.stringify(tasksData, null, 2));
    console.log(`💾 Saved updated tasks to: ${filePath}`);
  }
  
  // Log summary
  console.log('\n📊 Migration Summary:');
  console.log(`- Total tasks processed: ${processed}`);
  console.log(`- Tasks updated: ${updated}`);
  console.log(`- Errors: ${errors}`);
  
  return { processed, updated, errors };
}

// CLI execution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const noBackup = args.includes('--no-backup');
  const filePath = args.find(arg => !arg.startsWith('--'));
  
  migrateCompletionDetails(filePath, { dryRun, backup: !noBackup })
    .then(result => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

export default migrateCompletionDetails;