/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '../../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import EditUserModal from '@/components/admin/EditUserModal';
import { mockFetch, mockFetchError, resetFetchMock } from '../../mocks/fetch.mock';

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

describe('EditUserModal Component', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    full_name: 'Test User',
    role: 'encoder' as const,
    is_active: true,
  };

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    user: mockUser,
  };

  // Helper functions
  const getNameInput = () => screen.getByPlaceholderText(/juan pérez/i);
  const getRoleSelect = () => screen.getByRole('combobox');
  const getSubmitButton = () => screen.getByRole('button', { name: /guardar cambios/i });
  const getCancelButton = () => screen.getByRole('button', { name: /cancelar/i });

  beforeEach(() => {
    jest.clearAllMocks();
    resetFetchMock();
  });

  describe('Success Cases', () => {
    describe('Rendering', () => {
      it('should render modal when isOpen is true and user is provided', () => {
        // Arrange & Act
        render(<EditUserModal {...defaultProps} />);

        // Assert
        expect(screen.getByText(/editar usuario/i)).toBeInTheDocument();
      });

      it('should render all form fields', () => {
        // Arrange & Act
        render(<EditUserModal {...defaultProps} />);

        // Assert
        expect(screen.getByText(/correo electrónico/i)).toBeInTheDocument();
        expect(screen.getByText(/nombre completo/i)).toBeInTheDocument();
        expect(screen.getByText(/^rol$/i)).toBeInTheDocument();
      });

      it('should display user email as readonly', () => {
        // Arrange & Act
        render(<EditUserModal {...defaultProps} />);

        // Assert
        const emailInput = screen.getByDisplayValue('test@example.com');
        expect(emailInput).toBeDisabled();
      });

      it('should display user full name in input', () => {
        // Arrange & Act
        render(<EditUserModal {...defaultProps} />);

        // Assert
        expect(getNameInput()).toHaveValue('Test User');
      });

      it('should display user role in select', () => {
        // Arrange & Act
        render(<EditUserModal {...defaultProps} />);

        // Assert
        expect(getRoleSelect()).toHaveValue('encoder');
      });

      it('should render submit and cancel buttons', () => {
        // Arrange & Act
        render(<EditUserModal {...defaultProps} />);

        // Assert
        expect(getSubmitButton()).toBeInTheDocument();
        expect(getCancelButton()).toBeInTheDocument();
      });

      it('should show "No se puede modificar" hint for email', () => {
        // Arrange & Act
        render(<EditUserModal {...defaultProps} />);

        // Assert
        expect(screen.getByText(/no se puede modificar/i)).toBeInTheDocument();
      });
    });

    describe('Form Interactions', () => {
      it('should allow editing full name', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<EditUserModal {...defaultProps} />);

        // Act
        const nameInput = getNameInput();
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Name');

        // Assert
        expect(nameInput).toHaveValue('Updated Name');
      });

      it('should allow changing role', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<EditUserModal {...defaultProps} />);

        // Act
        await user.selectOptions(getRoleSelect(), 'admin');

        // Assert
        expect(getRoleSelect()).toHaveValue('admin');
      });
    });

    describe('Form Submission', () => {
      it('should call API with correct payload on form submission', async () => {
        // Arrange
        const user = userEvent.setup();
        const fetchMock = mockFetch({ success: true });

        render(<EditUserModal {...defaultProps} />);

        // Act
        await user.clear(getNameInput());
        await user.type(getNameInput(), 'New Name');
        await user.selectOptions(getRoleSelect(), 'finance');
        await user.click(getSubmitButton());

        // Assert
        await waitFor(() => {
          expect(fetchMock).toHaveBeenCalledWith(
            '/api/admin/users/123',
            expect.objectContaining({
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fullName: 'New Name',
                role: 'finance',
              }),
            })
          );
        });
      });

      it('should call onSuccess after successful update', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnSuccess = jest.fn();
        mockFetch({ success: true });

        render(<EditUserModal {...defaultProps} onSuccess={mockOnSuccess} />);

        // Act
        await user.click(getSubmitButton());

        // Assert
        await waitFor(() => {
          expect(mockOnSuccess).toHaveBeenCalled();
        });
      });

      it('should call onClose after successful update', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        mockFetch({ success: true });

        render(<EditUserModal {...defaultProps} onClose={mockOnClose} />);

        // Act
        await user.click(getSubmitButton());

        // Assert
        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled();
        });
      });
    });

    describe('Modal Controls', () => {
      it('should call onClose when cancel button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        render(<EditUserModal {...defaultProps} onClose={mockOnClose} />);

        // Act
        await user.click(getCancelButton());

        // Assert
        expect(mockOnClose).toHaveBeenCalled();
      });

      it('should call onClose when backdrop is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        const { container } = render(<EditUserModal {...defaultProps} onClose={mockOnClose} />);

        // Act
        const backdrop = container.querySelector('.absolute.inset-0');
        if (backdrop) {
          await user.click(backdrop);
        }

        // Assert
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not render when isOpen is false', () => {
      // Arrange & Act
      render(<EditUserModal {...defaultProps} isOpen={false} />);

      // Assert
      expect(screen.queryByText(/editar usuario/i)).not.toBeInTheDocument();
    });

    it('should not render when user is null', () => {
      // Arrange & Act
      render(<EditUserModal {...defaultProps} user={null} />);

      // Assert
      expect(screen.queryByText(/editar usuario/i)).not.toBeInTheDocument();
    });

    it('should update form when user prop changes', () => {
      // Arrange
      const { rerender } = render(<EditUserModal {...defaultProps} />);

      // Act
      const newUser = {
        ...mockUser,
        full_name: 'Different User',
        role: 'admin' as const,
      };
      rerender(<EditUserModal {...defaultProps} user={newUser} />);

      // Assert
      expect(getNameInput()).toHaveValue('Different User');
      expect(getRoleSelect()).toHaveValue('admin');
    });

    it('should reset form when modal is closed and reopened', async () => {
      // Arrange
      const user = userEvent.setup();
      const { rerender } = render(<EditUserModal {...defaultProps} />);

      // Modify the form
      await user.clear(getNameInput());
      await user.type(getNameInput(), 'Modified Name');

      // Close modal
      await user.click(getCancelButton());

      // Reopen modal
      rerender(<EditUserModal {...defaultProps} isOpen={true} />);

      // Assert - form should be reset to user's original values
      expect(getNameInput()).toHaveValue('');
    });
  });

  describe('Error Cases', () => {
    it('should display error message on API failure', async () => {
      // Arrange
      const user = userEvent.setup();
      mockFetchError({ error: 'Error al actualizar usuario' }, 500);

      render(<EditUserModal {...defaultProps} />);

      // Act
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error al actualizar usuario/i)).toBeInTheDocument();
      });
    });

    it('should not call onSuccess when API fails', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();
      mockFetchError({ error: 'Error' }, 500);

      render(<EditUserModal {...defaultProps} onSuccess={mockOnSuccess} />);

      // Act
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
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      render(<EditUserModal {...defaultProps} />);

      // Act
      await user.click(getSubmitButton());

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading text on submit button while submitting', async () => {
      // Arrange
      const user = userEvent.setup();
      global.fetch = jest.fn(() =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, json: async () => ({ success: true }) } as Response), 100)
        )
      );

      render(<EditUserModal {...defaultProps} />);

      // Act
      await user.click(getSubmitButton());

      // Assert
      expect(screen.getByRole('button', { name: /guardando/i })).toBeInTheDocument();

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /guardando/i })).not.toBeInTheDocument();
      });
    });

    it('should disable form fields while loading', async () => {
      // Arrange
      const user = userEvent.setup();
      global.fetch = jest.fn(() =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, json: async () => ({ success: true }) } as Response), 100)
        )
      );

      render(<EditUserModal {...defaultProps} />);

      // Act
      await user.click(getSubmitButton());

      // Assert
      expect(getNameInput()).toBeDisabled();
      expect(getRoleSelect()).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(getNameInput()).not.toBeDisabled();
      });
    });

    it('should disable buttons while loading', async () => {
      // Arrange
      const user = userEvent.setup();
      global.fetch = jest.fn(() =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ ok: true, json: async () => ({ success: true }) } as Response), 100)
        )
      );

      render(<EditUserModal {...defaultProps} />);

      // Act
      await user.click(getSubmitButton());

      // Assert
      expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled();
      expect(getCancelButton()).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(getCancelButton()).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      // Arrange & Act
      render(<EditUserModal {...defaultProps} />);

      // Assert
      expect(screen.getByText(/correo electrónico/i)).toBeInTheDocument();
      expect(screen.getByText(/nombre completo/i)).toBeInTheDocument();
      expect(screen.getByText(/^rol$/i)).toBeInTheDocument();
    });

    it('should have required attribute on editable fields', () => {
      // Arrange & Act
      render(<EditUserModal {...defaultProps} />);

      // Assert
      expect(getNameInput()).toBeRequired();
    });

    it('should have heading for modal title', () => {
      // Arrange & Act
      render(<EditUserModal {...defaultProps} />);

      // Assert
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/editar usuario/i);
    });
  });
});

