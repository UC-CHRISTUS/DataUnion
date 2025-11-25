/**
 * Test Suite: POST /api/auth/signin
 *
 * Tests the authentication signin endpoint that handles user login.
 */

import { POST } from '@/app/api/auth/signin/route';
import { createMockNextRequest, getResponseJson } from '../../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../../mocks/supabase.mock';

let mockSupabaseInstance: MockSupabaseClient;
let mockAuthClient: any;

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => mockAuthClient),
}));

describe('POST /api/auth/signin', () => {
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
          must_change_password: false,
          last_login: null,
          created_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 2,
          auth_id: 'auth-456',
          email: 'inactive@test.com',
          full_name: 'Inactive User',
          role: 'finance',
          is_active: false,
          must_change_password: false,
          last_login: null,
          created_at: '2025-01-01T00:00:00Z',
        },
      ],
    });

    mockAuthClient = {
      auth: {
        signInWithPassword: jest.fn(async ({ email, password }) => {
          if (password === 'wrongpassword') {
            return {
              data: { user: null, session: null },
              error: { message: 'Invalid credentials' },
            };
          }

          const authId = email === 'user@test.com' ? 'auth-123' : 'auth-456';
          return {
            data: {
              user: { id: authId, email },
              session: { access_token: 'mock-token' },
            },
            error: null,
          };
        }),
      },
      from: (table: string) => mockSupabaseInstance.from(table),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should authenticate user with valid credentials', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signin',
        body: {
          email: 'user@test.com',
          password: 'validpassword',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toEqual({
        id: 1,
        email: 'user@test.com',
        fullName: 'Test User',
        role: 'encoder',
      });
      expect(data.mustChangePassword).toBe(false);
      expect(mockAuthClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'validpassword',
      });
    });

    it('should return mustChangePassword flag when set', async () => {
      const newUserData = {
        id: 3,
        auth_id: 'auth-789',
        email: 'newuser@test.com',
        full_name: 'New User',
        role: 'encoder',
        is_active: true,
        must_change_password: true,
        last_login: null,
        created_at: '2025-01-01T00:00:00Z',
      };

      mockSupabaseInstance.setMockData('users', [
        ...mockSupabaseInstance.getMockData('users'),
        newUserData,
      ]);

      mockAuthClient.auth.signInWithPassword = jest.fn(async () => ({
        data: {
          user: { id: 'auth-789', email: 'newuser@test.com' },
          session: { access_token: 'mock-token' },
        },
        error: null,
      }));

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signin',
        body: {
          email: 'newuser@test.com',
          password: 'temppassword',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.mustChangePassword).toBe(true);
    });

    it('should update last_login timestamp on successful login', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signin',
        body: {
          email: 'user@test.com',
          password: 'validpassword',
        },
      });

      await POST(request);

      const updatedUser = mockSupabaseInstance
        .getMockData('users')
        .find((u: any) => u.email === 'user@test.com');

      expect(updatedUser.last_login).toBeTruthy();
    });
  });

  describe('Validation Cases', () => {
    it('should reject request without email', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signin',
        body: {
          password: 'validpassword',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email y contraseña son requeridos');
    });

    it('should reject request without password', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signin',
        body: {
          email: 'user@test.com',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email y contraseña son requeridos');
    });

    it('should reject invalid credentials', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signin',
        body: {
          email: 'user@test.com',
          password: 'wrongpassword',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(401);
      expect(data.error).toBe('Credenciales inválidas');
    });
  });

  describe('Authorization Cases', () => {
    it('should reject inactive user login', async () => {
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signin',
        body: {
          email: 'inactive@test.com',
          password: 'validpassword',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(403);
      expect(data.error).toBe('Usuario inactivo. Contacta al administrador.');
    });
  });

  describe('Error Cases', () => {
    it('should handle user not found in public.users table', async () => {
      mockAuthClient.auth.signInWithPassword = jest.fn(async () => ({
        data: {
          user: { id: 'nonexistent-auth-id', email: 'ghost@test.com' },
          session: { access_token: 'mock-token' },
        },
        error: null,
      }));

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signin',
        body: {
          email: 'ghost@test.com',
          password: 'validpassword',
        },
      });

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al cargar datos del usuario');
    });

    it('should handle malformed JSON body', async () => {
      const request = new Request('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid-json',
      }) as any;

      const response = await POST(request);
      const data = await getResponseJson(response);

      expect(response.status).toBe(500);
      expect(data.error).toBe('Error interno del servidor');
    });
  });
});
