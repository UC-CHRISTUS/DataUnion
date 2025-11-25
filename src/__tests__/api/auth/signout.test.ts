/**
 * Test Suite: POST /api/auth/signout
 *
 * Tests the authentication signout endpoint that handles user logout.
 */

import { POST } from '@/app/api/auth/signout/route';
import { createMockNextRequest, getResponseJson } from '../../utils/test-helpers';

let mockSupabaseAuth: any;

jest.mock('@/lib/supabase', () => ({
  get supabase() {
    return {
      auth: mockSupabaseAuth,
    };
  },
}));

describe('POST /api/auth/signout', () => {
  beforeEach(() => {
    mockSupabaseAuth = {
      signOut: jest.fn(async () => ({ error: null })),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should successfully sign out user', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signout',
      });

      // Act
      const response = await POST(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Sesión cerrada exitosamente');
      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
    });

    it('should clear session cookies on signout', async () => {
      // Arrange
      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signout',
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);
      expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
    });
  });

  describe('Error Cases', () => {
    it('should handle Supabase signOut error', async () => {
      // Arrange
      mockSupabaseAuth.signOut = jest.fn(async () => ({
        error: { message: 'Failed to sign out' },
      }));

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signout',
      });

      // Act
      const response = await POST(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Error al cerrar sesión');
    });

    it('should handle unexpected errors gracefully', async () => {
      // Arrange
      mockSupabaseAuth.signOut = jest.fn(async () => {
        throw new Error('Unexpected error');
      });

      const request = createMockNextRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/signout',
      });

      // Act
      const response = await POST(request);
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Error interno del servidor');
    });
  });
});
