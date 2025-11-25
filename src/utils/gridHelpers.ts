import type { Point } from '../types/grid';
import type { Line } from '../types/line';

/**
 * Snap a point to the nearest grid intersection
 */
export function snapToGrid(point: Point, cellSize: number): Point {
  return {
    x: Math.round(point.x / cellSize) * cellSize,
    y: Math.round(point.y / cellSize) * cellSize,
  };
}

/**
 * Find the nearest endpoint from existing lines within snap distance
 */
export function findNearestEndpoint(point: Point, lines: Line[], snapDistance: number): Point | null {
  let nearestPoint: Point | null = null;
  let minDistance = snapDistance;

  for (const line of lines) {
    // Check start point
    const distToStart = distance(point, line.start);
    if (distToStart < minDistance) {
      minDistance = distToStart;
      nearestPoint = line.start;
    }

    // Check end point
    const distToEnd = distance(point, line.end);
    if (distToEnd < minDistance) {
      minDistance = distToEnd;
      nearestPoint = line.end;
    }
  }

  return nearestPoint;
}

/**
 * Snap to grid lines or intersections if within snap distance
 */
export function snapToGridIfClose(point: Point, cellSize: number, snapDistance: number): Point {
  const snappedToGrid = snapToGrid(point, cellSize);
  const dist = distance(point, snappedToGrid);
  
  if (dist <= snapDistance) {
    return snappedToGrid;
  }

  // Also check snapping to grid lines (horizontal or vertical alignment)
  const nearestGridX = Math.round(point.x / cellSize) * cellSize;
  const nearestGridY = Math.round(point.y / cellSize) * cellSize;
  
  const distToVerticalLine = Math.abs(point.x - nearestGridX);
  const distToHorizontalLine = Math.abs(point.y - nearestGridY);
  
  let snappedPoint = { ...point };
  
  if (distToVerticalLine <= snapDistance) {
    snappedPoint.x = nearestGridX;
  }
  
  if (distToHorizontalLine <= snapDistance) {
    snappedPoint.y = nearestGridY;
  }
  
  return snappedPoint;
}

/**
 * Smart snap: tries endpoint snapping first, then grid snapping
 */
export function smartSnap(
  point: Point,
  lines: Line[],
  cellSize: number,
  snapToEndpoints: boolean,
  snapToGrid: boolean,
  snapDistance: number
): Point {
  // Try endpoint snapping first (higher priority)
  if (snapToEndpoints) {
    const nearestEndpoint = findNearestEndpoint(point, lines, snapDistance);
    if (nearestEndpoint) {
      return nearestEndpoint;
    }
  }

  // Try grid snapping
  if (snapToGrid) {
    return snapToGridIfClose(point, cellSize, snapDistance);
  }

  // No snapping
  return point;
}

/**
 * Convert canvas coordinates to grid coordinates
 */
export function canvasToGrid(point: Point, cellSize: number): Point {
  return {
    x: Math.floor(point.x / cellSize),
    y: Math.floor(point.y / cellSize),
  };
}

/**
 * Convert grid coordinates to canvas coordinates
 */
export function gridToCanvas(point: Point, cellSize: number): Point {
  return {
    x: point.x * cellSize,
    y: point.y * cellSize,
  };
}

/**
 * Check if a line is horizontal or vertical (aligned with grid)
 */
export function isGridAligned(start: Point, end: Point): boolean {
  return start.x === end.x || start.y === end.y;
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Convert grid cells to inches based on scale
 */
export function cellsToInches(cells: number, inchesPerCell: number): number {
  return cells * inchesPerCell;
}

/**
 * Convert inches to grid cells based on scale
 */
export function inchesToCells(inches: number, inchesPerCell: number): number {
  return inches / inchesPerCell;
}

/**
 * Calculate line length in inches
 */
export function calculateLineLength(start: Point, end: Point, cellSize: number, inchesPerCell: number): number {
  const pixelDistance = distance(start, end);
  const cells = pixelDistance / cellSize;
  return cellsToInches(cells, inchesPerCell);
}
