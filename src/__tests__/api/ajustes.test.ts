/**
 * Test Suite: GET /api/v1/ajustes
 *
 * Tests the ajustes (technology adjustments) endpoint that returns
 * all technology adjustments without pagination.
 */

import { GET } from '@/app/api/v1/ajustes/route';
import { createMockNextRequest, getResponseJson } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockAjuste } from '../utils/fixtures';

let mockSupabaseInstance: MockSupabaseClient;

jest.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockSupabaseInstance;
  },
}));

describe('GET /api/v1/ajustes', () => {
  beforeEach(() => {
    const ajustes = [
      createMockAjuste({ id: 1, codigo: 'AT001', AT: 'Ventilación Mecánica', valor: 50000 }),
      createMockAjuste({ id: 2, codigo: 'AT002', AT: 'Diálisis', valor: 30000 }),
      createMockAjuste({ id: 3, codigo: 'AT003', AT: 'Tomografía', valor: 20000 }),
    ];

    mockSupabaseInstance = createMockSupabaseClient({
      ajustes_tecnologias: ajustes,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return all ajustes without pagination', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/ajustes',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('codigo');
      expect(data[0]).toHaveProperty('AT');
      expect(data[0]).toHaveProperty('valor');
    });

    it('should return ajustes ordered by id', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/ajustes',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(data[0].id).toBe(1);
      expect(data[1].id).toBe(2);
      expect(data[2].id).toBe(3);
    });

    it('should return empty array when no ajustes exist', async () => {
      // Arrange
      mockSupabaseInstance.setMockData('ajustes_tecnologias', []);
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/ajustes',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });
  });

  describe('Data Structure Validation', () => {
    it('should return ajustes with correct structure', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/ajustes',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      data.forEach((ajuste: any) => {
        expect(ajuste).toMatchObject({
          id: expect.any(Number),
          codigo: expect.any(String),
          AT: expect.any(String),
          valor: expect.any(Number),
        });
      });
    });

    it('should return complete ajuste data', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/ajustes',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(data[0]).toEqual({
        id: 1,
        codigo: 'AT001',
        AT: 'Ventilación Mecánica',
        valor: 50000,
      });
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
              error: new Error('Database connection failed'),
            }),
          }),
        }),
      } as any;

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/ajustes',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });

  describe('Performance Cases', () => {
    it('should handle large number of ajustes', async () => {
      // Arrange
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        codigo: `AT${String(i + 1).padStart(3, '0')}`,
        AT: `Technology ${i + 1}`,
        valor: (i + 1) * 1000,
      }));

      mockSupabaseInstance = createMockSupabaseClient({
        ajustes_tecnologias: largeDataset,
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/ajustes',
      });

      // Act
      const startTime = Date.now();
      const response = await GET(request);
      const data = await getResponseJson(response);
      const endTime = Date.now();

      // Assert
      expect(response.status).toBe(200);
      expect(data.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });
});
