/**
 * Test Suite: Episode Ajustes Endpoints
 *
 * Tests for:
 * - POST /api/v1/grd/rows/[episodio]/ajustes
 * - DELETE /api/v1/grd/rows/[episodio]/ajustes/[ajusteId]
 */

import { POST } from '@/app/api/v1/grd/rows/[episodio]/ajustes/route';
import { DELETE } from '@/app/api/v1/grd/rows/[episodio]/ajustes/[ajusteId]/route';
import { createMockNextRequest, createMockParams, getResponseJson, fixtures } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';

jest.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockSupabaseInstance;
  },
}));

let mockSupabaseInstance: MockSupabaseClient;

describe('POST /api/v1/grd/rows/[episodio]/ajustes', () => {
  beforeEach(() => {
    const mockInstance = createMockSupabaseClient({
      grd_fila: fixtures.grdFilas,
      ajustes_tecnologias: fixtures.ajustes,
      episodio_AT: fixtures.episodioAT,
    });

    mockSupabaseInstance = mockInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should add ajuste to episode successfully', async () => {
      // Arrange
      const episodio = '1001';
      const requestBody = { id_AT: 3 };

      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes`,
        body: requestBody,
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(201);
      expect(data).toHaveProperty('id');
      expect(data.n_episodio).toBe(1001);
      expect(data.id_AT).toBe(3);
    });

    it('should allow multiple ajustes for same episode', async () => {
      // Arrange
      const episodio = '1002';
      const ajustes = [{ id_AT: 1 }, { id_AT: 2 }, { id_AT: 3 }];
      const initialCount = mockSupabaseInstance.getMockData('episodio_AT').length;

      // Act
      for (const ajuste of ajustes) {
        const request = createMockNextRequest({
          method: 'POST',
          url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes`,
          body: ajuste,
        });
        const params = createMockParams({ episodio });

        const response = await POST(request, { params });
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(201);
        expect(data.n_episodio).toBe(1002);
        expect(data.id_AT).toBe(ajuste.id_AT);
      }

      // Verify all 3 ajustes were actually stored in the mock database
      const finalCount = mockSupabaseInstance.getMockData('episodio_AT').length;
      expect(finalCount).toBe(initialCount + 3);

      // Verify the stored data contains our inserted records
      const storedData = mockSupabaseInstance.getMockData('episodio_AT');
      const addedRecords = storedData.filter(record => record.n_episodio === 1002);
      expect(addedRecords.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Validation Cases', () => {
    it('should reject invalid episodio parameter', async () => {
      // Arrange
      const episodio = 'invalid';
      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes`,
        body: { id_AT: 1 },
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should reject missing id_AT in request body', async () => {
      // Arrange
      const episodio = '1001';
      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes`,
        body: {},
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should reject invalid id_AT (negative)', async () => {
      // Arrange
      const episodio = '1001';
      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes`,
        body: { id_AT: -1 },
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should reject invalid id_AT (non-numeric)', async () => {
      // Arrange
      const episodio = '1001';
      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes`,
        body: { id_AT: 'abc' },
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });

  describe('Not Found Cases', () => {
    it('should return 404 when GRD row does not exist', async () => {
      // Arrange
      const episodio = '9999';
      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes`,
        body: { id_AT: 1 },
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    it('should return 404 when ajuste tecnología does not exist', async () => {
      // Arrange
      const episodio = '1001';
      const request = createMockNextRequest({
        method: 'POST',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes`,
        body: { id_AT: 9999 },
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });
  });
});

describe('DELETE /api/v1/grd/rows/[episodio]/ajustes/[ajusteId]', () => {
  beforeEach(() => {
    const mockInstance = createMockSupabaseClient({
      episodio_AT: fixtures.episodioAT,
    });

    mockSupabaseInstance = mockInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should delete ajuste from episode successfully', async () => {
      // Arrange
      const episodio = '1001';
      const ajusteId = '1';

      const request = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes/${ajusteId}`,
      });
      const params = createMockParams({ episodio, ajusteId });

      // Act
      const response = await DELETE(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('message');
      expect(data.message).toContain('deleted');
    });

    it('should remove ajuste from database', async () => {
      // Arrange
      const episodio = '1001';
      const ajusteId = '1';
      const initialCount = mockSupabaseInstance.getMockData('episodio_AT').length;

      const request = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes/${ajusteId}`,
      });
      const params = createMockParams({ episodio, ajusteId });

      // Act
      const response = await DELETE(request, { params });

      // Assert
      expect(response.status).toBe(200);

      // Verify the ajuste was actually removed from the mock database
      const finalCount = mockSupabaseInstance.getMockData('episodio_AT').length;
      expect(finalCount).toBe(initialCount - 1);

      // Verify the specific record no longer exists
      const storedData = mockSupabaseInstance.getMockData('episodio_AT');
      const deletedRecord = storedData.find(record => record.id === 1);
      expect(deletedRecord).toBeUndefined();
    });
  });

  describe('Validation Cases', () => {
    it('should reject invalid episodio parameter', async () => {
      // Arrange
      const episodio = 'invalid';
      const ajusteId = '1';

      const request = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes/${ajusteId}`,
      });
      const params = createMockParams({ episodio, ajusteId });

      // Act
      const response = await DELETE(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should reject invalid ajusteId parameter', async () => {
      // Arrange
      const episodio = '1001';
      const ajusteId = 'invalid';

      const request = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes/${ajusteId}`,
      });
      const params = createMockParams({ episodio, ajusteId });

      // Act
      const response = await DELETE(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should reject negative ajusteId', async () => {
      // Arrange
      const episodio = '1001';
      const ajusteId = '-1';

      const request = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes/${ajusteId}`,
      });
      const params = createMockParams({ episodio, ajusteId });

      // Act
      const response = await DELETE(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });
  });

  describe('Not Found Cases', () => {
    it('should return 404 when ajuste does not exist', async () => {
      // Arrange
      const episodio = '1001';
      const ajusteId = '9999';

      const request = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes/${ajusteId}`,
      });
      const params = createMockParams({ episodio, ajusteId });

      // Act
      const response = await DELETE(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });

    it('should return 404 when episodio does not match', async () => {
      // Arrange
      const episodio = '9999'; // Different episode
      const ajusteId = '1'; // Valid ajuste ID but for different episode

      const request = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes/${ajusteId}`,
      });
      const params = createMockParams({ episodio, ajusteId });

      // Act
      const response = await DELETE(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle deletion of last ajuste for episode', async () => {
      // Arrange
      const mockInstance = createMockSupabaseClient({
        episodio_AT: [{ id: 999, n_episodio: 5555, id_AT: 1 }],
      });
      mockSupabaseInstance = mockInstance;

      const episodio = '5555';
      const ajusteId = '999';

      const request = createMockNextRequest({
        method: 'DELETE',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}/ajustes/${ajusteId}`,
      });
      const params = createMockParams({ episodio, ajusteId });

      // Act
      const response = await DELETE(request, { params });
      await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
    });
  });
});
