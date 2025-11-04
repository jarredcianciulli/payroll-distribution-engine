/**
 * Mapping API Route
 * Client-side API interface for mapping configuration operations
 */

import {
  getMapping,
  saveMapping,
  resetMapping,
  exportMapping,
  importMapping
} from '../../controllers/mappingController';
import type { ProviderMapping } from '../../types';

/**
 * Gets mapping configuration for a provider
 */
export function getProviderMapping(provider: 'ADP' | 'QuickBooks'): ProviderMapping {
  return getMapping(provider);
}

/**
 * Saves mapping configuration for a provider
 */
export function saveProviderMapping(provider: 'ADP' | 'QuickBooks', mapping: ProviderMapping): void {
  saveMapping(provider, mapping);
}

/**
 * Resets mapping to default for a provider
 */
export function resetProviderMapping(provider: 'ADP' | 'QuickBooks'): ProviderMapping {
  return resetMapping(provider);
}

/**
 * Exports mapping configuration
 */
export function exportProviderMapping(provider: 'ADP' | 'QuickBooks'): string {
  return exportMapping(provider);
}

/**
 * Imports mapping configuration
 */
export function importProviderMapping(provider: 'ADP' | 'QuickBooks', jsonString: string): void {
  importMapping(provider, jsonString);
}

