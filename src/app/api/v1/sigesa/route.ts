import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getPaginationParams, calculatePagination } from '@/lib/api/pagination'
import { paginatedResponse, errorResponse, handleError } from '@/lib/api/response'
import { sigesaListQuerySchema } from './route.schema'

/**
 * GET /api/v1/sigesa
 * Get a paginated list of SIGESA documents
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate pagination parameters
    const params = getPaginationParams(request)
    const validation = sigesaListQuerySchema.safeParse({
      page: params.page,
      pageSize: params.pageSize,
    })

    if (!validation.success) {
      return errorResponse('Invalid pagination parameters', 400)
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('sigesa')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    // Get paginated data
    const { data, error } = await supabase
      .from('sigesa')
      .select('*')
      .order('id', { ascending: false })
      .range(params.offset, params.offset + params.limit - 1)

    if (error) {
      throw error
    }

    const response = calculatePagination(data || [], count || 0, params)
    return paginatedResponse(response)
  } catch (error) {
    return handleError(error)
  }
}
