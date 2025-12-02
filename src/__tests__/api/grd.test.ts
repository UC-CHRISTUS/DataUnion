/**
 * Test Suite: GET /api/v1/grd
 *
 * Tests the GRD listing endpoint that returns paginated
 * GRD oficial documents (metadata only).
 */

import { GET } from '@/app/api/v1/grd/route';
import { createMockNextRequest, getResponseJson, expectPaginatedResponse } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockGrdOficial } from '../utils/fixtures';

jest.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockSupabaseInstance;
  },
}));

let mockSupabaseInstance: MockSupabaseClient;

describe('GET /api/v1/grd', () => {
  beforeEach(() => {
    const grdOficial = [
      createMockGrdOficial({ id: 1, created_at: '2025-01-15T10:00:00Z' }),
      createMockGrdOficial({ id: 2, created_at: '2025-01-16T10:00:00Z' }),
    ];

    mockSupabaseInstance = createMockSupabaseClient({
      grd_oficial: grdOficial,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return paginated GRD documents', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expectPaginatedResponse(data);
    });

    it('should return GRD documents ordered by id descending', async () => {
      // Arrange
      const grdDocs = [
        createMockGrdOficial({ id: 3, created_at: '2025-01-17T10:00:00Z' }),
        createMockGrdOficial({ id: 2, created_at: '2025-01-16T10:00:00Z' }),
        createMockGrdOficial({ id: 1, created_at: '2025-01-15T10:00:00Z' }),
      ];
      mockSupabaseInstance = createMockSupabaseClient({
        grd_oficial: grdDocs,
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(data.data[0].id).toBe(3);
      expect(data.data[1].id).toBe(2);
    });

    it('should handle custom pagination parameters', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd',
        searchParams: { page: '2', pageSize: '5' },
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.page).toBe(2);
      expect(data.pageSize).toBe(5);
    });
  });

  describe('Validation Cases', () => {
    it('should sanitize negative page parameter to default (1)', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd',
        searchParams: { page: '-1' },
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert - Page is sanitized to 1 by getPaginationParams
      expect(response.status).toBe(200);
      expect(data.page).toBe(1);
    });

    it('should clamp pageSize exceeding max to 100', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd',
        searchParams: { pageSize: '101' },
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert - PageSize is clamped to 100 by getPaginationParams
      expect(response.status).toBe(200);
      expect(data.pageSize).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array when no GRD documents exist', async () => {
      // Arrange
      mockSupabaseInstance = createMockSupabaseClient({ grd_oficial: [] });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  describe('Error Cases', () => {
    it('should handle database errors', async () => {
      // Arrange
      mockSupabaseInstance = {
        from: () => ({
          select: () => ({
            order: () => ({
              range: () => Promise.resolve({
                data: null,
                error: new Error('Database error'),
                count: null,
              }),
            }),
          }),
        }),
      } as any;

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
});
