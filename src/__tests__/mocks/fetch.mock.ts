/**
 * Fetch API mocking utilities for component tests.
 *
 * These helpers simplify mocking fetch responses in component tests.
 */

interface MockFetchOptions {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

/**
 * Mock a successful fetch response.
 *
 * @example
 * ```ts
 * mockFetch({ data: { id: 1, name: 'Test' } });
 *
 * // With custom status
 * mockFetch({ success: true }, { status: 201 });
 * ```
 */
export function mockFetch(
  response: unknown,
  options: MockFetchOptions = {}
): jest.Mock {
  const { status = 200, statusText = 'OK', headers = {} } = options;

  const mockFn = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      statusText,
      headers: new Headers(headers),
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      blob: () => Promise.resolve(new Blob([JSON.stringify(response)])),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      formData: () => Promise.resolve(new FormData()),
    } as Response)
  );

  global.fetch = mockFn;
  return mockFn;
}

/**
 * Mock a fetch error response (4xx, 5xx).
 *
 * @example
 * ```ts
 * mockFetchError({ error: 'Not found' }, 404);
 * mockFetchError({ error: 'Unauthorized' }, 401);
 * ```
 */
export function mockFetchError(
  errorResponse: unknown,
  status: number = 500
): jest.Mock {
  return mockFetch(errorResponse, {
    status,
    statusText: status === 404 ? 'Not Found' : 'Internal Server Error',
  });
}

/**
 * Mock a network error (connection failure, timeout, etc.).
 *
 * @example
 * ```ts
 * mockFetchNetworkError();
 *
 * // Component will catch: TypeError: Failed to fetch
 * ```
 */
export function mockFetchNetworkError(): jest.Mock {
  const mockFn = jest.fn(() =>
    Promise.reject(new TypeError('Failed to fetch'))
  );

  global.fetch = mockFn;
  return mockFn;
}

/**
 * Reset all fetch mocks between tests.
 *
 * @example
 * ```ts
 * afterEach(() => {
 *   resetFetchMock();
 * });
 * ```
 */
export function resetFetchMock(): void {
  if (global.fetch && jest.isMockFunction(global.fetch)) {
    (global.fetch as jest.Mock).mockClear();
  }
}
