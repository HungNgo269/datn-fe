import { handleActionRequest } from "@/lib/handleActionRequest";
import { Book, BookCardProps } from "../../books/types/books.type";

export async function getNewBookAction(limit: number) {
  return handleActionRequest<Book[]>(`/books/latest?limit=${limit}`);
}
