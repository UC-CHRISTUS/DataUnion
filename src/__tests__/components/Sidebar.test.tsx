/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import Sidebar from '@/components/Sidebar';
import { mockFetch, resetFetchMock } from '../mocks/fetch.mock';

// Mock CSS modules
jest.mock('@/components/Sidebar.module.css', () => ({
  sidebar: 'sidebar',
  sidebarHeader: 'sidebarHeader',
  logo: 'logo',
  logoText: 'logoText',
  sidebarNav: 'sidebarNav',
  navList: 'navList',
  navItem: 'navItem',
  navLink: 'navLink',
  active: 'active',
  navIcon: 'navIcon',
  navLabel: 'navLabel',
  sidebarFooter: 'sidebarFooter',
  userProfile: 'userProfile',
  userAvatar: 'userAvatar',
  userInfo: 'userInfo',
  userName: 'userName',
  userRole: 'userRole',
  logoutButton: 'logoutButton',
}));

// Mock Supabase
const mockSignOut = jest.fn().mockResolvedValue({});
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      signOut: mockSignOut,
    },
  })),
}));

// Mock Next.js navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
let mockPathname = '/dashboard';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => mockPathname),
  useRouter: jest.fn(() => ({
    push: mockPush,
    refresh: mockRefresh,
  })),
}));

describe('Sidebar Component', () => {
  const mockEncoderUser = {
    id: 1,
    fullName: 'Test Encoder',
    email: 'encoder@test.com',
    role: 'encoder',
  };

  const mockAdminUser = {
    id: 2,
    fullName: 'Test Admin',
    email: 'admin@test.com',
    role: 'admin',
  };

  const mockFinanceUser = {
    id: 3,
    fullName: 'Test Finance',
    email: 'finance@test.com',
    role: 'finance',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetFetchMock();
    mockPathname = '/dashboard';
  });

  describe('Success Cases', () => {
    describe('Rendering', () => {
      it('should render sidebar when isOpen is true', async () => {
        // Arrange
        mockFetch({ user: mockEncoderUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/dataunion/i)).toBeInTheDocument();
        });
      });

      it('should render logo', async () => {
        // Arrange
        mockFetch({ user: mockEncoderUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/dataunion/i)).toBeInTheDocument();
        });
      });

      it('should render logout button', async () => {
        // Arrange
        mockFetch({ user: mockEncoderUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
        });
      });
    });

    describe('User Info', () => {
      it('should display user name', async () => {
        // Arrange
        mockFetch({ user: mockEncoderUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText('Test Encoder')).toBeInTheDocument();
        });
      });

      it('should display user avatar with first letter of name', async () => {
        // Arrange
        mockFetch({ user: mockEncoderUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText('T')).toBeInTheDocument();
        });
      });

      it('should display role for encoder', async () => {
        // Arrange
        mockFetch({ user: mockEncoderUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/codificador/i)).toBeInTheDocument();
        });
      });

      it('should display role for admin', async () => {
        // Arrange
        mockFetch({ user: mockAdminUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/administrador/i)).toBeInTheDocument();
        });
      });

      it('should display role for finance', async () => {
        // Arrange
        mockFetch({ user: mockFinanceUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/finanzas/i)).toBeInTheDocument();
        });
      });
    });

    describe('Role-Based Menu Items', () => {
      it('should show encoder-specific menu items', async () => {
        // Arrange
        mockFetch({ user: mockEncoderUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/inicio/i)).toBeInTheDocument();
          expect(screen.getByText(/subir archivos/i)).toBeInTheDocument();
          expect(screen.getByText(/sigesa/i)).toBeInTheDocument();
          expect(screen.getByText(/norma/i)).toBeInTheDocument();
          expect(screen.getByText(/editor/i)).toBeInTheDocument();
        });
      });

      it('should show admin-specific menu items', async () => {
        // Arrange
        mockFetch({ user: mockAdminUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/inicio/i)).toBeInTheDocument();
          expect(screen.getByText(/usuarios/i)).toBeInTheDocument();
          expect(screen.getByText(/archivos/i)).toBeInTheDocument();
          expect(screen.getByText(/sigesa/i)).toBeInTheDocument();
          expect(screen.getByText(/editor/i)).toBeInTheDocument();
        });
      });

      it('should show finance-specific menu items', async () => {
        // Arrange
        mockFetch({ user: mockFinanceUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/inicio/i)).toBeInTheDocument();
          expect(screen.getByText(/sigesa/i)).toBeInTheDocument();
          expect(screen.getByText(/editor/i)).toBeInTheDocument();
        });

        // Finance should NOT see encoder/admin specific items
        expect(screen.queryByText(/subir archivos/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/usuarios/i)).not.toBeInTheDocument();
      });

      it('should not show "Subir Archivos" for admin', async () => {
        // Arrange
        mockFetch({ user: mockAdminUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/usuarios/i)).toBeInTheDocument();
        });
        expect(screen.queryByText(/subir archivos/i)).not.toBeInTheDocument();
      });

      it('should not show "Norma" for non-encoder roles', async () => {
        // Arrange
        mockFetch({ user: mockFinanceUser });

        // Act
        render(<Sidebar isOpen={true} />);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/sigesa/i)).toBeInTheDocument();
        });
        expect(screen.queryByText(/norma/i)).not.toBeInTheDocument();
      });
    });

    describe('Sign Out', () => {
      it('should call signOut when logout button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        mockFetch({ user: mockEncoderUser });
        render(<Sidebar isOpen={true} />);

        // Wait for render
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
        });

        // Act
        await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

        // Assert
        await waitFor(() => {
          expect(mockSignOut).toHaveBeenCalled();
        });
      });

      it('should redirect to home after sign out', async () => {
        // Arrange
        const user = userEvent.setup();
        mockFetch({ user: mockEncoderUser });
        render(<Sidebar isOpen={true} />);

        await waitFor(() => {
          expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
        });

        // Act
        await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

        // Assert
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/');
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not render when isOpen is false', () => {
      // Arrange
      mockFetch({ user: mockEncoderUser });

      // Act
      render(<Sidebar isOpen={false} />);

      // Assert
      expect(screen.queryByText(/dataunion/i)).not.toBeInTheDocument();
    });

    it('should handle missing user gracefully', async () => {
      // Arrange - Return 401 for user fetch
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      // Act
      render(<Sidebar isOpen={true} />);

      // Assert - Should still render but without menu items
      expect(screen.getByText(/dataunion/i)).toBeInTheDocument();
    });

    it('should show default avatar when user name is missing', async () => {
      // Arrange
      mockFetch({ user: { ...mockEncoderUser, fullName: null } });

      // Act
      render(<Sidebar isOpen={true} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('U')).toBeInTheDocument(); // Default "U" for Usuario
      });
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href for navigation items', async () => {
      // Arrange
      mockFetch({ user: mockEncoderUser });

      // Act
      render(<Sidebar isOpen={true} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /inicio/i })).toHaveAttribute('href', '/inicio');
      });
    });

    it('should highlight active menu item', async () => {
      // Arrange
      mockPathname = '/upload';
      mockFetch({ user: mockEncoderUser });

      // Act
      render(<Sidebar isOpen={true} />);

      // Assert
      await waitFor(() => {
        const uploadLink = screen.getByRole('link', { name: /subir archivos/i });
        expect(uploadLink).toHaveClass('active');
      });
    });
  });

  describe('Accessibility', () => {
    it('should use semantic nav element', async () => {
      // Arrange
      mockFetch({ user: mockEncoderUser });

      // Act
      render(<Sidebar isOpen={true} />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
    });

    it('should use semantic aside element', async () => {
      // Arrange
      mockFetch({ user: mockEncoderUser });

      // Act
      const { container } = render(<Sidebar isOpen={true} />);

      // Assert
      await waitFor(() => {
        expect(container.querySelector('aside')).toBeInTheDocument();
      });
    });
  });
});

