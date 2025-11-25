import { describe, it, expect } from 'vitest';
import { 
  snapToGrid, 
  canvasToGrid, 
  gridToCanvas, 
  isGridAligned, 
  distance, 
  cellsToInches, 
  inchesToCells,
  calculateLineLength,
  findNearestEndpoint,
  snapToGridIfClose,
  smartSnap
} from './gridHelpers';
import type { Line } from '../types/grid';

describe('gridHelpers', () => {
  describe('snapToGrid', () => {
    it('should snap point to nearest grid intersection', () => {
      const cellSize = 20;
      expect(snapToGrid({ x: 25, y: 25 }, cellSize)).toEqual({ x: 20, y: 20 });
      expect(snapToGrid({ x: 35, y: 35 }, cellSize)).toEqual({ x: 40, y: 40 });
    });

    it('should handle points already on grid', () => {
      const cellSize = 20;
      expect(snapToGrid({ x: 40, y: 60 }, cellSize)).toEqual({ x: 40, y: 60 });
    });

    it('should handle negative coordinates', () => {
      const cellSize = 20;
      expect(snapToGrid({ x: -15, y: -25 }, cellSize)).toEqual({ x: -20, y: -20 });
    });
  });

  describe('canvasToGrid', () => {
    it('should convert canvas coordinates to grid coordinates', () => {
      const cellSize = 20;
      expect(canvasToGrid({ x: 45, y: 65 }, cellSize)).toEqual({ x: 2, y: 3 });
      expect(canvasToGrid({ x: 0, y: 0 }, cellSize)).toEqual({ x: 0, y: 0 });
    });

    it('should handle negative coordinates', () => {
      const cellSize = 20;
      expect(canvasToGrid({ x: -25, y: -45 }, cellSize)).toEqual({ x: -2, y: -3 });
    });
  });

  describe('gridToCanvas', () => {
    it('should convert grid coordinates to canvas coordinates', () => {
      const cellSize = 20;
      expect(gridToCanvas({ x: 2, y: 3 }, cellSize)).toEqual({ x: 40, y: 60 });
      expect(gridToCanvas({ x: 0, y: 0 }, cellSize)).toEqual({ x: 0, y: 0 });
    });

    it('should handle negative grid coordinates', () => {
      const cellSize = 20;
      expect(gridToCanvas({ x: -2, y: -3 }, cellSize)).toEqual({ x: -40, y: -60 });
    });

    it('should be inverse of canvasToGrid for aligned points', () => {
      const cellSize = 20;
      const gridPoint = { x: 5, y: 7 };
      const canvasPoint = gridToCanvas(gridPoint, cellSize);
      const backToGrid = canvasToGrid(canvasPoint, cellSize);
      expect(backToGrid).toEqual(gridPoint);
    });
  });

  describe('isGridAligned', () => {
    it('should return true for horizontal lines', () => {
      expect(isGridAligned({ x: 0, y: 0 }, { x: 100, y: 0 })).toBe(true);
    });

    it('should return true for vertical lines', () => {
      expect(isGridAligned({ x: 50, y: 0 }, { x: 50, y: 100 })).toBe(true);
    });

    it('should return false for diagonal lines', () => {
      expect(isGridAligned({ x: 0, y: 0 }, { x: 100, y: 100 })).toBe(false);
    });

    it('should return true for zero-length lines', () => {
      expect(isGridAligned({ x: 50, y: 50 }, { x: 50, y: 50 })).toBe(true);
    });
  });

  describe('distance', () => {
    it('should calculate distance between two points', () => {
      expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(distance({ x: 0, y: 0 }, { x: 0, y: 0 })).toBe(0);
    });

    it('should handle horizontal distances', () => {
      expect(distance({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(10);
    });

    it('should handle vertical distances', () => {
      expect(distance({ x: 0, y: 0 }, { x: 0, y: 10 })).toBe(10);
    });

    it('should handle negative coordinates', () => {
      expect(distance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5);
    });
  });

  describe('cellsToInches', () => {
    it('should convert cells to inches', () => {
      expect(cellsToInches(2, 12)).toBe(24); // 2 cells * 12 inches/cell = 24 inches
      expect(cellsToInches(5, 6)).toBe(30); // 5 cells * 6 inches/cell = 30 inches
    });

    it('should handle fractional cells', () => {
      expect(cellsToInches(1.5, 12)).toBe(18);
      expect(cellsToInches(0.5, 24)).toBe(12);
    });

    it('should handle zero cells', () => {
      expect(cellsToInches(0, 12)).toBe(0);
    });
  });

  describe('inchesToCells', () => {
    it('should convert inches to cells', () => {
      expect(inchesToCells(24, 12)).toBe(2); // 24 inches / 12 inches/cell = 2 cells
      expect(inchesToCells(30, 6)).toBe(5); // 30 inches / 6 inches/cell = 5 cells
    });

    it('should handle fractional results', () => {
      expect(inchesToCells(18, 12)).toBe(1.5);
      expect(inchesToCells(15, 6)).toBe(2.5);
    });

    it('should handle zero inches', () => {
      expect(inchesToCells(0, 12)).toBe(0);
    });
  });

  describe('calculateLineLength', () => {
    it('should calculate horizontal line length in inches', () => {
      const cellSize = 20;
      const inchesPerCell = 12;
      // Line from (0,0) to (40,0) = 2 cells = 24 inches
      const length = calculateLineLength({ x: 0, y: 0 }, { x: 40, y: 0 }, cellSize, inchesPerCell);
      expect(length).toBe(24);
    });

    it('should calculate vertical line length in inches', () => {
      const cellSize = 20;
      const inchesPerCell = 12;
      // Line from (0,0) to (0,60) = 3 cells = 36 inches
      const length = calculateLineLength({ x: 0, y: 0 }, { x: 0, y: 60 }, cellSize, inchesPerCell);
      expect(length).toBe(36);
    });

    it('should work with different scales', () => {
      const cellSize = 20;
      const inchesPerCell = 6;
      // Line from (0,0) to (40,0) = 2 cells = 12 inches (6" per cell)
      const length = calculateLineLength({ x: 0, y: 0 }, { x: 40, y: 0 }, cellSize, inchesPerCell);
      expect(length).toBe(12);
    });

    it('should handle zero-length lines', () => {
      const cellSize = 20;
      const inchesPerCell = 12;
      const length = calculateLineLength({ x: 0, y: 0 }, { x: 0, y: 0 }, cellSize, inchesPerCell);
      expect(length).toBe(0);
    });
  });

  describe('findNearestEndpoint', () => {
    it('should return null when no lines exist', () => {
      const result = findNearestEndpoint({ x: 100, y: 100 }, [], 5);
      expect(result).toBeNull();
    });

    it('should return null when no endpoints are within snapDistance', () => {
      const lines: Line[] = [
        { id: '1', start: { x: 0, y: 0 }, end: { x: 10, y: 10 } },
      ];
      const result = findNearestEndpoint({ x: 100, y: 100 }, lines, 5);
      expect(result).toBeNull();
    });

    it('should return the nearest start point within snapDistance', () => {
      const lines: Line[] = [
        { id: '1', start: { x: 100, y: 100 }, end: { x: 200, y: 200 } },
      ];
      const result = findNearestEndpoint({ x: 102, y: 103 }, lines, 5);
      expect(result).toEqual({ x: 100, y: 100 });
    });

    it('should return the nearest end point within snapDistance', () => {
      const lines: Line[] = [
        { id: '1', start: { x: 100, y: 100 }, end: { x: 200, y: 200 } },
      ];
      const result = findNearestEndpoint({ x: 198, y: 201 }, lines, 5);
      expect(result).toEqual({ x: 200, y: 200 });
    });

    it('should return the closest endpoint from multiple lines', () => {
      const lines: Line[] = [
        { id: '1', start: { x: 100, y: 100 }, end: { x: 200, y: 200 } },
        { id: '2', start: { x: 150, y: 150 }, end: { x: 250, y: 250 } },
      ];
      const result = findNearestEndpoint({ x: 152, y: 151 }, lines, 5);
      expect(result).toEqual({ x: 150, y: 150 });
    });

    it('should respect the snapDistance parameter', () => {
      const lines: Line[] = [
        { id: '1', start: { x: 100, y: 100 }, end: { x: 200, y: 200 } },
      ];
      const result = findNearestEndpoint({ x: 110, y: 110 }, lines, 5);
      expect(result).toBeNull();
    });
  });

  describe('snapToGridIfClose', () => {
    it('should snap to grid intersection when very close', () => {
      const result = snapToGridIfClose({ x: 101, y: 99 }, 20, 5);
      expect(result).toEqual({ x: 100, y: 100 });
    });

    it('should snap to vertical grid line when close', () => {
      const result = snapToGridIfClose({ x: 101, y: 50 }, 20, 5);
      expect(result).toEqual({ x: 100, y: 50 });
    });

    it('should snap to horizontal grid line when close', () => {
      const result = snapToGridIfClose({ x: 50, y: 101 }, 20, 5);
      expect(result).toEqual({ x: 50, y: 100 });
    });

    it('should not snap when too far from grid', () => {
      // Point (55, 55) is 5 away from (60, 60), which is > 3 snapDistance
      // But it's also 5 away from vertical line at 60 and horizontal line at 60
      // Since 5 > 3, no snapping should occur, returns original point
      const result = snapToGridIfClose({ x: 55, y: 55 }, 20, 3);
      expect(result).toEqual({ x: 55, y: 55 });
    });

    it('should respect the snapDistance parameter', () => {
      // Point (103, 97) is 3 away from (100, 100) intersection
      // And 3 away from vertical line at 100, 3 away from horizontal line at 100
      // Since 3 > 2 (snapDistance), no snapping should occur, returns original point
      const result = snapToGridIfClose({ x: 103, y: 97 }, 20, 2);
      expect(result).toEqual({ x: 103, y: 97 });
    });
  });

  describe('smartSnap', () => {
    it('should prioritize endpoint snapping over grid snapping', () => {
      const lines: Line[] = [
        { id: '1', start: { x: 102, y: 98 }, end: { x: 200, y: 200 } },
      ];
      const result = smartSnap({ x: 100, y: 100 }, lines, 20, true, true, 5);
      expect(result).toEqual({ x: 102, y: 98 });
    });

    it('should snap to grid when no endpoints are close', () => {
      const lines: Line[] = [
        { id: '1', start: { x: 200, y: 200 }, end: { x: 300, y: 300 } },
      ];
      const result = smartSnap({ x: 101, y: 99 }, lines, 20, true, true, 5);
      expect(result).toEqual({ x: 100, y: 100 });
    });

    it('should return raw point when endpoint snapping is disabled', () => {
      const lines: Line[] = [
        { id: '1', start: { x: 102, y: 98 }, end: { x: 200, y: 200 } },
      ];
      const result = smartSnap({ x: 100, y: 100 }, lines, 20, false, true, 5);
      expect(result).toEqual({ x: 100, y: 100 }); // Snaps to grid instead
    });

    it('should return raw point when grid snapping is disabled and no endpoints close', () => {
      const lines: Line[] = [
        { id: '1', start: { x: 200, y: 200 }, end: { x: 300, y: 300 } },
      ];
      const result = smartSnap({ x: 101, y: 99 }, lines, 20, true, false, 5);
      expect(result).toEqual({ x: 101, y: 99 });
    });

    it('should return raw point when both snapping modes are disabled', () => {
      const lines: Line[] = [
        { id: '1', start: { x: 102, y: 98 }, end: { x: 200, y: 200 } },
      ];
      const result = smartSnap({ x: 100, y: 100 }, lines, 20, false, false, 5);
      expect(result).toEqual({ x: 100, y: 100 });
    });

    it('should handle empty lines array', () => {
      const result = smartSnap({ x: 100, y: 100 }, [], 20, true, true, 5);
      expect(result).toEqual({ x: 100, y: 100 }); // Snaps to grid
    });
  });
});
