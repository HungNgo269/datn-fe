import { handlePaginatedRequest, handleRequest } from "@/lib/handleApiRequest";
import { Book, BookSortBy, CreateBookDto, SortOrder } from "../types/books.type";
import { axiosClient } from "@/lib/api";
import { BookFields } from "@/app/feature/books/schema/bookSchema";

export async function getBooks(params: {
  page: number;
  limit: number;
  q?: string;
  endpoint?: string;
}) {
  const { endpoint = "/books", q, ...rest } = params;
  const query = { ...rest, search: q };
  return handlePaginatedRequest<Book>(() =>
    axiosClient.get(endpoint, { params: query })
  );
}

export async function getBooksByQuery(params: {
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: BookSortBy;
  sortOrder?: SortOrder;
}) {
  return handlePaginatedRequest<Book>(() =>
    axiosClient.get("/books", { params })
  );
}
export async function getBookByCategory(
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

  return handlePaginatedRequest<Book>(() => axiosClient.get(url));
}
export async function getBookBySlug(slug: string) {
  return handleRequest<Book>(() => axiosClient.get(`/books/${slug}`));
}

export async function getBookById(id: number) {
  return handleRequest<Book>(() => axiosClient.get(`/books/${id}`));
}

export async function createBook(payload: CreateBookDto) {
  return handleRequest<Book>(() => axiosClient.post("/admin/books", payload));
}

export async function updateBook(id: number, payload: Partial<BookFields>) {
  return handleRequest<Book>(() =>
    axiosClient.patch(`/admin/books/${id}`, payload)
  );
}

export async function deleteBook(id: number) {
  return handleRequest<boolean>(() => axiosClient.delete(`/admin/books/${id}`));
}
