import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ArchiveModal from './ArchiveModal';

describe('ArchiveModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    projectName: 'Test Project',
    tasks: [
      { id: '1', name: 'Task 1', status: 'completed' },
      { id: '2', name: 'Task 2', status: 'in_progress' },
      { id: '3', name: 'Task 3', status: 'pending' }
    ],
    initialRequest: 'This is a test initial request'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<ArchiveModal {...mockProps} />);
      
      expect(screen.getByText(/Archive Current Tasks/i)).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ArchiveModal {...mockProps} isOpen={false} />);
      
      expect(screen.queryByText(/Archive Current Tasks/i)).not.toBeInTheDocument();
    });

    it('should display project information', () => {
      render(<ArchiveModal {...mockProps} />);
      
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      
      // Check for total tasks
      expect(screen.getByText((content, element) => {
        return element?.textContent === '3' && 
               element?.parentElement?.textContent?.includes('Total Tasks');
      })).toBeInTheDocument();
      
      // Check for completed tasks count
      expect(screen.getByText((content, element) => {
        return element?.textContent === '1' && 
               element?.parentElement?.textContent?.includes('Completed');
      })).toBeInTheDocument();
    });

    it('should display initial request if provided', () => {
      render(<ArchiveModal {...mockProps} />);
      
      expect(screen.getByText('This is a test initial request')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when Cancel button is clicked', () => {
      render(<ArchiveModal {...mockProps} />);
      
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      
      expect(mockProps.onClose).toHaveBeenCalledOnce();
    });

    it('should call onConfirm and onClose when Continue button is clicked', () => {
      render(<ArchiveModal {...mockProps} />);
      
      const continueButton = screen.getByText('Continue');
      fireEvent.click(continueButton);
      
      expect(mockProps.onConfirm).toHaveBeenCalledOnce();
      expect(mockProps.onClose).toHaveBeenCalledOnce();
    });

    it('should close modal when clicking overlay', () => {
      render(<ArchiveModal {...mockProps} />);
      
      const overlay = screen.getByTestId('archive-modal-overlay');
      fireEvent.click(overlay);
      
      expect(mockProps.onClose).toHaveBeenCalledOnce();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tasks array', () => {
      render(<ArchiveModal {...mockProps} tasks={[]} />);
      
      // Check for zero total tasks
      expect(screen.getByText((content, element) => {
        return element?.textContent === '0' && 
               element?.parentElement?.textContent?.includes('Total Tasks');
      })).toBeInTheDocument();
      
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeDisabled();
    });

    it('should handle missing initial request', () => {
      render(<ArchiveModal {...mockProps} initialRequest="" />);
      
      // Should not crash and should not show Initial Request section
      expect(screen.queryByText('Initial Request')).not.toBeInTheDocument();
    });
  });
});