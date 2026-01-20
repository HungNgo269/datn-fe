"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useAuthStore } from "@/app/store/useAuthStore";
import { useReaderDataStore } from "@/app/store/useReaderDataStore";
import type { ContinueReadingEntry } from "@/app/types/book.types";
import { cn } from "@/lib/utils";

interface ContinueReadingButtonProps {
  bookSlug: string;
  defaultChapterSlug?: string | null;
  defaultChapterTitle?: string | null;
  className?: string;
  buttonClassName?: string;
}

export function ContinueReadingButton({
  bookSlug,
  defaultChapterSlug,
  defaultChapterTitle,
  className,
  buttonClassName,
}: ContinueReadingButtonProps) {
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const readingHistory = useReaderDataStore((state) => state.readingHistory);
  const continueReading = useReaderDataStore((state) => state.continueReading);

  const latestEntry = useMemo(() => {
    const relevantHistory = readingHistory.filter(
      (entry) =>
        entry.bookSlug === bookSlug && (userId ? entry.userId === userId : true)
    );

    const mostRecent = relevantHistory.reduce<ContinueReadingEntry | null>(
      (latest, entry) => {
        if (!latest) return entry;

        const latestTime = new Date(latest.updatedAt).getTime();
        const currentTime = new Date(entry.updatedAt).getTime();
        return currentTime > latestTime ? entry : latest;
      },
      null
    );

    if (mostRecent) {
      return mostRecent;
    }

    if (
      continueReading &&
      continueReading.bookSlug === bookSlug &&
      (userId ? continueReading.userId === userId : true)
    ) {
      return continueReading;
    }

    return null;
  }, [bookSlug, continueReading, readingHistory, userId]);

  const targetChapterSlug = latestEntry?.chapterSlug ?? defaultChapterSlug;
  const href = targetChapterSlug
    ? `/books/${bookSlug}/chapter/${targetChapterSlug}`
    : `/books/${bookSlug}`;

  const buttonLabel = latestEntry ? "Đọc tiếp" : "Bắt đầu đọc";

  return (
    <Link href={href} className={cn("w-full sm:w-auto", className)}>
      <Button
        type="button"
        className={cn(
          "h-12 w-full rounded-sm border border-border bg-muted text-base font-bold text-foreground shadow-none hover:bg-muted/80 sm:w-[180px]",
          buttonClassName
        )}
      >
        <BookOpen className="mr-2 h-5 w-5" />
        {buttonLabel}
      </Button>
    </Link>
  );
}
