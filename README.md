# Room Planner

A visual room layout application built with React, TypeScript, and Vite. Design room layouts on an interactive grid-based canvas with walls, doors, and windows.

## Features

### Current (v1.0)
- **Grid-based Canvas**: Graph paper style layout with configurable grid size
- **Line Drawing**: Draw walls, doors, and windows along grid lines
- **Interactive Tools**: Select different drawing tools and line types
- **Data Persistence**: Automatically saves your layout to local storage
- **Import/Export**: Save and load layouts as JSON files

### Planned Features
- Diagonal and curved line drawing
- Furniture placement and management
- Line editing (move endpoints, delete)
- Undo/redo functionality
- Measurements and dimensions
- Export to image/PDF

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

1. **Select a tool** from the toolbar (currently only line drawing is available)
2. **Choose line type**: Wall, Door, or Window
3. **Draw on the canvas**: Click and drag to draw lines that snap to the grid
4. **Export your layout**: Save your design as a JSON file
5. **Import layouts**: Load previously saved designs

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
