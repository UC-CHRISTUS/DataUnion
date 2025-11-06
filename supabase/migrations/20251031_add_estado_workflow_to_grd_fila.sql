-- Migration: Add workflow estado field to grd_fila
-- Created: 2025-10-31
-- Description: Implement workflow states for HU-03 (Role-based access control)
-- Author: DataUnion Team

-- ============================================================================
-- OBJETIVO: Implementar sistema de estados para workflow colaborativo
-- 
-- FLUJO DE ESTADOS:
-- 1. borrador_encoder     - Encoder está editando
-- 2. pendiente_finance    - Encoder hizo submit, esperando Finance
-- 3. borrador_finance     - Finance está editando
-- 4. pendiente_admin      - Finance hizo submit, esperando Admin
-- 5. aprobado             - Admin aprobó
-- 6. exportado            - Admin exportó archivo FONASA
-- ============================================================================

-- Step 1: Create ENUM type for workflow states
CREATE TYPE workflow_estado AS ENUM (
  'borrador_encoder',
  'pendiente_finance',
  'borrador_finance',
  'pendiente_admin',
  'aprobado',
  'exportado'
);

-- Step 2: Add estado column to grd_fila
ALTER TABLE grd_fila
ADD COLUMN estado workflow_estado NOT NULL DEFAULT 'borrador_encoder';

-- Step 3: Add index for performance (queries will filter by estado frequently)
CREATE INDEX idx_grd_fila_estado ON grd_fila(estado);

-- Step 4: Add index on id_grd_oficial + estado (common query pattern)
CREATE INDEX idx_grd_fila_grd_oficial_estado ON grd_fila(id_grd_oficial, estado);

-- Step 5: Add comment to document the field
COMMENT ON COLUMN grd_fila.estado IS 'Estado del workflow colaborativo: encoder → finance → admin → exportado';

-- ============================================================================
-- VERIFICACIÓN: Confirmar que el campo se creó correctamente
-- ============================================================================

DO $$
DECLARE
  col_exists boolean;
  enum_exists boolean;
BEGIN
  -- Verificar que el ENUM existe
  SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'workflow_estado'
  ) INTO enum_exists;

  -- Verificar que la columna existe
  SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'grd_fila' 
      AND column_name = 'estado'
  ) INTO col_exists;

  IF enum_exists AND col_exists THEN
    RAISE NOTICE '✅ Migración exitosa: Campo "estado" agregado a grd_fila';
    RAISE NOTICE '✅ ENUM "workflow_estado" creado con 6 estados';
    RAISE NOTICE '✅ Índices creados para optimizar queries por estado';
  ELSE
    RAISE EXCEPTION '❌ Error en migración: Verificar manualmente';
  END IF;
END $$;

-- ============================================================================
-- DATOS DE PRUEBA: Actualizar registros existentes (opcional)
-- ============================================================================

-- Todos los registros existentes quedarán en 'borrador_encoder' por el DEFAULT
-- Si queremos simular diferentes estados para testing, podemos hacerlo aquí:

-- UPDATE grd_fila SET estado = 'pendiente_finance' WHERE episodio IN (SELECT episodio FROM grd_fila LIMIT 10);
-- UPDATE grd_fila SET estado = 'borrador_finance' WHERE episodio IN (SELECT episodio FROM grd_fila LIMIT 5 OFFSET 10);

-- ============================================================================
-- ROLLBACK (en caso de necesitar revertir la migración)
-- ============================================================================

-- Para revertir esta migración, ejecutar:
-- DROP INDEX IF EXISTS idx_grd_fila_estado;
-- DROP INDEX IF EXISTS idx_grd_fila_grd_oficial_estado;
-- ALTER TABLE grd_fila DROP COLUMN IF EXISTS estado;
-- DROP TYPE IF EXISTS workflow_estado;

-- ============================================================================
-- NOTAS TÉCNICAS
-- ============================================================================

-- 1. El DEFAULT asegura que nuevos registros siempre empiecen en 'borrador_encoder'
-- 2. Los índices mejoran performance de queries como:
--    - SELECT * FROM grd_fila WHERE estado = 'pendiente_finance'
--    - SELECT * FROM grd_fila WHERE id_grd_oficial = X AND estado = 'borrador_encoder'
-- 3. El ENUM asegura integridad: solo acepta los 6 valores definidos
-- 4. NOT NULL previene estados indefinidos

