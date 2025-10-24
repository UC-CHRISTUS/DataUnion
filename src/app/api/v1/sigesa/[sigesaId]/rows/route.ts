import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getPaginationParams, calculatePagination } from '@/lib/api/pagination'
import { paginatedResponse, errorResponse, handleError } from '@/lib/api/response'
import { sigesaRowsQuerySchema, sigesaIdParamSchema } from './route.schema'

/**
 * GET /api/v1/sigesa/[sigesaId]/rows
 * Get paginated list of SIGESA rows for a specific SIGESA document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sigesaId: string }> }
) {
  try {
    const { sigesaId } = await params

    // Validate sigesaId parameter
    const sigesaIdValidation = sigesaIdParamSchema.safeParse(sigesaId)
    if (!sigesaIdValidation.success) {
      return errorResponse('Invalid SIGESA ID', 400)
    }

    // Parse and validate pagination parameters
    const paginationParams = getPaginationParams(request)
    const validation = sigesaRowsQuerySchema.safeParse({
      page: paginationParams.page,
      pageSize: paginationParams.pageSize,
    })

    if (!validation.success) {
      return errorResponse('Invalid pagination parameters', 400)
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('sigesa_fila')
      .select('*', { count: 'exact', head: true })
      .eq('id_archivo_sigesa', sigesaIdValidation.data)

    if (countError) {
      throw countError
    }

    // Get paginated data
    const { data, error } = await supabase
      .from('sigesa_fila')
      .select('*')
      .eq('id_archivo_sigesa', sigesaIdValidation.data)
      .order('id', { ascending: false })
      .range(paginationParams.offset, paginationParams.offset + paginationParams.limit - 1)

    if (error) {
      throw error
    }

    const response = calculatePagination(data || [], count || 0, paginationParams)
    return paginatedResponse(response)
  } catch (error) {
    return handleError(error)
  }
}
