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

/**
 * Check if two line segments intersect
 * Based on: https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
 */
export function doLinesIntersect(line1: Line, line2: Line): boolean {
  const { start: p1, end: p2 } = line1;
  const { start: p3, end: p4 } = line2;

  // Calculate direction vectors
  const d1x = p2.x - p1.x;
  const d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x;
  const d2y = p4.y - p3.y;

  // Calculate determinant (cross product of direction vectors)
  const denominator = d1x * d2y - d1y * d2x;

  // Lines are parallel or coincident if denominator is 0
  if (Math.abs(denominator) < 1e-10) {
    // Check if lines are coincident (overlapping)
    return checkCoincidentOverlap(line1, line2);
  }

  // Calculate parameters for intersection point
  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denominator;
  const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / denominator;

  // Lines intersect if both parameters are between 0 and 1
  // Allow sharing endpoints (t or u can be exactly 0 or 1)
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

/**
 * Check if two coincident (parallel and on same line) segments overlap
 */
function checkCoincidentOverlap(line1: Line, line2: Line): boolean {
  const { start: p1, end: p2 } = line1;
  const { start: p3, end: p4 } = line2;

  // Calculate direction vector
  const d1x = p2.x - p1.x;
  const d1y = p2.y - p1.y;

  // Check if all four points are collinear
  const area1 = d1x * (p3.y - p1.y) - d1y * (p3.x - p1.x);
  const area2 = d1x * (p4.y - p1.y) - d1y * (p4.x - p1.x);

  // If not collinear, they don't overlap
  if (Math.abs(area1) > 1e-10 || Math.abs(area2) > 1e-10) {
    return false;
  }

  // Check if segments overlap along the line
  // Project all points onto the line direction
  const length1Sq = d1x * d1x + d1y * d1y;
  if (length1Sq === 0) return false;

  const proj1 = 0; // p1 projects to 0
  const proj2 = ((p2.x - p1.x) * d1x + (p2.y - p1.y) * d1y) / Math.sqrt(length1Sq);
  const proj3 = ((p3.x - p1.x) * d1x + (p3.y - p1.y) * d1y) / Math.sqrt(length1Sq);
  const proj4 = ((p4.x - p1.x) * d1x + (p4.y - p1.y) * d1y) / Math.sqrt(length1Sq);

  // Sort projections for each segment
  const min1 = Math.min(proj1, proj2);
  const max1 = Math.max(proj1, proj2);
  const min2 = Math.min(proj3, proj4);
  const max2 = Math.max(proj3, proj4);

  // Segments overlap if their projection ranges overlap
  return max1 >= min2 && max2 >= min1;
}

/**
 * Check if a line intersects with any existing lines
 */
export function checkLineIntersection(newLine: Line, existingLines: Line[]): boolean {
  for (const existingLine of existingLines) {
    if (doLinesIntersect(newLine, existingLine)) {
      return true;
    }
  }
  return false;
}
