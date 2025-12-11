export interface PaginationMeta {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface BackendResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: PaginatedData<T>;
  timestamp: string;
  path: string;
}

export type ServiceResult<T> =
  | {
      success: true;
      data: T[];
      meta: PaginationMeta;
    }
  | {
      success: false;
      error: string;
    };
