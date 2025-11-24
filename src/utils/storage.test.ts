import { describe, it, expect } from 'vitest';
import type { FurnitureTemplate } from '../types/furniture';
import type { Line } from '../types/line';
import { 
  saveFurnitureTemplates, 
  loadFurnitureTemplates, 
  saveLines, 
  loadLines,
  exportLayout,
  importLayout
} from './storage';

describe('storage', () => {
  // Clear localStorage before each test
  beforeEach(() => {
    localStorage.clear();
  });

  describe('furnitureTemplates', () => {
    it('should save and load furniture templates', () => {
      const templates: FurnitureTemplate[] = [
        {
          id: '1',
          name: 'Sofa',
          width: 3,
          height: 2,
          color: '#3498db',
          category: 'Living Room',
        },
        {
          id: '2',
          name: 'Table',
          width: 2,
          height: 2,
          color: '#8B4513',
        },
      ];

      saveFurnitureTemplates(templates);
      const loaded = loadFurnitureTemplates();

      expect(loaded).toEqual(templates);
    });

    it('should return empty array when no templates saved', () => {
      const loaded = loadFurnitureTemplates();
      expect(loaded).toEqual([]);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('roomPlanner_furnitureTemplates', 'invalid json');
      const loaded = loadFurnitureTemplates();
      expect(loaded).toEqual([]);
    });
  });

  describe('lines', () => {
    it('should save and load lines', () => {
      const lines: Line[] = [
        {
          id: '1',
          start: { x: 0, y: 0 },
          end: { x: 100, y: 0 },
          type: 'wall',
          thickness: 4,
          color: '#000000',
        },
        {
          id: '2',
          start: { x: 0, y: 0 },
          end: { x: 0, y: 100 },
          type: 'door',
          thickness: 2,
          color: '#8B4513',
        },
      ];

      saveLines(lines);
      const loaded = loadLines();

      expect(loaded).toEqual(lines);
    });

    it('should return empty array when no lines saved', () => {
      const loaded = loadLines();
      expect(loaded).toEqual([]);
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('roomPlanner_lines', 'invalid json');
      const loaded = loadLines();
      expect(loaded).toEqual([]);
    });
  });

  describe('exportLayout', () => {
    it('should export layout as JSON string', () => {
      const lines: Line[] = [{
        id: '1',
        start: { x: 0, y: 0 },
        end: { x: 100, y: 0 },
        type: 'wall',
        thickness: 4,
        color: '#000000',
      }];

      const templates: FurnitureTemplate[] = [{
        id: '1',
        name: 'Sofa',
        width: 3,
        height: 2,
        color: '#3498db',
      }];

      saveLines(lines);
      saveFurnitureTemplates(templates);

      const exported = exportLayout();
      const parsed = JSON.parse(exported);

      expect(parsed.lines).toEqual(lines);
      expect(parsed.templates).toEqual(templates);
      expect(parsed.version).toBe('1.0');
      expect(parsed.exportedAt).toBeDefined();
    });
  });

  describe('importLayout', () => {
    it('should import valid layout JSON', () => {
      const layoutData = {
        lines: [{
          id: '1',
          start: { x: 0, y: 0 },
          end: { x: 100, y: 0 },
          type: 'wall',
          thickness: 4,
          color: '#000000',
        }],
        templates: [{
          id: '1',
          name: 'Chair',
          width: 1,
          height: 1,
          color: '#e74c3c',
        }],
        version: '1.0',
      };

      const result = importLayout(JSON.stringify(layoutData));
      expect(result).toBe(true);

      const loadedLines = loadLines();
      const loadedTemplates = loadFurnitureTemplates();

      expect(loadedLines).toEqual(layoutData.lines);
      expect(loadedTemplates).toEqual(layoutData.templates);
    });

    it('should return false for invalid JSON', () => {
      const result = importLayout('invalid json');
      expect(result).toBe(false);
    });

    it('should handle partial data gracefully', () => {
      const layoutData = {
        lines: [],
      };

      const result = importLayout(JSON.stringify(layoutData));
      expect(result).toBe(true);

      const loadedLines = loadLines();
      expect(loadedLines).toEqual([]);
    });
  });
});
