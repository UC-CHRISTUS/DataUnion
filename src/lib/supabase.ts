import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

// Server-side Supabase client (para API routes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl) throw new Error('SUPABASE_URL is not defined')
if (!supabaseAnonKey) throw new Error('SUPABASE_ANON_KEY is not defined')

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)