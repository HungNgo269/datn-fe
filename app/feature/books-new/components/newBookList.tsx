import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import NewBookCard from "./NewBookCard";
import { getNewBookAction } from "../actions/newBook.action";
import { Book } from "../../books/types/books.type";

export default async function NewBookList() {
  let books: Book[] = [];
  try {
    books = (await getNewBookAction(3)) ?? [];
  } catch {
    books = [];
  }
  if (!books?.length) {
    return null;
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <span className="mb-1 block text-lg font-semibold sm:text-xl md:text-2xl">
          Những đầu sách mới nhất
        </span>
        <ViewMoreButton context="book" url="/books?sortBy=createdAt&sortOrder=desc" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <NewBookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
