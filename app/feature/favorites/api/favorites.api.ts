import { handlePaginatedRequest, handleRequest } from "@/lib/handleApiRequest";
import { axiosClient } from "@/lib/api";
import {
  FavoriteResponseDto,
  FavoriteStatusResponseDto,
} from "../types/favorite.type";

export async function addBookToFavorites(bookId: number) {
  return handleRequest<FavoriteResponseDto>(() =>
    axiosClient.post(`/books/${bookId}/favorite`)
  );
}

export async function removeBookFromFavorites(bookId: number) {
  return handleRequest<void>(() => axiosClient.delete(`/books/${bookId}/favorite`));
}

export async function getFavoriteStatus(bookId: number) {
  return handleRequest<FavoriteStatusResponseDto>(() =>
    axiosClient.get(`/books/${bookId}/favorite`)
  );
}

export async function getMyFavoriteBooks(params: { page: number; limit: number }) {
  return handlePaginatedRequest<FavoriteResponseDto>(() =>
    axiosClient.get("/favorites", { params })
  );
}
