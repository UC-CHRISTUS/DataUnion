/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '../../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import ConfirmModal from '@/components/admin/ConfirmModal';

describe('ConfirmModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Confirmar Acción',
    message: '¿Estás seguro de que deseas realizar esta acción?',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    describe('Rendering', () => {
      it('should render modal when isOpen is true', () => {
        // Arrange & Act
        render(<ConfirmModal {...defaultProps} />);

        // Assert
        expect(screen.getByText(/confirmar acción/i)).toBeInTheDocument();
        expect(screen.getByText(/estás seguro/i)).toBeInTheDocument();
      });

      it('should render title and message correctly', () => {
        // Arrange
        const props = {
          ...defaultProps,
          title: 'Eliminar Usuario',
          message: 'Esta acción no se puede deshacer.',
        };

        // Act
        render(<ConfirmModal {...props} />);

        // Assert
        expect(screen.getByText(/eliminar usuario/i)).toBeInTheDocument();
        expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();
      });

      it('should render default button texts', () => {
        // Arrange & Act
        render(<ConfirmModal {...defaultProps} />);

        // Assert
        expect(screen.getByRole('button', { name: /confirmar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      });

      it('should render custom button texts', () => {
        // Arrange
        const props = {
          ...defaultProps,
          confirmText: 'Sí, eliminar',
          cancelText: 'No, volver',
        };

        // Act
        render(<ConfirmModal {...props} />);

        // Assert
        expect(screen.getByRole('button', { name: /sí, eliminar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /no, volver/i })).toBeInTheDocument();
      });

      it('should render warning icon', () => {
        // Arrange & Act
        const { container } = render(<ConfirmModal {...defaultProps} />);

        // Assert
        const svgIcon = container.querySelector('svg');
        expect(svgIcon).toBeInTheDocument();
      });
    });

    describe('User Interactions', () => {
      it('should call onConfirm when confirm button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnConfirm = jest.fn();
        render(<ConfirmModal {...defaultProps} onConfirm={mockOnConfirm} />);

        // Act
        await user.click(screen.getByRole('button', { name: /confirmar/i }));

        // Assert
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      });

      it('should call onClose when cancel button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClose = jest.fn();
        render(<ConfirmModal {...defaultProps} onClose={mockOnClose} />);

        // Act
        await user.click(screen.getByRole('button', { name: /cancelar/i }));

        // Assert
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    describe('Destructive Mode', () => {
      it('should apply destructive styling when isDestructive is true', () => {
        // Arrange & Act
        render(<ConfirmModal {...defaultProps} isDestructive={true} />);

        // Assert
        const confirmButton = screen.getByRole('button', { name: /confirmar/i });
        expect(confirmButton).toHaveClass('bg-red-600');
      });

      it('should apply normal styling when isDestructive is false', () => {
        // Arrange & Act
        render(<ConfirmModal {...defaultProps} isDestructive={false} />);

        // Assert
        const confirmButton = screen.getByRole('button', { name: /confirmar/i });
        expect(confirmButton).toHaveClass('bg-blue-600');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not render when isOpen is false', () => {
      // Arrange & Act
      render(<ConfirmModal {...defaultProps} isOpen={false} />);

      // Assert
      expect(screen.queryByText(/confirmar acción/i)).not.toBeInTheDocument();
    });

    it('should handle long title text', () => {
      // Arrange
      const longTitle = 'Este es un título muy largo que podría extenderse más allá del ancho normal del modal';

      // Act
      render(<ConfirmModal {...defaultProps} title={longTitle} />);

      // Assert
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle long message text', () => {
      // Arrange
      const longMessage = 'Este es un mensaje muy largo que explica en detalle lo que sucederá cuando confirmes esta acción. Asegúrate de leer todo antes de continuar.';

      // Act
      render(<ConfirmModal {...defaultProps} message={longMessage} />);

      // Assert
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      // Arrange & Act
      render(<ConfirmModal {...defaultProps} isLoading={true} />);

      // Assert
      expect(screen.getByText(/procesando/i)).toBeInTheDocument();
    });

    it('should disable confirm button when isLoading is true', () => {
      // Arrange & Act
      render(<ConfirmModal {...defaultProps} isLoading={true} />);

      // Assert
      const confirmButton = screen.getByRole('button', { name: /procesando/i });
      expect(confirmButton).toBeDisabled();
    });

    it('should disable cancel button when isLoading is true', () => {
      // Arrange & Act
      render(<ConfirmModal {...defaultProps} isLoading={true} />);

      // Assert
      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      expect(cancelButton).toBeDisabled();
    });

    it('should show normal confirm text when isLoading is false', () => {
      // Arrange & Act
      render(<ConfirmModal {...defaultProps} isLoading={false} />);

      // Assert
      expect(screen.getByRole('button', { name: /^confirmar$/i })).toBeInTheDocument();
      expect(screen.queryByText(/procesando/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have type="button" on all buttons', () => {
      // Arrange & Act
      render(<ConfirmModal {...defaultProps} />);

      // Assert
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should have heading element for title', () => {
      // Arrange & Act
      render(<ConfirmModal {...defaultProps} />);

      // Assert
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(/confirmar acción/i);
    });

    it('should have paragraph element for message', () => {
      // Arrange & Act
      const { container } = render(<ConfirmModal {...defaultProps} />);

      // Assert
      const paragraph = container.querySelector('p');
      expect(paragraph).toHaveTextContent(/estás seguro/i);
    });
  });
});

