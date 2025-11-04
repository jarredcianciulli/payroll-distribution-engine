/**
 * Default Mapping Configuration
 * Default field mappings and transformations for ADP and QuickBooks
 */

import type { ProviderMapping } from '../types';

/**
 * Calculates per-paycheck rate from annual salary
 */
function calculatePerPaycheckRate(
  annualSalary: string,
  payFrequency: string
): number {
  const salary = parseFloat(annualSalary);
  if (isNaN(salary)) {
    return 0;
  }

  switch (payFrequency) {
    case 'Weekly':
      return salary / 52;
    case 'Bi-weekly':
      return salary / 26;
    case 'Semi-monthly':
      return salary / 24;
    case 'Monthly':
      return salary / 12;
    default:
      return salary / 26; // Default to bi-weekly
  }
}

/**
 * ADP Provider Mapping
 */
export const adpMapping: ProviderMapping = {
  provider: 'ADP',
  fieldMappings: [
    { sourceField: 'employee_id', targetField: 'Employee No' },
    { sourceField: 'ssn', targetField: 'SSN' },
    { sourceField: 'first_name', targetField: 'FName' },
    { sourceField: 'last_name', targetField: 'LName' },
    { sourceField: 'dob', targetField: 'DOB' },
    { sourceField: 'home_street', targetField: 'Home_Addr1' },
    { sourceField: 'home_city', targetField: 'Home_City' },
    { sourceField: 'home_state', targetField: 'Home_State' },
    { sourceField: 'home_zip', targetField: 'Home_Zip' },
    { sourceField: 'work_street', targetField: 'Work_Addr1' },
    { sourceField: 'work_city', targetField: 'Work_City' },
    { sourceField: 'work_state', targetField: 'Work_State' },
    { sourceField: 'work_zip', targetField: 'Work_Zip' },
    { sourceField: 'hire_date', targetField: 'HiredDate' },
    { sourceField: 'job_title', targetField: 'JobTitle' },
    { sourceField: 'department', targetField: 'Dept' },
    { sourceField: 'flsa_status', targetField: 'FLSA_Status' },
    { sourceField: 'pay_frequency', targetField: 'PayFreq' },
    { sourceField: 'fed_status', targetField: 'Fed_W4_Status' },
    { sourceField: 'fed_allowances', targetField: 'Fed_W4_Allow' },
    { sourceField: 'fed_extra_wh_per_paycheck', targetField: 'Fed_W4_Extra' },
    { sourceField: 'state_code', targetField: 'State_Tax_Code' },
    { sourceField: 'state_extra_wh_per_paycheck', targetField: 'State_Extra_WH' },
    { sourceField: 'local_tax_code_1', targetField: 'Local_Tax_Code_1' },
    { sourceField: 'dd1_routing_number', targetField: 'DD1_Routing' },
    { sourceField: 'dd1_account_number', targetField: 'DD1_Acct' },
    { sourceField: 'dd1_account_type', targetField: 'DD1_Type' },
    { sourceField: 'dd1_split_type', targetField: 'DD1_SplitType' },
    { sourceField: 'dd1_split_value', targetField: 'DD1_SplitValue' },
    { sourceField: 'dd2_routing_number', targetField: 'DD2_Routing' },
    { sourceField: 'dd2_account_number', targetField: 'DD2_Acct' },
    { sourceField: 'dd2_account_type', targetField: 'DD2_Type' }
  ],
  transformations: {
    'Fed_W4_Status': (value: string) => {
      const mapping: Record<string, string> = {
        'Single': 'S',
        'Married': 'M',
        'Married Filing Separately': 'MFS',
        'Head of Household': 'HOH'
      };
      return mapping[value] || value;
    },
    'PayRate': (_value: string, record: any) => {
      return calculatePerPaycheckRate(record.annual_salary, record.pay_frequency).toFixed(2);
    },
    'Deduct_Code_1': (_value: string, record: any) => {
      return record.health_plan_name || '';
    },
    'Deduct_Amt_1': (_value: string, record: any) => {
      return record.health_deduction_per_paycheck || '0.00';
    },
    'Deduct_Code_2': (_value: string, record: any) => {
      return record.retirement_plan_type || '';
    },
    'Deduct_Amt_2': (_value: string, record: any) => {
      if (record.retirement_plan_type && record.annual_salary && record.retirement_contribution_percent) {
        const perPaycheck = calculatePerPaycheckRate(record.annual_salary, record.pay_frequency);
        const contributionPercent = parseFloat(record.retirement_contribution_percent) / 100;
        return (perPaycheck * contributionPercent).toFixed(2);
      }
      return '0.00';
    },
    'Deduct_Code_3': (_value: string, record: any) => {
      return record.retirement_loan_repayment && parseFloat(record.retirement_loan_repayment) > 0 ? '401k Loan' : '';
    },
    'Deduct_Amt_3': (_value: string, record: any) => {
      return record.retirement_loan_repayment || '0.00';
    },
    'Deduct_Code_4': (_value: string, record: any) => {
      return record.garnishment_type || '';
    },
    'Deduct_Amt_4': (_value: string, record: any) => {
      return record.garnishment_amount_per_paycheck || '0.00';
    }
  }
};

/**
 * QuickBooks Provider Mapping
 */
export const quickBooksMapping: ProviderMapping = {
  provider: 'QuickBooks',
  fieldMappings: [
    { sourceField: 'employee_id', targetField: 'Employee #' },
    { sourceField: 'ssn', targetField: 'SSN' },
    { sourceField: 'dob', targetField: 'Date of Birth' },
    { sourceField: 'hire_date', targetField: 'Hire Date' },
    { sourceField: 'job_title', targetField: 'Job Title' },
    { sourceField: 'department', targetField: 'Department' },
    { sourceField: 'flsa_status', targetField: 'FLSA Status' },
    { sourceField: 'pay_frequency', targetField: 'Per' },
    { sourceField: 'fed_status', targetField: 'Federal Filing Status' },
    { sourceField: 'fed_allowances', targetField: 'Federal Allowances' },
    { sourceField: 'fed_extra_wh_per_paycheck', targetField: 'Federal Extra Withholding' },
    { sourceField: 'state_code', targetField: 'State Tax (Work)' },
    { sourceField: 'state_extra_wh_per_paycheck', targetField: 'State Extra Withholding' },
    { sourceField: 'local_tax_code_1', targetField: 'Local Tax' },
    { sourceField: 'i9_status', targetField: 'I-9 Status' },
    { sourceField: 'e_verify_status', targetField: 'E-Verify Status' },
    { sourceField: 'gender', targetField: 'EEO Gender' },
    { sourceField: 'ethnicity', targetField: 'EEO Ethnicity' }
  ],
  transformations: {
    'Full Name': (_value: string, record: any) => {
      return `${record.first_name} ${record.last_name}`.trim();
    },
    'Home Address': (_value: string, record: any) => {
      return `${record.home_street}, ${record.home_city}, ${record.home_state} ${record.home_zip}`.trim();
    },
    'Work Location': (_value: string, record: any) => {
      return `${record.work_street}, ${record.work_city}, ${record.work_state} ${record.work_zip}`.trim();
    },
    'Pay Rate ($)': (_value: string, record: any) => {
      return calculatePerPaycheckRate(record.annual_salary, record.pay_frequency).toFixed(2);
    },
    'Federal Filing Status': (value: string) => {
      const mapping: Record<string, string> = {
        'Single': 'single',
        'Married': 'married_filing_jointly',
        'Married Filing Separately': 'married_filing_separately',
        'Head of Household': 'head_of_household'
      };
      return mapping[value] || value.toLowerCase().replace(/\s+/g, '_');
    },
    'Direct Deposit 1': (_value: string, record: any) => {
      if (record.dd1_routing_number && record.dd1_account_number && record.dd1_account_type) {
        const splitInfo = record.dd1_split_type === 'Percent' 
          ? `${record.dd1_split_value}%`
          : `$${record.dd1_split_value}`;
        return `${record.dd1_routing_number}-${record.dd1_account_number}-${record.dd1_account_type}-${splitInfo}`;
      }
      return '';
    },
    'Direct Deposit 2': (_value: string, record: any) => {
      if (record.dd2_routing_number && record.dd2_account_number && record.dd2_account_type) {
        return `${record.dd2_routing_number}-${record.dd2_account_number}-${record.dd2_account_type}`;
      }
      return '';
    },
    'Health Deduction': (_value: string, record: any) => {
      return record.health_plan_name && record.health_deduction_per_paycheck
        ? `${record.health_plan_name} - ${record.health_deduction_per_paycheck}`
        : '';
    },
    'Retirement Deduction': (_value: string, record: any) => {
      if (record.retirement_plan_type && record.annual_salary && record.retirement_contribution_percent) {
        const perPaycheck = calculatePerPaycheckRate(record.annual_salary, record.pay_frequency);
        const contributionPercent = parseFloat(record.retirement_contribution_percent) / 100;
        const amount = (perPaycheck * contributionPercent).toFixed(2);
        return `${record.retirement_plan_type} - ${record.retirement_contribution_percent}% ($${amount})`;
      }
      return '';
    },
    'Retirement Loan': (_value: string, record: any) => {
      return record.retirement_loan_repayment && parseFloat(record.retirement_loan_repayment) > 0
        ? `$${record.retirement_loan_repayment}`
        : '';
    },
    'Garnishment': (_value: string, record: any) => {
      return record.garnishment_type && record.garnishment_amount_per_paycheck
        ? `${record.garnishment_type} - $${record.garnishment_amount_per_paycheck}`
        : '';
    }
  }
};

