/**
 * Mapping Editor Component
 * Allows admins to configure field mappings for providers
 */

import { useState } from 'react';
import { useMappings } from '../hooks/useMappings';
import type { ProviderMapping, FieldMapping } from '../types';

interface MappingEditorProps {
  provider: 'ADP' | 'QuickBooks';
}

export function MappingEditor({ provider }: MappingEditorProps) {
  const { mapping, saveMapping, resetMapping, exportMapping, importMapping } = useMappings(provider);
  const [editedMapping, setEditedMapping] = useState<ProviderMapping>(mapping);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    saveMapping(editedMapping);
    setIsEditing(false);
    alert('Mapping saved successfully');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to default mapping?')) {
      resetMapping();
      setEditedMapping(getDefaultMapping(provider));
      setIsEditing(false);
    }
  };

  const handleExport = () => {
    const json = exportMapping();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${provider}_mapping.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        importMapping(jsonString);
        const importedMapping = JSON.parse(jsonString) as ProviderMapping;
        setEditedMapping(importedMapping);
        alert('Mapping imported successfully');
      } catch (error) {
        alert(`Failed to import mapping: ${error instanceof Error ? error.message : 'Invalid file'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleFieldMappingChange = (index: number, field: keyof FieldMapping, value: string) => {
    const updatedMappings = [...editedMapping.fieldMappings];
    updatedMappings[index] = {
      ...updatedMappings[index],
      [field]: value
    };
    setEditedMapping({
      ...editedMapping,
      fieldMappings: updatedMappings
    });
    setIsEditing(true);
  };

  return (
    <div className="mapping-editor">
      <div className="mapping-header">
        <h3>{provider} Field Mappings</h3>
        <div className="mapping-actions">
          {isEditing && (
            <>
              <button onClick={handleSave} className="btn btn-primary">
                Save Changes
              </button>
              <button onClick={() => { setEditedMapping(mapping); setIsEditing(false); }} className="btn btn-secondary">
                Cancel
              </button>
            </>
          )}
          <button onClick={handleReset} className="btn btn-warning">
            Reset to Default
          </button>
          <button onClick={handleExport} className="btn btn-info">
            Export JSON
          </button>
          <label className="btn btn-info">
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="mapping-table">
        <table>
          <thead>
            <tr>
              <th>Source Field</th>
              <th>Target Field</th>
              <th>Transformation</th>
              <th>Default Value</th>
            </tr>
          </thead>
          <tbody>
            {editedMapping.fieldMappings.map((fieldMapping, index) => (
              <tr key={index}>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={fieldMapping.sourceField}
                      onChange={(e) => handleFieldMappingChange(index, 'sourceField', e.target.value)}
                      className="field-input"
                    />
                  ) : (
                    fieldMapping.sourceField
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={fieldMapping.targetField}
                      onChange={(e) => handleFieldMappingChange(index, 'targetField', e.target.value)}
                      className="field-input"
                    />
                  ) : (
                    fieldMapping.targetField
                  )}
                </td>
                <td>
                  {fieldMapping.transformation || '-'}
                </td>
                <td>
                  {fieldMapping.defaultValue || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mapping-info">
        <p><strong>Note:</strong> Transformations are defined in the mapping configuration. Custom transformations can be added by editing the mapping JSON directly.</p>
      </div>
    </div>
  );
}

