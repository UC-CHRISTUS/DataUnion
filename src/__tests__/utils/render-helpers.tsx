import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Custom wrapper component for tests.
 * Add global providers here (Theme, Auth, Router context, etc.) as needed.
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Custom render function that wraps components with all necessary providers.
 *
 * @example
 * ```tsx
 * import { render, screen } from '@/__tests__/utils/render-helpers';
 *
 * render(<MyComponent />);
 * expect(screen.getByRole('button')).toBeInTheDocument();
 * ```
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from RTL
export * from '@testing-library/react';

// Override the default render with our custom version
export { customRender as render };
