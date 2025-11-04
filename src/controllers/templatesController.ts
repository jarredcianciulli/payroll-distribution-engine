/**
 * Templates Controller
 * Handles template generation and downloads
 */

import {
  generateInputTemplate,
  generateFormatDocumentation,
  generateFieldSpecification
} from '../utils/templateGenerator';

/**
 * Downloads the input template CSV with dummy data
 */
export function downloadInputTemplate(): void {
  generateInputTemplate();
}

/**
 * Downloads the format documentation CSV
 */
export function downloadFormatDocumentation(): void {
  generateFormatDocumentation();
}

/**
 * Downloads the field specification CSV
 */
export function downloadFieldSpecification(): void {
  generateFieldSpecification();
}

