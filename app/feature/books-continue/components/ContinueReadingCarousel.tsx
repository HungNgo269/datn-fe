"use client";

import { useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useReaderDataStore } from "@/app/store/useReaderDataStore";
import HistoryCard from "./ContinueReadingCard";
import { ContinueReadingEntry } from "@/app/types/book.types";

const CAROUSEL_ITEM_CLASS = "flex-[0_0_50%] min-w-0";
const GRID_ITEM_CLASS = "w-full";

export default function ContinueReadingCarousel() {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const history = useReaderDataStore((state) => state.readingHistory);

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

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
    },
    [Autoplay({ delay: 10000, stopOnInteraction: false })]
  );

  if (userHistory.length === 0) {
    return null;
  }

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
      <div className="hidden md:grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {userHistory.map((entry) => (
          <div
            key={`${entry.bookSlug}-${entry.updatedAt}`}
            className={GRID_ITEM_CLASS}
          >
            <HistoryCard entry={entry} />
          </div>
        ))}
      </div>
    </div>
  );
}
