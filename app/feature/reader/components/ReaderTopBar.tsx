"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Settings,
  List,
  Maximize,
  Minimize,
  StickyNote,
  Bookmark,
} from "lucide-react";

interface ReaderTopBarProps {
  title: string;
  currentPage: number;
  totalPages: number;
  onBackToBook: () => void;
  onNextChapter: () => void;
  nextChapterSlug: string | null | undefined;
  onToggleSettings: () => void;
  onToggleChapters: () => void;
  onToggleNotes: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export default function ReaderTopBar({
  title,
  currentPage,
  totalPages,
  onBackToBook,
  onNextChapter,
  nextChapterSlug,
  onToggleSettings,
  onToggleChapters,
  onToggleNotes,
  isBookmarked,
  onToggleBookmark,
}: ReaderTopBarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  return (
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 shadow-sm z-30 relative">
      <div className="flex items-center gap-1">
        <button
          onClick={onBackToBook}
          className="p-2 hover:bg-muted rounded text-foreground transition-colors"
          title="Quay lại sách"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onToggleChapters}
          className="p-2 hover:bg-muted rounded text-foreground transition-colors"
          title="Danh sách chương"
        >
          <List className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-4 text-center hidden md:block">
        <h1 className="font-semibold text-foreground text-sm md:text-base line-clamp-1 max-w-[200px] md:max-w-md mx-auto">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground">
          Trang {currentPage} / {totalPages || "--"}
        </p>
      </div>

      <div className="md:hidden flex-1 text-center text-xs text-muted-foreground">
        {currentPage}/{totalPages || "-"}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onToggleBookmark}
          className={`p-2 rounded transition-colors ${
            isBookmarked ? "text-primary" : "text-foreground hover:bg-muted"
          }`}
          title="Đánh dấu trang này"
        >
          <Bookmark
            className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
          />
        </button>

        <button
          onClick={onToggleNotes}
          className="p-2 hover:bg-muted rounded text-foreground transition-colors"
          title="Ghi chú"
        >
          <StickyNote className="w-5 h-5" />
        </button>

        <button
          onClick={onToggleSettings}
          className="p-2 hover:bg-muted rounded text-foreground transition-colors"
          title="Cài đặt hiển thị"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-muted rounded text-foreground transition-colors hidden sm:block"
          title="Toàn màn hình (F11)"
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </button>

        <div className="w-px h-6 bg-border mx-1" />

        <button
          onClick={onNextChapter}
          className="p-2 hover:bg-muted rounded text-foreground transition-colors"
          title={nextChapterSlug ? "Chương tiếp theo" : "Quay lại sách"}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
