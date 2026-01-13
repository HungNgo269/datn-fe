"use client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import BookCard from "../../../../feature/books-carousel/components/bookCard";
import { Book } from "../../../../feature/books/types/books.type";

interface Props {
  books: Book[];
  context?: string;
  title?: string;
  showHeader?: boolean;
  showViewMore?: boolean;
  viewMoreUrl?: string;
  viewMoreContext?: string;
}

export default function Swipper({
  books,
  context,
  title,
  showHeader = true,
  showViewMore = true,
  viewMoreUrl = "/books",
  viewMoreContext = "book",
}: Props) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const resolvedTitle =
    title ??
    (context === "Best Seller"
      ? "Best Seller"
      : "Nh Ż_ng Ž` §u sA­ch m Ż>i nh §ťt");

  return (
    <div className="flex flex-col gap-4">
      {showHeader && (
        <div className="flex justify-between items-center">
          <span className="font-bold text-2xl">{resolvedTitle}</span>
          {showViewMore && (
            <ViewMoreButton context={viewMoreContext} url={viewMoreUrl} />
          )}
        </div>
      )}
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-1 px-0.5">
            {books?.map((book) => (
              <div key={book.id} className="flex-[0_0_50%] min-w-0 ">
                <BookCard book={book} variant="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
