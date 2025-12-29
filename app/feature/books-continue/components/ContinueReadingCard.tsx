"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import ImageCard from "@/app/share/components/ui/image/ImageCard";
import { useReaderDataStore } from "@/app/store/useReaderDataStore";

export default function ContinueReadingCard() {
  const continueReading = useReaderDataStore((state) => state.continueReading);

  if (!continueReading) {
    return null;
  }

  const {
    bookSlug,
    bookTitle,
    chapterSlug,
    chapterTitle,
    page,
    bookCoverImage,
  } = continueReading;

  if (!bookSlug) {
    return null;
  }

  const bookHref = `/books/${bookSlug}`;
  const chapterHref = chapterSlug
    ? `/books/${bookSlug}/chapter/${chapterSlug}`
    : bookHref;

  return (
    <section className="w-full mx-auto mt-10 md:w-[700px] lg:w-[950px] xl:w-[1190px] p-2 lg:p-0">
      <div className="flex gap-4 ">
        <Link
          href={bookHref}
          className="relative h-32 w-24 md:h-36 md:w-28 overflow-hidden rounded-xl border border-border flex-shrink-0"
          prefetch={true}
        >
          <ImageCard bookImage={bookCoverImage || ""} bookName={bookTitle} />
        </Link>
        <div className="flex flex-col justify-between flex-1 py-1">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Continue reading
            </p>
            <Link
              href={bookHref}
              prefetch={true}
              className="text-lg font-semibold leading-tight text-foreground hover:text-primary not-[]:transition-colors"
            >
              {bookTitle}
            </Link>
            {chapterTitle && (
              <Link
                href={chapterHref}
                prefetch={true}
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                <BookOpen className="h-4 w-4" />
                <span className="line-clamp-1">{chapterTitle}</span>
              </Link>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Last read on page <span className="font-semibold">{page}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
