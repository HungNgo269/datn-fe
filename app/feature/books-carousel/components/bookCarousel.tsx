"use client";
import { useMemo, useState } from "react";
import BookCarouselNavigation from "./bookCarouselNavigation";
import { Book, BookCardProps } from "../../books/types/books.type";
import BookCard from "./bookCard";
import { BookCardSkeleton } from "@/app/share/components/ui/skeleton/skeleton";

export type Variant = "lg" | "sm";

interface BookCarouselProps {
  books: Book[];
  variant?: Variant;
  isLoading?: boolean;
}

export const CONFIG = {
  lg: {
    container: "w-full lg:w-[950px] xl:w-[1190px]",
    grid: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center",
  },
  sm: {
    container: "w-full lg:w-[700px] xl:w-[850px]",
    grid: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 justify-items-center",
  },
} as const;

const ITEMS_PER_SLIDE = 5;

export default function BookCarousel({
  books,
  variant = "lg",
  isLoading = false,
}: BookCarouselProps) {
  const cfg = CONFIG[variant];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = useMemo(() => {
    const dataToRender = isLoading
      ? Array(ITEMS_PER_SLIDE * 1).fill(null)
      : books;

    const chunks: (BookCardProps | null)[][] = [];
    for (let i = 0; i < dataToRender.length; i += ITEMS_PER_SLIDE) {
      chunks.push(dataToRender.slice(i, i + ITEMS_PER_SLIDE));
    }
    return chunks;
  }, [books, isLoading]);
  const nextSlide = () => {
    if (currentSlide < slides.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((p) => p + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((p) => p - 1);
    }
  };

  return (
    <div className={`relative ${cfg.container} w-full `}>
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out will-change-transform"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          onTransitionEnd={() => setIsTransitioning(false)}
        >
          {slides.map((page, index) => (
            <div key={index} className={`w-full flex-shrink-0 ${cfg.grid}`}>
              {page.map((book, bIndex) => (
                <div
                  key={book?.id || `skel-${index}-${bIndex}`}
                  className="w-full"
                >
                  {isLoading ? (
                    <BookCardSkeleton variant={variant} />
                  ) : (
                    book && <BookCard book={book} variant={variant} />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {!isLoading && slides.length > 1 && (
        <BookCarouselNavigation
          currentSlide={currentSlide}
          totalSlides={slides.length}
          onPrevSlide={prevSlide}
          onNextSlide={nextSlide}
          variant={variant}
        />
      )}
    </div>
  );
}
