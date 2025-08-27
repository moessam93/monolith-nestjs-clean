export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalFiltered: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
  totalFiltered: number = total
): PaginationMeta {
  const totalPages = Math.ceil(totalFiltered / limit);
  
  return {
    page,
    limit,
    total,
    totalFiltered,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
