import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemplateManagement from '../components/TemplateManagement';

describe('TemplateManagement Component', () => {
  const mockTemplates = [
    {
      functionName: 'planTask',
      description: 'default template from built-in',
      status: 'default',
      source: 'built-in',
      contentLength: 4859,
      category: 'Task Management'
    },
    {
      functionName: 'executeTask',
      description: 'custom template from user-custom',
      status: 'custom',
      source: 'user-custom',
      contentLength: 2400,
      category: 'Task Management'
    },
    {
      functionName: 'analyzeTask',
      description: 'env-override template from environment',
      status: 'env-override',
      source: 'environment',
      contentLength: 3200,
      category: 'Task Management'
    },
    {
      functionName: 'verifyTask',
      description: 'env-append template from environment+built-in',
      status: 'env-append',
      source: 'environment+built-in',
      contentLength: 1800,
      category: 'Task Management'
    }
  ];

  const mockHandlers = {
    onGlobalFilterChange: vi.fn(),
    onEditTemplate: vi.fn(),
    onResetTemplate: vi.fn(),
    onDuplicateTemplate: vi.fn(),
    onPreviewTemplate: vi.fn(),
    onExportTemplates: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn();
    global.URL.revokeObjectURL = vi.fn();
  });

  describe('Rendering', () => {
    it('renders all table columns correctly', () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      // Check headers
      expect(screen.getByText('Function')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Language')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders template data correctly', () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      // Check template function names
      expect(screen.getByText('planTask')).toBeInTheDocument();
      expect(screen.getByText('executeTask')).toBeInTheDocument();
      expect(screen.getByText('analyzeTask')).toBeInTheDocument();
      expect(screen.getByText('verifyTask')).toBeInTheDocument();

      // Check categories
      expect(screen.getAllByText('Task Management')).toHaveLength(4);
    });

    it('displays template statuses with correct styling', () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const defaultBadge = screen.getByText('Default');
      const customBadge = screen.getByText('Custom');
      
      expect(defaultBadge).toHaveClass('status-badge', 'status-default');
      expect(customBadge).toHaveClass('status-badge', 'status-custom');
    });

    it('renders template header with title and export button', () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      expect(screen.getByText('🎨 Template Management')).toBeInTheDocument();
      expect(screen.getByText(/Manage prompt templates for all task manager functions/)).toBeInTheDocument();
      expect(screen.getByText('📤 Export Templates')).toBeInTheDocument();
    });

    it('handles empty data gracefully', () => {
      render(
        <TemplateManagement 
          data={[]}
          globalFilter=""
          {...mockHandlers}
        />
      );

      expect(screen.getByText('No templates found')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <TemplateManagement 
          data={[]}
          globalFilter=""
          loading={true}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Loading templates... ⏳')).toBeInTheDocument();
    });

    it('shows error state', () => {
      const errorMessage = 'Failed to load templates';
      
      render(
        <TemplateManagement 
          data={[]}
          globalFilter=""
          error={errorMessage}
          {...mockHandlers}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders all action buttons for each template', () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      // Each template should have 4 action buttons
      const editButtons = screen.getAllByTitle('Edit template');
      const previewButtons = screen.getAllByTitle('Preview template');
      const duplicateButtons = screen.getAllByTitle('Duplicate template');
      const resetButtons = screen.getAllByTitle('Reset to default template');

      expect(editButtons).toHaveLength(4);
      expect(previewButtons).toHaveLength(4);
      expect(duplicateButtons).toHaveLength(4);
      expect(resetButtons).toHaveLength(4);
    });

    it('calls onEditTemplate when edit button is clicked', async () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const editButtons = screen.getAllByTitle('Edit template');
      fireEvent.click(editButtons[0]);

      expect(mockHandlers.onEditTemplate).toHaveBeenCalledWith(mockTemplates[0]);
    });

    it('calls onPreviewTemplate when preview button is clicked', async () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const previewButtons = screen.getAllByTitle('Preview template');
      fireEvent.click(previewButtons[1]);

      expect(mockHandlers.onPreviewTemplate).toHaveBeenCalledWith(mockTemplates[1]);
    });

    it('calls onDuplicateTemplate when duplicate button is clicked', async () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const duplicateButtons = screen.getAllByTitle('Duplicate template');
      fireEvent.click(duplicateButtons[2]);

      expect(mockHandlers.onDuplicateTemplate).toHaveBeenCalledWith(mockTemplates[2]);
    });

    it('shows confirmation and calls onResetTemplate when reset button is clicked', async () => {
      // Mock window.confirm to return true
      global.confirm = vi.fn(() => true);

      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const resetButtons = screen.getAllByTitle('Reset to default template');
      fireEvent.click(resetButtons[1]); // Custom template

      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to reset "executeTask" template to default?');
      expect(mockHandlers.onResetTemplate).toHaveBeenCalledWith(mockTemplates[1]);
    });

    it('does not call onResetTemplate when confirmation is cancelled', async () => {
      // Mock window.confirm to return false
      global.confirm = vi.fn(() => false);

      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const resetButtons = screen.getAllByTitle('Reset to default template');
      fireEvent.click(resetButtons[1]);

      expect(global.confirm).toHaveBeenCalled();
      expect(mockHandlers.onResetTemplate).not.toHaveBeenCalled();
    });

    it('disables reset button for default templates', () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const resetButtons = screen.getAllByTitle('Reset to default template');
      const defaultTemplateResetButton = resetButtons[0]; // planTask is default

      expect(defaultTemplateResetButton).toBeDisabled();
    });
  });

  describe('Filtering', () => {
    it('filters templates based on global filter', () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter="planTask"
          {...mockHandlers}
        />
      );

      expect(screen.getByText('planTask')).toBeInTheDocument();
      expect(screen.queryByText('executeTask')).not.toBeInTheDocument();
      expect(screen.queryByText('analyzeTask')).not.toBeInTheDocument();
    });

    it('shows no results message when filter matches nothing', () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter="nonexistent"
          {...mockHandlers}
        />
      );

      expect(screen.getByText('No templates found')).toBeInTheDocument();
    });

    it('filter is case insensitive', () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter="PLANTASK"
          {...mockHandlers}
        />
      );

      expect(screen.getByText('planTask')).toBeInTheDocument();
    });

    it('filters by status', () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter="custom"
          {...mockHandlers}
        />
      );

      expect(screen.getByText('executeTask')).toBeInTheDocument();
      expect(screen.queryByText('planTask')).not.toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts by column when header clicked', async () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const functionHeader = screen.getByText('Function');
      
      // Click to sort ascending
      fireEvent.click(functionHeader);
      
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(within(rows[1]).getByText('analyzeTask')).toBeInTheDocument();
      });

      // Click again to sort descending
      fireEvent.click(functionHeader);
      
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        expect(within(rows[1]).getByText('verifyTask')).toBeInTheDocument();
      });
    });

    it('sorts by status correctly', async () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const statusHeader = screen.getByText('Status');
      fireEvent.click(statusHeader);

      await waitFor(() => {
        const statusBadges = screen.getAllByText(/Custom|Default/);
        // Check that sorting is applied
        expect(statusBadges.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Pagination', () => {
    const manyTemplates = Array.from({ length: 25 }, (_, i) => ({
      functionName: `template${i}`,
      description: `Template ${i} description`,
      status: i % 2 === 0 ? 'default' : 'custom',
      source: 'built-in',
      contentLength: 1000 + i,
      category: 'Task Management'
    }));

    it('displays pagination controls when data exceeds page size', () => {
      render(
        <TemplateManagement 
          data={manyTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      expect(screen.getByText(/Showing \d+ to \d+ of \d+ templates/)).toBeInTheDocument();
      expect(screen.getByText('<<')).toBeInTheDocument();
      expect(screen.getByText('<')).toBeInTheDocument();
      expect(screen.getByText('>')).toBeInTheDocument();
      expect(screen.getByText('>>')).toBeInTheDocument();
    });

    it('navigates between pages correctly', async () => {
      render(
        <TemplateManagement 
          data={manyTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      // Initially on page 1
      expect(screen.getByText('template0')).toBeInTheDocument();
      expect(screen.queryByText('template15')).not.toBeInTheDocument();

      // Go to next page
      const nextButton = screen.getByText('>');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.queryByText('template0')).not.toBeInTheDocument();
        expect(screen.getByText('template15')).toBeInTheDocument();
      });
    });

    it('disables navigation buttons appropriately', () => {
      render(
        <TemplateManagement 
          data={manyTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      // On first page, previous buttons should be disabled
      expect(screen.getByText('<<')).toBeDisabled();
      expect(screen.getByText('<')).toBeDisabled();
      expect(screen.getByText('>')).not.toBeDisabled();
      expect(screen.getByText('>>')).not.toBeDisabled();
    });
  });

  describe('Export Functionality', () => {
    beforeEach(() => {
      mockHandlers.onExportTemplates.mockResolvedValue('# Mock export content\nMCP_PROMPT_PLAN_TASK="content"');
    });

    it('opens export modal when export button is clicked', async () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const exportButton = screen.getByText('📤 Export Templates');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Template Configurations')).toBeInTheDocument();
        expect(screen.getByText('.env file (Environment Variables)')).toBeInTheDocument();
        expect(screen.getByText('mcp.json (MCP Configuration)')).toBeInTheDocument();
      });

      expect(mockHandlers.onExportTemplates).toHaveBeenCalledWith('env', true, true);
    });

    it('closes export modal when close button is clicked', async () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const exportButton = screen.getByText('📤 Export Templates');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Template Configurations')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('Export Template Configurations')).not.toBeInTheDocument();
      });
    });

    it('changes export format when radio button is selected', async () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const exportButton = screen.getByText('📤 Export Templates');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Template Configurations')).toBeInTheDocument();
      });

      const mcpJsonRadio = screen.getByLabelText('mcp.json (MCP Configuration)');
      fireEvent.click(mcpJsonRadio);

      await waitFor(() => {
        expect(mockHandlers.onExportTemplates).toHaveBeenCalledWith('mcp.json', true, true);
      });
    });

    it('toggles custom only checkbox', async () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const exportButton = screen.getByText('📤 Export Templates');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Template Configurations')).toBeInTheDocument();
      });

      const customOnlyCheckbox = screen.getByLabelText('Export only modified templates (recommended)');
      fireEvent.click(customOnlyCheckbox);

      await waitFor(() => {
        expect(mockHandlers.onExportTemplates).toHaveBeenCalledWith('env', false, true);
      });
    });

    it('copies preview content to clipboard', async () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const exportButton = screen.getByText('📤 Export Templates');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Template Configurations')).toBeInTheDocument();
      });

      const copyButton = screen.getByText('📋 Copy');
      fireEvent.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('# Mock export content\nMCP_PROMPT_PLAN_TASK="content"');
    });

    it('downloads export when download button is clicked', async () => {
      render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      const exportButton = screen.getByText('📤 Export Templates');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Export Template Configurations')).toBeInTheDocument();
      });

      const downloadButton = screen.getByText('💾 Download');
      fireEvent.click(downloadButton);

      expect(mockHandlers.onExportTemplates).toHaveBeenCalledWith('env', true, false);
    });

    it('disables export button when loading or no data', () => {
      render(
        <TemplateManagement 
          data={[]}
          globalFilter=""
          loading={true}
          {...mockHandlers}
        />
      );

      const exportButton = screen.getByText('📤 Export Templates');
      expect(exportButton).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles templates with missing fields', () => {
      const incompleteTemplate = {
        functionName: 'incompleteTemplate',
        // Missing other fields
      };

      render(
        <TemplateManagement 
          data={[incompleteTemplate]}
          globalFilter=""
          {...mockHandlers}
        />
      );

      expect(screen.getByText('incompleteTemplate')).toBeInTheDocument();
    });

    it('handles very large datasets efficiently', () => {
      const largeTemplates = Array.from({ length: 1000 }, (_, i) => ({
        functionName: `template${i}`,
        description: `Template ${i}`,
        status: 'default',
        source: 'built-in',
        contentLength: 1000,
        category: 'Task Management'
      }));

      const { container } = render(
        <TemplateManagement 
          data={largeTemplates}
          globalFilter=""
          {...mockHandlers}
        />
      );

      // Should only render visible rows (15 by default)
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(15);
    });

    it('preserves filter when data updates', () => {
      const { rerender } = render(
        <TemplateManagement 
          data={mockTemplates}
          globalFilter="planTask"
          {...mockHandlers}
        />
      );

      expect(screen.getByText('planTask')).toBeInTheDocument();

      // Update with new data
      const newTemplates = [...mockTemplates, {
        functionName: 'newPlanTask',
        description: 'Another plan task',
        status: 'custom',
        source: 'user-custom',
        contentLength: 2000,
        category: 'Task Management'
      }];

      rerender(
        <TemplateManagement 
          data={newTemplates}
          globalFilter="planTask"
          {...mockHandlers}
        />
      );

      // Both plan tasks should be visible
      expect(screen.getByText('planTask')).toBeInTheDocument();
      expect(screen.getByText('newPlanTask')).toBeInTheDocument();
    });
  });
});