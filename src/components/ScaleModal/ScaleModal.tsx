import { useState } from 'react';
import './ScaleModal.css';

interface ScaleModalProps {
  isOpen: boolean;
  currentScale?: number;
  onConfirm: (inchesPerCell: number) => void;
  onCancel?: () => void;
}

export function ScaleModal({ isOpen, currentScale, onConfirm, onCancel }: ScaleModalProps) {
  const [inchesPerCell, setInchesPerCell] = useState<string>(currentScale?.toString() || '12');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(inchesPerCell);
    
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid positive number');
      return;
    }

    if (value < 1 || value > 120) {
      setError('Please enter a value between 1 and 120 inches');
      return;
    }

    onConfirm(value);
    setError('');
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setError('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Set Grid Scale</h2>
        <p className="modal-description">
          Specify how many inches each grid square represents. This helps you create accurate room layouts with real-world measurements.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="inchesPerCell">
              Inches per grid square:
            </label>
            <input
              type="number"
              id="inchesPerCell"
              value={inchesPerCell}
              onChange={(e) => {
                setInchesPerCell(e.target.value);
                setError('');
              }}
              min="1"
              max="120"
              step="0.5"
              autoFocus
              required
            />
            <span className="hint">Common values: 6" (half-foot), 12" (1 foot), 24" (2 feet)</span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            {onCancel && (
              <button type="button" className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="confirm-button">
              {currentScale ? 'Update Scale' : 'Set Scale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
