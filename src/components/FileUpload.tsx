/**
 * File Upload Component
 * Handles CSV file upload with drag-and-drop support
 */

import { useState, useRef } from 'react';
import { upload as uploadApi } from '../api';
import type { EmployeeRecord, ProcessingWarning } from '../types';
import { TemplateDownload } from './TemplateDownload';
import { SampleDataDownload } from './SampleDataDownload';

interface FileUploadProps {
  onUploadComplete: (rows: EmployeeRecord[], warnings: ProcessingWarning[], headerFields?: string[]) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<EmployeeRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadApi.uploadFile(file, (_progress) => {
        // Progress updates can be shown here if needed
      });

      setPreview(result.rows.slice(0, 5)); // Preview first 5 rows
      onUploadComplete(result.rows, result.warnings, result.headerFields);
    } catch (error) {
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="file-upload">
      <section className="download-documentation">
        <h3>Download Templates & Documentation</h3>
        <TemplateDownload />
      </section>

      <section className="download-sample-data">
        <h3>Download Sample Data</h3>
        <SampleDataDownload />
      </section>

      <section className="upload-section">
        <h3>Upload Your CSV File</h3>
        <div
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {isUploading ? (
          <p>Uploading and parsing CSV...</p>
        ) : (
          <>
            <p className="upload-text">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p className="upload-hint">CSV file (employees.csv)</p>
          </>
        )}
        </div>
      </section>

      {preview.length > 0 && (
        <div className="preview">
          <h4>Preview (first 5 rows):</h4>
          <div className="preview-table">
            <table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Hire Date</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.employee_id}</td>
                    <td>{row.first_name} {row.last_name}</td>
                    <td>{row.department}</td>
                    <td>{row.hire_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

