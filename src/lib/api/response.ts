import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { PaginatedResponse } from './pagination'
import { getUserFriendlyError } from './error-messages'

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

  // Get user-friendly error message
  const friendlyMessage = getUserFriendlyError(error)
  
  // Determine appropriate status code
  let status = 500
  if (error && typeof error === 'object') {
    const err = error as any
    if (err.code === '23505') status = 409 // Conflict for duplicates
    else if (err.code === '23503') status = 400 // Bad request for foreign key
    else if (err.code === '23502') status = 400 // Bad request for not null
    else if (err.code === '42703') status = 400 // Bad request for invalid format
    else if (err.status) status = err.status
  }

  return errorResponse(friendlyMessage, status)
}
