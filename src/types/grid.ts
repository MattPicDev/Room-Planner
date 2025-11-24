export interface Point {
  x: number;
  y: number;
}

export interface GridConfig {
  cellSize: number;
  width: number;
  height: number;
  gridColor: string;
  backgroundColor: string;
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  cellSize: 20, // 20px per grid square
  width: 800,
  height: 600,
  gridColor: '#d0d0d0',
  backgroundColor: '#ffffff',
};
