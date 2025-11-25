/**
 * Test Suite: POST /api/auth/change-password
 *
 * Tests the change password endpoint for authenticated users.
 */

import { POST } from '@/app/api/auth/change-password/route';
import { createMockNextRequest, getResponseJson } from '../../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../../mocks/supabase.mock';

let mockSupabaseInstance: MockSupabaseClient;
let mockSupabaseAdmin: any;
let mockAuthClient: any;

jest.mock('next/headers', () => ({
  cookies: jest.fn(async () => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => mockAuthClient),
}));

jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: jest.fn(() => mockSupabaseAdmin),
}));

describe('POST /api/auth/change-password', () => {
  beforeEach(() => {
    mockSupabaseInstance = createMockSupabaseClient({
      users: [
        {
          id: 1,
          auth_id: 'auth-123',
          email: 'user@test.com',
          full_name: 'Test User',
          role: 'encoder',
          is_active: true,
          must_change_password: true,
          last_login: null,
          created_at: '2025-01-01T00:00:00Z',
        },
      ],
    });

    mockAuthClient = {
      auth: {
        getUser: jest.fn(async () => ({
          data: {
            user: {
              id: 'auth-123',
              email: 'user@test.com',
            },
          },
          error: null,
        })),
      },
      from: (table: string) => mockSupabaseInstance.from(table),
    };

    mockSupabaseAdmin = {
      auth: {
        admin: {
          updateUserById: jest.fn(async () => ({
            data: { user: { id: 'auth-123' } },
            error: null,
          })),
        },
      },
      from: (table: string) => mockSupabaseInstance.from(table),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should successfully change password with valid input', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'NewSecure123!',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Contraseña actualizada exitosamente');
      expect(mockSupabaseAdmin.auth.admin.updateUserById).toHaveBeenCalledWith('auth-123', {
        password: 'NewSecure123!',
      });
    });

    it('should update must_change_password flag to false', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'NewSecure123!',
        },
      });

      await POST(request);

      const user = mockSupabaseInstance
        .getMockData('users')
        .find((u: any) => u.email === 'user@test.com');

      expect(user.must_change_password).toBe(false);
    });

    it('should accept password with all required characters', async () => {
      const validPasswords = [
        'Abcdef12!',
        'Test123@Password',
        'Secure#Pass1',
        'MyP@ssw0rd',
      ];

      for (const password of validPasswords) {
        const request = createMockNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/auth/change-password',
          body: { newPassword: password },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Validation Cases', () => {
    it('should reject password shorter than 8 characters', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'Short1!',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('should reject password without uppercase letter', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'lowercase123!',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain('mayúscula');
    });

    it('should reject password without lowercase letter', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'UPPERCASE123!',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain('minúscula');
    });

    it('should reject password without number', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'NoNumbers!',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain('número');
    });

    it('should reject password without special character', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'NoSpecial123',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain('carácter especial');
    });

    it('should reject empty password', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: '',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('La contraseña debe tener al menos 8 caracteres');
    });

    it('should reject missing newPassword field', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {},
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
    });
  });

  describe('Authorization Cases', () => {
    it('should reject unauthenticated request', async () => {
      mockAuthClient.auth.getUser = jest.fn(async () => ({
        data: { user: null },
        error: { message: 'Not authenticated' },
      }));

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'NewSecure123!',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(401);
      expect(data.error).toBe('No autenticado. Por favor inicie sesión.');
    });

    it('should reject if user not found in public.users', async () => {
      mockSupabaseInstance.setMockData('users', []);

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'NewSecure123!',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(404);
      expect(data.error).toBe('Usuario no encontrado');
    });
  });

  describe('Error Cases', () => {
    it('should handle Supabase auth update error', async () => {
      mockSupabaseAdmin.auth.admin.updateUserById = jest.fn(async () => ({
        data: null,
        error: { message: 'Failed to update password' },
      }));

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'NewSecure123!',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.error).toContain('Failed to update password');
    });

    it('should handle unexpected errors gracefully', async () => {
      mockAuthClient.auth.getUser = jest.fn(async () => {
        throw new Error('Unexpected error');
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'NewSecure123!',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error interno del servidor');
    });

    it('should continue if must_change_password flag update fails', async () => {
      const originalFrom = mockSupabaseAdmin.from;
      mockSupabaseAdmin.from = jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(async () => ({
            data: null,
            error: { message: 'Update failed' },
          })),
        })),
      }));

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/change-password',
        body: {
          newPassword: 'NewSecure123!',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      mockSupabaseAdmin.from = originalFrom;
    });
  });
});
