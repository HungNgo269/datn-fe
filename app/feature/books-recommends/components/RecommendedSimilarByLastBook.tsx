"use client";

import { useEffect, useState } from "react";
import BookCarousel from "../../books-carousel/components/bookCarousel";
import { Book } from "../../books/types/books.type";
import { getRecommendSimilarBooks } from "../api/recommendBook.api";
import Swipper from "@/app/share/components/ui/swipper/swipper";

interface Props {
  bookId: number;
  bookTitle: string;
}

export default function RecommendedSimilarByLastBook({
  bookId,
  bookTitle,
}: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!bookId) {
      setBooks([]);
      return;
    }

    let active = true;
    setIsLoading(true);

    getRecommendSimilarBooks(bookId, 10)
      .then((data) => {
        if (active) setBooks(data ?? []);
      })
      .catch((error) => {
        console.error("Failed to load similar books:", error);
        if (active) setBooks([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookId]);

  if (!bookId) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center items-center gap-2">
      <div className="flex flex-row items-center justify-between w-full gap-2">
        <span className="text-lg sm:text-xl md:text-2xl font-semibold mb-1 block">
          Bởi vì bạn đọc {bookTitle}
        </span>
      </div>

      <div className="block md:hidden w-full">
        <Swipper books={books} showHeader={false} showViewMore={false} />
      </div>
      <div className="hidden md:block w-full">
        <BookCarousel
          variant="sm"
          key="recommend-book-carousel"
          books={books}
          isLoading={isLoading}
        ></BookCarousel>
      </div>
    </div>
  );
}
