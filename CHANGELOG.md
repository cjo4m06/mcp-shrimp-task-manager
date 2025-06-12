[English](CHANGELOG.md) | [中文](docs/zh/CHANGELOG.md)

# Changelog

## [1.1.0] - 2025-01-07

### Added

- Added reset button and thumbnail view
- Enhanced interaction between dependency graph and task list, making the dependency graph respond to filtering and task list selection
- **📁 Documentation Path Management System**: Comprehensive structured document organization inspired by claude-task-master
  - **Structured Directory Hierarchy**: Organized document storage with project-specific paths for analysis, reflection, research, and team collaboration
  - **Automatic Path Management**: AI assistants automatically use correct paths when creating documents
  - **Security Features**: Path validation prevents traversal attacks, reserved name checking, and cross-platform compatibility
  - **Document Classification**: Clear guidelines for organizing documents by type (project, PRD, tasks, analysis, reflection, research, team)
  - **Role-based Organization**: Task documents organized by role (frontend, backend, qa, devops, design)
- **🔧 New MCP Tool**: `get_documentation_path` for obtaining project-specific documentation storage paths
  - **Parameter Validation**: Comprehensive input validation with Zod schema
  - **Multi-level Subdirectories**: Support for complex directory structures like `tasks/completed` and `team/knowledge-base`
  - **Automatic Directory Creation**: Creates necessary directory structures on first access
  - **Detailed Response Format**: Returns complete path information with usage guidance
- **📚 Enhanced Documentation**: Comprehensive guides and updated project documentation
  - **Documentation Management Guide**: Detailed guide for using the new documentation system
  - **Updated README**: Added documentation management features to main and Chinese README
  - **Template Integration**: Updated prompt templates to include documentation path guidance
  - **Usage Examples**: Clear examples for different document types and use cases
- **🧠 Team Collaboration Memory System**: Complete team memory system with intelligent knowledge sharing and collaboration optimization
  - **TaskMemoryManager**: Individual task memory with execution context, decision tracking, and knowledge extraction
  - **TeamMemoryManager**: Team-level knowledge sharing, collaboration pattern learning, and collective intelligence
  - **DynamicTaskAdjuster**: Intelligent task insertion with context awareness and dependency resolution
- **🔧 5 New MCP Tools**: Advanced team collaboration tools integrated into the MCP server
  - `insertTaskDynamically`: Smart task insertion with priority and dependency management
  - `shareTeamKnowledge`: Team knowledge sharing with role-based distribution
  - `analyzeTeamCollaboration`: Team performance analytics and improvement recommendations
  - `recordTaskMemory`: Comprehensive task execution memory recording
  - `retrieveTeamInsights`: Intelligent team insights and pattern recognition
- **📊 Advanced Data Architecture**: Project-aware data storage with complete isolation
  - Individual memory directories: contexts, knowledge, decisions, discoveries, checkpoints
  - Team memory directories: shared knowledge, collaboration patterns, learning records
  - Automatic directory creation and management
- **🎯 Intelligent Features**: Context-aware task management and team optimization
  - Execution context tracking with step-by-step recording
  - Decision path analysis and impact assessment
  - Knowledge extraction and automatic categorization
  - Collaboration pattern learning and recommendation
  - Dynamic task priority adjustment based on context

### Changed

- Removed initial animation of dependency graph to avoid animation jumps
- Optimized initial state of dependency graph

### Enhanced

- **🧪 Testing Suite**: Comprehensive unit tests for documentation path management
  - **PathManager Tests**: 15 test cases covering basic functionality, caching, cross-platform compatibility, and error handling
  - **MCP Tool Tests**: 19 test cases covering parameter validation, security checks, return formats, and edge cases
  - **Security Validation**: Tests for path traversal prevention, filename validation, and subdirectory safety
  - **Cross-platform Testing**: Ensures consistent behavior across Windows, macOS, and Linux
- **🎯 Prompt Templates**: Enhanced AI guidance for documentation management
  - **Shared Template**: Created `documentationPathGuidance.md` for consistent path management across all templates
  - **Template Updates**: Updated `analyzeTask`, `reflectTask`, `researchMode`, and `processThought` templates
  - **Bilingual Support**: Complete Chinese and English template coverage
  - **Professional Terminology**: Refined prompts with professional terminology for improved AI accuracy
- **🏗️ System Architecture**: Improved path management and validation
  - **Enhanced PathManager**: Added `getDocumentationDir()` method with automatic directory creation
  - **Security Improvements**: Robust validation for filenames and subdirectory names
  - **Multi-level Path Support**: Support for complex directory structures while maintaining security
  - **Template Integrity**: Updated template integrity tests to include new shared templates
- **📚 Documentation**: Comprehensive documentation for team collaboration features
  - Added `docs/TEAM_MEMORY_FEATURES.md` with detailed feature overview
  - Updated README with new intelligence and memory capabilities
  - Added team collaboration examples and usage guides
- **🧪 Testing**: Robust testing suite for memory system components
  - TaskMemoryManager: 12/12 tests passing (100% coverage)
  - MCP Server Integration: 8/8 tests passing (100% coverage)
  - Comprehensive unit tests for all memory components
- **🏗️ Architecture**: Modular and extensible system design
  - Type-safe TypeScript implementation with complete type definitions
  - Clean separation of concerns between individual and team memory
  - Extensible plugin architecture for future enhancements

### Technical Highlights

- **🔒 Security First**: Comprehensive security validation prevents path traversal and injection attacks
- **📁 Organized Structure**: Clear document hierarchy inspired by industry best practices
- **🚀 Automatic Management**: AI assistants automatically use correct paths without manual intervention
- **🌐 Cross-platform**: Consistent behavior across all major operating systems
- **📊 Team Collaboration**: Structured paths for team knowledge sharing and collaboration
- **🔄 Integration**: Seamless integration with existing task management workflows
- **🚀 Performance**: Optimized memory management with intelligent caching
- **🔒 Data Safety**: Complete data isolation between projects and team contexts
- **📈 Scalability**: Designed to handle large teams and complex project hierarchies
- **🔄 Real-time**: Live collaboration pattern learning and adaptation
- **💡 Intelligence**: Machine learning-ready architecture for future AI enhancements

## [1.0.20]

### Added

- Added reset button and thumbnail view
- Enhanced interaction between dependency graph and task list, making the dependency graph respond to filtering and task list selection

### Changed

- Removed initial animation of dependency graph to avoid animation jumps
- Optimized initial state of dependency graph

## [1.0.19]

### Added

- Added research mode functionality for systematic programming research (5267fa4)
- Added research mode prompts and templates for both English and Chinese (5267fa4)
- Added comprehensive research mode documentation and usage guides (288bec9)

### Changed

- Enhanced README with research mode feature description and usage instructions (288bec9)
- Updated Chinese documentation to include research mode functionality (288bec9)

## [1.0.18]

### Fixed

- Fix #29: Removed unnecessary console.log outputs to reduce noise (7cf1a18)
- Fix #28: Fixed WebGUI internationalization issues in task detail view (fd26bfa)

### Changed

- Enhanced WebGUI task detail view to use proper translation functions for all labels (fd26bfa)
- Updated thought process stage description to use English for better consistency (fd26bfa)

## [1.0.17]

### Fixed

- Fix #26: Fixed issue where task status was displayed in Chinese in WebGUI (16913ad)
- Fix #26: Optimized WebGUI default language to change based on env TEMPLATES_USE setting (51436bb)

### Changed

- Updated .env.example to include language setting documentation (51436bb)
- Enhanced WebGUI language handling logic for better internationalization support (51436bb)

## [1.0.16]

### Fixed

- Fix: Fixed issue with Augment AI not supporting uuid format by implementing custom regex validation (4264fa7)

### Changed

- Updated task planning related prompts, added critical warning prohibiting assumptions, guesses, and imagination, emphasizing the need to use available tools to gather real information (cb838cb)
- Adjusted task descriptions to more clearly express task objectives (cb838cb)
- Optimized error message prompts, adding batch call suggestions to resolve long text formatting issues (cb838cb)

## [1.0.15]

### Fixed

- Fix: Corrected an error where gemini-2.5-pro-preview-05-06 would skip task execution and mark it as completed directly (6d8a422)
- Fixes issue #20 (5d1c28d)

### Changed

- Moved rule.md to the root directory to prepare for future collaborative architecture with DATA_DIR outside the project (313e338)
- Updated documentation (28984f)

## [1.0.14]

### Changed

- Optimized prompts to reduce token usage and improved guidance. (662b3be, 7842e0d)
- Updated English prompts for better clarity and efficiency. (7842e0d)
- Restructured tools architecture for better organization and maintainability. (04f55cb)
- Optimized workflow by reducing unnecessary steps. (3037d4e)

### Removed

- Removed unused code and files. (ea40e78)

## [1.0.13]

### Fixed

- Fix: Corrected issue with invariantlabs misjudgment (148f0cd)

## [1.0.12]

### Added

- Added demonstration video links to README and Chinese README, along with demonstration video image files. (406eb46)
- Added JSON format notes emphasizing the prohibition of comments and the requirement for special character escaping to prevent parsing failures. (a328322)
- Added a web-based graphical interface feature, controlled by the `ENABLE_GUI` environment variable. (bf5f367)

### Removed

- Removed unnecessary error log outputs in multiple places to avoid Cursor errors. (552eed8)

## [1.0.11]

### Changed

- Removed unused functions. (f8d9c8)

### Fixed

- Fix: Resolved issue with Chinese character support in Cursor Console. (00943e1)

## [1.0.10]

### Changed

- Added guidelines for project rule update modes, emphasizing recursive checks and autonomous handling of ambiguous requests. (989af20)
- Added prompt language and customization instructions, updated README and docs. (d0c3bfa)
- Added `TEMPLATES_USE` config option for custom prompt templates, updated README and docs. (76315fe)
- Added multilingual task templates (English/Chinese). (291c5ee)
- Added prompt generators and templates for various task operations (delete, clear, update). (a51110f, 52994d5, 304e0cd)
- Changed task templates to Markdown format for better multilingual support and modification. (5513235)
- Adjusted the "batch submission" parameter limit for the `split_tasks` tool from 8000 to 5000 characters. (a395686)
- Removed the unused tool for updating task-related files. (fc1a5c8)
- Updated README and docs: added 'Recommended Models', linked MIT license, added Star History, added TOC and tags, enhanced usage guides. (5c61b3e, f0283ff, 0bad188, 31065fa)
- Updated task content description: allow completed tasks to update related file summaries, adjusted thought process description. (b07672c)
- Updated task templates: added 'Please strictly follow the instructions below' prompt, enhanced guidance. (f0283ff)

### Fixed

- Fixed an issue where some models might not follow the process correctly. (ffd6349)
- Fix #6: Corrected an issue where simplified/traditional Chinese caused Enum parameter validation errors. (dae3756)

## [1.0.8]

### Added

- Added dependency on zod-to-json-schema for better schema integration
- Added detailed task splitting guidelines for better task management
- Added more robust error handling for Agent tool calls

### Changed

- Updated MCP SDK integration for better error handling and compatibility
- Improved task implementation prompt templates for clearer instructions
- Optimized task split tool descriptions and parameter validation

### Fixed

- Fixed issue #5 where some Agents couldn't properly handle errors
- Fixed line formatting in template documents for better readability

## [1.0.7]

### Added

- Added Thought Chain Process feature for systematic problem analysis
- Added Project Rules Initialization feature for maintaining project consistency

### Changed

- Updated documentation to emphasize systematic problem analysis and project consistency
- Adjusted tool list to include new features
- Updated .gitignore to exclude unnecessary folders
