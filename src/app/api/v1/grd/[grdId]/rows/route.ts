import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getPaginationParams, calculatePagination } from '@/lib/api/pagination'
import { paginatedResponse, errorResponse, handleError } from '@/lib/api/response'
import { grdRowsQuerySchema, grdIdParamSchema } from './route.schema'

/**
 * GET /api/v1/grd/[grdId]/rows
 * Get paginated list of GRD rows for a specific GRD document with their "ajustes por tecnología"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ grdId: string }> }
) {
  try {
    const { grdId } = await params

    // Validate grdId parameter
    const grdIdValidation = grdIdParamSchema.safeParse(grdId)
    if (!grdIdValidation.success) {
      return errorResponse('Invalid GRD ID', 400)
    }

    // Parse and validate pagination parameters
    const paginationParams = getPaginationParams(request)
    const validation = grdRowsQuerySchema.safeParse({
      page: paginationParams.page,
      pageSize: paginationParams.pageSize,
    })

    if (!validation.success) {
      return errorResponse('Invalid pagination parameters', 400)
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('grd_fila')
      .select('*', { count: 'exact', head: true })
      .eq('id_grd_oficial', grdIdValidation.data)

    if (countError) {
      throw countError
    }

    // Get paginated data with episodio_AT join
    const { data: grdFilas, error } = await supabase
      .from('grd_fila')
      .select(
        `
        *,
        episodio_AT (
          id,
          id_AT,
          ajustes_tecnologias (
            id,
            codigo,
            AT,
            valor
          )
        )
      `
      )
      .eq('id_grd_oficial', grdIdValidation.data)
      .order('id', { ascending: false })
      .range(paginationParams.offset, paginationParams.offset + paginationParams.limit - 1)

    if (error) {
      throw error
    }

    const response = calculatePagination(grdFilas || [], count || 0, paginationParams)
    return paginatedResponse(response)
  } catch (error) {
    return handleError(error)
  }
}
