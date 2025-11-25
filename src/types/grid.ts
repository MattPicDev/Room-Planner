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
  gridAlignedMode: boolean; // Whether lines must align to grid
  snapToEndpoints: boolean; // Whether to snap to existing line endpoints
  snapToGrid: boolean; // Whether to snap to grid lines/intersections in free-form mode
  snapDistance: number; // Snap distance in pixels
  showLineDimensions: boolean; // Whether to display line lengths as text labels
  preventOverlapping: boolean; // Whether to prevent overlapping lines
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  cellSize: 20, // 20px per grid square
  width: 800,
  height: 600,
  gridColor: '#d0d0d0',
  backgroundColor: '#ffffff',
  inchesPerCell: 6, // Default: 6 inches per cell
  gridAlignedMode: true, // Start with grid-aligned mode
  snapToEndpoints: true, // Enable endpoint snapping by default
  snapToGrid: true, // Enable grid snapping by default
  snapDistance: 2.5, // Default: 1/8 of a 20px cell = 2.5px
  showLineDimensions: true, // Show dimensions by default
  preventOverlapping: true, // Prevent overlapping lines by default
};
