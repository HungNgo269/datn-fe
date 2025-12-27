"use server";

import { handleActionRequest } from "@/lib/handleActionRequest";
import { BookCardProps } from "../../books/types/books.type";

const RECOMMEND_REVALIDATE_SECONDS = 120;

export async function getRecommendedBooksAction(limit = 10) {
  return handleActionRequest<BookCardProps[]>(
    `/books/trending?period=month&limit=${limit}`,
    {
      revalidate: RECOMMEND_REVALIDATE_SECONDS,
    }
  );
}

