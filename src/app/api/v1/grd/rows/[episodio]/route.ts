import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, handleError } from '@/lib/api/response'
import { updateGrdRowSchema, episodioParamSchema } from './route.schema'

/**
 * PUT /api/v1/grd/rows/[episodio]
 * Update a specific GRD row by episodio number
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ episodio: string }> }
) {
  try {
    const { episodio } = await params

    // Validate episodio parameter
    const episodioValidation = episodioParamSchema.safeParse(episodio)
    if (!episodioValidation.success) {
      return errorResponse('Invalid episodio ID', 400)
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updateGrdRowSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse('Invalid request body', 400)
    }

    // Check if the row exists
    const { data: existingRow, error: fetchError } = await supabase
      .from('grd_fila')
      .select('id')
      .eq('episodio', episodioValidation.data)
      .single()

    if (fetchError || !existingRow) {
      return errorResponse('GRD row not found', 404)
    }

    // Update the row
    const { data, error } = await supabase
      .from('grd_fila')
      .update(validation.data)
      .eq('episodio', episodioValidation.data)
      .select()
      .single()

    if (error) {
      throw error
    }

    return successResponse(data)
  } catch (error) {
    return handleError(error)
  }
}
