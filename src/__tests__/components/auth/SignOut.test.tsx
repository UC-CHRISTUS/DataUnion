/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '../../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import SignOut from '@/components/auth/SignOut';

// Mock Supabase
const mockSignOut = jest.fn().mockResolvedValue({});
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      signOut: mockSignOut,
    },
  })),
}));

// Mock Next.js router
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    refresh: mockRefresh,
  })),
}));

describe('SignOut Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    describe('Rendering', () => {
      it('should render the sign out button', () => {
        // Arrange & Act
        render(<SignOut />);

        // Assert
        expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
      });

      it('should render button with correct text', () => {
        // Arrange & Act
        render(<SignOut />);

        // Assert
        expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
      });
    });

    describe('User Interactions', () => {
      it('should call Supabase signOut when clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SignOut />);

        // Act
        await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

        // Assert
        await waitFor(() => {
          expect(mockSignOut).toHaveBeenCalled();
        });
      });

      it('should redirect to home page after sign out', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SignOut />);

        // Act
        await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

        // Assert
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith('/');
        });
      });

      it('should refresh the router after sign out', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SignOut />);

        // Act
        await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

        // Assert
        await waitFor(() => {
          expect(mockRefresh).toHaveBeenCalled();
        });
      });

      it('should call signOut before navigation', async () => {
        // Arrange
        const user = userEvent.setup();
        const callOrder: string[] = [];
        
        mockSignOut.mockImplementation(async () => {
          callOrder.push('signOut');
        });
        mockPush.mockImplementation(() => {
          callOrder.push('push');
        });
        mockRefresh.mockImplementation(() => {
          callOrder.push('refresh');
        });

        render(<SignOut />);

        // Act
        await user.click(screen.getByRole('button', { name: /cerrar sesión/i }));

        // Assert
        await waitFor(() => {
          expect(callOrder[0]).toBe('signOut');
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button role', () => {
      // Arrange & Act
      render(<SignOut />);

      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have visible button text', () => {
      // Arrange & Act
      render(<SignOut />);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(/cerrar sesión/i);
    });
  });

  describe('Styling', () => {
    it('should have hover state classes', () => {
      // Arrange & Act
      render(<SignOut />);

      // Assert
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-gray-100');
    });
  });
});

