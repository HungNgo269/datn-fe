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
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-20">
      {/* Bookmark Button */}
      <button
        onClick={onBookmark}
        className={`p-3 rounded-full shadow-lg backdrop-blur-sm transition-all ${
          isBookmarked
            ? "bg-primary text-primary-foreground"
            : "bg-black/20 hover:bg-black/40 text-white"
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
        className={`p-3 rounded-full shadow-lg backdrop-blur-sm transition-all ${
          canAddNote
            ? "bg-black/20 hover:bg-black/40 text-white"
            : "bg-black/10 text-white/50 cursor-not-allowed"
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
          className={`p-3 rounded-full shadow-lg backdrop-blur-sm transition-all ${
            showChaptersList
              ? "bg-primary text-primary-foreground"
              : "bg-black/20 hover:bg-black/40 text-white"
          }`}
          title="Danh sách chương"
        >
          <List className="w-5 h-5" />
        </button>
      )}

      {/* Settings Button */}
      <button
        onClick={onToggleSettings}
        className={`p-3 rounded-full shadow-lg backdrop-blur-sm transition-all ${
          showSettings
            ? "bg-primary text-primary-foreground"
            : "bg-black/20 hover:bg-black/40 text-white"
        }`}
        title="Cài đặt"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
}

