import {
  handleActionPaginatedRequest,
  handleActionRequest,
} from "@/lib/handleActionRequest";
import { Category } from "../types/listCategories";
import { Book } from "../../books/types/books.type";

export async function getCategories(page: number, limit: number) {
  return handleActionPaginatedRequest<Category>("/categories", {
    params: { page, limit },
    cache: "no-cache",
  });
}

export async function getCategoryById(id: number) {
  return handleActionRequest<Category>(`/categories/${id}`, {
    revalidate: 60,
  });
}
export async function getCategoryBySlugAction(slug: string) {
  return handleActionRequest<Category>(`/categories/slug/${slug}`, {
    revalidate: 60,
  });
}
export async function createCategory(data: Partial<Category>) {
  return handleActionRequest<Category>("/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    revalidate: false, // No cache
  });
}
