import { GET } from '@/app/api/v1/grd/[grdId]/rows/route';
import { createMockNextRequest, getResponseJson, createMockParams } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockGrdRow, createMockEpisodioAT, createMockAjuste } from '../utils/fixtures';

let mockSupabaseInstance: MockSupabaseClient;

jest.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockSupabaseInstance;
  },
}));

describe('GET /api/v1/grd/[grdId]/rows', () => {
  beforeEach(() => {
    const grdFilas = [
      createMockGrdRow({ id: 1, episodio: 1001, id_grd_oficial: 1 }),
      createMockGrdRow({ id: 2, episodio: 1002, id_grd_oficial: 1 }),
      createMockGrdRow({ id: 3, episodio: 1003, id_grd_oficial: 2 }),
    ];

    const episodioAT = [
      createMockEpisodioAT({ id: 1, n_episodio: 1001, id_AT: 1 }),
      createMockEpisodioAT({ id: 2, n_episodio: 1002, id_AT: 2 }),
    ];

    const ajustes = [
      createMockAjuste({ id: 1, codigo: 'AT001', AT: 'Ventilación Mecánica', valor: 50000 }),
      createMockAjuste({ id: 2, codigo: 'AT002', AT: 'Diálisis', valor: 30000 }),
    ];

    mockSupabaseInstance = createMockSupabaseClient({
      grd_fila: grdFilas,
      episodio_AT: episodioAT,
      ajustes_tecnologias: ajustes,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return paginated GRD rows for specific GRD document', async () => {
      // Arrange
      const grdId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/grd/${grdId}/rows`,
        searchParams: { page: '1', pageSize: '10' },
      });
      const params = createMockParams({ grdId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('page');
      expect(data).toHaveProperty('pageSize');
      expect(data).toHaveProperty('totalPages');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return only rows belonging to specified GRD document', async () => {
      // Arrange
      const grdId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/grd/${grdId}/rows`,
      });
      const params = createMockParams({ grdId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      // All returned rows should belong to the specified GRD
      data.data.forEach((row: any) => {
        expect(row.id_grd_oficial).toBe(1);
      });
    });

    it('should return rows with correct structure', async () => {
      // Arrange
      const grdId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/grd/${grdId}/rows`,
      });
      const params = createMockParams({ grdId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.data.length).toBeGreaterThan(0);
      // Verify row has expected GRD fields
      expect(data.data[0]).toHaveProperty('id');
      expect(data.data[0]).toHaveProperty('episodio');
      expect(data.data[0]).toHaveProperty('validado');
      expect(data.data[0]).toHaveProperty('centro');
      // Note: episodio_AT joins are not simulated in the mock (external Supabase behavior)
    });

    it('should support custom pagination parameters', async () => {
      // Arrange
      const grdId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/grd/${grdId}/rows`,
        searchParams: { page: '1', pageSize: '5' },
      });
      const params = createMockParams({ grdId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(5);
    });
  });

  describe('Validation Cases', () => {
    it('should reject invalid grdId parameter (non-numeric)', async () => {
      // Arrange
      const grdId = 'invalid';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/grd/${grdId}/rows`,
      });
      const params = createMockParams({ grdId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Invalid GRD ID');
    });

    it('should reject invalid grdId parameter (negative)', async () => {
      // Arrange
      const grdId = '-1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/grd/${grdId}/rows`,
      });
      const params = createMockParams({ grdId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should sanitize negative page parameter to default (1)', async () => {
      // Arrange
      const grdId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/grd/${grdId}/rows`,
        searchParams: { page: '-1' },
      });
      const params = createMockParams({ grdId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert - Page is sanitized to 1 by getPaginationParams
      expect(response.status).toBe(200);
      expect(data.page).toBe(1);
    });

    it('should clamp pageSize exceeding max to 100', async () => {
      // Arrange
      const grdId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/grd/${grdId}/rows`,
        searchParams: { pageSize: '101' },
      });
      const params = createMockParams({ grdId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert - PageSize is clamped to 100 by getPaginationParams
      expect(response.status).toBe(200);
      expect(data.pageSize).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array when GRD document has no rows', async () => {
      // Arrange - Use a GRD ID that doesn't exist in fixtures
      const grdId = '999';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/grd/${grdId}/rows`,
      });
      const params = createMockParams({ grdId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should handle pagination beyond available data', async () => {
      // Arrange
      const grdId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/grd/${grdId}/rows`,
        searchParams: { page: '100', pageSize: '10' },
      });
      const params = createMockParams({ grdId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
    });
  });

  describe('Error Cases', () => {
    it('should handle database errors', async () => {
      // Arrange
      mockSupabaseInstance = {
        from: () => ({
          select: () => ({
            eq: () => ({
              order: () => ({
                range: () => Promise.resolve({
                  data: null,
                  error: new Error('Database error'),
                  count: null,
                }),
              }),
            }),
          }),
        }),
      } as any;

      const grdId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/grd/${grdId}/rows`,
      });
      const params = createMockParams({ grdId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
});
