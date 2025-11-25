import { useState, useEffect } from 'react';
import { Grid } from './components/Grid/Grid';
import { Toolbar } from './components/Toolbar/Toolbar';
import { FurnitureLibrary } from './components/FurnitureLibrary/FurnitureLibrary';
import { ScaleModal } from './components/ScaleModal/ScaleModal';
import type { Line, LineType } from './types/line';
import type { FurnitureTemplate, FurnitureInstance } from './types/furniture';
import { DEFAULT_GRID_CONFIG } from './types/grid';
import type { GridConfig } from './types/grid';
import { LINE_DEFAULTS } from './types/line';
import { saveLines, loadLines, exportLayout, importLayout, saveFurnitureTemplates, loadFurnitureTemplates, saveGridScale, loadGridScale } from './utils/storage';
import './App.css';

function App() {
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedTool, setSelectedTool] = useState<'line' | 'furniture' | 'select'>('line');
  const [selectedLineType, setSelectedLineType] = useState<LineType>('wall');
  const [selectedLine, setSelectedLine] = useState<Line | null>(null);
  const [furnitureTemplates, setFurnitureTemplates] = useState<FurnitureTemplate[]>([]);
  const [furniture, setFurniture] = useState<FurnitureInstance[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<FurnitureTemplate | null>(null);
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureInstance | null>(null);
  const [gridConfig, setGridConfig] = useState<GridConfig>(DEFAULT_GRID_CONFIG);
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [currentLineLength, setCurrentLineLength] = useState<number | undefined>(undefined);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Sync selectedLine when lines array changes
  useEffect(() => {
    if (selectedLine) {
      const updatedLine = lines.find(line => line.id === selectedLine.id);
      if (updatedLine) {
        setSelectedLine(updatedLine);
      } else {
        // Line was deleted
        setSelectedLine(null);
      }
    }
  }, [lines]);

  // Load saved data on mount and show scale modal if not set
  useEffect(() => {
    const savedLines = loadLines();
    setLines(savedLines);
    const savedTemplates = loadFurnitureTemplates();
    setFurnitureTemplates(savedTemplates);
    
    const savedScale = loadGridScale();
    if (savedScale !== null) {
      setGridConfig({ ...DEFAULT_GRID_CONFIG, inchesPerCell: savedScale });
    } else {
      setShowScaleModal(true);
    }
  }, []);

  // Save lines whenever they change
  useEffect(() => {
    saveLines(lines);
  }, [lines]);

  // Save furniture templates whenever they change
  useEffect(() => {
    saveFurnitureTemplates(furnitureTemplates);
  }, [furnitureTemplates]);

  const handleLineAdd = (line: Line) => {
    // Apply current line type settings
    const lineDefaults = LINE_DEFAULTS[selectedLineType];
    const newLine: Line = {
      ...line,
      type: selectedLineType,
      thickness: lineDefaults.thickness,
      color: lineDefaults.color,
    };
    setLines([...lines, newLine]);
  };

  const handleLineEdit = (lineId: string, updates: Partial<Line>) => {
    setLines(lines.map(line => 
      line.id === lineId ? { ...line, ...updates } : line
    ));
  };

  const handleLineDelete = (lineId: string) => {
    setLines(lines.filter(line => line.id !== lineId));
    setSelectedLine(null);
  };

  const handleLineLengthChange = (newLength: number) => {
    if (!selectedLine || newLength <= 0) return;
    
    // Calculate new end point based on desired length
    const currentLength = Math.sqrt(
      Math.pow(selectedLine.end.x - selectedLine.start.x, 2) +
      Math.pow(selectedLine.end.y - selectedLine.start.y, 2)
    );
    
    if (currentLength === 0) return;
    
    // Convert inches to pixels
    const pixelsPerInch = gridConfig.cellSize / gridConfig.inchesPerCell;
    const targetPixelLength = newLength * pixelsPerInch;
    
    // Scale the line from start point
    const scale = targetPixelLength / currentLength;
    const dx = selectedLine.end.x - selectedLine.start.x;
    const dy = selectedLine.end.y - selectedLine.start.y;
    
    const newEnd = {
      x: selectedLine.start.x + dx * scale,
      y: selectedLine.start.y + dy * scale,
    };
    
    handleLineEdit(selectedLine.id, { end: newEnd });
  };

  const handleGridAlignedModeChange = (enabled: boolean) => {
    setGridConfig({ ...gridConfig, gridAlignedMode: enabled });
  };

  const handleClear = () => {
    if (confirm('Reset will clear all lines and furniture, and allow you to set a new grid scale. Continue?')) {
      setLines([]);
      setFurniture([]);
      setSelectedLine(null);
      setSelectedFurniture(null);
      setShowScaleModal(true);
    }
  };

  // Furniture handlers
  const handleAddFurnitureTemplate = (template: Omit<FurnitureTemplate, 'id'>) => {
    const newTemplate: FurnitureTemplate = {
      ...template,
      id: crypto.randomUUID(),
    };
    setFurnitureTemplates([...furnitureTemplates, newTemplate]);
  };

  const handleDeleteFurnitureTemplate = (id: string) => {
    setFurnitureTemplates(furnitureTemplates.filter(t => t.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
    // Remove all furniture instances using this template
    setFurniture(furniture.filter(f => f.templateId !== id));
  };

  const handleSelectTemplate = (template: FurnitureTemplate) => {
    setSelectedTemplate(template);
    setSelectedTool('furniture');
  };

  const handleFurnitureAdd = (item: FurnitureInstance) => {
    setFurniture([...furniture, item]);
  };

  const handleFurnitureMove = (id: string, position: { x: number; y: number }) => {
    setFurniture(furniture.map(f => 
      f.id === id ? { ...f, position } : f
    ));
  };

  const handleFurnitureDelete = (id: string) => {
    setFurniture(furniture.filter(f => f.id !== id));
    setSelectedFurniture(null);
  };

  const handleFurnitureRotate = (id: string) => {
    setFurniture(furniture.map(f => {
      if (f.id === id) {
        const newRotation = ((f.rotation + 90) % 360) as 0 | 90 | 180 | 270;
        return { ...f, rotation: newRotation };
      }
      return f;
    }));
  };

  const handleExport = () => {
    const json = exportLayout();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `room-layout-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importLayout(content)) {
        const importedLines = loadLines();
        setLines(importedLines);
        const importedScale = loadGridScale();
        if (importedScale !== null) {
          setGridConfig({ ...DEFAULT_GRID_CONFIG, inchesPerCell: importedScale });
        }
        alert('Layout imported successfully!');
      } else {
        alert('Failed to import layout. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleScaleConfirm = (inchesPerCell: number) => {
    setGridConfig({ ...DEFAULT_GRID_CONFIG, inchesPerCell });
    saveGridScale(inchesPerCell);
    setShowScaleModal(false);
  };

  return (
    <div className="app">
      <ScaleModal
        isOpen={showScaleModal}
        currentScale={gridConfig.inchesPerCell}
        onConfirm={handleScaleConfirm}
      />
      
      <header className="app-header">
        <h1>Room Planner</h1>
        <p>Design your room layout on a grid</p>
      </header>
      
      <Toolbar
        selectedTool={selectedTool}
        selectedLineType={selectedLineType}
        onToolChange={(tool) => {
          setSelectedTool(tool);
          setSelectedLine(null);
        }}
        onLineTypeChange={setSelectedLineType}
        onClear={handleClear}
        onExport={handleExport}
        onImport={handleImport}
        currentLineLength={currentLineLength}
        onLineLengthChange={handleLineLengthChange}
        gridScale={gridConfig.inchesPerCell}
        zoomLevel={zoomLevel}
        gridAlignedMode={gridConfig.gridAlignedMode}
        onGridAlignedModeChange={handleGridAlignedModeChange}
      />

      <main className="app-main">
        <div className="layout-container">
          {(selectedTool === 'furniture' || furnitureTemplates.length > 0) && (
            <FurnitureLibrary
              templates={furnitureTemplates}
              onAddTemplate={handleAddFurnitureTemplate}
              onDeleteTemplate={handleDeleteFurnitureTemplate}
              onSelectTemplate={handleSelectTemplate}
              selectedTemplateId={selectedTemplate?.id}
            />
          )}

          <div className="grid-section">
            {selectedLine && (
              <div className="selection-info">
                <div className="selection-details">
                  <span className="selection-label">
                    Selected: {selectedLine.type.charAt(0).toUpperCase() + selectedLine.type.slice(1)}
                  </span>
                  <button 
                    className="delete-button"
                    onClick={() => handleLineDelete(selectedLine.id)}
                  >
                    Delete Line
                  </button>
                </div>
              </div>
            )}

            {selectedFurniture && (
              <div className="selection-info">
                <div className="selection-details">
                  <span className="selection-label">
                    Selected: {furnitureTemplates.find(t => t.id === selectedFurniture.templateId)?.name}
                  </span>
                  <button 
                    className="action-button"
                    onClick={() => handleFurnitureRotate(selectedFurniture.id)}
                  >
                    Rotate 90°
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleFurnitureDelete(selectedFurniture.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            
            <Grid
              config={gridConfig}
              lines={lines}
              furniture={furniture}
              furnitureTemplates={furnitureTemplates}
              mode={selectedTool === 'line' ? 'draw' : selectedTool === 'furniture' ? 'furniture' : 'select'}
              selectedTemplate={selectedTemplate}
              onLineAdd={handleLineAdd}
              onLineEdit={handleLineEdit}
              onLineSelect={setSelectedLine}
              selectedLine={selectedLine}
              onFurnitureAdd={handleFurnitureAdd}
              onFurnitureSelect={setSelectedFurniture}
              onFurnitureMove={handleFurnitureMove}
              selectedFurniture={selectedFurniture}
              onCurrentLineLengthChange={setCurrentLineLength}
              onZoomChange={setZoomLevel}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
