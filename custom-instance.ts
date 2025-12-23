// custom-instance.ts
import { config } from "@/app/config/env.config";

// Định nghĩa lại kiểu trả về mong muốn giống code cũ
export type CustomResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
};

export const customInstance = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<CustomResponse<T>> => {
  const baseURL = config.backendURL;
  const fullUrl = url.startsWith("http") ? url : `${baseURL}${url}`;

  try {
    const res = await fetch(fullUrl, {
      ...options,
      // Mặc định cache strategy cho Next.js nếu muốn
      next: { revalidate: options.next?.revalidate ?? 15, ...options.next },
    });

    const data = await res.json();

    if (!res.ok) {
      // Xử lý lỗi tập trung ở đây
      return {
        success: false,
        error: data.message || "Error",
        status: res.status,
      };
    }

    // Tự động unwrap data nếu cấu trúc backend là { data: { ... } }
    return { success: true, data: data, status: res.status };
  } catch (e) {
    return { success: false, error: (e as Error).message, status: 500 };
  }
};
