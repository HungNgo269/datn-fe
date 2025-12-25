"use client";

import { List, X } from "lucide-react";
import { ChapterCardProps } from "@/app/feature/chapters/types/chapter.type";

interface ReaderChaptersListProps {
  chapters: ChapterCardProps[];
  currentChapterSlug?: string;
  currentPage: number;
  onClose: () => void;
  onChapterClick: (slug: string) => void;
}

export default function ReaderChaptersList({
  chapters,
  currentChapterSlug,
  currentPage,
  onClose,
  onChapterClick,
}: ReaderChaptersListProps) {
  if (chapters.length === 0) return null;

  return (
    <div className="absolute top-14 right-4 bottom-6 w-80 bg-popover border border-border rounded-lg shadow-xl z-40 flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <List className="w-4 h-4" /> Danh sách chương
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => {
              onChapterClick(chapter.slug);
              onClose();
            }}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors mb-1 ${
              chapter.slug === currentChapterSlug
                ? "bg-primary text-primary-foreground font-medium"
                : "hover:bg-muted text-foreground"
            }`}
          >
            <div className="text-sm">
              Chương {chapter.order}: {chapter.title}
            </div>
            {chapter.slug === currentChapterSlug && (
              <div className="text-xs mt-1 opacity-80">
                Đang đọc - Trang {currentPage}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

