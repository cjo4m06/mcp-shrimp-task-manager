# Integration Test Checklist for NestedTabs Implementation

## 🧪 Manual Test Checklist

### 1. URL Synchronization ✅
- [ ] Navigate to http://localhost:9999
- [ ] Click "Release Notes" tab - URL should update to include `?tab=release-notes`
- [ ] Click "Readme" tab - URL should update to include `?tab=readme`
- [ ] Click "Templates" tab - URL should update to include `?tab=templates`
- [ ] Click "Projects" tab - URL should update to include `?tab=projects`
- [ ] If a profile exists, select it - URL should include `&profile=<id>`

### 2. Browser Navigation ✅
- [ ] After clicking through tabs, use browser back button
- [ ] Verify the previous tab is shown
- [ ] Use browser forward button
- [ ] Verify the next tab is shown
- [ ] Refresh the page - verify the current tab persists

### 3. Auto-refresh Functionality ✅
- [ ] Go to Projects tab with a profile selected
- [ ] Enable auto-refresh checkbox
- [ ] Select a refresh interval (e.g., 5s)
- [ ] Watch for the refresh indicator (⏳) to appear periodically
- [ ] Verify tasks reload without losing search/filter state

### 4. Search/Filter Functionality ✅
- [ ] In Projects tab with tasks loaded, type in search box
- [ ] Verify tasks filter in real-time
- [ ] Clear search - all tasks should reappear
- [ ] In Templates tab, use the search box
- [ ] Verify templates filter correctly

### 5. Drag-Drop Tab Reordering ✅
- [ ] Add multiple project profiles
- [ ] Drag a profile tab to a new position
- [ ] Verify visual feedback during drag (opacity change)
- [ ] Drop the tab - verify order is updated
- [ ] Refresh page - verify order persists

### 6. Tab Transitions ✅
- [ ] Click each outer tab in sequence
- [ ] Verify smooth transitions
- [ ] Verify correct content loads for each tab
- [ ] In Projects tab, click between Tasks/History/Settings inner tabs
- [ ] Verify inner tab content changes correctly

### 7. Component Rendering ✅
- [ ] **Projects Tab**:
  - [ ] Tasks table renders with columns
  - [ ] Stats cards show (Total, Completed, In Progress, Pending)
  - [ ] Search box is present
  - [ ] Auto-refresh controls are visible
- [ ] **History Tab** (within a project):
  - [ ] History list loads
  - [ ] Can click to view historical tasks
- [ ] **Settings Tab** (within a project):
  - [ ] Form fields are editable
  - [ ] Save button works
- [ ] **Release Notes Tab**:
  - [ ] Release notes content displays
  - [ ] Version information is shown
- [ ] **Readme Tab**:
  - [ ] README content renders properly
  - [ ] Markdown is formatted correctly
- [ ] **Templates Tab**:
  - [ ] Template list loads
  - [ ] Stats cards show template counts
  - [ ] Search box works
  - [ ] Can preview/edit templates

### 8. Modal Functionality ✅
- [ ] Click "Add Project" button
- [ ] Modal opens with form fields
- [ ] Click outside modal - it should close
- [ ] Open modal again, fill form and submit
- [ ] New profile tab appears

### 9. Error States ✅
- [ ] With no profiles, see "No profiles available" message
- [ ] Try to load invalid profile - see error message
- [ ] Disconnect network, try to refresh - see error handling

### 10. Persistence ✅
- [ ] Add profiles and reorder them
- [ ] Select a specific profile and tab
- [ ] Refresh the page
- [ ] Verify profile order is maintained
- [ ] Verify selected profile/tab is restored

## 🎯 Expected Results
All features should work identically to the original implementation with no regressions. The nested tab structure should provide clear visual hierarchy while maintaining all existing functionality.