"use server";

import { handleActionRequest } from "@/lib/handleActionRequest";
import { BookCardProps } from "../../books/types/books.type";


export async function getPopularBooksAction(limit = 5) {
  return handleActionRequest<BookCardProps[]>(
    `/books/popular?limit=${limit}`,
    {
      revalidate: 3600,
    }
  );
}

