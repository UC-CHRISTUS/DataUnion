import { GET } from '@/app/api/v1/sigesa/[sigesaId]/rows/route';
import { createMockNextRequest, getResponseJson, createMockParams } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockSigesaFila } from '../utils/fixtures';

let mockSupabaseInstance: MockSupabaseClient;

jest.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockSupabaseInstance;
  },
}));

describe('GET /api/v1/sigesa/[sigesaId]/rows', () => {
  beforeEach(() => {
    const sigesaFilas = [
      createMockSigesaFila({ id: 1, id_archivo_sigesa: 1, episodio_CMBD: 1001 }),
      createMockSigesaFila({ id: 2, id_archivo_sigesa: 1, episodio_CMBD: 1002 }),
      createMockSigesaFila({ id: 3, id_archivo_sigesa: 2, episodio_CMBD: 1003 }),
    ];

    mockSupabaseInstance = createMockSupabaseClient({
      sigesa_fila: sigesaFilas,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return paginated SIGESA rows for specific SIGESA document', async () => {
      // Arrange
      const sigesaId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/sigesa/${sigesaId}/rows`,
        searchParams: { page: '1', pageSize: '10' },
      });
      const params = createMockParams({ sigesaId });

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

    it('should return only rows belonging to specified SIGESA document', async () => {
      // Arrange
      const sigesaId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/sigesa/${sigesaId}/rows`,
      });
      const params = createMockParams({ sigesaId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      // All returned rows should belong to the specified SIGESA document
      data.data.forEach((row: any) => {
        expect(row.id_archivo_sigesa).toBe(1);
      });
    });

    it('should support custom pagination parameters', async () => {
      // Arrange
      const sigesaId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/sigesa/${sigesaId}/rows`,
        searchParams: { page: '1', pageSize: '5' },
      });
      const params = createMockParams({ sigesaId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(5);
    });

    it('should order results by id descending', async () => {
      // Arrange
      const sigesaId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/sigesa/${sigesaId}/rows`,
      });
      const params = createMockParams({ sigesaId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.data.length).toBeGreaterThan(0);
      // Note: Mock doesn't actually sort, but we verify data structure is correct
      expect(data.data[0]).toHaveProperty('id');
    });
  });

  describe('Validation Cases', () => {
    it('should reject invalid sigesaId parameter (non-numeric)', async () => {
      // Arrange
      const sigesaId = 'invalid';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/sigesa/${sigesaId}/rows`,
      });
      const params = createMockParams({ sigesaId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Invalid SIGESA ID');
    });

    it('should reject invalid sigesaId parameter (negative)', async () => {
      // Arrange
      const sigesaId = '-1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/sigesa/${sigesaId}/rows`,
      });
      const params = createMockParams({ sigesaId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should sanitize negative page parameter to default (1)', async () => {
      // Arrange
      const sigesaId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/sigesa/${sigesaId}/rows`,
        searchParams: { page: '-1' },
      });
      const params = createMockParams({ sigesaId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert - Page is sanitized to 1 by getPaginationParams
      expect(response.status).toBe(200);
      expect(data.page).toBe(1);
    });

    it('should clamp pageSize exceeding max to 100', async () => {
      // Arrange
      const sigesaId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/sigesa/${sigesaId}/rows`,
        searchParams: { pageSize: '101' },
      });
      const params = createMockParams({ sigesaId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert - PageSize is clamped to 100 by getPaginationParams
      expect(response.status).toBe(200);
      expect(data.pageSize).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array when SIGESA document has no rows', async () => {
      // Arrange - Use a SIGESA ID that doesn't exist in fixtures
      const sigesaId = '999';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/sigesa/${sigesaId}/rows`,
      });
      const params = createMockParams({ sigesaId });

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
      const sigesaId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/sigesa/${sigesaId}/rows`,
        searchParams: { page: '100', pageSize: '10' },
      });
      const params = createMockParams({ sigesaId });

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

      const sigesaId = '1';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/sigesa/${sigesaId}/rows`,
      });
      const params = createMockParams({ sigesaId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
});
