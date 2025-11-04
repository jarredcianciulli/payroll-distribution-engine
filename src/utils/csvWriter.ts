/**
 * CSV Writer Utility
 * Client-side CSV generation and download functionality
 */

/**
 * Converts an array of objects to CSV format
 * @param data Array of objects to convert to CSV
 * @param headers Optional array of header names (uses object keys if not provided)
 * @returns CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Escape CSV values (handle commas, quotes, newlines)
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }
    const stringValue = String(value);
    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Build CSV rows
  const rows: string[] = [];
  
  // Header row
  rows.push(csvHeaders.map(escapeCSVValue).join(','));
  
  // Data rows
  for (const row of data) {
    const values = csvHeaders.map(header => escapeCSVValue(row[header]));
    rows.push(values.join(','));
  }

  return rows.join('\n');
}

/**
 * Downloads a CSV string as a file
 * @param csvContent CSV string content
 * @param filename Name of the file to download
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Converts data array to CSV and triggers download
 * @param data Array of objects to convert
 * @param filename Name of the file to download
 * @param headers Optional array of header names
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: string[]
): void {
  const csvContent = arrayToCSV(data, headers);
  downloadCSV(csvContent, filename);
}

