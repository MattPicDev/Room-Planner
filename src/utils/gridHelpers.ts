import type { Point } from '../types/grid';

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
