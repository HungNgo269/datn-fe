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
    if (!bookId) return;

    let active = true;
    setIsLoading(true);

    getRecommendSimilarBooks(bookId, 10)
      .then((data) => {
        if (active) setBooks(data ?? []);
      })
      .catch(() => {
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
console.log("books", books);
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <span className="mb-1 block text-lg font-semibold sm:text-xl md:text-2xl">
          Bởi vì bạn đọc {bookTitle}
        </span>
      </div>

      <div className="block w-full md:hidden">
        <Swipper books={books} showHeader={false} showViewMore={false} />
      </div>
      <div className="hidden w-full md:block">
        <BookCarousel
          variant="sm"
          key="recommend-book-carousel"
          books={books}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
