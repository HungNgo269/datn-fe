import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import BookCarousel from "../../books-carousel/components/bookCarousel";
import { getPopularBooksAction } from "../actions/popularBooks.action";
import { BookCardProps } from "../../books/types/books.type";
import { CloudCog } from "lucide-react";

export default async function PopularBookList() {
  let books: BookCardProps[] = [];
  try {
    books = (await getPopularBooksAction(10)) ?? [];
  } catch {
    books = [];
  }
  
  if (!books?.length) {
    return null;
  }
console.log("Được xem nhiều nhất", books);
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <span className="mb-1 block text-lg font-semibold sm:text-xl md:text-2xl">
          Được xem nhiều nhất
        </span>
        <ViewMoreButton context="book" url="/books?sortBy=viewCount&sortOrder=desc" />
      </div>

      <BookCarousel variant="sm" key="popular-book-carousel" books={books as any} showRanking />
    </div>
  );
}
