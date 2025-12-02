/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import SubmitConfirmModal from '@/components/SubmitConfirmModal';

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
  question: 'question',
  confirmQuestion: 'confirmQuestion',
  warningBox: 'warningBox',
  warningTitle: 'warningTitle',
  warningList: 'warningList',
  footer: 'footer',
  button: 'button',
  buttonPrimary: 'buttonPrimary',
  buttonSecondary: 'buttonSecondary',
  buttonDanger: 'buttonDanger',
  loadingWrapper: 'loadingWrapper',
  spinner: 'spinner',
  spinnerCircle: 'spinnerCircle',
  spinnerPath: 'spinnerPath',
}));

describe('SubmitConfirmModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn().mockResolvedValue(undefined),
    role: 'encoder' as const,
    grdId: 123,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    describe('Step 1 - Initial Confirmation', () => {
      it('should render step 1 when modal opens', () => {
        // Arrange & Act
        render(<SubmitConfirmModal {...defaultProps} />);

        // Assert
        expect(screen.getByText(/entregar a finanzas/i)).toBeInTheDocument();
        expect(screen.getByText(/estás seguro/i)).toBeInTheDocument();
      });

      it('should display GRD ID', () => {
        // Arrange & Act
        render(<SubmitConfirmModal {...defaultProps} />);

        // Assert
        expect(screen.getByText(/#123/)).toBeInTheDocument();
      });

      it('should show encoder-specific text when role is encoder', () => {
        // Arrange & Act
        render(<SubmitConfirmModal {...defaultProps} role="encoder" />);

        // Assert
        expect(screen.getByText(/entregar a finanzas/i)).toBeInTheDocument();
        // Multiple elements contain "Finanzas" - use getAllBy
        expect(screen.getAllByText(/finanzas/i).length).toBeGreaterThan(0);
      });

      it('should show finance-specific text when role is finance', () => {
        // Arrange & Act
        render(<SubmitConfirmModal {...defaultProps} role="finance" />);

        // Assert
        expect(screen.getByText(/entregar a administración/i)).toBeInTheDocument();
      });

      it('should show Continue and Cancel buttons in step 1', () => {
        // Arrange & Act
        render(<SubmitConfirmModal {...defaultProps} />);

        // Assert
        expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      });
    });

    describe('Step 2 - Final Confirmation', () => {
      it('should show step 2 after clicking Continue', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SubmitConfirmModal {...defaultProps} />);

        // Act
        await user.click(screen.getByRole('button', { name: /continuar/i }));

        // Assert
        expect(screen.getByText(/confirmación final/i)).toBeInTheDocument();
        expect(screen.getByText(/importante/i)).toBeInTheDocument();
      });

      it('should show warning list in step 2', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SubmitConfirmModal {...defaultProps} />);

        // Act
        await user.click(screen.getByRole('button', { name: /continuar/i }));

        // Assert
        expect(screen.getByText(/no podrás editar/i)).toBeInTheDocument();
        expect(screen.getByText(/cambiará de estado/i)).toBeInTheDocument();
        expect(screen.getByText(/recibirás una notificación/i)).toBeInTheDocument();
      });

      it('should show encoder-specific warning when role is encoder', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SubmitConfirmModal {...defaultProps} role="encoder" />);

        // Act
        await user.click(screen.getByRole('button', { name: /continuar/i }));

        // Assert
        expect(screen.getByText(/finanzas podrá editar/i)).toBeInTheDocument();
      });

      it('should show finance-specific warning when role is finance', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SubmitConfirmModal {...defaultProps} role="finance" />);

        // Act
        await user.click(screen.getByRole('button', { name: /continuar/i }));

        // Assert
        expect(screen.getByText(/administrador podrá aprobar/i)).toBeInTheDocument();
      });

      it('should show Confirm and Back buttons in step 2', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SubmitConfirmModal {...defaultProps} />);

        // Act
        await user.click(screen.getByRole('button', { name: /continuar/i }));

        // Assert
        expect(screen.getByRole('button', { name: /confirmar y entregar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument();
      });
    });

    describe('Navigation', () => {
      it('should go back to step 1 when clicking Volver', async () => {
        // Arrange
        const user = userEvent.setup();
        render(<SubmitConfirmModal {...defaultProps} />);

        // Go to step 2
        await user.click(screen.getByRole('button', { name: /continuar/i }));
        expect(screen.getByText(/confirmación final/i)).toBeInTheDocument();

        // Act - Go back
        await user.click(screen.getByRole('button', { name: /volver/i }));

        // Assert - Back to step 1
        expect(screen.getByText(/entregar a finanzas/i)).toBeInTheDocument();
        expect(screen.queryByText(/confirmación final/i)).not.toBeInTheDocument();
      });
    });

    describe('Form Submission', () => {
      it('should call onConfirm when final confirmation is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnConfirm = jest.fn().mockResolvedValue(undefined);
        render(<SubmitConfirmModal {...defaultProps} onConfirm={mockOnConfirm} />);

        // Act
        await user.click(screen.getByRole('button', { name: /continuar/i }));
        await user.click(screen.getByRole('button', { name: /confirmar y entregar/i }));

        // Assert
        await waitFor(() => {
          expect(mockOnConfirm).toHaveBeenCalled();
        });
      });

      it('should close modal after successful confirmation', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        render(<SubmitConfirmModal {...defaultProps} onClose={mockOnClose} />);

        // Act
        await user.click(screen.getByRole('button', { name: /continuar/i }));
        await user.click(screen.getByRole('button', { name: /confirmar y entregar/i }));

        // Assert
        await waitFor(() => {
          expect(mockOnClose).toHaveBeenCalled();
        });
      });

      it('should reset to step 1 after successful confirmation', async () => {
        // Arrange
        const user = userEvent.setup();
        const { rerender } = render(<SubmitConfirmModal {...defaultProps} />);

        // Go to step 2 and confirm
        await user.click(screen.getByRole('button', { name: /continuar/i }));
        await user.click(screen.getByRole('button', { name: /confirmar y entregar/i }));

        // Reopen modal
        await waitFor(() => {
          rerender(<SubmitConfirmModal {...defaultProps} isOpen={true} />);
        });

        // Assert - Should be back at step 1
        expect(screen.getByText(/entregar a finanzas/i)).toBeInTheDocument();
      });
    });

    describe('Modal Controls', () => {
      it('should call onClose when Cancel is clicked in step 1', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        render(<SubmitConfirmModal {...defaultProps} onClose={mockOnClose} />);

        // Act
        await user.click(screen.getByRole('button', { name: /cancelar/i }));

        // Assert
        expect(mockOnClose).toHaveBeenCalled();
      });

      it('should call onClose when overlay is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        const { container } = render(<SubmitConfirmModal {...defaultProps} onClose={mockOnClose} />);

        // Act
        const overlay = container.querySelector('.overlay');
        if (overlay) {
          await user.click(overlay);
        }

        // Assert
        expect(mockOnClose).toHaveBeenCalled();
      });

      it('should reset to step 1 when modal is closed and reopened', async () => {
        // Arrange
        const user = userEvent.setup();
        const { rerender } = render(<SubmitConfirmModal {...defaultProps} />);

        // Go to step 2
        await user.click(screen.getByRole('button', { name: /continuar/i }));

        // Close and reopen
        await user.click(screen.getByRole('button', { name: /volver/i }));
        rerender(<SubmitConfirmModal {...defaultProps} isOpen={false} />);
        rerender(<SubmitConfirmModal {...defaultProps} isOpen={true} />);

        // Assert - Should be at step 1
        expect(screen.getByRole('button', { name: /continuar/i })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not render when isOpen is false', () => {
      // Arrange & Act
      render(<SubmitConfirmModal {...defaultProps} isOpen={false} />);

      // Assert
      expect(screen.queryByText(/entregar/i)).not.toBeInTheDocument();
    });

    it('should handle different grdId values', () => {
      // Arrange & Act
      render(<SubmitConfirmModal {...defaultProps} grdId={999} />);

      // Assert
      expect(screen.getByText(/#999/)).toBeInTheDocument();
    });
  });

  describe('Error Cases', () => {
    it('should handle confirmation error gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnConfirm = jest.fn().mockRejectedValue(new Error('Confirmation failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<SubmitConfirmModal {...defaultProps} onConfirm={mockOnConfirm} />);

      // Act
      await user.click(screen.getByRole('button', { name: /continuar/i }));
      await user.click(screen.getByRole('button', { name: /confirmar y entregar/i }));

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should disable Continue button when isSubmitting in step 1', () => {
      // Arrange & Act
      render(<SubmitConfirmModal {...defaultProps} isSubmitting={true} />);

      // Assert
      expect(screen.getByRole('button', { name: /continuar/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled();
    });

    it('should not allow closing modal when isSubmitting', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      const { container } = render(<SubmitConfirmModal {...defaultProps} isSubmitting={true} onClose={mockOnClose} />);

      // Act - Try to click overlay
      const overlay = container.querySelector('.overlay');
      if (overlay) {
        await user.click(overlay);
      }

      // Assert
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have type="button" on all buttons', () => {
      // Arrange & Act
      render(<SubmitConfirmModal {...defaultProps} />);

      // Assert
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should have heading elements', () => {
      // Arrange & Act
      render(<SubmitConfirmModal {...defaultProps} />);

      // Assert
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });
  });
});

