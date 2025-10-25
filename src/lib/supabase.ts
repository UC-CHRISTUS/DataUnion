import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

if(!process.env.SUPABASE_URL) throw new Error('SUPABASE_URL is not defined')
if(!process.env.SUPABASE_PUBLISHABLE_KEY) throw new Error('SUPABASE_PUBLISHABLE_KEY is not defined')

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
)