/**
 * Test Suite: POST /api/v1/grd/[grdId]/submit-encoder
 *
 * Tests the encoder submit endpoint that delivers work to Finance.
 * Changes state from borrador_encoder → pendiente_finance.
 */

import { POST } from '@/app/api/v1/grd/[grdId]/submit-encoder/route';
import { createMockNextRequest, createMockParams, getResponseJson } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockGrdRow, createMockEncoder, createMockAdmin, createMockFinance } from '../utils/fixtures';
import { clearMockAuth } from '../mocks/auth.mock';

// Mock the supabase admin client
jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => mockSupabaseInstance,
}));

// Mock auth helpers
jest.mock('@/lib/auth-helpers', () => ({
  getCurrentUser: jest.fn(() => Promise.resolve(getMockUser())),
}));

let mockSupabaseInstance: MockSupabaseClient;
let mockUser: any = null;

function getMockUser() {
  return mockUser;
}

function setMockUser(user: any) {
  mockUser = user;
}

describe('POST /api/v1/grd/[grdId]/submit-encoder', () => {
  beforeEach(() => {
    clearMockAuth();
    mockUser = null;
    mockSupabaseInstance = createMockSupabaseClient({
      grd_fila: [],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should submit file to finance when encoder submits', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 1 });
      setMockUser(encoderUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'borrador_encoder', AT: false }),
        createMockGrdRow({ id: 2, id_grd_oficial: 100, episodio: 1002, estado: 'borrador_encoder', AT: false }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-encoder',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Archivo entregado exitosamente a Finance');
      expect(data.data.previousState).toBe('borrador_encoder');
      expect(data.data.currentState).toBe('pendiente_finance');
    });

    it('should submit file with AT details when AT is true', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 1 });
      setMockUser(encoderUser);

      const grdFiles = [
        createMockGrdRow({ 
          id: 1, 
          id_grd_oficial: 101, 
          episodio: 1001, 
          estado: 'borrador_encoder',
          AT: true,
          AT_detalle: 'AT001 - Marcapasos',
        }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/101/submit-encoder',
      });

      const params = createMockParams({ grdId: '101' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should update all rows of the file', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 1 });
      setMockUser(encoderUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 102, episodio: 1001, estado: 'borrador_encoder', AT: false }),
        createMockGrdRow({ id: 2, id_grd_oficial: 102, episodio: 1002, estado: 'borrador_encoder', AT: false }),
        createMockGrdRow({ id: 3, id_grd_oficial: 102, episodio: 1003, estado: 'borrador_encoder', AT: false }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/102/submit-encoder',
      });

      const params = createMockParams({ grdId: '102' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.data.rowsUpdated).toBe(3);
    });
  });

  describe('Validation Cases', () => {
    it('should reject invalid grdId', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 1 });
      setMockUser(encoderUser);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/invalid/submit-encoder',
      });

      const params = createMockParams({ grdId: 'invalid' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('ID de GRD inválido');
    });

    it('should reject when AT is true but AT_detalle is missing', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 1 });
      setMockUser(encoderUser);

      const grdFiles = [
        createMockGrdRow({ 
          id: 1, 
          id_grd_oficial: 103, 
          episodio: 1001, 
          estado: 'borrador_encoder',
          AT: true,
          AT_detalle: null, // Missing when AT is true
        }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/103/submit-encoder',
      });

      const params = createMockParams({ grdId: '103' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Faltan campos obligatorios');
      expect(data.missingFields).toContain('AT_detalle (requerido cuando AT = Sí)');
    });
  });

  describe('Authorization Cases', () => {
    it('should reject unauthenticated users', async () => {
      // Arrange
      setMockUser(null);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-encoder',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('No autenticado');
    });

    it('should reject admin users', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 2 });
      setMockUser(adminUser);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-encoder',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Solo los Encoders pueden entregar archivos a Finance');
    });

    it('should reject finance users', async () => {
      // Arrange
      const financeUser = createMockFinance({ id: 3 });
      setMockUser(financeUser);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-encoder',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Solo los Encoders pueden entregar archivos a Finance');
    });
  });

  describe('State Validation Cases', () => {
    it('should reject when file is not found', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 1 });
      setMockUser(encoderUser);

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: [],
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/999/submit-encoder',
      });

      const params = createMockParams({ grdId: '999' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Archivo GRD no encontrado');
    });

    it('should accept when file is in rechazado state', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 1 });
      setMockUser(encoderUser);

      const grdFiles = [
        createMockGrdRow({ 
          id: 1, 
          id_grd_oficial: 105, 
          episodio: 1001, 
          estado: 'rechazado',
          AT: false 
        }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/105/submit-encoder',
      });

      const params = createMockParams({ grdId: '105' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Archivo entregado exitosamente a Finance');
      expect(data.data.previousState).toBe('rechazado');
      expect(data.data.currentState).toBe('pendiente_finance');
    });

    it('should reject when file is not in borrador_encoder or rechazado state', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 1 });
      setMockUser(encoderUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'pendiente_finance' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-encoder',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('No se puede entregar');
      expect(data.expectedStates).toEqual(['borrador_encoder', 'rechazado']);
      expect(data.currentState).toBe('pendiente_finance');
    });

    it('should reject when file is in pendiente_admin state', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 1 });
      setMockUser(encoderUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'pendiente_admin' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-encoder',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.currentState).toBe('pendiente_admin');
    });
  });
});
