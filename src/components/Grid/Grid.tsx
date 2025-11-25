import { useRef, useEffect, useState, useCallback } from 'react';
import type { GridConfig } from '../../types/grid';
import type { Line, LineType } from '../../types/line';
import { LINE_DEFAULTS } from '../../types/line';
import type { FurnitureInstance, FurnitureTemplate } from '../../types/furniture';
import { snapToGrid, canvasToGrid, calculateLineLength, smartSnap } from '../../utils/gridHelpers';
import { findLineAtPoint, findEndpointAtPoint, checkLineIntersection } from '../../utils/lineHelpers';
import { isPointInFurniture } from '../../utils/collisionDetection';
import './Grid.css';

interface GridProps {
  config: GridConfig;
  lines: Line[];
  furniture: FurnitureInstance[];
  furnitureTemplates: FurnitureTemplate[];
  mode: 'draw' | 'select' | 'furniture';
  selectedTemplate?: FurnitureTemplate | null;
  selectedLineType?: LineType;
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
  selectedLineType = 'wall',
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ 
    width: config.width, 
    height: config.height 
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingEndpoint, setIsDraggingEndpoint] = useState<'start' | 'end' | null>(null);
  const [isDraggingLine, setIsDraggingLine] = useState(false);
  const [lineDragOffset, setLineDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingFurniture, setIsDraggingFurniture] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  
  // Pan and zoom state
  const [viewOffset, setViewOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [spacePressed, setSpacePressed] = useState(false);

  // Minimum canvas dimensions (current default size)
  const MIN_WIDTH = 800;
  const MIN_HEIGHT = 600;

  // Handle container resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Account for padding (20px on each side = 40px total)
        const availableWidth = Math.max(MIN_WIDTH, Math.floor(width - 40));
        const availableHeight = Math.max(MIN_HEIGHT, Math.floor(height - 40));
        setCanvasDimensions({ width: availableWidth, height: availableHeight });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Calculate current line length and notify parent
  useEffect(() => {
    if ((isDrawing || isDraggingEndpoint || isDraggingLine) && startPoint && currentPoint && onCurrentLineLengthChange) {
      // Length during active drawing/editing
      const length = calculateLineLength(startPoint, currentPoint, config.cellSize, config.inchesPerCell);
      onCurrentLineLengthChange(length);
    } else if (selectedLine && onCurrentLineLengthChange) {
      // Length of selected line (not being edited)
      const length = calculateLineLength(selectedLine.start, selectedLine.end, config.cellSize, config.inchesPerCell);
      onCurrentLineLengthChange(length);
    } else if (onCurrentLineLengthChange) {
      onCurrentLineLengthChange(undefined);
    }
  }, [isDrawing, isDraggingEndpoint, isDraggingLine, startPoint, currentPoint, selectedLine, config.cellSize, config.inchesPerCell]);

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
    const { cellSize, gridColor, backgroundColor } = config;
    const { width, height } = canvasDimensions;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Save context and apply transform
    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    // Draw grid lines
    ctx.lineWidth = 1 / zoomLevel; // Keep grid lines same visual thickness

    // Calculate visible grid range (accounting for zoom and pan)
    const startX = Math.floor((-viewOffset.x / zoomLevel) / cellSize) * cellSize;
    const endX = Math.ceil((width / zoomLevel - viewOffset.x / zoomLevel) / cellSize) * cellSize;
    const startY = Math.floor((-viewOffset.y / zoomLevel) / cellSize) * cellSize;
    const endY = Math.ceil((height / zoomLevel - viewOffset.y / zoomLevel) / cellSize) * cellSize;

    // Helper to get darker shade for emphasis lines
    const getGridLineColor = (position: number, cellSize: number): string => {
      const gridIndex = Math.round(position / cellSize);
      return gridIndex % 4 === 0 ? '#c0c0c0' : gridColor; // Slightly darker every 4th line
    };

    // Vertical lines
    for (let x = startX; x <= endX; x += cellSize) {
      ctx.strokeStyle = getGridLineColor(x, cellSize);
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += cellSize) {
      ctx.strokeStyle = getGridLineColor(y, cellSize);
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    ctx.restore();
  }, [config, canvasDimensions, viewOffset, zoomLevel]);

  // Draw all lines
  const drawLines = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(viewOffset.x, viewOffset.y);
    ctx.scale(zoomLevel, zoomLevel);

    lines.forEach(line => {
      // Highlight selected line
      const isSelected = selectedLine?.id === line.id;
      const isDraggingThisLine = isSelected && (isDraggingEndpoint || isDraggingLine) && startPoint && currentPoint;
      
      ctx.strokeStyle = isSelected ? '#3498db' : line.color;
      ctx.lineWidth = (isSelected ? line.thickness + 2 : line.thickness) / zoomLevel;
      
      // Draw the line with preview if being dragged
      ctx.beginPath();
      if (isDraggingThisLine) {
        // Show preview of line being edited or moved
        let previewStart, previewEnd;
        if (isDraggingLine) {
          // Translating entire line
          previewStart = startPoint;
          previewEnd = currentPoint;
        } else if (isDraggingEndpoint === 'start') {
          // Dragging start endpoint, end is fixed at startPoint
          previewStart = currentPoint;
          previewEnd = startPoint;
        } else {
          // Dragging end endpoint, start is fixed at startPoint
          previewStart = startPoint;
          previewEnd = currentPoint;
        }
        ctx.moveTo(previewStart.x, previewStart.y);
        ctx.lineTo(previewEnd.x, previewEnd.y);
      } else {
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
      }
      ctx.stroke();
      
      // Draw endpoints for selected line
      if (isSelected) {
        ctx.fillStyle = '#3498db';
        let startPos, endPos;
        if (isDraggingThisLine) {
          if (isDraggingLine) {
            startPos = startPoint;
            endPos = currentPoint;
          } else if (isDraggingEndpoint === 'start') {
            startPos = currentPoint;
            endPos = startPoint;
          } else {
            startPos = startPoint;
            endPos = currentPoint;
          }
        } else {
          startPos = line.start;
          endPos = line.end;
        }
        
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, 6 / zoomLevel, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(endPos.x, endPos.y, 6 / zoomLevel, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Draw dimension label if enabled
      if (config.showLineDimensions) {
        // Calculate line length in inches
        const dx = line.end.x - line.start.x;
        const dy = line.end.y - line.start.y;
        const lengthInPixels = Math.sqrt(dx * dx + dy * dy);
        const pixelsPerInch = config.cellSize / config.inchesPerCell;
        const lengthInInches = Math.round(lengthInPixels / pixelsPerInch);

        // Calculate midpoint
        const midX = (line.start.x + line.end.x) / 2;
        const midY = (line.start.y + line.end.y) / 2;

        // Determine label offset based on line orientation
        const angle = Math.atan2(dy, dx);
        const isVertical = Math.abs(Math.cos(angle)) < 0.3;
        const offsetDistance = 15 / zoomLevel;

        let labelX, labelY;
        if (isVertical) {
          // For vertical lines, place label to the right
          labelX = midX + offsetDistance;
          labelY = midY;
        } else {
          // For horizontal/diagonal lines, place label above
          labelX = midX;
          labelY = midY - offsetDistance;
        }

        // Draw label
        ctx.save();
        ctx.translate(labelX, labelY);
        ctx.scale(1 / zoomLevel, 1 / zoomLevel);
        
        ctx.font = '14px Arial';
        ctx.fillStyle = line.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${lengthInInches}"`, 0, 0);
        
        ctx.restore();
      }
    });

    ctx.restore();
  }, [lines, selectedLine, viewOffset, zoomLevel, isDraggingEndpoint, isDraggingLine, startPoint, currentPoint, config]);

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
    
    // Use smart snapping based on grid configuration
    const snapped = config.gridAlignedMode
      ? snapToGrid(worldPoint, config.cellSize)
      : smartSnap(worldPoint, lines, config.cellSize, config.snapToEndpoints, config.snapToGrid, config.snapDistance);
    
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
        // Place new furniture (respect snap to grid setting)
        // When snap is enabled, use integer grid coordinates
        // When snap is disabled, use exact (fractional) grid coordinates
        const position = config.gridAlignedMode 
          ? gridPos 
          : { x: worldPoint.x / config.cellSize, y: worldPoint.y / config.cellSize };
        const newFurniture: FurnitureInstance = {
          id: crypto.randomUUID(),
          templateId: selectedTemplate.id,
          position,
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
          // Store the opposite endpoint as the anchor point that won't move
          // When dragging 'start', the 'end' stays fixed and vice versa
          const anchorPoint = endpoint === 'start' ? selectedLine.end : selectedLine.start;
          setStartPoint(anchorPoint);
          setCurrentPoint(snapped);
          return;
        }
        
        // Check if clicking on the line body (not endpoint) - for translation
        if (findLineAtPoint(worldPoint, [selectedLine])) {
          setIsDraggingLine(true);
          // Store offset from click point to line start
          setLineDragOffset({
            x: worldPoint.x - selectedLine.start.x,
            y: worldPoint.y - selectedLine.start.y,
          });
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
    
    // Use smart snapping based on grid configuration
    const snapped = config.gridAlignedMode
      ? snapToGrid(worldPoint, config.cellSize)
      : smartSnap(worldPoint, lines, config.cellSize, config.snapToEndpoints, config.snapToGrid, config.snapDistance);
    
    const gridPos = canvasToGrid(worldPoint, config.cellSize);

    // Update preview position for furniture placement
    if (mode === 'furniture') {
      setCurrentPoint({ x: screenX, y: screenY });
      canvas.style.cursor = (spacePressed || isPanning) ? 'grab' : (selectedTemplate ? 'copy' : 'default');
      return;
    }

    // Handle dragging furniture (respect snap to grid setting)
    if (isDraggingFurniture && selectedFurniture && dragOffset && onFurnitureMove) {
      // When snap is enabled, use integer grid coordinates
      // When snap is disabled, use exact (fractional) grid coordinates
      const basePos = config.gridAlignedMode 
        ? gridPos 
        : { x: worldPoint.x / config.cellSize, y: worldPoint.y / config.cellSize };
      let newPos = {
        x: basePos.x - dragOffset.x,
        y: basePos.y - dragOffset.y,
      };
      // Round to nearest grid cell when snap is enabled to realign fractional positions
      if (config.gridAlignedMode) {
        newPos = {
          x: Math.round(newPos.x),
          y: Math.round(newPos.y),
        };
      }
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
      } else if (selectedLine && findLineAtPoint(worldPoint, [selectedLine])) {
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

    // Handle dragging line (translation)
    if (isDraggingLine && selectedLine && lineDragOffset && onLineEdit) {
      // Calculate new start position based on drag
      const newStartX = snapped.x - lineDragOffset.x;
      const newStartY = snapped.y - lineDragOffset.y;
      
      // Calculate the delta to move both endpoints
      const dx = newStartX - selectedLine.start.x;
      const dy = newStartY - selectedLine.start.y;
      
      const newStart = { x: selectedLine.start.x + dx, y: selectedLine.start.y + dy };
      const newEnd = { x: selectedLine.end.x + dx, y: selectedLine.end.y + dy };
      
      // Store for preview
      setStartPoint(newStart);
      setCurrentPoint(newEnd);
      return;
    }

    // Handle dragging endpoint
    if (isDraggingEndpoint && selectedLine && startPoint && onLineEdit) {
      // Only constrain to horizontal/vertical in grid-aligned mode
      if (config.gridAlignedMode) {
        const dx = Math.abs(snapped.x - startPoint.x);
        const dy = Math.abs(snapped.y - startPoint.y);
        
        const constrainedPoint = dx > dy
          ? { x: snapped.x, y: startPoint.y }
          : { x: startPoint.x, y: snapped.y };
        
        setCurrentPoint(constrainedPoint);
      } else {
        setCurrentPoint(snapped);
      }
      return;
    }

    // Handle drawing new line
    if (isDrawing && mode === 'draw') {
      if (startPoint) {
        // Only constrain to horizontal/vertical in grid-aligned mode
        if (config.gridAlignedMode) {
          const dx = Math.abs(snapped.x - startPoint.x);
          const dy = Math.abs(snapped.y - startPoint.y);

          if (dx > dy) {
            setCurrentPoint({ x: snapped.x, y: startPoint.y });
          } else {
            setCurrentPoint({ x: startPoint.x, y: snapped.y });
          }
        } else {
          setCurrentPoint(snapped);
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

    // Handle line translation end
    if (isDraggingLine && selectedLine && startPoint && currentPoint && onLineEdit) {
      // Update line with new translated positions
      const updates: Partial<Line> = {
        start: { ...startPoint },
        end: { ...currentPoint },
      };
      onLineEdit(selectedLine.id, updates);
      setIsDraggingLine(false);
      setLineDragOffset(null);
      setStartPoint(null);
      setCurrentPoint(null);
      return;
    }

    // Handle endpoint dragging
    if (isDraggingEndpoint && selectedLine && currentPoint && startPoint && onLineEdit) {
      // Only update if the line would have non-zero length
      if (currentPoint.x !== startPoint.x || currentPoint.y !== startPoint.y) {
        // Create new point objects to ensure React detects the change
        const updates: Partial<Line> = isDraggingEndpoint === 'start'
          ? { start: { ...currentPoint }, end: { ...startPoint } }
          : { start: { ...startPoint }, end: { ...currentPoint } };
        
        onLineEdit(selectedLine.id, updates);
      } else {
        // If both points are the same, delete the line
        // For now, just don't update (user can delete manually)
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
        const lineDefaults = LINE_DEFAULTS[selectedLineType];
        const newLine: Line = {
          id: crypto.randomUUID(),
          start: startPoint,
          end: currentPoint,
          type: selectedLineType,
          thickness: lineDefaults.thickness,
          color: lineDefaults.color,
        };
        
        // Check if the new line intersects with any existing lines
        if (checkLineIntersection(newLine, lines)) {
          // Don't add the line if it intersects
          console.warn('Cannot add line: intersects with existing line');
        } else {
          onLineAdd(newLine);
        }
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
    <div ref={containerRef} className="grid-container">
      <canvas
        ref={canvasRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
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
