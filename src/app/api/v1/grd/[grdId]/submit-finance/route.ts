/**
 * API Route: POST /api/v1/grd/[grdId]/submit-finance
 * 
 * Permite a Finance entregar su trabajo al Admin.
 * Cambia el estado de borrador_finance → pendiente_admin.
 * 
 * Validaciones:
 * - Usuario debe tener rol 'finance'
 * - El archivo debe estar en estado 'borrador_finance' o 'pendiente_finance'
 * 
 * Después del submit:
 * - Todos los campos quedan bloqueados (read-only)
 * - Admin recibe notificación (banner en dashboard)
 * - Las filas pueden tener "Validado" en Sí o No (es opcional)
 * 
 * @author Joaquín Peralta
 * @version 2.1 (Campo Validado es opcional)
 * @date 4 de Diciembre, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth-helpers';

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

    if (user.role !== 'finance') {
      return NextResponse.json(
        {
          success: false,
          error: 'Solo usuarios de Finance pueden entregar archivos al Admin',
        },
        { status: 403 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verificar que el archivo existe y obtener TODAS las filas
    // Nota: Un archivo tiene MÚLTIPLES filas (una por episodio)
    const { data: grdFiles, error: fetchError } = await supabase
      .from('grd_fila')
      .select('id, episodio, estado, id_grd_oficial, validado, n_folio, estado_rn, monto_rn, documentacion')
      .eq('id_grd_oficial', grdId)
      .order('episodio', { ascending: true });

    if (fetchError || !grdFiles || grdFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Archivo GRD no encontrado',
          details: fetchError?.message,
        },
        { status: 404 }
      );
    }

    const firstRow = grdFiles[0]; // Verificar estado con la primera fila

    // Verificar estado actual (puede ser pendiente_finance o borrador_finance)
    const validStates = ['pendiente_finance', 'borrador_finance'];
    if (!validStates.includes(firstRow.estado)) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede entregar. Estado actual: ${firstRow.estado}`,
          expectedStates: validStates,
          currentState: firstRow.estado,
        },
        { status: 400 }
      );
    }

    // ✅ VALIDACIÓN DE CAMPOS OBLIGATORIOS
    // Nota: La columna "Validado" es OPCIONAL. Finance puede marcar filas como Sí o No.
    // El Admin recibirá el archivo con las filas marcadas como están.
    // No se requiere que todas las filas tengan validado=true para entregar.

    // Cambiar estado a pendiente_admin para TODAS las filas del archivo
    const { data: updatedFiles, error: updateError } = await supabase
      .from('grd_fila')
      .update({
        estado: 'pendiente_admin',
      })
      .eq('id_grd_oficial', grdId)
      .select();

    if (updateError || !updatedFiles || updatedFiles.length === 0) {
      console.error('[POST /api/v1/grd/submit-finance] Update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Error al actualizar estado',
          details: updateError?.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Archivo entregado exitosamente al Admin',
      data: {
        grdId: updatedFiles[0].id_grd_oficial,
        rowsUpdated: updatedFiles.length,
        previousState: firstRow.estado,
        currentState: updatedFiles[0].estado,
      },
    });

  } catch (error) {
    console.error('[POST /api/v1/grd/submit-finance] Unexpected error:', error);
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
