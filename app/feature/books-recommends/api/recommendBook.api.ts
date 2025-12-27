import { handleRequest } from "@/lib/handleApiRequest";
import { BookCardProps } from "../../books/types/books.type";
import { axiosClient } from "@/lib/api";

export async function getTrendingBooks(period: string, limit: number) {
  return handleRequest<BookCardProps[]>(() =>
    axiosClient.get(`/books/trending?period=${period}&limit=${limit}`)
  );
}
