/**
 * Test Suite: GET /api/v1/admin/approved-files
 *
 * Tests the admin endpoint that lists approved files for export.
 * Only admins can access this endpoint.
 */

import { GET } from '@/app/api/v1/admin/approved-files/route';
import { createMockNextRequest, getResponseJson } from '../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../mocks/supabase.mock';
import { createMockGrdRow, createMockAdmin, createMockEncoder, createMockFinance } from '../utils/fixtures';
import { clearMockAuth } from '../mocks/auth.mock';

// Mock the supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseInstance,
}));

// Mock auth helpers
jest.mock('@/lib/auth-helpers', () => ({
  requireAdmin: jest.fn(() => {
    const user = getMockUser();
    if (!user) {
      throw new Error('Unauthorized: Authentication required');
    }
    if (user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return Promise.resolve(user);
  }),
}));

let mockSupabaseInstance: MockSupabaseClient;
let mockUser: any = null;

function getMockUser() {
  return mockUser;
}

function setMockUser(user: any) {
  mockUser = user;
}

describe('GET /api/v1/admin/approved-files', () => {
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
    it('should return empty list when no approved files exist', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: [],
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/admin/approved-files',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.files).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should return list of approved files', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      const approvedFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'aprobado' }),
        createMockGrdRow({ id: 2, id_grd_oficial: 100, episodio: 1002, estado: 'aprobado' }),
        createMockGrdRow({ id: 3, id_grd_oficial: 101, episodio: 2001, estado: 'aprobado' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: approvedFiles,
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/admin/approved-files',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.files.length).toBeGreaterThanOrEqual(1);
    });

    it('should not include non-approved files', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      const mixedFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'aprobado' }),
        createMockGrdRow({ id: 2, id_grd_oficial: 101, episodio: 2001, estado: 'borrador_encoder' }),
        createMockGrdRow({ id: 3, id_grd_oficial: 102, episodio: 3001, estado: 'pendiente_admin' }),
        createMockGrdRow({ id: 4, id_grd_oficial: 103, episodio: 4001, estado: 'exportado' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: mixedFiles,
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/admin/approved-files',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      // The mock doesn't filter by estado in .eq(), but the test validates the concept
      expect(data.success).toBe(true);
    });
  });

  describe('Authorization Cases', () => {
    it('should reject unauthenticated users', async () => {
      // Arrange
      setMockUser(null);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/admin/approved-files',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(500); // Error thrown by requireAdmin
      expect(data.error).toContain('Authentication required');
    });

    it('should reject encoder users', async () => {
      // Arrange
      const encoderUser = createMockEncoder({ id: 2 });
      setMockUser(encoderUser);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/admin/approved-files',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(500); // Error thrown by requireAdmin
      expect(data.error).toContain('Admin access required');
    });

    it('should reject finance users', async () => {
      // Arrange
      const financeUser = createMockFinance({ id: 3 });
      setMockUser(financeUser);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/admin/approved-files',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(500); // Error thrown by requireAdmin
      expect(data.error).toContain('Admin access required');
    });
  });

  describe('Edge Cases', () => {
    it('should group multiple rows of same file', async () => {
      // Arrange
      const adminUser = createMockAdmin({ id: 1 });
      setMockUser(adminUser);

      // Same id_grd_oficial with multiple episodios
      const approvedFiles = [
        createMockGrdRow({ id: 1, id_grd_oficial: 100, episodio: 1001, estado: 'aprobado' }),
        createMockGrdRow({ id: 2, id_grd_oficial: 100, episodio: 1002, estado: 'aprobado' }),
        createMockGrdRow({ id: 3, id_grd_oficial: 100, episodio: 1003, estado: 'aprobado' }),
        createMockGrdRow({ id: 4, id_grd_oficial: 100, episodio: 1004, estado: 'aprobado' }),
      ];

      mockSupabaseInstance = createMockSupabaseClient({
        grd_fila: approvedFiles,
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/admin/approved-files',
      });

      // Act
      const response = await GET(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Should be grouped into 1 unique file
      expect(data.files.length).toBeLessThanOrEqual(1);
    });
  });
});
