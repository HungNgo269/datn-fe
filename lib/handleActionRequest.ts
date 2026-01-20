import {
  BackendResponse,
  BackendResponsePagination,
  PaginatedData,
} from "@/app/types/api.types";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  revalidate?: number | false;
}

async function baseFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const { params, revalidate, ...fetchOptions } = options;

    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...fetchOptions.headers,
      },
      next: revalidate !== undefined ? { revalidate } : undefined,
    });

    if (response.status === 204) {
      return null;
    }

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new ApiError(
          errorJson.message || `HTTP Error: ${response.status}`,
          response.status
        );
      } catch {
        console.error("Backend error response:", errorText);
        throw new ApiError(`HTTP Error: ${response.status}`, response.status);
      }
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error("Fetch Error:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Lỗi không xác định",
      undefined,
      error
    );
  }
}

export async function handleActionRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await baseFetch<BackendResponse<T>>(endpoint, options);

  if (response === null) {
    return null as unknown as T;
  }

  if (!response.success) {
    throw new ApiError(
      response.message || "Thất bại khi lấy dữ liệu",
      response.statusCode
    );
  }

  return response.data;
}

export async function handleActionPaginatedRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<PaginatedData<T>> {
  const response = await baseFetch<BackendResponsePagination<T>>(
    endpoint,
    options
  );

  if (response === null) {
    throw new ApiError("Dữ liệu phân trang trống (204)", 204);
  }

  if (!response.success) {
    throw new ApiError(
      response.message || "Lỗi khi lấy dữ liệu",
      response.statusCode
    );
  }

  return response.data;
}
