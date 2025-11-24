import type { Point } from './grid';

export type LineType = 'wall' | 'door' | 'window';

export interface Line {
  id: string;
  start: Point;
  end: Point;
  type: LineType;
  thickness: number;
  color: string;
}

export const LINE_DEFAULTS: Record<LineType, { thickness: number; color: string }> = {
  wall: { thickness: 4, color: '#000000' },
  door: { thickness: 2, color: '#8B4513' },
  window: { thickness: 2, color: '#4169E1' },
};
