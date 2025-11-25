/**
 * Test Helper Utilities
 *
 * Common utilities and fixtures for API route testing.
 */

import { NextRequest } from 'next/server';

/**
 * Create a mock NextRequest object for testing
 */
export function createMockNextRequest(options: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
  searchParams?: Record<string, string>;
}): NextRequest {
  const {
    method = 'GET',
    url = 'http://localhost:3000',
    body,
    headers = {},
    searchParams = {},
  } = options;

  // Build URL with search params
  const urlObj = new URL(url);
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  // Use Next.js compatible RequestInit (no null for signal)
  const requestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  return new NextRequest(urlObj.toString(), requestInit as any);
}

/**
 * Create a mock FormData NextRequest for file uploads
 */
export function createMockFormDataRequest(options: {
  url?: string;
  formData: FormData;
  headers?: Record<string, string>;
}): NextRequest {
  const { url = 'http://localhost:3000', formData, headers = {} } = options;

  // Use Next.js compatible RequestInit (no null for signal)
  const requestInit = {
    method: 'POST',
    headers: {
      ...headers,
      // Don't set Content-Type for FormData, browser will set it with boundary
    },
    body: formData,
  };

  return new NextRequest(url, requestInit as any);
}

/**
 * Mock params object for dynamic routes
 */
export function createMockParams<T extends Record<string, string>>(
  params: T
): Promise<T> {
  return Promise.resolve(params);
}

/**
 * Extract JSON from NextResponse
 */
export async function getResponseJson(response: Response): Promise<any> {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Assertion helpers
 */

export function expectPaginatedResponse(response: any) {
  expect(response).toHaveProperty('data');
  expect(response).toHaveProperty('total');
  expect(response).toHaveProperty('page');
  expect(response).toHaveProperty('pageSize');
  expect(response).toHaveProperty('totalPages');
  expect(Array.isArray(response.data)).toBe(true);
  expect(typeof response.total).toBe('number');
  expect(typeof response.page).toBe('number');
  expect(typeof response.pageSize).toBe('number');
  expect(typeof response.totalPages).toBe('number');
}

export function expectErrorResponse(response: any) {
  expect(response).toHaveProperty('error');
  expect(typeof response.error).toBe('string');
}

export function expectValidationErrorResponse(response: any) {
  expect(response).toHaveProperty('error');
  expect(response.error).toBe('Validation failed');
  expect(response).toHaveProperty('details');
  expect(Array.isArray(response.details)).toBe(true);
}
