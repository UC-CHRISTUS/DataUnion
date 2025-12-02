import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, handleError } from '@/lib/api/response'

/**
 * GET /api/v1/ajustes
 * Get all "ajustes por tecnología" without pagination
 *
 * Query params:
 * - convenio: (optional) Filter by codigo_convenio (e.g., FNS012, CH0041)
 */
export async function GET(request: NextRequest) {
  try {
    const convenio = request.nextUrl.searchParams.get('convenio')

    let query = supabase
      .from('ajustes_tecnologias')
      .select('*')
      .order('id', { ascending: true })

    if (convenio) {
      query = query.eq('codigo_convenio', convenio)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return successResponse(data || [])
  } catch (error) {
    return handleError(error)
  }
}
