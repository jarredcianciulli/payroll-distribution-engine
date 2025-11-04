/**
 * Errors Modal Component
 * Displays all processing errors in a paginated modal view
 */

import { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import type { ProcessingError } from '../types';

interface ErrorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: ProcessingError[];
}

const ERRORS_PER_PAGE = 10;

export function ErrorsModal({ isOpen, onClose, errors }: ErrorsModalProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen) return null;

  const totalPages = Math.ceil(errors.length / ERRORS_PER_PAGE);
  const startIndex = (currentPage - 1) * ERRORS_PER_PAGE;
  const endIndex = startIndex + ERRORS_PER_PAGE;
  const currentErrors = errors.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getErrorTypeClass = (errorType: string) => {
    return `error-type ${errorType.toLowerCase().replace('_', '-')}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content errors-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>All Errors ({errors.length})</h3>
          <button onClick={onClose} className="modal-close-btn">
            <IoClose />
          </button>
        </div>

        <div className="modal-body errors-modal-body">
          <div className="errors-table-container">
            <table className="errors-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Column</th>
                  <th>Column Name</th>
                  <th>Original Value</th>
                  <th>Error Type</th>
                  <th>Error Message</th>
                  <th>Suggested Fix</th>
                </tr>
              </thead>
              <tbody>
                {currentErrors.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No errors to display
                    </td>
                  </tr>
                ) : (
                  currentErrors.map((error) => (
                    <tr key={error.id}>
                      <td>{error.row}</td>
                      <td>{error.columnIndex !== undefined ? error.columnIndex : '-'}</td>
                      <td>{error.field}</td>
                      <td className="original-value">{error.value || '(empty)'}</td>
                      <td>
                        <span className={getErrorTypeClass(error.errorType)}>
                          {error.errorType}
                        </span>
                      </td>
                      <td>{error.message}</td>
                      <td>{error.suggestedFix || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm pagination-btn"
              >
                Previous
              </button>
              
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm pagination-btn"
              >
                Next
              </button>
            </div>
          )}

          <div className="pagination-info">
            Showing {startIndex + 1} - {Math.min(endIndex, errors.length)} of {errors.length} errors
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

