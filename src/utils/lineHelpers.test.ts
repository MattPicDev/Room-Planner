import { describe, it, expect } from 'vitest';
import { distanceToLine, findLineAtPoint, findEndpointAtPoint } from './lineHelpers';
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
});
