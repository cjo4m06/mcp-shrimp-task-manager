# Full Development Cycle Chain

## Description
A comprehensive chain that guides through the complete development lifecycle from initial planning to final verification.

## Chain Configuration
```json
{
  "id": "full-development-cycle",
  "name": {
    "en": "Full Development Cycle",
    "zh": "完整开发周期"
  },
  "description": {
    "en": "Complete development workflow from planning to deployment",
    "zh": "从规划到部署的完整开发工作流"
  }
}
```

## Chain Steps

### Step 1: Planning Phase
**Prompt ID:** `plan-task`
**Category:** `task-management`
**Step Name:** Planning Phase

**Input Mapping:**
- `requirements` → `description`
- `constraints` → `requirements`
- `context` → `project_context`

**Output Mapping:**
- `task_plan` → `implementation_plan`
- `priorities` → `task_priorities`

### Step 2: Analysis Phase
**Prompt ID:** `analyze-task`
**Category:** `task-management`
**Step Name:** Analysis Phase

**Input Mapping:**
- `implementation_plan` → `task_summary`
- `task_priorities` → `initial_concept`

**Output Mapping:**
- `technical_analysis` → `detailed_analysis`
- `risk_assessment` → `identified_risks`

### Step 3: Implementation Phase
**Prompt ID:** `execute-task`
**Category:** `task-management`
**Step Name:** Implementation Phase

**Input Mapping:**
- `detailed_analysis` → `task_guidance`
- `identified_risks` → `risk_mitigation`

**Output Mapping:**
- `implementation_result` → `completed_work`
- `lessons_learned` → `implementation_notes`

### Step 4: Verification Phase
**Prompt ID:** `verify-task`
**Category:** `task-management`
**Step Name:** Verification Phase

**Input Mapping:**
- `completed_work` → `task_output`
- `implementation_notes` → `verification_context`

**Output Mapping:**
- `verification_result` → `final_assessment`
- `quality_score` → `completion_score`

## Usage Example

```typescript
// Execute the full development cycle
const chainResult = await executeChain('full-development-cycle', {
  requirements: "Implement user authentication system",
  constraints: "Must use JWT tokens and support OAuth",
  context: "Node.js backend with Express framework"
});
```

## Error Handling
- Each step includes retry logic with exponential backoff
- Failed steps can be resumed from the last successful checkpoint
- Comprehensive logging for debugging and audit trails

## Customization
This chain can be customized by:
- Adding additional steps for specific workflows
- Modifying input/output mappings
- Adjusting retry and timeout configurations
- Including custom validation rules
