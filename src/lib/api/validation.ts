import { z } from 'zod'

/**
 * Common pagination query parameter schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

/**
 * Common ID parameter schema
 */
export const idSchema = z.coerce.number().int().positive()

/**
 * Episodio (unique identifier) parameter schema
 */
export const episodioSchema = z.coerce.number().int()
