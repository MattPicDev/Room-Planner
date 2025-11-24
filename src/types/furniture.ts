import type { Point } from './grid';

export interface FurnitureTemplate {
  id: string;
  name: string;
  width: number; // in grid squares
  height: number; // in grid squares
  color: string;
  category?: string;
}

export interface FurnitureInstance {
  id: string;
  templateId: string;
  position: Point; // grid coordinates
  rotation: 0 | 90 | 180 | 270; // degrees
}

export interface FurnitureWithTemplate extends FurnitureInstance {
  template: FurnitureTemplate;
}
