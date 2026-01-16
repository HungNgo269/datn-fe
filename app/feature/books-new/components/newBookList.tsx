import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import BookCarousel from "../../books-carousel/components/bookCarousel";
import { getNewBookAction } from "../actions/newBook.action";
import { Book } from "../../books/types/books.type";

export default async function NewBookList() {
  let books: Book[] = [];
  try {
    books = (await getNewBookAction(10)) ?? [];
  } catch {
    books = [];
  }
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <span className="mb-1 block text-lg font-semibold sm:text-xl md:text-2xl">
          Những đầu sách mới nhất
        </span>
        <ViewMoreButton context="book" url="/books" />
      </div>

      <BookCarousel variant="sm" key="new-book-carousel" books={books} />
    </div>
  );
}
