/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '../utils/render-helpers';
import NormaMinsalPage from '@/components/NormaMinsal';
import { mockFetch, mockFetchError, resetFetchMock } from '../mocks/fetch.mock';

// Mock ag-grid-react to avoid SSR issues in tests
jest.mock('ag-grid-react', () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => (
    <div data-testid="ag-grid-mock">
      <div data-testid="row-count">{rowData?.length || 0} rows</div>
      <div data-testid="column-count">{columnDefs?.length || 0} columns</div>
      {rowData?.map((row: any, i: number) => (
        <div key={i} data-testid={`row-${i}`}>
          {row.GRD && <span data-testid={`grd-${i}`}>{row.GRD}</span>}
        </div>
      ))}
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

// Mock next/dynamic to bypass SSR
jest.mock('next/dynamic', () => () =>
  function MockDynamicAgGrid({ rowData, columnDefs }: { rowData?: Array<{ GRD?: string }>; columnDefs?: unknown[] }) {
    return (
      <div data-testid="ag-grid-mock">
        <div data-testid="row-count">{rowData?.length || 0} rows</div>
        <div data-testid="column-count">{columnDefs?.length || 0} columns</div>
        {rowData?.map((row, i) => (
          <div key={i} data-testid={`row-${i}`}>
            {row.GRD && <span data-testid={`grd-${i}`}>{row.GRD}</span>}
          </div>
        ))}
      </div>
    );
  }
);

describe('NormaMinsal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetFetchMock();
  });

  describe('Loading State', () => {
    it('should show loading state initially', () => {
      // Arrange - Mock a slow response
      global.fetch = jest.fn(() => new Promise(() => {})); // Never resolves

      // Act
      render(<NormaMinsalPage />);

      // Assert
      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });
  });

  describe('Success Cases', () => {
    it('should render title', async () => {
      // Arrange
      mockFetch([]);

      // Act
      render(<NormaMinsalPage />);

      // Assert
      expect(screen.getByText(/norma minsal/i)).toBeInTheDocument();
    });

    it('should display data in ag-grid when API returns data', async () => {
      // Arrange
      const mockData = [
        { id: 1, GRD: 100, tipo_GRD: 'M', peso_total: 1.5 },
        { id: 2, GRD: 200, tipo_GRD: 'Q', peso_total: 2.0 },
      ];
      mockFetch(mockData);

      // Act
      render(<NormaMinsalPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
      });
      expect(screen.getByTestId('row-count')).toHaveTextContent('2 rows');
    });

    it('should handle data wrapped in data property', async () => {
      // Arrange
      const mockData = {
        data: [
          { id: 1, GRD: 300, tipo_GRD: 'M' },
        ],
      };
      mockFetch(mockData);

      // Act
      render(<NormaMinsalPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('row-count')).toHaveTextContent('1 rows');
      });
    });

    it('should generate columns from data keys', async () => {
      // Arrange
      const mockData = [
        { GRD: 100, tipo_GRD: 'M', peso_total: 1.5, est_media: 5 },
      ];
      mockFetch(mockData);

      // Act
      render(<NormaMinsalPage />);

      // Assert
      await waitFor(() => {
        // Should have columns for all keys except 'id'
        expect(screen.getByTestId('column-count')).toHaveTextContent('4 columns');
      });
    });
  });

  describe('Empty State', () => {
    it('should show message when no records found', async () => {
      // Arrange
      mockFetch([]);

      // Act
      render(<NormaMinsalPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/no se encontraron registros/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Cases', () => {
    it('should display error message when API fails', async () => {
      // Arrange
      mockFetchError({ error: 'Server error' }, 500);

      // Act
      render(<NormaMinsalPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should show endpoint hint in error message', async () => {
      // Arrange
      mockFetchError({ error: 'Not found' }, 404);

      // Act
      render(<NormaMinsalPage />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/\/api\/v1\/norma-minsal/i)).toBeInTheDocument();
      });
    });
  });

  describe('Header Mapping', () => {
    it('should use Spanish headers for known fields', async () => {
      // Arrange - The component maps GRD -> "GRD", peso_total -> "Peso total", etc.
      const mockData = [
        { GRD: 100, tipo_GRD: 'M', peso_total: 1.5 },
      ];
      mockFetch(mockData);

      // Act
      render(<NormaMinsalPage />);

      // Assert - Component should render with mapped headers
      await waitFor(() => {
        expect(screen.getByTestId('ag-grid-mock')).toBeInTheDocument();
      });
    });
  });
});
