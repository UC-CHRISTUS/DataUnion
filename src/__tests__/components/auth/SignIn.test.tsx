/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '../../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import SignIn from '@/components/auth/SignIn';

// Mock Supabase
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue({});
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
    from: mockFrom,
  })),
}));

// Mock Next.js navigation
const mockReplace = jest.fn();
const mockSearchParamsGet = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    replace: mockReplace,
    push: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: mockSearchParamsGet,
  })),
}));

describe('SignIn Component', () => {
  const getEmailInput = () => screen.getByPlaceholderText(/example@gmail.com/i);
  const getPasswordInput = () => screen.getByPlaceholderText(/••••••••/);
  const getSubmitButton = () => screen.getByRole('button', { name: /iniciar sesión/i });
  const getTogglePasswordButton = () => screen.getAllByRole('button')[0]; // First button before submit

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParamsGet.mockReturnValue(null);
    
    // Setup default mock chain
    mockFrom.mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });
    mockSelect.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockReturnValue({
      single: mockSingle,
    });
    mockUpdate.mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  describe('Success Cases', () => {
    describe('Rendering', () => {
      it('should render the login form', () => {
        // Arrange & Act
        render(<SignIn />);

        // Assert
        expect(screen.getByText(/uc christus/i)).toBeInTheDocument();
        expect(screen.getByText(/sistema de gestión/i)).toBeInTheDocument();
      });

      it('should render email input', () => {
        // Arrange & Act
        render(<SignIn />);

        // Assert
        expect(getEmailInput()).toBeInTheDocument();
        expect(getEmailInput()).toHaveAttribute('type', 'email');
      });

      it('should render password input', () => {
        // Arrange & Act
        render(<SignIn />);

        // Assert
        expect(getPasswordInput()).toBeInTheDocument();
        expect(getPasswordInput()).toHaveAttribute('type', 'password');
      });

      it('should render submit button', () => {
        // Arrange & Act
        render(<SignIn />);

        // Assert
        expect(getSubmitButton()).toBeInTheDocument();
      });

      it('should render password visibility toggle', () => {
        // Arrange & Act
        const { container } = render(<SignIn />);

        // Assert - Find the toggle button (it's inside the password field container)
        const toggleButtons = container.querySelectorAll('button[type="button"]');
        expect(toggleButtons.length).toBeGreaterThan(0);
      });
    });

    describe('Form Interactions', () => {
      it('should allow typing in email field', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SignIn />);

        // Act
        await user.type(getEmailInput(), 'test@example.com');

        // Assert
        expect(getEmailInput()).toHaveValue('test@example.com');
      });

      it('should allow typing in password field', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SignIn />);

        // Act
        await user.type(getPasswordInput(), 'mypassword');

        // Assert
        expect(getPasswordInput()).toHaveValue('mypassword');
      });

      it('should toggle password visibility', async () => {
        // Arrange
        const user = userEvent.setup();
        const { container } = render(<SignIn />);
        const passwordInput = getPasswordInput();

        // Find toggle button in the password input container
        const toggleButton = container.querySelector('.relative button[type="button"]');

        // Initial state
        expect(passwordInput).toHaveAttribute('type', 'password');

        // Act - Toggle visibility
        if (toggleButton) {
          await user.click(toggleButton);
        }

        // Assert - Password should be visible
        expect(passwordInput).toHaveAttribute('type', 'text');
      });

      it('should hide password when toggled again', async () => {
        // Arrange
        const user = userEvent.setup();
        const { container } = render(<SignIn />);
        const passwordInput = getPasswordInput();
        const toggleButton = container.querySelector('.relative button[type="button"]');

        // Toggle twice
        if (toggleButton) {
          await user.click(toggleButton);
          await user.click(toggleButton);
        }

        // Assert
        expect(passwordInput).toHaveAttribute('type', 'password');
      });
    });

    describe('Form Submission', () => {
      it('should call signInWithPassword on submit', async () => {
        // Arrange
        const user = userEvent.setup();
        mockSignInWithPassword.mockResolvedValue({
          data: { user: { id: 'auth-123' } },
          error: null,
        });
        mockSingle.mockResolvedValue({
          data: { id: 1, is_active: true, must_change_password: false },
          error: null,
        });

        render(<SignIn />);

        // Act
        await user.type(getEmailInput(), 'test@example.com');
        await user.type(getPasswordInput(), 'password123');
        await user.click(getSubmitButton());

        // Assert
        await waitFor(() => {
          expect(mockSignInWithPassword).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'password123',
          });
        });
      });

      it('should redirect to dashboard on successful login', async () => {
        // Arrange
        const user = userEvent.setup();
        mockSignInWithPassword.mockResolvedValue({
          data: { user: { id: 'auth-123' } },
          error: null,
        });
        mockSingle.mockResolvedValue({
          data: { id: 1, is_active: true, must_change_password: false },
          error: null,
        });

        render(<SignIn />);

        // Act
        await user.type(getEmailInput(), 'test@example.com');
        await user.type(getPasswordInput(), 'password123');
        await user.click(getSubmitButton());

        // Assert
        await waitFor(() => {
          expect(mockReplace).toHaveBeenCalledWith('/dashboard/users');
        });
      });

      it('should redirect to change-password if must_change_password is true', async () => {
        // Arrange
        const user = userEvent.setup();
        mockSignInWithPassword.mockResolvedValue({
          data: { user: { id: 'auth-123' } },
          error: null,
        });
        mockSingle.mockResolvedValue({
          data: { id: 1, is_active: true, must_change_password: true },
          error: null,
        });

        render(<SignIn />);

        // Act
        await user.type(getEmailInput(), 'test@example.com');
        await user.type(getPasswordInput(), 'password123');
        await user.click(getSubmitButton());

        // Assert
        await waitFor(() => {
          expect(mockReplace).toHaveBeenCalledWith('/change-password');
        });
      });
    });
  });

  describe('Error Cases', () => {
    it('should display error for invalid credentials', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      render(<SignIn />);

      // Act
      await user.type(getEmailInput(), 'wrong@example.com');
      await user.type(getPasswordInput(), 'wrongpassword');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/credenciales no válidas/i)).toBeInTheDocument();
      });
    });

    it('should display error for inactive user', async () => {
      // Arrange
      const user = userEvent.setup();
      
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'auth-123' } },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: { id: 1, is_active: false, must_change_password: false },
        error: null,
      });

      render(<SignIn />);

      // Act
      await user.type(getEmailInput(), 'inactive@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      // Assert - The component checks is_active and throws error
      await waitFor(() => {
        expect(screen.getByText(/inactivo/i)).toBeInTheDocument();
      });
    });

    it('should display error when user data cannot be loaded', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { user: { id: 'auth-123' } },
        error: null,
      });
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      render(<SignIn />);

      // Act
      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error al cargar datos/i)).toBeInTheDocument();
      });
    });

    it('should show error from URL params', () => {
      // Arrange
      mockSearchParamsGet.mockReturnValue('no-session');

      // Act
      render(<SignIn />);

      // Assert
      expect(screen.getByText(/debe iniciar sesión primero/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading text on submit button while submitting', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignInWithPassword.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { user: { id: '123' } }, error: null }), 100)
          )
      );
      mockSingle.mockResolvedValue({
        data: { id: 1, is_active: true, must_change_password: false },
        error: null,
      });

      render(<SignIn />);

      // Act
      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      // Assert
      expect(screen.getByRole('button', { name: /entrando/i })).toBeInTheDocument();
    });

    it('should disable form fields while loading', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignInWithPassword.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { user: { id: '123' } }, error: null }), 100)
          )
      );
      mockSingle.mockResolvedValue({
        data: { id: 1, is_active: true, must_change_password: false },
        error: null,
      });

      render(<SignIn />);

      // Act
      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      // Assert
      expect(getEmailInput()).toBeDisabled();
      expect(getPasswordInput()).toBeDisabled();
    });

    it('should disable submit button while loading', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignInWithPassword.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { user: { id: '123' } }, error: null }), 100)
          )
      );
      mockSingle.mockResolvedValue({
        data: { id: 1, is_active: true, must_change_password: false },
        error: null,
      });

      render(<SignIn />);

      // Act
      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'password123');
      await user.click(getSubmitButton());

      // Assert
      expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();
    });

    it('should re-enable button after error', async () => {
      // Arrange
      const user = userEvent.setup();
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      render(<SignIn />);

      // Act
      await user.type(getEmailInput(), 'test@example.com');
      await user.type(getPasswordInput(), 'wrongpassword');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(getSubmitButton()).not.toBeDisabled();
        expect(getSubmitButton()).toHaveTextContent(/iniciar sesión/i);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have required attribute on email', () => {
      // Arrange & Act
      render(<SignIn />);

      // Assert
      expect(getEmailInput()).toBeRequired();
    });

    it('should have required attribute on password', () => {
      // Arrange & Act
      render(<SignIn />);

      // Assert
      expect(getPasswordInput()).toBeRequired();
    });

    it('should have labels for form fields', () => {
      // Arrange & Act
      render(<SignIn />);

      // Assert
      expect(screen.getByText(/correo/i)).toBeInTheDocument();
      // Multiple elements contain "contraseña" - use getAllBy
      expect(screen.getAllByText(/contraseña/i).length).toBeGreaterThan(0);
    });
  });
});

