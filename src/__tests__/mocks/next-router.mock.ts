import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Next.js router mocking utilities for component tests.
 *
 * Note: Global mocks are set up in jest.setup.components.ts.
 * These helpers allow per-test customization.
 */

type MockRouter = {
  push: jest.Mock;
  replace: jest.Mock;
  prefetch: jest.Mock;
  back: jest.Mock;
  forward: jest.Mock;
  refresh: jest.Mock;
  pathname: string;
  query: Record<string, string>;
  asPath: string;
};

/**
 * Create a custom mock router instance.
 *
 * @example
 * ```ts
 * const mockRouter = createMockRouter({ pathname: '/dashboard' });
 * jest.mocked(useRouter).mockReturnValue(mockRouter);
 * ```
 */
export function createMockRouter(
  overrides: Partial<MockRouter> = {}
): MockRouter {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    ...overrides,
  };
}

/**
 * Mock usePathname hook for a specific test.
 *
 * @example
 * ```ts
 * mockUsePathname('/dashboard/users');
 *
 * // Component that calls usePathname() will receive '/dashboard/users'
 * ```
 */
export function mockUsePathname(pathname: string): void {
  jest.mocked(usePathname).mockReturnValue(pathname);
}

/**
 * Mock useSearchParams hook for a specific test.
 *
 * @example
 * ```ts
 * mockUseSearchParams({ page: '2', filter: 'active' });
 *
 * // Component can call searchParams.get('page') => '2'
 * ```
 */
export function mockUseSearchParams(
  params: Record<string, string> = {}
): void {
  const searchParams = new URLSearchParams(params);
  jest.mocked(useSearchParams).mockReturnValue(searchParams as any);
}

/**
 * Reset all router mocks to defaults.
 *
 * @example
 * ```ts
 * afterEach(() => {
 *   resetRouterMocks();
 * });
 * ```
 */
export function resetRouterMocks(): void {
  jest.mocked(useRouter).mockReturnValue(createMockRouter());
  jest.mocked(usePathname).mockReturnValue('/');
  jest.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as any);
}
