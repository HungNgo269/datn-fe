"use client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import BookCard from "../../../../feature/books-carousel/components/bookCard";
import { BookCardProps } from "../../../../feature/books/types/books.type";

interface Props {
  books: BookCardProps[];
  context: string;
}

export default function Swipper({ books, context }: Props) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="font-bold text-2xl">{`${
          context === "Best Seller" ? "Best Seller" : "Những đầu sách mới nhất"
        }`}</span>
        <ViewMoreButton url="/books" />
      </div>
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-1">
            {books?.map((book) => (
              <div key={book.id} className="flex-[0_0_49%] min-w-0 ">
                <BookCard book={book} variant="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
