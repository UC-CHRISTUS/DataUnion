/**
 * @jest-environment jsdom
 */

import { render, screen } from '../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import Layout from '@/components/Layout';

// Mock CSS modules
jest.mock('@/components/Layout.module.css', () => ({
  layout: 'layout',
  mainContent: 'mainContent',
  sidebarClosed: 'sidebarClosed',
  content: 'content',
}));

// Mock child components
jest.mock('@/components/Sidebar', () => {
  return function MockSidebar({ isOpen }: { isOpen: boolean }) {
    return isOpen ? <aside data-testid="sidebar">Sidebar</aside> : null;
  };
});

jest.mock('@/components/TopNav', () => {
  return function MockTopNav({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    return (
      <header data-testid="topnav">
        <button onClick={onToggleSidebar}>Toggle</button>
      </header>
    );
  };
});

// Mock Next.js navigation
let mockPathname = '/dashboard';
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => mockPathname),
}));

describe('Layout Component', () => {
  beforeEach(() => {
    mockPathname = '/dashboard';
  });

  describe('Success Cases', () => {
    describe('Protected Routes', () => {
      it('should render Sidebar for protected routes', () => {
        // Arrange
        mockPathname = '/dashboard';

        // Act
        render(
          <Layout>
            <div>Page Content</div>
          </Layout>
        );

        // Assert
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      });

      it('should render TopNav for protected routes', () => {
        // Arrange
        mockPathname = '/dashboard';

        // Act
        render(
          <Layout>
            <div>Page Content</div>
          </Layout>
        );

        // Assert
        expect(screen.getByTestId('topnav')).toBeInTheDocument();
      });

      it('should render children content', () => {
        // Arrange
        mockPathname = '/dashboard';

        // Act
        render(
          <Layout>
            <div>Page Content</div>
          </Layout>
        );

        // Assert
        expect(screen.getByText('Page Content')).toBeInTheDocument();
      });

      it('should wrap content in main element', () => {
        // Arrange
        mockPathname = '/dashboard';

        // Act
        render(
          <Layout>
            <div>Page Content</div>
          </Layout>
        );

        // Assert
        expect(screen.getByRole('main')).toBeInTheDocument();
      });
    });

    describe('Public Routes', () => {
      it('should not render Sidebar for login page', () => {
        // Arrange
        mockPathname = '/login';

        // Act
        render(
          <Layout>
            <div>Login Form</div>
          </Layout>
        );

        // Assert
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
      });

      it('should not render TopNav for login page', () => {
        // Arrange
        mockPathname = '/login';

        // Act
        render(
          <Layout>
            <div>Login Form</div>
          </Layout>
        );

        // Assert
        expect(screen.queryByTestId('topnav')).not.toBeInTheDocument();
      });

      it('should render only children for signup page', () => {
        // Arrange
        mockPathname = '/signup';

        // Act
        render(
          <Layout>
            <div>Signup Form</div>
          </Layout>
        );

        // Assert
        expect(screen.getByText('Signup Form')).toBeInTheDocument();
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
        expect(screen.queryByTestId('topnav')).not.toBeInTheDocument();
      });
    });

    describe('Sidebar Toggle', () => {
      it('should toggle sidebar when TopNav button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        mockPathname = '/dashboard';

        // Act
        render(
          <Layout>
            <div>Page Content</div>
          </Layout>
        );

        // Initially sidebar is open
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();

        // Click toggle
        await user.click(screen.getByRole('button', { name: /toggle/i }));

        // Assert - sidebar should be closed
        expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
      });

      it('should reopen sidebar when toggled again', async () => {
        // Arrange
        const user = userEvent.setup();
        mockPathname = '/dashboard';

        render(
          <Layout>
            <div>Page Content</div>
          </Layout>
        );

        // Act - Toggle twice
        await user.click(screen.getByRole('button', { name: /toggle/i }));
        await user.click(screen.getByRole('button', { name: /toggle/i }));

        // Assert
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle nested login paths', () => {
      // Arrange
      mockPathname = '/login/forgot-password';

      // Act
      render(
        <Layout>
          <div>Forgot Password</div>
        </Layout>
      );

      // Assert - Should still be public route
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });

    it('should handle dashboard subpaths', () => {
      // Arrange
      mockPathname = '/dashboard/users';

      // Act
      render(
        <Layout>
          <div>Users Page</div>
        </Layout>
      );

      // Assert - Should be protected route
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should handle upload path', () => {
      // Arrange
      mockPathname = '/upload';

      // Act
      render(
        <Layout>
          <div>Upload Page</div>
        </Layout>
      );

      // Assert
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should handle sigesa path', () => {
      // Arrange
      mockPathname = '/sigesa';

      // Act
      render(
        <Layout>
          <div>Sigesa Page</div>
        </Layout>
      );

      // Assert
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply sidebarClosed class when sidebar is closed', async () => {
      // Arrange
      const user = userEvent.setup();
      mockPathname = '/dashboard';

      const { container } = render(
        <Layout>
          <div>Page Content</div>
        </Layout>
      );

      // Act - Close sidebar
      await user.click(screen.getByRole('button', { name: /toggle/i }));

      // Assert
      const mainContent = container.querySelector('.mainContent');
      expect(mainContent).toHaveClass('sidebarClosed');
    });

    it('should not have sidebarClosed class when sidebar is open', () => {
      // Arrange
      mockPathname = '/dashboard';

      const { container } = render(
        <Layout>
          <div>Page Content</div>
        </Layout>
      );

      // Assert
      const mainContent = container.querySelector('.mainContent');
      expect(mainContent).not.toHaveClass('sidebarClosed');
    });
  });
});

