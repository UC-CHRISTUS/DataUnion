import { z } from 'zod'
import { episodioSchema } from '@/lib/api/validation'

/**
 * Schema for updating a GRD row
 * All fields are optional except id and episodio which cannot be updated
 */
export const updateGrdRowSchema = z.object({
  validado: z
    .union([
      z.boolean(),
      z.string().transform((val) => {
        if (val === 'true' || val === 'Si' || val === 'Sí' || val === 'YES' || val === '1') return true
        if (val === 'false' || val === 'No' || val === 'NO' || val === '0') return false
        return null
      })
    ])
    .nullable()
    .optional(),
  centro: z.string().nullable().optional(),
  n_folio: z
    .union([
      z.string(),
      z.number().transform(v => String(v))
    ])
    .nullable()
    .optional(),
  rut_paciente: z.string().nullable().optional(),
  nombre_paciente: z.string().nullable().optional(),
  tipo_episodio: z.string().nullable().optional(),
  fecha_ingreso: z.string().nullable().optional(),
  fecha_alta: z.string().nullable().optional(),
  servicios_alta: z.string().nullable().optional(),
  estado_rn: z.string().nullable().optional(),
  AT: z
    .union([
      z.boolean(),
      z.string().transform((val) => {
        if (val === 'true' || val === 'Si' || val === 'Sí' || val === 'YES' || val === '1') return true
        if (val === 'false' || val === 'No' || val === 'NO' || val === '0') return false
        return null
      })
    ])
    .nullable()
    .optional(),
  AT_detalle: z.string().nullable().optional(),
  monto_AT: z.number().nullable().optional(),
  tipo_alta: z.string().nullable().optional(),
  'IR-GRD': z.string().nullable().optional(),
  peso: z.number().nullable().optional(),
  monto_rn: z.number().nullable().optional(),
  dias_demora_rescate_hospital: z.number().nullable().optional(),
  pago_demora_rescate: z.number().nullable().optional(),
  pago_outlier_superior: z.number().nullable().optional(),
  documentacion: z.string().nullable().optional(),
  'inlier/outlier': z.string().nullable().optional(),
  grupo_dentro_norma: z
    .union([
      z.boolean(),
      z.string().transform((val) => {
        if (val === 'true' || val === 'Si' || val === 'Sí' || val === 'YES' || val === '1') return true
        if (val === 'false' || val === 'No' || val === 'NO' || val === '0') return false
        return null
      })
    ])
    .nullable()
    .optional(),
  dias_estadia: z.number().nullable().optional(),
  precio_base_tramo: z.number().nullable().optional(),
  valor_GRD: z.number().nullable().optional(),
  monto_final: z.number().nullable().optional(),
  id_grd_oficial: z.number().optional(),
})

export const episodioParamSchema = episodioSchema
