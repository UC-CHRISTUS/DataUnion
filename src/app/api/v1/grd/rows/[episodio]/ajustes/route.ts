import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, handleError } from '@/lib/api/response'
import { createAjusteSchema, episodioParamSchema } from './route.schema'

/**
 * POST /api/v1/grd/rows/[episodio]/ajustes
 * Add a new "ajuste por tecnología" to a specific GRD row
 */
export async function POST(
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
    const validation = createAjusteSchema.safeParse(body)

    if (!validation.success) {
      return errorResponse('Invalid request body', 400)
    }

    // Check if the GRD row exists
    const { data: existingRow, error: fetchError } = await supabase
      .from('grd_fila')
      .select('id')
      .eq('episodio', episodioValidation.data)
      .single()

    if (fetchError || !existingRow) {
      return errorResponse('GRD row not found', 404)
    }

    // Check if the ajuste tecnología exists
    const { data: existingAjuste, error: ajusteError } = await supabase
      .from('ajustes_tecnologias')
      .select('id')
      .eq('id', validation.data.id_AT)
      .single()

    if (ajusteError || !existingAjuste) {
      return errorResponse('Ajuste tecnología not found', 404)
    }

    // Create the episodio_AT entry
    const { data, error } = await supabase
      .from('episodio_AT')
      .insert({
        n_episodio: episodioValidation.data,
        id_AT: validation.data.id_AT,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return successResponse(data, 201)
  } catch (error) {
    return handleError(error)
  }
}
