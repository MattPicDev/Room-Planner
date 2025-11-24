import { useRef, useEffect, useState, useCallback } from 'react';
import type { GridConfig } from '../../types/grid';
import type { Line } from '../../types/line';
import { snapToGrid } from '../../utils/gridHelpers';
import './Grid.css';

interface GridProps {
  config: GridConfig;
  lines: Line[];
  onLineAdd?: (line: Line) => void;
  onLineEdit?: (lineId: string, updates: Partial<Line>) => void;
  onLineDelete?: (lineId: string) => void;
}

export function Grid({ config, lines, onLineAdd }: GridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

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
      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.thickness;
      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.stroke();
    });
  }, [lines]);

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
    const snapped = snapToGrid({ x, y }, config.cellSize);

    setIsDrawing(true);
    setStartPoint(snapped);
    setCurrentPoint(snapped);
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const snapped = snapToGrid({ x, y }, config.cellSize);

    // Constrain to horizontal or vertical
    if (startPoint) {
      const dx = Math.abs(snapped.x - startPoint.x);
      const dy = Math.abs(snapped.y - startPoint.y);

      if (dx > dy) {
        setCurrentPoint({ x: snapped.x, y: startPoint.y });
      } else {
        setCurrentPoint({ x: startPoint.x, y: snapped.y });
      }
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isDrawing && startPoint && currentPoint && onLineAdd) {
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
