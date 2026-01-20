import { handleRequest } from "@/lib/handleApiRequest";
import { BookCardProps } from "../../books/types/books.type";
import { axiosClient } from "@/lib/api";

export async function getPopularBooks(limit: number) {
  return handleRequest<BookCardProps[]>(() =>
    axiosClient.get(`/books/popular?limit=${limit}`)
  );
}
