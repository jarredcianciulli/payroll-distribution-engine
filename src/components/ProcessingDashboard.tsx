/**
 * Processing Dashboard Component
 * Main dashboard for processing payroll with progress tracking
 */

import { useState, useRef } from 'react';
import { useProcessing } from '../hooks/useProcessing';
import { exportToCSV } from '../utils/csvWriter';
import { upload as uploadApi } from '../api';
import type { EmployeeRecord, ProcessingWarning } from '../types';
import { ProgressLogs } from './ProgressLogs';
import { ErrorCorrection } from './ErrorCorrection';
import { ErrorsModal } from './ErrorsModal';
import { FaDownload } from 'react-icons/fa';
import { IoCheckmarkCircle, IoCloseCircle, IoWarning } from 'react-icons/io5';

interface ProcessingDashboardProps {
  employees: EmployeeRecord[];
  warnings: ProcessingWarning[];
  headerFields?: string[];
  onEmployeesUpdated?: (employees: EmployeeRecord[], warnings: ProcessingWarning[], headerFields?: string[]) => void;
}

export function ProcessingDashboard({ employees, warnings, headerFields, onEmployeesUpdated }: ProcessingDashboardProps) {
  const { progress, result, process, reset } = useProcessing();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingCorrected, setIsUploadingCorrected] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'ADP' | 'QuickBooks'>('ADP');
  const [isErrorsModalOpen, setIsErrorsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = async () => {
    if (employees.length === 0) {
      alert('Please upload a CSV file first');
      return;
    }

    setIsProcessing(true);
    reset();
    try {
      await process(employees, headerFields);
    } catch (error) {
      alert(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadADP = () => {
    if (!result || result.processedEmployees.length === 0) {
      alert('No processed data available. Please process the file first.');
      return;
    }

    const adpRecords = result.processedEmployees.map(pe => pe.adpRecord);
    const headers = Object.keys(adpRecords[0] || {});
    exportToCSV(adpRecords, 'adp_hires.csv', headers);
  };

  const handleDownloadQuickBooks = () => {
    if (!result || result.processedEmployees.length === 0) {
      alert('No processed data available. Please process the file first.');
      return;
    }

    const qbRecords = result.processedEmployees.map(pe => pe.quickBooksRecord);
    const headers = Object.keys(qbRecords[0] || {});
    exportToCSV(qbRecords, 'quickbooks_hires.csv', headers);
  };

  const handleDownloadProvider = () => {
    if (selectedProvider === 'ADP') {
      handleDownloadADP();
    } else {
      handleDownloadQuickBooks();
    }
  };

  const handleDownloadStandardFormat = () => {
    if (!result || result.processedEmployees.length === 0) {
      alert('No processed data available. Please process the file first.');
      return;
    }

    // Get validated employee records (standard format)
    const standardRecords = result.processedEmployees.map(pe => pe.employee);
    
    // Get headers from first record (all EmployeeRecord fields)
    const headers = standardRecords.length > 0 ? Object.keys(standardRecords[0]) : [];
    
    // Use clear filename based on whether errors exist
    const hasErrors = result.errors.length > 0;
    const filename = hasErrors 
      ? 'your_file_HAS_ERRORS_fix_these.csv'
      : 'your_file_ready_to_use.csv';
    
    exportToCSV(standardRecords, filename, headers);
  };

  // Check if downloads should be enabled (no errors and no warnings)
  const canDownload = result && 
    result.processedEmployees.length > 0 && 
    result.errors.length === 0 && 
    (result.warnings?.length || 0) === 0 &&
    warnings.length === 0;

  const hasErrors = result && result.errors.length > 0;
  const hasWarnings = (result && result.warnings && result.warnings.length > 0) || warnings.length > 0;
  const totalErrors = result ? result.errors.length : 0;
  const totalWarnings = (result?.warnings?.length || 0) + warnings.length;

  const progressPercentage = progress.totalRows > 0
    ? Math.round((progress.currentRow / progress.totalRows) * 100)
    : 0;

  return (
    <div className="processing-dashboard">
      {/* Status Banner */}
      {result && (
        <div className={`status-banner ${canDownload ? 'status-success' : hasErrors ? 'status-error' : 'status-warning'}`}>
          {canDownload ? (
            <>
              <IoCheckmarkCircle className="status-icon" style={{ color: '#155724' }} />
              <span className="status-text"><strong>Ready to Download!</strong> All errors are fixed. You can now download your employee data files for the payroll system.</span>
            </>
          ) : hasErrors ? (
            <>
              <IoWarning className="status-icon" style={{ color: '#991b1b' }} />
              <span className="status-text"><strong>Please Fix Errors First</strong> - Found {totalErrors} error{totalErrors !== 1 ? 's' : ''} that need fixing before you can download your employee data files.</span>
            </>
          ) : hasWarnings ? (
            <>
              <IoWarning className="status-icon" style={{ color: '#92400e' }} />
              <span className="status-text"><strong>Please Review Warnings</strong> - Found {totalWarnings} warning{totalWarnings !== 1 ? 's' : ''} that should be reviewed.</span>
            </>
          ) : null}
        </div>
      )}

      {/* Step-by-Step Guide */}
      {result && (
        <div className="workflow-guide">
          <h3>What to Do Next:</h3>
          <div className="workflow-steps">
            <div className={`workflow-step ${employees.length > 0 ? 'step-complete' : ''}`}>
              {employees.length > 0 && <IoCheckmarkCircle style={{ alignSelf: 'flex-end', color: 'var(--success-color)', fontSize: '0.875rem', marginBottom: '0.25rem' }} />}
              <div className="workflow-step-content">
                <span className="step-number">1</span>
                <span className="step-text">Upload File</span>
              </div>
            </div>
            <div className={`workflow-step ${hasErrors ? 'step-current' : result && !hasErrors ? 'step-complete' : ''}`}>
              {hasErrors && <span className="current-step-badge">You are here</span>}
              {result && !hasErrors && <IoCheckmarkCircle style={{ alignSelf: 'flex-end', color: 'var(--success-color)', fontSize: '0.875rem', marginBottom: '0.25rem' }} />}
              <div className="workflow-step-content">
                <span className="step-number">2</span>
                <span className="step-text">Review Errors {hasErrors ? `(${totalErrors} found)` : '(none)'}</span>
              </div>
            </div>
            <div className={`workflow-step ${hasErrors ? 'step-current' : !hasErrors && result ? 'step-complete' : 'step-future'}`}>
              {hasErrors && <span className="current-step-badge">You are here</span>}
              {!hasErrors && result && <IoCheckmarkCircle style={{ alignSelf: 'flex-end', color: 'var(--success-color)', fontSize: '0.875rem', marginBottom: '0.25rem' }} />}
              <div className="workflow-step-content">
                <span className="step-number">3</span>
                <span className="step-text">Fix Errors {hasErrors ? '(choose one method below)' : '(done)'}</span>
              </div>
            </div>
            <div className={`workflow-step ${canDownload ? 'step-complete' : 'step-future'}`}>
              {canDownload && <IoCheckmarkCircle style={{ alignSelf: 'flex-end', color: 'var(--success-color)', fontSize: '0.875rem', marginBottom: '0.25rem' }} />}
              <div className="workflow-step-content">
                <span className="step-number">4</span>
                <span className="step-text">Download Final Files {canDownload ? '(ready!)' : '(fix errors first)'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-header">
        <h2>Payroll Processing</h2>
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Total Employees:</span>
            <span className="stat-value">{employees.length}</span>
          </div>
          {result && (
            <>
              <div className="stat">
                <span className="stat-label">Processed:</span>
                <span className="stat-value success">{result.processedEmployees.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Skipped:</span>
                <span className="stat-value warning">{result.skippedEmployees.length}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="controls">
        <button
          onClick={handleProcess}
          disabled={isProcessing || employees.length === 0}
          className="btn btn-primary"
        >
          {isProcessing ? 'Processing...' : 'Check Your File for Errors'}
        </button>
        {result && result.processedEmployees.length > 0 && (
          <>
            <button 
              onClick={handleDownloadStandardFormat} 
              className={`btn ${hasErrors ? 'btn-warning' : 'btn-success'}`}
              title={hasErrors 
                ? "Download this file to fix errors in Excel, then upload it again" 
                : "Download your file (ready to use)"}
            >
              <FaDownload />
              {hasErrors 
                ? 'Download Your File (has errors - fix in Excel)' 
                : 'Download Your File (ready to use)'}
            </button>
            <div className="provider-download-section">
              <select
                className="provider-select"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as 'ADP' | 'QuickBooks')}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="ADP">ADP</option>
                <option value="QuickBooks">QuickBooks</option>
              </select>
              <button 
                onClick={handleDownloadProvider} 
                className={`btn btn-success ${!canDownload ? 'btn-disabled' : ''}`}
                disabled={!canDownload}
                title={!canDownload 
                  ? 'You need to fix all errors before downloading this file' 
                  : 'All errors are fixed! Ready to download'}
              >
                {!canDownload ? (
                  <>
                    <IoCloseCircle />
                    Download ({selectedProvider} - fix errors first)
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircle />
                    Download ({selectedProvider} - ready)
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Upload Corrected File Section */}
      {result && (
        <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>Upload Corrected Employee Data File</h4>
          <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Upload your corrected file to restart the process with the updated data.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              
              if (!file.name.endsWith('.csv')) {
                alert('Please upload a CSV file');
                return;
              }

              setIsUploadingCorrected(true);
              try {
                const uploadResult = await uploadApi.uploadFile(file);
                reset(); // Reset processing state
                if (onEmployeesUpdated) {
                  onEmployeesUpdated(uploadResult.rows, uploadResult.warnings, uploadResult.headerFields);
                }
                alert('Corrected file uploaded successfully. Please click "Check Your File for Errors" to process.');
              } catch (error) {
                alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
              } finally {
                setIsUploadingCorrected(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingCorrected}
            className="btn btn-primary"
          >
            {isUploadingCorrected ? 'Uploading...' : 'Choose Corrected File'}
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="progress-section">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="progress-text">
            Processing row {progress.currentRow} of {progress.totalRows} ({progressPercentage}%)
          </div>
        </div>
      )}

      {hasWarnings && (
        <div className="warnings-section">
          <h4><IoWarning style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />Data Warnings ({totalWarnings})</h4>
          <p className="warning-message">
            <strong>These warnings need your attention.</strong> Provider downloads are disabled until all warnings are resolved.
          </p>
          <ul>
            {warnings.map((warning) => (
              <li key={warning.id}>
                Row {warning.row}: {warning.message}
              </li>
            ))}
            {result?.warnings?.map((warning) => (
              <li key={warning.id}>
                Row {warning.row}: {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {progress.logs.length > 0 && (
        <ProgressLogs logs={progress.logs} />
      )}

      {/* Simple Error Summary Card */}
      {result && result.errors.length > 0 && (
        <div className="error-summary-card">
          <div className="error-summary-header">
            <IoWarning className="error-icon" style={{ color: '#991b1b' }} />
            <h3>Found {totalErrors} Error{totalErrors !== 1 ? 's' : ''} That Need Fixing</h3>
          </div>
          <div className="error-summary-message">
            <p><strong>Before you can download your employee data files for the payroll system, please fix these errors.</strong></p>
            <p>You can fix them in two ways:</p>
            <ol className="fix-options">
              <li><strong>Fix here:</strong> Use the table below entitled Error Corrections to fix errors right here on this page</li>
              <li><strong>Fix in Excel:</strong> Download the file above, fix errors in Excel, then upload it again on the upload CSV page or using the button at the bottom of this page</li>
            </ol>
            <p className="error-note">Once all errors are fixed, you'll be able to download your employee data files.</p>
          </div>
          <div className="error-preview">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <strong>Quick Preview of Errors:</strong>
              <button
                onClick={() => setIsErrorsModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ marginLeft: '1rem' }}
              >
                View All Errors
              </button>
            </div>
            <ul>
              {result.errors.slice(0, 5).map((error, idx) => (
                <li key={idx}>
                  Row {error.row}, Column {error.columnIndex !== undefined ? error.columnIndex : '-'} ({error.field}): {error.message}
                </li>
              ))}
              {result.errors.length > 5 && (
                <li>...and {result.errors.length - 5} more error{result.errors.length - 5 !== 1 ? 's' : ''}</li>
              )}
            </ul>
          </div>
        </div>
      )}

      {result && result.errors.length > 0 && (
        <ErrorCorrection
          errors={result.errors}
          employees={employees}
          onCorrectionsApplied={() => {
            // Corrections are applied - user will need to re-process to verify
            // No alert needed as the modal already shows success message
          }}
        />
      )}

      {result && result.skippedEmployees.length > 0 && (
        <div className="skipped-section">
          <h4>Skipped Employees ({result.skippedEmployees.length})</h4>
          <ul>
            {result.skippedEmployees.map((se, idx) => (
              <li key={idx}>
                {se.employee.employee_id} ({se.employee.first_name} {se.employee.last_name}): {se.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && result.errors.length > 0 && (
        <ErrorsModal
          isOpen={isErrorsModalOpen}
          onClose={() => setIsErrorsModalOpen(false)}
          errors={result.errors}
        />
      )}
    </div>
  );
}

