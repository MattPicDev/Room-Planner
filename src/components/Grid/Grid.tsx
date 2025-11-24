import { useRef, useEffect, useState, useCallback } from 'react';
import type { GridConfig } from '../../types/grid';
import type { Line } from '../../types/line';
import { snapToGrid } from '../../utils/gridHelpers';
import { findLineAtPoint, findEndpointAtPoint } from '../../utils/lineHelpers';
import './Grid.css';

interface GridProps {
  config: GridConfig;
  lines: Line[];
  mode: 'draw' | 'select';
  onLineAdd?: (line: Line) => void;
  onLineEdit?: (lineId: string, updates: Partial<Line>) => void;
  onLineSelect?: (line: Line | null) => void;
  selectedLine?: Line | null;
}

export function Grid({ config, lines, mode, onLineAdd, onLineEdit, onLineSelect, selectedLine }: GridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingEndpoint, setIsDraggingEndpoint] = useState<'start' | 'end' | null>(null);

  // Draw the grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height, cellSize, gridColor, backgroundColor } = config;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [config]);

  // Draw all lines
  const drawLines = useCallback((ctx: CanvasRenderingContext2D) => {
    lines.forEach(line => {
      // Highlight selected line
      const isSelected = selectedLine?.id === line.id;
      ctx.strokeStyle = isSelected ? '#3498db' : line.color;
      ctx.lineWidth = isSelected ? line.thickness + 2 : line.thickness;
      
      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.stroke();
      
      // Draw endpoints for selected line
      if (isSelected) {
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(line.start.x, line.start.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(line.end.x, line.end.y, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [lines, selectedLine]);

  // Draw preview line while drawing
  const drawPreview = useCallback((ctx: CanvasRenderingContext2D) => {
    if (startPoint && currentPoint) {
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [startPoint, currentPoint]);

  // Main render effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGrid(ctx);
    drawLines(ctx);
    drawPreview(ctx);
  }, [drawGrid, drawLines, drawPreview]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = { x, y };
    const snapped = snapToGrid(point, config.cellSize);

    if (mode === 'select') {
      // Check if clicking on selected line's endpoint
      if (selectedLine) {
        const endpoint = findEndpointAtPoint(point, selectedLine, 15);
        if (endpoint) {
          setIsDraggingEndpoint(endpoint);
          setStartPoint(endpoint === 'start' ? selectedLine.end : selectedLine.start);
          setCurrentPoint(snapped);
          return;
        }
      }
      
      // Check if clicking on any line
      const clickedLine = findLineAtPoint(point, lines);
      if (clickedLine) {
        onLineSelect?.(clickedLine);
      } else {
        onLineSelect?.(null);
      }
    } else if (mode === 'draw') {
      setIsDrawing(true);
      setStartPoint(snapped);
      setCurrentPoint(snapped);
    }
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snapped = snapToGrid({ x, y }, config.cellSize);

    // Update cursor based on hover state
    if (mode === 'select' && !isDrawing && !isDraggingEndpoint) {
      const point = { x, y };
      if (selectedLine && findEndpointAtPoint(point, selectedLine, 15)) {
        canvas.style.cursor = 'move';
      } else if (findLineAtPoint(point, lines)) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = 'default';
      }
    } else if (mode === 'draw') {
      canvas.style.cursor = 'crosshair';
    }

    // Handle dragging endpoint
    if (isDraggingEndpoint && selectedLine && startPoint && onLineEdit) {
      // Constrain to horizontal or vertical
      const dx = Math.abs(snapped.x - startPoint.x);
      const dy = Math.abs(snapped.y - startPoint.y);
      
      const constrainedPoint = dx > dy
        ? { x: snapped.x, y: startPoint.y }
        : { x: startPoint.x, y: snapped.y };
      
      setCurrentPoint(constrainedPoint);
      return;
    }

    // Handle drawing new line
    if (isDrawing && mode === 'draw') {
      if (startPoint) {
        // Constrain to horizontal or vertical
        const dx = Math.abs(snapped.x - startPoint.x);
        const dy = Math.abs(snapped.y - startPoint.y);

        if (dx > dy) {
          setCurrentPoint({ x: snapped.x, y: startPoint.y });
        } else {
          setCurrentPoint({ x: startPoint.x, y: snapped.y });
        }
      }
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    // Handle endpoint dragging
    if (isDraggingEndpoint && selectedLine && currentPoint && startPoint && onLineEdit) {
      // Only update if the line has length
      if (currentPoint.x !== startPoint.x || currentPoint.y !== startPoint.y) {
        const updates: Partial<Line> = isDraggingEndpoint === 'start'
          ? { start: currentPoint, end: startPoint }
          : { start: startPoint, end: currentPoint };
        
        onLineEdit(selectedLine.id, updates);
      }
      setIsDraggingEndpoint(null);
      setStartPoint(null);
      setCurrentPoint(null);
      return;
    }

    // Handle drawing new line
    if (isDrawing && startPoint && currentPoint && onLineAdd && mode === 'draw') {
      // Only add line if it has length
      if (startPoint.x !== currentPoint.x || startPoint.y !== currentPoint.y) {
        const newLine: Line = {
          id: crypto.randomUUID(),
          start: startPoint,
          end: currentPoint,
          type: 'wall',
          thickness: 4,
          color: '#000000',
        };
        onLineAdd(newLine);
      }
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
  };

  return (
    <div className="grid-container">
      <canvas
        ref={canvasRef}
        width={config.width}
        height={config.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="grid-canvas"
      />
    </div>
  );
}
