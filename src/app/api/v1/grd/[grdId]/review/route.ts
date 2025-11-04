/**
 * API Route: POST /api/v1/grd/[grdId]/review
 * 
 * Permite al Admin aprobar o rechazar un archivo.
 * 
 * Acciones posibles:
 * - approve: pendiente_admin → aprobado (habilita exportación)
 * - reject: pendiente_admin → rechazado (notifica a Encoder)
 * 
 * Validaciones:
 * - Usuario debe tener rol 'admin'
 * - El archivo debe estar en estado 'pendiente_admin'
 * 
 * Body:
 * {
 *   "action": "approve" | "reject",
 *   "reason": "string (opcional para approve, recomendado para reject)"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth-helpers';

type ReviewAction = 'approve' | 'reject';

interface ReviewBody {
  action: ReviewAction;
  reason?: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ grdId: string }> }
) {
  try {
    const params = await context.params;
    const grdId = parseInt(params.grdId);

    if (isNaN(grdId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de GRD inválido',
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body: ReviewBody = await request.json();

    if (!body.action || !['approve', 'reject'].includes(body.action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Acción inválida. Debe ser "approve" o "reject"',
        },
        { status: 400 }
      );
    }

    // Verificar autenticación y rol
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autenticado',
        },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Solo los Admins pueden aprobar o rechazar archivos',
        },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verificar que el archivo existe y está en el estado correcto
    const { data: grdFile, error: fetchError } = await supabase
      .from('grd_fila')
      .select('id, episodio, estado, id_grd_oficial')
      .eq('id_grd_oficial', grdId)
      .single();

    if (fetchError || !grdFile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Archivo GRD no encontrado',
          details: fetchError?.message,
        },
        { status: 404 }
      );
    }

    // Verificar estado actual
    if (grdFile.estado !== 'pendiente_admin') {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede revisar. Estado actual: ${grdFile.estado}`,
          expectedState: 'pendiente_admin',
          currentState: grdFile.estado,
        },
        { status: 400 }
      );
    }

    // Determinar nuevo estado según la acción
    const newState = body.action === 'approve' ? 'aprobado' : 'rechazado';

    // Actualizar estado
    const { data: updatedFile, error: updateError } = await supabase
      .from('grd_fila')
      .update({
        estado: newState,
        // Opcionalmente podríamos guardar el reason en un campo 'documentacion' o crear un campo nuevo
        ...(body.reason && { documentacion: body.reason }),
      })
      .eq('id_grd_oficial', grdId)
      .select()
      .single();

    if (updateError) {
      console.error('[POST /api/v1/grd/review] Update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al actualizar estado',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    // Preparar mensaje de respuesta
    const actionMessage = body.action === 'approve'
      ? 'Archivo aprobado exitosamente. Ahora puede exportarse.'
      : 'Archivo rechazado. El Encoder recibirá notificación.';

    return NextResponse.json({
      success: true,
      message: actionMessage,
      data: {
        grdId: updatedFile.id_grd_oficial,
        episodio: updatedFile.episodio,
        action: body.action,
        previousState: 'pendiente_admin',
        currentState: updatedFile.estado,
        reason: body.reason,
      },
    });

  } catch (error) {
    console.error('[POST /api/v1/grd/review] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
