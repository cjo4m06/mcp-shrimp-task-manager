# Export Feature Refactor Proposal

## Executive Summary

This proposal outlines the refactoring of the export functionality in the Task Viewer application to create a reusable component that can be utilized across multiple views: Tasks (main), History, and Archive pages.

## Current State Analysis

### Existing Export Implementation

**Location:** `src/components/ExportModal.jsx` and `src/App.jsx`

**Current Features:**
- Export formats: CSV, Markdown, Completion Reports (Markdown/JSON)
- Status filtering (Completed, In Progress, Pending)
- Task count preview
- Download functionality

**Current Usage:**
- Only available on the main tasks page
- Tightly coupled with the main App.jsx component
- Uses `handleExport` function defined in App.jsx

### History View Analysis

**Component:** `src/components/HistoryTasksView.jsx`

**Current Structure:**
- Displays historical task data with metadata
- Shows initial request and summary
- Uses TaskTable component for display
- No export functionality currently available

**Data Available:**
- Tasks array with full task details
- History entry metadata (timestamp, stats)
- Initial request and summary
- Generated initial request flag

### Archive View Analysis

**Component:** `src/components/ArchiveDetailView.jsx`

**Current Structure:**
- Displays archived task data
- Shows project info and statistics
- Uses TaskTable component in read-only mode
- No export functionality currently available

**Data Available:**
- Archive object with tasks array
- Project name and timestamp
- Initial request and summary
- Task statistics

## Proposed Solution

### 1. Create Reusable Export Hook

Create a new hook `useTaskExport` that encapsulates all export logic:

```javascript
// src/hooks/useTaskExport.js
export const useTaskExport = () => {
  const handleExport = ({ format, selectedStatuses, filteredTasks, metadata = {} }) => {
    // Common export logic
    // metadata can include: initialRequest, summary, projectName, timestamp, etc.
  };
  
  return { handleExport };
};
```

### 2. Refactor ExportModal Component

Make ExportModal more flexible to handle different contexts:

```javascript
// src/components/ExportModal.jsx
const ExportModal = ({ 
  isOpen, 
  onClose, 
  tasks = [],
  context = 'tasks', // 'tasks' | 'history' | 'archive'
  metadata = {} // Additional context-specific data
}) => {
  // Component implementation
};
```

### 3. Integration Points

#### Main Tasks Page (App.jsx)
- Continue using existing integration
- Pass `context="tasks"` to ExportModal
- Include initialRequest in metadata

#### History View (HistoryTasksView.jsx)
- Add Export button to header
- Pass historical context data:
  - Tasks from history
  - History timestamp
  - Initial request (if available)
  - Summary (if available)

#### Archive View (ArchiveDetailView.jsx)
- Add Export button to header
- Pass archive context data:
  - Archived tasks
  - Archive date
  - Project name
  - Initial request and summary

## Implementation Plan

### Phase 1: Create Reusable Hook
1. Extract export logic from App.jsx
2. Create useTaskExport hook
3. Add metadata support for different contexts
4. Update export utilities to handle metadata

### Phase 2: Refactor ExportModal
1. Add context prop to ExportModal
2. Customize modal title based on context
3. Adjust file naming based on context (e.g., "history_tasks_2024-01-15.csv")
4. Update description text for different contexts

### Phase 3: Integrate with History View
1. Import ExportModal and useTaskExport
2. Add state management for modal visibility
3. Add Export button to UI
4. Pass appropriate data and metadata

### Phase 4: Integrate with Archive View
1. Import ExportModal and useTaskExport
2. Add state management for modal visibility
3. Add Export button to UI
4. Pass appropriate data and metadata

### Phase 5: Testing & Documentation
1. Test export functionality in all three contexts
2. Verify file downloads work correctly
3. Update user documentation
4. Add unit tests for new hook

## Technical Considerations

### File Naming Convention
- Tasks: `tasks_[date].ext`
- History: `history_[profile]_[date].ext`
- Archive: `archive_[project]_[date].ext`

### Metadata Handling
Different contexts provide different metadata:
- **Tasks**: initialRequest, currentProfile
- **History**: historyDate, historyStats, summary, generatedInitialRequest flag
- **Archive**: projectName, archiveDate, archiveStats, summary

### Export Format Adjustments
- CSV: Include context-specific columns
- Markdown: Add context header (e.g., "History Export", "Archive Export")
- Completion Reports: Include metadata in report header

## Benefits

1. **Code Reusability**: Single source of truth for export logic
2. **Consistency**: Uniform export experience across all views
3. **Maintainability**: Easier to update and extend export functionality
4. **User Experience**: Users can export data from any view they're working in
5. **Flexibility**: Easy to add new export formats or contexts in the future

## Risks & Mitigation

### Risk 1: Breaking Existing Functionality
**Mitigation**: Implement changes incrementally, test thoroughly at each phase

### Risk 2: Performance Impact
**Mitigation**: Use React.memo and useMemo for optimization where needed

### Risk 3: Increased Bundle Size
**Mitigation**: Minimal - mostly reorganizing existing code

## Success Criteria

1. Export functionality works in all three views (Tasks, History, Archive)
2. All existing export formats continue to work
3. File naming clearly indicates the source context
4. No regression in existing functionality
5. Code is DRY (Don't Repeat Yourself) - single implementation shared

## Timeline Estimate

- Phase 1: 2 hours
- Phase 2: 1 hour
- Phase 3: 1 hour
- Phase 4: 1 hour
- Phase 5: 2 hours

**Total Estimated Time: 7 hours**

## Conclusion

This refactoring will significantly improve the user experience by allowing data export from any view, while also improving code maintainability through the creation of reusable components and hooks. The implementation can be done incrementally to minimize risk and ensure quality.