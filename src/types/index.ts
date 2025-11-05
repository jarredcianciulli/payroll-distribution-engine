/**
 * Type definitions for the SFTP Export Engine
 * All data structures and interfaces used throughout the application
 */

/**
 * Record type values for payroll batch files
 */
export type RecordType = 'HDR' | 'DET' | 'FTR';

/**
 * HDR (Header) Record
 * First row in file - contains file-level metadata
 */
export interface HDRRecord {
  record_type: 'HDR';
  format_version: string; // e.g., "1.0"
  upload_id: string; // Unique identifier for this upload/batch
  file_timestamp: string; // ISO 8601 timestamp when file was created/uploaded
  file_name: string; // S3 bucket filename
  directory_path: string; // S3 directory/path
  employer_id: string; // Umbrella employer identifier (for entire file)
  total_records: string; // Total number of detail records expected
  processing_date: string; // YYYY-MM-DD format
}

/**
 * DET (Detail) Record
 * Employee data rows - contains all employee information plus record tracking
 */
export interface DETRecord extends EmployeeRecord {
  record_type: 'DET';
  record_sequence: string; // Sequential line number (1, 2, 3...)
  company_id: string; // Specific company identifier for this employee (within umbrella employer)
}

/**
 * FTR (Footer/Trailer) Record
 * Last row in file - contains summary totals
 */
export interface FTRRecord {
  record_type: 'FTR';
  total_employees_processed?: string;
  total_employees_skipped?: string;
  total_errors?: string;
  // Additional summary fields as needed
}

/**
 * Union type for all record types
 */
export type PayrollRecord = HDRRecord | DETRecord | FTRRecord;

/**
 * Standard input format employee record
 * Base interface for employee data (used within DET records)
 * Represents the comprehensive master file format with all payroll fields
 */
export interface EmployeeRecord {
  // REQUIRED - Core identity
  employee_id: string;
  first_name: string;
  last_name: string;
  dob: string; // YYYY-MM-DD format
  ssn: string; // XXX-XX-XXXX format
  
  // REQUIRED - Home address (for tax)
  home_street: string;
  home_city: string;
  home_state: string;
  home_zip: string;
  
  // OPTIONAL - Work address
  work_street?: string;
  work_city?: string;
  work_state?: string;
  work_zip?: string;
  
  // REQUIRED - Employment dates
  hire_date: string; // YYYY-MM-DD format
  
  // OPTIONAL - Additional dates
  original_hire_date?: string; // YYYY-MM-DD format (for rehires)
  rehire_date?: string; // YYYY-MM-DD format (if rehire)
  termination_date?: string; // YYYY-MM-DD format (if terminated)
  
  // REQUIRED - Basic employment
  job_title: string;
  
  // OPTIONAL - Department/management
  department?: string;
  manager_email?: string;
  
  // OPTIONAL - Employee contact
  employee_email?: string;
  employee_phone?: string;
  
  // REQUIRED - Compensation
  flsa_status: 'Exempt' | 'Non-Exempt';
  annual_salary: string;
  pay_frequency: 'Weekly' | 'Bi-weekly' | 'Semi-monthly' | 'Monthly';
  
  // OPTIONAL - Employment details
  employment_type?: 'Full-time' | 'Part-time' | 'Contractor' | 'Seasonal' | 'Temporary';
  employee_status?: 'Active' | 'Inactive' | 'Leave of Absence' | 'Terminated';
  pay_rate_type?: 'Salary' | 'Hourly';
  hours_per_week?: string;
  
  // REQUIRED - Tax
  fed_status: 'Single' | 'Married' | 'Married Filing Separately' | 'Head of Household';
  fed_allowances: string;
  fed_extra_wh_per_paycheck: string;
  state_code: string;
  state_extra_wh_per_paycheck: string;
  local_tax_code_1?: string;
  
  // REQUIRED - Compliance
  i9_status: 'Completed' | 'Pending_Section_2' | 'Not_Started';
  e_verify_status: 'Authorized' | 'Not_Started' | 'Pending';
  
  // REQUIRED - Direct deposit (primary)
  dd1_routing_number: string;
  dd1_account_number: string;
  dd1_account_type: 'Checking' | 'Savings';
  dd1_split_type: 'Percent' | 'Flat_Amount';
  dd1_split_value: string;
  
  // OPTIONAL - Direct deposit (secondary)
  dd2_routing_number?: string;
  dd2_account_number?: string;
  dd2_account_type?: 'Checking' | 'Savings';
  dd2_split_type?: 'Percent' | 'Flat_Amount';
  dd2_split_value?: string;
  
  // OPTIONAL - Union
  union_employee?: 'Yes' | 'No';
  union_start_date?: string; // YYYY-MM-DD format
  union_dues_amount_per_paycheck?: string;
  
  // OPTIONAL - Benefits
  health_plan_name?: string;
  health_deduction_per_paycheck?: string;
  disability_plan_code?: string;
  
  // OPTIONAL - Retirement
  retirement_plan_type?: string;
  retirement_contribution_percent?: string;
  retirement_loan_repayment?: string;
  
  // OPTIONAL - Garnishments
  garnishment_type?: string;
  garnishment_amount_per_paycheck?: string;
  
  // OPTIONAL - Emergency contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // OPTIONAL - EEO-1 reporting
  gender?: string;
  ethnicity?: string;
  disability_status?: 'Yes' | 'No' | 'Prefer Not to Say';
  veteran_status?: 'Yes' | 'No' | 'Prefer Not to Say';
}

/**
 * ADP output format
 */
export interface ADPRecord {
  'Employee No': string;
  'SSN': string;
  'FName': string;
  'LName': string;
  'DOB': string;
  'Home_Addr1': string;
  'Home_City': string;
  'Home_State': string;
  'Home_Zip': string;
  'Work_Addr1': string;
  'Work_City': string;
  'Work_State': string;
  'Work_Zip': string;
  'HiredDate': string;
  'JobTitle': string;
  'Dept': string;
  'FLSA_Status': string;
  'PayFreq': string;
  'PayRate': string;
  'Fed_W4_Status': string;
  'Fed_W4_Allow': string;
  'Fed_W4_Extra': string;
  'State_Tax_Code': string;
  'State_Extra_WH': string;
  'Local_Tax_Code_1': string;
  'DD1_Routing': string;
  'DD1_Acct': string;
  'DD1_Type': string;
  'DD1_SplitType': string;
  'DD1_SplitValue': string;
  'DD2_Routing': string;
  'DD2_Acct': string;
  'DD2_Type': string;
  'Deduct_Code_1': string;
  'Deduct_Amt_1': string;
  'Deduct_Code_2': string;
  'Deduct_Amt_2': string;
  'Deduct_Code_3': string;
  'Deduct_Amt_3': string;
  'Deduct_Code_4': string;
  'Deduct_Amt_4': string;
}

/**
 * QuickBooks output format
 */
export interface QuickBooksRecord {
  'Employee #': string;
  'Full Name': string;
  'SSN': string;
  'Date of Birth': string;
  'Home Address': string;
  'Work Location': string;
  'Hire Date': string;
  'Job Title': string;
  'Department': string;
  'FLSA Status': string;
  'Pay Rate ($)': string;
  'Per': string;
  'Federal Filing Status': string;
  'Federal Allowances': string;
  'Federal Extra Withholding': string;
  'State Tax (Work)': string;
  'State Extra Withholding': string;
  'Local Tax': string;
  'I-9 Status': string;
  'E-Verify Status': string;
  'Direct Deposit 1': string;
  'Direct Deposit 2': string;
  'Health Deduction': string;
  'Retirement Deduction': string;
  'Retirement Loan': string;
  'Garnishment': string;
  'EEO Gender': string;
  'EEO Ethnicity': string;
}

/**
 * Error types for validation and processing
 */
export type ErrorType = 
  | 'PARSE_ERROR'
  | 'VALIDATION_ERROR'
  | 'REQUIRED_FIELD_MISSING'
  | 'INVALID_FORMAT'
  | 'BUSINESS_LOGIC_ERROR'
  | 'COMPLIANCE_GATE_FAILED';

/**
 * Log entry types
 */
export type LogLevel = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

/**
 * Processing error with full traceability
 */
export interface ProcessingError {
  id: string;
  rowId: string;
  row: number;
  field: string;
  columnIndex?: number; // 0-based column index from CSV header
  value: string;
  errorType: ErrorType;
  message: string;
  suggestedFix?: string;
  timestamp: string;
}

/**
 * Processing warning (data manipulation)
 */
export interface ProcessingWarning {
  id: string;
  rowId: string;
  row: number;
  field: string;
  originalValue: string;
  message: string;
  timestamp: string;
}

/**
 * Processing log entry
 */
export interface ProcessingLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  row?: number;
  employeeId?: string;
  details?: ProcessingError | ProcessingWarning;
}

/**
 * Error correction with audit trail
 */
export interface ErrorCorrection {
  errorId: string;
  originalValue: string;
  correctedValue: string;
  correctedBy?: string;
  correctedAt: string;
  notes?: string;
}

/**
 * Field mapping configuration
 */
export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string; // e.g., 'uppercase', 'date_format', 'custom_function'
  defaultValue?: string;
}

/**
 * Provider mapping configuration
 */
export interface ProviderMapping {
  provider: 'ADP' | 'QuickBooks';
  fieldMappings: FieldMapping[];
  transformations: Record<string, (value: any, record: EmployeeRecord) => any>;
}

/**
 * Processing progress state
 */
export interface ProcessingProgress {
  totalRows: number;
  processedRows: number;
  skippedRows: number;
  currentRow: number;
  errors: ProcessingError[];
  warnings: ProcessingWarning[];
  logs: ProcessingLog[];
  isComplete: boolean;
  isProcessing: boolean;
}

/**
 * Field specification for documentation
 * Simplified to Required only (removed Allow Null as it's redundant)
 */
export interface FieldSpecification {
  fieldName: string;
  fieldOptions: string; // Comma-separated valid values
  required: 'Yes' | 'No';
  notes: string;
}

/**
 * Address parsing result
 */
export interface ParsedAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

