/**
 * Process API Route
 * Client-side API interface for payroll processing operations
 */

import { processEmployees } from '../../controllers/processController';
import type { ProcessingResult, ProcessingOptions } from '../../controllers/processController';
import type { EmployeeRecord } from '../../types';

/**
 * Processes employee records
 * @param employees Array of employee records
 * @param options Processing options (including headerFields for column index tracking)
 * @returns Processing result
 */
export async function processPayroll(
  employees: EmployeeRecord[],
  options: ProcessingOptions = {}
): Promise<ProcessingResult> {
  return processEmployees(employees, options);
}

