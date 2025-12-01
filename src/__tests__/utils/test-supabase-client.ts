/**
 * Enhanced Supabase Test Client
 *
 * Extends the base MockSupabaseClient to include authentication methods.
 * This allows testing endpoints that use both database and auth operations.
 */

import { MockSupabaseClient } from '../mocks/supabase.mock';

export interface AuthResponse {
  data: {
    user: { id: string; email: string } | null;
    session: { access_token: string } | null;
  };
  error: { message: string } | null;
}

export class TestSupabaseClient extends MockSupabaseClient {
  private authBehavior: {
    signInHandler?: (email: string, password: string) => AuthResponse;
    getUserHandler?: () => { data: { user: any }; error: any };
  } = {};

  auth = {
    signInWithPassword: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<AuthResponse> => {
      if (this.authBehavior.signInHandler) {
        return this.authBehavior.signInHandler(email, password);
      }

      return {
        data: {
          user: { id: 'default-auth-id', email },
          session: { access_token: 'mock-token' },
        },
        error: null,
      };
    },

    signOut: async () => {
      return { error: null };
    },

    getUser: async () => {
      if (this.authBehavior.getUserHandler) {
        return this.authBehavior.getUserHandler();
      }

      return {
        data: { user: null },
        error: null,
      };
    },

    admin: {
      createUser: async ({ email, password }: { email: string; password?: string }) => {
        return {
          data: {
            user: {
              id: `auth-${email}`,
              email,
            },
          },
          error: null,
        };
      },

      updateUserById: async (id: string, updates: any) => {
        return { data: { user: { id } }, error: null };
      },

      deleteUser: async (id: string) => {
        return { data: {}, error: null };
      },
    },
  };

  setAuthSignInHandler(
    handler: (email: string, password: string) => AuthResponse
  ) {
    this.authBehavior.signInHandler = handler;
  }

  setAuthGetUserHandler(handler: () => { data: { user: any }; error: any }) {
    this.authBehavior.getUserHandler = handler;
  }
}

export function createTestSupabaseClient(initialData?: Record<string, any[]>) {
  return new TestSupabaseClient(initialData);
}
