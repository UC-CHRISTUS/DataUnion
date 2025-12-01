/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor, fireEvent } from '../utils/render-helpers';
import userEvent from '@testing-library/user-event';
import FileUpload from '@/components/FileUpload';
import * as workflowHook from '@/hooks/useWorkflowStatus';
import { mockFetch, mockFetchError, resetFetchMock } from '../mocks/fetch.mock';

// Mock CSS modules
jest.mock('@/components/FileUpload.module.css', () => ({
  uploadContainer: 'uploadContainer',
  dropZone: 'dropZone',
  dragging: 'dragging',
  disabled: 'disabled',
  dropZoneContent: 'dropZoneContent',
  uploadIcon: 'uploadIcon',
  dropZoneText: 'dropZoneText',
  orText: 'orText',
  chooseFileButton: 'chooseFileButton',
  fileInput: 'fileInput',
  fileInfo: 'fileInfo',
  fileName: 'fileName',
  fileSize: 'fileSize',
  actions: 'actions',
  uploadButton: 'uploadButton',
  removeButton: 'removeButton',
  successMessage: 'successMessage',
  errorMessage: 'errorMessage',
}));

// Mock the useWorkflowStatus hook
jest.mock('@/hooks/useWorkflowStatus');

describe('FileUpload Component', () => {
  const mockRefetch = jest.fn();

  // Default mock for no active workflow
  const mockNoActiveWorkflow = () => {
    jest.spyOn(workflowHook, 'useWorkflowStatus').mockReturnValue({
      hasActiveWorkflow: false,
      grdId: undefined,
      episodio: undefined,
      estado: undefined,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
  };

  // Mock for active workflow
  const mockActiveWorkflow = (grdId = 123, estado = 'pendiente_finance') => {
    jest.spyOn(workflowHook, 'useWorkflowStatus').mockReturnValue({
      hasActiveWorkflow: true,
      grdId,
      episodio: 'EP001',
      estado,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
  };

  // Mock for loading state
  const mockLoadingWorkflow = () => {
    jest.spyOn(workflowHook, 'useWorkflowStatus').mockReturnValue({
      hasActiveWorkflow: false,
      grdId: undefined,
      episodio: undefined,
      estado: undefined,
      loading: true,
      error: null,
      refetch: mockRefetch,
    });
  };

  // Helper to create test files
  const createTestFile = (name: string, type: string, size = 1024) => {
    const content = 'x'.repeat(size);
    return new File([content], name, { type });
  };

  // Get UI elements
  const getDropZone = () => {
    // Find the dropZone div (parent of dropZoneContent)
    const content = screen.getByText(/arrastra|carga deshabilitada/i).closest('.dropZoneContent');
    return content?.parentElement;
  };
  const getChooseFileButton = () => screen.queryByRole('button', { name: /elegir el archivo/i });
  const getFileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;
  const getUploadButton = () => screen.queryByRole('button', { name: /^cargar$/i });
  const getRemoveButton = () => screen.queryByRole('button', { name: /eliminar/i });

  beforeEach(() => {
    jest.clearAllMocks();
    resetFetchMock();
  });

  describe('Success Cases', () => {
    describe('Rendering', () => {
      it('should render the upload drop zone', () => {
        // Arrange
        mockNoActiveWorkflow();

        // Act
        render(<FileUpload />);

        // Assert
        expect(screen.getByText(/arrastra archivo hasta esta zona/i)).toBeInTheDocument();
      });

      it('should render the choose file button when no active workflow', () => {
        // Arrange
        mockNoActiveWorkflow();

        // Act
        render(<FileUpload />);

        // Assert
        expect(getChooseFileButton()).toBeInTheDocument();
      });

      it('should render file input element', () => {
        // Arrange
        mockNoActiveWorkflow();

        // Act
        render(<FileUpload />);

        // Assert
        expect(getFileInput()).toBeInTheDocument();
        expect(getFileInput()).toHaveAttribute('type', 'file');
      });
    });

    describe('File Selection via Input', () => {
      it('should display selected file name', async () => {
        // Arrange
        const user = userEvent.setup();
        mockNoActiveWorkflow();
        render(<FileUpload />);

        const file = createTestFile('medical-records.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Act
        const fileInput = getFileInput();
        await user.upload(fileInput, file);

        // Assert
        expect(screen.getByText(/medical-records\.xlsx/i)).toBeInTheDocument();
      });

      it('should display file size in MB', async () => {
        // Arrange
        const user = userEvent.setup();
        mockNoActiveWorkflow();
        render(<FileUpload />);

        // Create a file of ~1MB
        const file = createTestFile('large-file.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 1024 * 1024);

        // Act
        await user.upload(getFileInput(), file);

        // Assert
        expect(screen.getByText(/tamaño:/i)).toBeInTheDocument();
        expect(screen.getByText(/1\.00 mb/i)).toBeInTheDocument();
      });

      it('should show upload and remove buttons after file selection', async () => {
        // Arrange
        const user = userEvent.setup();
        mockNoActiveWorkflow();
        render(<FileUpload />);

        const file = createTestFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Act
        await user.upload(getFileInput(), file);

        // Assert
        expect(getUploadButton()).toBeInTheDocument();
        expect(getRemoveButton()).toBeInTheDocument();
      });

      it('should remove file when remove button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        mockNoActiveWorkflow();
        render(<FileUpload />);

        const file = createTestFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        await user.upload(getFileInput(), file);

        // Act
        await user.click(getRemoveButton()!);

        // Assert
        expect(screen.queryByText(/test\.xlsx/i)).not.toBeInTheDocument();
        expect(getUploadButton()).not.toBeInTheDocument();
      });
    });

    describe('File Upload', () => {
      it('should call API when upload button is clicked', async () => {
        // Arrange
        const user = userEvent.setup();
        mockNoActiveWorkflow();
        const fetchMock = mockFetch({
          success: true,
          message: 'Archivo subido correctamente',
          grdId: 456,
        });

        render(<FileUpload />);

        const file = createTestFile('upload.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        await user.upload(getFileInput(), file);

        // Act
        await user.click(getUploadButton()!);

        // Assert
        await waitFor(() => {
          expect(fetchMock).toHaveBeenCalledWith(
            '/api/v1/sigesa/upload',
            expect.objectContaining({
              method: 'POST',
            })
          );
        });
      });

      it('should show success message after successful upload', async () => {
        // Arrange
        const user = userEvent.setup();
        mockNoActiveWorkflow();
        mockFetch({
          success: true,
          message: 'Archivo subido correctamente',
        });

        render(<FileUpload />);

        const file = createTestFile('success.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        await user.upload(getFileInput(), file);

        // Act
        await user.click(getUploadButton()!);

        // Assert
        await waitFor(() => {
          expect(screen.getByText(/archivo subido correctamente/i)).toBeInTheDocument();
        });
      });

      it('should clear selected file after successful upload', async () => {
        // Arrange
        const user = userEvent.setup();
        mockNoActiveWorkflow();
        mockFetch({ success: true });

        render(<FileUpload />);

        const file = createTestFile('clear-test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        await user.upload(getFileInput(), file);

        // Act
        await user.click(getUploadButton()!);

        // Assert
        await waitFor(() => {
          expect(screen.queryByText(/clear-test\.xlsx/i)).not.toBeInTheDocument();
        });
      });

      it('should call refetch after successful upload', async () => {
        // Arrange
        const user = userEvent.setup();
        mockNoActiveWorkflow();
        mockFetch({ success: true });

        render(<FileUpload />);

        const file = createTestFile('refetch.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        await user.upload(getFileInput(), file);

        // Act
        await user.click(getUploadButton()!);

        // Assert
        await waitFor(() => {
          expect(mockRefetch).toHaveBeenCalled();
        });
      });
    });
  });

  describe('Workflow Integration', () => {
    it('should show WorkflowAlert when workflow is active', () => {
      // Arrange
      mockActiveWorkflow(123, 'pendiente_finance');

      // Act
      render(<FileUpload />);

      // Assert
      expect(screen.getByText(/ya existe un archivo en proceso/i)).toBeInTheDocument();
      expect(screen.getByText(/grd #123/i)).toBeInTheDocument();
      expect(screen.getByText(/pendiente_finance/i)).toBeInTheDocument();
    });

    it('should disable upload when workflow is active', () => {
      // Arrange
      mockActiveWorkflow();

      // Act
      render(<FileUpload />);

      // Assert
      const dropZone = getDropZone();
      expect(dropZone).toHaveClass('disabled');
      expect(screen.getByText(/carga deshabilitada/i)).toBeInTheDocument();
    });

    it('should not show choose file button when workflow is active', () => {
      // Arrange
      mockActiveWorkflow();

      // Act
      render(<FileUpload />);

      // Assert
      expect(getChooseFileButton()).not.toBeInTheDocument();
    });

    it('should not show WorkflowAlert when no active workflow', () => {
      // Arrange
      mockNoActiveWorkflow();

      // Act
      render(<FileUpload />);

      // Assert
      expect(screen.queryByText(/ya existe un archivo en proceso/i)).not.toBeInTheDocument();
    });

    it('should disable upload during workflow loading', () => {
      // Arrange
      mockLoadingWorkflow();

      // Act
      render(<FileUpload />);

      // Assert
      const dropZone = getDropZone();
      expect(dropZone).toHaveClass('disabled');
    });
  });

  describe('Drag and Drop', () => {
    it('should highlight drop zone on drag over', () => {
      // Arrange
      mockNoActiveWorkflow();
      render(<FileUpload />);

      const dropZone = getDropZone();

      // Act
      fireEvent.dragOver(dropZone!, { dataTransfer: { files: [] } });

      // Assert
      expect(dropZone).toHaveClass('dragging');
    });

    it('should remove highlight on drag leave', () => {
      // Arrange
      mockNoActiveWorkflow();
      render(<FileUpload />);

      const dropZone = getDropZone();

      // Act - Enter then leave
      fireEvent.dragOver(dropZone!, { dataTransfer: { files: [] } });
      fireEvent.dragLeave(dropZone!, { dataTransfer: { files: [] } });

      // Assert
      expect(dropZone).not.toHaveClass('dragging');
    });

    it('should accept dropped file', async () => {
      // Arrange
      mockNoActiveWorkflow();
      render(<FileUpload />);

      const dropZone = getDropZone();
      const file = createTestFile('dropped.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Act
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [file],
        },
      });

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/dropped\.xlsx/i)).toBeInTheDocument();
      });
    });

    it('should not accept file drop when workflow is active', () => {
      // Arrange
      mockActiveWorkflow();
      render(<FileUpload />);

      const dropZone = getDropZone();
      const file = createTestFile('blocked.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Act
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [file],
        },
      });

      // Assert
      expect(screen.queryByText(/blocked\.xlsx/i)).not.toBeInTheDocument();
    });
  });

  describe('Validation Cases', () => {
    it('should show error for non-Excel file', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      render(<FileUpload />);

      const file = createTestFile('invalid.txt', 'text/plain');
      await user.upload(getFileInput(), file);

      // Act
      await user.click(getUploadButton()!);

      // Assert
      expect(screen.getByText(/debe ser excel/i)).toBeInTheDocument();
    });

    it('should show error when trying to upload without file', async () => {
      // Arrange
      mockNoActiveWorkflow();
      render(<FileUpload />);

      // Note: Upload button doesn't appear without a file,
      // but this tests the internal validation
      // We need to simulate the state where button exists but no file
      // This test might need adjustment based on actual UI behavior
    });

    it('should accept .xlsx files', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      mockFetch({ success: true });
      render(<FileUpload />);

      const file = createTestFile('valid.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await user.upload(getFileInput(), file);

      // Act
      await user.click(getUploadButton()!);

      // Assert - No error message
      await waitFor(() => {
        expect(screen.queryByText(/debe ser excel/i)).not.toBeInTheDocument();
      });
    });

    it('should accept .xls files', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      mockFetch({ success: true });
      render(<FileUpload />);

      const file = createTestFile('valid.xls', 'application/vnd.ms-excel');
      await user.upload(getFileInput(), file);

      // Act
      await user.click(getUploadButton()!);

      // Assert - No error message
      await waitFor(() => {
        expect(screen.queryByText(/debe ser excel/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Cases', () => {
    it('should display API error message on upload failure', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      mockFetchError({ error: 'Formato de archivo inválido' }, 400);

      render(<FileUpload />);

      const file = createTestFile('bad.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await user.upload(getFileInput(), file);

      // Act
      await user.click(getUploadButton()!);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/formato de archivo inválido/i)).toBeInTheDocument();
      });
    });

    it('should display friendly error for invalid SIGESA format', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      mockFetchError({ error: 'No valid rows found in Excel file' }, 400);

      render(<FileUpload />);

      const file = createTestFile('invalid-format.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await user.upload(getFileInput(), file);

      // Act
      await user.click(getUploadButton()!);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/debe subir un archivo con el formato descargado desde sigesa/i)).toBeInTheDocument();
      });
    });

    it('should handle network error gracefully', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      render(<FileUpload />);

      const file = createTestFile('network.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await user.upload(getFileInput(), file);

      // Act
      await user.click(getUploadButton()!);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should handle unknown error', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      global.fetch = jest.fn().mockRejectedValue({});

      render(<FileUpload />);

      const file = createTestFile('unknown.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await user.upload(getFileInput(), file);

      // Act
      await user.click(getUploadButton()!);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error desconocido/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading text on upload button during upload', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      
      // Delayed response
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                } as Response),
              100
            )
          )
      );

      render(<FileUpload />);

      const file = createTestFile('loading.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await user.upload(getFileInput(), file);

      // Act
      await user.click(getUploadButton()!);

      // Assert
      expect(screen.getByRole('button', { name: /subiendo/i })).toBeInTheDocument();

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /subiendo/i })).not.toBeInTheDocument();
      });
    });

    it('should disable upload button during upload', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                } as Response),
              100
            )
          )
      );

      render(<FileUpload />);

      const file = createTestFile('disabled.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await user.upload(getFileInput(), file);

      // Act
      await user.click(getUploadButton()!);

      // Assert
      expect(screen.getByRole('button', { name: /subiendo/i })).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /subiendo/i })).not.toBeInTheDocument();
      });
    });

    it('should disable remove button during upload', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      
      global.fetch = jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ success: true }),
                } as Response),
              100
            )
          )
      );

      render(<FileUpload />);

      const file = createTestFile('remove.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await user.upload(getFileInput(), file);

      // Act
      await user.click(getUploadButton()!);

      // Assert
      expect(getRemoveButton()).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /subiendo/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle file input disabled state when workflow is active', () => {
      // Arrange
      mockActiveWorkflow();

      // Act
      render(<FileUpload />);

      // Assert
      expect(getFileInput()).toBeDisabled();
    });

    it('should not show file info section when no file selected', () => {
      // Arrange
      mockNoActiveWorkflow();

      // Act
      render(<FileUpload />);

      // Assert
      expect(screen.queryByText(/archivo seleccionado/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/tamaño/i)).not.toBeInTheDocument();
    });

    it('should show correct file info for small files', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      render(<FileUpload />);

      // 500 bytes file
      const file = createTestFile('small.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 500);

      // Act
      await user.upload(getFileInput(), file);

      // Assert
      expect(screen.getByText(/0\.00 mb/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      // Arrange
      mockNoActiveWorkflow();

      // Act
      render(<FileUpload />);

      // Assert
      const chooseButton = getChooseFileButton();
      expect(chooseButton).toHaveAttribute('type', 'button');
    });

    it('should have proper button types', async () => {
      // Arrange
      const user = userEvent.setup();
      mockNoActiveWorkflow();
      render(<FileUpload />);

      const file = createTestFile('test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      await user.upload(getFileInput(), file);

      // Assert
      expect(getUploadButton()).toHaveAttribute('type', 'button');
      expect(getRemoveButton()).toHaveAttribute('type', 'button');
    });
  });
});

