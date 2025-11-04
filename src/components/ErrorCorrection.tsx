/**
 * Error Correction Component
 * Allows admins to correct errors with full traceability
 */

import { useState } from 'react';
import { ErrorCorrectionModal } from './ErrorCorrectionModal';
import type { ProcessingError, EmployeeRecord } from '../types';

interface ErrorCorrectionProps {
  errors: ProcessingError[];
  employees: EmployeeRecord[];
  onCorrectionsApplied: () => void;
}

export function ErrorCorrection({ errors, employees, onCorrectionsApplied }: ErrorCorrectionProps) {
  const [selectedError, setSelectedError] = useState<ProcessingError | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (error: ProcessingError) => {
    setSelectedError(error);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedError(null);
  };

  const handleCorrectionApplied = () => {
    onCorrectionsApplied();
    handleCloseModal();
  };

  const getErrorRow = (error: ProcessingError): EmployeeRecord | undefined => {
    return employees[error.row - 1];
  };

  return (
    <div className="error-correction">
      <h3>Error Corrections ({errors.length} errors)</h3>
      <div className="error-table">
        <table>
          <thead>
            <tr>
              <th>Row</th>
              <th>Column</th>
              <th>Column Name</th>
              <th>Original Value</th>
              <th>Error Type</th>
              <th>Error Message</th>
              <th>Suggested Fix</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((error) => {
              return (
                <tr key={error.id}>
                  <td>{error.row}</td>
                  <td>{error.columnIndex !== undefined ? error.columnIndex : '-'}</td>
                  <td>{error.field}</td>
                  <td className="original-value">{error.value || '(empty)'}</td>
                  <td>
                    <span className={`error-type ${error.errorType.toLowerCase().replace(/_/g, '-')}`}>
                      {error.errorType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>{error.message}</td>
                  <td>{error.suggestedFix || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleOpenModal(error)}
                      className="btn btn-primary btn-sm"
                    >
                      Fix Error
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="correction-help">
        <p><strong>Traceability:</strong> All corrections are recorded with timestamps and can be exported for audit purposes.</p>
      </div>

      {selectedError && (
        <ErrorCorrectionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          error={selectedError}
          employee={getErrorRow(selectedError)!}
          onCorrectionApplied={handleCorrectionApplied}
        />
      )}
    </div>
  );
}

