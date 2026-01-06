"use client";

import { useState, ButtonHTMLAttributes } from "react";
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

import { cn } from "@/lib/utils";

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
  isSettingsOpen?: boolean;
  isChaptersOpen?: boolean;
}

interface ReaderTopBarIconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

function ReaderTopBarIconButton({
  isActive,
  className,
  ...props
}: ReaderTopBarIconButtonProps) {
  return (
    <button
      className={cn(
        "p-2 rounded transition-colors hover:cursor-pointer text-foreground hover:bg-muted",
        isActive && "text-primary",
        className
      )}
      {...props}
    />
  );
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
  isSettingsOpen,
  isChaptersOpen,
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
      <div className="flex items-center gap-1 z-10">
        <ReaderTopBarIconButton onClick={onBackToBook} title="Quay lại sách">
          <ArrowLeft className="w-5 h-5" />
        </ReaderTopBarIconButton>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-[50%] pointer-events-none">
        <div className="hidden md:block">
          <h1 className="font-semibold text-foreground text-sm md:text-base line-clamp-1 mx-auto">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trang {currentPage} / {totalPages || "--"}
          </p>
        </div>

        <div className="md:hidden text-xs text-muted-foreground font-medium">
          {currentPage}/{totalPages || "-"}
        </div>
      </div>

      <div className="flex items-center gap-1 z-10 bg-card">
        <ReaderTopBarIconButton
          onClick={onToggleChapters}
          title="Danh sách chương"
          isActive={isChaptersOpen}
        >
          <List className="w-5 h-5" />
        </ReaderTopBarIconButton>

        <ReaderTopBarIconButton
          onClick={onToggleBookmark}
          title="Đánh dấu trang"
          isActive={isBookmarked}
        >
          <Bookmark
            className={cn("w-5 h-5", isBookmarked ? "fill-current" : undefined)}
          />
        </ReaderTopBarIconButton>

        <ReaderTopBarIconButton onClick={onToggleNotes} title="Ghi chú">
          <StickyNote className="w-5 h-5" />
        </ReaderTopBarIconButton>

        <ReaderTopBarIconButton
          onClick={onToggleSettings}
          title="Cài đặt"
          isActive={isSettingsOpen}
        >
          <Settings className="w-5 h-5" />
        </ReaderTopBarIconButton>

        <ReaderTopBarIconButton
          onClick={toggleFullscreen}
          className="hidden sm:block"
          title="Toàn màn hình (F11)"
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </ReaderTopBarIconButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ReaderTopBarIconButton
          onClick={onNextChapter}
          title={nextChapterSlug ? "Chương tiếp theo" : "Quay lại sách"}
        >
          <ChevronRight className="w-5 h-5" />
        </ReaderTopBarIconButton>
      </div>
    </div>
  );
}
