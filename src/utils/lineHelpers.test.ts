import { describe, it, expect } from 'vitest';
import { distanceToLine, findLineAtPoint, findEndpointAtPoint, doLinesIntersect, checkLineIntersection } from './lineHelpers';
import type { Line } from '../types/line';

describe('lineHelpers', () => {
  const testLine: Line = {
    id: 'test-1',
    start: { x: 0, y: 0 },
    end: { x: 100, y: 0 },
    type: 'wall',
    thickness: 4,
    color: '#000000',
  };

  describe('distanceToLine', () => {
    it('should return 0 for a point on the line', () => {
      const point = { x: 50, y: 0 };
      expect(distanceToLine(point, testLine)).toBe(0);
    });

    it('should return correct distance for a point above the line', () => {
      const point = { x: 50, y: 10 };
      expect(distanceToLine(point, testLine)).toBe(10);
    });

    it('should return correct distance for a point below the line', () => {
      const point = { x: 50, y: -10 };
      expect(distanceToLine(point, testLine)).toBe(10);
    });

    it('should handle points beyond line endpoints', () => {
      const point = { x: 150, y: 0 };
      const distance = distanceToLine(point, testLine);
      expect(distance).toBeGreaterThan(0);
    });

    it('should handle vertical lines', () => {
      const verticalLine: Line = {
        ...testLine,
        start: { x: 50, y: 0 },
        end: { x: 50, y: 100 },
      };
      const point = { x: 60, y: 50 };
      expect(distanceToLine(point, verticalLine)).toBe(10);
    });
  });

  describe('findLineAtPoint', () => {
    const lines: Line[] = [
      testLine,
      {
        id: 'test-2',
        start: { x: 0, y: 100 },
        end: { x: 100, y: 100 },
        type: 'door',
        thickness: 2,
        color: '#8B4513',
      },
    ];

    it('should find a line near the point', () => {
      const point = { x: 50, y: 5 };
      const result = findLineAtPoint(point, lines, 10);
      expect(result).toBeTruthy();
      expect(result?.id).toBe('test-1');
    });

    it('should return null if no line is near the point', () => {
      const point = { x: 50, y: 50 };
      const result = findLineAtPoint(point, lines, 10);
      expect(result).toBeNull();
    });

    it('should respect the threshold parameter', () => {
      const point = { x: 50, y: 15 };
      
      // Should not find with small threshold
      expect(findLineAtPoint(point, lines, 10)).toBeNull();
      
      // Should find with larger threshold
      expect(findLineAtPoint(point, lines, 20)).toBeTruthy();
    });
  });

  describe('findEndpointAtPoint', () => {
    it('should detect start endpoint', () => {
      const point = { x: 5, y: 5 };
      const result = findEndpointAtPoint(point, testLine, 10);
      expect(result).toBe('start');
    });

    it('should detect end endpoint', () => {
      const point = { x: 95, y: 5 };
      const result = findEndpointAtPoint(point, testLine, 10);
      expect(result).toBe('end');
    });

    it('should return null if not near an endpoint', () => {
      const point = { x: 50, y: 0 };
      const result = findEndpointAtPoint(point, testLine, 10);
      expect(result).toBeNull();
    });

    it('should respect the threshold parameter', () => {
      const point = { x: 15, y: 0 };
      
      // Should not detect with small threshold
      expect(findEndpointAtPoint(point, testLine, 10)).toBeNull();
      
      // Should detect with larger threshold
      expect(findEndpointAtPoint(point, testLine, 20)).toBe('start');
    });

    it('should prioritize start endpoint when both are close', () => {
      const shortLine: Line = {
        ...testLine,
        end: { x: 10, y: 0 },
      };
      const point = { x: 5, y: 0 };
      const result = findEndpointAtPoint(point, shortLine, 10);
      expect(result).toBe('start');
    });
  });

  describe('doLinesIntersect', () => {
    it('detects intersection of perpendicular lines', () => {
      const line1: Line = {
        id: '1',
        start: { x: 0, y: 5 },
        end: { x: 10, y: 5 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      const line2: Line = {
        id: '2',
        start: { x: 5, y: 0 },
        end: { x: 5, y: 10 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      expect(doLinesIntersect(line1, line2)).toBe(true);
    });

    it('detects no intersection when lines do not cross', () => {
      const line1: Line = {
        id: '1',
        start: { x: 0, y: 0 },
        end: { x: 5, y: 0 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      const line2: Line = {
        id: '2',
        start: { x: 10, y: 0 },
        end: { x: 15, y: 0 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      expect(doLinesIntersect(line1, line2)).toBe(false);
    });

    it('detects intersection at line endpoints', () => {
      const line1: Line = {
        id: '1',
        start: { x: 0, y: 0 },
        end: { x: 10, y: 0 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      const line2: Line = {
        id: '2',
        start: { x: 10, y: 0 },
        end: { x: 10, y: 10 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      expect(doLinesIntersect(line1, line2)).toBe(true);
    });

    it('handles parallel non-overlapping lines', () => {
      const line1: Line = {
        id: '1',
        start: { x: 0, y: 0 },
        end: { x: 10, y: 0 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      const line2: Line = {
        id: '2',
        start: { x: 0, y: 5 },
        end: { x: 10, y: 5 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      expect(doLinesIntersect(line1, line2)).toBe(false);
    });

    it('detects overlapping parallel lines', () => {
      const line1: Line = {
        id: '1',
        start: { x: 0, y: 0 },
        end: { x: 10, y: 0 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      const line2: Line = {
        id: '2',
        start: { x: 5, y: 0 },
        end: { x: 15, y: 0 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      expect(doLinesIntersect(line1, line2)).toBe(true);
    });

    it('detects diagonal line intersections', () => {
      const line1: Line = {
        id: '1',
        start: { x: 0, y: 0 },
        end: { x: 10, y: 10 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      const line2: Line = {
        id: '2',
        start: { x: 0, y: 10 },
        end: { x: 10, y: 0 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      expect(doLinesIntersect(line1, line2)).toBe(true);
    });

    it('handles lines that would intersect if extended but do not', () => {
      const line1: Line = {
        id: '1',
        start: { x: 0, y: 0 },
        end: { x: 5, y: 0 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      const line2: Line = {
        id: '2',
        start: { x: 10, y: -5 },
        end: { x: 10, y: 5 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      expect(doLinesIntersect(line1, line2)).toBe(false);
    });
  });

  describe('checkLineIntersection', () => {
    const existingLines: Line[] = [
      {
        id: '1',
        start: { x: 0, y: 5 },
        end: { x: 10, y: 5 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      },
      {
        id: '2',
        start: { x: 15, y: 0 },
        end: { x: 15, y: 10 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      },
    ];

    it('detects intersection with existing lines', () => {
      const newLine: Line = {
        id: '3',
        start: { x: 5, y: 0 },
        end: { x: 5, y: 10 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      expect(checkLineIntersection(newLine, existingLines)).toBe(true);
    });

    it('returns false when no intersection', () => {
      const newLine: Line = {
        id: '3',
        start: { x: 20, y: 0 },
        end: { x: 20, y: 10 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      expect(checkLineIntersection(newLine, existingLines)).toBe(false);
    });

    it('returns false when line list is empty', () => {
      const newLine: Line = {
        id: '3',
        start: { x: 5, y: 0 },
        end: { x: 5, y: 10 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      expect(checkLineIntersection(newLine, [])).toBe(false);
    });

    it('detects intersection with multiple lines', () => {
      const newLine: Line = {
        id: '3',
        start: { x: -5, y: 5 },
        end: { x: 20, y: 5 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      };
      // This line intersects both existing lines
      expect(checkLineIntersection(newLine, existingLines)).toBe(true);
    });
  });
});
