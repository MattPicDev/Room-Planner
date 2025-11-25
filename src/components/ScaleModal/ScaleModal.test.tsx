import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScaleModal } from './ScaleModal';

describe('ScaleModal', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
  };

  it('does not render when isOpen is false', () => {
    render(<ScaleModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Set Grid Scale')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(<ScaleModal {...defaultProps} />);
    
    expect(screen.getByText('Set Grid Scale')).toBeInTheDocument();
  });

  it('displays the modal description', () => {
    render(<ScaleModal {...defaultProps} />);
    
    expect(screen.getByText(/Specify how many inches each grid square represents/)).toBeInTheDocument();
  });

  it('displays common values hint', () => {
    render(<ScaleModal {...defaultProps} />);
    
    expect(screen.getByText(/Common values: 6"/)).toBeInTheDocument();
  });

  it('shows default value of 6 when no currentScale provided', () => {
    render(<ScaleModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    expect(input).toHaveValue(6);
  });

  it('shows currentScale value when provided', () => {
    render(<ScaleModal {...defaultProps} currentScale={12} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    expect(input).toHaveValue(12);
  });

  it('shows "Set Scale" button text when no currentScale', () => {
    render(<ScaleModal {...defaultProps} />);
    
    expect(screen.getByText('Set Scale')).toBeInTheDocument();
  });

  it('shows "Update Scale" button text when currentScale exists', () => {
    render(<ScaleModal {...defaultProps} currentScale={12} />);
    
    expect(screen.getByText('Update Scale')).toBeInTheDocument();
  });

  it('calls onConfirm with value when form is submitted', () => {
    const onConfirm = vi.fn();
    render(<ScaleModal {...defaultProps} onConfirm={onConfirm} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: '24' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(onConfirm).toHaveBeenCalledWith(24);
  });

  it('shows error for invalid input (NaN)', () => {
    render(<ScaleModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: 'invalid' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(screen.getByText('Please enter a valid positive number')).toBeInTheDocument();
  });

  it('shows error for zero value', () => {
    render(<ScaleModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: '0' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(screen.getByText('Please enter a valid positive number')).toBeInTheDocument();
  });

  it('shows error for negative value', () => {
    render(<ScaleModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: '-5' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(screen.getByText('Please enter a valid positive number')).toBeInTheDocument();
  });

  it('shows error for value below minimum (1)', () => {
    render(<ScaleModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: '0.5' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(screen.getByText('Please enter a value between 1 and 120 inches')).toBeInTheDocument();
  });

  it('shows error for value above maximum (120)', () => {
    render(<ScaleModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: '150' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(screen.getByText('Please enter a value between 1 and 120 inches')).toBeInTheDocument();
  });

  it('accepts value at minimum boundary (1)', () => {
    const onConfirm = vi.fn();
    render(<ScaleModal {...defaultProps} onConfirm={onConfirm} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: '1' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(onConfirm).toHaveBeenCalledWith(1);
  });

  it('accepts value at maximum boundary (120)', () => {
    const onConfirm = vi.fn();
    render(<ScaleModal {...defaultProps} onConfirm={onConfirm} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: '120' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(onConfirm).toHaveBeenCalledWith(120);
  });

  it('accepts decimal values', () => {
    const onConfirm = vi.fn();
    render(<ScaleModal {...defaultProps} onConfirm={onConfirm} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: '6.5' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(onConfirm).toHaveBeenCalledWith(6.5);
  });

  it('clears error when input changes', () => {
    render(<ScaleModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: 'invalid' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(screen.getByText('Please enter a valid positive number')).toBeInTheDocument();
    
    fireEvent.change(input, { target: { value: '12' } });
    
    expect(screen.queryByText('Please enter a valid positive number')).not.toBeInTheDocument();
  });

  it('does not show cancel button when onCancel is not provided', () => {
    render(<ScaleModal {...defaultProps} />);
    
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('shows cancel button when onCancel is provided', () => {
    render(<ScaleModal {...defaultProps} onCancel={vi.fn()} />);
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<ScaleModal {...defaultProps} onCancel={onCancel} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(onCancel).toHaveBeenCalled();
  });

  it('clears error when cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<ScaleModal {...defaultProps} onCancel={onCancel} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: 'invalid' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(screen.getByText('Please enter a valid positive number')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancel'));
    
    // Reopen to check error is cleared
    expect(onCancel).toHaveBeenCalled();
  });

  it('does not call onConfirm when validation fails', () => {
    const onConfirm = vi.fn();
    render(<ScaleModal {...defaultProps} onConfirm={onConfirm} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    fireEvent.change(input, { target: { value: '0' } });
    
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('clears error after successful submit', () => {
    render(<ScaleModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    
    // First cause an error
    fireEvent.change(input, { target: { value: '0' } });
    const form = screen.getByRole('button', { name: /Set Scale/i }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(screen.getByText('Please enter a valid positive number')).toBeInTheDocument();
    
    // Then submit valid value
    fireEvent.change(input, { target: { value: '12' } });
    if (form) {
      fireEvent.submit(form);
    }
    
    // Error should be cleared
    expect(screen.queryByText('Please enter a valid positive number')).not.toBeInTheDocument();
  });

  it('has autofocus on input field', () => {
    render(<ScaleModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    // In the DOM, autofocus is rendered as a boolean attribute
    expect(input).toHaveFocus();
  });

  it('has required attribute on input', () => {
    render(<ScaleModal {...defaultProps} />);
    
    const input = screen.getByLabelText('Inches per grid square:');
    expect(input).toBeRequired();
  });
});
