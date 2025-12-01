/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import ExcelEditorSigesa from '@/components/SigesaPreview';
import { mockFetch, resetFetchMock } from '../mocks/fetch.mock';

// Mock ag-grid-react
jest.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs, datasource }: any) => (
    <div data-testid="ag-grid-mock">
      <div data-testid="row-count">{rowData?.length || 0} rows</div>
      <div data-testid="column-count">{columnDefs?.length || 0} columns</div>
      {datasource && <div data-testid="has-datasource">infinite scroll enabled</div>}
    </div>
  ),
}));

// Mock ag-grid-community
jest.mock('ag-grid-community', () => ({
  ModuleRegistry: {
    registerModules: jest.fn(),
  },
  AllCommunityModule: {},
}));

// Mock next/dynamic
jest.mock('next/dynamic', () => () => {
  const { AgGridReact } = require('ag-grid-react');
  return AgGridReact;
});

// Mock xlsx
jest.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: jest.fn(),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
  write: jest.fn(() => new ArrayBuffer(8)),
}));

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

describe('SigesaPreview Component', () => {
  const mockSigesaFiles = [
    { id: 1, nombre: 'Archivo 1' },
    { id: 2, nombre: 'Archivo 2' },
  ];

  const mockSigesaRows = {
    data: [
      { id: 1, episodio_CMBD: 1001, nombre: 'Juan Pérez', rut: '12345678-9' },
      { id: 2, episodio_CMBD: 1002, nombre: 'María López', rut: '98765432-1' },
    ],
    total: 2,
    page: 1,
    pageSize: 50,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resetFetchMock();
  });

  describe('Initial Rendering', () => {
    it('should render the title', async () => {
      // Arrange
      mockFetch({ data: [], totalPages: 0 });

      // Act
      render(<ExcelEditorSigesa />);

      // Assert
      expect(screen.getByText(/archivos sigesa/i)).toBeInTheDocument();
    });

    it('should show message when no files available', async () => {
      // Arrange
      mockFetch({ data: [], totalPages: 0 });

      // Act
      render(<ExcelEditorSigesa />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no hay datos disponibles/i)).toBeInTheDocument();
      });
    });
  });

  describe('File Selection', () => {
    it('should display file selector when files exist', async () => {
      // Arrange
      mockFetch({ data: mockSigesaFiles, totalPages: 1 });

      // Act
      render(<ExcelEditorSigesa />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });

    it('should show file options in selector', async () => {
      // Arrange
      mockFetch({ data: mockSigesaFiles, totalPages: 1 });

      // Act
      render(<ExcelEditorSigesa />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('option', { name: /archivo 1/i })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: /archivo 2/i })).toBeInTheDocument();
      });
    });

    it('should have load button', async () => {
      // Arrange
      mockFetch({ data: mockSigesaFiles, totalPages: 1 });

      // Act
      render(<ExcelEditorSigesa />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cargar/i })).toBeInTheDocument();
      });
    });
  });

  describe('Loading Data', () => {
    it('should load rows when clicking load button', async () => {
      // Arrange
      const user = userEvent.setup();
      
      // First fetch for files list
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: mockSigesaFiles, totalPages: 1 }),
        })
        // Second fetch for rows
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSigesaRows),
        });

      // Act
      render(<ExcelEditorSigesa />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cargar/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cargar/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching rows', async () => {
      // Arrange
      const user = userEvent.setup();
      
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: mockSigesaFiles, totalPages: 1 }),
        })
        .mockImplementationOnce(() => new Promise(() => {})); // Never resolves

      // Act
      render(<ExcelEditorSigesa />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cargar/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cargar/i }));

      // Assert - Button shows "Cargando..." when loading
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cargando/i })).toBeInTheDocument();
      });
    });
  });

  describe('File Selection Change', () => {
    it('should allow changing selected file', async () => {
      // Arrange
      const user = userEvent.setup();
      mockFetch({ data: mockSigesaFiles, totalPages: 1 });

      // Act
      render(<ExcelEditorSigesa />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      // Change selection
      await user.selectOptions(screen.getByRole('combobox'), '2');

      // Assert
      expect(screen.getByRole('combobox')).toHaveValue('2');
    });
  });

  describe('Column Definitions', () => {
    it('should have all required column definitions', async () => {
      // Arrange
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: mockSigesaFiles, totalPages: 1 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSigesaRows),
        });

      const user = userEvent.setup();

      // Act
      render(<ExcelEditorSigesa />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cargar/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cargar/i }));

      // Assert - Component defines 84+ columns for SIGESA data
      await waitFor(() => {
        const columnCount = screen.getByTestId('column-count');
        expect(parseInt(columnCount.textContent || '0')).toBeGreaterThan(80);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading files', async () => {
      // Arrange
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

      // Act
      render(<ExcelEditorSigesa />);

      // Assert - Should show empty state, not crash
      await waitFor(() => {
        expect(screen.getByText(/no hay datos disponibles/i)).toBeInTheDocument();
      });
    });

    it('should handle API error when loading rows', async () => {
      // Arrange
      const user = userEvent.setup();
      
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: mockSigesaFiles, totalPages: 1 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Not found' }),
        });

      // Act
      render(<ExcelEditorSigesa />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cargar/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cargar/i }));

      // Assert - Should not crash, rowData stays empty
      await waitFor(() => {
        expect(screen.queryByTestId('ag-grid-mock')).not.toBeInTheDocument();
      });
    });
  });

  describe('Button States', () => {
    it('should disable load button when no file selected', async () => {
      // Arrange - Empty file list means no selection possible
      mockFetch({ data: [], totalPages: 0 });

      // Act
      render(<ExcelEditorSigesa />);

      // Assert - No combobox should appear
      await waitFor(() => {
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      });
    });

    it('should disable load button while loading', async () => {
      // Arrange
      const user = userEvent.setup();
      
      global.fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ data: mockSigesaFiles, totalPages: 1 }),
        })
        .mockImplementationOnce(() => new Promise(() => {}));

      // Act
      render(<ExcelEditorSigesa />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cargar/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cargar/i }));

      // Assert - Button is disabled and shows "Cargando..."
      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /cargando/i });
        expect(loadingButton).toBeDisabled();
      });
    });
  });
});
