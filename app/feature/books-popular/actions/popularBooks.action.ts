"use server";

import { handleActionRequest } from "@/lib/handleActionRequest";
import { BookCardProps } from "../../books/types/books.type";

const POPULAR_REVALIDATE_SECONDS = 60;

export async function getPopularBooksAction(limit = 5) {
  return handleActionRequest<BookCardProps[]>(
    `/books/popular?limit=${limit}`,
    {
      revalidate: POPULAR_REVALIDATE_SECONDS,
    }
  );
}

