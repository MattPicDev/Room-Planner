import type { Point } from '../types/grid';
import type { Line } from '../types/line';

/**
 * Calculate the distance from a point to a line segment
 */
export function distanceToLine(point: Point, line: Line): number {
  const { start, end } = line;
  
  const lineLength = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  
  if (lineLength === 0) {
    return Math.sqrt(
      Math.pow(point.x - start.x, 2) + Math.pow(point.y - start.y, 2)
    );
  }
  
  // Calculate the projection of the point onto the line
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y)) /
        (lineLength * lineLength)
    )
  );
  
  const projectionX = start.x + t * (end.x - start.x);
  const projectionY = start.y + t * (end.y - start.y);
  
  return Math.sqrt(
    Math.pow(point.x - projectionX, 2) + Math.pow(point.y - projectionY, 2)
  );
}

/**
 * Find a line near a point (within threshold distance)
 */
export function findLineAtPoint(
  point: Point,
  lines: Line[],
  threshold: number = 10
): Line | null {
  for (const line of lines) {
    if (distanceToLine(point, line) <= threshold) {
      return line;
    }
  }
  return null;
}

/**
 * Check if a point is near a line endpoint
 */
export function findEndpointAtPoint(
  point: Point,
  line: Line,
  threshold: number = 10
): 'start' | 'end' | null {
  const distToStart = Math.sqrt(
    Math.pow(point.x - line.start.x, 2) + Math.pow(point.y - line.start.y, 2)
  );
  const distToEnd = Math.sqrt(
    Math.pow(point.x - line.end.x, 2) + Math.pow(point.y - line.end.y, 2)
  );
  
  if (distToStart <= threshold) {
    return 'start';
  }
  if (distToEnd <= threshold) {
    return 'end';
  }
  return null;
}
