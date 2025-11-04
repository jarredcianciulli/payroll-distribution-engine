/**
 * Upload Controller
 * Handles CSV file upload and parsing
 */

import { parseCSVFile } from "../services/csvProcessor";
import type { EmployeeRecord, DETRecord, ProcessingWarning } from "../types";

export interface UploadResult {
  rows: EmployeeRecord[];
  detRecords: DETRecord[];
  warnings: ProcessingWarning[];
  errors: Array<{ message: string; row?: number }>;
  headerFields?: string[];
}

/**
 * Handles file upload and parsing
 * @param file CSV file to upload
 * @param onProgress Optional progress callback
 * @returns Upload result with parsed rows
 */
export async function handleFileUpload(
  file: File,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<UploadResult> {
  try {
    const result = await parseCSVFile(file, onProgress);
    return result;
  } catch (error) {
    throw new Error(
      `File upload failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
