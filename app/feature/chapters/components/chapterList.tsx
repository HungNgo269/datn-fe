"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ChapterCardProps } from "../types/chapter.type";
import { ChapterItem } from "./chapterItem";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { PurchaseChapterWarningModal } from "./PurchaseChapterWarningModal";
import { SubscriptionWarningModal } from "./SubscriptionWarningModal";
import { useAuthStore } from "@/app/store/useAuthStore";
import Cookies from "js-cookie";

interface ChapterListProps {
  chapters: ChapterCardProps[];
  totalChapters?: number;
  freeChapters?: number;
  accessType?: string;
  showMoreText?: string;
  initialVisibleChapters?: number;
  isPurchased?: boolean;
  isSubscribed?: boolean;
  bookTitle: string;
  bookCoverImage: string;
  bookSlug: string;
}

export function ChapterList({
  chapters,
  totalChapters,
  freeChapters = 0,
  accessType,
  showMoreText = "Xem thêm",
  initialVisibleChapters = 5,
  ...props
}: ChapterListProps) {
  const [showAll, setShowAll] = useState(false);
  const [chapterOrder, setChapterOrder] = useState<"DESC" | "ASC">("DESC");
  const pathName = usePathname();
  
  // Auth check
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = Cookies.get("accessToken");
  const isUserAuthenticated = isAuthenticated || Boolean(accessToken);

  // Modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<ChapterCardProps | null>(null);

  const handleRequireLogin = useCallback((type: "membership" | "purchase", chapter: ChapterCardProps) => {
    setSelectedChapter(chapter);
    if (type === "membership") {
      setShowSubscriptionModal(true);
    } else {
      setShowPurchaseModal(true);
    }
  }, []);

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

  // Create a consistently sorted list (by order ASC) for the audio playlist
  // regardless of how the user views the list (ASC or DESC)
  const sortedPlaylistChapters = useMemo(() => {
    return [...chapters].sort((a, b) => a.order - b.order);
  }, [chapters]);

  const displayedTotal = totalChapters ?? chapters.length;
  const hasMoreChapters = chapters.length > initialVisibleChapters;

  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="flex w-full flex-row items-center justify-between py-3 px-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">
            Có tất cả {displayedTotal} chương
          </p>
        </div>
        <div className="flex flex-row items-center justify-center gap-2 text-xs">
          <span
            className={cn(
              "cursor-pointer transition-colors px-2 py-1 rounded-md",
              chapterOrder === "ASC"
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
            onClick={() => handleOrderDisplay("ASC")}
          >
            Mới nhất
          </span>
          <span
            className={cn(
              "cursor-pointer transition-colors px-2 py-1 rounded-md",
              chapterOrder === "DESC"
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
            onClick={() => handleOrderDisplay("DESC")}
          >
            Từ đầu
          </span>
        </div>
      </div>

      {/* Chapter List Container */}
      <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="divide-y-0">
          {visibleChapters.map((chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              basePath={pathName}
              freeChapters={freeChapters}
              accessType={accessType}
              isAuthenticated={isUserAuthenticated}
              onRequireLogin={handleRequireLogin}
              isPurchased={props.isPurchased}
              isSubscribed={props.isSubscribed}
              bookTitle={props.bookTitle}
              bookCoverImage={props.bookCoverImage}
              bookSlug={props.bookSlug}
              allChapters={sortedPlaylistChapters}
            />
          ))}
        </div>

        {!showAll && hasMoreChapters && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      {hasMoreChapters && (
        <div className="mt-4 text-center">
          <button
            onClick={handleToggleShowAll}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer",
              "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
            )}
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                {showMoreText} ({totalChapters
                  ? totalChapters - initialVisibleChapters
                  : chapters.length - initialVisibleChapters} chương)
              </>
            )}
          </button>
        </div>
      )}
      {/* Purchase warning modal */}
      <PurchaseChapterWarningModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        bookTitle={props.bookTitle}
        bookCoverImage={props.bookCoverImage}
        bookSlug={props.bookSlug}
        chapterTitle={selectedChapter?.title || ""}
        chapterOrder={selectedChapter?.order || 0}
        accessType={accessType}
      />

      {/* Subscription warning modal */}
      <SubscriptionWarningModal
        open={showSubscriptionModal}
        onOpenChange={setShowSubscriptionModal}
        bookTitle={props.bookTitle}
        bookCoverImage={props.bookCoverImage}
      />
    </div>
  );
}
