import { describe, it, expect } from 'vitest';
import { 
  snapToGrid, 
  canvasToGrid, 
  gridToCanvas, 
  isGridAligned, 
  distance, 
  cellsToInches, 
  inchesToCells,
  calculateLineLength
} from './gridHelpers';

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
});
