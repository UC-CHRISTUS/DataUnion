import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { successResponse, errorResponse, handleError } from '@/lib/api/response'
import { updateGrdRowSchema, episodioParamSchema } from './route.schema'
import { getCurrentUser } from '@/lib/auth-helpers'

/**
 * PUT /api/v1/grd/rows/[episodio]
 * Update a specific GRD row by episodio number
 * 
 * WORKFLOW VALIDATION:
 * - Encoder can only edit when estado = 'borrador_encoder'
 * - Finance can only edit when estado = 'pendiente_finance' or 'borrador_finance'
 * - Admin cannot edit (read-only)
 * - Fields are role-restricted
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

    // Get current authenticated user
    const user = await getCurrentUser()
    if (!user) {
      return errorResponse('No autenticado', 401)
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Check if the row exists and get its current state
    const { data: existingRow, error: fetchError } = await supabaseAdmin
      .from('grd_fila')
      .select('id, episodio, estado, id_grd_oficial')
      .eq('episodio', episodioValidation.data)
      .single()

    if (fetchError || !existingRow) {
      return errorResponse('GRD row not found', 404)
    }

    // Workflow validation based on role and estado
    const { estado } = existingRow
    const { role } = user

    // Encoder can edit in borrador_encoder or rechazado (to fix rejections)
    if (role === 'encoder' && !['borrador_encoder', 'rechazado'].includes(estado)) {
      return errorResponse(
        `No puedes editar en estado: ${estado}. Solo puedes editar en 'borrador_encoder' o cuando el archivo es 'rechazado'.`,
        403
      )
    }

    // Finance can only edit in pendiente_finance or borrador_finance
    if (role === 'finance' && !['pendiente_finance', 'borrador_finance'].includes(estado)) {
      return errorResponse(
        `No puedes editar en estado: ${estado}. Solo puedes editar cuando el archivo está pendiente o en borrador de Finance.`,
        403
      )
    }

    // Admin cannot edit (read-only)
    if (role === 'admin') {
      return errorResponse(
        'Los Admins no pueden editar datos. Solo pueden aprobar, rechazar o exportar.',
        403
      )
    }

    // If Finance is editing for the first time (pendiente_finance), change to borrador_finance
    let updatedEstado = estado
    if (role === 'finance' && estado === 'pendiente_finance') {
      updatedEstado = 'borrador_finance'
    }
    
    // If Encoder is fixing a rejection (rechazado), change to borrador_encoder
    if (role === 'encoder' && estado === 'rechazado') {
      updatedEstado = 'borrador_encoder'
    }

    // Update the row with the new estado if needed
    const updateData = {
      ...validation.data,
      ...(updatedEstado !== estado && { estado: updatedEstado }),
    }

    const { data, error } = await supabaseAdmin
      .from('grd_fila')
      .update(updateData)
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
