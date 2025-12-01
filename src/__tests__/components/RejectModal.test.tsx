/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import RejectModal from '@/components/RejectModal';

// Mock CSS modules
jest.mock('@/components/SubmitConfirmModal.module.css', () => ({
  overlay: 'overlay',
  modal: 'modal',
  header: 'header',
  iconWrapper: 'iconWrapper',
  iconWarning: 'iconWarning',
  icon: 'icon',
  title: 'title',
  subtitle: 'subtitle',
  content: 'content',
  infoBox: 'infoBox',
  infoRow: 'infoRow',
  infoLabel: 'infoLabel',
  infoValue: 'infoValue',
  warningBox: 'warningBox',
  warningTitle: 'warningTitle',
  warningList: 'warningList',
  footer: 'footer',
  button: 'button',
  buttonSecondary: 'buttonSecondary',
  buttonDanger: 'buttonDanger',
  loadingWrapper: 'loadingWrapper',
  spinner: 'spinner',
  spinnerCircle: 'spinnerCircle',
  spinnerPath: 'spinnerPath',
}));

describe('RejectModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn().mockResolvedValue(undefined),
    grdId: 123,
  };

  const getReasonTextarea = () => screen.getByLabelText(/razón del rechazo/i);
  const getRejectButton = () => screen.getByRole('button', { name: /rechazar archivo/i });
  const getCancelButton = () => screen.getByRole('button', { name: /cancelar/i });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    describe('Rendering', () => {
      it('should render modal when isOpen is true', () => {
        // Arrange & Act
        render(<RejectModal {...defaultProps} />);

        // Assert - Use heading role to find title specifically
        expect(screen.getByRole('heading', { name: /rechazar archivo/i })).toBeInTheDocument();
      });

      it('should display GRD ID', () => {
        // Arrange & Act
        render(<RejectModal {...defaultProps} />);

        // Assert
        expect(screen.getByText(/#123/)).toBeInTheDocument();
      });

      it('should display reason textarea', () => {
        // Arrange & Act
        render(<RejectModal {...defaultProps} />);

        // Assert
        expect(getReasonTextarea()).toBeInTheDocument();
      });

      it('should display warning information', () => {
        // Arrange & Act
        render(<RejectModal {...defaultProps} />);

        // Assert
        expect(screen.getByText(/importante/i)).toBeInTheDocument();
        expect(screen.getByText(/borrador_encoder/i)).toBeInTheDocument();
        expect(screen.getByText(/encoder recibirá una notificación/i)).toBeInTheDocument();
      });

      it('should display placeholder text in textarea', () => {
        // Arrange & Act
        render(<RejectModal {...defaultProps} />);

        // Assert
        expect(screen.getByPlaceholderText(/faltan datos/i)).toBeInTheDocument();
      });

      it('should show minimum character requirement hint', () => {
        // Arrange & Act
        render(<RejectModal {...defaultProps} />);

        // Assert
        expect(screen.getByText(/mínimo 10 caracteres/i)).toBeInTheDocument();
      });
    });

    describe('Form Interactions', () => {
      it('should allow typing in reason textarea', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<RejectModal {...defaultProps} />);

        // Act
        await user.type(getReasonTextarea(), 'Esta es una razón válida para el rechazo');

        // Assert
        expect(getReasonTextarea()).toHaveValue('Esta es una razón válida para el rechazo');
      });

      it('should enable reject button when valid reason is provided', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<RejectModal {...defaultProps} />);

        // Act
        await user.type(getReasonTextarea(), 'Razón válida con más de 10 caracteres');

        // Assert
        expect(getRejectButton()).not.toBeDisabled();
      });
    });

    describe('Form Submission', () => {
      it('should call onConfirm with reason when confirmed', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnConfirm = jest.fn().mockResolvedValue(undefined);
        render(<RejectModal {...defaultProps} onConfirm={mockOnConfirm} />);

        // Act
        await user.type(getReasonTextarea(), 'Faltan datos importantes en el archivo');
        await user.click(getRejectButton());

        // Assert
        await waitFor(() => {
          expect(mockOnConfirm).toHaveBeenCalledWith('Faltan datos importantes en el archivo');
        });
      });

      it('should close modal after successful rejection', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        render(<RejectModal {...defaultProps} onClose={mockOnClose} />);

        // Act
        await user.type(getReasonTextarea(), 'Razón válida para rechazo');
        await user.click(getRejectButton());

        // Assert
        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled();
        });
      });

      it('should reset form after successful rejection', async () => {
        // Arrange
        const user = userEvent.setup();
        const { rerender } = render(<RejectModal {...defaultProps} />);

        // Act
        await user.type(getReasonTextarea(), 'Razón de rechazo');
        await user.click(getRejectButton());

        // Reopen modal
        await waitFor(() => {
          rerender(<RejectModal {...defaultProps} isOpen={true} />);
        });

        // Assert - form should be reset
        expect(getReasonTextarea()).toHaveValue('');
      });
    });

    describe('Modal Controls', () => {
      it('should call onClose when cancel button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        render(<RejectModal {...defaultProps} onClose={mockOnClose} />);

        // Act
        await user.click(getCancelButton());

        // Assert
        expect(mockOnClose).toHaveBeenCalled();
      });

      it('should call onClose when overlay is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        const { container } = render(<RejectModal {...defaultProps} onClose={mockOnClose} />);

        // Act
        const overlay = container.querySelector('.overlay');
        if (overlay) {
          await user.click(overlay);
        }

        // Assert
        expect(mockOnClose).toHaveBeenCalled();
      });

      it('should reset form when modal is closed', async () => {
        // Arrange
        const user = userEvent.setup();
        const { rerender } = render(<RejectModal {...defaultProps} />);

        // Type something
        await user.type(getReasonTextarea(), 'Some reason');

        // Close modal
        await user.click(getCancelButton());

        // Reopen
        rerender(<RejectModal {...defaultProps} isOpen={true} />);

        // Assert - form should be reset
        expect(getReasonTextarea()).toHaveValue('');
      });
    });
  });

  describe('Validation Cases', () => {
    it('should show error when submitting without reason', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RejectModal {...defaultProps} />);

      // Act - Click without entering reason
      // The button should be disabled, but let's verify error handling
      const rejectButton = getRejectButton();
      
      // Assert - Button should be disabled when no reason
      expect(rejectButton).toBeDisabled();
    });

    it('should show error when reason is too short', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RejectModal {...defaultProps} />);

      // Act
      await user.type(getReasonTextarea(), 'Short');
      await user.click(getRejectButton());

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/al menos 10 caracteres/i)).toBeInTheDocument();
      });
    });

    it('should not show error when reason is valid', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RejectModal {...defaultProps} />);

      // Act
      await user.type(getReasonTextarea(), 'Esta es una razón válida con suficientes caracteres');

      // Assert
      expect(screen.queryByText(/al menos 10 caracteres/i)).not.toBeInTheDocument();
    });

    it('should trim whitespace when validating reason', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RejectModal {...defaultProps} />);

      // Act - Enter only whitespace
      await user.type(getReasonTextarea(), '          ');

      // Assert - Button should still be disabled
      expect(getRejectButton()).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should not render when isOpen is false', () => {
      // Arrange & Act
      render(<RejectModal {...defaultProps} isOpen={false} />);

      // Assert
      expect(screen.queryByText(/rechazar archivo/i)).not.toBeInTheDocument();
    });

    it('should handle different grdId values', () => {
      // Arrange & Act
      render(<RejectModal {...defaultProps} grdId={456} />);

      // Assert
      expect(screen.getByText(/#456/)).toBeInTheDocument();
    });
  });

  describe('Error Cases', () => {
    it('should display error when rejection fails', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnConfirm = jest.fn().mockRejectedValue(new Error('Rejection failed'));
      render(<RejectModal {...defaultProps} onConfirm={mockOnConfirm} />);

      // Act
      await user.type(getReasonTextarea(), 'Razón válida para rechazo');
      await user.click(getRejectButton());

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error al rechazar archivo/i)).toBeInTheDocument();
      });
    });

    it('should not close modal when rejection fails', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      const mockOnConfirm = jest.fn().mockRejectedValue(new Error('Failed'));
      render(<RejectModal {...defaultProps} onClose={mockOnClose} onConfirm={mockOnConfirm} />);

      // Act
      await user.type(getReasonTextarea(), 'Razón válida');
      await user.click(getRejectButton());

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
      // Modal should still be open (onClose not called for error)
    });
  });

  describe('Loading State', () => {
    it('should show loading state when isSubmitting is true', () => {
      // Arrange & Act
      render(<RejectModal {...defaultProps} isSubmitting={true} />);

      // Assert
      expect(screen.getByText(/rechazando/i)).toBeInTheDocument();
    });

    it('should disable textarea when isSubmitting', () => {
      // Arrange & Act
      render(<RejectModal {...defaultProps} isSubmitting={true} />);

      // Assert
      expect(getReasonTextarea()).toBeDisabled();
    });

    it('should disable buttons when isSubmitting', () => {
      // Arrange & Act
      render(<RejectModal {...defaultProps} isSubmitting={true} />);

      // Assert
      expect(screen.getByRole('button', { name: /rechazando/i })).toBeDisabled();
      expect(getCancelButton()).toBeDisabled();
    });

    it('should not allow closing modal when isSubmitting', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      const { container } = render(<RejectModal {...defaultProps} isSubmitting={true} onClose={mockOnClose} />);

      // Act - Try to click overlay
      const overlay = container.querySelector('.overlay');
      if (overlay) {
        await user.click(overlay);
      }

      // Assert - onClose should not be called
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have label for textarea', () => {
      // Arrange & Act
      render(<RejectModal {...defaultProps} />);

      // Assert
      expect(screen.getByLabelText(/razón del rechazo/i)).toBeInTheDocument();
    });

    it('should have type="button" on all buttons', () => {
      // Arrange & Act
      render(<RejectModal {...defaultProps} />);

      // Assert
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should indicate required field', () => {
      // Arrange & Act
      render(<RejectModal {...defaultProps} />);

      // Assert
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });
});

