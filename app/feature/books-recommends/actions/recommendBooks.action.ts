"use server";

import { handleActionRequest } from "@/lib/handleActionRequest";
import { Book, BookCardProps } from "../../books/types/books.type";


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
    revalidate: 3600,
  });
}
