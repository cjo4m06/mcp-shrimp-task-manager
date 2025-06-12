# Simple Analysis Chain

## Description
A simple two-step chain that demonstrates basic analysis and reflection workflow.

## Chain Configuration
```json
{
  "id": "simple-analysis-chain",
  "name": {
    "en": "Simple Analysis Chain",
    "zh": "简单分析链"
  },
  "description": {
    "en": "Basic analysis and reflection workflow",
    "zh": "基本的分析和反思工作流"
  },
  "enabled": true
}
```

## Chain Steps

### Step 1: Initial Analysis
**Prompt ID:** `analyze-task`
**Category:** `task-management`
**Step Name:** Initial Analysis

**Input Mapping:**
- `description` → `summary`
- `requirements` → `initial_concept`

**Output Mapping:**
- `analysis_result` → `detailed_analysis`
- `key_findings` → `findings`

### Step 2: Reflection and Optimization
**Prompt ID:** `reflect-task`
**Category:** `task-management`
**Step Name:** Reflection Phase

**Input Mapping:**
- `detailed_analysis` → `analysis`
- `findings` → `summary`

**Output Mapping:**
- `optimized_solution` → `final_solution`
- `recommendations` → `action_items`

## Usage Example

```typescript
// Execute the simple analysis chain
const result = await executeChain('simple-analysis-chain', {
  description: "Implement user authentication system",
  requirements: "Must be secure, scalable, and user-friendly"
});

console.log('Final solution:', result.data.final_solution);
console.log('Action items:', result.data.action_items);
```

## Notes

This is a minimal example to demonstrate:
- Basic step sequencing
- Parameter mapping between steps
- Simple input/output flow
- Error handling and validation

Perfect for testing and learning the chain execution system.
