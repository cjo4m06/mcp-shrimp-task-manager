import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import NestedTabs from '../components/NestedTabs';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: vi.fn() }
  })
}));

describe('Archive Tab Simple Test', () => {
  it('should render Archive tab in inner tabs', () => {
    const props = {
      profiles: [{ id: 'profile-1', name: 'Test Project', path: '/test/path' }],
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
        tasks: <div>Tasks</div>,
        history: <div>History</div>,
        agents: <div>Agents</div>,
        settings: <div>Settings</div>,
        archive: <div data-testid="archive-content">Archive Content</div>,
        releaseNotes: <div>Release Notes</div>,
        readme: <div>Readme</div>,
        templates: <div>Templates</div>,
        globalSettings: <div>Global Settings</div>
      }
    };

    const { container } = render(<NestedTabs {...props} />);
    
    // Debug: print all tabs with archive text
    const allElements = container.querySelectorAll('*');
    const archiveElements = Array.from(allElements).filter(el => 
      el.textContent && el.textContent.toLowerCase().includes('archive')
    );
    
    console.log('Found elements with "archive":', archiveElements.length);
    archiveElements.forEach((el, i) => {
      console.log(`Element ${i}:`, el.tagName, el.className, el.textContent.slice(0, 50));
    });
    
    // Look for inner tabs specifically
    const innerTabs = container.querySelectorAll('.inner-tab');
    console.log('Inner tabs found:', innerTabs.length);
    innerTabs.forEach((tab, i) => {
      console.log(`Inner tab ${i}:`, tab.textContent);
    });
    
    // Check if archive tab exists
    const archiveTab = Array.from(innerTabs).find(tab => 
      tab.textContent.toLowerCase().includes('archive')
    );
    
    expect(archiveTab).toBeTruthy();
  });
});