/**
 * Templates API Route
 * Client-side API interface for template download operations
 */

import {
  downloadInputTemplate,
  downloadFormatDocumentation,
  downloadFieldSpecification
} from '../../controllers/templatesController';

/**
 * Downloads the input template CSV
 */
export function downloadTemplate(): void {
  downloadInputTemplate();
}

/**
 * Downloads the format documentation CSV
 */
export function downloadDocumentation(): void {
  downloadFormatDocumentation();
}

/**
 * Downloads the field specification CSV
 */
export function downloadSpecification(): void {
  downloadFieldSpecification();
}

