import BookCarousel from "../../books-carousel/components/bookCarousel";
import { getRecommendedPersonalBooks } from "../actions/recommendBooks.action";
import Swipper from "@/app/share/components/ui/swipper/swipper";
import { Book } from "../../books/types/books.type";

export default async function RecommendedPersonalBookList() {
  let books: Book[] = [];
  try {
    books = (await getRecommendedPersonalBooks(10)) ?? [];
  } catch {
    books = [];
  }
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <span className="mb-1 block text-lg font-semibold sm:text-xl md:text-2xl">
          Chúng tôi nghĩ bạn sẽ thích
        </span>
      </div>

      <div className="block w-full md:hidden">
        <Swipper books={books} showHeader={false} showViewMore={false} />
      </div>
      <div className="hidden w-full md:block">
        <BookCarousel variant="sm" key="new-book-carousel" books={books} />
      </div>
    </div>
  );
}
