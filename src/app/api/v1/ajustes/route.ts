import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, handleError } from '@/lib/api/response'

/**
 * GET /api/v1/ajustes
 * Get all "ajustes por tecnología" without pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('ajustes_tecnologias')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      throw error
    }

    return successResponse(data || [])
  } catch (error) {
    return handleError(error)
  }
}
