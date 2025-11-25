import type { LineType } from '../../types/line';
import { useState } from 'react';
import './Toolbar.css';

interface ToolbarProps {
  selectedTool: 'line' | 'furniture' | 'select';
  selectedLineType: LineType;
  onToolChange: (tool: 'line' | 'furniture' | 'select') => void;
  onLineTypeChange: (lineType: LineType) => void;
  onClear: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  currentLineLength?: number;
  onLineLengthChange?: (length: number) => void;
  gridScale: number;
  zoomLevel: number;
  gridAlignedMode: boolean;
  onGridAlignedModeChange: (enabled: boolean) => void;
  showLineDimensions: boolean;
  onShowLineDimensionsChange: (show: boolean) => void;
}

export function Toolbar({
  selectedTool,
  selectedLineType,
  onToolChange,
  onLineTypeChange,
  onClear,
  onExport,
  onImport,
  currentLineLength,
  onLineLengthChange,
  gridScale,
  zoomLevel,
  gridAlignedMode,
  onGridAlignedModeChange,
  showLineDimensions,
  onShowLineDimensionsChange,
}: ToolbarProps) {
  const [lengthInput, setLengthInput] = useState('');
  const [isEditingLength, setIsEditingLength] = useState(false);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  const handleLengthEdit = () => {
    if (currentLineLength !== undefined) {
      setLengthInput(currentLineLength.toFixed(1));
      setIsEditingLength(true);
    }
  };

  const handleLengthSubmit = () => {
    const newLength = parseFloat(lengthInput);
    if (!isNaN(newLength) && newLength > 0 && onLineLengthChange) {
      onLineLengthChange(newLength);
    }
    setIsEditingLength(false);
    setLengthInput('');
  };

  const handleLengthKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLengthSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingLength(false);
      setLengthInput('');
    }
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Actions</h3>
        <button onClick={onClear}>Reset</button>
        <button onClick={onExport}>Export</button>
        <label className="file-upload-button">
          Import
          <input
            type="file"
            accept=".json"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="toolbar-section">
        <h3>Tools</h3>
        <button
          className={selectedTool === 'line' ? 'active' : ''}
          onClick={() => onToolChange('line')}
        >
          Draw Line
        </button>
        <button
          className={selectedTool === 'furniture' ? 'active' : ''}
          onClick={() => onToolChange('furniture')}
        >
          Furniture
        </button>
        <button
          className={selectedTool === 'select' ? 'active' : ''}
          onClick={() => onToolChange('select')}
        >
          Select
        </button>
      </div>

      {selectedTool === 'line' && (
        <div className="toolbar-section">
          <h3>Line Type</h3>
          <button
            className={selectedLineType === 'wall' ? 'active' : ''}
            onClick={() => onLineTypeChange('wall')}
          >
            Wall
          </button>
          <button
            className={selectedLineType === 'door' ? 'active' : ''}
            onClick={() => onLineTypeChange('door')}
          >
            Door
          </button>
          <button
            className={selectedLineType === 'window' ? 'active' : ''}
            onClick={() => onLineTypeChange('window')}
          >
            Window
          </button>
        </div>
      )}

      <div className="toolbar-section">
        <h3>Grid</h3>
        <div className="scale-display">
          {gridScale}" per square
        </div>
        <div style={{ marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={gridAlignedMode}
              onChange={(e) => onGridAlignedModeChange(e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Snap to Grid
          </label>
        </div>
      </div>

      <div className="toolbar-section">
        <h3>View</h3>
        <div className="scale-display">
          Zoom: {(zoomLevel * 100).toFixed(0)}%
        </div>
        <div style={{ marginTop: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showLineDimensions}
              onChange={(e) => onShowLineDimensionsChange(e.target.checked)}
              style={{ marginRight: '6px' }}
            />
            Show Dimensions
          </label>
        </div>
      </div>

      {currentLineLength !== undefined && (
        <div className="toolbar-section">
          <h3>Selected</h3>
          {isEditingLength ? (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                type="number"
                value={lengthInput}
                onChange={(e) => setLengthInput(e.target.value)}
                onKeyDown={handleLengthKeyDown}
                onBlur={handleLengthSubmit}
                autoFocus
                step="0.1"
                min="0"
                style={{ width: '60px', padding: '2px 4px' }}
              />
              <span>"</span>
            </div>
          ) : (
            <div 
              className="scale-display" 
              onClick={handleLengthEdit}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="Click to edit length"
            >
              Length: {currentLineLength.toFixed(1)}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
