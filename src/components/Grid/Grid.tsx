import { useRef, useEffect, useState, useCallback } from 'react';
import type { GridConfig } from '../../types/grid';
import type { Line } from '../../types/line';
import type { FurnitureInstance, FurnitureTemplate } from '../../types/furniture';
import { snapToGrid, canvasToGrid, calculateLineLength } from '../../utils/gridHelpers';
import { findLineAtPoint, findEndpointAtPoint } from '../../utils/lineHelpers';
import { isPointInFurniture } from '../../utils/collisionDetection';
import './Grid.css';

interface GridProps {
  config: GridConfig;
  lines: Line[];
  furniture: FurnitureInstance[];
  furnitureTemplates: FurnitureTemplate[];
  mode: 'draw' | 'select' | 'furniture';
  selectedTemplate?: FurnitureTemplate | null;
  onLineAdd?: (line: Line) => void;
  onLineEdit?: (lineId: string, updates: Partial<Line>) => void;
  onLineSelect?: (line: Line | null) => void;
  selectedLine?: Line | null;
  onFurnitureAdd?: (furniture: FurnitureInstance) => void;
  onFurnitureSelect?: (furniture: FurnitureInstance | null) => void;
  onFurnitureMove?: (id: string, position: { x: number; y: number }) => void;
  selectedFurniture?: FurnitureInstance | null;
  onCurrentLineLengthChange?: (length: number | undefined) => void;
  onZoomChange?: (zoom: number) => void;
}

export function Grid({ 
  config, 
  lines, 
  furniture,
  furnitureTemplates,
  mode, 
  selectedTemplate,
  onLineAdd, 
  onLineEdit, 
  onLineSelect, 
  selectedLine,
  onFurnitureAdd,
  onFurnitureSelect,
  onFurnitureMove,
  selectedFurniture,
  onCurrentLineLengthChange,
  onZoomChange,
}: GridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingEndpoint, setIsDraggingEndpoint] = useState<'start' | 'end' | null>(null);
  const [isDraggingFurniture, setIsDraggingFurniture] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  
  // Pan and zoom state
  const [viewOffset, setViewOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);

  // Calculate current line length and notify parent
  useEffect(() => {
    if ((isDrawing || isDraggingEndpoint) && startPoint && currentPoint && onCurrentLineLengthChange) {
      const length = calculateLineLength(startPoint, currentPoint, config.cellSize, config.inchesPerCell);
      onCurrentLineLengthChange(length);
    } else if (onCurrentLineLengthChange) {
      onCurrentLineLengthChange(undefined);
    }
  }, [isDrawing, isDraggingEndpoint, startPoint, currentPoint, config.cellSize, config.inchesPerCell, onCurrentLineLengthChange]);

  // Notify parent of zoom level changes
  useEffect(() => {
    onZoomChange?.(zoomLevel);
  }, [zoomLevel, onZoomChange]);

  // Transform screen coordinates to world coordinates (accounting for pan/zoom)
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - viewOffset.x) / zoomLevel,
      y: (screenY - viewOffset.y) / zoomLevel,
    };
  }, [viewOffset, zoomLevel]);

  // Handle spacebar for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSpacePressed(false);
        setIsPanning(false);
        setPanStart(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Draw the grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height, cellSize, gridColor, backgroundColor } = config;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Save context and apply transform
    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1 / zoomLevel; // Keep grid lines same visual thickness

    // Calculate visible grid range (accounting for zoom and pan)
    const startX = Math.floor((-viewOffset.x / zoomLevel) / cellSize) * cellSize;
    const endX = Math.ceil((width / zoomLevel - viewOffset.x / zoomLevel) / cellSize) * cellSize;
    const startY = Math.floor((-viewOffset.y / zoomLevel) / cellSize) * cellSize;
    const endY = Math.ceil((height / zoomLevel - viewOffset.y / zoomLevel) / cellSize) * cellSize;

    // Vertical lines
    for (let x = startX; x <= endX; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    ctx.restore();
  }, [config, viewOffset, zoomLevel]);

  // Draw all lines
  const drawLines = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    lines.forEach(line => {
      // Highlight selected line
      const isSelected = selectedLine?.id === line.id;
      ctx.strokeStyle = isSelected ? '#3498db' : line.color;
      ctx.lineWidth = (isSelected ? line.thickness + 2 : line.thickness) / zoomLevel;
      
      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.stroke();
      
      // Draw endpoints for selected line
      if (isSelected) {
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(line.start.x, line.start.y, 6 / zoomLevel, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(line.end.x, line.end.y, 6 / zoomLevel, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    ctx.restore();
  }, [lines, selectedLine, viewOffset, zoomLevel]);

  // Draw furniture
  const drawFurniture = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    furniture.forEach(item => {
      const template = furnitureTemplates.find(t => t.id === item.templateId);
      if (!template) return;

      const isSelected = selectedFurniture?.id === item.id;
      const { cellSize, inchesPerCell } = config;
      
      // Convert dimensions from inches to cells
      const widthInCells = template.width / inchesPerCell;
      const heightInCells = template.height / inchesPerCell;
      
      // Calculate dimensions based on rotation
      const isRotated = item.rotation === 90 || item.rotation === 270;
      const width = isRotated ? heightInCells : widthInCells;
      const height = isRotated ? widthInCells : heightInCells;
      
      const x = item.position.x * cellSize;
      const y = item.position.y * cellSize;
      const w = width * cellSize;
      const h = height * cellSize;

      // Draw furniture
      ctx.fillStyle = template.color;
      ctx.fillRect(x, y, w, h);
      
      // Draw border
      ctx.strokeStyle = isSelected ? '#3498db' : '#333';
      ctx.lineWidth = (isSelected ? 3 : 1) / zoomLevel;
      ctx.strokeRect(x, y, w, h);
      
      // Draw name
      ctx.fillStyle = '#fff';
      ctx.font = `${12 / zoomLevel}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(template.name, x + w / 2, y + h / 2);
    });
    
    // Draw preview furniture while placing
    if (mode === 'furniture' && selectedTemplate && currentPoint) {
      const { cellSize, inchesPerCell } = config;
      const worldPoint = screenToWorld(currentPoint.x, currentPoint.y);
      const gridPos = canvasToGrid(worldPoint, cellSize);
      const x = gridPos.x * cellSize;
      const y = gridPos.y * cellSize;
      
      // Convert dimensions from inches to cells
      const widthInCells = selectedTemplate.width / inchesPerCell;
      const heightInCells = selectedTemplate.height / inchesPerCell;
      const w = widthInCells * cellSize;
      const h = heightInCells * cellSize;
      
      ctx.fillStyle = selectedTemplate.color;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2 / zoomLevel;
      ctx.setLineDash([5 / zoomLevel, 5 / zoomLevel]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [furniture, furnitureTemplates, selectedFurniture, mode, selectedTemplate, currentPoint, config, viewOffset, zoomLevel, screenToWorld]);

  // Draw preview line while drawing
  const drawPreview = useCallback((ctx: CanvasRenderingContext2D) => {
    if (startPoint && currentPoint && mode === 'draw') {
      ctx.save();
      ctx.translate(viewOffset.x, viewOffset.y);
      ctx.scale(zoomLevel, zoomLevel);

      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2 / zoomLevel;
      ctx.setLineDash([5 / zoomLevel, 5 / zoomLevel]);
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
    }
  }, [startPoint, currentPoint, mode, viewOffset, zoomLevel]);

  // Main render effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGrid(ctx);
    drawLines(ctx);
    drawFurniture(ctx);
    drawPreview(ctx);
  }, [drawGrid, drawLines, drawFurniture, drawPreview]);

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Handle panning with space or middle mouse button
    if (spacePressed || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: screenX, y: screenY });
      return;
    }

    // Convert to world coordinates
    const worldPoint = screenToWorld(screenX, screenY);
    const snapped = snapToGrid(worldPoint, config.cellSize);
    const gridPos = canvasToGrid(worldPoint, config.cellSize);

    if (mode === 'furniture') {
      // Check if clicking on existing furniture to select/drag
      const clickedFurniture = furniture.find(item => {
        const template = furnitureTemplates.find(t => t.id === item.templateId);
        return template && isPointInFurniture(gridPos, item, template, config.inchesPerCell);
      });
      
      if (clickedFurniture) {
        onFurnitureSelect?.(clickedFurniture);
        setIsDraggingFurniture(true);
        setDragOffset({
          x: gridPos.x - clickedFurniture.position.x,
          y: gridPos.y - clickedFurniture.position.y,
        });
      } else if (selectedTemplate) {
        // Place new furniture
        const newFurniture: FurnitureInstance = {
          id: crypto.randomUUID(),
          templateId: selectedTemplate.id,
          position: gridPos,
          rotation: 0,
        };
        onFurnitureAdd?.(newFurniture);
        onFurnitureSelect?.(newFurniture);
      }
    } else if (mode === 'select') {
      // Check if clicking on furniture to select it
      const clickedFurniture = furniture.find(item => {
        const template = furnitureTemplates.find(t => t.id === item.templateId);
        return template && isPointInFurniture(gridPos, item, template, config.inchesPerCell);
      });
      
      if (clickedFurniture) {
        onFurnitureSelect?.(clickedFurniture);
        setIsDraggingFurniture(true);
        setDragOffset({
          x: gridPos.x - clickedFurniture.position.x,
          y: gridPos.y - clickedFurniture.position.y,
        });
        return;
      }
      
      // Check if clicking on selected line's endpoint
      if (selectedLine) {
        const endpoint = findEndpointAtPoint(worldPoint, selectedLine, 15 / zoomLevel);
        if (endpoint) {
          setIsDraggingEndpoint(endpoint);
          setStartPoint(endpoint === 'start' ? selectedLine.end : selectedLine.start);
          setCurrentPoint(snapped);
          return;
        }
      }
      
      // Check if clicking on any line
      const clickedLine = findLineAtPoint(worldPoint, lines);
      if (clickedLine) {
        onLineSelect?.(clickedLine);
        onFurnitureSelect?.(null);
      } else {
        onLineSelect?.(null);
        onFurnitureSelect?.(null);
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
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Handle panning
    if (isPanning && panStart) {
      const dx = screenX - panStart.x;
      const dy = screenY - panStart.y;
      setViewOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: screenX, y: screenY });
      return;
    }

    // Convert to world coordinates
    const worldPoint = screenToWorld(screenX, screenY);
    const snapped = snapToGrid(worldPoint, config.cellSize);
    const gridPos = canvasToGrid(worldPoint, config.cellSize);

    // Update preview position for furniture placement
    if (mode === 'furniture') {
      setCurrentPoint({ x: screenX, y: screenY });
      canvas.style.cursor = (spacePressed || isPanning) ? 'grab' : (selectedTemplate ? 'copy' : 'default');
      return;
    }

    // Handle dragging furniture
    if (isDraggingFurniture && selectedFurniture && dragOffset && onFurnitureMove) {
      const newPos = {
        x: gridPos.x - dragOffset.x,
        y: gridPos.y - dragOffset.y,
      };
      onFurnitureMove(selectedFurniture.id, newPos);
      return;
    }

    // Update cursor based on hover state
    if (mode === 'select' && !isDrawing && !isDraggingEndpoint && !isDraggingFurniture && !isPanning) {
      // Check furniture hover
      const hoveredFurniture = furniture.find(item => {
        const template = furnitureTemplates.find(t => t.id === item.templateId);
        return template && isPointInFurniture(gridPos, item, template, config.inchesPerCell);
      });
      
      if (hoveredFurniture) {
        canvas.style.cursor = 'move';
      } else if (selectedLine && findEndpointAtPoint(worldPoint, selectedLine, 15 / zoomLevel)) {
        canvas.style.cursor = 'move';
      } else if (findLineAtPoint(worldPoint, lines)) {
        canvas.style.cursor = 'pointer';
      } else {
        canvas.style.cursor = spacePressed ? 'grab' : 'default';
      }
    } else if (mode === 'draw' && !isPanning) {
      canvas.style.cursor = spacePressed ? 'grab' : 'crosshair';
    } else if (isPanning) {
      canvas.style.cursor = 'grabbing';
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
    // Handle panning end
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    // Handle furniture dragging end
    if (isDraggingFurniture) {
      setIsDraggingFurniture(false);
      setDragOffset(null);
      return;
    }

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

  // Handle mouse wheel for zooming
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate world position before zoom
    const worldBefore = screenToWorld(mouseX, mouseY);

    // Update zoom level
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoomLevel * zoomFactor));
    setZoomLevel(newZoom);

    // Calculate world position after zoom (to maintain mouse position)
    const worldAfter = {
      x: (mouseX - viewOffset.x) / newZoom,
      y: (mouseY - viewOffset.y) / newZoom,
    };

    // Adjust offset to keep mouse position stable
    setViewOffset({
      x: viewOffset.x + (worldAfter.x - worldBefore.x) * newZoom,
      y: viewOffset.y + (worldAfter.y - worldBefore.y) * newZoom,
    });
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
        onWheel={handleWheel}
        className="grid-canvas"
      />
    </div>
  );
}
