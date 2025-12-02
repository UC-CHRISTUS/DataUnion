/**
 * Test Suite: POST /api/v1/grd/[grdId]/review
 *
 * Tests the admin review endpoint that allows approving or rejecting files.
 * Only admins can access this endpoint.
 */

import { POST } from '@/app/api/v1/grd/[grdId]/review/route';
import { createMockNextRequest, createMockParams, getResponseJson } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockGrdRow, createMockAdmin, createMockEncoder, createMockFinance } from '../utils/fixtures';
import { setMockCurrentUser, clearMockAuth } from '../mocks/auth.mock';

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

describe('POST /api/v1/grd/[grdId]/review', () => {
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
    it('should approve a file when admin approves', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'pendiente_admin' }),
        createMockGrdRow({ id: 2, id_grd_oficial: 100, episodio: 1002, estado: 'pendiente_admin' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/review',
        body: { action: 'approve' },
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.action).toBe('approve');
      expect(data.data.currentState).toBe('aprobado');
      expect(data.data.previousState).toBe('pendiente_admin');
    });

    it('should reject a file when admin rejects with reason', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 101, episodio: 1003, estado: 'pendiente_admin' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/101/review',
        body: { 
          action: 'reject',
          reason: 'Missing AT details for episodes 1003, 1004',
        },
      });

      const params = createMockParams({ grdId: '101' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.action).toBe('reject');
      expect(data.data.currentState).toBe('rechazado');
      expect(data.data.reason).toBe('Missing AT details for episodes 1003, 1004');
    });

    it('should update all rows of the file', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 102, episodio: 1001, estado: 'pendiente_admin' }),
        createMockGrdRow({ id: 2, id_grd_oficial: 102, episodio: 1002, estado: 'pendiente_admin' }),
        createMockGrdRow({ id: 3, id_grd_oficial: 102, episodio: 1003, estado: 'pendiente_admin' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/102/review',
        body: { action: 'approve' },
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
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/invalid/review',
        body: { action: 'approve' },
      });

      const params = createMockParams({ grdId: 'invalid' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('ID de GRD inválido');
    });

    it('should reject invalid action', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/review',
        body: { action: 'invalid_action' },
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Acción inválida. Debe ser "approve" o "reject"');
    });

    it('should reject when action is missing', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/review',
        body: {},
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Acción inválida. Debe ser "approve" o "reject"');
    });
  });

  describe('Authorization Cases', () => {
    it('should reject unauthenticated users', async () => {
      // Arrange
      setMockUser(null);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/review',
        body: { action: 'approve' },
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('No autenticado');
    });

    it('should reject encoder users', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 2 });
      setMockUser(encoderUser);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/review',
        body: { action: 'approve' },
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Solo los Admins pueden aprobar o rechazar archivos');
    });

    it('should reject finance users', async () => {
      // Arrange
      const financeUser = createMockFinance({ id: 3 });
      setMockUser(financeUser);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/review',
        body: { action: 'approve' },
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Solo los Admins pueden aprobar o rechazar archivos');
    });
  });

  describe('State Validation Cases', () => {
    it('should reject when file is not found', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: [],
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/999/review',
        body: { action: 'approve' },
      });

      const params = createMockParams({ grdId: '999' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Archivo GRD no encontrado');
    });

    it('should reject when file is not in pendiente_admin state', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'borrador_encoder' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/review',
        body: { action: 'approve' },
      });

      const params = createMockParams({ grdId: '100' });

      // Act
      const response = await POST(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('No se puede revisar');
      expect(data.expectedState).toBe('pendiente_admin');
      expect(data.currentState).toBe('borrador_encoder');
    });

    it('should reject when file is already approved', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      const grdFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'aprobado' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: grdFiles,
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/grd/100/review',
        body: { action: 'approve' },
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
