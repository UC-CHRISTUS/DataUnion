import { z } from 'zod'
import { episodioSchema } from '@/lib/api/validation'

/**
 * Schema for creating a new ajuste tecnología for a GRD row
 */
export const createAjusteSchema = z.object({
  id_AT: z.number().int().positive(),
})

export const episodioParamSchema = episodioSchema
