import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from './Toolbar';

describe('Toolbar', () => {
  const defaultProps = {
    selectedTool: 'select' as const,
    selectedLineType: 'wall' as const,
    onToolChange: vi.fn(),
    onLineTypeChange: vi.fn(),
    onClear: vi.fn(),
    onExport: vi.fn(),
    onImport: vi.fn(),
    gridScale: 12,
    zoomLevel: 1.0,
    gridAlignedMode: true,
    onGridAlignedModeChange: vi.fn(),
  };

  it('renders all action buttons', () => {
    render(<Toolbar {...defaultProps} />);
    
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('renders all tool buttons', () => {
    render(<Toolbar {...defaultProps} />);
    
    expect(screen.getByText('Draw Line')).toBeInTheDocument();
    expect(screen.getByText('Furniture')).toBeInTheDocument();
    expect(screen.getByText('Select')).toBeInTheDocument();
  });

  it('highlights the selected tool', () => {
    render(<Toolbar {...defaultProps} selectedTool="line" />);
    
    const lineButton = screen.getByText('Draw Line');
    expect(lineButton).toHaveClass('active');
  });

  it('calls onToolChange when tool button is clicked', () => {
    const onToolChange = vi.fn();
    render(<Toolbar {...defaultProps} onToolChange={onToolChange} />);
    
    fireEvent.click(screen.getByText('Draw Line'));
    expect(onToolChange).toHaveBeenCalledWith('line');
  });

  it('calls onClear when Reset button is clicked', () => {
    const onClear = vi.fn();
    render(<Toolbar {...defaultProps} onClear={onClear} />);
    
    fireEvent.click(screen.getByText('Reset'));
    expect(onClear).toHaveBeenCalled();
  });

  it('calls onExport when Export button is clicked', () => {
    const onExport = vi.fn();
    render(<Toolbar {...defaultProps} onExport={onExport} />);
    
    fireEvent.click(screen.getByText('Export'));
    expect(onExport).toHaveBeenCalled();
  });

  it('shows line type section only when line tool is selected', () => {
    const { rerender } = render(<Toolbar {...defaultProps} selectedTool="select" />);
    
    expect(screen.queryByText('Wall')).not.toBeInTheDocument();
    
    rerender(<Toolbar {...defaultProps} selectedTool="line" />);
    
    expect(screen.getByText('Wall')).toBeInTheDocument();
    expect(screen.getByText('Door')).toBeInTheDocument();
    expect(screen.getByText('Window')).toBeInTheDocument();
  });

  it('highlights the selected line type', () => {
    render(<Toolbar {...defaultProps} selectedTool="line" selectedLineType="door" />);
    
    const doorButton = screen.getByText('Door');
    expect(doorButton).toHaveClass('active');
  });

  it('calls onLineTypeChange when line type button is clicked', () => {
    const onLineTypeChange = vi.fn();
    render(<Toolbar {...defaultProps} selectedTool="line" onLineTypeChange={onLineTypeChange} />);
    
    fireEvent.click(screen.getByText('Window'));
    expect(onLineTypeChange).toHaveBeenCalledWith('window');
  });

  it('displays grid scale', () => {
    render(<Toolbar {...defaultProps} gridScale={24} />);
    
    expect(screen.getByText('24" per square')).toBeInTheDocument();
  });

  it('displays zoom level as percentage', () => {
    render(<Toolbar {...defaultProps} zoomLevel={1.5} />);
    
    expect(screen.getByText('Zoom: 150%')).toBeInTheDocument();
  });

  it('renders snap to grid checkbox', () => {
    render(<Toolbar {...defaultProps} />);
    
    expect(screen.getByText('Snap to Grid')).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox', { name: /snap to grid/i });
    expect(checkbox).toBeInTheDocument();
  });

  it('reflects grid aligned mode state in checkbox', () => {
    const { rerender } = render(<Toolbar {...defaultProps} gridAlignedMode={true} />);
    
    let checkbox = screen.getByRole('checkbox', { name: /snap to grid/i });
    expect(checkbox).toBeChecked();
    
    rerender(<Toolbar {...defaultProps} gridAlignedMode={false} />);
    
    checkbox = screen.getByRole('checkbox', { name: /snap to grid/i });
    expect(checkbox).not.toBeChecked();
  });

  it('calls onGridAlignedModeChange when checkbox is toggled', () => {
    const onGridAlignedModeChange = vi.fn();
    render(<Toolbar {...defaultProps} onGridAlignedModeChange={onGridAlignedModeChange} />);
    
    const checkbox = screen.getByRole('checkbox', { name: /snap to grid/i });
    fireEvent.click(checkbox);
    
    expect(onGridAlignedModeChange).toHaveBeenCalledWith(false);
  });

  describe('Line length editing', () => {
    it('does not show length section when no line is selected', () => {
      render(<Toolbar {...defaultProps} />);
      
      expect(screen.queryByText(/Length:/)).not.toBeInTheDocument();
    });

    it('shows length display when a line is selected', () => {
      render(<Toolbar {...defaultProps} currentLineLength={120.5} />);
      
      expect(screen.getByText('Length: 120.5"')).toBeInTheDocument();
    });

    it('switches to edit mode when length is clicked', () => {
      render(<Toolbar {...defaultProps} currentLineLength={120.5} />);
      
      const lengthDisplay = screen.getByText('Length: 120.5"');
      fireEvent.click(lengthDisplay);
      
      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(120.5);
    });

    it('calls onLineLengthChange with new value on Enter', () => {
      const onLineLengthChange = vi.fn();
      render(<Toolbar {...defaultProps} currentLineLength={120.5} onLineLengthChange={onLineLengthChange} />);
      
      const lengthDisplay = screen.getByText('Length: 120.5"');
      fireEvent.click(lengthDisplay);
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '150.0' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(onLineLengthChange).toHaveBeenCalledWith(150.0);
    });

    it('calls onLineLengthChange on blur', () => {
      const onLineLengthChange = vi.fn();
      render(<Toolbar {...defaultProps} currentLineLength={120.5} onLineLengthChange={onLineLengthChange} />);
      
      const lengthDisplay = screen.getByText('Length: 120.5"');
      fireEvent.click(lengthDisplay);
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '100.0' } });
      fireEvent.blur(input);
      
      expect(onLineLengthChange).toHaveBeenCalledWith(100.0);
    });

    it('cancels editing on Escape without calling onLineLengthChange', () => {
      const onLineLengthChange = vi.fn();
      render(<Toolbar {...defaultProps} currentLineLength={120.5} onLineLengthChange={onLineLengthChange} />);
      
      const lengthDisplay = screen.getByText('Length: 120.5"');
      fireEvent.click(lengthDisplay);
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '150.0' } });
      fireEvent.keyDown(input, { key: 'Escape' });
      
      expect(onLineLengthChange).not.toHaveBeenCalled();
      expect(screen.getByText('Length: 120.5"')).toBeInTheDocument();
    });

    it('does not call onLineLengthChange for invalid input', () => {
      const onLineLengthChange = vi.fn();
      render(<Toolbar {...defaultProps} currentLineLength={120.5} onLineLengthChange={onLineLengthChange} />);
      
      const lengthDisplay = screen.getByText('Length: 120.5"');
      fireEvent.click(lengthDisplay);
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: 'invalid' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(onLineLengthChange).not.toHaveBeenCalled();
    });

    it('does not call onLineLengthChange for negative values', () => {
      const onLineLengthChange = vi.fn();
      render(<Toolbar {...defaultProps} currentLineLength={120.5} onLineLengthChange={onLineLengthChange} />);
      
      const lengthDisplay = screen.getByText('Length: 120.5"');
      fireEvent.click(lengthDisplay);
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '-10' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(onLineLengthChange).not.toHaveBeenCalled();
    });

    it('does not call onLineLengthChange for zero', () => {
      const onLineLengthChange = vi.fn();
      render(<Toolbar {...defaultProps} currentLineLength={120.5} onLineLengthChange={onLineLengthChange} />);
      
      const lengthDisplay = screen.getByText('Length: 120.5"');
      fireEvent.click(lengthDisplay);
      
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '0' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(onLineLengthChange).not.toHaveBeenCalled();
    });
  });

  describe('File import', () => {
    it('calls onImport with selected file', () => {
      const onImport = vi.fn();
      render(<Toolbar {...defaultProps} onImport={onImport} />);
      
      const file = new File(['{}'], 'layout.json', { type: 'application/json' });
      const input = screen.getByText('Import').querySelector('input[type="file"]');
      
      expect(input).toBeInTheDocument();
      
      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
        expect(onImport).toHaveBeenCalledWith(file);
      }
    });

    it('does not call onImport if no file selected', () => {
      const onImport = vi.fn();
      render(<Toolbar {...defaultProps} onImport={onImport} />);
      
      const input = screen.getByText('Import').querySelector('input[type="file"]');
      
      if (input) {
        fireEvent.change(input, { target: { files: [] } });
        expect(onImport).not.toHaveBeenCalled();
      }
    });
  });
});
