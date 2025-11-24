import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Grid } from './Grid';
import type { GridConfig } from '../../types/grid';
import type { FurnitureTemplate } from '../../types/furniture';

const mockConfig: GridConfig = {
  cellSize: 20,
  width: 800,
  height: 600,
  inchesPerCell: 12,
  gridColor: '#ddd',
  backgroundColor: '#fff',
};

const mockTemplates: FurnitureTemplate[] = [
  { id: '1', name: 'Chair', width: 24, height: 24, color: '#4A90E2' },
  { id: '2', name: 'Table', width: 48, height: 36, color: '#50C878' },
];

describe('Grid Pan/Zoom', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render canvas with correct dimensions', () => {
    render(
      <Grid
        config={mockConfig}
        lines={[]}
        furniture={[]}
        furnitureTemplates={mockTemplates}
        mode="select"
        onLineAdd={vi.fn()}
        onLineEdit={vi.fn()}
        onLineSelect={vi.fn()}
        onFurnitureAdd={vi.fn()}
        onFurnitureSelect={vi.fn()}
        onFurnitureMove={vi.fn()}
      />
    );

    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();
    expect(canvas?.getAttribute('width')).toBe('800');
    expect(canvas?.getAttribute('height')).toBe('600');
  });

  it('should notify parent of zoom changes', () => {
    const onZoomChange = vi.fn();

    render(
      <Grid
        config={mockConfig}
        lines={[]}
        furniture={[]}
        furnitureTemplates={mockTemplates}
        mode="select"
        onLineAdd={vi.fn()}
        onLineEdit={vi.fn()}
        onLineSelect={vi.fn()}
        onFurnitureAdd={vi.fn()}
        onFurnitureSelect={vi.fn()}
        onFurnitureMove={vi.fn()}
        onZoomChange={onZoomChange}
      />
    );

    const canvas = document.querySelector('canvas')!;

    // Simulate zoom in (wheel up)
    const wheelEvent = new WheelEvent('wheel', {
      deltaY: -100,
      clientX: 400,
      clientY: 300,
      bubbles: true,
    });
    canvas.dispatchEvent(wheelEvent);

    // onZoomChange should be called with new zoom level
    expect(onZoomChange).toHaveBeenCalled();
  });

  it('should handle zoom limits (min 0.1, max 5)', () => {
    const onZoomChange = vi.fn();

    render(
      <Grid
        config={mockConfig}
        lines={[]}
        furniture={[]}
        furnitureTemplates={mockTemplates}
        mode="select"
        onLineAdd={vi.fn()}
        onLineEdit={vi.fn()}
        onLineSelect={vi.fn()}
        onFurnitureAdd={vi.fn()}
        onFurnitureSelect={vi.fn()}
        onFurnitureMove={vi.fn()}
        onZoomChange={onZoomChange}
      />
    );

    const canvas = document.querySelector('canvas')!;

    // Extreme zoom in attempts
    for (let i = 0; i < 50; i++) {
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100,
        clientX: 400,
        clientY: 300,
        bubbles: true,
      });
      canvas.dispatchEvent(wheelEvent);
    }

    // Should never exceed max zoom of 5
    const zoomCalls = onZoomChange.mock.calls.map(call => call[0]);
    const maxZoom = Math.max(...zoomCalls);
    expect(maxZoom).toBeLessThanOrEqual(5);
  });

  it('should render with lines and furniture without errors', () => {
    // This test verifies that viewport transforms don't break rendering
    render(
      <Grid
        config={mockConfig}
        lines={[
          {
            id: '1',
            start: { x: 0, y: 0 },
            end: { x: 100, y: 100 },
            type: 'wall',
            thickness: 3,
            color: '#000',
          },
        ]}
        furniture={[
          {
            id: '1',
            templateId: '1',
            position: { x: 200, y: 200 },
            rotation: 0,
          },
        ]}
        furnitureTemplates={mockTemplates}
        mode="select"
        onLineAdd={vi.fn()}
        onLineEdit={vi.fn()}
        onLineSelect={vi.fn()}
        onFurnitureAdd={vi.fn()}
        onFurnitureSelect={vi.fn()}
        onFurnitureMove={vi.fn()}
      />
    );

    // Canvas should be rendered with lines and furniture
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeTruthy();

    // The actual rendering with transforms is handled by the canvas API
    // This test ensures no runtime errors occur with viewport transforms
  });

  it('should notify line length changes during drawing', () => {
    const onCurrentLineLengthChange = vi.fn();
    const onLineAdd = vi.fn();

    render(
      <Grid
        config={mockConfig}
        lines={[]}
        furniture={[]}
        furnitureTemplates={mockTemplates}
        mode="draw"
        onLineAdd={onLineAdd}
        onLineEdit={vi.fn()}
        onLineSelect={vi.fn()}
        onFurnitureAdd={vi.fn()}
        onFurnitureSelect={vi.fn()}
        onFurnitureMove={vi.fn()}
        onCurrentLineLengthChange={onCurrentLineLengthChange}
      />
    );

    const canvas = document.querySelector('canvas')!;

    // Start drawing a line
    const mouseDownEvent = new MouseEvent('mousedown', {
      clientX: 100,
      clientY: 100,
      bubbles: true,
    });
    canvas.dispatchEvent(mouseDownEvent);

    // Move mouse to create line preview
    const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: 200,
      clientY: 100,
      bubbles: true,
    });
    canvas.dispatchEvent(mouseMoveEvent);

    // Should have called onCurrentLineLengthChange with line length
    expect(onCurrentLineLengthChange).toHaveBeenCalled();
  });
});

