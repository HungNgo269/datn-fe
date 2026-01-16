import { getNewBookAction } from "../actions/newBook.action";
import Swipper from "../../../share/components/ui/swipper/swipper";
import { Book } from "../../books/types/books.type";

export default async function SwipperNewBook() {
  let books: Book[] = [];
  try {
    books = (await getNewBookAction(10)) ?? [];
  } catch {
    books = [];
  }
  return <Swipper books={books} context="book" />;
}
