import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TemplateEditor from '../components/TemplateEditor';

describe('TemplateEditor Component', () => {
  const mockTemplate = {
    functionName: 'planTask',
    name: 'planTask',
    content: '## Task Analysis\n\nYou must complete the following sub-steps:\n\n{description}\n{requirements}',
    status: 'default',
    source: 'built-in'
  };

  const mockHandlers = {
    onSave: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getBoundingClientRect for textarea positioning
    HTMLTextAreaElement.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 200,
      width: 400,
      height: 300
    }));
    
    // Mock getCaretCoordinates
    HTMLTextAreaElement.prototype.setSelectionRange = vi.fn();
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  describe('Rendering', () => {
    it('renders modal with correct title and content', () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Edit Template: planTask')).toBeInTheDocument();
      expect(screen.getByDisplayValue(/## Task Analysis/)).toBeInTheDocument();
    });

    it('renders mode selection toggles', () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      expect(screen.getByLabelText('Override Mode')).toBeInTheDocument();
      expect(screen.getByLabelText('Append Mode')).toBeInTheDocument();
      
      // Override should be selected by default
      expect(screen.getByLabelText('Override Mode')).toBeChecked();
      expect(screen.getByLabelText('Append Mode')).not.toBeChecked();
    });

    it('renders edit and preview toggle buttons', () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('✏️ Edit')).toBeInTheDocument();
      expect(screen.getByText('👁️ Preview')).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('💾 Save Template')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          loading={true}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByText('💾 Save Template').closest('button')).toBeDisabled();
    });

    it('shows error message', () => {
      const errorMessage = 'Failed to save template';
      
      render(
        <TemplateEditor 
          template={mockTemplate}
          error={errorMessage}
          {...mockHandlers}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Mode Selection', () => {
    it('switches to append mode when radio button is selected', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const appendModeRadio = screen.getByLabelText('Append Mode');
      fireEvent.click(appendModeRadio);

      expect(appendModeRadio).toBeChecked();
      expect(screen.getByLabelText('Override Mode')).not.toBeChecked();
    });

    it('shows correct mode description', () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      expect(screen.getByText(/Completely replace the existing template/)).toBeInTheDocument();
      
      const appendModeRadio = screen.getByLabelText('Append Mode');
      fireEvent.click(appendModeRadio);

      expect(screen.getByText(/Add content after the existing template/)).toBeInTheDocument();
    });
  });

  describe('Content Editing', () => {
    it('updates content when textarea value changes', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      await userEvent.clear(textarea);
      await userEvent.type(textarea, '## New Content\n{description}');

      expect(textarea.value).toBe('## New Content\n{description}');
    });

    it('validates content is not empty on save', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      await userEvent.clear(textarea);

      const saveButton = screen.getByText('💾 Save Template');
      fireEvent.click(saveButton);

      expect(screen.getByText('Template content cannot be empty')).toBeInTheDocument();
      expect(mockHandlers.onSave).not.toHaveBeenCalled();
    });

    it('calls onSave with correct data when save button is clicked', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      await userEvent.clear(textarea);
      await userEvent.type(textarea, '## Updated Content\n{description}');

      const saveButton = screen.getByText('💾 Save Template');
      fireEvent.click(saveButton);

      expect(mockHandlers.onSave).toHaveBeenCalledWith({
        functionName: 'planTask',
        content: '## Updated Content\n{description}',
        mode: 'override'
      });
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockHandlers.onCancel).toHaveBeenCalled();
    });

    it('calls onCancel when modal overlay is clicked', () => {
      const { container } = render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const overlay = container.querySelector('.modal-overlay');
      fireEvent.click(overlay);

      expect(mockHandlers.onCancel).toHaveBeenCalled();
    });

    it('does not call onCancel when modal content is clicked', () => {
      const { container } = render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const modalContent = container.querySelector('.modal-content');
      fireEvent.click(modalContent);

      expect(mockHandlers.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Preview Mode', () => {
    it('switches to preview mode when preview button is clicked', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const previewButton = screen.getByText('👁️ Preview');
      fireEvent.click(previewButton);

      await waitFor(() => {
        expect(screen.getByText('👁️ Preview')).toHaveClass('active');
        expect(screen.getByText('✏️ Edit')).not.toHaveClass('active');
      });

      // Should show syntax highlighted content
      expect(screen.getByText('## Task Analysis')).toBeInTheDocument();
    });

    it('switches back to edit mode when edit button is clicked', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const previewButton = screen.getByText('👁️ Preview');
      fireEvent.click(previewButton);

      const editButton = screen.getByText('✏️ Edit');
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('✏️ Edit')).toHaveClass('active');
        expect(screen.getByText('👁️ Preview')).not.toHaveClass('active');
      });

      // Should show textarea again
      expect(screen.getByDisplayValue(/## Task Analysis/)).toBeInTheDocument();
    });

    it('renders markdown content with syntax highlighting in preview', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const previewButton = screen.getByText('👁️ Preview');
      fireEvent.click(previewButton);

      await waitFor(() => {
        // SyntaxHighlighter should render the content
        const previewContent = document.querySelector('.token');
        expect(previewContent).toBeInTheDocument();
      });
    });
  });

  describe('Parameter Auto-Complete', () => {
    it('shows auto-complete when { is typed', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      
      // Position cursor and type {
      fireEvent.focus(textarea);
      fireEvent.change(textarea, { target: { value: mockTemplate.content + '\n{' } });
      fireEvent.keyDown(textarea, { key: '{' });

      await waitFor(() => {
        expect(screen.getByText('description')).toBeInTheDocument();
        expect(screen.getByText('requirements')).toBeInTheDocument();
        expect(screen.getByText('summary')).toBeInTheDocument();
      });
    });

    it('filters parameters based on function name', async () => {
      const planTaskTemplate = {
        ...mockTemplate,
        functionName: 'planTask'
      };

      render(
        <TemplateEditor 
          template={planTaskTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      
      fireEvent.focus(textarea);
      fireEvent.change(textarea, { target: { value: mockTemplate.content + '\n{' } });
      fireEvent.keyDown(textarea, { key: '{' });

      await waitFor(() => {
        // Should show planTask-specific parameters
        expect(screen.getByText('existingTasksReference')).toBeInTheDocument();
        expect(screen.getByText('completedTasks')).toBeInTheDocument();
        expect(screen.getByText('pendingTasks')).toBeInTheDocument();
      });
    });

    it('inserts parameter when clicked from auto-complete', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      
      fireEvent.focus(textarea);
      fireEvent.change(textarea, { target: { value: mockTemplate.content + '\n{' } });
      fireEvent.keyDown(textarea, { key: '{' });

      await waitFor(() => {
        expect(screen.getByText('description')).toBeInTheDocument();
      });

      const parameterOption = screen.getByText('description');
      fireEvent.click(parameterOption);

      // Should insert the parameter
      expect(textarea.value).toContain('{description}');
    });

    it('hides auto-complete when Escape is pressed', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      
      fireEvent.focus(textarea);
      fireEvent.change(textarea, { target: { value: mockTemplate.content + '\n{' } });
      fireEvent.keyDown(textarea, { key: '{' });

      await waitFor(() => {
        expect(screen.getByText('description')).toBeInTheDocument();
      });

      fireEvent.keyDown(textarea, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('description')).not.toBeInTheDocument();
      });
    });

    it('filters parameters as user types', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      
      fireEvent.focus(textarea);
      fireEvent.change(textarea, { target: { value: mockTemplate.content + '\n{desc' } });
      fireEvent.keyDown(textarea, { key: 'c' });

      await waitFor(() => {
        expect(screen.getByText('description')).toBeInTheDocument();
        expect(screen.queryByText('requirements')).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('saves on Ctrl+S', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      fireEvent.keyDown(textarea, { key: 's', ctrlKey: true });

      expect(mockHandlers.onSave).toHaveBeenCalledWith({
        functionName: 'planTask',
        content: mockTemplate.content,
        mode: 'override'
      });
    });

    it('cancels on Ctrl+Escape', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      fireEvent.keyDown(textarea, { key: 'Escape', ctrlKey: true });

      expect(mockHandlers.onCancel).toHaveBeenCalled();
    });

    it('toggles preview on Ctrl+P', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      fireEvent.keyDown(textarea, { key: 'p', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByText('👁️ Preview')).toHaveClass('active');
      });

      fireEvent.keyDown(document, { key: 'p', ctrlKey: true });

      await waitFor(() => {
        expect(screen.getByText('✏️ Edit')).toHaveClass('active');
      });
    });
  });

  describe('Parameter Helper', () => {
    it('displays parameter helper panel', () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Available Parameters')).toBeInTheDocument();
      expect(screen.getByText('Common Parameters')).toBeInTheDocument();
    });

    it('shows function-specific parameters', () => {
      const planTaskTemplate = {
        ...mockTemplate,
        functionName: 'planTask'
      };

      render(
        <TemplateEditor 
          template={planTaskTemplate}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('planTask Parameters')).toBeInTheDocument();
      expect(screen.getByText('{existingTasksReference}')).toBeInTheDocument();
      expect(screen.getByText('Whether to reference existing tasks')).toBeInTheDocument();
    });

    it('inserts parameter when clicked from helper panel', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      const descriptionParam = screen.getByText('{description}');
      
      fireEvent.focus(textarea);
      fireEvent.click(descriptionParam);

      await waitFor(() => {
        expect(textarea.value).toContain('{description}');
      });
    });
  });

  describe('Validation', () => {
    it('shows character count', () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const characterCount = screen.getByText(/\d+ characters/);
      expect(characterCount).toBeInTheDocument();
    });

    it('updates character count as user types', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      await userEvent.type(textarea, ' additional text');

      const characterCount = screen.getByText(/\d+ characters/);
      expect(characterCount).toBeInTheDocument();
    });

    it('shows validation message for empty content', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      await userEvent.clear(textarea);

      expect(screen.getByText('Template content cannot be empty')).toBeInTheDocument();
    });

    it('validates parameter syntax', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      await userEvent.clear(textarea);
      await userEvent.type(textarea, '## Test {unclosed_param');

      expect(screen.getByText('Warning: Unclosed parameter detected')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles template with no content', () => {
      const emptyTemplate = {
        ...mockTemplate,
        content: ''
      };

      render(
        <TemplateEditor 
          template={emptyTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea.value).toBe('');
    });

    it('handles template with special characters', () => {
      const specialTemplate = {
        ...mockTemplate,
        content: '## Test\n\n"Quotes" and \'apostrophes\' and {parameters} and $variables'
      };

      render(
        <TemplateEditor 
          template={specialTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Test/);
      expect(textarea.value).toContain("\"Quotes\" and 'apostrophes'");
    });

    it('handles very long content', () => {
      const longContent = 'Long content. '.repeat(1000);
      const longTemplate = {
        ...mockTemplate,
        content: longContent
      };

      render(
        <TemplateEditor 
          template={longTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/Long content/);
      expect(textarea.value.length).toBeGreaterThan(5000);
    });

    it('preserves textarea focus during auto-complete', async () => {
      render(
        <TemplateEditor 
          template={mockTemplate}
          {...mockHandlers}
        />
      );

      const textarea = screen.getByDisplayValue(/## Task Analysis/);
      
      fireEvent.focus(textarea);
      fireEvent.change(textarea, { target: { value: mockTemplate.content + '\n{' } });
      fireEvent.keyDown(textarea, { key: '{' });

      await waitFor(() => {
        expect(screen.getByText('description')).toBeInTheDocument();
      });

      expect(document.activeElement).toBe(textarea);
    });
  });
});