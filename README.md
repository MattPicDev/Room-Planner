# Room Planner

A visual room layout application built with React, TypeScript, and Vite. Design room layouts on an interactive grid-based canvas with walls, doors, and windows.

## AI-Generated Project

This project was developed through a collaborative human-AI partnership using **Claude Sonnet 4.5** as the development assistant. The development process showcases how AI can effectively build complete, production-ready applications with proper testing and documentation.

### Development Approach

The project began with a `.plan` file that outlined the vision and feature requirements. Through iterative development:

1. **Planning**: The human developer (MattPicDev) provided the initial concept and high-level requirements in `.plan`
2. **Implementation**: Claude Sonnet 4.5 implemented features, following best practices for React/TypeScript development
3. **Testing**: Each feature includes comprehensive unit tests (193 tests covering utilities and components)
4. **Documentation**: All features are documented in code, README, and commit messages
5. **Iteration**: Bugs and feature requests were addressed through conversational debugging and enhancement

### Key Highlights

- **Complete test coverage**: 204 passing tests including unit and component tests
- **CI/CD pipeline**: GitHub Actions workflow for automated testing on Node.js 18.x and 20.x
- **Production-ready code**: Type-safe TypeScript, proper state management, and error handling
- **User-focused design**: Interactive UI with real-time feedback and auto-save functionality

This project demonstrates AI's capability to:
- Understand complex requirements and translate them into working code
- Write comprehensive tests alongside implementation
- Debug issues through conversation and code analysis
- Maintain consistent code quality and documentation standards
- Handle edge cases and user experience considerations

## Features

### Current (v1.1)
- **Grid-based Canvas**: Graph paper style layout with configurable grid size
- **Measurement System**: Set scale (inches per grid square) for real-world accuracy
- **Flexible Drawing Modes**: Toggle between grid-aligned (horizontal/vertical) and free-form (any angle) line drawing
- **Smart Snapping System**: Lines intelligently snap to endpoints of existing lines or grid lines/intersections
- **Line Drawing**: Draw walls, doors, and windows with live length display
- **Line Dimension Labels**: Optional display of length measurements on all lines (toggle with checkbox)
- **Line Editing**: Select lines, drag endpoints to resize, translate entire lines, edit length by typing, and delete lines
- **Pan & Zoom**: Smooth viewport navigation with mouse wheel zoom and spacebar/middle-click panning
- **Furniture Management**: Create custom furniture templates with dimensions in inches
- **Furniture Editing**: Move and rotate furniture with drag-and-drop
- **Interactive Tools**: Draw mode, furniture mode, and select mode with visual feedback
- **Data Persistence**: Automatically saves layouts, lines, furniture instances, and scale to local storage
- **Import/Export**: Save and load complete layouts including measurements, lines, and furniture as JSON files
- **Testing**: Comprehensive test suite with 204 tests covering all features

### Planned Features
- Visual snap indicators when near endpoints or grid
- Configurable snap distance in UI
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
  - Scrolling over the canvas zooms without scrolling the webpage
  - Zoom maintains the position under your cursor for easy navigation and precise work
- **Pan**: Hold **Spacebar** or **Middle Mouse Button** and drag to pan around the canvas
- The zoom level is displayed in the toolbar (e.g., "Zoom: 100%")
- All elements (grid, lines, furniture) scale together maintaining accurate proportions
- Zoom is especially useful for detailed work or viewing large room layouts

### Drawing Lines
1. Select **Draw Line** tool from the toolbar
2. Choose line type: **Wall**, **Door**, or **Window**
3. Click and drag on the canvas to draw lines
4. **Smart Snapping** (when snap to grid is unchecked):
   - Lines snap to endpoints of existing lines (within 2.5 pixels) - useful for creating connected layouts
   - Lines snap to grid lines/intersections (within 2.5 pixels) - helpful for alignment
   - Endpoint snapping takes priority over grid snapping
5. **Live measurement**: The current line length in inches appears in the toolbar

**Grid Controls** (Grid section):
- **Snap to Grid** checkbox:
  - **Checked**: Lines snap to grid and are constrained to horizontal/vertical directions
  - **Unchecked**: Free-form drawing allows any angle with smart snapping
- **Prevent Overlapping** checkbox:
  - **Checked** (default): Lines cannot overlap or intersect with existing lines
  - **Unchecked**: Lines can be drawn freely without validation, allowing overlapping designs

**View Options** (View section):
- **Show Dimensions** checkbox (enabled by default):
  - **Checked**: All lines display their length in inches as text labels on the canvas
  - Labels match line colors and are positioned above horizontal lines or to the right of vertical lines
  - Labels remain readable at all zoom levels

### Editing Lines
1. Select **Select** tool from the toolbar
2. Click on any line to select it (highlighted in blue)
3. **Resize**: Drag the endpoints (blue circles) to change the line length
4. **Move**: Drag the line body (not the endpoints) to translate the entire line without changing its length
5. **Edit Length**: 
   - Click on the length display in the toolbar "Selected" section
   - Type the desired length in inches and press Enter
   - The line will scale from its start point to the new length
   - Press Escape to cancel editing
6. Click **Delete Line** button to remove the selected line
7. Click elsewhere to deselect

**Note**: The **Snap to Grid** checkbox (in Grid section) affects line editing - checked = snap to grid, unchecked = free positioning.

### Managing Furniture
1. Click **Furniture** tool to open the furniture library
2. Click **+ Add Furniture** to create a new template:
   - Enter name (e.g., "Sofa", "Table", "Bed")
   - Set dimensions in inches (width × height)
   - Choose a color
   - Optionally add a category
3. Click on a template to select it for placement
4. Click on the grid to place furniture
5. Use **Select** tool to move furniture by dragging
6. With furniture selected, use **Rotate 90°** to rotate
7. Click **Delete** to remove furniture from the room

**Note**: The **Snap to Grid** checkbox (in Grid section) controls furniture placement and movement - checked = grid-aligned, unchecked = free placement.

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
