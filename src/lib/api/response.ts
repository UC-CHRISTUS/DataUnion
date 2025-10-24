import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { PaginatedResponse } from './pagination'

/**
 * Success response for regular data
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

/**
 * Success response for paginated data
 */
export function paginatedResponse<T>(data: PaginatedResponse<T>) {
  return NextResponse.json(data, { status: 200 })
}

/**
 * Error response with message and status code
 */
export function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status })
}

/**
 * Validation error response from Zod errors
 */
export function validationErrorResponse(error: ZodError) {
  return NextResponse.json(
    {
      error: 'Validation failed',
      details: error.issues.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    },
    { status: 400 }
  )
}

/**
 * Handle common errors in API routes
 */
export function handleError(error: unknown) {
  console.error('API Error:', error)

  if (error instanceof ZodError) {
    return validationErrorResponse(error)
  }

  if (error instanceof Error) {
    return errorResponse(error.message, 500)
  }

  return errorResponse('An unexpected error occurred', 500)
}
