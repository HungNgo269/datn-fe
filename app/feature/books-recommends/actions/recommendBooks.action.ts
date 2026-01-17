"use server";

import { handleActionRequest } from "@/lib/handleActionRequest";
import { Book, BookCardProps } from "../../books/types/books.type";

// Cache for 55 minutes (less than 1h presigned URL expiry from backend)
const RECOMMEND_REVALIDATE_SECONDS = 55 * 60;

export async function getRecommendedSimilarBooks(
  bookId: number,
  limit: number
) {
  return handleActionRequest<Book[]>(
    `/recommendations/similar/${bookId}?limit=${limit}`,
    {
      revalidate: 0,
    }
  );
}
export async function getRecommendedPersonalBooks(limit: number) {
  return handleActionRequest<Book[]>(`/recommendations?limit=${limit}`, {
    revalidate: 0,
  });
}
