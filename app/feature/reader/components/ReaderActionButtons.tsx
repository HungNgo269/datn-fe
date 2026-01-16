"use client";

import { Bookmark, BookmarkCheck, List, Settings, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReaderActionButtonsProps {
  isBookmarked: boolean;
  canAddNote: boolean;
  showChaptersList: boolean;
  showSettings: boolean;
  hasChapters: boolean;
  onBookmark: () => void;
  onNote: () => void;
  onToggleChaptersList: () => void;
  onToggleSettings: () => void;
}

export default function ReaderActionButtons({
  isBookmarked,
  canAddNote,
  showChaptersList,
  showSettings,
  hasChapters,
  onBookmark,
  onNote,
  onToggleChaptersList,
  onToggleSettings,
}: ReaderActionButtonsProps) {
  const baseActionButton =
    "rounded-full p-3 shadow-lg backdrop-blur-sm transition-all";

  return (
    <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-3">
      <button
        onClick={onBookmark}
        className={cn(
          baseActionButton,
          isBookmarked
            ? "bg-primary text-primary-foreground"
            : "reader-floating-action"
        )}
        title={isBookmarked ? "Bỏ đánh dấu trang" : "Đánh dấu trang"}
      >
        {isBookmarked ? (
          <BookmarkCheck className="h-5 w-5" />
        ) : (
          <Bookmark className="h-5 w-5" />
        )}
      </button>

      <button
        onClick={onNote}
        disabled={!canAddNote}
        className={cn(
          baseActionButton,
          canAddNote ? "reader-floating-action" : "reader-floating-action-disabled"
        )}
        title={
          canAddNote
            ? "Thêm ghi chú cho đoạn đã chọn"
            : "Chọn đoạn văn để thêm ghi chú"
        }
      >
        <StickyNote className="h-5 w-5" />
      </button>

      {hasChapters && (
        <button
          onClick={onToggleChaptersList}
          className={cn(
            baseActionButton,
            showChaptersList
              ? "bg-primary text-primary-foreground"
              : "reader-floating-action"
          )}
          title="Danh sách chương"
        >
          <List className="h-5 w-5" />
        </button>
      )}

      <button
        onClick={onToggleSettings}
        className={cn(
          baseActionButton,
          showSettings
            ? "bg-primary text-primary-foreground"
            : "reader-floating-action"
        )}
        title="Cài đặt"
      >
        <Settings className="h-5 w-5" />
      </button>
    </div>
  );
}
