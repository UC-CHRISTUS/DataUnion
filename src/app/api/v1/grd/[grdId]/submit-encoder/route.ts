/**
 * API Route: POST /api/v1/grd/[grdId]/submit-encoder
 * 
 * Permite al Encoder entregar su trabajo a Finance.
 * Cambia el estado de borrador_encoder → pendiente_finance.
 * 
 * Validaciones:
 * - Usuario debe tener rol 'encoder'
 * - El archivo debe estar en estado 'borrador_encoder'
 * - Todos los campos obligatorios del Encoder deben estar completos
 * 
 * Después del submit:
 * - Campos del Encoder quedan bloqueados (read-only)
 * - Finance recibe notificación (banner en dashboard)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: { grdId: string } }
) {
  try {
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

    if (user.role !== 'encoder') {
      return NextResponse.json(
        {
          success: false,
          error: 'Solo los Encoders pueden entregar archivos a Finance',
        },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verificar que el archivo existe y está en el estado correcto
    const { data: grdFile, error: fetchError } = await supabase
      .from('grd_fila')
      .select('id, episodio, estado, id_grd_oficial, AT, AT_detalle')
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
    if (grdFile.estado !== 'borrador_encoder') {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede entregar. Estado actual: ${grdFile.estado}`,
          expectedState: 'borrador_encoder',
          currentState: grdFile.estado,
        },
        { status: 400 }
      );
    }

    // Validar que los campos obligatorios del Encoder estén completos
    const missingFields: string[] = [];
    
    // AT es opcional, pero si está en true, AT_detalle es obligatorio
    if (grdFile.AT === true && !grdFile.AT_detalle) {
      missingFields.push('AT_detalle (requerido cuando AT = Sí)');
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos obligatorios',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Cambiar estado a pendiente_finance
    const { data: updatedFile, error: updateError } = await supabase
      .from('grd_fila')
      .update({
        estado: 'pendiente_finance',
      })
      .eq('id_grd_oficial', grdId)
      .select()
      .single();

    if (updateError) {
      console.error('[POST /api/v1/grd/submit-encoder] Update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al actualizar estado',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Archivo entregado exitosamente a Finance',
      data: {
        grdId: updatedFile.id_grd_oficial,
        episodio: updatedFile.episodio,
        previousState: 'borrador_encoder',
        currentState: updatedFile.estado,
      },
    });

  } catch (error) {
    console.error('[POST /api/v1/grd/submit-encoder] Unexpected error:', error);
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
