/**
 * Test Suite: GET /api/v1/users/[userId]
 *
 * Tests the user endpoint that returns user ID information.
 * This is a simple demo endpoint with minimal functionality.
 */

import { GET } from '@/app/api/v1/users/[userId]/route';
import { createMockNextRequest, createMockParams, getResponseJson } from '../utils/test-helpers';

describe('GET /api/v1/users/[userId]', () => {
  describe('Success Cases', () => {
    it('should return user ID message for valid userId', async () => {
      // Arrange
      const userId = '123';
      const request = createMockNextRequest({
        method: 'GET',
        url: `http://localhost:3000/api/v1/users/${userId}`,
      });
      const params = createMockParams({ userId });

      // Act
      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: 'User ID is 123',
      });
    });

    it('should handle different userId values', async () => {
      // Test with different user IDs
      const userIds = ['1', '999', 'abc123', 'user-uuid-here'];

      for (const userId of userIds) {
        const request = createMockNextRequest({
          method: 'GET',
          url: `http://localhost:3000/api/v1/users/${userId}`,
        });
        const params = createMockParams({ userId });

        const response = await GET(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.message).toBe(`User ID is ${userId}`);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty userId', async () => {
      const request = createMockNextRequest({
        method: 'GET',
        url: 'http://localhost:3000/api/v1/users/',
      });
      const params = createMockParams({ userId: '' });

      const response = await GET(request, { params });
      const data = await getResponseJson(response);

      expect(response.status).toBe(200);
      expect(data.message).toBe('User ID is ');
    });

    it('should handle special characters in userId', async () => {
      const specialUserIds = ['user@email.com', 'user%20name', 'user/123'];

      for (const userId of specialUserIds) {
        const request = createMockNextRequest({
          method: 'GET',
          url: `http://localhost:3000/api/v1/users/${encodeURIComponent(userId)}`,
        });
        const params = createMockParams({ userId });

        const response = await GET(request, { params });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.message).toContain(userId);
      }
    });
  });
});
