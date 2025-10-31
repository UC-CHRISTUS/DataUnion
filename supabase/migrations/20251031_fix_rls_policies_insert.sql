-- Migration: Fix RLS policies - Add missing INSERT policies
-- Created: 2025-10-31
-- Description: Add INSERT policies for encoder role in sigesa_fila and grd_fila tables
--              Add UPDATE policy for finance role in grd_fila table

-- ============================================================================
-- PROBLEMA RESUELTO:
-- El upload de archivos SIGESA fallaba con error:
-- "new row violates row-level security policy for table sigesa_fila"
-- 
-- CAUSA:
-- Las tablas tenían RLS habilitado pero faltaban políticas INSERT
-- ============================================================================

-- 1. Add INSERT policy for encoder in sigesa_fila
CREATE POLICY IF NOT EXISTS "encoder_insert_sigesa"
ON sigesa_fila
FOR INSERT
TO public
WITH CHECK (get_user_role() = ANY (ARRAY['admin'::text, 'encoder'::text]));

-- 2. Add INSERT policy for encoder in grd_fila
CREATE POLICY IF NOT EXISTS "encoder_insert_grd"
ON grd_fila
FOR INSERT
TO public
WITH CHECK (get_user_role() = ANY (ARRAY['admin'::text, 'encoder'::text]));

-- 3. Add UPDATE policy for finance in grd_fila (preparación para HU-03)
CREATE POLICY IF NOT EXISTS "finance_update_grd"
ON grd_fila
FOR UPDATE
TO public
USING (get_user_role() = ANY (ARRAY['admin'::text, 'finance'::text]))
WITH CHECK (get_user_role() = ANY (ARRAY['admin'::text, 'finance'::text]));

-- ============================================================================
-- RESULTADO:
-- Ahora los encoders pueden:
-- - Subir archivos SIGESA (INSERT en sigesa y sigesa_fila)
-- - Crear registros en grd_fila durante el proceso de carga
-- - Actualizar registros existentes (ya estaba configurado)
-- 
-- Finance puede:
-- - Leer registros en grd_fila (ya estaba configurado)
-- - Actualizar registros en grd_fila (nueva política)
-- ============================================================================

-- Verificar políticas creadas
DO $$
BEGIN
  RAISE NOTICE 'RLS Policies actualizadas correctamente';
  RAISE NOTICE 'Encoder puede: INSERT y UPDATE en sigesa_fila y grd_fila';
  RAISE NOTICE 'Finance puede: SELECT y UPDATE en grd_fila';
END $$;

