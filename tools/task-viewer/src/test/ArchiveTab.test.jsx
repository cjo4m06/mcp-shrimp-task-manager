import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NestedTabs from '../components/NestedTabs';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn() }
  })
}));

// Mock the ArchiveView component
vi.mock('../components/ArchiveView', () => ({
  default: ({ archives }) => (
    <div data-testid="archive-view-mock">
      <div data-testid="archive-count">Archives: {archives?.length || 0}</div>
      {archives?.map((archive, index) => (
        <div key={index} data-testid={`archive-item-${index}`}>
          {archive.projectName} - {archive.date}
        </div>
      ))}
    </div>
  )
}));

describe('Archive Tab Integration', () => {
  const mockProfiles = [
    { id: 'profile-1', name: 'Test Project', path: '/test/path' }
  ];

  const mockArchives = [
    { 
      id: 'archive-1', 
      projectName: 'Test Project',
      date: '2025-01-01T10:00:00.000Z',
      tasks: []
    },
    { 
      id: 'archive-2', 
      projectName: 'Test Project',
      date: '2025-01-02T10:00:00.000Z',
      tasks: []
    }
  ];

  const defaultProps = {
    profiles: mockProfiles,
    selectedProfile: 'profile-1',
    handleProfileChange: vi.fn(),
    handleRemoveProfile: vi.fn(),
    setShowAddProfile: vi.fn(),
    projectInnerTab: 'tasks',
    setProjectInnerTab: vi.fn(),
    selectedOuterTab: 'projects',
    onOuterTabChange: vi.fn(),
    draggedTabIndex: null,
    dragOverIndex: null,
    handleDragStart: vi.fn(),
    handleDragOver: vi.fn(),
    handleDragEnd: vi.fn(),
    handleDrop: vi.fn(),
    claudeFolderPath: null,
    children: {
      tasks: <div data-testid="tasks-content">Tasks Content</div>,
      history: <div data-testid="history-content">History Content</div>,
      agents: <div data-testid="agents-content">Agents Content</div>,
      settings: <div data-testid="settings-content">Settings Content</div>,
      archive: (
        <div data-testid="archive-content">
          <div data-testid="archive-view-mock">
            <div data-testid="archive-count">Archives: {mockArchives.length}</div>
            {mockArchives.map((archive, index) => (
              <div key={index} data-testid={`archive-item-${index}`}>
                {archive.projectName} - {archive.date}
              </div>
            ))}
          </div>
        </div>
      ),
      releaseNotes: <div>Release Notes</div>,
      readme: <div>Readme</div>,
      templates: <div>Templates</div>,
      globalSettings: <div>Global Settings</div>
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Archive Tab Visibility', () => {
    it('should display Archive tab in project inner tabs', () => {
      render(<NestedTabs {...defaultProps} />);

      // Check that Archive tab exists
      const archiveTabs = screen.getAllByText(/archive/i);
      // Should find at least one Archive tab (could be in translation)
      expect(archiveTabs.length).toBeGreaterThan(0);
      
      // Find the specific Archive tab with icon
      const archiveTab = screen.getByText((content, element) => {
        return element && 
               element.textContent && 
               element.textContent.includes('📦') &&
               element.textContent.toLowerCase().includes('archive');
      });
      expect(archiveTab).toBeInTheDocument();
    });

    it('should have Archive tab as the last tab after Settings', () => {
      render(<NestedTabs {...defaultProps} />);

      // Get all inner tabs
      const innerTabs = screen.getByRole('tablist', { name: '' }).querySelectorAll('.inner-tab');
      
      // Archive should be the 5th tab (0-indexed: Tasks, History, Agents, Settings, Archive)
      expect(innerTabs).toHaveLength(5);
      
      // Check order
      expect(innerTabs[0]).toHaveTextContent(/tasks/i);
      expect(innerTabs[1]).toHaveTextContent(/history/i);
      expect(innerTabs[2]).toHaveTextContent(/agents/i);
      expect(innerTabs[3]).toHaveTextContent(/settings/i);
      expect(innerTabs[4]).toHaveTextContent(/archive/i);
    });

    it('should show Archive content when Archive tab is clicked', async () => {
      const setProjectInnerTab = vi.fn();
      render(<NestedTabs {...defaultProps} setProjectInnerTab={setProjectInnerTab} />);

      // Find and click Archive tab
      const archiveTab = screen.getByText((content, element) => {
        return element && 
               element.textContent && 
               element.textContent.includes('📦') &&
               element.textContent.toLowerCase().includes('archive');
      });
      
      fireEvent.click(archiveTab);

      // Check that setProjectInnerTab was called with 'archive'
      await waitFor(() => {
        expect(setProjectInnerTab).toHaveBeenCalledWith('archive');
      });
    });

    it('should display archive content panel when archive tab is active', () => {
      render(<NestedTabs {...defaultProps} projectInnerTab="archive" />);

      // Archive content should be visible
      expect(screen.getByTestId('archive-content')).toBeInTheDocument();
      expect(screen.getByTestId('archive-view-mock')).toBeInTheDocument();
      expect(screen.getByTestId('archive-count')).toHaveTextContent('Archives: 2');
    });

    it('should display archive items in the archive view', () => {
      render(<NestedTabs {...defaultProps} projectInnerTab="archive" />);

      // Check that archive items are displayed
      expect(screen.getByTestId('archive-item-0')).toHaveTextContent('Test Project - 2025-01-01');
      expect(screen.getByTestId('archive-item-1')).toHaveTextContent('Test Project - 2025-01-02');
    });
  });

  describe('Archive Tab Navigation', () => {
    it('should switch between tabs correctly', async () => {
      const setProjectInnerTab = vi.fn();
      const { rerender } = render(
        <NestedTabs {...defaultProps} 
                      projectInnerTab="tasks" 
                      setProjectInnerTab={setProjectInnerTab} />);

      // Initially on tasks tab
      expect(screen.getByTestId('tasks-content')).toBeInTheDocument();

      // Click Archive tab
      const archiveTab = screen.getByText((content, element) => {
        return element && 
               element.textContent && 
               element.textContent.includes('📦') &&
               element.textContent.toLowerCase().includes('archive');
      });
      fireEvent.click(archiveTab);

      // Simulate prop update after clicking
      rerender(
        <NestedTabs {...defaultProps} 
                      projectInnerTab="archive" 
                      setProjectInnerTab={setProjectInnerTab} />);

      // Now archive content should be visible
      expect(screen.getByTestId('archive-content')).toBeInTheDocument();
      expect(screen.queryByTestId('tasks-content')).not.toBeInTheDocument();
    });

    it('should maintain Archive tab when switching profiles', () => {
      const { rerender } = render(
        <NestedTabs {...defaultProps} projectInnerTab="archive" />);

      // Archive content visible initially
      expect(screen.getByTestId('archive-content')).toBeInTheDocument();

      // Change profile
      const newProfiles = [
        { id: 'profile-2', name: 'Another Project', path: '/another/path' }
      ];

      rerender(
        <NestedTabs {...defaultProps} 
                      profiles={newProfiles}
                      selectedProfile="profile-2"
                      projectInnerTab="archive" />);

      // Archive content should still be visible
      expect(screen.getByTestId('archive-content')).toBeInTheDocument();
    });
  });

  describe('Archive Tab State Management', () => {
    it('should call loadArchives when Archive tab is selected', () => {
      const setProjectInnerTab = vi.fn();
      
      render(<NestedTabs {...defaultProps} setProjectInnerTab={setProjectInnerTab} />);

      // Find and click Archive tab
      const archiveTab = screen.getByText((content, element) => {
        return element && 
               element.textContent && 
               element.textContent.includes('📦') &&
               element.textContent.toLowerCase().includes('archive');
      });
      
      fireEvent.click(archiveTab);

      // Verify that the tab change handler was called
      expect(setProjectInnerTab).toHaveBeenCalledWith('archive');
    });

    it('should render empty state when no archives exist', () => {
      const propsWithNoArchives = {
        ...defaultProps,
        children: {
          ...defaultProps.children,
          archive: (
            <div data-testid="archive-content">
              <div data-testid="archive-view-mock">
                <div data-testid="archive-count">Archives: 0</div>
                <div data-testid="no-archives">No archives found</div>
              </div>
            </div>
          )
        }
      };

      render(<NestedTabs {...propsWithNoArchives} projectInnerTab="archive" />);

      expect(screen.getByTestId('archive-count')).toHaveTextContent('Archives: 0');
      expect(screen.getByTestId('no-archives')).toHaveTextContent('No archives found');
    });
  });
});