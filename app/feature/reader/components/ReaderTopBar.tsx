"use client";

import { ButtonHTMLAttributes, useCallback, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  ChevronRight,
  List,
  Maximize,
  Minimize,
  Settings,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReaderTopBarProps {
  title: string;
  currentPage: number;
  totalPages: number;
  themeBg: string;
  isDarkTheme?: boolean;
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
  isDarkTheme?: boolean;
}

function ReaderTopBarIconButton({
  isActive,
  isDarkTheme,
  className,
  ...props
}: ReaderTopBarIconButtonProps) {
  return (
    <button
      className={cn(
        "rounded p-2 transition-colors hover:cursor-pointer",
        isDarkTheme
          ? "text-gray-200 hover:bg-white/10 hover:text-white"
          : "text-gray-700 hover:bg-black/10 hover:text-gray-900",
        isActive && (isDarkTheme ? "text-cyan-400" : "text-primary"),
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
  themeBg,
  isDarkTheme,
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
  const barBg = themeBg ? toRgba(themeBg, 0.8) : undefined;

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  return (
    <div
      className={cn(
        "relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-border px-4 shadow-sm",
        !barBg && "bg-card"
      )}
      style={barBg ? { backgroundColor: barBg } : undefined}
    >
      <div className="z-10 flex items-center gap-1">
        <ReaderTopBarIconButton
          onClick={onBackToBook}
          title="Quay lại sách"
          isDarkTheme={isDarkTheme}
        >
          <ArrowLeft className="h-5 w-5" />
        </ReaderTopBarIconButton>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 w-full max-w-[50%] -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="hidden md:block">
          <h1
            className={cn(
              "mx-auto line-clamp-1 text-sm font-semibold md:text-base",
              isDarkTheme ? "text-gray-100" : "text-gray-900"
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              "mt-0.5 text-xs",
              isDarkTheme ? "text-gray-400" : "text-gray-500"
            )}
          >
            Trang {currentPage} / {totalPages || "--"}
          </p>
        </div>

        <div
          className={cn(
            "text-xs font-medium md:hidden",
            isDarkTheme ? "text-gray-400" : "text-gray-500"
          )}
        >
          {currentPage}/{totalPages || "-"}
        </div>
      </div>

      <div
        className={cn("z-10 flex items-center gap-1", !barBg && "bg-card")}
        style={barBg ? { backgroundColor: barBg } : undefined}
      >
        <ReaderTopBarIconButton
          onClick={onToggleChapters}
          title="Danh sách chương"
          isActive={isChaptersOpen}
          isDarkTheme={isDarkTheme}
        >
          <List className="h-5 w-5" />
        </ReaderTopBarIconButton>

        <ReaderTopBarIconButton
          onClick={onToggleBookmark}
          title="Đánh dấu trang"
          isActive={isBookmarked}
          isDarkTheme={isDarkTheme}
        >
          <Bookmark
            className={cn("h-5 w-5", isBookmarked ? "fill-current" : undefined)}
          />
        </ReaderTopBarIconButton>

        <ReaderTopBarIconButton
          onClick={onToggleNotes}
          title="Ghi chú"
          isDarkTheme={isDarkTheme}
        >
          <StickyNote className="h-5 w-5" />
        </ReaderTopBarIconButton>

        <ReaderTopBarIconButton
          onClick={onToggleSettings}
          title="Cài đặt"
          isActive={isSettingsOpen}
          isDarkTheme={isDarkTheme}
        >
          <Settings className="h-5 w-5" />
        </ReaderTopBarIconButton>

        <ReaderTopBarIconButton
          onClick={toggleFullscreen}
          className="hidden sm:block"
          title="Toàn màn hình (F11)"
          isDarkTheme={isDarkTheme}
        >
          {isFullscreen ? (
            <Minimize className="h-5 w-5" />
          ) : (
            <Maximize className="h-5 w-5" />
          )}
        </ReaderTopBarIconButton>

        <div
          className={cn(
            "mx-1 h-6 w-px",
            isDarkTheme ? "bg-gray-600" : "bg-border"
          )}
        />

        <ReaderTopBarIconButton
          onClick={onNextChapter}
          title={nextChapterSlug ? "Chương tiếp theo" : "Quay lại sách"}
          isDarkTheme={isDarkTheme}
        >
          <ChevronRight className="h-5 w-5" />
        </ReaderTopBarIconButton>
      </div>
    </div>
  );
}

function toRgba(color: string, alpha: number) {
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    const normalized =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const value = parseInt(normalized, 16);
    if (Number.isNaN(value)) return color;
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const rgbMatch = trimmed.match(
    /^rgba?\s*\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)\s*(?:,\s*([0-9.]+)\s*)?\)$/
  );
  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return color;
}
