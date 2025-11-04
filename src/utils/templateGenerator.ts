/**
 * Template Generator Utility
 * Generates downloadable CSV templates and documentation
 */

import { exportToCSV } from './csvWriter';
import type { DETRecord, FieldSpecification } from '../types';

/**
 * Standard input format header (all fields)
 * Note: HDR, DET, and FTR records use different field sets
 * This header represents DET (Detail) record fields
 */
const STANDARD_INPUT_HEADERS = [
  // Record type and record tracking (DET record)
  'record_type',
  'record_sequence',
  'company_id',
  // Employee data
  'employee_id',
  'first_name',
  'last_name',
  'dob',
  'ssn',
  'home_street',
  'home_city',
  'home_state',
  'home_zip',
  'work_street',
  'work_city',
  'work_state',
  'work_zip',
  'hire_date',
  'original_hire_date',
  'rehire_date',
  'termination_date',
  'job_title',
  'department',
  'manager_email',
  'employee_email',
  'employee_phone',
  'flsa_status',
  'annual_salary',
  'pay_frequency',
  'employment_type',
  'employee_status',
  'pay_rate_type',
  'hours_per_week',
  'fed_status',
  'fed_allowances',
  'fed_extra_wh_per_paycheck',
  'state_code',
  'state_extra_wh_per_paycheck',
  'local_tax_code_1',
  'i9_status',
  'e_verify_status',
  'dd1_routing_number',
  'dd1_account_number',
  'dd1_account_type',
  'dd1_split_type',
  'dd1_split_value',
  'dd2_routing_number',
  'dd2_account_number',
  'dd2_account_type',
  'union_employee',
  'union_start_date',
  'union_dues_amount_per_paycheck',
  'health_plan_name',
  'health_deduction_per_paycheck',
  'disability_plan_code',
  'retirement_plan_type',
  'retirement_contribution_percent',
  'retirement_loan_repayment',
  'garnishment_type',
  'garnishment_amount_per_paycheck',
  'emergency_contact_name',
  'emergency_contact_phone',
  'gender',
  'ethnicity',
  'disability_status',
  'veteran_status'
];

/**
 * Generates a template CSV file with dummy data
 * Generates DET (Detail) records with record tracking fields
 */
export function generateInputTemplate(): void {
  const dummyData: Partial<DETRecord>[] = [
    {
      record_type: 'DET',
      record_sequence: '1',
      company_id: 'COMP001',
      employee_id: '1001',
      first_name: 'John',
      last_name: 'Doe',
      dob: '1990-05-15',
      ssn: 'XXX-XX-1234',
      home_street: '123 Main St',
      home_city: 'Hanahan',
      home_state: 'SC',
      home_zip: '29410',
      work_street: '456 King St',
      work_city: 'Charleston',
      work_state: 'SC',
      work_zip: '29401',
      hire_date: '2025-11-01',
      original_hire_date: '2025-11-01',
      job_title: 'Software Engineer',
      department: 'Engineering',
      manager_email: 'manager@company.com',
      employee_email: 'john.doe@company.com',
      employee_phone: '555-0101',
      flsa_status: 'Exempt',
      annual_salary: '120000',
      pay_frequency: 'Bi-weekly',
      employment_type: 'Full-time',
      employee_status: 'Active',
      pay_rate_type: 'Salary',
      hours_per_week: '40',
      fed_status: 'Married',
      fed_allowances: '2',
      fed_extra_wh_per_paycheck: '0.00',
      state_code: 'SC',
      state_extra_wh_per_paycheck: '0.00',
      i9_status: 'Completed',
      e_verify_status: 'Authorized',
      dd1_routing_number: '012345678',
      dd1_account_number: '987654321',
      dd1_account_type: 'Checking',
      dd1_split_type: 'Percent',
      dd1_split_value: '100',
      union_employee: 'Yes',
      union_start_date: '2025-11-01',
      union_dues_amount_per_paycheck: '25.00',
      health_plan_name: 'PPO Plan',
      health_deduction_per_paycheck: '85.50',
      disability_plan_code: 'SC_SIT',
      retirement_plan_type: '401k',
      retirement_contribution_percent: '6',
      retirement_loan_repayment: '0.00',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_phone: '555-1234',
      gender: 'Male',
      ethnicity: 'White',
      disability_status: 'No',
      veteran_status: 'No'
    },
    {
      record_type: 'DET',
      record_sequence: '2',
      company_id: 'COMP001',
      employee_id: '1002',
      first_name: 'Jane',
      last_name: 'Smith',
      dob: '1995-10-20',
      ssn: 'XXX-XX-5678',
      home_street: '456 Oak Ave',
      home_city: 'Atlanta',
      home_state: 'GA',
      home_zip: '30301',
      work_street: '456 Oak Ave',
      work_city: 'Atlanta',
      work_state: 'GA',
      work_zip: '30301',
      hire_date: '2025-11-03',
      original_hire_date: '2025-11-03',
      job_title: 'Product Manager',
      department: 'Product',
      manager_email: 'director@company.com',
      employee_email: 'jane.smith@company.com',
      employee_phone: '555-0102',
      flsa_status: 'Exempt',
      annual_salary: '140000',
      pay_frequency: 'Weekly',
      employment_type: 'Full-time',
      employee_status: 'Active',
      pay_rate_type: 'Salary',
      hours_per_week: '40',
      fed_status: 'Single',
      fed_allowances: '1',
      fed_extra_wh_per_paycheck: '0.00',
      state_code: 'GA',
      state_extra_wh_per_paycheck: '10.00',
      local_tax_code_1: 'ATL_CITY_TAX',
      i9_status: 'Completed',
      e_verify_status: 'Authorized',
      dd1_routing_number: '111111111',
      dd1_account_number: '222222222',
      dd1_account_type: 'Checking',
      dd1_split_type: 'Flat_Amount',
      dd1_split_value: '500',
      dd2_routing_number: '111111111',
      dd2_account_number: '333333333',
      dd2_account_type: 'Savings',
      union_employee: 'No',
      health_plan_name: 'HSA Plan',
      health_deduction_per_paycheck: '42.00',
      disability_plan_code: 'GA_SDI',
      retirement_plan_type: 'Roth 401k',
      retirement_contribution_percent: '4',
      retirement_loan_repayment: '0.00',
      emergency_contact_name: 'John Smith',
      emergency_contact_phone: '555-5678',
      gender: 'Female',
      ethnicity: 'Asian',
      disability_status: 'No',
      veteran_status: 'No'
    }
  ];

  exportToCSV(dummyData as DETRecord[], 'randomized_employee_data_sample.csv', STANDARD_INPUT_HEADERS);
}

/**
 * Generates format documentation CSV with headers and examples
 */
export function generateFormatDocumentation(): void {
  const documentation = [
    {
      'Field Name': 'employee_id',
      'Example': '1001',
      'Description': 'Unique employee identifier'
    },
    {
      'Field Name': 'first_name',
      'Example': 'John',
      'Description': 'Employee first name'
    },
    {
      'Field Name': 'last_name',
      'Example': 'Doe',
      'Description': 'Employee last name'
    },
    {
      'Field Name': 'dob',
      'Example': '1990-05-15',
      'Description': 'Date of birth in YYYY-MM-DD format'
    },
    {
      'Field Name': 'ssn',
      'Example': 'XXX-XX-1234',
      'Description': 'Social Security Number (masked format)'
    },
    {
      'Field Name': 'home_street',
      'Example': '123 Main St',
      'Description': 'Home address street'
    },
    {
      'Field Name': 'home_city',
      'Example': 'Hanahan',
      'Description': 'Home address city'
    },
    {
      'Field Name': 'home_state',
      'Example': 'SC',
      'Description': 'Home address state (2-letter code)'
    },
    {
      'Field Name': 'home_zip',
      'Example': '29410',
      'Description': 'Home address ZIP code'
    },
    {
      'Field Name': 'work_street',
      'Example': '456 King St',
      'Description': 'Work address street'
    },
    {
      'Field Name': 'work_city',
      'Example': 'Charleston',
      'Description': 'Work address city'
    },
    {
      'Field Name': 'work_state',
      'Example': 'SC',
      'Description': 'Work address state (2-letter code)'
    },
    {
      'Field Name': 'work_zip',
      'Example': '29401',
      'Description': 'Work address ZIP code'
    },
    {
      'Field Name': 'hire_date',
      'Example': '2025-11-01',
      'Description': 'Employee hire date in YYYY-MM-DD format'
    },
    {
      'Field Name': 'job_title',
      'Example': 'Software Engineer',
      'Description': 'Employee job title'
    },
    {
      'Field Name': 'department',
      'Example': 'Engineering',
      'Description': 'Employee department'
    },
    {
      'Field Name': 'manager_email',
      'Example': 'manager@company.com',
      'Description': 'Manager email address'
    },
    {
      'Field Name': 'flsa_status',
      'Example': 'Exempt',
      'Description': 'FLSA status: Exempt or Non-Exempt'
    },
    {
      'Field Name': 'annual_salary',
      'Example': '120000',
      'Description': 'Annual salary amount (numeric string)'
    },
    {
      'Field Name': 'pay_frequency',
      'Example': 'Bi-weekly',
      'Description': 'Pay frequency: Weekly, Bi-weekly, Semi-monthly, or Monthly'
    },
    {
      'Field Name': 'fed_status',
      'Example': 'Married',
      'Description': 'Federal filing status: Single, Married, Married Filing Separately, or Head of Household'
    },
    {
      'Field Name': 'fed_allowances',
      'Example': '2',
      'Description': 'Federal tax allowances (numeric string)'
    },
    {
      'Field Name': 'fed_extra_wh_per_paycheck',
      'Example': '0.00',
      'Description': 'Federal extra withholding per paycheck (decimal)'
    },
    {
      'Field Name': 'state_code',
      'Example': 'SC',
      'Description': 'State tax code (2-letter state abbreviation)'
    },
    {
      'Field Name': 'state_extra_wh_per_paycheck',
      'Example': '0.00',
      'Description': 'State extra withholding per paycheck (decimal)'
    },
    {
      'Field Name': 'local_tax_code_1',
      'Example': 'ATL_CITY_TAX',
      'Description': 'Local tax code (optional)'
    },
    {
      'Field Name': 'i9_status',
      'Example': 'Completed',
      'Description': 'I-9 verification status: Completed, Pending_Section_2, or Not_Started'
    },
    {
      'Field Name': 'e_verify_status',
      'Example': 'Authorized',
      'Description': 'E-Verify status: Authorized, Not_Started, or Pending'
    },
    {
      'Field Name': 'dd1_routing_number',
      'Example': '012345678',
      'Description': '9-digit routing number for primary direct deposit'
    },
    {
      'Field Name': 'dd1_account_number',
      'Example': '987654321',
      'Description': 'Account number for primary direct deposit'
    },
    {
      'Field Name': 'dd1_account_type',
      'Example': 'Checking',
      'Description': 'Account type for primary DD: Checking or Savings'
    },
    {
      'Field Name': 'dd1_split_type',
      'Example': 'Percent',
      'Description': 'Split type for primary DD: Percent or Flat_Amount'
    },
    {
      'Field Name': 'dd1_split_value',
      'Example': '100',
      'Description': 'Split value (percentage or flat amount)'
    },
    {
      'Field Name': 'dd2_routing_number',
      'Example': '',
      'Description': 'Routing number for secondary direct deposit (optional)'
    },
    {
      'Field Name': 'dd2_account_number',
      'Example': '',
      'Description': 'Account number for secondary direct deposit (optional)'
    },
    {
      'Field Name': 'dd2_account_type',
      'Example': '',
      'Description': 'Account type for secondary DD: Checking or Savings (optional)'
    },
    {
      'Field Name': 'health_plan_name',
      'Example': 'PPO Plan',
      'Description': 'Health insurance plan name'
    },
    {
      'Field Name': 'health_deduction_per_paycheck',
      'Example': '85.50',
      'Description': 'Health insurance deduction per paycheck (decimal)'
    },
    {
      'Field Name': 'disability_plan_code',
      'Example': 'SC_SIT',
      'Description': 'Disability plan code'
    },
    {
      'Field Name': 'retirement_plan_type',
      'Example': '401k',
      'Description': 'Retirement plan type (e.g., 401k, Roth 401k)'
    },
    {
      'Field Name': 'retirement_contribution_percent',
      'Example': '6',
      'Description': 'Retirement contribution percentage (numeric string)'
    },
    {
      'Field Name': 'retirement_loan_repayment',
      'Example': '0.00',
      'Description': 'Retirement loan repayment per paycheck (decimal)'
    },
    {
      'Field Name': 'garnishment_type',
      'Example': 'Child_Support',
      'Description': 'Garnishment type (optional)'
    },
    {
      'Field Name': 'garnishment_amount_per_paycheck',
      'Example': '250.00',
      'Description': 'Garnishment amount per paycheck (decimal)'
    },
    {
      'Field Name': 'emergency_contact_name',
      'Example': 'Jane Doe',
      'Description': 'Emergency contact full name'
    },
    {
      'Field Name': 'emergency_contact_phone',
      'Example': '555-1234',
      'Description': 'Emergency contact phone number'
    },
    {
      'Field Name': 'gender',
      'Example': 'Male',
      'Description': 'Employee gender (for EEO-1 reporting)'
    },
    {
      'Field Name': 'ethnicity',
      'Example': 'White',
      'Description': 'Employee ethnicity (for EEO-1 reporting)'
    }
  ];

  exportToCSV(documentation, 'employees_format_documentation.csv');
}

/**
 * Generates field specification CSV with validation rules
 * Simplified to Required only (removed Allow Null as it's redundant)
 */
export function generateFieldSpecification(): void {
  const specifications: FieldSpecification[] = [
    // HDR (Header) Record Fields
    { fieldName: 'record_type', fieldOptions: 'HDR', required: 'Yes', notes: 'Record type identifier - must be "HDR" for header record' },
    { fieldName: 'format_version', fieldOptions: 'Version string (e.g., 1.0, 2.0)', required: 'Yes', notes: 'File format version identifier for scalability' },
    { fieldName: 'upload_id', fieldOptions: 'Unique identifier (UUID or timestamp-based)', required: 'Yes', notes: 'Unique identifier for this upload/batch' },
    { fieldName: 'file_timestamp', fieldOptions: 'ISO 8601 format (e.g., 2025-11-15T14:30:00Z)', required: 'Yes', notes: 'Timestamp when file was created/uploaded' },
    { fieldName: 'file_name', fieldOptions: 'S3 bucket filename', required: 'Yes', notes: 'S3 bucket filename for traceability' },
    { fieldName: 'directory_path', fieldOptions: 'S3 directory path (e.g., payroll/2025/11)', required: 'Yes', notes: 'S3 directory/path where file is stored' },
    { fieldName: 'employer_id', fieldOptions: 'Umbrella employer identifier', required: 'Yes', notes: 'Umbrella employer identifier (for entire file)' },
    { fieldName: 'total_records', fieldOptions: 'Numeric string', required: 'Yes', notes: 'Total number of detail (DET) records expected in file' },
    { fieldName: 'processing_date', fieldOptions: 'YYYY-MM-DD format', required: 'Yes', notes: 'Date file should be processed' },
    
    // DET (Detail) Record Fields - Record Tracking
    { fieldName: 'record_type', fieldOptions: 'DET', required: 'Yes', notes: 'Record type identifier - must be "DET" for detail/employee records' },
    { fieldName: 'record_sequence', fieldOptions: 'Sequential number (1, 2, 3...)', required: 'Yes', notes: 'Sequential line number in file for validation' },
    { fieldName: 'company_id', fieldOptions: 'Company identifier', required: 'Yes', notes: 'Specific company identifier for this employee (within umbrella employer)' },
    
    // DET Record Fields - Employee Data (REQUIRED)
    { fieldName: 'employee_id', fieldOptions: 'Any unique identifier', required: 'Yes', notes: 'Must be unique across all employees' },
    { fieldName: 'first_name', fieldOptions: 'Any string', required: 'Yes', notes: 'Employee first name' },
    { fieldName: 'last_name', fieldOptions: 'Any string', required: 'Yes', notes: 'Employee last name' },
    { fieldName: 'dob', fieldOptions: 'YYYY-MM-DD format', required: 'Yes', notes: 'Date of birth in ISO format' },
    { fieldName: 'ssn', fieldOptions: 'XXX-XX-XXXX format', required: 'Yes', notes: 'Social Security Number (masked)' },
    { fieldName: 'home_street', fieldOptions: 'Any string', required: 'Yes', notes: 'Street address for home location' },
    { fieldName: 'home_city', fieldOptions: 'Any string', required: 'Yes', notes: 'City for home location' },
    { fieldName: 'home_state', fieldOptions: '2-letter state code (e.g., SC, GA, NC)', required: 'Yes', notes: 'State abbreviation for home location' },
    { fieldName: 'home_zip', fieldOptions: '5-digit or 9-digit ZIP code', required: 'Yes', notes: 'ZIP code for home location' },
    { fieldName: 'hire_date', fieldOptions: 'YYYY-MM-DD format', required: 'Yes', notes: 'Employee hire date in ISO format' },
    { fieldName: 'job_title', fieldOptions: 'Any string', required: 'Yes', notes: 'Employee job title' },
    { fieldName: 'flsa_status', fieldOptions: 'Exempt, Non-Exempt', required: 'Yes', notes: 'FLSA classification determines overtime eligibility' },
    { fieldName: 'annual_salary', fieldOptions: 'Numeric string (e.g., 120000)', required: 'Yes', notes: 'Annual salary amount (will be converted to per-paycheck rate)' },
    { fieldName: 'pay_frequency', fieldOptions: 'Weekly, Bi-weekly, Semi-monthly, Monthly', required: 'Yes', notes: 'Determines how salary is divided for per-paycheck calculations' },
    { fieldName: 'fed_status', fieldOptions: 'Single, Married, Married Filing Separately, Head of Household', required: 'Yes', notes: 'Federal tax filing status' },
    { fieldName: 'fed_allowances', fieldOptions: 'Numeric string (0-99)', required: 'Yes', notes: 'Federal tax withholding allowances' },
    { fieldName: 'fed_extra_wh_per_paycheck', fieldOptions: 'Decimal (e.g., 50.00)', required: 'Yes', notes: 'Additional federal withholding per paycheck' },
    { fieldName: 'state_code', fieldOptions: '2-letter state code', required: 'Yes', notes: 'State tax code (where employee works)' },
    { fieldName: 'state_extra_wh_per_paycheck', fieldOptions: 'Decimal (e.g., 10.00)', required: 'Yes', notes: 'Additional state withholding per paycheck' },
    { fieldName: 'i9_status', fieldOptions: 'Completed, Pending_Section_2, Not_Started', required: 'Yes', notes: 'I-9 verification status. Must be Completed for payroll processing (compliance gate)' },
    { fieldName: 'e_verify_status', fieldOptions: 'Authorized, Not_Started, Pending', required: 'Yes', notes: 'E-Verify status. Must be Authorized for payroll processing (compliance gate)' },
    { fieldName: 'dd1_routing_number', fieldOptions: '9-digit number', required: 'Yes', notes: 'Bank routing number for primary direct deposit' },
    { fieldName: 'dd1_account_number', fieldOptions: 'Any string', required: 'Yes', notes: 'Bank account number for primary direct deposit' },
    { fieldName: 'dd1_account_type', fieldOptions: 'Checking, Savings', required: 'Yes', notes: 'Account type for primary direct deposit' },
    { fieldName: 'dd1_split_type', fieldOptions: 'Percent, Flat_Amount', required: 'Yes', notes: 'How primary DD split is calculated' },
    { fieldName: 'dd1_split_value', fieldOptions: 'Numeric string', required: 'Yes', notes: 'If Percent: 0-100. If Flat_Amount: dollar amount. Must sum to 100% if both DD1 and DD2 use Percent' },
    
    // DET Record Fields - Employee Data (OPTIONAL)
    { fieldName: 'work_street', fieldOptions: 'Any string', required: 'No', notes: 'Street address for work location (optional, used for tax reciprocity)' },
    { fieldName: 'work_city', fieldOptions: 'Any string', required: 'No', notes: 'City for work location (optional)' },
    { fieldName: 'work_state', fieldOptions: '2-letter state code (e.g., SC, GA, NC)', required: 'No', notes: 'State abbreviation for work location (optional, used for tax reciprocity)' },
    { fieldName: 'work_zip', fieldOptions: '5-digit or 9-digit ZIP code', required: 'No', notes: 'ZIP code for work location (optional)' },
    { fieldName: 'original_hire_date', fieldOptions: 'YYYY-MM-DD format', required: 'No', notes: 'Original hire date (for rehires, use this to track original tenure)' },
    { fieldName: 'rehire_date', fieldOptions: 'YYYY-MM-DD format', required: 'No', notes: 'Rehire date if employee was previously terminated and rehired' },
    { fieldName: 'termination_date', fieldOptions: 'YYYY-MM-DD format', required: 'No', notes: 'Termination date if employee is no longer active' },
    { fieldName: 'department', fieldOptions: 'Any string', required: 'No', notes: 'Employee department (optional)' },
    { fieldName: 'manager_email', fieldOptions: 'Valid email address', required: 'No', notes: 'Manager email address (optional)' },
    { fieldName: 'employee_email', fieldOptions: 'Valid email address', required: 'No', notes: 'Employee email address (optional, commonly used for payroll portal access)' },
    { fieldName: 'employee_phone', fieldOptions: 'Phone number format', required: 'No', notes: 'Employee phone number (optional)' },
    { fieldName: 'employment_type', fieldOptions: 'Full-time, Part-time, Contractor, Seasonal, Temporary', required: 'No', notes: 'Employment type (affects benefits eligibility and tax treatment)' },
    { fieldName: 'employee_status', fieldOptions: 'Active, Inactive, Leave of Absence, Terminated', required: 'No', notes: 'Current employment status (critical for payroll processing)' },
    { fieldName: 'pay_rate_type', fieldOptions: 'Salary, Hourly', required: 'No', notes: 'How pay is calculated (Salary = fixed, Hourly = time-based)' },
    { fieldName: 'hours_per_week', fieldOptions: 'Numeric string (e.g., 40, 20)', required: 'No', notes: 'Standard hours per week (important for part-time employees and benefits eligibility)' },
    { fieldName: 'local_tax_code_1', fieldOptions: 'Any string (e.g., ATL_CITY_TAX)', required: 'No', notes: 'Local tax code (if applicable, optional)' },
    { fieldName: 'dd2_routing_number', fieldOptions: '9-digit number', required: 'No', notes: 'Bank routing number for secondary direct deposit (optional)' },
    { fieldName: 'dd2_account_number', fieldOptions: 'Any string', required: 'No', notes: 'Bank account number for secondary direct deposit (optional)' },
    { fieldName: 'dd2_account_type', fieldOptions: 'Checking, Savings', required: 'No', notes: 'Account type for secondary direct deposit (optional)' },
    { fieldName: 'union_employee', fieldOptions: 'Yes, No', required: 'No', notes: 'Whether employee is a union member (affects dues deductions)' },
    { fieldName: 'union_start_date', fieldOptions: 'YYYY-MM-DD format', required: 'No', notes: 'Date employee joined union (optional, even if union_employee = Yes)' },
    { fieldName: 'union_dues_amount_per_paycheck', fieldOptions: 'Decimal (e.g., 25.00)', required: 'No', notes: 'Union dues deduction per paycheck (optional)' },
    { fieldName: 'health_plan_name', fieldOptions: 'Any string (e.g., PPO Plan, HSA Plan)', required: 'No', notes: 'Health insurance plan name (optional)' },
    { fieldName: 'health_deduction_per_paycheck', fieldOptions: 'Decimal (e.g., 85.50)', required: 'No', notes: 'Health insurance premium deduction per paycheck (optional)' },
    { fieldName: 'disability_plan_code', fieldOptions: 'State-specific code (e.g., SC_SIT, GA_SDI)', required: 'No', notes: 'State disability insurance plan code (optional)' },
    { fieldName: 'retirement_plan_type', fieldOptions: '401k, Roth 401k, 403b, etc.', required: 'No', notes: 'Type of retirement plan (optional)' },
    { fieldName: 'retirement_contribution_percent', fieldOptions: 'Numeric string (0-100)', required: 'No', notes: 'Employee contribution percentage to retirement plan (optional)' },
    { fieldName: 'retirement_loan_repayment', fieldOptions: 'Decimal (e.g., 75.00)', required: 'No', notes: 'Retirement loan repayment amount per paycheck (0.00 if no loan, optional)' },
    { fieldName: 'garnishment_type', fieldOptions: 'Child_Support, Tax_Levy, etc.', required: 'No', notes: 'Type of garnishment (if applicable, optional)' },
    { fieldName: 'garnishment_amount_per_paycheck', fieldOptions: 'Decimal (e.g., 250.00)', required: 'No', notes: 'Garnishment amount per paycheck (0.00 if no garnishment, optional)' },
    { fieldName: 'emergency_contact_name', fieldOptions: 'Any string', required: 'No', notes: 'Full name of emergency contact (optional)' },
    { fieldName: 'emergency_contact_phone', fieldOptions: 'Phone number format', required: 'No', notes: 'Phone number of emergency contact (optional)' },
    { fieldName: 'gender', fieldOptions: 'Male, Female, Non-Binary, Prefer Not to Say', required: 'No', notes: 'Employee gender for EEO-1 reporting (optional)' },
    { fieldName: 'ethnicity', fieldOptions: 'White, Black, Hispanic, Asian, Native American, etc.', required: 'No', notes: 'Employee ethnicity for EEO-1 reporting (optional)' },
    { fieldName: 'disability_status', fieldOptions: 'Yes, No, Prefer Not to Say', required: 'No', notes: 'EEO-1 reporting field for disability status (optional)' },
    { fieldName: 'veteran_status', fieldOptions: 'Yes, No, Prefer Not to Say', required: 'No', notes: 'EEO-1 reporting field for veteran status (optional)' },
    
    // FTR (Footer/Trailer) Record Fields
    { fieldName: 'record_type', fieldOptions: 'FTR', required: 'No', notes: 'Record type identifier - must be "FTR" for footer/trailer record (optional)' },
    { fieldName: 'total_employees_processed', fieldOptions: 'Numeric string', required: 'No', notes: 'Total number of employees successfully processed (optional)' },
    { fieldName: 'total_employees_skipped', fieldOptions: 'Numeric string', required: 'No', notes: 'Total number of employees skipped (optional)' },
    { fieldName: 'total_errors', fieldOptions: 'Numeric string', required: 'No', notes: 'Total number of errors encountered (optional)' }
  ];

  exportToCSV(specifications, 'employees_field_specification.csv');
}

