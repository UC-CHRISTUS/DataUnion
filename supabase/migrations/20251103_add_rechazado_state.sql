-- Migration: Add 'rechazado' state to workflow_estado ENUM
-- Created: 2025-11-03
-- Description: Add rejection state for Admin workflow (HU-03 Phase 1 completion)
-- Author: DataUnion Team
-- Priority: CRITICAL BLOCKER for HU-03 implementation

-- ============================================================================
-- OBJETIVO: Completar el flujo de workflow con estado de rechazo
-- 
-- NUEVO FLUJO DE ESTADOS (7 estados):
-- 1. borrador_encoder     - Encoder está editando
-- 2. pendiente_finance    - Encoder hizo submit, esperando Finance
-- 3. borrador_finance     - Finance está editando
-- 4. pendiente_admin      - Finance hizo submit, esperando Admin
-- 5. aprobado             - Admin aprobó
-- 6. exportado            - Admin exportó archivo FONASA
-- 7. rechazado            - Admin rechazó, vuelve a Encoder (NUEVO)
--
-- FLUJO DE RECHAZO:
-- pendiente_admin → [Admin rechaza] → rechazado → [Encoder abre editor] → borrador_encoder
-- ============================================================================

-- Step 1: Add 'rechazado' value to workflow_estado ENUM
-- NOTA: ALTER TYPE ADD VALUE no puede ejecutarse dentro de un bloque de transacción
-- por lo que debe estar fuera de BEGIN/COMMIT
ALTER TYPE workflow_estado ADD VALUE IF NOT EXISTS 'rechazado';

-- Step 2: Add comment documenting the new state
COMMENT ON TYPE workflow_estado IS 'Estados del workflow colaborativo: borrador_encoder → pendiente_finance → borrador_finance → pendiente_admin → aprobado/rechazado → exportado. El estado rechazado permite que Admin devuelva el archivo al Encoder para correcciones.';

-- ============================================================================
-- VERIFICACIÓN: Confirmar que el nuevo valor se agregó correctamente
-- ============================================================================

DO $$
DECLARE
  enum_values text[];
  has_rechazado boolean;
BEGIN
  -- Obtener todos los valores del ENUM
  SELECT array_agg(enumlabel::text ORDER BY enumsortorder)
  INTO enum_values
  FROM pg_enum
  WHERE enumtypid = 'workflow_estado'::regtype;

  -- Verificar si 'rechazado' está en el array
  has_rechazado := 'rechazado' = ANY(enum_values);

  IF has_rechazado THEN
    RAISE NOTICE '✅ Migración exitosa: Estado "rechazado" agregado a workflow_estado';
    RAISE NOTICE '✅ Total de estados en ENUM: %', array_length(enum_values, 1);
    RAISE NOTICE '✅ Estados disponibles: %', array_to_string(enum_values, ', ');
  ELSE
    RAISE EXCEPTION '❌ Error: Estado "rechazado" no fue agregado correctamente';
  END IF;
END $$;

-- ============================================================================
-- DATOS DE PRUEBA: Simular un rechazo (opcional, comentado por defecto)
-- ============================================================================

-- Para testing, puedes descomentar la siguiente línea para marcar un registro como rechazado:
-- UPDATE grd_fila SET estado = 'rechazado' WHERE episodio = (SELECT episodio FROM grd_fila LIMIT 1);

-- ============================================================================
-- NOTAS TÉCNICAS
-- ============================================================================

-- 1. ALTER TYPE ADD VALUE es una operación que NO puede revertirse automáticamente
-- 2. Si necesitas eliminar el valor 'rechazado', deberás:
--    a. Eliminar todas las referencias en las tablas (UPDATE a otro valor)
--    b. Recrear el ENUM completo sin ese valor
--    c. Reconvertir la columna al nuevo ENUM
-- 3. IF NOT EXISTS previene errores si la migración se ejecuta múltiples veces
-- 4. El nuevo estado NO afecta registros existentes (conservan sus estados actuales)
-- 5. Los índices creados en la migración anterior (idx_grd_fila_estado) 
--    automáticamente incluirán el nuevo valor 'rechazado'

-- ============================================================================
-- SIGUIENTE PASO: Regenerar TypeScript Types
-- ============================================================================

-- Después de aplicar esta migración, debes regenerar los tipos TypeScript:
-- npx supabase gen types typescript --project-id cgjeiyevnlypgghsfemc > src/types/database.types.ts
-- 
-- O usando Supabase CLI local:
-- supabase gen types typescript --local > src/types/database.types.ts

-- ============================================================================
-- VALIDACIÓN POST-MIGRACIÓN
-- ============================================================================

-- Query para verificar todos los estados disponibles:
-- SELECT enumlabel as estado, enumsortorder as orden
-- FROM pg_enum
-- WHERE enumtypid = 'workflow_estado'::regtype
-- ORDER BY enumsortorder;

-- Query para ver distribución de estados actual:
-- SELECT estado, COUNT(*) as total
-- FROM grd_fila
-- GROUP BY estado
-- ORDER BY estado;
