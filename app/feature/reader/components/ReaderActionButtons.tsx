"use client";

import {
  Bookmark,
  BookmarkCheck,
  StickyNote,
  List,
  Settings,
} from "lucide-react";

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
    "p-3 rounded-full shadow-lg backdrop-blur-sm transition-all";
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-20">
      {/* Bookmark Button */}
      <button
        onClick={onBookmark}
        className={`${baseActionButton} ${
          isBookmarked
            ? "bg-primary text-primary-foreground"
            : "reader-floating-action"
        }`}
        title={isBookmarked ? "Bỏ đánh dấu trang" : "Đánh dấu trang"}
      >
        {isBookmarked ? (
          <BookmarkCheck className="w-5 h-5" />
        ) : (
          <Bookmark className="w-5 h-5" />
        )}
      </button>

      {/* Note Button */}
      <button
        onClick={onNote}
        disabled={!canAddNote}
        className={`${baseActionButton} ${
          canAddNote
            ? "reader-floating-action"
            : "reader-floating-action-disabled"
        }`}
        title={
          canAddNote
            ? "Thêm ghi chú cho đoạn đã chọn"
            : "Chọn đoạn văn để thêm ghi chú"
        }
      >
        <StickyNote className="w-5 h-5" />
      </button>

      {/* Chapters List Button */}
      {hasChapters && (
        <button
          onClick={onToggleChaptersList}
          className={`${baseActionButton} ${
            showChaptersList
              ? "bg-primary text-primary-foreground"
              : "reader-floating-action"
          }`}
          title="Danh sách chương"
        >
          <List className="w-5 h-5" />
        </button>
      )}

      {/* Settings Button */}
      <button
        onClick={onToggleSettings}
        className={`${baseActionButton} ${
          showSettings
            ? "bg-primary text-primary-foreground"
            : "reader-floating-action"
        }`}
        title="Cài đặt"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}

