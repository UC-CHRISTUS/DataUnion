/**
 * Integration Tests: GET /api/v1/grd/[grdId]/export
 * 
 * Tests the GRD export to Excel functionality.
 */

import { GET } from '@/app/api/v1/grd/[grdId]/export/route';
import { createMockNextRequest, createMockParams } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockGrdRow } from '../utils/fixtures';

// Mock supabase (export uses `supabase` directly, not getSupabaseAdmin)
let mockSupabaseInstance: MockSupabaseClient;

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (table: string) => mockSupabaseInstance.from(table),
  },
  getSupabaseAdmin: () => mockSupabaseInstance,
}));

describe('GET /api/v1/grd/[grdId]/export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseInstance = createMockSupabaseClient();
  });

  describe('Success Cases', () => {
    it('should export GRD rows as Excel file', async () => {
      // Arrange
      const grdRows = [
        createMockGrdRow({ 
          id: 1, 
          id_grd_oficial: 100, 
          episodio: 1001,
          validado: 'SI',
          centro: 'Hospital Test',
          'IR-GRD': 540,
        }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_oficial: [{ id: 100 }],
        grd_fila: grdRows.map(row => ({ ...row, episodio_AT: null })),
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/100/export',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(response.headers.get('Content-Disposition')).toContain('attachment');
      expect(response.headers.get('Content-Disposition')).toContain('grd-100');
    });

    it('should export multiple rows with ajustes', async () => {
      // Arrange
      const grdRows = [
        {
          ...createMockGrdRow({ id: 1, id_grd_oficial: 101, episodio: 2001 }),
          episodio_AT: [
            {
              id: 1,
              id_AT: 10,
              ajustes_tecnologias: {
                id: 10,
                codigo: 'AT001',
                AT: 'Marcapasos',
                valor: 50000,
              },
            },
          ],
        },
        {
          ...createMockGrdRow({ id: 2, id_grd_oficial: 101, episodio: 2002 }),
          episodio_AT: null,
        },
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_oficial: [{ id: 101 }],
        grd_fila: grdRows,
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/101/export',
      });

      const params = createMockParams({ grdId: '101' });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });
  });

  describe('Validation Cases', () => {
    it('should return 400 for invalid GRD ID', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/invalid/export',
      });

      const params = createMockParams({ grdId: 'invalid' });

      // Act
      const response = await GET(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid');
    });

    it('should return 400 for negative GRD ID', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/-1/export',
      });

      const params = createMockParams({ grdId: '-1' });

      // Act
      const response = await GET(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid');
    });
  });

  describe('Not Found Cases', () => {
    it('should return 404 when GRD does not exist', async () => {
      // Arrange
      mockSupabaseInstance = createMockSupabaseClient({
        grd_oficial: [],
        grd_fila: [],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/999/export',
      });

      const params = createMockParams({ grdId: '999' });

      // Act
      const response = await GET(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should return 404 when GRD exists but has no rows', async () => {
      // Arrange
      mockSupabaseInstance = createMockSupabaseClient({
        grd_oficial: [{ id: 102 }],
        grd_fila: [], // GRD exists but no rows
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/102/export',
      });

      const params = createMockParams({ grdId: '102' });

      // Act
      const response = await GET(request, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toContain('No rows found');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rows with all null optional fields', async () => {
      // Arrange
      const minimalRow = {
        id: 1,
        episodio: 3001,
        id_grd_oficial: 103,
        'IR-GRD': 100,
        validado: null,
        centro: null,
        n_folio: null,
        rut_paciente: null,
        nombre_paciente: null,
        tipo_episodio: null,
        fecha_ingreso: null,
        fecha_alta: null,
        servicios_alta: null,
        estado_rn: null,
        AT: null,
        AT_detalle: null,
        monto_AT: null,
        tipo_alta: null,
        peso: null,
        monto_rn: null,
        dias_demora_rescate_hospital: null,
        pago_demora_rescate: null,
        pago_outlier_superior: null,
        documentacion: null,
        'inlier/outlier': null,
        grupo_dentro_norma: null,
        dias_estadia: null,
        precio_base_tramo: null,
        valor_GRD: null,
        monto_final: null,
        episodio_AT: null,
      };

      mockSupabaseInstance = createMockSupabaseClient({
        grd_oficial: [{ id: 103 }],
        grd_fila: [minimalRow],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/103/export',
      });

      const params = createMockParams({ grdId: '103' });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });

    it('should handle row with multiple ajustes', async () => {
      // Arrange
      const rowWithMultipleAjustes = {
        ...createMockGrdRow({ id: 1, id_grd_oficial: 104, episodio: 4001 }),
        episodio_AT: [
          {
            id: 1,
            id_AT: 10,
            ajustes_tecnologias: { id: 10, codigo: 'AT001', AT: 'Marcapasos', valor: 50000 },
          },
          {
            id: 2,
            id_AT: 11,
            ajustes_tecnologias: { id: 11, codigo: 'AT002', AT: 'Stent', valor: 30000 },
          },
          {
            id: 3,
            id_AT: 12,
            ajustes_tecnologias: { id: 12, codigo: 'AT003', AT: 'Prótesis', valor: 80000 },
          },
        ],
      };

      mockSupabaseInstance = createMockSupabaseClient({
        grd_oficial: [{ id: 104 }],
        grd_fila: [rowWithMultipleAjustes],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/grd/104/export',
      });

      const params = createMockParams({ grdId: '104' });

      // Act
      const response = await GET(request, { params });

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });
  });
});
