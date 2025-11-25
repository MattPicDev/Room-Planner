# Room Planner

A visual room layout application built with React, TypeScript, and Vite. Design room layouts on an interactive grid-based canvas with walls, doors, and windows.

## Features

### Current (v1.0)
- **Grid-based Canvas**: Graph paper style layout with configurable grid size
- **Measurement System**: Set scale (inches per grid square) for real-world accuracy
- **Line Drawing**: Draw walls, doors, and windows along grid lines with live length display
- **Line Editing**: Select lines, drag endpoints to resize, translate entire lines, and delete lines
- **Pan & Zoom**: Smooth viewport navigation with mouse wheel zoom and spacebar/middle-click panning
- **Furniture Management**: Create custom furniture templates with dimensions in inches
- **Furniture Editing**: Move and rotate furniture with drag-and-drop
- **Interactive Tools**: Draw mode, furniture mode, and select mode with visual feedback
- **Data Persistence**: Automatically saves layouts, furniture, and scale to local storage
- **Import/Export**: Save and load complete layouts including measurements as JSON files
- **Testing**: Comprehensive test suite with 77+ unit tests covering all features

### Planned Features
- Diagonal and curved line drawing
- Furniture collision prevention (detection helpers implemented)
- Non-rectangular furniture shapes
- Undo/redo functionality
- Export to image/PDF
- Multi-select and bulk operations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Setting Grid Scale
- On first launch, you'll be prompted to set the grid scale
- Enter how many inches each grid square represents (e.g., 6", 12", 24")
- Common values: 6" (half-foot), 12" (1 foot), 24" (2 feet)
- The scale is displayed in the toolbar and used for all measurements
- Use **Reset** to clear the layout and set a new scale

### Pan and Zoom
- **Zoom**: Use mouse wheel to zoom in and out (range: 10% to 500%)
- **Pan**: Hold **Spacebar** or **Middle Mouse Button** and drag to pan around the canvas
- The zoom level is displayed in the toolbar (e.g., "Zoom: 100%")
- Zoom maintains the position under your cursor for easy navigation and precise work
- All elements (grid, lines, furniture) scale together maintaining accurate proportions
- Zoom is especially useful for detailed work or viewing large room layouts

### Drawing Lines
1. Select **Draw Line** tool from the toolbar
2. Choose line type: **Wall**, **Door**, or **Window**
3. Click and drag on the canvas to draw lines that snap to the grid
4. Lines are constrained to horizontal or vertical directions
5. **Live measurement**: The current line length in inches appears in the toolbar

### Editing Lines
1. Select **Select** tool from the toolbar
2. Click on any line to select it (highlighted in blue)
3. **Resize**: Drag the endpoints (blue circles) to change the line length
4. **Move**: Drag the line body (not the endpoints) to translate the entire line without changing its length
5. **Length Display**: When a line is selected, its length appears in the "Selected" section of the toolbar
6. Click **Delete Line** button to remove the selected line
7. Click elsewhere to deselect

### Managing Furniture
1. Click **Furniture** tool to open the furniture library
2. Click **+ Add Furniture** to create a new template:
   - Enter name (e.g., "Sofa", "Table", "Bed")
   - Set dimensions in inches (width × height)
   - Choose a color
   - Optionally add a category
3. Click on a template to select it for placement
4. Click on the grid to place furniture (automatically scales to grid)
5. Use **Select** tool to move furniture by dragging
6. With furniture selected, use **Rotate 90°** to rotate
7. Click **Delete** to remove furniture from the room

### Saving and Loading
- Layouts are automatically saved to browser local storage
- Use **Export** to save as a JSON file (includes scale settings)
- Use **Import** to load a previously saved file (restores scale)
- Use **Reset** to clear everything and set a new grid scale

## Project Structure

```
src/
├── components/
│   ├── Grid/              # Main canvas component
│   ├── Toolbar/           # Tool selection
│   ├── FurnitureLibrary/  # Furniture management
│   └── ScaleModal/        # Grid scale configuration
├── types/                 # TypeScript definitions
│   ├── grid.ts
│   ├── line.ts
│   └── furniture.ts
├── utils/                 # Helper functions
│   ├── gridHelpers.ts     # Grid calculations & scale conversions
│   ├── lineHelpers.ts
│   ├── collisionDetection.ts
│   └── storage.ts         # Local storage & import/export
└── App.tsx                # Main application
```

## Development

This project follows a test-driven development approach:
- All features include tests
- Documentation is updated with each change
- Git commits include code, tests, and docs together

### Running Tests

```bash
# Run tests once
npm test -- --run

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui
```

### Tech Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **HTML5 Canvas** - Grid rendering

## Contributing

1. Features are tracked in `.plan` file
2. Each commit should include:
   - Implementation code
   - Tests
   - Documentation updates

## License

MIT
