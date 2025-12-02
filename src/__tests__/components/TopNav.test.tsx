/**
 * @jest-environment jsdom
 */

import { render, screen } from '../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import TopNav from '@/components/TopNav';

// Mock CSS modules
jest.mock('@/components/TopNav.module.css', () => ({
  topNav: 'topNav',
  navLeft: 'navLeft',
  menuButton: 'menuButton',
  navRight: 'navRight',
  navActions: 'navActions',
  userMenu: 'userMenu',
  userAvatar: 'userAvatar',
  dropdownMenu: 'dropdownMenu',
}));

describe('TopNav Component', () => {
  const defaultProps = {
    onToggleSidebar: jest.fn(),
    isSidebarOpen: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    describe('Rendering', () => {
      it('should render the header element', () => {
        // Arrange & Act
        render(<TopNav {...defaultProps} />);

        // Assert
        expect(screen.getByRole('banner')).toBeInTheDocument();
      });

      it('should render the menu toggle button', () => {
        // Arrange & Act
        render(<TopNav {...defaultProps} />);

        // Assert
        expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument();
      });

      it('should render hamburger icon in menu button', () => {
        // Arrange & Act
        const { container } = render(<TopNav {...defaultProps} />);

        // Assert
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
      });
    });

    describe('User Interactions', () => {
      it('should call onToggleSidebar when menu button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockToggle = jest.fn();
        render(<TopNav {...defaultProps} onToggleSidebar={mockToggle} />);

        // Act
        await user.click(screen.getByRole('button', { name: /toggle sidebar/i }));

        // Assert
        expect(mockToggle).toHaveBeenCalledTimes(1);
      });

      it('should call onToggleSidebar multiple times', async () => {
        // Arrange
        const user = userEvent.setup();
        const mockToggle = jest.fn();
        render(<TopNav {...defaultProps} onToggleSidebar={mockToggle} />);

        // Act
        await user.click(screen.getByRole('button', { name: /toggle sidebar/i }));
        await user.click(screen.getByRole('button', { name: /toggle sidebar/i }));
        await user.click(screen.getByRole('button', { name: /toggle sidebar/i }));

        // Assert
        expect(mockToggle).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should render correctly when sidebar is open', () => {
      // Arrange & Act
      render(<TopNav {...defaultProps} isSidebarOpen={true} />);

      // Assert
      expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument();
    });

    it('should render correctly when sidebar is closed', () => {
      // Arrange & Act
      render(<TopNav {...defaultProps} isSidebarOpen={false} />);

      // Assert
      expect(screen.getByRole('button', { name: /toggle sidebar/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on menu button', () => {
      // Arrange & Act
      render(<TopNav {...defaultProps} />);

      // Assert
      const button = screen.getByRole('button', { name: /toggle sidebar/i });
      expect(button).toHaveAttribute('aria-label', 'Toggle sidebar');
    });

    it('should use semantic header element', () => {
      // Arrange & Act
      render(<TopNav {...defaultProps} />);

      // Assert
      const header = screen.getByRole('banner');
      expect(header.tagName.toLowerCase()).toBe('header');
    });
  });
});

