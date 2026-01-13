"use server";

import { handleActionRequest } from "@/lib/handleActionRequest";
import { Book, BookCardProps } from "../../books/types/books.type";

const RECOMMEND_REVALIDATE_SECONDS = 6 * 3600;

export async function getRecommendedSimilarBooks(
  bookId: number,
  limit: number
) {
  return handleActionRequest<Book[]>(
    `/recommendations/similar/${bookId}?limit=${limit}`,
    {
      revalidate: RECOMMEND_REVALIDATE_SECONDS,
    }
  );
}
export async function getRecommendedPersonalBooks(limit: number) {
  return handleActionRequest<Book[]>(`/recommendations?limit=${limit}`, {
    revalidate: RECOMMEND_REVALIDATE_SECONDS,
  });
}
