'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ExcelEditor from "@/components/ExcelEditor";
import { createClient } from "@/lib/supabase/client";

/**
 * VisualizatorPage - Página del Editor de GRD
 * 
 * Versión completa con soporte para workflow completo incluyendo:
 * - Botones Submit de Encoder y Finance (BLOQUES 4-5)
 * - Botones Aprobar/Rechazar de Admin (BLOQUE 6)
 * - Validación de acceso por rol y estado
 * - Soporte para estado 'rechazado'
 */
export default function VisualizatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Props para ExcelEditor
  const [role, setRole] = useState<'admin' | 'encoder' | 'finance' | null>(null);
  const [grdId, setGrdId] = useState<string | null>(null);
  const [estado, setEstado] = useState<'borrador_encoder' | 'pendiente_finance' | 'borrador_finance' | 'pendiente_admin' | 'aprobado' | 'exportado' | 'rechazado' | null>(null);
  const [filterOnlyAT, setFilterOnlyAT] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();

        // 1. Obtener sesión y rol del usuario
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // Obtener datos del usuario desde public.users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('auth_id', session.user.id)
          .single();

        if (userError || !userData) {
          setError('No se pudo obtener el rol del usuario');
          setLoading(false);
          return;
        }

        const userRole = userData.role as 'admin' | 'encoder' | 'finance';
        setRole(userRole);

        // 2. Obtener archivo activo en workflow (incluye estado rechazado para encoder)
        const { data: workflowData, error: workflowError } = await supabase
          .from('grd_fila')
          .select('id_grd_oficial, estado')
          .in('estado', ['borrador_encoder', 'pendiente_finance', 'borrador_finance', 'pendiente_admin', 'rechazado'])
          .limit(1)
          .maybeSingle();

        if (workflowError) {
          console.error('Error al obtener workflow:', workflowError);
          setError('Error al cargar el archivo');
          setLoading(false);
          return;
        }

        if (!workflowData) {
          setError('No hay ningún archivo en proceso actualmente');
          setLoading(false);
          return;
        }

        // 3. Validar acceso según rol y estado
        const allowedStates: Record<string, string[]> = {
          encoder: ['borrador_encoder', 'rechazado'], // Encoder puede ver archivos rechazados para corregir
          finance: ['pendiente_finance', 'borrador_finance'],
          admin: ['pendiente_admin', 'aprobado', 'exportado'],
        };

        if (!allowedStates[userRole]?.includes(workflowData.estado)) {
          setError(`No tienes acceso a este archivo en estado: ${workflowData.estado}`);
          setLoading(false);
          return;
        }

        // Todo OK - establecer datos
        setGrdId(workflowData.id_grd_oficial.toString());
        setEstado(workflowData.estado as 'borrador_encoder' | 'pendiente_finance' | 'borrador_finance' | 'pendiente_admin' | 'aprobado' | 'exportado' | 'rechazado');
        setLoading(false);

      } catch (err) {
        console.error('Error inesperado:', err);
        setError('Error al cargar la página');
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Estados de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-white-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-red-600 text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            No disponible
          </h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (!role || !grdId || !estado) {
    return (
      <div className="min-h-screen bg-white-100 flex items-center justify-center">
        <div className="text-gray-600">No se pudieron cargar los datos</div>
      </div>
    );
  }

  // Renderizar ExcelEditor con props correctas
  return (
    <div className="min-h-screen bg-white-100 p-6">
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Editor de GRD</h1>
            <p className="text-sm text-gray-600 mt-1">
              Archivo #{grdId} - Estado: <span className="font-medium">{estado}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Rol: {role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Alerta si el archivo fue rechazado */}
      {estado === 'rechazado' && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-600 rounded-lg shadow p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Archivo Rechazado por el Administrador
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Este archivo fue rechazado. Por favor revisa los comentarios del administrador, realiza las correcciones necesarias y vuelve a enviarlo.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtro de AT - Solo para Admin */}
      {role === 'admin' && (
        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filterOnlyAT}
              onChange={(e) => setFilterOnlyAT(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              🔍 Solo episodios con Ajustes Tecnológicos (AT)
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-2 ml-6">
            Este filtro es solo visual. No afecta la exportación del archivo.
          </p>
        </div>
      )}
      
      <ExcelEditor 
        role={role}
        grdId={grdId}
        estado={estado}
        filterOnlyAT={filterOnlyAT}
      />
    </div>
  );
}
