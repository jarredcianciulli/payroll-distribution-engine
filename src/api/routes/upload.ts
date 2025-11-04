/**
 * Upload API Route
 * Client-side API interface for file upload operations
 */

import { handleFileUpload } from '../../controllers/uploadController';
import type { UploadResult } from '../../controllers/uploadController';

/**
 * Uploads and parses a CSV file
 * @param file CSV file to upload
 * @param onProgress Optional progress callback
 * @returns Upload result
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<UploadResult> {
  return handleFileUpload(file, onProgress);
}

