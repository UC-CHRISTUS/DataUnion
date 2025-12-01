/**
 * Test Suite: GET /api/v1/grd/active-workflow
 *
 * Tests the endpoint that checks for active workflow files.
 * Only one file can be in active workflow at a time.
 */

import { GET } from '@/app/api/v1/grd/active-workflow/route';
import { createMockNextRequest, getResponseJson } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockGrdRow } from '../utils/fixtures';

// Mock the supabase admin client
jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => mockSupabaseInstance,
}));

let mockSupabaseInstance: MockSupabaseClient;

describe('GET /api/v1/grd/active-workflow', () => {
  beforeEach(() => {
    mockSupabaseInstance = createMockSupabaseClient({
      grd_fila: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return hasActiveWorkflow: false when no files are in active workflow', async () => {
      // Arrange
      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: [],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/active-workflow',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.hasActiveWorkflow).toBe(false);
      expect(data.grdId).toBeNull();
      expect(data.episodio).toBeNull();
      expect(data.estado).toBeNull();
    });

    it('should return hasActiveWorkflow: true when file is in borrador_encoder state', async () => {
      // Arrange
      const activeFile = createMockGrdRow({
        id: 1,
        id_grd_oficial: 100,
        episodio: 1001,
        estado: 'borrador_encoder',
      });

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: [activeFile],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/active-workflow',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.hasActiveWorkflow).toBe(true);
      expect(data.grdId).toBe(100);
      expect(data.episodio).toBe(1001);
      expect(data.estado).toBe('borrador_encoder');
    });

    it('should return hasActiveWorkflow: true when file is in pendiente_finance state', async () => {
      // Arrange
      const activeFile = createMockGrdRow({
        id: 1,
        id_grd_oficial: 101,
        episodio: 1002,
        estado: 'pendiente_finance',
      });

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: [activeFile],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/active-workflow',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.hasActiveWorkflow).toBe(true);
      expect(data.estado).toBe('pendiente_finance');
    });

    it('should return hasActiveWorkflow: true when file is in borrador_finance state', async () => {
      // Arrange
      const activeFile = createMockGrdRow({
        id: 1,
        id_grd_oficial: 102,
        episodio: 1003,
        estado: 'borrador_finance',
      });

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: [activeFile],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/active-workflow',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.hasActiveWorkflow).toBe(true);
      expect(data.estado).toBe('borrador_finance');
    });

    it('should return hasActiveWorkflow: true when file is in pendiente_admin state', async () => {
      // Arrange
      const activeFile = createMockGrdRow({
        id: 1,
        id_grd_oficial: 103,
        episodio: 1004,
        estado: 'pendiente_admin',
      });

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: [activeFile],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/active-workflow',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.hasActiveWorkflow).toBe(true);
      expect(data.estado).toBe('pendiente_admin');
    });

    it('should return hasActiveWorkflow: false when files are only in exportado state', async () => {
      // Arrange - exportado does NOT block new uploads
      const exportedFile = createMockGrdRow({
        id: 1,
        id_grd_oficial: 104,
        episodio: 1005,
        estado: 'exportado',
      });

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: [exportedFile],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/active-workflow',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.hasActiveWorkflow).toBe(false);
    });

    it('should return hasActiveWorkflow: false when files are only in aprobado state', async () => {
      // Arrange - aprobado does NOT block new uploads
      const approvedFile = createMockGrdRow({
        id: 1,
        id_grd_oficial: 105,
        episodio: 1006,
        estado: 'aprobado',
      });

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: [approvedFile],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/active-workflow',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.hasActiveWorkflow).toBe(false);
    });
  });

  describe('Error Cases', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      mockSupabaseInstance = {
        from: () => ({
          select: () => ({
            in: () => ({
              limit: () => Promise.resolve({
                data: null,
                error: new Error('Database connection failed'),
              }),
            }),
          }),
        }),
      } as any;

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/active-workflow',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error al verificar workflow activo');
    });
  });
});
