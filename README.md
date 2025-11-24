# Room Planner

A visual room layout application built with React, TypeScript, and Vite. Design room layouts on an interactive grid-based canvas with walls, doors, and windows.

## Features

### Current (v1.0)
- **Grid-based Canvas**: Graph paper style layout with configurable grid size
- **Line Drawing**: Draw walls, doors, and windows along grid lines
- **Line Editing**: Select lines, drag endpoints to resize/move, and delete lines
- **Interactive Tools**: Draw mode and select mode with visual feedback
- **Data Persistence**: Automatically saves your layout to local storage
- **Import/Export**: Save and load layouts as JSON files
- **Testing**: Comprehensive test suite with 29+ unit tests

### Planned Features
- Diagonal and curved line drawing
- Furniture placement and management
- Undo/redo functionality
- Measurements and dimensions
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

### Drawing Lines
1. Select **Draw Line** tool from the toolbar
2. Choose line type: **Wall**, **Door**, or **Window**
3. Click and drag on the canvas to draw lines that snap to the grid
4. Lines are constrained to horizontal or vertical directions

### Editing Lines
1. Select **Select** tool from the toolbar
2. Click on any line to select it (highlighted in blue)
3. Drag the endpoints (blue circles) to resize or move the line
4. Click **Delete Line** button to remove the selected line
5. Click elsewhere to deselect

### Saving and Loading
- Layouts are automatically saved to browser local storage
- Use **Export** to save as a JSON file
- Use **Import** to load a previously saved file
- Use **Clear All** to start fresh

## Project Structure

```
src/
├── components/
│   ├── Grid/           # Main canvas component
│   └── Toolbar/        # Tool selection UI
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
│   ├── gridHelpers.ts
│   ├── collisionDetection.ts
│   └── storage.ts
└── App.tsx             # Main application
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
