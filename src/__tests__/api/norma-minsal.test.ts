/**
 * Test Suite: GET /api/v1/norma-minsal
 *
 * Tests the endpoint that returns all norma MINSAL records.
 */

import { GET } from '@/app/api/v1/norma-minsal/route';
import { createMockNextRequest, getResponseJson } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockNormaMinsal } from '../utils/fixtures';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockSupabaseInstance;
  },
}));

let mockSupabaseInstance: MockSupabaseClient;

describe('GET /api/v1/norma-minsal', () => {
  beforeEach(() => {
    mockSupabaseInstance = createMockSupabaseClient({
      norma_minsal: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return empty array when no norma records exist', async () => {
      // Arrange
      mockSupabaseInstance = createMockSupabaseClient({
        norma_minsal: [],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return all norma MINSAL records', async () => {
      // Arrange
      const normaRecords = [
        createMockNormaMinsal({ id: 1, 'IR-GRD': 540, peso: 1.5 }),
        createMockNormaMinsal({ id: 2, 'IR-GRD': 541, peso: 2.0 }),
        createMockNormaMinsal({ id: 3, 'IR-GRD': 542, peso: 2.5 }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        norma_minsal: normaRecords,
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
    });

    it('should return norma records with correct structure', async () => {
      // Arrange
      const normaRecords = [
        createMockNormaMinsal({ id: 1, 'IR-GRD': 540, peso: 1.5 }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        norma_minsal: normaRecords,
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data[0]).toHaveProperty('IR-GRD');
      expect(data[0]).toHaveProperty('peso');
    });
  });

  describe('Error Cases', () => {
    it('should handle database errors', async () => {
      // Arrange
      mockSupabaseInstance = {
        from: () => ({
          select: () => ({
            order: () => Promise.resolve({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      } as any;

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal',
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
