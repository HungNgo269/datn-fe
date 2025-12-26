import { handlePaginatedRequest, handleRequest } from "@/lib/handleApiRequest";
import { Category } from "../types/listCategories";
import { axiosClient } from "@/lib/api";
import { CategoryFields } from "@/app/schema/categorySchema";

export async function getCategories(params: { page: number; limit: number }) {
  return handlePaginatedRequest<Category>(() =>
    axiosClient.get("/categories", { params })
  );
}

export async function getCategoryById(id: number) {
  return handleRequest<Category>(() => axiosClient.get(`/categories/${id}`));
}

export async function getCategoryBySlug(slug: string) {
  return handleRequest<Category>(() =>
    axiosClient.get(`/categories/slug/${slug}`)
  );
}

export async function createCategory(payload: CategoryFields) {
  return handleRequest<Category>(() =>
    axiosClient.post("/categories", payload)
  );
}
export async function updateCategory(id: number, payload: CategoryFields) {
  return handleRequest<Category>(() =>
    axiosClient.patch(`/categories/${id}`, payload)
  );
}

export async function deleteCategory(id: number) {
  return handleRequest<boolean>(() => axiosClient.delete(`/categories/${id}`));
}

export async function getCategorySearch(params: {
  page: number;
  limit: number;
  q: string;
}) {
  return handlePaginatedRequest<Category>(() =>
    axiosClient.get("/categories/search", { params })
  );
}
