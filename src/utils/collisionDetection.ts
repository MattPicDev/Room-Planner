import type { Point } from '../types/grid';
import type { FurnitureInstance, FurnitureTemplate } from '../types/furniture';

/**
 * Get the bounding box of a furniture instance
 */
export function getFurnitureBounds(
  furniture: FurnitureInstance,
  template: FurnitureTemplate
): { x: number; y: number; width: number; height: number } {
  const { position, rotation } = furniture;
  const { width, height } = template;

  // Handle rotation - swap dimensions for 90/270 degree rotations
  const isRotated = rotation === 90 || rotation === 270;
  const actualWidth = isRotated ? height : width;
  const actualHeight = isRotated ? width : height;

  return {
    x: position.x,
    y: position.y,
    width: actualWidth,
    height: actualHeight,
  };
}

/**
 * Check if two furniture instances collide
 */
export function checkFurnitureCollision(
  f1: FurnitureInstance,
  t1: FurnitureTemplate,
  f2: FurnitureInstance,
  t2: FurnitureTemplate
): boolean {
  const b1 = getFurnitureBounds(f1, t1);
  const b2 = getFurnitureBounds(f2, t2);

  return !(
    b1.x + b1.width <= b2.x ||
    b2.x + b2.width <= b1.x ||
    b1.y + b1.height <= b2.y ||
    b2.y + b2.height <= b1.y
  );
}

/**
 * Check if a point is inside a furniture instance
 */
export function isPointInFurniture(
  point: Point,
  furniture: FurnitureInstance,
  template: FurnitureTemplate
): boolean {
  const bounds = getFurnitureBounds(furniture, template);
  return (
    point.x >= bounds.x &&
    point.x < bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y < bounds.y + bounds.height
  );
}
