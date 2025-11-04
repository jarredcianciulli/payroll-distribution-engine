/**
 * Error Tracker Service
 * Manages error tracking, corrections, and audit trails
 */

import type { ProcessingError, ErrorCorrection } from '../types';

const ERROR_STORAGE_KEY = 'payroll_errors';
const CORRECTION_STORAGE_KEY = 'payroll_corrections';

/**
 * Generates a unique error ID
 */
function generateErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Stores errors in localStorage
 */
export function storeErrors(errors: ProcessingError[]): void {
  try {
    const existingErrors = getStoredErrors();
    const allErrors = [...existingErrors, ...errors];
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(allErrors));
  } catch (error) {
    console.error('Failed to store errors:', error);
  }
}

/**
 * Retrieves stored errors from localStorage
 */
export function getStoredErrors(): ProcessingError[] {
  try {
    const stored = localStorage.getItem(ERROR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve stored errors:', error);
    return [];
  }
}

/**
 * Clears all stored errors
 */
export function clearStoredErrors(): void {
  try {
    localStorage.removeItem(ERROR_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored errors:', error);
  }
}

/**
 * Records an error correction with audit trail
 */
export function recordCorrection(correction: Omit<ErrorCorrection, 'correctedAt'>): ErrorCorrection {
  const fullCorrection: ErrorCorrection = {
    ...correction,
    correctedAt: new Date().toISOString()
  };

  try {
    const existingCorrections = getStoredCorrections();
    const updatedCorrections = [...existingCorrections, fullCorrection];
    localStorage.setItem(CORRECTION_STORAGE_KEY, JSON.stringify(updatedCorrections));
  } catch (error) {
    console.error('Failed to record correction:', error);
  }

  return fullCorrection;
}

/**
 * Retrieves stored corrections from localStorage
 */
export function getStoredCorrections(): ErrorCorrection[] {
  try {
    const stored = localStorage.getItem(CORRECTION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to retrieve stored corrections:', error);
    return [];
  }
}

/**
 * Gets corrections for a specific error
 */
export function getCorrectionsForError(errorId: string): ErrorCorrection[] {
  const allCorrections = getStoredCorrections();
  return allCorrections.filter(c => c.errorId === errorId);
}

/**
 * Clears all stored corrections
 */
export function clearStoredCorrections(): void {
  try {
    localStorage.removeItem(CORRECTION_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored corrections:', error);
  }
}

/**
 * Generates an error report CSV content
 */
export function generateErrorReport(errors: ProcessingError[], corrections: ErrorCorrection[]): string {
  const report = errors.map(error => {
    const errorCorrections = corrections.filter(c => c.errorId === error.id);
    const latestCorrection = errorCorrections.length > 0 
      ? errorCorrections[errorCorrections.length - 1]
      : null;

    return {
      'Error ID': error.id,
      'Row': error.row,
      'Field': error.field,
      'Original Value': error.value,
      'Error Type': error.errorType,
      'Error Message': error.message,
      'Suggested Fix': error.suggestedFix || '',
      'Corrected Value': latestCorrection?.correctedValue || '',
      'Corrected At': latestCorrection?.correctedAt || '',
      'Timestamp': error.timestamp
    };
  });

  // Convert to CSV
  const headers = Object.keys(report[0] || {});
  const rows = report.map(row => 
    headers.map(header => {
      const value = row[header as keyof typeof row];
      return value?.toString().includes(',') ? `"${value}"` : value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export { generateErrorId };

