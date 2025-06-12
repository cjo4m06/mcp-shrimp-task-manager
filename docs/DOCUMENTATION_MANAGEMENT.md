# 📁 Documentation Path Management Guide

[English](DOCUMENTATION_MANAGEMENT.md) | [中文](zh/DOCUMENTATION_MANAGEMENT.md)

## Overview

Shrimp Task Manager provides a sophisticated documentation management system inspired by [claude-task-master](https://github.com/eyaltoledano/claude-task-master)'s `.taskmaster/` directory structure. This system automatically organizes AI-generated documents into a structured hierarchy, ensuring project-specific isolation and team collaboration efficiency.

## 🎯 Key Features

- **Automatic Organization**: Documents are categorized by type and purpose
- **Project Isolation**: Each project maintains its own document structure
- **Team Collaboration**: Structured paths for knowledge sharing
- **Security**: Path validation prevents traversal attacks
- **Cross-platform**: Works on Windows, macOS, and Linux

## 📁 Directory Structure

```
$DATA_DIR/projects/$PROJECT_NAME/docs/
├── project/                  # Core project documentation
│   ├── README.md            # Project introduction
│   ├── ARCHITECTURE.md      # Technical architecture
│   ├── ROADMAP.md           # Project roadmap
│   └── CHANGELOG.md         # Change log
├── prd/                      # Product Requirements Documents
│   ├── main-prd.md          # Main PRD
│   ├── milestone-1.md       # Milestone PRDs
│   ├── milestone-2.md
│   └── features/            # Feature-specific PRDs
│       ├── feature-a.md
│       └── feature-b.md
├── tasks/                    # Task-related documentation
│   ├── completed/           # Completed task summaries
│   ├── in-progress/         # In-progress task analysis
│   ├── pending/             # Pending task planning
│   └── by-role/             # Role-based task classification
│       ├── frontend/        # Frontend development tasks
│       ├── backend/         # Backend development tasks
│       ├── qa/              # Quality assurance tasks
│       ├── devops/          # DevOps tasks
│       └── design/          # Design tasks
├── analysis/                 # Analysis reports
│   ├── complexity/          # Complexity analysis
│   ├── risk/                # Risk assessment
│   ├── performance/         # Performance analysis
│   └── security/            # Security analysis
├── reflection/               # Reflection and retrospectives
│   ├── sprint-reviews/      # Sprint reviews
│   ├── lessons-learned/     # Lessons learned
│   └── improvements/        # Improvement suggestions
├── research/                 # Research documentation
│   ├── technology/          # Technology research
│   ├── competitors/         # Competitor analysis
│   └── best-practices/      # Best practices
├── team/                     # Team collaboration
│   ├── knowledge-base/      # Team knowledge base
│   ├── collaboration/       # Collaboration patterns
│   ├── roles/               # Role definitions
│   └── workflows/           # Workflow documentation
└── templates/                # Document templates
    ├── prd-template.md      # PRD template
    ├── task-template.md     # Task template
    ├── analysis-template.md # Analysis template
    └── review-template.md   # Review template
```

## 🔧 Usage

### Automatic Path Management

The system automatically uses correct paths when creating documents. AI assistants are guided to use the `get_documentation_path` tool to obtain proper storage paths.

### Manual Path Requests

You can explicitly request document paths using the MCP tool:

```
# Get analysis report path
get_documentation_path(subDir="analysis", filename="complexity-analysis.md")

# Get task summary path  
get_documentation_path(subDir="tasks/completed", filename="task-123-summary.md")

# Get team knowledge base path
get_documentation_path(subDir="team/knowledge-base", filename="frontend-best-practices.md")

# Get directory path only
get_documentation_path(subDir="research/technology")
```

### Document Classification Guidelines

#### By Document Type:
- **Project Documentation** → `project/` (README, architecture, technical specs)
- **Requirements** → `prd/` (product requirements, feature specs, milestones)
- **Task Documentation** → `tasks/` (task analysis, execution summaries, role tasks)
- **Analysis Reports** → `analysis/` (complexity, risk, performance, security)
- **Reflection Summaries** → `reflection/` (project reviews, lessons learned, improvements)
- **Research Documents** → `research/` (tech research, competitor analysis, solutions)
- **Team Documentation** → `team/` (knowledge sharing, collaboration processes, best practices)

#### By Role:
- **Frontend Development** → `tasks/by-role/frontend/`
- **Backend Development** → `tasks/by-role/backend/`
- **Quality Assurance** → `tasks/by-role/qa/`
- **DevOps Deployment** → `tasks/by-role/devops/`
- **UI/UX Design** → `tasks/by-role/design/`

## 🛡️ Security Features

- **Path Validation**: Prevents directory traversal attacks
- **Reserved Name Checking**: Avoids system reserved names (Windows compatibility)
- **Length Restrictions**: Enforces reasonable filename lengths
- **Cross-platform Safety**: Works consistently across operating systems

## 💡 Best Practices

### File Naming Conventions
- Use descriptive names: `complexity-analysis-2025-01-07.md`
- Include dates or versions when relevant
- Avoid special characters and spaces
- Use lowercase with hyphens for consistency

### Content Organization
- Each document should have a clear purpose and audience
- Use standard Markdown format
- Include metadata (creation time, author, version)
- Maintain document freshness and accuracy

### Version Management
- Important documents should include version history
- Archive outdated documents regularly
- Use clear versioning schemes (v1.0, v1.1, etc.)

## 🔄 Integration with Task Management

The documentation system integrates seamlessly with Shrimp Task Manager's task execution:

1. **Task Analysis** → Documents stored in `analysis/`
2. **Task Execution** → Progress tracked in `tasks/in-progress/`
3. **Task Completion** → Summaries saved in `tasks/completed/`
4. **Team Collaboration** → Knowledge shared in `team/knowledge-base/`

## 🚀 Getting Started

1. **Enable the feature**: The documentation path management is automatically available
2. **Start creating documents**: AI assistants will automatically use correct paths
3. **Organize by type**: Follow the directory structure guidelines
4. **Collaborate effectively**: Use team directories for shared knowledge

## 📚 Related Documentation

- [Main README](../README.md) - Project overview and setup
- [Testing Guide](../TESTING.md) - Testing documentation
- [Prompt Customization](../prompt-customization.md) - Customizing AI behavior

## 🤝 Contributing

When contributing documentation:
- Follow the established directory structure
- Use consistent naming conventions
- Include proper metadata
- Test cross-platform compatibility
- Update this guide when adding new document types
