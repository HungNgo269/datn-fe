import { handleActionRequest } from "@/lib/handleActionRequest";
import { BookCardProps } from "../../books/types/books.type";

export async function getNewBookAction(limit: number) {
  return handleActionRequest<BookCardProps[]>(`/books/latest?limit=${limit}`);
}
