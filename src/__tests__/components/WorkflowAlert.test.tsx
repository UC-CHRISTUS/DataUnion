/**
 * @jest-environment jsdom
 */

import { render, screen } from '../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import WorkflowAlert from '@/components/WorkflowAlert';

// Mock CSS modules
jest.mock('@/components/WorkflowAlert.module.css', () => ({
  alert: 'alert',
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  content: 'content',
  iconWrapper: 'iconWrapper',
  icon: 'icon',
  messageWrapper: 'messageWrapper',
  message: 'message',
  actionButton: 'actionButton',
  dismissButton: 'dismissButton',
  dismissIcon: 'dismissIcon',
}));

describe('WorkflowAlert Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    describe('Rendering', () => {
      it('should render message correctly', () => {
        // Arrange
        const message = 'Este es un mensaje de prueba';

        // Act
        render(<WorkflowAlert message={message} />);

        // Assert
        expect(screen.getByText(message)).toBeInTheDocument();
      });

      it('should render with info type by default', () => {
        // Arrange
        const message = 'Default type message';

        // Act
        render(<WorkflowAlert message={message} />);

        // Assert
        const alertElement = screen.getByText(message).closest('div.alert');
        expect(alertElement).toHaveClass('alert', 'info');
      });

      it('should render success alert type', () => {
        // Arrange
        const message = 'Operación exitosa';

        // Act
        render(<WorkflowAlert message={message} type="success" />);

        // Assert
        const alertElement = screen.getByText(message).closest('div.alert');
        expect(alertElement).toHaveClass('alert', 'success');
      });

      it('should render warning alert type', () => {
        // Arrange
        const message = 'Advertencia importante';

        // Act
        render(<WorkflowAlert message={message} type="warning" />);

        // Assert
        const alertElement = screen.getByText(message).closest('div.alert');
        expect(alertElement).toHaveClass('alert', 'warning');
      });

      it('should render error alert type', () => {
        // Arrange
        const message = 'Error en la operación';

        // Act
        render(<WorkflowAlert message={message} type="error" />);

        // Assert
        const alertElement = screen.getByText(message).closest('div.alert');
        expect(alertElement).toHaveClass('alert', 'error');
      });
    });

    describe('Action Button', () => {
      it('should render action button when action prop is provided', () => {
        // Arrange
        const action = { label: 'Ver detalles', onClick: jest.fn() };

        // Act
        render(<WorkflowAlert message="Test message" action={action} />);

        // Assert
        expect(
          screen.getByRole('button', { name: /ver detalles/i })
        ).toBeInTheDocument();
      });

      it('should call onClick when action button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnClick = jest.fn();
        const action = { label: 'Ver archivo', onClick: mockOnClick };

        // Act
        render(<WorkflowAlert message="Test message" action={action} />);
        const actionButton = screen.getByRole('button', { name: /ver archivo/i });
        await user.click(actionButton);

        // Assert
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    describe('Dismiss Button', () => {
      it('should render dismiss button when dismissible is true and onDismiss is provided', () => {
        // Arrange
        const onDismiss = jest.fn();

        // Act
        render(
          <WorkflowAlert
            message="Dismissible message"
            dismissible={true}
            onDismiss={onDismiss}
          />
        );

        // Assert
        expect(
          screen.getByRole('button', { name: /cerrar alerta/i })
        ).toBeInTheDocument();
      });

      it('should call onDismiss when dismiss button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockOnDismiss = jest.fn();

        // Act
        render(
          <WorkflowAlert
            message="Test message"
            dismissible={true}
            onDismiss={mockOnDismiss}
          />
        );
        const dismissButton = screen.getByRole('button', { name: /cerrar alerta/i });
        await user.click(dismissButton);

        // Assert
        expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not render action button when action prop is not provided', () => {
      // Arrange & Act
      render(<WorkflowAlert message="Test message" />);

      // Assert - No buttons should exist (except potentially dismiss)
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not render dismiss button when dismissible is false', () => {
      // Arrange & Act
      render(<WorkflowAlert message="Test message" dismissible={false} />);

      // Assert
      expect(
        screen.queryByRole('button', { name: /cerrar alerta/i })
      ).not.toBeInTheDocument();
    });

    it('should not render dismiss button when onDismiss is not provided', () => {
      // Arrange & Act
      render(<WorkflowAlert message="Test message" dismissible={true} />);

      // Assert
      expect(
        screen.queryByRole('button', { name: /cerrar alerta/i })
      ).not.toBeInTheDocument();
    });

    it('should render both action and dismiss buttons when both are provided', () => {
      // Arrange
      const action = { label: 'Action', onClick: jest.fn() };
      const onDismiss = jest.fn();

      // Act
      render(
        <WorkflowAlert
          message="Test message"
          action={action}
          dismissible={true}
          onDismiss={onDismiss}
        />
      );

      // Assert
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cerrar alerta/i })).toBeInTheDocument();
    });

    it('should handle long message text correctly', () => {
      // Arrange
      const longMessage =
        'Este es un mensaje muy largo que podría extenderse más allá del ancho normal del componente y debería manejarse correctamente por el diseño CSS.';

      // Act
      render(<WorkflowAlert message={longMessage} />);

      // Assert
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle message with emoji correctly', () => {
      // Arrange
      const emojiMessage = '⚠️ Tienes un archivo pendiente de revisión';

      // Act
      render(<WorkflowAlert message={emojiMessage} type="warning" />);

      // Assert
      expect(screen.getByText(emojiMessage)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label on dismiss button', () => {
      // Arrange & Act
      render(
        <WorkflowAlert
          message="Test message"
          dismissible={true}
          onDismiss={jest.fn()}
        />
      );

      // Assert
      const dismissButton = screen.getByRole('button', { name: /cerrar alerta/i });
      expect(dismissButton).toHaveAttribute('aria-label', 'Cerrar alerta');
    });

    it('should have type="button" on action button', () => {
      // Arrange
      const action = { label: 'Action', onClick: jest.fn() };

      // Act
      render(<WorkflowAlert message="Test message" action={action} />);

      // Assert
      const actionButton = screen.getByRole('button', { name: /action/i });
      expect(actionButton).toHaveAttribute('type', 'button');
    });

    it('should have type="button" on dismiss button', () => {
      // Arrange & Act
      render(
        <WorkflowAlert
          message="Test message"
          dismissible={true}
          onDismiss={jest.fn()}
        />
      );

      // Assert
      const dismissButton = screen.getByRole('button', { name: /cerrar alerta/i });
      expect(dismissButton).toHaveAttribute('type', 'button');
    });

    it('should render icons with appropriate SVG structure', () => {
      // Arrange & Act
      const { container } = render(<WorkflowAlert message="Test message" type="info" />);

      // Assert - Should have an SVG icon
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons.length).toBeGreaterThan(0);
    });
  });
});

