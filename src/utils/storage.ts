import type { FurnitureTemplate, FurnitureInstance } from '../types/furniture';
import type { Line } from '../types/line';

const STORAGE_KEYS = {
  FURNITURE_TEMPLATES: 'roomPlanner_furnitureTemplates',
  LAYOUT_LINES: 'roomPlanner_lines',
  LAYOUT_FURNITURE: 'roomPlanner_furniture',
  GRID_SCALE: 'roomPlanner_gridScale',
} as const;

/**
 * Save furniture templates to local storage
 */
export function saveFurnitureTemplates(templates: FurnitureTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FURNITURE_TEMPLATES, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save furniture templates:', error);
  }
}

/**
 * Load furniture templates from local storage
 */
export function loadFurnitureTemplates(): FurnitureTemplate[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FURNITURE_TEMPLATES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load furniture templates:', error);
    return [];
  }
}

/**
 * Save furniture instances to local storage
 */
export function saveFurniture(furniture: FurnitureInstance[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAYOUT_FURNITURE, JSON.stringify(furniture));
  } catch (error) {
    console.error('Failed to save furniture:', error);
  }
}

/**
 * Load furniture instances from local storage
 */
export function loadFurniture(): FurnitureInstance[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LAYOUT_FURNITURE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load furniture:', error);
    return [];
  }
}

/**
 * Save lines to local storage
 */
export function saveLines(lines: Line[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAYOUT_LINES, JSON.stringify(lines));
  } catch (error) {
    console.error('Failed to save lines:', error);
  }
}

/**
 * Load lines from local storage
 */
export function loadLines(): Line[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LAYOUT_LINES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load lines:', error);
    return [];
  }
}

/**
 * Save grid scale to local storage
 */
export function saveGridScale(inchesPerCell: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GRID_SCALE, JSON.stringify(inchesPerCell));
  } catch (error) {
    console.error('Failed to save grid scale:', error);
  }
}

/**
 * Load grid scale from local storage
 */
export function loadGridScale(): number | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GRID_SCALE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load grid scale:', error);
    return null;
  }
}

/**
 * Export entire layout as JSON
 */
export function exportLayout(): string {
  return JSON.stringify({
    lines: loadLines(),
    furniture: loadFurniture(),
    templates: loadFurnitureTemplates(),
    gridScale: loadGridScale(),
    version: '1.0',
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

/**
 * Import layout from JSON string
 */
export function importLayout(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.lines) {
      saveLines(data.lines);
    }
    if (data.furniture) {
      saveFurniture(data.furniture);
    }
    if (data.templates) {
      saveFurnitureTemplates(data.templates);
    }
    if (data.gridScale !== undefined) {
      saveGridScale(data.gridScale);
    }
    return true;
  } catch (error) {
    console.error('Failed to import layout:', error);
    return false;
  }
}
