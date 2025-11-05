/**
 * CSV Processor Service
 * Handles CSV parsing, intelligent data cleaning, and messy data handling
 */

import Papa from 'papaparse';
import type { EmployeeRecord, DETRecord, ProcessingWarning, ParsedAddress } from '../types';
import { generateErrorId } from './errorTracker';

/**
 * Parses a single address string into components
 * Handles various formats: "123 Main St, City, State ZIP" or "123 Main St, City, ST ZIP"
 */
function parseAddress(addressString: string): ParsedAddress | null {
  if (!addressString || addressString.trim() === '') {
    return null;
  }

  const trimmed = addressString.trim();
  
  // Pattern: "Street, City, State ZIP" or "Street, City, ST ZIP"
  // Try to match ZIP code (5 digits or 5+4 format)
  const zipMatch = trimmed.match(/(\d{5}(?:-\d{4})?)\s*$/);
  if (!zipMatch) {
    return null;
  }

  const zip = zipMatch[1];
  const beforeZip = trimmed.substring(0, trimmed.lastIndexOf(zip)).trim();
  
  // Split by comma
  const parts = beforeZip.split(',').map(p => p.trim());
  
  if (parts.length < 2) {
    return null;
  }

  // Last part should be state
  const state = parts[parts.length - 1];
  // Second to last should be city
  const city = parts[parts.length - 2];
  // Everything before that is street
  const street = parts.slice(0, -2).join(', ');

  return {
    street: street || '',
    city: city || '',
    state: state || '',
    zip: zip || ''
  };
}

/**
 * Processes a single row to handle messy data formats
 * Automatically splits combined fields and emits warnings
 */
function processMessyData(
  row: Record<string, string>,
  rowIndex: number,
  warnings: ProcessingWarning[]
): Record<string, string> {
  const processedRow = { ...row };
  const rowId = row.employee_id || `row_${rowIndex}`;

  // Check for combined address fields
  // If home_street is empty but we have a combined field like "home_address"
  if (!processedRow.home_street && processedRow.home_address) {
    const parsed = parseAddress(processedRow.home_address);
    if (parsed) {
      processedRow.home_street = parsed.street;
      processedRow.home_city = parsed.city;
      processedRow.home_state = parsed.state;
      processedRow.home_zip = parsed.zip;
      
      warnings.push({
        id: generateErrorId(),
        rowId,
        row: rowIndex,
        field: 'home_address',
        originalValue: processedRow.home_address,
        message: `Combined address field split into home_street, home_city, home_state, home_zip`,
        timestamp: new Date().toISOString()
      });
    }
    delete processedRow.home_address;
  }

  // Same for work address
  if (!processedRow.work_street && processedRow.work_address) {
    const parsed = parseAddress(processedRow.work_address);
    if (parsed) {
      processedRow.work_street = parsed.street;
      processedRow.work_city = parsed.city;
      processedRow.work_state = parsed.state;
      processedRow.work_zip = parsed.zip;
      
      warnings.push({
        id: generateErrorId(),
        rowId,
        row: rowIndex,
        field: 'work_address',
        originalValue: processedRow.work_address,
        message: `Combined address field split into work_street, work_city, work_state, work_zip`,
        timestamp: new Date().toISOString()
      });
    }
    delete processedRow.work_address;
  }

  // Check for combined name fields
  if (!processedRow.first_name && processedRow.full_name) {
    const nameParts = processedRow.full_name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      processedRow.first_name = nameParts[0];
      processedRow.last_name = nameParts.slice(1).join(' ');
      
      warnings.push({
        id: generateErrorId(),
        rowId,
        row: rowIndex,
        field: 'full_name',
        originalValue: processedRow.full_name,
        message: `Combined name field split into first_name and last_name`,
        timestamp: new Date().toISOString()
      });
    }
    delete processedRow.full_name;
  }

  return processedRow;
}

/**
 * Progress callback type
 */
export type ProgressCallback = (progress: {
  current: number;
  total: number;
  row?: Record<string, string>;
  warnings?: ProcessingWarning[];
}) => void;

/**
 * Extracts employee data from DET record (removes DET-specific tracking fields)
 */
function extractEmployeeData(detRecord: Partial<DETRecord>): EmployeeRecord {
  const { 
    record_type, 
    record_sequence,
    company_id,
    ...employeeData 
  } = detRecord;
  return employeeData as unknown as EmployeeRecord;
}

/**
 * Processes CSV file content asynchronously
 * Handles HDR, DET, and FTR record types
 * Only processes DET records for employee data
 * @param fileContent CSV file content as string
 * @param onProgress Optional progress callback
 * @returns Promise with parsed and processed rows
 */
export async function processCSV(
  fileContent: string,
  onProgress?: ProgressCallback
): Promise<{
  rows: EmployeeRecord[];
  detRecords: DETRecord[];
  warnings: ProcessingWarning[];
  errors: Array<{ message: string; row?: number }>;
  headerFields?: string[];
}> {
  return new Promise((resolve, reject) => {
    const warnings: ProcessingWarning[] = [];
    const errors: Array<{ message: string; row?: number }> = [];
    const processedRows: EmployeeRecord[] = [];
    const detRecords: DETRecord[] = [];
    let rowCounter = 0; // Track row number manually as fallback
    let headerFields: string[] | undefined;
    let headersCaptured = false; // Track if we've captured headers from first row

    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Normalize header names (trim, lowercase, replace spaces with underscores)
        return header.trim().toLowerCase().replace(/\s+/g, '_');
      },
      step: (result, parser) => {
        try {
          rowCounter++; // Increment row counter
          const rowNumber = (parser as any).meta?.cursor ?? rowCounter; // Use cursor if available, otherwise use counter
          
          const row = result.data as Record<string, string>;
          
          // Capture headers from first row (after transformation)
          if (!headersCaptured && row) {
            headerFields = Object.keys(row);
            headersCaptured = true;
          }
          
          const recordType = row.record_type?.toUpperCase();

          // Only process DET records
          if (recordType === 'DET') {
            // Process messy data
            const cleanedRow = processMessyData(row, rowNumber, warnings);
            
            // Validate DET record structure fields exist before converting
            const recordSequence = cleanedRow.record_sequence || cleanedRow['record_sequence'];
            const companyId = cleanedRow.company_id || cleanedRow['company_id'];
            
            if (!recordSequence || String(recordSequence).trim() === '') {
              errors.push({
                message: `Row ${rowNumber}: Missing required field 'record_sequence' in DET record. Available fields: ${Object.keys(cleanedRow).join(', ')}`,
                row: rowNumber
              });
            }
            if (!companyId || String(companyId).trim() === '') {
              errors.push({
                message: `Row ${rowNumber}: Missing required field 'company_id' in DET record. Available fields: ${Object.keys(cleanedRow).join(', ')}`,
                row: rowNumber
              });
            }
            
            // Convert to DETRecord (ensure fields are set)
            const detRecord: Partial<DETRecord> = {
              ...cleanedRow,
              record_sequence: recordSequence || '',
              company_id: companyId || ''
            } as unknown as DETRecord;
            
            detRecords.push(detRecord as DETRecord);
            
            // Extract employee data from DET record
            const employeeRecord = extractEmployeeData(detRecord);
            processedRows.push(employeeRecord);

            // Call progress callback
            if (onProgress) {
              onProgress({
                current: rowNumber,
                total: rowNumber + 1, // Estimate, will be updated
                row: cleanedRow,
                warnings: warnings.slice(-1) // Last warning if any
              });
            }
          }
          // Skip HDR and FTR records (they're metadata, not employee data)
        } catch (error: any) {
          const rowNumber = (parser as any).meta?.cursor ?? rowCounter; // Use cursor if available, otherwise use counter
          errors.push({
            message: `Failed to process row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            row: rowNumber
          });
        }
      },
      complete: (results) => {
        // Use headers captured from first row, or fall back to meta.fields
        // (meta.fields might be empty when using transformHeader)
        if (!headerFields || headerFields.length === 0) {
          headerFields = results.meta.fields || [];
        }
        
        // Final check - if still empty, try to get from first processed row
        if ((!headerFields || headerFields.length === 0) && processedRows.length > 0) {
          // Get headers from first DET record (includes all fields)
          const firstDetRecord = detRecords[0];
          if (firstDetRecord) {
            headerFields = Object.keys(firstDetRecord);
          }
        }
        
        // Update final progress
        if (onProgress) {
          onProgress({
            current: processedRows.length,
            total: processedRows.length
          });
        }

        resolve({
          rows: processedRows,
          detRecords,
          warnings,
          errors,
          headerFields: headerFields || []
        });
      },
      error: (error: Error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      }
    });
  });
}

/**
 * Parses CSV file from File object
 * @param file File object from input
 * @param onProgress Optional progress callback
 * @returns Promise with parsed rows
 */
export async function parseCSVFile(
  file: File,
  onProgress?: ProgressCallback
): Promise<{
  rows: EmployeeRecord[];
  detRecords: DETRecord[];
  warnings: ProcessingWarning[];
  errors: Array<{ message: string; row?: number }>;
  headerFields?: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const result = await processCSV(content, onProgress);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

