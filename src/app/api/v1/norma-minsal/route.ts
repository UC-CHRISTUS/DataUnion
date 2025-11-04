import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, handleError } from '@/lib/api/response'

/**
 * GET /api/v1/norma-minsal
 * Get all norma minsal records without pagination
 */
export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('norma_minsal')
      .select('*')
      .order('GRD', { ascending: true })

    if (error) {
      throw error
    }

    return successResponse(data || [])
  } catch (error) {
    return handleError(error)
  }
}