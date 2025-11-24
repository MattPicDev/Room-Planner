import type { FurnitureTemplate } from '../types/furniture';
import type { Line } from '../types/line';

const STORAGE_KEYS = {
  FURNITURE_TEMPLATES: 'roomPlanner_furnitureTemplates',
  LAYOUT_LINES: 'roomPlanner_lines',
  LAYOUT_FURNITURE: 'roomPlanner_furniture',
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
 * Export entire layout as JSON
 */
export function exportLayout(): string {
  return JSON.stringify({
    lines: loadLines(),
    furniture: localStorage.getItem(STORAGE_KEYS.LAYOUT_FURNITURE) || '[]',
    templates: loadFurnitureTemplates(),
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
    if (data.templates) {
      saveFurnitureTemplates(data.templates);
    }
    return true;
  } catch (error) {
    console.error('Failed to import layout:', error);
    return false;
  }
}
