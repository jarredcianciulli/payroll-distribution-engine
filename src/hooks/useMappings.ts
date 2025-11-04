/**
 * useMappings Hook
 * Manages mapping configuration state and operations
 */

import { useState, useCallback, useEffect } from 'react';
import { mapping as mappingApi } from '../api';
import type { ProviderMapping } from '../types';

export function useMappings(provider: 'ADP' | 'QuickBooks') {
  const [mapping, setMapping] = useState<ProviderMapping>(() => mappingApi.getProviderMapping(provider));
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Loads mapping from storage
   */
  const loadMapping = useCallback(() => {
    setIsLoading(true);
    try {
      const loadedMapping = mappingApi.getProviderMapping(provider);
      setMapping(loadedMapping);
    } catch (error) {
      console.error('Failed to load mapping:', error);
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  /**
   * Saves mapping to storage
   */
  const saveMapping = useCallback((newMapping: ProviderMapping) => {
    setIsLoading(true);
    try {
      mappingApi.saveProviderMapping(provider, newMapping);
      setMapping(newMapping);
    } catch (error) {
      console.error('Failed to save mapping:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  /**
   * Resets mapping to default
   */
  const resetMapping = useCallback(() => {
    setIsLoading(true);
    try {
      const defaultMapping = mappingApi.resetProviderMapping(provider);
      setMapping(defaultMapping);
    } catch (error) {
      console.error('Failed to reset mapping:', error);
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  /**
   * Exports mapping as JSON
   */
  const exportMapping = useCallback((): string => {
    return mappingApi.exportProviderMapping(provider);
  }, [provider]);

  /**
   * Imports mapping from JSON
   */
  const importMapping = useCallback((jsonString: string) => {
    setIsLoading(true);
    try {
      mappingApi.importProviderMapping(provider, jsonString);
      loadMapping(); // Reload to get imported mapping
    } catch (error) {
      console.error('Failed to import mapping:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [provider, loadMapping]);

  // Load mapping on mount and when provider changes
  useEffect(() => {
    loadMapping();
  }, [loadMapping]);

  return {
    mapping,
    isLoading,
    loadMapping,
    saveMapping,
    resetMapping,
    exportMapping,
    importMapping
  };
}

