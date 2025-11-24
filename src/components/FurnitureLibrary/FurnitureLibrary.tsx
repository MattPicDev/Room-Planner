import { useState } from 'react';
import type { FurnitureTemplate } from '../../types/furniture';
import './FurnitureLibrary.css';

interface FurnitureLibraryProps {
  templates: FurnitureTemplate[];
  onAddTemplate: (template: Omit<FurnitureTemplate, 'id'>) => void;
  onDeleteTemplate: (id: string) => void;
  onSelectTemplate: (template: FurnitureTemplate) => void;
  selectedTemplateId?: string;
}

export function FurnitureLibrary({
  templates,
  onAddTemplate,
  onDeleteTemplate,
  onSelectTemplate,
  selectedTemplateId,
}: FurnitureLibraryProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    width: 24,
    height: 18,
    color: '#3498db',
    category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTemplate.name.trim() && newTemplate.width > 0 && newTemplate.height > 0) {
      onAddTemplate(newTemplate);
      setNewTemplate({
        name: '',
        width: 24,
        height: 18,
        color: '#3498db',
        category: '',
      });
      setIsAddingNew(false);
    }
  };

  return (
    <div className="furniture-library">
      <div className="library-header">
        <h3>Furniture Library</h3>
        <button
          className="add-furniture-btn"
          onClick={() => setIsAddingNew(!isAddingNew)}
        >
          {isAddingNew ? 'Cancel' : '+ Add Furniture'}
        </button>
      </div>

      {isAddingNew && (
        <form className="furniture-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name (e.g., Sofa)"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            required
          />
          <div className="dimension-inputs">
            <label>
              Width (inches):
              <input
                type="number"
                min="1"
                max="240"
                step="0.5"
                value={newTemplate.width}
                onChange={(e) => setNewTemplate({ ...newTemplate, width: parseFloat(e.target.value) })}
                required
              />
            </label>
            <label>
              Height (inches):
              <input
                type="number"
                min="1"
                max="240"
                step="0.5"
                value={newTemplate.height}
                onChange={(e) => setNewTemplate({ ...newTemplate, height: parseFloat(e.target.value) })}
                required
              />
            </label>
          </div>
          <label>
            Color:
            <input
              type="color"
              value={newTemplate.color}
              onChange={(e) => setNewTemplate({ ...newTemplate, color: e.target.value })}
            />
          </label>
          <input
            type="text"
            placeholder="Category (optional)"
            value={newTemplate.category}
            onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
          />
          <button type="submit" className="submit-btn">Add Template</button>
        </form>
      )}

      <div className="template-list">
        {templates.length === 0 ? (
          <p className="empty-message">No furniture templates yet. Click "Add Furniture" to create one.</p>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className={`template-item ${selectedTemplateId === template.id ? 'selected' : ''}`}
              onClick={() => onSelectTemplate(template)}
            >
              <div
                className="template-preview"
                style={{
                  backgroundColor: template.color,
                  width: `${template.width * 10}px`,
                  height: `${template.height * 10}px`,
                }}
              />
              <div className="template-info">
                <div className="template-name">{template.name}</div>
                <div className="template-dimensions">
                  {template.width}"×{template.height}"
                </div>
                {template.category && (
                  <div className="template-category">{template.category}</div>
                )}
              </div>
              <button
                className="delete-template-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTemplate(template.id);
                }}
                title="Delete template"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
