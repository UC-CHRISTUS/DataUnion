/**
 * Test Suite: GET /api/auth/session
 *
 * Tests the session endpoint that returns current user session details.
 */

import { GET } from '@/app/api/auth/session/route';
import { createMockNextRequest, getResponseJson } from '../../utils/test-helpers';
import * as authMock from '../../mocks/auth.mock';

jest.mock('@/lib/auth-helpers', () => ({
  getCurrentUser: jest.fn(async () => authMock.getMockCurrentUser()),
}));

describe('GET /api/auth/session', () => {
  beforeEach(() => {
    authMock.clearMockAuth();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should return user session details for authenticated user', async () => {
      const mockUser: authMock.MockAuthUser = {
        id: 1,
        auth_id: 'auth-123',
        email: 'user@test.com',
        full_name: 'Test User',
        role: 'encoder',
        is_active: true,
        must_change_password: false,
        last_login: '2025-01-20T10:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-20T10:00:00Z',
      };
      authMock.setMockCurrentUser(mockUser);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/auth/session',
      });

      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toEqual({
        id: 1,
        authId: 'auth-123',
        email: 'user@test.com',
        fullName: 'Test User',
        role: 'encoder',
        isActive: true,
        lastLogin: '2025-01-20T10:00:00Z',
        createdAt: '2025-01-01T00:00:00Z',
      });
    });

    it('should return admin user session', async () => {
      const mockAdmin: authMock.MockAuthUser = {
        id: 2,
        auth_id: 'auth-456',
        email: 'admin@test.com',
        full_name: 'Admin User',
        role: 'admin',
        is_active: true,
        must_change_password: false,
        last_login: '2025-01-21T10:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-21T10:00:00Z',
      };
      authMock.setMockCurrentUser(mockAdmin);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/auth/session',
      });

      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.user.role).toBe('admin');
    });

    it('should return finance user session', async () => {
      const mockFinance: authMock.MockAuthUser = {
        id: 3,
        auth_id: 'auth-789',
        email: 'finance@test.com',
        full_name: 'Finance User',
        role: 'finance',
        is_active: true,
        must_change_password: false,
        last_login: '2025-01-22T10:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-22T10:00:00Z',
      };
      authMock.setMockCurrentUser(mockFinance);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/auth/session',
      });

      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.user.role).toBe('finance');
    });
  });

  describe('Authorization Cases', () => {
    it('should return 401 when no session exists', async () => {
      authMock.setMockCurrentUser(null);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/auth/session',
      });

      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(401);
      expect(data.error).toBe('No hay sesión activa');
    });

    it('should return 403 for inactive user', async () => {
      const inactiveUser: authMock.MockAuthUser = {
        id: 4,
        auth_id: 'auth-999',
        email: 'inactive@test.com',
        full_name: 'Inactive User',
        role: 'encoder',
        is_active: false,
        must_change_password: false,
        last_login: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };
      authMock.setMockCurrentUser(inactiveUser);

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/auth/session',
      });

      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(403);
      expect(data.error).toBe('Usuario inactivo');
    });
  });

  describe('Error Cases', () => {
    it('should handle unexpected errors gracefully', async () => {
      const { getCurrentUser } = require('@/lib/auth-helpers');
      getCurrentUser.mockImplementationOnce(async () => {
        throw new Error('Database connection failed');
      });

      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/auth/session',
      });

      const response = await GET(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error interno del servidor');
    });
  });
});
