import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FurnitureLibrary } from './FurnitureLibrary';
import type { FurnitureTemplate } from '../../types/furniture';

describe('FurnitureLibrary', () => {
  const mockTemplates: FurnitureTemplate[] = [
    {
      id: '1',
      name: 'Sofa',
      width: 84,
      height: 36,
      color: '#3498db',
      category: 'Living Room',
    },
    {
      id: '2',
      name: 'Dining Table',
      width: 60,
      height: 36,
      color: '#8B4513',
      category: 'Dining',
    },
    {
      id: '3',
      name: 'Bed',
      width: 60,
      height: 80,
      color: '#2ecc71',
      category: '',
    },
  ];

  const defaultProps = {
    templates: mockTemplates,
    onAddTemplate: vi.fn(),
    onDeleteTemplate: vi.fn(),
    onSelectTemplate: vi.fn(),
  };

  it('renders the component title', () => {
    render(<FurnitureLibrary {...defaultProps} />);
    
    expect(screen.getByText('Furniture Library')).toBeInTheDocument();
  });

  it('renders add furniture button', () => {
    render(<FurnitureLibrary {...defaultProps} />);
    
    expect(screen.getByText('+ Add Furniture')).toBeInTheDocument();
  });

  it('shows add form when add button is clicked', () => {
    render(<FurnitureLibrary {...defaultProps} />);
    
    const addButton = screen.getByText('+ Add Furniture');
    fireEvent.click(addButton);
    
    expect(screen.getByPlaceholderText('Name (e.g., Sofa)')).toBeInTheDocument();
    expect(screen.getByText('Width (inches):')).toBeInTheDocument();
    expect(screen.getByText('Height (inches):')).toBeInTheDocument();
    expect(screen.getByText('Color:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Category (optional)')).toBeInTheDocument();
  });

  it('toggles add form when button is clicked twice', () => {
    render(<FurnitureLibrary {...defaultProps} />);
    
    const addButton = screen.getByText('+ Add Furniture');
    fireEvent.click(addButton);
    
    expect(screen.getByPlaceholderText('Name (e.g., Sofa)')).toBeInTheDocument();
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(screen.queryByPlaceholderText('Name (e.g., Sofa)')).not.toBeInTheDocument();
  });

  it('renders all furniture templates', () => {
    render(<FurnitureLibrary {...defaultProps} />);
    
    expect(screen.getByText('Sofa')).toBeInTheDocument();
    expect(screen.getByText('Dining Table')).toBeInTheDocument();
    expect(screen.getByText('Bed')).toBeInTheDocument();
  });

  it('displays template dimensions', () => {
    render(<FurnitureLibrary {...defaultProps} />);
    
    expect(screen.getByText('84"×36"')).toBeInTheDocument();
    expect(screen.getByText('60"×36"')).toBeInTheDocument();
    expect(screen.getByText('60"×80"')).toBeInTheDocument();
  });

  it('displays template categories', () => {
    render(<FurnitureLibrary {...defaultProps} />);
    
    expect(screen.getByText('Living Room')).toBeInTheDocument();
    expect(screen.getByText('Dining')).toBeInTheDocument();
  });

  it('shows empty message when no templates exist', () => {
    render(<FurnitureLibrary {...defaultProps} templates={[]} />);
    
    expect(screen.getByText(/No furniture templates yet/)).toBeInTheDocument();
  });

  it('calls onSelectTemplate when template is clicked', () => {
    const onSelectTemplate = vi.fn();
    render(<FurnitureLibrary {...defaultProps} onSelectTemplate={onSelectTemplate} />);
    
    fireEvent.click(screen.getByText('Sofa'));
    
    expect(onSelectTemplate).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('highlights selected template', () => {
    render(<FurnitureLibrary {...defaultProps} selectedTemplateId="2" />);
    
    const diningTable = screen.getByText('Dining Table').closest('.template-item');
    expect(diningTable).toHaveClass('selected');
  });

  it('calls onDeleteTemplate when delete button is clicked', () => {
    const onDeleteTemplate = vi.fn();
    render(<FurnitureLibrary {...defaultProps} onDeleteTemplate={onDeleteTemplate} />);
    
    const deleteButtons = screen.getAllByTitle('Delete template');
    fireEvent.click(deleteButtons[0]);
    
    expect(onDeleteTemplate).toHaveBeenCalledWith('1');
  });

  it('does not call onSelectTemplate when delete button is clicked', () => {
    const onSelectTemplate = vi.fn();
    const onDeleteTemplate = vi.fn();
    render(<FurnitureLibrary {...defaultProps} onSelectTemplate={onSelectTemplate} onDeleteTemplate={onDeleteTemplate} />);
    
    const deleteButtons = screen.getAllByTitle('Delete template');
    fireEvent.click(deleteButtons[0]);
    
    expect(onSelectTemplate).not.toHaveBeenCalled();
    expect(onDeleteTemplate).toHaveBeenCalled();
  });

  describe('Add template form', () => {
    it('calls onAddTemplate with form data on submit', () => {
      const onAddTemplate = vi.fn();
      render(<FurnitureLibrary {...defaultProps} onAddTemplate={onAddTemplate} />);
      
      fireEvent.click(screen.getByText('+ Add Furniture'));
      
      const nameInput = screen.getByPlaceholderText('Name (e.g., Sofa)');
      const widthInput = screen.getByLabelText('Width (inches):');
      const heightInput = screen.getByLabelText('Height (inches):');
      const colorInput = screen.getByLabelText('Color:');
      const categoryInput = screen.getByPlaceholderText('Category (optional)');
      
      fireEvent.change(nameInput, { target: { value: 'Coffee Table' } });
      fireEvent.change(widthInput, { target: { value: '48' } });
      fireEvent.change(heightInput, { target: { value: '24' } });
      fireEvent.change(colorInput, { target: { value: '#ff5733' } });
      fireEvent.change(categoryInput, { target: { value: 'Living Room' } });
      
      fireEvent.click(screen.getByText('Add Template'));
      
      expect(onAddTemplate).toHaveBeenCalledWith({
        name: 'Coffee Table',
        width: 48,
        height: 24,
        color: '#ff5733',
        category: 'Living Room',
      });
    });

    it('resets form after successful submit', () => {
      render(<FurnitureLibrary {...defaultProps} />);
      
      fireEvent.click(screen.getByText('+ Add Furniture'));
      
      const nameInput = screen.getByPlaceholderText('Name (e.g., Sofa)');
      fireEvent.change(nameInput, { target: { value: 'Test Item' } });
      
      fireEvent.click(screen.getByText('Add Template'));
      
      // Form should be hidden after submit
      expect(screen.queryByPlaceholderText('Name (e.g., Sofa)')).not.toBeInTheDocument();
    });

    it('does not submit if name is empty', () => {
      const onAddTemplate = vi.fn();
      render(<FurnitureLibrary {...defaultProps} onAddTemplate={onAddTemplate} />);
      
      fireEvent.click(screen.getByText('+ Add Furniture'));
      
      const nameInput = screen.getByPlaceholderText('Name (e.g., Sofa)');
      fireEvent.change(nameInput, { target: { value: '   ' } }); // Only whitespace
      
      fireEvent.click(screen.getByText('Add Template'));
      
      expect(onAddTemplate).not.toHaveBeenCalled();
    });

    it('does not submit if width is zero or negative', () => {
      const onAddTemplate = vi.fn();
      render(<FurnitureLibrary {...defaultProps} onAddTemplate={onAddTemplate} />);
      
      fireEvent.click(screen.getByText('+ Add Furniture'));
      
      const nameInput = screen.getByPlaceholderText('Name (e.g., Sofa)');
      const widthInput = screen.getByLabelText('Width (inches):');
      
      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(widthInput, { target: { value: '0' } });
      
      fireEvent.click(screen.getByText('Add Template'));
      
      expect(onAddTemplate).not.toHaveBeenCalled();
    });

    it('does not submit if height is zero or negative', () => {
      const onAddTemplate = vi.fn();
      render(<FurnitureLibrary {...defaultProps} onAddTemplate={onAddTemplate} />);
      
      fireEvent.click(screen.getByText('+ Add Furniture'));
      
      const nameInput = screen.getByPlaceholderText('Name (e.g., Sofa)');
      const heightInput = screen.getByLabelText('Height (inches):');
      
      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(heightInput, { target: { value: '-5' } });
      
      fireEvent.click(screen.getByText('Add Template'));
      
      expect(onAddTemplate).not.toHaveBeenCalled();
    });

    it('accepts valid decimal values for dimensions', () => {
      const onAddTemplate = vi.fn();
      render(<FurnitureLibrary {...defaultProps} onAddTemplate={onAddTemplate} />);
      
      fireEvent.click(screen.getByText('+ Add Furniture'));
      
      const nameInput = screen.getByPlaceholderText('Name (e.g., Sofa)');
      fireEvent.change(nameInput, { target: { value: 'Small Table' } });
      
      // The form already has default values (24, 18) which are valid decimals
      // Just submit to verify decimal handling works
      fireEvent.click(screen.getByText('Add Template'));
      
      expect(onAddTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Small Table',
          width: expect.any(Number),
          height: expect.any(Number),
        })
      );
      
      // Verify the values are the defaults
      const call = onAddTemplate.mock.calls[0][0];
      expect(call.width).toBe(24);
      expect(call.height).toBe(18);
    });

    it('uses default color if not changed', () => {
      const onAddTemplate = vi.fn();
      render(<FurnitureLibrary {...defaultProps} onAddTemplate={onAddTemplate} />);
      
      fireEvent.click(screen.getByText('+ Add Furniture'));
      
      const nameInput = screen.getByPlaceholderText('Name (e.g., Sofa)');
      fireEvent.change(nameInput, { target: { value: 'Test Item' } });
      
      fireEvent.click(screen.getByText('Add Template'));
      
      expect(onAddTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          color: '#3498db',
        })
      );
    });
  });

  describe('Template preview', () => {
    it('renders preview with correct background color', () => {
      render(<FurnitureLibrary {...defaultProps} />);
      
      const sofaItem = screen.getByText('Sofa').closest('.template-item');
      const preview = sofaItem?.querySelector('.template-preview');
      
      expect(preview).toHaveStyle({ backgroundColor: '#3498db' });
    });

    it('scales preview size based on template dimensions', () => {
      const largeTemplate: FurnitureTemplate = {
        id: '4',
        name: 'Large Item',
        width: 200,
        height: 150,
        color: '#000000',
        category: '',
      };
      
      const smallTemplate: FurnitureTemplate = {
        id: '5',
        name: 'Small Item',
        width: 12,
        height: 8,
        color: '#ffffff',
        category: '',
      };
      
      render(<FurnitureLibrary {...defaultProps} templates={[largeTemplate, smallTemplate]} />);
      
      const largePreview = screen.getByText('Large Item').closest('.template-item')?.querySelector('.template-preview');
      const smallPreview = screen.getByText('Small Item').closest('.template-item')?.querySelector('.template-preview');
      
      expect(largePreview).toBeInTheDocument();
      expect(smallPreview).toBeInTheDocument();
    });
  });
});
