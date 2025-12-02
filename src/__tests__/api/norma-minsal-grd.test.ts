/**
 * Test Suite: GET /api/v1/norma-minsal/[grd]
 *
 * Tests the endpoint that returns a specific norma MINSAL record by GRD.
 */

import { GET } from '@/app/api/v1/norma-minsal/[grd]/route';
import { createMockNextRequest, createMockParams, getResponseJson } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockNormaMinsal } from '../utils/fixtures';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockSupabaseInstance;
  },
}));

let mockSupabaseInstance: MockSupabaseClient;

describe('GET /api/v1/norma-minsal/[grd]', () => {
  beforeEach(() => {
    mockSupabaseInstance = createMockSupabaseClient({
      norma_minsal: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return a specific norma MINSAL record by GRD', async () => {
      // Arrange
      const normaRecords = [
        { id: 1, GRD: 540, 'IR-GRD': 540, peso: 1.5 },
        { id: 2, GRD: 541, 'IR-GRD': 541, peso: 2.0 },
        { id: 3, GRD: 542, 'IR-GRD': 542, peso: 2.5 },
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        norma_minsal: normaRecords,
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal/540',
      });

      const params = createMockParams({ grd: '540' });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.GRD).toBe(540);
      expect(data.peso).toBe(1.5);
    });

    it('should return correct norma for different GRD values', async () => {
      // Arrange
      const normaRecords = [
        { id: 1, GRD: 100, 'IR-GRD': 100, peso: 0.5 },
        { id: 2, GRD: 200, 'IR-GRD': 200, peso: 1.0 },
        { id: 3, GRD: 300, 'IR-GRD': 300, peso: 1.5 },
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        norma_minsal: normaRecords,
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal/200',
      });

      const params = createMockParams({ grd: '200' });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.GRD).toBe(200);
      expect(data.peso).toBe(1.0);
    });
  });

  describe('Validation Cases', () => {
    it('should reject invalid GRD parameter (non-numeric)', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal/invalid',
      });

      const params = createMockParams({ grd: 'invalid' });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid GRD parameter');
    });

    it('should reject negative GRD parameter', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal/-1',
      });

      const params = createMockParams({ grd: '-1' });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid GRD parameter');
    });

    it('should reject zero GRD parameter', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal/0',
      });

      const params = createMockParams({ grd: '0' });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid GRD parameter');
    });
  });

  describe('Not Found Cases', () => {
    it('should return 404 when GRD not found', async () => {
      // Arrange
      const normaRecords = [
        { id: 1, GRD: 540, 'IR-GRD': 540, peso: 1.5 },
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        norma_minsal: normaRecords,
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal/999',
      });

      const params = createMockParams({ grd: '999' });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Norma minsal not found');
    });

    it('should return 404 when database is empty', async () => {
      // Arrange
      mockSupabaseInstance = createMockSupabaseClient({
        norma_minsal: [],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal/540',
      });

      const params = createMockParams({ grd: '540' });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Norma minsal not found');
    });
  });

  describe('Error Cases', () => {
    it('should handle database errors', async () => {
      // Arrange
      mockSupabaseInstance = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: null,
                error: new Error('Database error'),
              }),
            }),
          }),
        }),
      } as any;

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/norma-minsal/540',
      });

      const params = createMockParams({ grd: '540' });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      // The route returns 404 when data is null (even with error)
      expect(response.status).toBe(404);
    });
  });
});
