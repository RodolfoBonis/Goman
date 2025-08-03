import { type ClassValue, clsx } from 'clsx';
import { nanoid } from 'nanoid';
import type { KeyValue, HTTPMethod } from '@/types';

// Utility for merging class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Generate unique IDs
export function generateId(): string {
  return nanoid();
}

// JSON utilities
export function safeParseJSON<T = any>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) || fallback;
  } catch {
    return fallback;
  }
}

export function safeStringifyJSON(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return '';
  }
}

// Key-Value utilities
export function parseHeaders(headersString: string): KeyValue[] {
  const headers = safeParseJSON<Record<string, string>>(headersString, {});
  return Object.entries(headers).map(([key, value]) => ({
    id: generateId(),
    key,
    value,
    enabled: true,
  }));
}

export function serializeHeaders(headers: KeyValue[]): string {
  const headerObj = headers
    .filter(h => h.enabled && h.key.trim())
    .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {});
  return safeStringifyJSON(headerObj);
}

export function parseQueryParams(url: string): KeyValue[] {
  try {
    const urlObj = new URL(url);
    const params: KeyValue[] = [];
    urlObj.searchParams.forEach((value, key) => {
      params.push({
        id: generateId(),
        key,
        value,
        enabled: true,
      });
    });
    return params;
  } catch {
    return [];
  }
}

export function buildURLWithParams(baseUrl: string, params: KeyValue[]): string {
  try {
    const url = new URL(baseUrl);
    // Clear existing params
    url.search = '';
    
    // Add enabled params
    params
      .filter(p => p.enabled && p.key.trim())
      .forEach(p => url.searchParams.set(p.key, p.value));
    
    return url.toString();
  } catch {
    return baseUrl;
  }
}

// Environment variable substitution
export function substituteVariables(text: string, variables: Record<string, string>): string {
  if (!text || typeof text !== 'string') return text;
  
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    // Create a regex that matches {{ key }} with optional whitespace
    const regex = new RegExp(`{{\\s*${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*}}`, 'g');
    result = result.replace(regex, value || '');
  });
  return result;
}

// Parse environment variables from JSON string
export function parseEnvironmentVariables(variablesJson: string): Record<string, string> {
  return safeParseJSON<Record<string, string>>(variablesJson, {});
}

// Get variables from active environment
export function getActiveEnvironmentVariables(environments: any[]): Record<string, string> {
  const activeEnv = environments.find(env => env.is_active);
  if (!activeEnv) return {};
  
  return parseEnvironmentVariables(activeEnv.variables);
}

// Apply environment variables to request data
export function applyEnvironmentVariables(
  requestData: {
    url?: string;
    headers?: string;
    body?: string;
  },
  environments: any[]
): {
  url: string;
  headers: string;
  body: string;
} {
  const variables = getActiveEnvironmentVariables(environments);
  
  return {
    url: substituteVariables(requestData.url || '', variables),
    headers: substituteVariables(requestData.headers || '', variables),
    body: substituteVariables(requestData.body || '', variables),
  };
}

// HTTP method utilities
export function getMethodColor(method: HTTPMethod): string {
  const colors = {
    GET: 'text-blue-600 bg-blue-50',
    POST: 'text-green-600 bg-green-50',
    PUT: 'text-orange-600 bg-orange-50',
    DELETE: 'text-red-600 bg-red-50',
    PATCH: 'text-purple-600 bg-purple-50',
    HEAD: 'text-gray-600 bg-gray-50',
    OPTIONS: 'text-yellow-600 bg-yellow-50',
  };
  return colors[method] || 'text-gray-600 bg-gray-50';
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) {
    return 'text-green-600 bg-green-50';
  } else if (status >= 300 && status < 400) {
    return 'text-blue-600 bg-blue-50';
  } else if (status >= 400 && status < 500) {
    return 'text-orange-600 bg-orange-50';
  } else if (status >= 500) {
    return 'text-red-600 bg-red-50';
  }
  return 'text-gray-600 bg-gray-50';
}

// Time formatting
export function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  } else {
    return `${(ms / 60000).toFixed(2)}m`;
  }
}

export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

// Date formatting
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(dateString);
}

// Validation utilities
export function isValidURL(urlString: string): boolean {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}

export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Deep clone utility
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Download utility
export function downloadFile(content: string, filename: string, contentType = 'application/json') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}