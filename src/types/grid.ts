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
  inchesPerCell: number; // How many inches each grid cell represents
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  cellSize: 20, // 20px per grid square
  width: 800,
  height: 600,
  gridColor: '#d0d0d0',
  backgroundColor: '#ffffff',
  inchesPerCell: 12, // Default: 12 inches (1 foot) per cell
};
