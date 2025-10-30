/**
 * Test Suite: PUT /api/v1/grd/rows/[episodio]
 *
 * Tests the GRD row update endpoint that updates a specific
 * GRD row by episode number.
 */

import { PUT } from '@/app/api/v1/grd/rows/[episodio]/route';
import { createMockNextRequest, createMockParams, getResponseJson, fixtures } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';


// Mock the Supabase client module
jest.mock('@/lib/supabase', () => ({
  get supabase() {
    return mockSupabaseInstance;
  },
}));

let mockSupabaseInstance: MockSupabaseClient;

describe('PUT /api/v1/grd/rows/[episodio]', () => {
  beforeEach(() => {
    const mockInstance = createMockSupabaseClient({
      grd_fila: fixtures.grdFilas,
    });

    mockSupabaseInstance = mockInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should update a GRD row successfully', async () => {
      // Arrange
      const episodio = '1001';
      const updateData = {
        validado: 'NO',
        centro: 'Hospital Updated',
        n_folio: 99999,
      };

      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: updateData,
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.episodio).toBe(1001);
      expect(data.validado).toBe('NO');
      expect(data.centro).toBe('Hospital Updated');
      expect(data.n_folio).toBe(99999);
    });

    it('should update only specified fields (partial update)', async () => {
      // Arrange
      const episodio = '1001';
      const updateData = {
        validado: 'NO',
      };

      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: updateData,
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.validado).toBe('NO');
      expect(data.centro).toBe('Hospital Central'); // Original value unchanged
    });

    it('should update multiple fields', async () => {
      // Arrange
      const episodio = '1001';
      const updateData = {
        validado: 'NO',
        centro: 'New Hospital',
        monto_AT: 75000,
        dias_estadia: 7,
        'IR-GRD': 999,
      };

      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: updateData,
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.validado).toBe('NO');
      expect(data.centro).toBe('New Hospital');
      expect(data.monto_AT).toBe(75000);
      expect(data.dias_estadia).toBe(7);
      expect(data['IR-GRD']).toBe(999);
    });

    it('should handle null values in update', async () => {
      // Arrange
      const episodio = '1001';
      const updateData = {
        monto_AT: null,
        AT_detalle: null,
      };

      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: updateData,
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.monto_AT).toBeNull();
      expect(data.AT_detalle).toBeNull();
    });
  });

  describe('Validation Cases', () => {
    it('should reject invalid episodio parameter (non-numeric)', async () => {
      // Arrange
      const episodio = 'abc';
      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: { validado: 'NO' },
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should allow unknown fields (extra keys are ignored by schema)', async () => {
      // Arrange
      const episodio = '1001';
      const dataWithExtraFields = {
        validado: 'NO',
        invalid_field: 'value',  // Extra field, will be ignored
        another_invalid: 123,     // Extra field, will be ignored
      };

      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: dataWithExtraFields,
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.validado).toBe('NO');
      // Extra fields should not appear in response
      expect(data).not.toHaveProperty('invalid_field');
      expect(data).not.toHaveProperty('another_invalid');
    });

    it('should reject invalid field types', async () => {
      // Arrange
      const episodio = '1001';
      const invalidData = {
        n_folio: 'not-a-number', // Should be number
        AT: 'not-a-boolean', // Should be boolean
      };

      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: invalidData,
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('should allow empty request body (all fields are optional)', async () => {
      // Arrange
      const episodio = '1001';
      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: {},
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert - Empty body is valid since all fields are optional
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('episodio');
      expect(data.episodio).toBe(1001);
    });
  });

  describe('Not Found Cases', () => {
    it('should return 404 when GRD row does not exist', async () => {
      // Arrange
      const episodio = '9999';
      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: { validado: 'NO' },
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large numeric values', async () => {
      // Arrange
      const episodio = '1001';
      const updateData = {
        monto_final: 9999999999,
        valor_GRD: 8888888888,
      };

      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: updateData,
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.monto_final).toBe(9999999999);
      expect(data.valor_GRD).toBe(8888888888);
    });

    it('should handle special characters in string fields', async () => {
      // Arrange
      const episodio = '1001';
      const updateData = {
        nombre_paciente: "O'Brien-González",
        centro: 'Hospital São Paulo & Associates',
        documentacion: 'Completa (revisión 2024/01)',
      };

      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: updateData,
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.nombre_paciente).toBe("O'Brien-González");
      expect(data.centro).toBe('Hospital São Paulo & Associates');
    });
  });

  describe('Error Cases', () => {
    it('should handle database errors', async () => {
      // Arrange
      mockSupabaseInstance = {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({
                data: null,
                error: new Error('Database error'),
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () => Promise.resolve({
                  data: null,
                  error: new Error('Update failed'),
                }),
              }),
            }),
          }),
        }),
      } as any;

      const episodio = '1001';
      const request = createMockNextRequest({
        method: 'PUT',
        url: `http://localhost:3000/api/v1/grd/rows/${episodio}`,
        body: { validado: 'NO' },
      });
      const params = createMockParams({ episodio });

      // Act
      const response = await PUT(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(500);
      expect(data).toHaveProperty('error');
    });
  });
});
