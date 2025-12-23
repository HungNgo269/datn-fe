import {
  handleActionPaginatedRequest,
  handleActionRequest,
} from "@/lib/handleActionRequest";
import { Book } from "../types/books.type";

// export async function getBookBySlug(page: number, limit: number) {
//   return handleActionPaginatedRequest<Category>("/categories", {
//     params: { page, limit },
//     revalidate: 15,
//   });
// }

export async function getBookBySlug(slug: string) {
  return handleActionRequest<Book>(`/books/${slug}`, {
    revalidate: 10,
  });
}
export async function getBookByCategoryAction(
  page?: number,
  limit?: number,
  filter?: string,
  categoryId?: number,
  search?: string,
  authorId?: number
) {
  const params = new URLSearchParams();

  if (page !== undefined) params.append("page", page.toString());
  if (limit !== undefined) params.append("limit", limit.toString());
  if (filter) params.append("filter", filter);
  if (categoryId !== undefined)
    params.append("categoryId", categoryId.toString());
  if (search) params.append("search", search);
  if (authorId !== undefined) params.append("authorId", authorId.toString());

  const queryString = params.toString();
  const url = `/books${queryString ? `?${queryString}` : ""}`;

  return handleActionPaginatedRequest<Book>(url, {
    revalidate: 2,
  });
}
// export async function createCategory(data: Partial<Category>) {
//   return handleActionRequest<Category>("/categories", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//     revalidate: false, // No cache
//   });
// }
