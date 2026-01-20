"use client";

import { useCallback, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useReaderDataStore } from "@/app/store/useReaderDataStore";
import HistoryCard from "./ContinueReadingCard";
import { ContinueReadingEntry } from "@/app/types/book.types";

const CAROUSEL_ITEM_CLASS = "flex-[0_0_50%] min-w-0";
const ITEMS_PER_SLIDE = 5;

export default function ContinueReadingCarousel() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const history = useReaderDataStore((state) => state.readingHistory);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const userHistory = useMemo(() => {
    const relevantHistory = userId
      ? history.filter((entry) => entry.userId === userId)
      : history;

    const latestPerBook = new Map<string, ContinueReadingEntry>();

    relevantHistory.forEach((entry) => {
      const existing = latestPerBook.get(entry.bookSlug);
      if (!existing) {
        latestPerBook.set(entry.bookSlug, entry);
        return;
      }

      const existingTime = new Date(existing.updatedAt).getTime();
      const currentTime = new Date(entry.updatedAt).getTime();

      if (currentTime > existingTime) {
        latestPerBook.set(entry.bookSlug, entry);
      }
    });

    return Array.from(latestPerBook.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [history, userId]);

  // Create slides for desktop (5 items per slide)
  const slides = useMemo(() => {
    const chunks: ContinueReadingEntry[][] = [];
    for (let i = 0; i < userHistory.length; i += ITEMS_PER_SLIDE) {
      chunks.push(userHistory.slice(i, i + ITEMS_PER_SLIDE));
    }
    return chunks;
  }, [userHistory]);

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 10000, stopOnInteraction: false })]
  );

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

  if (userHistory.length === 0) {
    return null;
  }

  const showPrevButton = currentSlide > 0;
  const showNextButton = currentSlide < slides.length - 1;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <span className="block text-lg font-semibold sm:text-xl md:text-2xl">
          Tiếp tục đọc
        </span>
        <ViewMoreButton context="book" url="/account/bookmark" />
      </div>
      <span className="mb-2 text-sm">
        Trở lại cuộc hành trình đang đọc
      </span>

      {/* Mobile: Embla carousel */}
      <div className="block md:hidden">
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-2.5">
              {userHistory.map((entry) => (
                <div
                  key={`${entry.bookSlug}-${entry.updatedAt}`}
                  className={CAROUSEL_ITEM_CLASS}
                >
                  <HistoryCard entry={entry} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: Grid with navigation arrows */}
      <div className="hidden md:block relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            onTransitionEnd={() => setIsTransitioning(false)}
          >
            {slides.map((page, slideIndex) => (
              <div 
                key={slideIndex} 
                className="w-full flex-shrink-0 grid grid-cols-5 gap-2.5"
              >
                {page.map((entry) => (
                  <div
                    key={`${entry.bookSlug}-${entry.updatedAt}`}
                    className="w-full"
                  >
                    <HistoryCard entry={entry} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation arrows */}
        {slides.length > 1 && (
          <>
            {showPrevButton && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 bg-background/90 hover:bg-background border-border shadow-lg rounded-full cursor-pointer"
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {showNextButton && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-[-17px] top-1/2 -translate-y-1/2 z-20 bg-background/90 hover:bg-background border-border shadow-lg rounded-full cursor-pointer"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

