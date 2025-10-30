/**
 * Test Suite: GET /api/v1/sigesa
 *
 * Tests the SIGESA listing endpoint that returns paginated
 * SIGESA documents (metadata only, not individual rows).
 */

import { GET } from '@/app/api/v1/sigesa/route';
import { createMockNextRequest, getResponseJson, fixtures, expectPaginatedResponse } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';


// Mock the Supabase client module
jest.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockSupabaseInstance;
  },
}));

let mockSupabaseInstance: MockSupabaseClient;

describe('GET /api/v1/sigesa', () => {
  beforeEach(() => {
    // Create fresh mock Supabase client with test data
    const mockInstance = createMockSupabaseClient({
      sigesa: fixtures.sigesa,
    });

    mockSupabaseInstance = mockInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases - Default Pagination', () => {
    it('should return paginated SIGESA documents with default params', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/sigesa',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expectPaginatedResponse(data);
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(10);
    });

    it('should return SIGESA documents ordered by id descending', async () => {
      // Arrange
      const mockInstance = createMockSupabaseClient({
        sigesa: [
          { id: 3, created_at: '2025-01-17T10:00:00Z' },
          { id: 2, created_at: '2025-01-16T10:00:00Z' },
          { id: 1, created_at: '2025-01-15T10:00:00Z' },
        ],
      });
      mockSupabaseInstance = mockInstance;

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/sigesa',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(data.data[0].id).toBe(3);
      expect(data.data[1].id).toBe(2);
      expect(data.data[2].id).toBe(1);
    });
  });

  describe('Success Cases - Custom Pagination', () => {
    it('should handle custom page parameter', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/sigesa',
        searchParams: { page: '2' },
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.page).toBe(2);
    });

    it('should handle custom pageSize parameter', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/sigesa',
        searchParams: { pageSize: '20' },
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.pageSize).toBe(20);
    });

    it('should handle both page and pageSize parameters', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/sigesa',
        searchParams: { page: '3', pageSize: '5' },
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.page).toBe(3);
      expect(data.pageSize).toBe(5);
    });
  });

  describe('Validation Cases', () => {
    it('should sanitize negative page parameter to default (1)', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/sigesa',
        searchParams: { page: '-1' },
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert - Page is sanitized to 1 by getPaginationParams
      expect(response.status).toBe(200);
      expect(data.page).toBe(1);
    });

    it('should sanitize zero page parameter to default (1)', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/sigesa',
        searchParams: { page: '0' },
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
        url: 'http://localhost:3000/api/v1/sigesa',
        searchParams: { pageSize: '101' },
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert - PageSize is clamped to 100 by getPaginationParams
      expect(response.status).toBe(200);
      expect(data.pageSize).toBe(100);
    });

    it('should reject non-numeric page parameter (parseInt returns NaN, validation fails)', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/sigesa',
        searchParams: { page: 'abc' },
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert - Non-numeric page: parseInt('abc') -> NaN, Math.max(1, NaN) -> NaN, validation fails
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });

  describe('Edge Cases', () => {
    it('should return empty data array when no SIGESA documents exist', async () => {
      // Arrange
      const mockInstance = createMockSupabaseClient({ sigesa: [] });
      mockSupabaseInstance = mockInstance;
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/sigesa',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.totalPages).toBe(0);
    });

    it('should handle page beyond total pages', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/sigesa',
        searchParams: { page: '999' },
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.page).toBe(999);
    });
  });

  describe('Pagination Calculation', () => {
    it('should calculate totalPages correctly', async () => {
      // Arrange
      const manyRecords = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        created_at: new Date().toISOString(),
      }));
      const mockInstance = createMockSupabaseClient({ sigesa: manyRecords });
      mockSupabaseInstance = mockInstance;

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/sigesa',
        searchParams: { pageSize: '10' },
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(data.total).toBe(25);
      expect(data.totalPages).toBe(3); // 25 / 10 = 3 pages
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
        url: 'http://localhost:3000/api/v1/sigesa',
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
