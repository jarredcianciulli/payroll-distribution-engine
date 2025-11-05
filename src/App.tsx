/**
 * Main App Component
 * SFTP Export Engine
 */

import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { ProcessingDashboard } from './components/ProcessingDashboard';
import { MappingEditor } from './components/MappingEditor';
import type { EmployeeRecord, ProcessingWarning } from './types';

function App() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [warnings, setWarnings] = useState<ProcessingWarning[]>([]);
  const [headerFields, setHeaderFields] = useState<string[] | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'upload' | 'process' | 'mappings'>('upload');
  const [selectedProvider, setSelectedProvider] = useState<'ADP' | 'QuickBooks'>('ADP');

  const handleUploadComplete = (rows: EmployeeRecord[], uploadWarnings: ProcessingWarning[], uploadHeaderFields?: string[]) => {
    setEmployees(rows);
    setWarnings(uploadWarnings);
    setHeaderFields(uploadHeaderFields);
    setActiveTab('process');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>SFTP Export Engine</h1>
        <p className="subtitle">Transform employee data into provider-specific formats (ADP, QuickBooks)</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          Upload CSV
        </button>
        <button
          className={activeTab === 'process' ? 'active' : ''}
          onClick={() => setActiveTab('process')}
          disabled={employees.length === 0}
        >
          Process Employee data
        </button>
        <button
          className={activeTab === 'mappings' ? 'active' : ''}
          onClick={() => setActiveTab('mappings')}
        >
          Mapping Configuration
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'upload' && (
          <FileUpload onUploadComplete={handleUploadComplete} />
        )}

        {activeTab === 'process' && (
          <ProcessingDashboard 
            employees={employees} 
            warnings={warnings}
            headerFields={headerFields}
            onEmployeesUpdated={handleUploadComplete}
          />
        )}

        {activeTab === 'mappings' && (
          <div className="mappings-section">
            <div className="provider-selector">
              <label>Select Provider:</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as 'ADP' | 'QuickBooks')}
              >
                <option value="ADP">ADP</option>
                <option value="QuickBooks">QuickBooks</option>
              </select>
            </div>
            <MappingEditor provider={selectedProvider} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>SFTP Export Engine - Demo for onboarding platform integration</p>
      </footer>
    </div>
  );
}

export default App;

