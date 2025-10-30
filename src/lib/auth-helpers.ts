import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create Supabase client with cookie access for server-side
 */
function createSupabaseServerClient() {
  const cookieStore = cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie setting may fail in middleware
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Cookie removal may fail in middleware
          }
        },
      },
    }
  );
}

/**
 * Get the current authenticated user from Supabase
 * Returns user data from public.users table (not auth.users)
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }
  
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', session.user.id)
    .single();
  
  if (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
    
  return userData;
}

/**
 * Require admin role for protected routes
 * Throws error if user is not authenticated or not an admin
 * Use this in API routes that require admin access
 * @returns Admin user object
 * @throws Error if not authenticated or not admin
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  if (user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return user;
}

/**
 * Check if user has specific role
 * @param allowedRoles - Array of allowed roles
 * @returns User object if authorized
 * @throws Error if not authenticated or doesn't have required role
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Unauthorized: Insufficient permissions');
  }
  
  return user;
}

/**
 * Check if current user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user;
}

