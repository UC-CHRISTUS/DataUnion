/**
 * Test Suite: /api/admin/users/[id]
 *
 * Tests PUT, PATCH, and DELETE endpoints for individual user management.
 */

import { PUT, PATCH, DELETE } from '@/app/api/admin/users/[id]/route';
import { createMockNextRequest, createMockParams, getResponseJson } from '../../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../../mocks/supabase.mock';
import * as authMock from '../../mocks/auth.mock';

let mockSupabaseAdmin: any;

jest.mock('@/lib/auth-helpers', () => ({
  requireAdmin: jest.fn(async () => {
    const user = authMock.getMockCurrentUser();
    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }
    return user;
  }),
}));

jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: jest.fn(() => mockSupabaseAdmin),
}));

describe('/api/admin/users/[id]', () => {
  let mockSupabaseInstance: MockSupabaseClient;

  beforeEach(() => {
    authMock.clearMockAuth();

    const mockAdmin: authMock.MockAuthUser = {
      id: 1,
      auth_id: 'admin-auth-id',
      email: 'admin@test.com',
      full_name: 'Admin User',
      role: 'admin',
      is_active: true,
      must_change_password: false,
      last_login: '2025-01-20T10:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-20T10:00:00Z',
    };
    authMock.setMockCurrentUser(mockAdmin);

    mockSupabaseInstance = createMockSupabaseClient({
      users: [
        mockAdmin,
        {
          id: 2,
          auth_id: 'encoder-auth-id',
          email: 'encoder@test.com',
          full_name: 'Encoder User',
          role: 'encoder',
          is_active: true,
          must_change_password: false,
          last_login: null,
          created_at: '2025-01-02T00:00:00Z',
          updated_at: '2025-01-02T00:00:00Z',
        },
        {
          id: 3,
          auth_id: 'admin2-auth-id',
          email: 'admin2@test.com',
          full_name: 'Second Admin',
          role: 'admin',
          is_active: true,
          must_change_password: false,
          last_login: null,
          created_at: '2025-01-03T00:00:00Z',
          updated_at: '2025-01-03T00:00:00Z',
        },
      ],
    });

    mockSupabaseAdmin = mockSupabaseInstance;
    mockSupabaseAdmin.auth = {
      admin: {
        deleteUser: jest.fn(async () => ({ error: null })),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/admin/users/[id]', () => {
    describe('Success Cases', () => {
      it('should update user with valid data', async () => {
        const request = createMockNextRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/admin/users/2',
          body: {
            fullName: 'Updated Name',
            role: 'finance',
          },
        });
        const params = createMockParams({ id: '2' });

        const response = await PUT(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.user.full_name).toBe('Updated Name');
        expect(data.user.role).toBe('finance');
      });

      it('should update user role from encoder to admin', async () => {
        const request = createMockNextRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/admin/users/2',
          body: {
            fullName: 'Encoder User',
            role: 'admin',
          },
        });
        const params = createMockParams({ id: '2' });

        const response = await PUT(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.user.role).toBe('admin');
      });
    });

    describe('Validation Cases', () => {
      it('should reject invalid role', async () => {
        const request = createMockNextRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/admin/users/2',
          body: {
            fullName: 'Test User',
            role: 'invalid_role',
          },
        });
        const params = createMockParams({ id: '2' });

        const response = await PUT(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toContain('Rol inválido');
      });

      it('should reject missing fullName', async () => {
        const request = createMockNextRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/admin/users/2',
          body: {
            role: 'encoder',
          },
        });
        const params = createMockParams({ id: '2' });

        const response = await PUT(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toContain('requeridos');
      });

      it('should reject nonexistent user', async () => {
        const request = createMockNextRequest({
          method: 'PUT',
          url: 'http://localhost:3000/api/admin/users/999',
          body: {
            fullName: 'Test',
            role: 'encoder',
          },
        });
        const params = createMockParams({ id: '999' });

        const response = await PUT(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data.error).toContain('no encontrado');
      });
    });
  });

  describe('PATCH /api/admin/users/[id]', () => {
    describe('Success Cases', () => {
      it('should activate inactive user', async () => {
        mockSupabaseInstance.getMockData('users')[1].is_active = false;

        const request = createMockNextRequest({
          method: 'PATCH',
          url: 'http://localhost:3000/api/admin/users/2',
          body: { is_active: true },
        });
        const params = createMockParams({ id: '2' });

        const response = await PATCH(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('activado');
        expect(data.user.is_active).toBe(true);
      });

      it('should deactivate active non-admin user', async () => {
        const request = createMockNextRequest({
          method: 'PATCH',
          url: 'http://localhost:3000/api/admin/users/2',
          body: { is_active: false },
        });
        const params = createMockParams({ id: '2' });

        const response = await PATCH(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.message).toContain('desactivado');
        expect(data.user.is_active).toBe(false);
      });

      it('should deactivate admin when multiple admins exist', async () => {
        const request = createMockNextRequest({
          method: 'PATCH',
          url: 'http://localhost:3000/api/admin/users/1',
          body: { is_active: false },
        });
        const params = createMockParams({ id: '1' });

        const response = await PATCH(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.user.is_active).toBe(false);
      });
    });

    describe('Validation Cases', () => {
      it('should reject invalid is_active type', async () => {
        const request = createMockNextRequest({
          method: 'PATCH',
          url: 'http://localhost:3000/api/admin/users/2',
          body: { is_active: 'true' },
        });
        const params = createMockParams({ id: '2' });

        const response = await PATCH(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toContain('boolean');
      });

      it('should prevent deactivating last active admin', async () => {
        const onlyAdmin = {
          id: 99,
          auth_id: 'only-admin-auth-id',
          email: 'onlyadmin@test.com',
          full_name: 'Only Admin',
          role: 'admin',
          is_active: true,
          must_change_password: false,
          last_login: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        };

        mockSupabaseInstance.setMockData('users', [onlyAdmin]);

        const request = createMockNextRequest({
          method: 'PATCH',
          url: 'http://localhost:3000/api/admin/users/99',
          body: { is_active: false },
        });
        const params = createMockParams({ id: '99' });

        const response = await PATCH(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toContain('único administrador activo');
      });
    });
  });

  describe('DELETE /api/admin/users/[id]', () => {
    describe('Success Cases', () => {
      it('should delete non-admin user', async () => {
        const request = createMockNextRequest({
          method: 'DELETE',
          url: 'http://localhost:3000/api/admin/users/2',
        });
        const params = createMockParams({ id: '2' });

        const response = await DELETE(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toContain('eliminado');
        expect(mockSupabaseAdmin.auth.admin.deleteUser).toHaveBeenCalledWith(
          'encoder-auth-id'
        );
      });

      it('should delete admin when multiple admins exist', async () => {
        const request = createMockNextRequest({
          method: 'DELETE',
          url: 'http://localhost:3000/api/admin/users/1',
        });
        const params = createMockParams({ id: '1' });

        const response = await DELETE(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
      });
    });

    describe('Validation Cases', () => {
      it('should reject deleting nonexistent user', async () => {
        const request = createMockNextRequest({
          method: 'DELETE',
          url: 'http://localhost:3000/api/admin/users/999',
        });
        const params = createMockParams({ id: '999' });

        const response = await DELETE(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data.error).toContain('no encontrado');
      });

      it('should prevent deleting last admin', async () => {
        const onlyAdmin = {
          id: 98,
          auth_id: 'only-admin-auth-id-2',
          email: 'lastin@test.com',
          full_name: 'Last Admin',
          role: 'admin',
          is_active: true,
          must_change_password: false,
          last_login: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        };

        mockSupabaseInstance.setMockData('users', [onlyAdmin]);

        const request = createMockNextRequest({
          method: 'DELETE',
          url: 'http://localhost:3000/api/admin/users/98',
        });
        const params = createMockParams({ id: '98' });

        const response = await DELETE(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toContain('único administrador');
      });
    });
  });
});
