import { NextRequest } from 'next/server'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginationParams {
  page: number
  pageSize: number
  offset: number
  limit: number
}

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 100

/**
 * Parse pagination parameters from request URL
 */
export function getPaginationParams(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams

  const page = Math.max(1, parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10))
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10))
  )

  const offset = (page - 1) * pageSize
  const limit = pageSize

  return { page, pageSize, offset, limit }
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination<T>(
  data: T[],
  total: number,
  params: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
  }
}
