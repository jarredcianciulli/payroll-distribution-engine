/**
 * API Client
 * Main API interface that routes calls to appropriate handlers
 * In client-side mode, calls controllers directly
 * In future REST API mode, this would make HTTP requests
 */

import * as uploadApi from './routes/upload';
import * as processApi from './routes/process';
import * as mappingApi from './routes/mapping';
import * as templatesApi from './routes/templates';

// Re-export all API functions
export const upload = uploadApi;
export const process = processApi;
export const mapping = mappingApi;
export const templates = templatesApi;

