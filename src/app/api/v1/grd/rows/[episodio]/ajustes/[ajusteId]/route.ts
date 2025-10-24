import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { successResponse, errorResponse, handleError } from '@/lib/api/response'
import { episodioSchema, idSchema } from '@/lib/api/validation'

/**
 * DELETE /api/v1/grd/rows/[episodio]/ajustes/[ajusteId]
 * Delete an "ajuste por tecnología" from a specific GRD row
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ episodio: string; ajusteId: string }> }
) {
  try {
    const { episodio, ajusteId } = await params

    // Validate episodio parameter
    const episodioValidation = episodioSchema.safeParse(episodio)
    if (!episodioValidation.success) {
      return errorResponse('Invalid episodio ID', 400)
    }

    // Validate ajusteId parameter
    const ajusteIdValidation = idSchema.safeParse(ajusteId)
    if (!ajusteIdValidation.success) {
      return errorResponse('Invalid ajuste ID', 400)
    }

    // Check if the episodio_AT entry exists
    const { data: existingEntry, error: fetchError } = await supabase
      .from('episodio_AT')
      .select('id')
      .eq('n_episodio', episodioValidation.data)
      .eq('id', ajusteIdValidation.data)
      .single()

    if (fetchError || !existingEntry) {
      return errorResponse('Ajuste not found for this episodio', 404)
    }

    // Delete the episodio_AT entry
    const { error } = await supabase
      .from('episodio_AT')
      .delete()
      .eq('id', ajusteIdValidation.data)

    if (error) {
      throw error
    }

    return successResponse({ message: 'Ajuste deleted successfully' })
  } catch (error) {
    return handleError(error)
  }
}
