import { config } from "@/app/config/env.config";
import { Category } from "../types/listCategories";
import { BackendResponse, ServiceResult } from "@/app/types/api.types";

export async function getCategories(
  page: number,
  limit: number
): Promise<ServiceResult<Category>> {
  try {
    const url = new URL(`${config.backendURL}/categories`);

    if (page > 0) url.searchParams.append("page", page.toString());
    if (limit > 0) url.searchParams.append("limit", limit.toString());

    const response = await fetch(url.toString(), {
      next: { revalidate: 15 },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData: BackendResponse<Category> = await response.json();

    return {
      success: true,
      data: rawData.data.data,
      meta: rawData.data.meta,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch categories",
    };
  }
}
