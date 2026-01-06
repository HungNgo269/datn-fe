"use client";

import { useMemo } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ViewMoreButton from "@/app/share/components/ui/button/viewMoreButton";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { useAuthStore } from "@/app/store/useAuthStore";
import {
  ContinueReadingEntry,
  useReaderDataStore,
} from "@/app/store/useReaderDataStore";

const CARD_SIZING = {
  wrapper: "xl:w-[160px] lg:w-[130px] md:w-[130px] w-full",
  image:
    "relative overflow-hidden rounded-[8px] xl:w-[160px] xl:h-[207px] lg:w-[130px] lg:h-[182px] md:w-[130px] h-[207px] w-full",
};

const CAROUSEL_ITEM_CLASS = "flex-[0_0_19%] min-w-0";
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
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
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
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <span className="font-bold text-2xl">Tiếp tục đọc</span>
        <ViewMoreButton context="book" url="/account/bookmark" />
      </div>
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
  );
}

function HistoryCard({ entry }: { entry: ContinueReadingEntry }) {
  const bookHref = `/books/${entry.bookSlug}`;
  const chapterHref = entry.chapterSlug
    ? `/books/${entry.bookSlug}/chapter/${entry.chapterSlug}`
    : bookHref;
  console.log("rentry", entry);
  return (
    <div className={`flex flex-col ${CARD_SIZING.wrapper}`}>
      <Link prefetch={true} href={bookHref} aria-label={entry.bookTitle}>
        <div className={`group ${CARD_SIZING.image}`}>
          <ImageCard
            bookImage={entry.bookCoverImage || ""}
            bookName={entry.bookTitle}
          />
        </div>
      </Link>
      <div className="flex flex-col mt-3 h-fit justify-between">
        <Link prefetch={true} href={bookHref} aria-label={entry.bookTitle}>
          <span className="line-clamp-1 font-semibold cursor-pointer w-fit hover:underline hover:text-primary text-sm">
            {entry.bookTitle}
          </span>
        </Link>
        {entry.chapterTitle && (
          <Link
            prefetch={true}
            href={chapterHref}
            className="text-xs text-muted-foreground line-clamp-2 hover:text-primary transition-colors"
          >
            {entry.chapterTitle}
          </Link>
        )}
      </div>
    </div>
  );
}
