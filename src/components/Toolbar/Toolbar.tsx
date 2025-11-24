import type { LineType } from '../../types/line';
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
  gridScale: number;
  zoomLevel: number;
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
  gridScale,
  zoomLevel,
}: ToolbarProps) {
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="toolbar">
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

      <div className="toolbar-section">
        <h3>Grid Scale</h3>
        <div className="scale-display">
          {gridScale}" per square
        </div>
      </div>

      <div className="toolbar-section">
        <h3>View</h3>
        <div className="scale-display">
          Zoom: {(zoomLevel * 100).toFixed(0)}%
        </div>
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
          {currentLineLength !== undefined && (
            <div className="line-length-display">
              Length: {currentLineLength.toFixed(1)}"
            </div>
          )}
        </div>
      )}

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
    </div>
  );
}
