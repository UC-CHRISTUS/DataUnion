/**
 * Test Suite: /api/admin/users
 *
 * Tests GET and POST endpoints for admin user management.
 */

import { GET, POST } from '@/app/api/admin/users/route';
import { createMockNextRequest, getResponseJson } from '../../utils/test-helpers';
import { createMockSupabaseClient, MockSupabaseClient } from '../../mocks/supabase.mock';
import * as authMock from '../../mocks/auth.mock';
import * as authHelpers from '@/lib/auth-helpers';

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

describe('/api/admin/users', () => {
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
      ],
    });

    mockSupabaseAdmin = {
      auth: {
        admin: {
          createUser: jest.fn(async ({ email }) => {
            if (email === 'existing@test.com') {
              return {
                data: { user: null },
                error: { message: 'User already registered' },
              };
            }
            return {
              data: {
                user: {
                  id: 'new-auth-id',
                  email,
                },
              },
              error: null,
            };
          }),
        },
      },
      from: (table: string) => mockSupabaseInstance.from(table),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/users', () => {
    describe('Success Cases', () => {
      it('should return all users for admin', async () => {
        // Arrange
        const request = createMockNextRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/admin/users',
        });

        // Act
        const response = await GET(request);
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.users).toHaveLength(2);
        expect(data.users[0].role).toBe('admin');
      });

      it('should return empty array when no users exist', async () => {
        // Arrange
        mockSupabaseInstance.setMockData('users', []);

        const request = createMockNextRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/admin/users',
        });

        // Act
        const response = await GET(request);
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(200);
        expect(data.users).toEqual([]);
      });
    });

    describe('Authorization Cases', () => {
      it('should reject non-admin user', async () => {
        // Arrange
        (authHelpers.requireAdmin as jest.Mock).mockRejectedValueOnce(
          new Error('Unauthorized: Admin access required')
        );

        const request = createMockNextRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/admin/users',
        });

        // Act
        const response = await GET(request);
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(403);
        expect(data.error).toContain('administrador');
      });

      it('should reject unauthenticated request', async () => {
        // Arrange
        (authHelpers.requireAdmin as jest.Mock).mockRejectedValueOnce(
          new Error('Unauthorized: Authentication required')
        );

        const request = createMockNextRequest({
          method: 'GET',
          url: 'http://localhost:3000/api/admin/users',
        });

        // Act
        const response = await GET(request);
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(403);
      });
    });
  });

  describe('POST /api/admin/users', () => {
    describe('Success Cases', () => {
      it('should create new user with valid data', async () => {
        // Arrange
        const request = createMockNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/admin/users',
          body: {
            email: 'newuser@test.com',
            fullName: 'New User',
            role: 'encoder',
          },
        });

        // Act
        const response = await POST(request);
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.user.email).toBe('newuser@test.com');
        expect(data.temporaryPassword).toBeTruthy();
        expect(data.temporaryPassword.length).toBe(12);
      });

      it('should create admin user', async () => {
        // Arrange
        const request = createMockNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/admin/users',
          body: {
            email: 'newadmin@test.com',
            fullName: 'New Admin',
            role: 'admin',
          },
        });

        // Act
        const response = await POST(request);
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(201);
        expect(data.user.role).toBe('admin');
      });

      it('should create finance user', async () => {
        // Arrange
        const request = createMockNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/admin/users',
          body: {
            email: 'finance@test.com',
            fullName: 'Finance User',
            role: 'finance',
          },
        });

        // Act
        const response = await POST(request);
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(201);
        expect(data.user.role).toBe('finance');
      });

      it('should generate secure password with all required characters', async () => {
        // Arrange
        const request = createMockNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/admin/users',
          body: {
            email: 'test@test.com',
            fullName: 'Test User',
            role: 'encoder',
          },
        });

        // Act
        const response = await POST(request);
        const data = await getResponseJson(response);

        // Assert
        const password = data.temporaryPassword;
        expect(/[A-Z]/.test(password)).toBe(true);
        expect(/[a-z]/.test(password)).toBe(true);
        expect(/[0-9]/.test(password)).toBe(true);
        expect(/[!@#$%^&*]/.test(password)).toBe(true);
      });
    });

    describe('Validation Cases', () => {
      it('should reject missing email', async () => {
        // Arrange
        const request = createMockNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/admin/users',
          body: {
            fullName: 'Test User',
            role: 'encoder',
          },
        });

        // Act
        const response = await POST(request);
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(400);
        expect(data.error).toContain('requeridos');
      });

      it('should reject invalid email format', async () => {
        // Arrange
        const request = createMockNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/admin/users',
          body: {
            email: 'invalid-email',
            fullName: 'Test User',
            role: 'encoder',
          },
        });

        // Act
        const response = await POST(request);
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(400);
        expect(data.error).toContain('email inválido');
      });

      it('should reject invalid role', async () => {
        // Arrange
        const request = createMockNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/admin/users',
          body: {
            email: 'test@test.com',
            fullName: 'Test User',
            role: 'invalid_role',
          },
        });

        // Act
        const response = await POST(request);
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(400);
        expect(data.error).toContain('Rol inválido');
      });

      it('should reject existing email', async () => {
        // Arrange
        const request = createMockNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/admin/users',
          body: {
            email: 'existing@test.com',
            fullName: 'Existing User',
            role: 'encoder',
          },
        });

        // Act
        const response = await POST(request);
        const data = await getResponseJson(response);

        // Assert
        expect(response.status).toBe(409);
        expect(data.error).toContain('ya está registrado');
      });
    });

    describe('Authorization Cases', () => {
      it('should reject non-admin user', async () => {
        // Arrange
        (authHelpers.requireAdmin as jest.Mock).mockRejectedValueOnce(
          new Error('Unauthorized: Admin access required')
        );

        const request = createMockNextRequest({
          method: 'POST',
          url: 'http://localhost:3000/api/admin/users',
          body: {
            email: 'test@test.com',
            fullName: 'Test User',
            role: 'encoder',
          },
        });

        // Act
        const response = await POST(request);

        // Assert
        expect(response.status).toBe(403);
      });
    });
  });
});
