/**
 * Process Controller
 * Handles the complete payroll processing workflow
 */

import { validateEmployeeRecord, isPayrollReady } from '../services/validator';
import { transformToADP, transformToQuickBooks } from '../services/transformer';
import { storeErrors } from '../services/errorTracker';
import type { EmployeeRecord, ProcessingError, ProcessingWarning, ProcessingLog, LogLevel, ADPRecord, QuickBooksRecord } from '../types';
import { generateErrorId } from '../services/errorTracker';

export interface ProcessingResult {
  processedEmployees: {
    employee: EmployeeRecord;
    adpRecord: ADPRecord;
    quickBooksRecord: QuickBooksRecord;
  }[];
  skippedEmployees: {
    employee: EmployeeRecord;
    reason: string;
  }[];
  errors: ProcessingError[];
  warnings: ProcessingWarning[];
  logs: ProcessingLog[];
}

export interface ProcessingOptions {
  headerFields?: string[]; // CSV header fields for column index tracking
  onProgress?: (progress: {
    current: number;
    total: number;
    isComplete: boolean;
    logs: ProcessingLog[];
  }) => void;
}

/**
 * Processes employee records through validation, compliance gating, and transformation
 * @param employees Array of employee records to process
 * @param options Processing options including progress callback
 * @returns Processing result with transformed records
 */
export async function processEmployees(
  employees: EmployeeRecord[],
  options: ProcessingOptions = {}
): Promise<ProcessingResult> {
  const { onProgress, headerFields } = options;
  
  const result: ProcessingResult = {
    processedEmployees: [],
    skippedEmployees: [],
    errors: [],
    warnings: [],
    logs: []
  };

  const addLog = (level: LogLevel, message: string, employeeId?: string, row?: number) => {
    const log: ProcessingLog = {
      id: generateErrorId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      employeeId,
      row
    };
    result.logs.push(log);
    return log;
  };

  addLog('INFO', `Starting processing of ${employees.length} employees`);

  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i];
    const rowIndex = i + 1;

    try {
      // Validate employee record
      const validationErrors = validateEmployeeRecord(employee, i, headerFields);
      result.errors.push(...validationErrors);

      if (validationErrors.length > 0) {
        const errorFields = validationErrors.map(e => e.field).join(', ');
        addLog('ERROR', `Row ${rowIndex}, Column ${errorFields}: Validation failed - ${validationErrors.length} issue(s) detected`, employee.employee_id, rowIndex);
      }

      // Check compliance gate
      if (!isPayrollReady(employee)) {
        const reason = `I-9 status: ${employee.i9_status}, E-Verify status: ${employee.e_verify_status}`;
        result.skippedEmployees.push({ employee, reason });
        addLog('WARNING', `Employee ${employee.employee_id} (${employee.first_name} ${employee.last_name}): Compliance check failed - ${reason}`, employee.employee_id, rowIndex);
        continue;
      }

      // Transform to provider formats
      const adpRecord = transformToADP(employee);
      const quickBooksRecord = transformToQuickBooks(employee);

      result.processedEmployees.push({
        employee,
        adpRecord,
        quickBooksRecord
      });

      // Only log SUCCESS if there are no validation errors
      if (validationErrors.length === 0) {
        addLog('SUCCESS', `Employee ${employee.employee_id} (${employee.first_name} ${employee.last_name}): Validated and ready for export`, employee.employee_id, rowIndex);
      } else {
        // Log INFO if transformed but has errors
        addLog('INFO', `Employee ${employee.employee_id} (${employee.first_name} ${employee.last_name}): Transformed with validation errors - export disabled until corrected`, employee.employee_id, rowIndex);
      }

      // Call progress callback
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: employees.length,
          isComplete: i === employees.length - 1,
          logs: result.logs.slice(-5) // Last 5 logs
        });
      }

      // Small delay to allow UI to update (simulates real-time processing)
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      const errorObj: ProcessingError = {
        id: generateErrorId(),
        rowId: employee.employee_id || `row_${rowIndex}`,
        row: rowIndex,
        field: 'general',
        value: '',
        errorType: 'PARSE_ERROR',
        message: `Failed to process employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      };
      result.errors.push(errorObj);
      addLog('ERROR', `Failed to process employee ${employee.employee_id}`, employee.employee_id, rowIndex);
    }
  }

  // Store errors for later retrieval
  if (result.errors.length > 0) {
    storeErrors(result.errors);
  }

  addLog('INFO', `Processing complete. ${result.processedEmployees.length} employees processed, ${result.skippedEmployees.length} employees skipped`);

  return result;
}

