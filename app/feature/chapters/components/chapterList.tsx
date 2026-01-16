"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChapterCardProps } from "../types/chapter.type";
import { ChapterItem } from "./chapterItem";

interface ChapterListProps {
  chapters: ChapterCardProps[];
  totalChapters?: number;
  showMoreText?: string;
  initialVisibleChapters?: number;
}

export function ChapterList({
  chapters,
  totalChapters,
  showMoreText = "Xem thêm",
  initialVisibleChapters = 5,
}: ChapterListProps) {
  const [showAll, setShowAll] = useState(false);
  const [chapterOrder, setChapterOrder] = useState<"DESC" | "ASC">("DESC");
  const pathName = usePathname();

  const handleOrderDisplay = useCallback((order: "DESC" | "ASC") => {
    setChapterOrder(order);
  }, []);

  const handleToggleShowAll = useCallback(() => {
    setShowAll((prev) => !prev);
  }, []);

  const sortedChapters = useMemo(() => {
    return chapterOrder === "ASC" ? [...chapters].reverse() : chapters;
  }, [chapterOrder, chapters]);

  const visibleChapters = useMemo(
    () =>
      showAll
        ? sortedChapters
        : sortedChapters.slice(0, initialVisibleChapters),
    [initialVisibleChapters, showAll, sortedChapters]
  );

  const displayedTotal = totalChapters ?? chapters.length;
  const hasMoreChapters = chapters.length > initialVisibleChapters;

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-row items-center justify-between py-2 text-md font-semibold text-muted-foreground/70">
        <p>Có tất cả {displayedTotal} chương</p>
        <div className="flex flex-row items-center justify-center gap-2 text-sm">
          <span
            className={cn(
              "cursor-pointer transition-colors",
              chapterOrder === "ASC"
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
            onClick={() => handleOrderDisplay("ASC")}
          >
            Từ chương mới nhất
          </span>

          <Separator
            orientation="vertical"
            className="w-[1px] bg-border"
            style={{ height: "16px" }}
          />
          <span
            className={cn(
              "cursor-pointer transition-colors",
              chapterOrder === "DESC"
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
            onClick={() => handleOrderDisplay("DESC")}
          >
            Từ chương 1
          </span>
        </div>
      </div>

      <div className="relative rounded-sm border shadow-sm">
        <div className="space-y-2">
          {visibleChapters.map((chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              basePath={pathName}
            />
          ))}
        </div>

        {!showAll && hasMoreChapters && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      {hasMoreChapters && (
        <div className="mt-4 pt-2 text-center">
          <button
            onClick={handleToggleShowAll}
            className="mt-2 cursor-pointer text-sm font-medium text-primary transition-all hover:text-primary hover:underline"
          >
            {showAll
              ? "Thu gọn"
              : `${showMoreText} ${
                  totalChapters
                    ? `(${totalChapters - initialVisibleChapters} chương còn lại)`
                    : `(${chapters.length - initialVisibleChapters} chương nữa)`
                }`}
          </button>
        </div>
      )}
    </div>
  );
}
