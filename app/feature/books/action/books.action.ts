import {
  handleActionPaginatedRequest,
  handleActionRequest,
} from "@/lib/handleActionRequest";
import { Book, GetBooksParams } from "../types/books.type";

export async function getBookBySlugAction(slug: string) {
  return handleActionRequest<Book>(`/books/${slug}`, {
    revalidate: 10,
  });
}
export async function getBookByIdAction(id: number) {
  return handleActionRequest<Book>(`/books/${id}`, {
    revalidate: 10,
  });
}
export async function getBooksAction(params: GetBooksParams) {
  const urlParams = new URLSearchParams();

  if (params.search) urlParams.append("search", params.search);

  if (params.category) urlParams.append("category", params.category);

  if (params.author) urlParams.append("author", params.author);

  if (params.sortBy) urlParams.append("sortBy", params.sortBy);
  if (params.sortOrder) urlParams.append("sortOrder", params.sortOrder);
  if (params.accessType) urlParams.append("accessType", params.accessType);

  if (params.minPrice !== undefined)
    urlParams.append("minPrice", params.minPrice.toString());
  if (params.maxPrice !== undefined)
    urlParams.append("maxPrice", params.maxPrice.toString());
  urlParams.append("page", (params.page || 1).toString());
  urlParams.append("limit", (params.limit || 10).toString());

  const queryString = urlParams.toString();
  const url = `/books${queryString ? `?${queryString}` : ""}`;

  return handleActionPaginatedRequest<Book>(url, {
    revalidate: 0,
  });
}
