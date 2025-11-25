/**
 * Mock Authentication Helpers for Testing
 *
 * This provides mock implementations for auth-related functions
 * used across the API routes.
 */

export interface MockAuthUser {
  id: number;
  auth_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'encoder' | 'finance';
  is_active: boolean;
  must_change_password: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

let mockCurrentUser: MockAuthUser | null = null;
let mockAuthSession: { user: { id: string; email: string } | null } | null = null;

export function setMockCurrentUser(user: MockAuthUser | null) {
  mockCurrentUser = user;
  if (user) {
    mockAuthSession = {
      user: {
        id: user.auth_id,
        email: user.email,
      },
    };
  } else {
    mockAuthSession = { user: null };
  }
}

export function getMockCurrentUser() {
  return mockCurrentUser;
}

export function getMockAuthSession() {
  return mockAuthSession;
}

export function clearMockAuth() {
  mockCurrentUser = null;
  mockAuthSession = null;
}

export const mockGetCurrentUser = jest.fn(async () => mockCurrentUser);

export const mockRequireAdmin = jest.fn(async () => {
  if (!mockCurrentUser) {
    throw new Error('Unauthorized: Authentication required');
  }
  if (mockCurrentUser.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return mockCurrentUser;
});

export const mockRequireRole = jest.fn(async (allowedRoles: string[]) => {
  if (!mockCurrentUser) {
    throw new Error('Unauthorized: Authentication required');
  }
  if (!allowedRoles.includes(mockCurrentUser.role)) {
    throw new Error('Unauthorized: Insufficient permissions');
  }
  return mockCurrentUser;
});

export const mockIsAuthenticated = jest.fn(async () => !!mockCurrentUser);

export class MockSupabaseAuth {
  async signInWithPassword({ email, password }: { email: string; password: string }) {
    if (password === 'wrongpassword') {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      };
    }

    return {
      data: {
        user: { id: 'auth-user-id-123', email },
        session: { access_token: 'mock-token' },
      },
      error: null,
    };
  }

  async signOut() {
    return { error: null };
  }

  async getUser() {
    if (mockAuthSession?.user) {
      return {
        data: { user: mockAuthSession.user },
        error: null,
      };
    }
    return {
      data: { user: null },
      error: null,
    };
  }

  admin = {
    createUser: jest.fn(async ({ email, password }) => {
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
    updateUserById: jest.fn(async (id: string, updates: any) => {
      return { data: { user: { id } }, error: null };
    }),
    deleteUser: jest.fn(async (id: string) => {
      return { data: {}, error: null };
    }),
  };
}

export function createMockSupabaseAuthClient() {
  return {
    auth: new MockSupabaseAuth(),
  };
}
