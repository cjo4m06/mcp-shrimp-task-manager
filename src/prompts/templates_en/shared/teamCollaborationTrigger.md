# 👥 Team Collaboration Automation Trigger

**When team collaboration needs are detected, automatically execute the following PM workflow:**

## 🎯 PM Workflow Auto-Start

### Phase 1: Task Analysis Phase
**Trigger Conditions**: User mentions "team", "collaboration", "assignment", "PM", "project management" etc.

**Mandatory Tool Calls**:
1. **`analyze_team_collaboration`** - Analyze current team collaboration status
   - Evaluate team performance and collaboration effectiveness
   - Identify knowledge gaps and improvement opportunities
   - Analyze role contributions

2. **`query_task_memory`** - Query related team collaboration experience
   - Search collaboration patterns from similar projects
   - Get best practices and lessons learned
   - Identify potential risks and solutions

### Phase 2: Role Assignment Phase
**Automatically identify required roles based on task type**:

**Mandatory Tool Calls**:
1. **`generate_team_collaboration_tasks`** - Generate role-specific tasks
   - Generate team tasks based on PRD content
   - Automatically assign to appropriate roles
   - Establish task dependencies

2. **`share_team_knowledge`** - Share related team knowledge
   - Record collaboration patterns and experience
   - Share knowledge transfer between roles
   - Establish team learning records

### Phase 3: Collaboration Launch Phase
**Start team collaboration process**:

**Mandatory Tool Calls**:
1. **`insert_task_dynamically`** - Insert collaboration tasks
   - Dynamically insert cross-role collaboration tasks
   - Adjust task priorities and dependencies
   - Ensure smooth collaboration process

2. **`adjust_tasks_from_context`** - Optimize task arrangements
   - Adjust tasks based on team context
   - Optimize resource allocation and scheduling
   - Generate collaboration suggestions and risk warnings

## 🧠 Smart Role Recognition Rules

### Frontend-Related Needs
**Keywords**: "interface", "UI", "frontend", "page", "interaction", "user experience"
**Auto-Assigned Roles**:
- `frontend-developer` (Frontend Developer) - Priority 1
- `ui-designer` (UI Designer) - Priority 2  
- `ux-designer` (UX Designer) - Priority 2

### Backend-Related Needs
**Keywords**: "API", "database", "server", "backend", "interface", "business logic"
**Auto-Assigned Roles**:
- `backend-developer` (Backend Developer) - Priority 1
- `devops-engineer` (DevOps Engineer) - Priority 3
- `data-engineer` (Data Engineer) - Priority 4

### Testing-Related Needs
**Keywords**: "testing", "quality", "QA", "verification", "bugs"
**Auto-Assigned Roles**:
- `qa-engineer` (QA Engineer) - Priority 1
- `frontend-developer` (Frontend Developer) - Priority 3
- `backend-developer` (Backend Developer) - Priority 3

### Architecture Design Needs
**Keywords**: "architecture", "design", "technology selection", "system design"
**Auto-Assigned Roles**:
- `tech-lead` (Tech Lead) - Priority 1
- `backend-developer` (Backend Developer) - Priority 2
- `devops-engineer` (DevOps Engineer) - Priority 3

### Mobile Needs
**Keywords**: "mobile", "APP", "iOS", "Android", "mobile app"
**Auto-Assigned Roles**:
- `mobile-developer` (Mobile Developer) - Priority 1
- `ui-designer` (UI Designer) - Priority 2
- `ux-designer` (UX Designer) - Priority 2

### Full-Stack Needs
**Keywords**: "full-stack", "end-to-end", "complete feature", "integrated"
**Auto-Assigned Roles**:
- `fullstack-developer` (Full-Stack Developer) - Priority 1
- `devops-engineer` (DevOps Engineer) - Priority 3

## 🎯 Differentiated Design Advantages

### Core Differences from claude-task-master:

1. **Unified Data Path**: `$DATA_DIR/projects/$PROJECT_NAME/`
   - All team collaboration data stored uniformly
   - Complete isolation at project level
   - Persistent context information storage

2. **Smart Role Assignment**:
   - Automatically identify role needs based on keywords
   - Consider collaboration relationships between roles
   - Dynamically adjust role priorities

3. **PM-Level Automation**:
   - Three-phase automated workflow
   - Smart tool chain calls
   - Real-time collaboration status tracking

4. **Team Memory System**:
   - Project-level team knowledge management
   - Collaboration pattern learning and optimization
   - Experience inheritance and knowledge sharing

**This ensures more professional team collaboration management and more efficient project execution!**
