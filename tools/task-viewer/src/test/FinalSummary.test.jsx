import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FinalSummary from '../components/FinalSummary';

describe('FinalSummary Component', () => {
  const mockTasks = [
    {
      id: 'task-1',
      name: 'Setup authentication',
      status: 'completed',
      summary: 'Implemented OAuth2 with JWT tokens successfully'
    },
    {
      id: 'task-2', 
      name: 'Create user dashboard',
      status: 'completed',
      summary: 'Built responsive dashboard with task metrics'
    },
    {
      id: 'task-3',
      name: 'Add notifications',
      status: 'in_progress',
      summary: null
    }
  ];

  const mockProjectId = 'test-project';
  const mockOnSummaryGenerated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch for API calls
    global.fetch = vi.fn();
  });

  describe('Initial State', () => {
    it('renders collapsible section with generate button', () => {
      render(
        <FinalSummary 
          tasks={mockTasks}
          projectId={mockProjectId}
          onSummaryGenerated={mockOnSummaryGenerated}
        />
      );

      expect(screen.getByText('Summarize')).toBeInTheDocument();
      
      // Click to expand the section
      const header = screen.getByText('Summarize');
      fireEvent.click(header);
      
      expect(screen.getByRole('button', { name: /✨ Generate/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /🔄 Regenerate/ })).not.toBeInTheDocument();
    });

    it('shows expanded section when clicked', () => {
      render(
        <FinalSummary 
          tasks={mockTasks}
          projectId={mockProjectId}
          onSummaryGenerated={mockOnSummaryGenerated}
        />
      );

      const summaryHeader = screen.getByText('Summarize');
      fireEvent.click(summaryHeader);

      expect(screen.getByText('✨ Generate')).toBeVisible();
    });
  });

  describe('Summary Generation', () => {
    it('generates summary when generate button clicked', async () => {
      const mockSummary = 'Overall project completed successfully. Authentication system and user dashboard implemented.';
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ summary: mockSummary })
      });

      render(
        <FinalSummary 
          tasks={mockTasks}
          projectId={mockProjectId}
          onSummaryGenerated={mockOnSummaryGenerated}
        />
      );

      const summaryHeader = screen.getByText('Summarize');
      fireEvent.click(summaryHeader);
      
      const generateButton = screen.getByText('✨ Generate');
      fireEvent.click(generateButton);

      expect(screen.getByText('⏳ Generating...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText(mockSummary)).toBeInTheDocument();
      });

      expect(screen.getByText('🔄 Regenerate')).toBeInTheDocument();
      expect(screen.queryByText('✨ Generate')).not.toBeInTheDocument();
      expect(mockOnSummaryGenerated).toHaveBeenCalledWith(mockSummary);
    });

    it('handles generation errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('API Error'));

      render(
        <FinalSummary 
          tasks={mockTasks}
          projectId={mockProjectId}
          onSummaryGenerated={mockOnSummaryGenerated}
        />
      );

      const summaryHeader = screen.getByText('Summarize');
      fireEvent.click(summaryHeader);
      
      const generateButton = screen.getByText('✨ Generate');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to generate summary')).toBeInTheDocument();
      });

      expect(screen.getByText('✨ Generate')).toBeInTheDocument();
      expect(mockOnSummaryGenerated).not.toHaveBeenCalled();
    });

    it('only includes completed tasks with summaries', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ summary: 'Test summary' })
      });

      render(
        <FinalSummary 
          tasks={mockTasks}
          projectId={mockProjectId}
          onSummaryGenerated={mockOnSummaryGenerated}
        />
      );

      const summaryHeader = screen.getByText('Summarize');
      fireEvent.click(summaryHeader);
      
      const generateButton = screen.getByText('✨ Generate');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const fetchCall = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      // Should only include 2 completed tasks with summaries
      expect(requestBody.completedTasks).toHaveLength(2);
      expect(requestBody.completedTasks[0].summary).toBe('Implemented OAuth2 with JWT tokens successfully');
      expect(requestBody.completedTasks[1].summary).toBe('Built responsive dashboard with task metrics');
    });
  });

  describe('Existing Summary', () => {
    it('displays existing summary and shows regenerate button', () => {
      const existingSummary = 'Previously generated summary content';
      
      render(
        <FinalSummary 
          tasks={mockTasks}
          projectId={mockProjectId}
          onSummaryGenerated={mockOnSummaryGenerated}
          existingSummary={existingSummary}
        />
      );

      const summaryHeader = screen.getByText('Summarize');
      fireEvent.click(summaryHeader);
      
      expect(screen.getByText(existingSummary)).toBeInTheDocument();
      expect(screen.getByText('🔄 Regenerate')).toBeInTheDocument();
      expect(screen.queryByText('✨ Generate')).not.toBeInTheDocument();
    });

    it('regenerates summary when regenerate button clicked', async () => {
      const existingSummary = 'Old summary';
      const newSummary = 'New updated summary';
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ summary: newSummary })
      });

      render(
        <FinalSummary 
          tasks={mockTasks}
          projectId={mockProjectId}
          onSummaryGenerated={mockOnSummaryGenerated}
          existingSummary={existingSummary}
        />
      );

      const summaryHeader = screen.getByText('Summarize');
      fireEvent.click(summaryHeader);
      
      const regenerateButton = screen.getByText('🔄 Regenerate');
      fireEvent.click(regenerateButton);

      await waitFor(() => {
        expect(screen.getByText(newSummary)).toBeInTheDocument();
      });

      expect(screen.queryByText(existingSummary)).not.toBeInTheDocument();
      expect(mockOnSummaryGenerated).toHaveBeenCalledWith(newSummary);
    });
  });

  describe('Visual Design', () => {
    it('applies same styling as initial result area', () => {
      render(
        <FinalSummary 
          tasks={mockTasks}
          projectId={mockProjectId}
          onSummaryGenerated={mockOnSummaryGenerated}
        />
      );

      const summarySection = screen.getByTestId('summarize-section');
      expect(summarySection).toBeInTheDocument();
    });

    it('shows loading state during generation', async () => {
      // Create a promise that won't resolve to simulate loading
      let resolvePromise;
      const loadingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      global.fetch.mockReturnValueOnce(loadingPromise);

      render(
        <FinalSummary 
          tasks={mockTasks}
          projectId={mockProjectId}
          onSummaryGenerated={mockOnSummaryGenerated}
        />
      );

      const summaryHeader = screen.getByText('Summarize');
      fireEvent.click(summaryHeader);
      
      const generateButton = screen.getByText('✨ Generate');
      fireEvent.click(generateButton);

      expect(screen.getByText('⏳ Generating...')).toBeInTheDocument();
      expect(generateButton).toBeDisabled();
      
      // Clean up
      resolvePromise({ ok: true, json: () => Promise.resolve({ summary: 'test' }) });
    });
  });
});