/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '../../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import CreateUserModal from '@/components/admin/CreateUserModal';
import { mockFetch, mockFetchError, mockFetchNetworkError, resetFetchMock } from '../../mocks/fetch.mock';

// Mock the roles module
jest.mock('@/lib/constants/roles', () => ({
  getRoleOptions: () => [
    { value: 'encoder', label: 'Codificador' },
    { value: 'finance', label: 'Finanzas' },
    { value: 'admin', label: 'Administrador' },
  ],
  USER_ROLES: {
    ENCODER: 'encoder',
    FINANCE: 'finance',
    ADMIN: 'admin',
  },
}));

describe('CreateUserModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  // Helper to get form elements (since labels aren't properly associated with inputs)
  const getNameInput = () => screen.getByPlaceholderText(/juan pérez/i);
  const getEmailInput = () => screen.getByPlaceholderText(/usuario@uc\.cl/i);
  const getRoleSelect = () => screen.getByRole('combobox');
  const getSubmitButton = () => screen.getByRole('button', { name: /^crear$/i });
  const getCancelButton = () => screen.getByRole('button', { name: /cancelar/i });

  beforeEach(() => {
    jest.clearAllMocks();
    resetFetchMock();
  });

  describe('Success Cases', () => {
    describe('Rendering', () => {
      it('should render modal when isOpen is true', () => {
        // Arrange & Act
        render(<CreateUserModal {...defaultProps} />);

        // Assert
        expect(screen.getByText(/crear usuario/i)).toBeInTheDocument();
      });

      it('should render all form fields', () => {
        // Arrange & Act
        render(<CreateUserModal {...defaultProps} />);

        // Assert
        expect(screen.getByText(/nombre completo/i)).toBeInTheDocument();
        expect(screen.getByText(/correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByText(/^rol$/i)).toBeInTheDocument();
        expect(getNameInput()).toBeInTheDocument();
        expect(getEmailInput()).toBeInTheDocument();
        expect(getRoleSelect()).toBeInTheDocument();
      });

      it('should render submit and cancel buttons', () => {
        // Arrange & Act
        render(<CreateUserModal {...defaultProps} />);

        // Assert
        expect(getSubmitButton()).toBeInTheDocument();
        expect(getCancelButton()).toBeInTheDocument();
      });

      it('should have default role selected as encoder', () => {
        // Arrange & Act
        render(<CreateUserModal {...defaultProps} />);

        // Assert
        const roleSelect = getRoleSelect() as HTMLSelectElement;
        expect(roleSelect.value).toBe('encoder');
      });

      it('should render all role options in select', () => {
        // Arrange & Act
        render(<CreateUserModal {...defaultProps} />);

        // Assert
        expect(screen.getByRole('option', { name: /codificador/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /finanzas/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /administrador/i })).toBeInTheDocument();
      });
    });

    describe('Form Interactions', () => {
      it('should allow typing in full name field', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<CreateUserModal {...defaultProps} />);

        // Act
        const nameInput = getNameInput();
        await user.type(nameInput, 'Juan Pérez');

        // Assert
        expect(nameInput).toHaveValue('Juan Pérez');
      });

      it('should allow typing in email field', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<CreateUserModal {...defaultProps} />);

        // Act
        const emailInput = getEmailInput();
        await user.type(emailInput, 'juan@example.com');

        // Assert
        expect(emailInput).toHaveValue('juan@example.com');
      });

      it('should allow selecting different roles', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<CreateUserModal {...defaultProps} />);

        // Act
        const roleSelect = getRoleSelect();
        await user.selectOptions(roleSelect, 'admin');

        // Assert
        expect(roleSelect).toHaveValue('admin');
      });

      it('should update form state for all fields simultaneously', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<CreateUserModal {...defaultProps} />);

        // Act
        await user.type(getNameInput(), 'María García');
        await user.type(getEmailInput(), 'maria@test.cl');
        await user.selectOptions(getRoleSelect(), 'finance');

        // Assert
        expect(getNameInput()).toHaveValue('María García');
        expect(getEmailInput()).toHaveValue('maria@test.cl');
        expect(getRoleSelect()).toHaveValue('finance');
      });
    });

    describe('Form Submission', () => {
      it('should call API with correct payload on form submission', async () => {
        // Arrange
        const user = userEvent.setup();
        const fetchMock = mockFetch({
          success: true,
          temporaryPassword: 'TempPass123!',
          data: { id: 1, email: 'test@example.com' },
        });

        render(<CreateUserModal {...defaultProps} />);

        // Act
        await user.type(getNameInput(), 'Test User');
        await user.type(getEmailInput(), 'test@example.com');
        await user.selectOptions(getRoleSelect(), 'finance');
        await user.click(getSubmitButton());

        // Assert
        await waitFor(() => {
          expect(fetchMock).toHaveBeenCalledWith(
            '/api/admin/users',
            expect.objectContaining({
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: 'test@example.com',
                fullName: 'Test User',
                role: 'finance',
              }),
            })
          );
        });
      });

      it('should complete submission successfully and call API', async () => {
        // Arrange
        const user = userEvent.setup();
        const fetchMock = mockFetch({
          success: true,
          temporaryPassword: 'SecureTemp456!',
        });

        render(<CreateUserModal {...defaultProps} />);

        // Act
        await user.type(getNameInput(), 'New User');
        await user.type(getEmailInput(), 'new@example.com');
        await user.click(getSubmitButton());

        // Assert - API was called successfully
        await waitFor(() => {
          expect(fetchMock).toHaveBeenCalled();
        });

        // Form should still be rendered (component stores password in state)
        expect(getNameInput()).toBeInTheDocument();
      });

      it('should submit with default encoder role if not changed', async () => {
        // Arrange
        const user = userEvent.setup();
        const fetchMock = mockFetch({
          success: true,
          temporaryPassword: 'Pass123!',
        });

        render(<CreateUserModal {...defaultProps} />);

        // Act
        await user.type(getNameInput(), 'Encoder User');
        await user.type(getEmailInput(), 'encoder@example.com');
        await user.click(getSubmitButton());

        // Assert
        await waitFor(() => {
          expect(fetchMock).toHaveBeenCalledWith(
            '/api/admin/users',
            expect.objectContaining({
              body: expect.stringContaining('"role":"encoder"'),
            })
          );
        });
      });
    });

    describe('Modal Controls', () => {
      it('should call onClose when cancel button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        render(<CreateUserModal {...defaultProps} onClose={mockOnClose} />);

        // Act
        await user.click(getCancelButton());

        // Assert
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });

      it('should call onClose when X button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        render(<CreateUserModal {...defaultProps} onClose={mockOnClose} />);

        // Act - Find the X button (contains ✕ character)
        const closeButton = screen.getByRole('button', { name: '✕' });
        await user.click(closeButton);

        // Assert
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });

      it('should call onClose when clicking the backdrop', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        const { container } = render(<CreateUserModal {...defaultProps} onClose={mockOnClose} />);

        // Act - Click the backdrop (absolute inset-0)
        const backdrop = container.querySelector('.absolute.inset-0');
        if (backdrop) {
          await user.click(backdrop);
        }

        // Assert
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not render when isOpen is false', () => {
      // Arrange & Act
      render(<CreateUserModal {...defaultProps} isOpen={false} />);

      // Assert
      expect(screen.queryByText(/crear usuario/i)).not.toBeInTheDocument();
    });

    it('should reset form fields after closing', async () => {
      // Arrange
      const user = userEvent.setup();
      mockFetch({ success: true, temporaryPassword: 'Temp123!' });

      const { rerender } = render(<CreateUserModal {...defaultProps} />);

      // Act - Fill form
      await user.type(getNameInput(), 'Test User');
      await user.type(getEmailInput(), 'test@example.com');
      
      // Close modal
      await user.click(getCancelButton());
      
      // Reopen modal
      rerender(<CreateUserModal {...defaultProps} isOpen={true} />);

      // Assert - Form should be reset (note: depends on handleClose implementation)
      expect(getNameInput()).toHaveValue('');
      expect(getEmailInput()).toHaveValue('');
    });

    it('should handle form submission with admin role', async () => {
      // Arrange
      const user = userEvent.setup();
      const fetchMock = mockFetch({ success: true, temporaryPassword: 'Pass!' });

      render(<CreateUserModal {...defaultProps} />);

      // Act
      await user.type(getNameInput(), 'Admin User');
      await user.type(getEmailInput(), 'admin@example.com');
      await user.selectOptions(getRoleSelect(), 'admin');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/admin/users',
          expect.objectContaining({
            body: expect.stringContaining('"role":"admin"'),
          })
        );
      });
    });

    it('should handle form submission with finance role', async () => {
      // Arrange
      const user = userEvent.setup();
      const fetchMock = mockFetch({ success: true, temporaryPassword: 'Pass!' });

      render(<CreateUserModal {...defaultProps} />);

      // Act
      await user.type(getNameInput(), 'Finance User');
      await user.type(getEmailInput(), 'finance@example.com');
      await user.selectOptions(getRoleSelect(), 'finance');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/admin/users',
          expect.objectContaining({
            body: expect.stringContaining('"role":"finance"'),
          })
        );
      });
    });

    it('should handle special characters in form fields', async () => {
      // Arrange
      const user = userEvent.setup();
      const fetchMock = mockFetch({ success: true, temporaryPassword: 'Pass!' });

      render(<CreateUserModal {...defaultProps} />);

      // Act
      await user.type(getNameInput(), 'José María Ñoño');
      await user.type(getEmailInput(), 'jose.maria@example.com');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith(
          '/api/admin/users',
          expect.objectContaining({
            body: expect.stringContaining('José María Ñoño'),
          })
        );
      });
    });
  });

  describe('Error Cases', () => {
    it('should display error message on API failure', async () => {
      // Arrange
      const user = userEvent.setup();
      mockFetchError({ error: 'El email ya existe en el sistema' }, 400);

      render(<CreateUserModal {...defaultProps} />);

      // Act
      await user.type(getNameInput(), 'Duplicate User');
      await user.type(getEmailInput(), 'duplicate@example.com');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/el email ya existe/i)).toBeInTheDocument();
      });
    });

    it('should not call onSuccess when API fails', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();
      mockFetchError({ error: 'Error' }, 500);

      render(<CreateUserModal {...defaultProps} onSuccess={mockOnSuccess} />);

      // Act
      await user.type(getNameInput(), 'Test');
      await user.type(getEmailInput(), 'test@example.com');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      mockFetchNetworkError();

      render(<CreateUserModal {...defaultProps} />);

      // Act
      await user.type(getNameInput(), 'Test');
      await user.type(getEmailInput(), 'test@example.com');
      await user.click(getSubmitButton());

      // Assert - Network error message is shown
      await waitFor(() => {
        expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
      });
    });

    it('should show generic error when API returns no specific error message', async () => {
      // Arrange
      const user = userEvent.setup();
      mockFetchError({}, 500);

      render(<CreateUserModal {...defaultProps} />);

      // Act
      await user.type(getNameInput(), 'Test');
      await user.type(getEmailInput(), 'test@example.com');
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error al crear usuario/i)).toBeInTheDocument();
      });
    });

    it('should clear previous error when resubmitting', async () => {
      // Arrange
      const user = userEvent.setup();
      
      // First submission fails
      mockFetchError({ error: 'Error inicial' }, 400);
      render(<CreateUserModal {...defaultProps} />);

      await user.type(getNameInput(), 'Test');
      await user.type(getEmailInput(), 'test@example.com');
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(screen.getByText(/error inicial/i)).toBeInTheDocument();
      });

      // Act - Second submission succeeds
      mockFetch({ success: true, temporaryPassword: 'Pass!' });
      await user.click(getSubmitButton());

      // Assert - Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/error inicial/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading text on submit button while submitting', async () => {
      // Arrange
      const user = userEvent.setup();
      // Create a delayed response
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, temporaryPassword: 'Temp!' }),
                } as Response),
              100
            )
          )
      );

      render(<CreateUserModal {...defaultProps} />);

      // Act
      await user.type(getNameInput(), 'Test');
      await user.type(getEmailInput(), 'test@example.com');
      await user.click(getSubmitButton());

      // Assert - Button should show loading state
      expect(screen.getByRole('button', { name: /creando/i })).toBeInTheDocument();

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /creando/i })).not.toBeInTheDocument();
      });
    });

    it('should disable form fields while loading', async () => {
      // Arrange
      const user = userEvent.setup();
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, temporaryPassword: 'Temp!' }),
                } as Response),
              100
            )
          )
      );

      render(<CreateUserModal {...defaultProps} />);

      // Act
      await user.type(getNameInput(), 'Test');
      await user.type(getEmailInput(), 'test@example.com');
      await user.click(getSubmitButton());

      // Assert - Fields should be disabled
      expect(getNameInput()).toBeDisabled();
      expect(getEmailInput()).toBeDisabled();
      expect(getRoleSelect()).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(getNameInput()).not.toBeDisabled();
      });
    });

    it('should disable buttons while loading', async () => {
      // Arrange
      const user = userEvent.setup();
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true, temporaryPassword: 'Temp!' }),
                } as Response),
              100
            )
          )
      );

      render(<CreateUserModal {...defaultProps} />);

      // Act
      await user.type(getNameInput(), 'Test');
      await user.type(getEmailInput(), 'test@example.com');
      await user.click(getSubmitButton());

      // Assert
      expect(screen.getByRole('button', { name: /creando/i })).toBeDisabled();
      expect(getCancelButton()).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(getCancelButton()).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have input elements with correct types', () => {
      // Arrange & Act
      render(<CreateUserModal {...defaultProps} />);

      // Assert
      expect(getNameInput()).toHaveAttribute('type', 'text');
      expect(getEmailInput()).toHaveAttribute('type', 'email');
      expect(getRoleSelect().tagName.toLowerCase()).toBe('select');
    });

    it('should have required attribute on form fields', () => {
      // Arrange & Act
      render(<CreateUserModal {...defaultProps} />);

      // Assert
      expect(getNameInput()).toBeRequired();
      expect(getEmailInput()).toBeRequired();
      expect(getRoleSelect()).toBeRequired();
    });

    it('should have placeholder text in input fields', () => {
      // Arrange & Act
      render(<CreateUserModal {...defaultProps} />);

      // Assert
      expect(screen.getByPlaceholderText(/juan pérez/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/usuario@uc\.cl/i)).toBeInTheDocument();
    });

    it('should have descriptive heading for the modal', () => {
      // Arrange & Act
      render(<CreateUserModal {...defaultProps} />);

      // Assert
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/crear usuario/i);
    });
  });
});
