/**
 * Test Suite: POST /api/v1/grd/[grdId]/submit-finance
 *
 * Tests the finance submit endpoint that delivers work to Admin.
 * Changes state from borrador_finance/pendiente_finance → pendiente_admin.
 * 
 * Note: El campo "validado" es OPCIONAL. Finance puede entregar archivos
 * con filas marcadas como Sí, No, o sin marcar.
 */

import { POST } from '@/app/api/v1/grd/[grdId]/submit-finance/route';
import { createMockNextRequest, createMockParams, getResponseJson } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockGrdRow, createMockFinance, createMockAdmin, createMockEncoder } from '../utils/fixtures';
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

describe('POST /api/v1/grd/[grdId]/submit-finance', () => {
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
    it('should submit file to admin when finance submits from pendiente_finance', async () => {
      // Arrange
      const financeUser = createMockFinance({ id: 1 });
      setMockUser(financeUser);

      const grdFiles = [
        createMockGrdRow({ 
          id: 1, 
          id_grd_oficial: 100, 
          episodio: 1001, 
          estado: 'pendiente_finance',
          validado: 'Sí',
        }),
        createMockGrdRow({ 
          id: 2, 
          id_grd_oficial: 100, 
          episodio: 1002, 
          estado: 'pendiente_finance',
          validado: 'Sí',
        }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-finance',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Archivo entregado exitosamente al Admin');
      expect(data.data.previousState).toBe('pendiente_finance');
      expect(data.data.currentState).toBe('pendiente_admin');
    });

    it('should submit file to admin when finance submits from borrador_finance', async () => {
      // Arrange
      const financeUser = createMockFinance({ id: 1 });
      setMockUser(financeUser);

      const grdFiles = [
        createMockGrdRow({ 
          id: 1, 
          id_grd_oficial: 101, 
          episodio: 1001, 
          estado: 'borrador_finance',
          validado: 'No',
        }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/101/submit-finance',
      });

      const params = createMockParams({ grdId: '101' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.previousState).toBe('borrador_finance');
      expect(data.data.currentState).toBe('pendiente_admin');
    });

    it('should update all rows of the file', async () => {
      // Arrange
      const financeUser = createMockFinance({ id: 1 });
      setMockUser(financeUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 102, episodio: 1001, estado: 'borrador_finance', validado: 'Sí' }),
        createMockGrdRow({ id: 2, id_grd_oficial: 102, episodio: 1002, estado: 'borrador_finance', validado: 'Sí' }),
        createMockGrdRow({ id: 3, id_grd_oficial: 102, episodio: 1003, estado: 'borrador_finance', validado: 'Sí' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/102/submit-finance',
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
      const financeUser = createMockFinance({ id: 1 });
      setMockUser(financeUser);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/invalid/submit-finance',
      });

      const params = createMockParams({ grdId: 'invalid' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('ID de GRD inválido');
    });

    it('should allow submission with validado field set to No in some rows', async () => {
      // Arrange: Finance puede enviar archivo aunque algunas filas tengan validado=No
      const financeUser = createMockFinance({ id: 1 });
      setMockUser(financeUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 103, episodio: 1001, estado: 'borrador_finance', validado: true }),
        createMockGrdRow({ id: 2, id_grd_oficial: 103, episodio: 1002, estado: 'borrador_finance', validado: false }), // No
        createMockGrdRow({ id: 3, id_grd_oficial: 103, episodio: 1003, estado: 'borrador_finance', validado: null }), // Sin marcar
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/103/submit-finance',
      });

      const params = createMockParams({ grdId: '103' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert: Debe permitir el submit exitosamente
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Archivo entregado exitosamente al Admin');
      expect(data.data.currentState).toBe('pendiente_admin');
    });

    it('should allow submission when all validado fields are No or empty', async () => {
      // Arrange: Finance puede enviar archivo aunque todas las filas tengan validado=No
      const financeUser = createMockFinance({ id: 1 });
      setMockUser(financeUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 104, episodio: 1001, estado: 'borrador_finance', validado: false }),
        createMockGrdRow({ id: 2, id_grd_oficial: 104, episodio: 1002, estado: 'borrador_finance', validado: null }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/104/submit-finance',
      });

      const params = createMockParams({ grdId: '104' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert: Debe permitir el submit exitosamente
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.rowsUpdated).toBe(2);
    });
  });

  describe('Authorization Cases', () => {
    it('should reject unauthenticated users', async () => {
      // Arrange
      setMockUser(null);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-finance',
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
        url: 'http://localhost:3000/api/v1/grd/100/submit-finance',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Solo usuarios de Finance pueden entregar archivos al Admin');
    });

    it('should reject encoder users', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 3 });
      setMockUser(encoderUser);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-finance',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Solo usuarios de Finance pueden entregar archivos al Admin');
    });
  });

  describe('State Validation Cases', () => {
    it('should reject when file is not found', async () => {
      // Arrange
      const financeUser = createMockFinance({ id: 1 });
      setMockUser(financeUser);

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: [],
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/999/submit-finance',
      });

      const params = createMockParams({ grdId: '999' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Archivo GRD no encontrado');
    });

    it('should reject when file is in borrador_encoder state', async () => {
      // Arrange
      const financeUser = createMockFinance({ id: 1 });
      setMockUser(financeUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'borrador_encoder' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-finance',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('No se puede entregar');
      expect(data.expectedStates).toContain('pendiente_finance');
      expect(data.expectedStates).toContain('borrador_finance');
      expect(data.currentState).toBe('borrador_encoder');
    });

    it('should reject when file is in pendiente_admin state', async () => {
      // Arrange
      const financeUser = createMockFinance({ id: 1 });
      setMockUser(financeUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'pendiente_admin' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-finance',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.currentState).toBe('pendiente_admin');
    });

    it('should reject when file is already approved', async () => {
      // Arrange
      const financeUser = createMockFinance({ id: 1 });
      setMockUser(financeUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'aprobado' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/submit-finance',
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.currentState).toBe('aprobado');
    });
  });
});
