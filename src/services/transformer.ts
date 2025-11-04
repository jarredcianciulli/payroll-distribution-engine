/**
 * Transformer Service
 * Transforms employee records to provider-specific formats (ADP, QuickBooks)
 */

import type { EmployeeRecord, ADPRecord, QuickBooksRecord, ProviderMapping } from '../types';
import { adpMapping, quickBooksMapping } from '../config/defaultMappings';

/**
 * Gets mapping configuration for a provider
 * Supports loading custom mappings from localStorage
 */
function getProviderMapping(provider: 'ADP' | 'QuickBooks'): ProviderMapping {
  // Try to load custom mapping from localStorage
  const customMappingKey = `payroll_mapping_${provider}`;
  try {
    const stored = localStorage.getItem(customMappingKey);
    if (stored) {
      return JSON.parse(stored) as ProviderMapping;
    }
  } catch (error) {
    console.warn(`Failed to load custom mapping for ${provider}, using default`);
  }

  // Return default mapping
  return provider === 'ADP' ? adpMapping : quickBooksMapping;
}

/**
 * Transforms an employee record to ADP format
 * @param employee Employee record
 * @returns ADP-formatted record
 */
export function transformToADP(employee: EmployeeRecord): ADPRecord {
  const mapping = getProviderMapping('ADP');
  const adpRecord: Partial<ADPRecord> = {};

  // Apply field mappings
  for (const fieldMapping of mapping.fieldMappings) {
    const sourceValue = employee[fieldMapping.sourceField as keyof EmployeeRecord];
    
    // Apply transformation if exists
    const targetField = fieldMapping.targetField;
    if (mapping.transformations[targetField]) {
      adpRecord[targetField as keyof ADPRecord] = mapping.transformations[targetField](
        String(sourceValue || ''),
        employee
      ) as any;
    } else {
      adpRecord[targetField as keyof ADPRecord] = String(sourceValue || '') as any;
    }
  }

  // Apply transformations for fields that don't have direct mappings
  for (const [targetField, transformFn] of Object.entries(mapping.transformations)) {
    if (!adpRecord[targetField as keyof ADPRecord]) {
      adpRecord[targetField as keyof ADPRecord] = transformFn('', employee) as any;
    }
  }

  return adpRecord as ADPRecord;
}

/**
 * Transforms an employee record to QuickBooks format
 * @param employee Employee record
 * @returns QuickBooks-formatted record
 */
export function transformToQuickBooks(employee: EmployeeRecord): QuickBooksRecord {
  const mapping = getProviderMapping('QuickBooks');
  const qbRecord: Partial<QuickBooksRecord> = {};

  // Apply field mappings
  for (const fieldMapping of mapping.fieldMappings) {
    const sourceValue = employee[fieldMapping.sourceField as keyof EmployeeRecord];
    
    // Apply transformation if exists
    const targetField = fieldMapping.targetField;
    if (mapping.transformations[targetField]) {
      qbRecord[targetField as keyof QuickBooksRecord] = mapping.transformations[targetField](
        String(sourceValue || ''),
        employee
      ) as any;
    } else {
      qbRecord[targetField as keyof QuickBooksRecord] = String(sourceValue || '') as any;
    }
  }

  // Apply transformations for fields that don't have direct mappings
  for (const [targetField, transformFn] of Object.entries(mapping.transformations)) {
    if (!qbRecord[targetField as keyof QuickBooksRecord]) {
      qbRecord[targetField as keyof QuickBooksRecord] = transformFn('', employee) as any;
    }
  }

  return qbRecord as QuickBooksRecord;
}

/**
 * Transforms multiple employee records to ADP format
 * @param employees Array of employee records
 * @returns Array of ADP-formatted records
 */
export function transformEmployeesToADP(employees: EmployeeRecord[]): ADPRecord[] {
  return employees.map(transformToADP);
}

/**
 * Transforms multiple employee records to QuickBooks format
 * @param employees Array of employee records
 * @returns Array of QuickBooks-formatted records
 */
export function transformEmployeesToQuickBooks(employees: EmployeeRecord[]): QuickBooksRecord[] {
  return employees.map(transformToQuickBooks);
}

