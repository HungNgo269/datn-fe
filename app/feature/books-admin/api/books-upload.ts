import { handlePaginatedRequest, handleRequest } from "@/lib/handleApiRequest";

import { axiosClient } from "@/lib/api";
import { BookFields } from "@/app/schema/bookSchema";
import {
  Book,
  BookCardProps,
  CreateBookDto,
} from "../../books/types/books.type";

export async function getBooks(params: { page: number; limit: number }) {
  return handlePaginatedRequest<Book>(() =>
    axiosClient.get("/books", { params })
  );
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

export async function getTrendingBooks(period: string, limit: number) {
  return handleRequest<BookCardProps[]>(() =>
    // axiosClient.post(`/books/popular?period=${period}&limit=${limit}`)
    axiosClient.get(`/books/trending?period=month&limit=5`)
  );
}
