import { handlePaginatedRequest, handleRequest } from "@/lib/handleApiRequest";
import { axiosClient } from "@/lib/api";
import { AuthorFields } from "@/app/feature/author/schema/authorSchema";
import { AuthorInfo } from "../types/authors.types";

export async function getAuthors(params: { page: number; limit: number }) {
  return handlePaginatedRequest<AuthorInfo>(() =>
    axiosClient.get("/authors", { params })
  );
}
export async function getAuthorsSearch(params: {
  page: number;
  limit: number;
  q: string;
}) {
  return handlePaginatedRequest<AuthorInfo>(() =>
    axiosClient.get("/authors/search", { params })
  );
}

export async function getAuthorById(id: number) {
  return handleRequest<AuthorInfo>(() => axiosClient.get(`/authors/${id}`));
}

export async function createAuthor(payload: AuthorFields) {
  return handleRequest<AuthorInfo>(() => axiosClient.post("/authors", payload));
}

export async function updateAuthor(id: number, payload: Partial<AuthorFields>) {
  return handleRequest<AuthorInfo>(() =>
    axiosClient.patch(`/authors/${id}`, payload)
  );
}

export async function deleteAuthor(id: number) {
  return handleRequest<boolean>(() => axiosClient.delete(`/authors/${id}`));
}
