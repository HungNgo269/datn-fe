"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChapterCardProps } from "../types/chapter.type";
import { ChapterItem } from "./chapterItem";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils"; // Giả sử bạn có hàm cn từ shadcn, nếu không có thể dùng string template

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

  const handleOrderDisplay = (order: "DESC" | "ASC") => {
    setChapterOrder(order);
  };

  const sortedChapters =
    chapterOrder === "ASC" ? [...chapters].reverse() : chapters;

  const visibleChapters = showAll
    ? sortedChapters
    : sortedChapters.slice(0, initialVisibleChapters);

  const hasMoreChapters = chapters.length > initialVisibleChapters;

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row justify-between items-center w-full text-md py-2 text-muted-foreground/70 font-semibold">
        <p>Có tất cả {totalChapters} chương</p>
        <div className="flex flex-row justify-center items-center gap-2 text-sm">
          <span
            className={cn(
              "cursor-pointer transition-colors",
              chapterOrder === "ASC"
                ? " font-semibold text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
            onClick={() => handleOrderDisplay("ASC")}
          >
            Từ chương mới nhất
          </span>

          <Separator orientation="vertical" className="h-1" />

          <span
            className={cn(
              "cursor-pointer transition-colors",
              chapterOrder === "DESC"
                ? " font-semibold text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
            onClick={() => handleOrderDisplay("DESC")}
          >
            Từ chương 1
          </span>
        </div>
      </div>
      <Separator className="mb-2" />

      <div className="relative">
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
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      {hasMoreChapters && (
        <div className="mt-4 pt-2 text-center border-t border-border/50">
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-2 text-primary hover:text-primary/80 text-sm font-medium hover:underline transition-all"
          >
            {showAll
              ? "Thu gọn"
              : `${showMoreText} ${
                  totalChapters
                    ? `(${
                        totalChapters - initialVisibleChapters
                      } chương còn lại)`
                    : `(${chapters.length - initialVisibleChapters} chương nữa)`
                }`}
          </button>
        </div>
      )}
    </div>
  );
}
