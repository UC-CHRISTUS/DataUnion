import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, handleError } from '@/lib/api/response'
import { grdParamSchema } from './route.schema'

/**
 * GET /api/v1/norma-minsal/[grd]
 * Get a specific norma minsal record by GRD field
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ grd: string }> }
) {
  try {
    const { grd } = await params

    // Validate GRD parameter
    const grdValidation = grdParamSchema.safeParse(grd)
    if (!grdValidation.success) {
      return errorResponse('Invalid GRD parameter', 400)
    }

    // Query by GRD field (not by id)
    const { data, error } = await supabase
      .from('norma_minsal')
      .select('*')
      .eq('GRD', grdValidation.data)
      .single()

    if (error || !data) {
      return errorResponse('Norma minsal not found', 404)
    }

    return successResponse(data)
  } catch (error) {
    return handleError(error)
  }
}