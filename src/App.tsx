import { useState, useEffect } from 'react';
import { Grid } from './components/Grid/Grid';
import { Toolbar } from './components/Toolbar/Toolbar';
import type { Line, LineType } from './types/line';
import { DEFAULT_GRID_CONFIG } from './types/grid';
import { LINE_DEFAULTS } from './types/line';
import { saveLines, loadLines, exportLayout, importLayout } from './utils/storage';
import './App.css';

function App() {
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedTool, setSelectedTool] = useState<'line' | 'furniture' | 'select'>('line');
  const [selectedLineType, setSelectedLineType] = useState<LineType>('wall');

  // Load saved data on mount
  useEffect(() => {
    const savedLines = loadLines();
    setLines(savedLines);
  }, []);

  // Save lines whenever they change
  useEffect(() => {
    saveLines(lines);
  }, [lines]);

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
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all lines?')) {
      setLines([]);
    }
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
        alert('Layout imported successfully!');
      } else {
        alert('Failed to import layout. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Room Planner</h1>
        <p>Design your room layout on a grid</p>
      </header>
      
      <Toolbar
        selectedTool={selectedTool}
        selectedLineType={selectedLineType}
        onToolChange={setSelectedTool}
        onLineTypeChange={setSelectedLineType}
        onClear={handleClear}
        onExport={handleExport}
        onImport={handleImport}
      />

      <main className="app-main">
        <Grid
          config={DEFAULT_GRID_CONFIG}
          lines={lines}
          onLineAdd={handleLineAdd}
          onLineEdit={handleLineEdit}
          onLineDelete={handleLineDelete}
        />
      </main>
    </div>
  );
}

export default App;
