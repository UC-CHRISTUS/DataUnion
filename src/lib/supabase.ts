import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// Server-side Supabase client (para API routes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) throw new Error('SUPABASE_URL is not defined')
if (!supabaseAnonKey) throw new Error('SUPABASE_ANON_KEY is not defined')

// Regular client (anon key) for public operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Admin client with Service Role Key
 * ⚠️ DANGER: Only use in server-side API routes
 * This client bypasses Row Level Security (RLS)
 * 
 * Usage: Admin operations like creating users
 */
export const getSupabaseAdmin = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined. Check your .env.local file.')
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}