/**
 * API: GET /api/v1/admin/approved-files
 * 
 * Descripción: Obtiene lista de archivos aprobados
 * Roles permitidos: admin
 * 
 * FASE 2: Lista simple de archivos aprobados para Admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    // 1. Verificar autenticación y rol admin
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requiere rol de administrador.' },
        { status: 403 }
      );
    }

    const supabase = createClient();

    // 2. Obtener archivos APROBADOS únicamente
    const { data: files, error } = await supabase
      .from('grd_fila')
      .select('id_grd_oficial, estado')
      .eq('estado', 'aprobado');

    if (error) {
      console.error('Error fetching approved files:', error);
      return NextResponse.json(
        { error: 'Error al obtener archivos aprobados' },
        { status: 500 }
      );
    }

    // 3. Agrupar por id_grd_oficial (cada archivo puede tener múltiples filas)
    const uniqueFiles = files?.reduce((acc: any[], file) => {
      const exists = acc.find((f: any) => f.id_grd_oficial === file.id_grd_oficial);
      if (!exists) {
        acc.push(file);
      }
      return acc;
    }, []) || [];

    // 4. Para cada archivo, obtener estadísticas
    const filesWithStats = await Promise.all(
      uniqueFiles.map(async (file: any) => {
        const { count } = await supabase
          .from('grd_fila')
          .select('*', { count: 'exact', head: true })
          .eq('id_grd_oficial', file.id_grd_oficial);

        return {
          id_grd_oficial: file.id_grd_oficial,
          nombre_archivo: `GRD_${file.id_grd_oficial}.xlsx`,
          estado: file.estado,
          total_filas: count || 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      files: filesWithStats,
      total: filesWithStats.length,
    });

  } catch (error: any) {
    console.error('Error in GET /api/v1/admin/approved-files:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
