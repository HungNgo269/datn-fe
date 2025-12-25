import {
  handleActionPaginatedRequest,
  handleActionRequest,
} from "@/lib/handleActionRequest";
import { Book, GetBooksParams } from "../types/books.type";

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
export async function getBooksAction(params: GetBooksParams) {
  const urlParams = new URLSearchParams();

  // Mapping params
  if (params.search) urlParams.append("search", params.search);

  // Swagger define category là array<string>, nếu backend hỗ trợ ?category=a&category=b
  // Ở đây giả sử UI chỉ chọn 1 category
  if (params.category) urlParams.append("category", params.category);

  if (params.author) urlParams.append("author", params.author);

  if (params.sortBy) urlParams.append("sortBy", params.sortBy);
  if (params.sortOrder) urlParams.append("sortOrder", params.sortOrder);
  if (params.accessType) urlParams.append("accessType", params.accessType);

  if (params.minPrice !== undefined)
    urlParams.append("minPrice", params.minPrice.toString());
  if (params.maxPrice !== undefined)
    urlParams.append("maxPrice", params.maxPrice.toString());

  // Pagination defaults
  urlParams.append("page", (params.page || 1).toString());
  urlParams.append("limit", (params.limit || 10).toString());

  const queryString = urlParams.toString();
  const url = `/books${queryString ? `?${queryString}` : ""}`;

  return handleActionPaginatedRequest<Book>(url, {
    revalidate: 0, // Hoặc setting cache tùy ý
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
