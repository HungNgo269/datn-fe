import { handleRequest } from "@/lib/handleApiRequest";
import { Book } from "../../books/types/books.type";
import { axiosClient } from "@/lib/api";

export async function getRecommendSimilarBooks(
  bookId: number,
  limit: number
) {
  return handleRequest<Book[]>(() =>
    axiosClient.get(`/recommendations/similar/${bookId}?limit=${limit}`)
  );
}
