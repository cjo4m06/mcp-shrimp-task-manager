# 📁 Documentation Path Management Guidance

## 🎯 Core Principles

**Must use project-specific documentation path management mechanisms to ensure all documents are uniformly stored in the correct project directory.**

## 🔧 Correct Path Acquisition Methods

### ✅ Recommended Practices

1. **Use MCP Tools to Get Paths**:
   ```
   Call get_documentation_path tool to get the correct documentation storage path
   ```

2. **Supported Document Types and Directory Structure**:
   ```
   $DATA_DIR/projects/$PROJECT_NAME/docs/
   ├── project/          # Core project docs (README, architecture, roadmap)
   ├── prd/              # Product requirements and milestones
   ├── tasks/            # Task-related documentation
   │   ├── completed/    # Completed task summaries
   │   ├── in-progress/  # In-progress task analysis
   │   ├── pending/      # Pending task planning
   │   └── by-role/      # Role-based classification (frontend, backend, qa, devops, design)
   ├── analysis/         # Analysis reports (complexity, risk, performance, security)
   ├── reflection/       # Reflection summaries (sprint reviews, lessons learned, improvements)
   ├── research/         # Research documents (tech research, competitor analysis, best practices)
   ├── team/             # Team collaboration docs (knowledge base, collaboration patterns, roles)
   └── templates/        # Document templates
   ```

3. **Usage Examples**:
   ```
   # Get analysis report path
   get_documentation_path(subDir="analysis", filename="complexity-analysis.md")
   
   # Get task summary path
   get_documentation_path(subDir="tasks/completed", filename="task-123-summary.md")
   
   # Get team knowledge base path
   get_documentation_path(subDir="team/knowledge-base", filename="frontend-best-practices.md")
   ```

## ❌ Prohibited Practices

1. **Do NOT use process.cwd()**:
   - ❌ `process.cwd()` - Points to wrong directory in MCP environment
   - ❌ Hardcoded paths - Cannot adapt to different project environments
   - ❌ Relative path operations - May cause files to be stored in wrong locations

2. **Do NOT perform direct file operations**:
   - ❌ Direct use of `fs.writeFile()` without getting correct path
   - ❌ Assuming current working directory is the project directory

## 🎯 Document Classification Guidance

### Choose Directory by Document Type:

- **Project Docs** → `project/` (README, architecture design, technical specs)
- **Requirements** → `prd/` (product requirements, feature specs, milestones)
- **Task Docs** → `tasks/` (task analysis, execution summaries, role tasks)
- **Analysis Reports** → `analysis/` (complexity analysis, risk assessment, performance analysis)
- **Reflection Summaries** → `reflection/` (project reviews, lessons learned, improvement plans)
- **Research Docs** → `research/` (tech research, competitor analysis, solutions)
- **Team Docs** → `team/` (knowledge sharing, collaboration processes, best practices)

### Role-based Task Document Classification:

- **Frontend Development** → `tasks/by-role/frontend/`
- **Backend Development** → `tasks/by-role/backend/`
- **Quality Assurance** → `tasks/by-role/qa/`
- **DevOps Deployment** → `tasks/by-role/devops/`
- **UI/UX Design** → `tasks/by-role/design/`

## 💡 Best Practices

1. **File Naming Conventions**:
   - Use clear descriptive names
   - Include date or version info (e.g., `analysis-2025-01-07.md`)
   - Avoid special characters and spaces

2. **Content Organization**:
   - Each document should have a clear purpose and audience
   - Use standard Markdown format
   - Include necessary metadata (creation time, author, version, etc.)

3. **Version Management**:
   - Important documents should include version history
   - Regularly archive outdated documents
   - Maintain document timeliness and accuracy

## ⚠️ Important Reminders

- **Always call get_documentation_path tool first to get the correct path**
- **Choose appropriate subdirectory based on document type**
- **Ensure documents are stored in project-specific directories**
- **Follow unified file naming and organization standards**
