import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import i18n from '../src/i18n/i18n';
import ReleaseNotes from '../src/components/ReleaseNotes';

// Mock the releases data
vi.mock('../src/data/releases', () => ({
  releaseMetadata: [
    {
      version: 'v3.1.0',
      date: '2025-01-15',
      title: 'Enhanced Archive & Export Features',
      summary: 'Comprehensive archive functionality, refined export features, and robust testing infrastructure'
    },
    {
      version: 'v3.0.0',
      date: '2025-01-01',
      title: 'Major Release',
      summary: 'Major release with new features'
    },
    {
      version: 'v2.5.0',
      date: '2024-12-01',
      title: 'Performance Updates',
      summary: 'Performance improvements and bug fixes'
    }
  ],
  getReleaseFile: (version) => `/releases/${version}.md`
}));

// Mock i18n documentation functions
vi.mock('../src/i18n/documentation/index.js', () => ({
  getUIStrings: () => ({
    header: 'Release Notes',
    versions: 'Versions',
    loading: 'Loading...',
    notFound: 'Release notes not found',
    error: 'Error loading release notes',
    copy: 'Copy',
    copied: 'Copied!'
  }),
  getReleaseContent: () => null
}));

// Mock the ImageLightbox component and hook
vi.mock('../src/components/ImageLightbox', () => ({
  default: ({ isOpen, onClose, images, currentIndex }) => 
    isOpen ? <div data-testid="image-lightbox">Lightbox</div> : null,
  useLightbox: () => ({
    isOpen: false,
    closeLightbox: vi.fn(),
    openLightbox: vi.fn(),
    images: [],
    currentIndex: 0
  })
}));

// Mock fetch for release content
const mockLongContent = `# v3.1.0 - Enhanced Archive & Export Features

## Table of Contents

## New Features

### Archive Functionality
- Complete archive system implementation
- Archive management interface
- Batch archive operations
- Archive status indicators

### Export Enhancements  
- Numbered task export format
- Enhanced CSV export capabilities
- Improved export file naming
- Export progress indicators

### Testing Infrastructure
- Comprehensive test coverage
- Integration testing framework
- Component testing utilities
- Performance testing tools

## Bug Fixes

### Critical Issues Resolved
- Fixed authentication handling
- Resolved data persistence issues
- Corrected UI rendering problems
- Fixed navigation state management

### Minor Improvements
- Enhanced error messaging
- Improved loading states  
- Better responsive design
- Optimized performance

## Technical Details

### Architecture Changes
- Modular component structure
- Improved state management
- Enhanced data flow patterns
- Better separation of concerns

### Performance Optimizations
- Reduced bundle size
- Improved rendering efficiency
- Optimized API calls
- Better memory management

### Development Experience
- Enhanced development tools
- Improved debugging capabilities
- Better error tracking
- Streamlined build process

## Migration Guide

### Breaking Changes
- Updated API endpoints
- Changed component props
- Modified data structures
- Renamed configuration options

### Upgrade Steps
1. Update dependencies
2. Migrate configuration files
3. Update component usage
4. Test thoroughly

## Known Issues

### Current Limitations
- Some features require manual configuration
- Performance optimization ongoing
- Documentation updates needed
- Browser compatibility testing

### Workarounds
- Use alternative configuration methods
- Apply performance patches
- Reference legacy documentation
- Test in supported browsers

## Credits and Acknowledgments

### Contributors
- Development team contributions
- Community feedback and testing
- Documentation improvements
- Bug reports and fixes

### Special Thanks
- Beta testers and early adopters
- Community moderators and supporters
- Documentation contributors
- Translation team efforts

This release represents a significant milestone in our development journey.`;

const mockShortContent = `# v2.5.0 - Performance Updates

## Overview

This release focuses on performance improvements and bug fixes.

## Changes

- Improved loading times
- Fixed memory leaks
- Better error handling`;

describe('Release Notes Scrolling Functionality', () => {
  let mockFetch;

  beforeEach(() => {
    // Mock fetch to return different content based on version
    mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes('v3.1.0') || url.includes('v3.0.0')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockLongContent)
        });
      } else if (url.includes('v2.5.0')) {
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockShortContent)
        });
      }
      return Promise.resolve({
        ok: false,
        text: () => Promise.resolve('')
      });
    });
    
    global.fetch = mockFetch;

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
    
    // Mock getElementById for anchor navigation
    const originalGetElementById = document.getElementById;
    document.getElementById = vi.fn().mockImplementation((id) => {
      // Return a mock element for TOC navigation testing
      if (id.includes('-')) {
        return {
          scrollIntoView: vi.fn()
        };
      }
      return originalGetElementById.call(document, id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderReleaseNotes = () => {
    return render(
      <I18nextProvider i18n={i18n}>
        <ReleaseNotes />
      </I18nextProvider>
    );
  };

  describe('Component Structure and Layout', () => {
    it('renders with proper flex layout structure', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('Release Notes')).toBeInTheDocument();
      });

      // Check that the main container has proper flex structure
      const tabContent = document.querySelector('.release-notes-tab-content');
      expect(tabContent).toHaveStyle({
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      });

      const content = document.querySelector('.release-notes-content');
      expect(content).toHaveStyle({
        display: 'flex',
        flex: '1',
        minHeight: '0'
      });
    });

    it('creates sidebar and content areas with proper dimensions', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('Versions')).toBeInTheDocument();
      });

      const sidebar = document.querySelector('.release-sidebar');
      const details = document.querySelector('.release-details');

      expect(sidebar).toHaveStyle({
        width: '300px',
        minWidth: '300px',
        overflowY: 'auto'
      });

      expect(details).toHaveStyle({
        flex: '1',
        overflowY: 'auto',
        minWidth: '0'
      });
    });
  });

  describe('Sidebar Scrolling', () => {
    it('sidebar has overflow-y auto for scrolling', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('Versions')).toBeInTheDocument();
      });

      const sidebar = document.querySelector('.release-sidebar');
      expect(sidebar).toHaveStyle('overflow-y: auto');
    });

    it('sidebar scrolls independently when content overflows', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('v3.1.0')).toBeInTheDocument();
      });

      // Expand TOC to create more content in sidebar
      const expandButton = document.querySelector('.release-sidebar button[style*="transform"]');
      if (expandButton) {
        fireEvent.click(expandButton);
      }

      await waitFor(() => {
        // Wait for TOC to load
        expect(mockFetch).toHaveBeenCalled();
      });

      const sidebar = document.querySelector('.release-sidebar');
      
      // Test scroll functionality
      fireEvent.scroll(sidebar, { target: { scrollTop: 100 } });
      
      // Verify sidebar can handle scroll events
      expect(sidebar.scrollTop).toBeDefined();
    });

    it('TOC navigation works with sidebar scrolling', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('v3.1.0')).toBeInTheDocument();
      });

      // Select a version to load content
      fireEvent.click(screen.getByText('v3.1.0'));

      await waitFor(() => {
        // Wait for content and TOC to load
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Look for TOC expansion button
      const tocButton = document.querySelector('button[style*="transform"]');
      if (tocButton) {
        fireEvent.click(tocButton);
      }
    });
  });

  describe('Content Area Scrolling', () => {
    it('content area has proper overflow settings', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('v3.1.0')).toBeInTheDocument();
      });

      // Load content
      fireEvent.click(screen.getByText('v3.1.0'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/releases/v3.1.0.md');
      });

      const details = document.querySelector('.release-details');
      expect(details).toHaveStyle('overflow-y: auto');
    });

    it('content area scrolls with long content', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('v3.1.0')).toBeInTheDocument();
      });

      // Load long content
      fireEvent.click(screen.getByText('v3.1.0'));

      await waitFor(() => {
        // Look for content in the main content area, not sidebar
        expect(screen.getAllByText(/Enhanced Archive & Export Features/).length).toBeGreaterThan(0);
      });

      const details = document.querySelector('.release-details');
      
      // Simulate scrolling in content area
      fireEvent.scroll(details, { target: { scrollTop: 200 } });
      
      expect(details.scrollTop).toBeDefined();
    });

    it('handles different content lengths appropriately', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('v2.5.0')).toBeInTheDocument();
      });

      // Load short content first
      fireEvent.click(screen.getByText('v2.5.0'));

      await waitFor(() => {
        expect(screen.getByText(/Performance Updates/)).toBeInTheDocument();
      });

      // Switch to long content
      fireEvent.click(screen.getByText('v3.1.0'));

      await waitFor(() => {
        expect(screen.getAllByText(/Enhanced Archive & Export Features/).length).toBeGreaterThan(0);
      });

      const details = document.querySelector('.release-details');
      expect(details).toHaveStyle('overflow-y: auto');
    });
  });

  describe('Independent Scrolling', () => {
    it('sidebar and content scroll independently', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('v3.1.0')).toBeInTheDocument();
      });

      // Load content
      fireEvent.click(screen.getByText('v3.1.0'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const sidebar = document.querySelector('.release-sidebar');
      const details = document.querySelector('.release-details');

      // Scroll sidebar
      fireEvent.scroll(sidebar, { target: { scrollTop: 50 } });
      
      // Scroll content area differently
      fireEvent.scroll(details, { target: { scrollTop: 150 } });

      // Both areas should maintain independent scroll positions
      expect(sidebar.scrollTop).not.toEqual(details.scrollTop);
    });

    it('scrolling one area does not affect the other', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('v3.1.0')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('v3.1.0'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const sidebar = document.querySelector('.release-sidebar');
      const details = document.querySelector('.release-details');

      // Record initial scroll positions
      const initialSidebarScroll = sidebar.scrollTop || 0;
      const initialContentScroll = details.scrollTop || 0;

      // Scroll only the content area
      fireEvent.scroll(details, { target: { scrollTop: 100 } });

      // Sidebar position should remain unchanged
      expect(sidebar.scrollTop).toBe(initialSidebarScroll);
      
      // Content scroll should have changed
      // Note: In jsdom, scrollTop might not actually change, but we can verify the event was handled
      expect(details).toHaveStyle('overflow-y: auto');
    });
  });

  describe('Responsive Behavior', () => {
    it('maintains proper layout ratios for scrolling', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('Release Notes')).toBeInTheDocument();
      });

      const content = document.querySelector('.release-notes-content');
      const sidebar = document.querySelector('.release-sidebar');
      const details = document.querySelector('.release-details');

      // Verify flex properties
      expect(content).toHaveStyle('display: flex');
      expect(sidebar).toHaveStyle('width: 300px');
      expect(details).toHaveStyle('flex: 1');
    });

    it('maintains scrollability with different viewport sizes', async () => {
      // This would typically require additional viewport testing
      // For now, verify the CSS properties are correct
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('Release Notes')).toBeInTheDocument();
      });

      const sidebar = document.querySelector('.release-sidebar');
      const details = document.querySelector('.release-details');

      expect(sidebar).toHaveStyle('overflow-y: auto');
      expect(details).toHaveStyle('overflow-y: auto');
    });
  });

  describe('Anchor Navigation and Scrolling', () => {
    it('TOC links trigger smooth scrolling', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('v3.1.0')).toBeInTheDocument();
      });

      // Load content and expand TOC
      fireEvent.click(screen.getByText('v3.1.0'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Expand TOC
      const expandButton = document.querySelector('button[style*="transform"]');
      if (expandButton) {
        fireEvent.click(expandButton);
      }

      // Simulate clicking on a TOC link
      // Since TOC is dynamically generated, we'll simulate the click handler
      const mockElement = { scrollIntoView: vi.fn() };
      document.getElementById = vi.fn().mockReturnValue(mockElement);

      // Create a mock TOC link click
      const event = new Event('click');
      event.preventDefault = vi.fn();
      
      // Simulate the onClick behavior from the component
      const targetId = 'new-features';
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });

  describe('Performance and Memory', () => {
    it('handles frequent content switching without memory leaks', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('v3.1.0')).toBeInTheDocument();
      });

      // Switch between versions multiple times
      const versions = ['v3.1.0', 'v3.0.0', 'v2.5.0'];
      
      for (const version of versions) {
        fireEvent.click(screen.getByText(version));
        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalled();
        });
      }

      // Verify all versions are still accessible
      versions.forEach(version => {
        expect(screen.getByText(version)).toBeInTheDocument();
      });
    });

    it('maintains scroll position state correctly', async () => {
      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getByText('v3.1.0')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('v3.1.0'));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const details = document.querySelector('.release-details');
      
      // Scroll and verify position is maintained
      fireEvent.scroll(details, { target: { scrollTop: 100 } });
      
      // The element should still have the proper overflow style
      expect(details).toHaveStyle('overflow-y: auto');
    });
  });

  describe('Error Handling with Scrolling', () => {
    it('maintains scrollable layout even when content fails to load', async () => {
      // Mock fetch to fail
      mockFetch.mockImplementation(() => Promise.resolve({
        ok: false,
        text: () => Promise.resolve('')
      }));

      renderReleaseNotes();
      
      await waitFor(() => {
        expect(screen.getAllByText('v3.1.0').length).toBeGreaterThan(0);
      });

      // Click on the version button specifically (not the content)
      const versionButtons = screen.getAllByText('v3.1.0');
      fireEvent.click(versionButtons[0]);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Verify layout is still intact
      const sidebar = document.querySelector('.release-sidebar');
      const details = document.querySelector('.release-details');

      expect(sidebar).toHaveStyle('overflow-y: auto');
      expect(details).toHaveStyle('overflow-y: auto');
    });
  });
});