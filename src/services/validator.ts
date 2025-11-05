/**
 * Validator Service
 * Validates employee records with comprehensive checks
 */

import type { EmployeeRecord, DETRecord, ProcessingError, ErrorType } from '../types';
import { generateErrorId } from './errorTracker';

/**
 * Required fields for DET records - record tracking fields
 */
const REQUIRED_DET_FIELDS: (keyof DETRecord)[] = [
  'record_type',
  'record_sequence',
  'company_id'
];

/**
 * Required fields for employee data (within DET records)
 * Only includes fields absolutely essential for legacy payroll providers
 */
const REQUIRED_EMPLOYEE_FIELDS: (keyof EmployeeRecord)[] = [
  'employee_id',
  'first_name',
  'last_name',
  'dob',
  'ssn',
  'home_street',
  'home_city',
  'home_state',
  'home_zip',
  'hire_date',
  'job_title',
  'flsa_status',
  'annual_salary',
  'pay_frequency',
  'fed_status',
  'fed_allowances',
  'fed_extra_wh_per_paycheck',
  'state_code',
  'state_extra_wh_per_paycheck',
  'i9_status',
  'e_verify_status',
  'dd1_routing_number',
  'dd1_account_number',
  'dd1_account_type',
  'dd1_split_type',
  'dd1_split_value'
];

/**
 * Validates date format (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validates SSN format (XXX-XX-XXXX)
 */
function isValidSSN(ssn: string): boolean {
  return /^\d{3}-\d{2}-\d{4}$/.test(ssn) || /^XXX-XX-\d{4}$/.test(ssn);
}

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates numeric string
 */
function isNumeric(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(parseFloat(value));
}

/**
 * Validates routing number (9 digits)
 */
function isValidRoutingNumber(routing: string): boolean {
  return /^\d{9}$/.test(routing);
}

/**
 * Validates ZIP code (5 or 9 digits)
 */
function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

/**
 * Validates state code (2 letters)
 */
function isValidStateCode(state: string): boolean {
  return /^[A-Z]{2}$/.test(state.toUpperCase());
}



/**
 * Validates a DET (Detail) record
 * @param record DET record to validate
 * @param rowIndex Row number (0-based)
 * @returns Array of validation errors
 */
export function validateDETRecord(
  record: Partial<DETRecord>,
  rowIndex: number
): ProcessingError[] {
  const errors: ProcessingError[] = [];
  const rowId = record.employee_id || record.record_sequence || `row_${rowIndex}`;

  // Check record type
  if (record.record_type !== 'DET') {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'record_type',
      value: record.record_type || '',
      errorType: 'INVALID_FORMAT',
      message: `Expected record_type 'DET', got '${record.record_type}'`,
      suggestedFix: "Set record_type to 'DET' for detail records",
      timestamp: new Date().toISOString()
    });
  }

  // Check required DET fields
  for (const field of REQUIRED_DET_FIELDS) {
    const value = record[field];
    if (!value || value.trim() === '') {
      errors.push({
        id: generateErrorId(),
        rowId,
        row: rowIndex + 1,
        field,
        value: '',
        errorType: 'REQUIRED_FIELD_MISSING',
        message: `Required DET field '${field}' is missing or empty`,
        suggestedFix: `Please provide a value for ${field}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Validate record_sequence is numeric
  if (record.record_sequence && !isNumeric(record.record_sequence)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'record_sequence',
      value: record.record_sequence,
      errorType: 'INVALID_FORMAT',
      message: `Record sequence must be numeric, got: ${record.record_sequence}`,
      suggestedFix: 'Provide a numeric sequence number',
      timestamp: new Date().toISOString()
    });
  }

  // Check required employee fields
  for (const field of REQUIRED_EMPLOYEE_FIELDS) {
    const value = record[field as keyof DETRecord];
    if (!value || String(value).trim() === '') {
      errors.push({
        id: generateErrorId(),
        rowId,
        row: rowIndex + 1,
        field,
        value: '',
        errorType: 'REQUIRED_FIELD_MISSING',
        message: `Required employee field '${field}' is missing or empty`,
        suggestedFix: `Please provide a value for ${field}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Continue with employee field validations (existing logic below)
  // Validate date formats
  if (record.dob && !isValidDate(record.dob)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'dob',
      value: record.dob,
      errorType: 'INVALID_FORMAT',
      message: `Date of birth must be in YYYY-MM-DD format, got: ${record.dob}`,
      suggestedFix: 'Format as YYYY-MM-DD (e.g., 1990-05-15)',
      timestamp: new Date().toISOString()
    });
  }

  if (record.hire_date && !isValidDate(record.hire_date)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'hire_date',
      value: record.hire_date,
      errorType: 'INVALID_FORMAT',
      message: `Hire date must be in YYYY-MM-DD format, got: ${record.hire_date}`,
      suggestedFix: 'Format as YYYY-MM-DD (e.g., 2025-11-01)',
      timestamp: new Date().toISOString()
    });
  }

  // Validate SSN format
  if (record.ssn && !isValidSSN(record.ssn)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'ssn',
      value: record.ssn,
      errorType: 'INVALID_FORMAT',
      message: `SSN must be in XXX-XX-XXXX format, got: ${record.ssn}`,
      suggestedFix: 'Format as XXX-XX-XXXX',
      timestamp: new Date().toISOString()
    });
  }

  // Validate email
  if (record.manager_email && !isValidEmail(record.manager_email)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'manager_email',
      value: record.manager_email,
      errorType: 'INVALID_FORMAT',
      message: `Invalid email format: ${record.manager_email}`,
      suggestedFix: 'Please provide a valid email address',
      timestamp: new Date().toISOString()
    });
  }

  // Validate state codes
  if (record.home_state && !isValidStateCode(record.home_state)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'home_state',
      value: record.home_state,
      errorType: 'INVALID_FORMAT',
      message: `State code must be 2 letters, got: ${record.home_state}`,
      suggestedFix: 'Use 2-letter state code (e.g., SC, GA, NC)',
      timestamp: new Date().toISOString()
    });
  }

  if (record.work_state && !isValidStateCode(record.work_state)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'work_state',
      value: record.work_state,
      errorType: 'INVALID_FORMAT',
      message: `State code must be 2 letters, got: ${record.work_state}`,
      suggestedFix: 'Use 2-letter state code (e.g., SC, GA, NC)',
      timestamp: new Date().toISOString()
    });
  }

  // Validate ZIP codes
  if (record.home_zip && !isValidZip(record.home_zip)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'home_zip',
      value: record.home_zip,
      errorType: 'INVALID_FORMAT',
      message: `ZIP code must be 5 or 9 digits, got: ${record.home_zip}`,
      suggestedFix: 'Format as 12345 or 12345-6789',
      timestamp: new Date().toISOString()
    });
  }

  if (record.work_zip && !isValidZip(record.work_zip)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'work_zip',
      value: record.work_zip,
      errorType: 'INVALID_FORMAT',
      message: `ZIP code must be 5 or 9 digits, got: ${record.work_zip}`,
      suggestedFix: 'Format as 12345 or 12345-6789',
      timestamp: new Date().toISOString()
    });
  }

  // Validate routing numbers
  if (record.dd1_routing_number && !isValidRoutingNumber(record.dd1_routing_number)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'dd1_routing_number',
      value: record.dd1_routing_number,
      errorType: 'INVALID_FORMAT',
      message: `Routing number must be 9 digits, got: ${record.dd1_routing_number}`,
      suggestedFix: 'Provide a 9-digit routing number',
      timestamp: new Date().toISOString()
    });
  }

  if (record.dd2_routing_number && record.dd2_routing_number.trim() !== '' && !isValidRoutingNumber(record.dd2_routing_number)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'dd2_routing_number',
      value: record.dd2_routing_number,
      errorType: 'INVALID_FORMAT',
      message: `Routing number must be 9 digits, got: ${record.dd2_routing_number}`,
      suggestedFix: 'Provide a 9-digit routing number or leave empty',
      timestamp: new Date().toISOString()
    });
  }

  // Validate numeric fields
  if (record.annual_salary && !isNumeric(record.annual_salary)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'annual_salary',
      value: record.annual_salary,
      errorType: 'INVALID_FORMAT',
      message: `Annual salary must be numeric, got: ${record.annual_salary}`,
      suggestedFix: 'Provide a numeric value (e.g., 120000)',
      timestamp: new Date().toISOString()
    });
  }

  // Validate FLSA status
  if (record.flsa_status && !['Exempt', 'Non-Exempt'].includes(record.flsa_status)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'flsa_status',
      value: record.flsa_status,
      errorType: 'INVALID_FORMAT',
      message: `FLSA status must be 'Exempt' or 'Non-Exempt', got: ${record.flsa_status}`,
      suggestedFix: 'Use "Exempt" or "Non-Exempt"',
      timestamp: new Date().toISOString()
    });
  }

  // Validate pay frequency
  const validPayFrequencies = ['Weekly', 'Bi-weekly', 'Semi-monthly', 'Monthly'];
  if (record.pay_frequency && !validPayFrequencies.includes(record.pay_frequency)) {
    errors.push({
      id: generateErrorId(),
      rowId,
      row: rowIndex + 1,
      field: 'pay_frequency',
      value: record.pay_frequency,
      errorType: 'INVALID_FORMAT',
      message: `Pay frequency must be one of: ${validPayFrequencies.join(', ')}, got: ${record.pay_frequency}`,
      suggestedFix: `Use one of: ${validPayFrequencies.join(', ')}`,
      timestamp: new Date().toISOString()
    });
  }

  // Business logic: Validate direct deposit split percentages
  if (record.dd1_split_type === 'Percent' && record.dd1_split_value) {
    const percent = parseFloat(record.dd1_split_value);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      errors.push({
        id: generateErrorId(),
        rowId,
        row: rowIndex + 1,
        field: 'dd1_split_value',
        value: record.dd1_split_value,
        errorType: 'BUSINESS_LOGIC_ERROR',
        message: `Split percentage must be between 0 and 100, got: ${record.dd1_split_value}`,
        suggestedFix: 'Provide a percentage between 0 and 100',
        timestamp: new Date().toISOString()
      });
    }

    // If DD2 also uses Percent, check that they sum to 100
    if (record.dd2_split_type === 'Percent' && record.dd2_split_value) {
      const dd2Percent = parseFloat(record.dd2_split_value);
      if (!isNaN(dd2Percent) && !isNaN(percent)) {
        const total = percent + dd2Percent;
        if (Math.abs(total - 100) > 0.01) { // Allow small floating point errors
          errors.push({
            id: generateErrorId(),
            rowId,
            row: rowIndex + 1,
            field: 'dd1_split_value',
            value: `${record.dd1_split_value} + ${record.dd2_split_value}`,
            errorType: 'BUSINESS_LOGIC_ERROR',
            message: `Direct deposit split percentages must sum to 100%, got: ${total}%`,
            suggestedFix: 'Adjust split values so they sum to 100%',
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }

  return errors;
}

/**
 * Validates a single employee record (backwards compatibility)
 * Only validates employee fields, not DET-specific tracking fields
 * DET-specific fields (record_sequence, company_id) should be validated separately
 * @param record Employee record to validate
 * @param rowIndex Row number (0-based)
 * @param headerFields Optional array of CSV header field names to calculate column index
 * @returns Array of validation errors
 */
export function validateEmployeeRecord(
  record: EmployeeRecord,
  rowIndex: number,
  headerFields?: string[]
): ProcessingError[] {
  const errors: ProcessingError[] = [];
  const rowId = record.employee_id || `row_${rowIndex}`;

  // Helper to get column index from field name
  const getColumnIndex = (fieldName: string): number | undefined => {
    if (!headerFields || headerFields.length === 0) {
      return undefined;
    }
    // Field names are already normalized (lowercase, underscores), so direct match should work
    const index = headerFields.indexOf(fieldName);
    return index >= 0 ? index : undefined;
  };

  // Helper to create error with columnIndex
  const createError = (
    field: string,
    value: string,
    errorType: ErrorType,
    message: string,
    suggestedFix?: string
  ): ProcessingError => ({
    id: generateErrorId(),
    rowId,
    row: rowIndex + 1,
    field,
    columnIndex: getColumnIndex(field),
    value,
    errorType,
    message,
    suggestedFix,
    timestamp: new Date().toISOString()
  });

  // Only validate employee fields, not DET-specific fields
  // Check required employee fields
  for (const field of REQUIRED_EMPLOYEE_FIELDS) {
    const value = record[field];
    if (!value || String(value).trim() === '') {
      errors.push(createError(
        field,
        '',
        'REQUIRED_FIELD_MISSING',
        `Required employee field '${field}' is missing or empty`,
        `Please provide a value for ${field}`
      ));
    }
  }

  // Validate date formats
  if (record.dob && !isValidDate(record.dob)) {
    errors.push(createError(
      'dob',
      record.dob,
      'INVALID_FORMAT',
      `Date of birth must be in YYYY-MM-DD format, got: ${record.dob}`,
      'Format as YYYY-MM-DD (e.g., 1990-05-15)'
    ));
  }

  if (record.hire_date && !isValidDate(record.hire_date)) {
    errors.push(createError(
      'hire_date',
      record.hire_date,
      'INVALID_FORMAT',
      `Hire date must be in YYYY-MM-DD format, got: ${record.hire_date}`,
      'Format as YYYY-MM-DD (e.g., 2025-11-01)'
    ));
  }

  // Validate SSN format
  if (record.ssn && !isValidSSN(record.ssn)) {
    errors.push(createError(
      'ssn',
      record.ssn,
      'INVALID_FORMAT',
      `SSN must be in XXX-XX-XXXX format, got: ${record.ssn}`,
      'Format as XXX-XX-XXXX'
    ));
  }

  // Validate email
  if (record.manager_email && !isValidEmail(record.manager_email)) {
    errors.push(createError(
      'manager_email',
      record.manager_email,
      'INVALID_FORMAT',
      `Invalid email format: ${record.manager_email}`,
      'Please provide a valid email address'
    ));
  }

  // Validate state codes
  if (record.home_state && !isValidStateCode(record.home_state)) {
    errors.push(createError(
      'home_state',
      record.home_state,
      'INVALID_FORMAT',
      `State code must be 2 letters, got: ${record.home_state}`,
      'Use 2-letter state code (e.g., SC, GA, NC)'
    ));
  }

  if (record.work_state && !isValidStateCode(record.work_state)) {
    errors.push(createError(
      'work_state',
      record.work_state,
      'INVALID_FORMAT',
      `State code must be 2 letters, got: ${record.work_state}`,
      'Use 2-letter state code (e.g., SC, GA, NC)'
    ));
  }

  // Validate ZIP codes
  if (record.home_zip && !isValidZip(record.home_zip)) {
    errors.push(createError(
      'home_zip',
      record.home_zip,
      'INVALID_FORMAT',
      `ZIP code must be 5 or 9 digits, got: ${record.home_zip}`,
      'Format as 12345 or 12345-6789'
    ));
  }

  if (record.work_zip && !isValidZip(record.work_zip)) {
    errors.push(createError(
      'work_zip',
      record.work_zip,
      'INVALID_FORMAT',
      `ZIP code must be 5 or 9 digits, got: ${record.work_zip}`,
      'Format as 12345 or 12345-6789'
    ));
  }

  // Validate routing numbers
  if (record.dd1_routing_number && !isValidRoutingNumber(record.dd1_routing_number)) {
    errors.push(createError(
      'dd1_routing_number',
      record.dd1_routing_number,
      'INVALID_FORMAT',
      `Routing number must be 9 digits, got: ${record.dd1_routing_number}`,
      'Provide a 9-digit routing number'
    ));
  }

  if (record.dd2_routing_number && record.dd2_routing_number.trim() !== '' && !isValidRoutingNumber(record.dd2_routing_number)) {
    errors.push(createError(
      'dd2_routing_number',
      record.dd2_routing_number,
      'INVALID_FORMAT',
      `Routing number must be 9 digits, got: ${record.dd2_routing_number}`,
      'Provide a 9-digit routing number or leave empty'
    ));
  }

  // Validate numeric fields
  if (record.annual_salary && !isNumeric(record.annual_salary)) {
    errors.push(createError(
      'annual_salary',
      record.annual_salary,
      'INVALID_FORMAT',
      `Annual salary must be numeric, got: ${record.annual_salary}`,
      'Provide a numeric value (e.g., 120000)'
    ));
  }

  // Validate FLSA status
  if (record.flsa_status && !['Exempt', 'Non-Exempt'].includes(record.flsa_status)) {
    errors.push(createError(
      'flsa_status',
      record.flsa_status,
      'INVALID_FORMAT',
      `FLSA status must be 'Exempt' or 'Non-Exempt', got: ${record.flsa_status}`,
      'Use "Exempt" or "Non-Exempt"'
    ));
  }

  // Validate pay frequency
  const validPayFrequencies = ['Weekly', 'Bi-weekly', 'Semi-monthly', 'Monthly'];
  if (record.pay_frequency && !validPayFrequencies.includes(record.pay_frequency)) {
    errors.push(createError(
      'pay_frequency',
      record.pay_frequency,
      'INVALID_FORMAT',
      `Pay frequency must be one of: ${validPayFrequencies.join(', ')}, got: ${record.pay_frequency}`,
      `Use one of: ${validPayFrequencies.join(', ')}`
    ));
  }

  // Business logic: Validate direct deposit split percentages
  if (record.dd1_split_type === 'Percent' && record.dd1_split_value) {
    const percent = parseFloat(record.dd1_split_value);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      errors.push(createError(
        'dd1_split_value',
        record.dd1_split_value,
        'BUSINESS_LOGIC_ERROR',
        `Split percentage must be between 0 and 100, got: ${record.dd1_split_value}`,
        'Provide a percentage between 0 and 100'
      ));
    }

    // If DD2 also uses Percent, check that they sum to 100
    if (record.dd2_split_type === 'Percent' && record.dd2_split_value) {
      const dd2Percent = parseFloat(record.dd2_split_value);
      if (!isNaN(dd2Percent) && !isNaN(percent)) {
        const total = percent + dd2Percent;
        if (Math.abs(total - 100) > 0.01) { // Allow small floating point errors
          errors.push(createError(
            'dd1_split_value',
            `${record.dd1_split_value} + ${record.dd2_split_value}`,
            'BUSINESS_LOGIC_ERROR',
            `Direct deposit split percentages must sum to 100%, got: ${total}%`,
            'Adjust split values so they sum to 100%'
          ));
        }
      }
    }
  }

  return errors;
}

/**
 * Checks if employee is ready for payroll (compliance gate)
 * @param record Employee record or DET record
 * @returns true if ready, false otherwise
 */
export function isPayrollReady(record: EmployeeRecord | DETRecord): boolean {
  return record.i9_status === 'Completed' && record.e_verify_status === 'Authorized';
}

