"use client";
import { useCallback, useMemo, useState } from "react";
import BookCarouselNavigation from "./bookCarouselNavigation";
import BookCard from "./bookCard";
import { Book } from "../../books/types/books.type";
import { BookCardSkeleton } from "@/app/share/components/ui/skeleton/skeleton";

export type Variant = "lg" | "sm";

export const CAROUSEL_CONFIG = {
  lg: {
    container: "w-full lg:w-[950px] xl:w-[1190px]",
    grid: "grid grid-cols-2  md:grid-cols-5 gap-4 justify-items-center",
  },
  sm: {
    container: "w-full lg:w-[700px] xl:w-[850px]",
    grid: "grid grid-cols-2  md:grid-cols-5 gap-2 justify-items-center",
  },
} as const;

const ITEMS_PER_SLIDE = 5;

interface BookCarouselProps {
  books: Book[];
  variant?: Variant;
  isLoading?: boolean;
  className?: string;
  showRanking?: boolean;
}

export default function BookCarousel({
  books,
  variant = "lg",
  isLoading = false,
  className = "",
  showRanking = false,
}: BookCarouselProps) {
  const cfg = CAROUSEL_CONFIG[variant];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = useMemo(() => {
    const dataToRender = isLoading
      ? Array(ITEMS_PER_SLIDE * 1).fill(null)
      : books ?? [];

    const chunks: (Book | null)[][] = [];
    for (let i = 0; i < dataToRender.length; i += ITEMS_PER_SLIDE) {
      chunks.push(dataToRender.slice(i, i + ITEMS_PER_SLIDE));
    }

    return chunks;
  }, [books, isLoading]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((p) => p + 1);
    }
  }, [currentSlide, isTransitioning, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((p) => p - 1);
    }
  }, [currentSlide, isTransitioning]);

  if (!isLoading && (!books || books.length === 0)) {
    return null;
  }

  return (
    <div className={`relative ${cfg.container} ${className}`}>
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out will-change-transform"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          onTransitionEnd={() => setIsTransitioning(false)}
        >
          {slides.map((page, slideIndex) => (
            <div key={slideIndex} className={`w-full flex-shrink-0 ${cfg.grid}`}>
              {page.map((book, bIndex) => {
                const globalIndex = slideIndex * ITEMS_PER_SLIDE + bIndex + 1;
                return (
                  <div
                    key={book?.id ?? `skel-${slideIndex}-${bIndex}`}
                    className="w-full"
                  >
                    {isLoading ? (
                      <BookCardSkeleton variant={variant} />
                    ) : (
                      book && (
                        <BookCard 
                          book={book} 
                          variant={variant} 
                          ranking={showRanking ? globalIndex : undefined}
                        />
                      )
                    )}
                  </div>
                );
              })}
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
