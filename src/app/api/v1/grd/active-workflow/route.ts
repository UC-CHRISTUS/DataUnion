/**
 * API Route: GET /api/v1/grd/active-workflow
 * 
 * Verifica si existe algún archivo en flujo activo (workflow).
 * Solo puede haber UN archivo en flujo a la vez.
 * 
 * Estados considerados "en flujo activo":
 * - borrador_encoder
 * - pendiente_finance
 * - borrador_finance
 * - pendiente_admin
 * 
 * Estados que liberan el sistema (NO bloquean):
 * - aprobado (pero aún no exportado)
 * - exportado
 * - rechazado (transitorio, vuelve a borrador_encoder al abrir editor)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const ACTIVE_WORKFLOW_STATES = [
  'borrador_encoder',
  'pendiente_finance',
  'borrador_finance',
  'pendiente_admin',
] as const;

export async function GET(request: NextRequest) {
  try {
    // Crear cliente de Supabase con service role key
    const supabase = getSupabaseAdmin();

    // Buscar archivos en estados de flujo activo
    const { data: activeFiles, error } = await supabase
      .from('grd_fila')
      .select('id_grd_oficial, episodio, estado')
      .in('estado', ACTIVE_WORKFLOW_STATES)
      .limit(1);

    if (error) {
      console.error('[GET /api/v1/grd/active-workflow] Database error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al verificar workflow activo',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Si hay archivos en flujo activo
    const hasActiveWorkflow = activeFiles && activeFiles.length > 0;

    if (hasActiveWorkflow) {
      const activeFile = activeFiles[0];
      return NextResponse.json({
        success: true,
        hasActiveWorkflow: true,
        grdId: activeFile.id_grd_oficial,
        episodio: activeFile.episodio,
        estado: activeFile.estado,
        message: 'Existe un archivo en flujo activo. No se puede cargar otro hasta completar o rechazar el actual.',
      });
    }

    // No hay archivos en flujo activo
    return NextResponse.json({
      success: true,
      hasActiveWorkflow: false,
      grdId: null,
      episodio: null,
      estado: null,
      message: 'No hay archivos en flujo activo. Se puede cargar un nuevo archivo.',
    });

  } catch (error) {
    console.error('[GET /api/v1/grd/active-workflow] Unexpected error:', error);
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
