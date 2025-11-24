import { describe, it, expect } from 'vitest';
import { getFurnitureBounds, checkFurnitureCollision, isPointInFurniture } from './collisionDetection';
import type { FurnitureInstance, FurnitureTemplate } from '../types/furniture';

describe('collisionDetection', () => {
  const testTemplate: FurnitureTemplate = {
    id: 'template-1',
    name: 'Sofa',
    width: 36, // 36 inches
    height: 24, // 24 inches
    color: '#3498db',
  };

  const testFurniture: FurnitureInstance = {
    id: 'furniture-1',
    templateId: 'template-1',
    position: { x: 5, y: 5 },
    rotation: 0,
  };

  const inchesPerCell = 12; // 12 inches per grid cell

  describe('getFurnitureBounds', () => {
    it('should return correct bounds for non-rotated furniture in cells', () => {
      const bounds = getFurnitureBounds(testFurniture, testTemplate, inchesPerCell);
      // 36" / 12" per cell = 3 cells, 24" / 12" per cell = 2 cells
      expect(bounds).toEqual({
        x: 5,
        y: 5,
        width: 3,
        height: 2,
      });
    });

    it('should swap dimensions for 90 degree rotation', () => {
      const rotatedFurniture = { ...testFurniture, rotation: 90 as const };
      const bounds = getFurnitureBounds(rotatedFurniture, testTemplate, inchesPerCell);
      // Dimensions swapped: height/width instead of width/height
      expect(bounds).toEqual({
        x: 5,
        y: 5,
        width: 2,
        height: 3,
      });
    });

    it('should swap dimensions for 270 degree rotation', () => {
      const rotatedFurniture = { ...testFurniture, rotation: 270 as const };
      const bounds = getFurnitureBounds(rotatedFurniture, testTemplate, inchesPerCell);
      expect(bounds).toEqual({
        x: 5,
        y: 5,
        width: 2,
        height: 3,
      });
    });

    it('should not swap dimensions for 180 degree rotation', () => {
      const rotatedFurniture = { ...testFurniture, rotation: 180 as const };
      const bounds = getFurnitureBounds(rotatedFurniture, testTemplate, inchesPerCell);
      expect(bounds).toEqual({
        x: 5,
        y: 5,
        width: 3,
        height: 2,
      });
    });

    it('should work with different scale', () => {
      const scale = 6; // 6 inches per cell
      const bounds = getFurnitureBounds(testFurniture, testTemplate, scale);
      // 36" / 6" per cell = 6 cells, 24" / 6" per cell = 4 cells
      expect(bounds).toEqual({
        x: 5,
        y: 5,
        width: 6,
        height: 4,
      });
    });
  });

  describe('checkFurnitureCollision', () => {
    const template2: FurnitureTemplate = {
      id: 'template-2',
      name: 'Chair',
      width: 12, // 12 inches
      height: 12, // 12 inches
      color: '#e74c3c',
    };

    it('should detect collision when furniture overlaps', () => {
      const furniture2: FurnitureInstance = {
        id: 'furniture-2',
        templateId: 'template-2',
        position: { x: 6, y: 6 },
        rotation: 0,
      };

      const collision = checkFurnitureCollision(
        testFurniture,
        testTemplate,
        furniture2,
        template2,
        inchesPerCell
      );
      expect(collision).toBe(true);
    });

    it('should not detect collision when furniture is separated', () => {
      const furniture2: FurnitureInstance = {
        id: 'furniture-2',
        templateId: 'template-2',
        position: { x: 10, y: 10 },
        rotation: 0,
      };

      const collision = checkFurnitureCollision(
        testFurniture,
        testTemplate,
        furniture2,
        template2
      );
      expect(collision).toBe(false);
    });

    it('should not detect collision when furniture is adjacent but not overlapping', () => {
      const furniture2: FurnitureInstance = {
        id: 'furniture-2',
        templateId: 'template-2',
        position: { x: 8, y: 5 }, // Right next to testFurniture (which ends at x=8)
        rotation: 0,
      };

      const collision = checkFurnitureCollision(
        testFurniture,
        testTemplate,
        furniture2,
        template2
      );
      expect(collision).toBe(false);
    });

    it('should detect collision with rotated furniture', () => {
      const rotatedFurniture: FurnitureInstance = {
        id: 'furniture-2',
        templateId: 'template-1',
        position: { x: 6, y: 4 },
        rotation: 90,
      };

      const collision = checkFurnitureCollision(
        testFurniture,
        testTemplate,
        rotatedFurniture,
        testTemplate,
        inchesPerCell
      );
      expect(collision).toBe(true);
    });
  });

  describe('isPointInFurniture', () => {
    it('should return true for point inside furniture', () => {
      const point = { x: 6, y: 6 };
      const result = isPointInFurniture(point, testFurniture, testTemplate, inchesPerCell);
      expect(result).toBe(true);
    });

    it('should return true for point at furniture boundary', () => {
      const point = { x: 5, y: 5 };
      const result = isPointInFurniture(point, testFurniture, testTemplate, inchesPerCell);
      expect(result).toBe(true);
    });

    it('should return false for point outside furniture', () => {
      const point = { x: 10, y: 10 };
      const result = isPointInFurniture(point, testFurniture, testTemplate, inchesPerCell);
      expect(result).toBe(false);
    });

    it('should return false for point at the edge (exclusive)', () => {
      const point = { x: 8, y: 7 }; // Width=3, height=2, so x:5-7, y:5-6
      const result = isPointInFurniture(point, testFurniture, testTemplate, inchesPerCell);
      expect(result).toBe(false);
    });

    it('should work correctly with rotated furniture', () => {
      const rotatedFurniture = { ...testFurniture, rotation: 90 as const };
      // Rotated: width=2, height=3, so x:5-6, y:5-7
      const point = { x: 6, y: 7 };
      const result = isPointInFurniture(point, rotatedFurniture, testTemplate, inchesPerCell);
      expect(result).toBe(true);
    });

    it('should return false for point outside rotated furniture', () => {
      const rotatedFurniture = { ...testFurniture, rotation: 90 as const };
      const point = { x: 7, y: 6 }; // Just outside rotated bounds
      const result = isPointInFurniture(point, rotatedFurniture, testTemplate, inchesPerCell);
      expect(result).toBe(false);
    });
  });
});
