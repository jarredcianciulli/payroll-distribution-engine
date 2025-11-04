/**
 * Mapping Controller
 * Handles mapping configuration management
 */

import type { ProviderMapping } from '../types';
import { adpMapping, quickBooksMapping } from '../config/defaultMappings';

const MAPPING_STORAGE_PREFIX = 'payroll_mapping_';

/**
 * Gets mapping configuration for a provider
 * @param provider Provider name (ADP or QuickBooks)
 * @returns Provider mapping configuration
 */
export function getMapping(provider: 'ADP' | 'QuickBooks'): ProviderMapping {
  const storageKey = `${MAPPING_STORAGE_PREFIX}${provider}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored) as ProviderMapping;
    }
  } catch (error) {
    console.warn(`Failed to load mapping for ${provider}, using default`);
  }

  // Return default mapping
  return provider === 'ADP' ? adpMapping : quickBooksMapping;
}

/**
 * Saves mapping configuration for a provider
 * @param provider Provider name
 * @param mapping Mapping configuration to save
 */
export function saveMapping(provider: 'ADP' | 'QuickBooks', mapping: ProviderMapping): void {
  const storageKey = `${MAPPING_STORAGE_PREFIX}${provider}`;
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(mapping));
  } catch (error) {
    throw new Error(`Failed to save mapping for ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Resets mapping to default for a provider
 * @param provider Provider name
 */
export function resetMapping(provider: 'ADP' | 'QuickBooks'): ProviderMapping {
  const defaultMapping = provider === 'ADP' ? adpMapping : quickBooksMapping;
  saveMapping(provider, defaultMapping);
  return defaultMapping;
}

/**
 * Exports mapping configuration as JSON string
 * @param provider Provider name
 * @returns JSON string of mapping configuration
 */
export function exportMapping(provider: 'ADP' | 'QuickBooks'): string {
  const mapping = getMapping(provider);
  return JSON.stringify(mapping, null, 2);
}

/**
 * Imports mapping configuration from JSON string
 * @param provider Provider name
 * @param jsonString JSON string of mapping configuration
 */
export function importMapping(provider: 'ADP' | 'QuickBooks', jsonString: string): void {
  try {
    const mapping = JSON.parse(jsonString) as ProviderMapping;
    saveMapping(provider, mapping);
  } catch (error) {
    throw new Error(`Failed to import mapping: ${error instanceof Error ? error.message : 'Invalid JSON'}`);
  }
}

