import {
  BackendResponse,
  BackendResponsePagination,
  PaginatedData,
} from "@/app/types/api.types";
import { AxiosError, AxiosResponse } from "axios";

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

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const serverError = error.response?.data as
      | BackendResponse<unknown>
      | undefined;
    return serverError?.message || error.message || "Lỗi mạng hoặc hệ thống";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Lỗi không xác định";
}

export async function handleRequest<T>(
  requestFn: () => Promise<AxiosResponse<BackendResponse<T>>>
): Promise<T> {
  try {
    const response = await requestFn();
    const apiData = response.data;
    if (!apiData.success) {
      throw new ApiError(
        apiData.message || "Thất bại khi lấy dữ liệu",
        apiData.statusCode
      );
    }

    return apiData.data;
  } catch (error) {
    console.error("API Error:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(getErrorMessage(error), undefined, error);
  }
}

export async function handlePaginatedRequest<T>(
  requestFn: () => Promise<AxiosResponse<BackendResponsePagination<T>>>
): Promise<PaginatedData<T>> {
  try {
    const response = await requestFn();
    const apiData = response.data;

    if (!apiData.success) {
      throw new ApiError(
        apiData.message || "Lỗi khi lấy dữ liệu",
        apiData.statusCode
      );
    }
    return apiData.data;
  } catch (error) {
    console.error("Pagination API Error:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(getErrorMessage(error), undefined, error);
  }
}
