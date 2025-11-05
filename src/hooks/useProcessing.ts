/**
 * useProcessing Hook
 * Manages employee data processing state and operations
 */

import { useState, useCallback } from 'react';
import { process as processApi } from '../api';
import type { EmployeeRecord, ProcessingProgress } from '../types';
import type { ProcessingResult } from '../controllers/processController';

export function useProcessing() {
  const [progress, setProgress] = useState<ProcessingProgress>({
    totalRows: 0,
    processedRows: 0,
    skippedRows: 0,
    currentRow: 0,
    errors: [],
    warnings: [],
    logs: [],
    isComplete: false,
    isProcessing: false
  });

  const [result, setResult] = useState<ProcessingResult | null>(null);

  /**
   * Processes employee records
   */
  const process = useCallback(async (employees: EmployeeRecord[], headerFields?: string[]) => {
    setProgress(prev => ({
      ...prev,
      totalRows: employees.length,
      processedRows: 0,
      skippedRows: 0,
      currentRow: 0,
      errors: [],
      warnings: [],
      logs: [],
      isComplete: false,
      isProcessing: true
    }));

    try {
      const processingResult = await processApi.processPayroll(employees, {
        headerFields,
        onProgress: (progressUpdate) => {
          setProgress(prev => {
            // Deduplicate logs by ID to prevent duplicates
            const existingLogIds = new Set(prev.logs.map(log => log.id));
            const newLogs = progressUpdate.logs.filter(log => !existingLogIds.has(log.id));
            const combinedLogs = [...prev.logs, ...newLogs];
            
            // Keep only last 100 logs to prevent memory issues
            const logsToKeep = combinedLogs.slice(-100);

            return {
              ...prev,
              currentRow: progressUpdate.current,
              processedRows: progressUpdate.current,
              logs: logsToKeep,
              isComplete: progressUpdate.isComplete
            };
          });
        }
      });

      setProgress(prev => ({
        ...prev,
        processedRows: processingResult.processedEmployees.length,
        skippedRows: processingResult.skippedEmployees.length,
        errors: processingResult.errors,
        warnings: processingResult.warnings,
        isComplete: true,
        isProcessing: false
      }));

      setResult(processingResult);
      return processingResult;
    } catch (error) {
      setProgress(prev => ({
        ...prev,
        isComplete: true,
        isProcessing: false,
        errors: [
          ...prev.errors,
          {
            id: `error_${Date.now()}`,
            rowId: 'general',
            row: 0,
            field: 'general',
            value: '',
            errorType: 'PARSE_ERROR',
            message: error instanceof Error ? error.message : 'Processing failed',
            timestamp: new Date().toISOString()
          }
        ]
      }));
      throw error;
    }
  }, []);

  /**
   * Resets processing state
   */
  const reset = useCallback(() => {
    setProgress({
      totalRows: 0,
      processedRows: 0,
      skippedRows: 0,
      currentRow: 0,
      errors: [],
      warnings: [],
      logs: [],
      isComplete: false,
      isProcessing: false
    });
    setResult(null);
  }, []);

  return {
    progress,
    result,
    process,
    reset
  };
}

